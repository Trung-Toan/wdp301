const mongoose = require("mongoose");
const { Types } = mongoose;

const Appointment = require("../../model/appointment/Appointment");
const Slot = require("../../model/appointment/Slot");
const Patient = require("../../model/patient/Patient");
const { sendBookingEmail } = require("../../mail/mail");

function randomBookingCode() {
    return `BK${Math.floor(100000 + Math.random() * 900000)}`;
}

/**
 * Kiểm tra slot availability theo ngày cụ thể 
 */
async function checkSlotAvailability(slotId, targetDate) {

    const slot = await Slot.findById(slotId).lean();

    if (!slot) {
        throw new Error("Slot not found");
    }

    if (slot.status !== "AVAILABLE") {
        return {
            isAvailable: false,
            reason: "Slot is unavailable"
        };
    }

    // Tính booked_count cho ngày cụ thể
    const startOfDay = new Date(targetDate);

    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);

    endOfDay.setHours(23, 59, 59, 999);

    const bookedCount = await Appointment.countDocuments({
        slot_id: new Types.ObjectId(slotId),
        scheduled_date: {
            $gte: startOfDay,
            $lte: endOfDay
        },
        status: { $in: ["SCHEDULED", "COMPLETED"] }
    });

    const isAvailable = bookedCount < slot.max_patients;

    return {
        isAvailable,
        bookedCount,
        maxPatients: slot.max_patients,
        remainingSlots: slot.max_patients - bookedCount,
        reason: isAvailable ? "Slot is available" : "Slot is full"
    };
}

/**
 * Lấy slots available của bác sĩ trong ngày
 */
async function getAvailableSlotsForDoctor(doctorId, targetDate) {
    const startOfDay = new Date(targetDate);

    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Lấy tất cả slots của bác sĩ trong ngày
    const slots = await Slot.find({
        doctor_id: new Types.ObjectId(doctorId),
        start_time: {
            $gte: startOfDay,
            $lt: endOfDay
        },
        status: "AVAILABLE"
    }).sort({ start_time: 1 });

    // Tính booked_count cho từng slot
    const slotsWithAvailability = await Promise.all(
        slots.map(async (slot) => {
            const availability = await checkSlotAvailability(slot._id, targetDate);
            return {
                ...slot.toObject(),
                booked_count: availability.bookedCount,
                is_available: availability.isAvailable,
                remaining_slots: availability.remainingSlots
            };
        })
    );

    // Chỉ trả về slots còn available
    return slotsWithAvailability.filter(slot => slot.is_available);
}

async function createAsync(payload) {
    const {
        slot_id, doctor_id, patient_id, specialty_id, clinic_id,
        full_name, phone, email, dob, gender,
        province_code, ward_code, address_text, reason,
        scheduled_date // Thêm scheduled_date để kiểm tra theo ngày
    } = payload;

    // Validate required fields
    if (!slot_id || !doctor_id || !patient_id || !specialty_id || !full_name || !phone || !email) {
        throw new Error("Missing required fields");
    }

    // Validate ObjectIds
    if (!Types.ObjectId.isValid(slot_id)) throw new Error("Invalid slot_id");

    if (!Types.ObjectId.isValid(doctor_id)) throw new Error("Invalid doctor_id");

    if (!Types.ObjectId.isValid(patient_id)) throw new Error("Invalid patient_id");

    if (!Types.ObjectId.isValid(specialty_id)) throw new Error("Invalid specialty_id");

    if (clinic_id && !Types.ObjectId.isValid(clinic_id)) throw new Error("Invalid clinic_id");

    const session = await mongoose.startSession();

    try {
        let result;
        await session.withTransaction(async () => {
            // 1) Kiểm tra slot availability theo ngày
            const targetDate = scheduled_date ? new Date(scheduled_date) : new Date();

            const slotAvailability = await checkSlotAvailability(slot_id, targetDate);

            if (!slotAvailability.isAvailable) {
                throw new Error(slotAvailability.reason);
            }

            // 2) Kiểm tra slot cơ bản
            const slot = await Slot.findById(slot_id).session(session).lean();

            if (!slot) throw new Error("Slot not found");

            if (slot.status !== "AVAILABLE") throw new Error("Slot is unavailable");

            // 3) Kiểm tra bệnh nhân đã có lịch trong slot này CÙNG NGÀY chưa
            const startOfDay = new Date(targetDate);

            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(targetDate);

            endOfDay.setHours(23, 59, 59, 999);

            const existingAppointment = await Appointment.findOne({
                slot_id: new Types.ObjectId(slot_id),
                patient_id: new Types.ObjectId(patient_id),
                scheduled_date: {
                    $gte: startOfDay,
                    $lte: endOfDay
                },
                status: { $in: ["SCHEDULED", "COMPLETED"] }
            }).session(session);

            if (existingAppointment) {
                console.log('🔍 Found existing appointment:', existingAppointment);
                throw new Error("Patient already has an appointment in this slot for this date");
            }

            // 4) Kiểm tra bệnh nhân
            const patient = await Patient.findById(patient_id).session(session).lean();
            if (!patient) throw new Error("Patient not found");

            // 5) Tạo appointment
            const booking_code = randomBookingCode();
            const fee_amount = Number(slot.fee_amount ?? 0);

            // Helper để lấy phần ngày (bỏ giờ)
            const dateOnlyUTC = (d) => {
                return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
            };

            const appt = new Appointment({
                slot_id, doctor_id, patient_id, specialty_id, clinic_id,
                full_name, phone, email, dob, gender,
                province_code, ward_code, address_text, reason,
                booking_code,
                fee_amount,
                scheduled_date: scheduled_date ? dateOnlyUTC(new Date(scheduled_date)) : dateOnlyUTC(new Date(slot.start_time))
            });

            await appt.save({ session });

            // 6) Lấy dữ liệu populate để trả về/gửi mail
            const populated = await Appointment.findById(appt._id)
                .populate({
                    path: "doctor_id",
                    select: "title degree description experience user_id",
                    populate: { path: "user_id", select: "full_name" },
                })
                .populate("specialty_id", "name")
                .populate("clinic_id", "name address")
                .session(session)
                .lean();

            // 7) Gửi email (không rollback nếu email fail)
            let email_sent = false, email_error = null;
            try {
                await sendBookingEmail({
                    to: email,
                    subject: `[${booking_code}] Xác nhận đặt lịch khám`,
                    booking: populated,
                    doctor: populated.doctor_id,
                    clinic: populated.clinic_id,
                    specialty: populated.specialty_id,
                    slot: slot,
                });
                email_sent = true;
            } catch (e) {
                email_error = e?.message || String(e);
            }

            result = {
                ...populated,
                email_sent,
                email_error,
                slot_info: {
                    slot_id: slot._id,
                    start_time: slot.start_time,
                    end_time: slot.end_time,
                    max_patients: slot.max_patients,
                    booked_count: slotAvailability.bookedCount + 1,
                    remaining_slots: slotAvailability.remainingSlots - 1
                }
            };
        });

        return result;
    } catch (error) {
        console.log('Service error:', error.message);
        console.log('Service error stack:', error.stack);
        throw error;
    } finally {
        await session.endSession();
    }
}

async function getByIdAsync(id) {
    const data = await Appointment.findById(id)
        .populate({
            path: "doctor_id",
            select: "title degree description experience user_id",
            populate: { path: "user_id", select: "full_name" },
        })
        .populate("specialty_id", "name")
        .populate("clinic_id", "name address")
        .lean();
    if (!data) throw new Error("Appointment not found");
    return data;
}

async function getAppointmentsByPatient(patientId, { status, page = 1, limit = 10 }) {
    const filter = { patient_id: new Types.ObjectId(patientId) };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const appointments = await Appointment.find(filter)
        .populate({
            path: "doctor_id",
            populate: [
                {
                    path: "user_id",
                    select: "full_name avatar_url",
                },
                {
                    path: "specialty_id",
                    select: "name",
                },
                {
                    path: "clinic_id",
                    select: "name address",
                },
            ],
        })
        .populate("slot_id", "start_time end_time")
        .populate({
            path: "patient_id",
            populate: {
                path: "user_id",
                select: "full_name",
            },
        })
        .sort({ booked_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Appointment.countDocuments(filter);

    // Chuẩn hóa dữ liệu để frontend dễ dùng
    const formatted = appointments.map((a) => ({
        id: a._id,
        status: a.status.toLowerCase(), // vd: upcoming
        doctorName: a.doctor_id?.user_id?.full_name
            ? `BS. ${a.doctor_id.user_id.full_name}`
            : "Không rõ",
        specialty: a.doctor_id?.specialty_id?.[0]?.name || "Không rõ",
        hospital: a.doctor_id?.clinic_id?.name || "Không rõ",
        location: a.doctor_id?.clinic_id?.address || "",
        date: a.scheduled_date ? new Date(a.scheduled_date).toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }) : "",
        time: a.slot_id?.start_time ? new Date(a.slot_id.start_time).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        }) : "",
        end_time: a.slot_id?.end_time ? new Date(a.slot_id.end_time).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        }) : "",
        price: a.fee_amount?.toLocaleString("vi-VN") + "đ",
        image: a.doctor_id?.user_id?.avatar_url || "/doctor-default.jpg",
        patientName: a.patient_id?.user_id?.full_name || "",
        phone: a.phone,
        reason: a.reason,
    }));
    function mapStatus(status) {
        switch (status) {
            case "SCHEDULED": return "upcoming";
            case "COMPLETED": return "completed";
            case "CANCELLED": return "cancelled";
            case "NO_SHOW": return "missed";
            default: return "unknown";
        }
    }
    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data: formatted,
    };
}


module.exports = {
    createAsync,
    getByIdAsync,
    getAppointmentsByPatient,
    checkSlotAvailability,
    getAvailableSlotsForDoctor
};
const mongoose = require("mongoose");
const { Types } = mongoose;

const Appointment = require("../../model/appointment/Appointment");
const Slot = require("../../model/appointment/Slot");
const Patient = require("../../model/patient/Patient");
const { sendBookingEmail } = require("../../mail/mail");

function randomBookingCode() {
    return `BK${Math.floor(100000 + Math.random() * 900000)}`;
}

async function createAsync(payload) {
    const {
        slot_id, doctor_id, patient_id, specialty_id, clinic_id,
        full_name, phone, email, dob, gender,
        province_code, ward_code, address_text, reason,
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
            // 1) Kiểm tra slot trước
            const slot = await Slot.findById(slot_id).session(session).lean();
            if (!slot) throw new Error("Slot not found");
            if (slot.status !== "AVAILABLE") throw new Error("Slot is unavailable");
            if (slot.booked_count >= slot.max_patients) throw new Error("Slot is full");

            // 2) Cập nhật slot atomically với điều kiện kiểm tra lại
            const slotUpdateResult = await Slot.findOneAndUpdate(
                {
                    _id: slot_id,
                    status: "AVAILABLE",
                    booked_count: slot.booked_count // Đảm bảo booked_count không thay đổi từ lúc kiểm tra
                },
                { $inc: { booked_count: 1 } },
                {
                    session,
                    new: true,
                    lean: true
                }
            );

            if (!slotUpdateResult) {
                throw new Error("Slot booking failed - slot may have been modified by another request");
            }

            // 3) Kiểm tra bệnh nhân
            const patient = await Patient.findById(patient_id).session(session).lean();
            if (!patient) throw new Error("Patient not found");

            // 4) Tạo appointment
            const booking_code = randomBookingCode();
            const fee_amount = Number(slotUpdateResult.fee_amount ?? 0);

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
                scheduled_date: dateOnlyUTC(new Date(slotUpdateResult.start_time))
            });

            await appt.save({ session });

            // 5) Lấy dữ liệu populate để trả về/gửi mail
            const populated = await Appointment.findById(appt._id)
                .populate({
                    path: "doctor_id",
                    select: "title degree avatar_url user_id",
                    populate: { path: "user_id", select: "full_name" },
                })
                .populate("specialty_id", "name")
                .populate("clinic_id", "name address")
                .session(session)
                .lean();

            // 6) Gửi email (không rollback nếu email fail)
            let email_sent = false, email_error = null;
            try {
                await sendBookingEmail({
                    to: email,
                    subject: `[${booking_code}] Xác nhận đặt lịch khám`,
                    booking: populated,
                    doctor: populated.doctor_id,
                    clinic: populated.clinic_id,
                    specialty: populated.specialty_id,
                    slot: slotUpdateResult,
                });
                email_sent = true;
            } catch (e) {
                email_error = e?.message || String(e);
            }

            result = { ...populated, email_sent, email_error };
        });

        return result;
    } finally {
        await session.endSession();
    }
}

async function getByIdAsync(id) {
    const data = await Appointment.findById(id)
        .populate({
            path: "doctor_id",
            select: "title degree avatar_url user_id",
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
        .select("status booked_at scheduled_date fee_amount booking_code slot_id")
        .populate("slot_id", "start_time end_time")
        .sort({ booked_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Appointment.countDocuments(filter);

    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data: appointments,
    };
}


module.exports = { createAsync, getByIdAsync, getAppointmentsByPatient };
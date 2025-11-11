const mongoose = require("mongoose");
const { Types } = mongoose;

const Appointment = require("../../model/appointment/Appointment");
const Slot = require("../../model/appointment/Slot");
const Patient = require("../../model/patient/Patient");
const Doctor = require("../../model/doctor/Doctor");
const { sendBookingEmail } = require("../../mail/mail");
const { createAppointmentNotification, createAppointmentStatusUpdateNotification } = require("../notification/notification.service");

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
 * Tự động assign bác sĩ available trong clinic
 * Tìm bác sĩ có slot trống trong ngày và phù hợp với specialty_id (nếu có)
 */
async function findAvailableDoctorForClinic(clinicId, specialtyId, targetDate, excludeSlotId = null) {
    try {
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Build doctor filter (Note: status is in Account, not Doctor)
        const doctorFilter = {
            clinic_id: new Types.ObjectId(clinicId)
        };

        // Add specialty filter if provided (specialty_id is an array in Doctor model)
        if (specialtyId && Types.ObjectId.isValid(specialtyId)) {
            doctorFilter.specialty_id = { $in: [new Types.ObjectId(specialtyId)] };
        }

        // Lấy danh sách bác sĩ trong phòng khám (populate để check status từ Account)
        const doctors = await Doctor.find(doctorFilter)
            .populate({
                path: "user_id",
                select: "account_id",
                populate: {
                    path: "account_id",
                    select: "status",
                    model: "Account"
                }
            })
            .select("_id user_id")
            .lean();

        console.log(`🔍 Found ${doctors.length} doctors in clinic ${clinicId} (before status filter)`);

        // Filter doctors có status ACTIVE trong Account
        const activeDoctors = doctors.filter(doctor => {
            const account = doctor.user_id?.account_id;
            const isActive = account && account.status === "ACTIVE";
            if (!isActive) {
                console.log(`⚠️ Doctor ${doctor._id} is not active. Account status: ${account?.status || 'N/A'}`);
            }
            return isActive;
        });

        console.log(`✅ Found ${activeDoctors.length} active doctors in clinic ${clinicId}`);

        if (activeDoctors.length === 0) {
            throw new Error("No doctors found in this clinic");
        }

        // Tìm bác sĩ có slot available trong ngày
        for (const doctor of activeDoctors) {
            const doctorSlots = await Slot.find({
                doctor_id: doctor._id,
                start_time: {
                    $gte: startOfDay,
                    $lt: endOfDay
                },
                status: "AVAILABLE"
            }).sort({ start_time: 1 }).lean();

            // Check từng slot xem còn chỗ không
            for (const slot of doctorSlots) {
                // Skip slot nếu nó đã được chọn (để tránh duplicate với slot đã chọn)
                if (excludeSlotId && slot._id.toString() === excludeSlotId.toString()) {
                    continue;
                }

                const availability = await checkSlotAvailability(slot._id, targetDate);
                if (availability.isAvailable) {
                    return {
                        doctor_id: doctor._id,
                        slot_id: slot._id,
                        slot: slot
                    };
                }
            }
        }

        throw new Error("No available doctors or slots found for this date");
    } catch (error) {
        console.error("Error finding available doctor:", error);
        throw error;
    }
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
    let {
        slot_id, doctor_id, patient_id, specialty_id, clinic_id,
        full_name, phone, email, dob, gender,
        province_code, ward_code, address_text, reason,
        scheduled_date, // Thêm scheduled_date để kiểm tra theo ngày
        // Thông tin người thân (cho người già)
        relative_name, relative_phone, relative_relationship,
        is_elderly, patient_age
    } = payload;

    //Auto-assign doctor nếu không có doctor_id ***
    let autoAssignedDoctor = false;
    if (!doctor_id && clinic_id) {
        console.log("🤖 Auto-assigning doctor for clinic:", clinic_id);
        const targetDate = scheduled_date ? new Date(scheduled_date) : new Date();

        try {
            const doctorAssignment = await findAvailableDoctorForClinic(
                clinic_id,
                specialty_id,
                targetDate,
                slot_id // Exclude the chosen slot if any
            );

            doctor_id = doctorAssignment.doctor_id;
            // Nếu không có slot_id được chọn, dùng slot tự động tìm được
            if (!slot_id) {
                slot_id = doctorAssignment.slot_id;
            }

            autoAssignedDoctor = true;
            console.log("✅ Auto-assigned doctor:", doctor_id, "slot:", slot_id);
        } catch (error) {
            console.error("❌ Failed to auto-assign doctor:", error);
            throw new Error("Không tìm thấy bác sĩ phù hợp trong phòng khám. Vui lòng chọn bác sĩ cụ thể.");
        }
    }

    // Validate required fields (doctor_id bây giờ có thể được auto-assign)
    if (!slot_id || !doctor_id || !patient_id || !full_name || !phone || !email) {
        throw new Error("Missing required fields");
    }

    // Validate ObjectIds
    if (!Types.ObjectId.isValid(slot_id)) throw new Error("Invalid slot_id");

    if (!Types.ObjectId.isValid(doctor_id)) throw new Error("Invalid doctor_id");

    if (!Types.ObjectId.isValid(patient_id)) throw new Error("Invalid patient_id");

    if (specialty_id && !Types.ObjectId.isValid(specialty_id)) throw new Error("Invalid specialty_id");

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

            // 2.1) Kiểm tra doctor tồn tại và active TRƯỚC KHI kiểm tra slot
            // Note: status is in Account, not Doctor, so we need to populate
            const doctor = await Doctor.findById(doctor_id)
                .populate({
                    path: "user_id",
                    select: "account_id",
                    populate: {
                        path: "account_id",
                        select: "status",
                        model: "Account"
                    }
                })
                .session(session)
                .lean();
            if (!doctor) throw new Error("Không tìm thấy bác sĩ");

            // Check status from Account
            const account = doctor.user_id?.account_id;
            if (!account || account.status !== "ACTIVE") {
                throw new Error("Bác sĩ không hoạt động");
            }

            // 2.2) Kiểm tra slot có thuộc về doctor được chọn không
            if (slot.doctor_id.toString() !== doctor_id.toString()) {
                throw new Error("Slot không thuộc về bác sĩ đã chọn");
            }

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

            // 4.5) Nếu không có clinic_id, lấy từ doctor
            if (!clinic_id && doctor_id) {
                const doctor = await Doctor.findById(doctor_id).session(session).select("clinic_id").lean();
                if (doctor && doctor.clinic_id) {
                    clinic_id = doctor.clinic_id;
                    console.log("✅ Auto-retrieved clinic_id from doctor:", clinic_id);
                }
            }

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
                scheduled_date: scheduled_date ? dateOnlyUTC(new Date(scheduled_date)) : dateOnlyUTC(new Date(slot.start_time)),
                // Thông tin người thân (cho người già)
                ...(is_elderly && {
                    relative_name: relative_name || null,
                    relative_phone: relative_phone || null,
                    relative_relationship: relative_relationship || null,
                    is_elderly: true,
                    patient_age: patient_age || null
                })
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

            // 8) Tạo notification cho bệnh nhân (không rollback nếu fail)
            let notification_created = false;
            try {
                await createAppointmentNotification(populated);
                notification_created = true;
            } catch (e) {
                console.error("Failed to create notification:", e);
            }

            result = {
                ...populated,
                email_sent,
                email_error,
                notification_created,
                auto_assigned_doctor: autoAssignedDoctor,
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
        _id: a._id?.toString() || a._id, // Đảm bảo _id là string
        id: a._id?.toString() || a._id, // Giữ id để dùng cho key trong React
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
            timeZone: "UTC",
        }) : "",
        end_time: a.slot_id?.end_time ? new Date(a.slot_id.end_time).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
        }) : "",
        price: a.fee_amount?.toLocaleString("vi-VN") + "đ",
        image: a.doctor_id?.user_id?.avatar_url || "/doctor-default.jpg",
        patientName: a.patient_id?.user_id?.full_name || "",
        phone: a.phone,
        reason: a.reason,
        // Thông tin người thân (cho người già)
        is_elderly: a.is_elderly || false,
        patient_age: a.patient_age || null,
        relative_name: a.relative_name || null,
        relative_phone: a.relative_phone || null,
        relative_relationship: a.relative_relationship || null,
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


/**
 * Tạo appointment booking tại phòng khám với hỗ trợ auto-assign doctor và slot
 * @param {Object} payload - Booking data
 * @param {string} payload.clinic_id - Required: Clinic ID
 * @param {string} payload.specialty_id - Required: Specialty ID
 * @param {string} payload.scheduled_date - Required: Appointment date (YYYY-MM-DD)
 * @param {string} payload.patient_id - Required: Patient ID
 * @param {boolean} payload.auto_assign - Optional: Auto assign doctor and slot
 * @param {string} payload.doctor_id - Optional: Doctor ID (required if auto_assign = false)
 * @param {string} payload.slot_id - Optional: Slot ID (will be auto-found if auto_assign = true)
 * @param {string} payload.full_name - Required: Full name
 * @param {string} payload.phone - Required: Phone number
 * @param {string} payload.email - Required: Email
 * @param {string} payload.reason - Optional: Reason for visit
 * @returns {Promise<Object>} Created appointment with populated data
 */
async function clinicBookingAsync(payload) {
    let {
        clinic_id, specialty_id, scheduled_date, patient_id,
        auto_assign = false, doctor_id, slot_id,
        full_name, phone, email, reason,
        // Thông tin người thân (cho người già)
        relative_name, relative_phone, relative_relationship,
        is_elderly, patient_age
    } = payload;

    // Validate required fields
    if (!clinic_id || !specialty_id || !scheduled_date || !patient_id || !full_name || !phone || !email) {
        throw new Error("Missing required fields");
    }

    // Validate ObjectIds
    if (!Types.ObjectId.isValid(clinic_id)) throw new Error("Invalid clinic_id");
    if (!Types.ObjectId.isValid(specialty_id)) throw new Error("Invalid specialty_id");
    if (!Types.ObjectId.isValid(patient_id)) throw new Error("Invalid patient_id");

    const targetDate = new Date(scheduled_date);
    if (isNaN(targetDate.getTime())) throw new Error("Invalid scheduled_date format");

    let autoAssignedDoctor = false;
    let autoAssignedSlot = false;

    // Auto-assign logic
    if (auto_assign === true || auto_assign === 'true') {
        console.log("🤖 Auto-assigning doctor and slot for clinic:", clinic_id);

        try {
            const assignment = await findAvailableDoctorForClinic(
                clinic_id,
                specialty_id,
                targetDate,
                slot_id // Exclude slot if already provided
            );

            // Use auto-assigned values if not provided
            if (!doctor_id) {
                doctor_id = assignment.doctor_id;
                autoAssignedDoctor = true;
            }
            if (!slot_id) {
                slot_id = assignment.slot_id;
                autoAssignedSlot = true;
            }

            console.log("✅ Auto-assigned - doctor:", doctor_id, "slot:", slot_id);
        } catch (error) {
            console.error("❌ Failed to auto-assign:", error);
            throw new Error("Không tìm thấy bác sĩ hoặc slot phù hợp. Vui lòng chọn bác sĩ và slot cụ thể.");
        }
    } else {
        // Manual assignment - validate required fields
        if (!doctor_id) {
            throw new Error("doctor_id is required when auto_assign is false");
        }
        if (!slot_id) {
            throw new Error("slot_id is required when auto_assign is false");
        }
        if (!Types.ObjectId.isValid(doctor_id)) throw new Error("Invalid doctor_id");
        if (!Types.ObjectId.isValid(slot_id)) throw new Error("Invalid slot_id");
    }

    // Use existing createAsync logic
    const bookingPayload = {
        slot_id,
        doctor_id,
        patient_id,
        specialty_id,
        clinic_id,
        full_name,
        phone,
        email,
        reason,
        scheduled_date: scheduled_date,
        // Thông tin người thân (cho người già)
        relative_name,
        relative_phone,
        relative_relationship,
        is_elderly,
        patient_age
    };

    const result = await createAsync(bookingPayload);

    // Add auto-assign info to result
    return {
        ...result,
        auto_assigned_doctor: autoAssignedDoctor,
        auto_assigned_slot: autoAssignedSlot
    };
}

/**
 * Hủy lịch hẹn (chỉ cho bệnh nhân)
 * @param {string} appointmentId - ID của appointment
 * @param {string} patientId - ID của bệnh nhân (để verify quyền)
 * @returns {Promise<Object>} Updated appointment
 */
async function cancelAppointmentAsync(appointmentId, patientId) {
    if (!Types.ObjectId.isValid(appointmentId)) {
        throw new Error("Invalid appointmentId");
    }
    if (!Types.ObjectId.isValid(patientId)) {
        throw new Error("Invalid patientId");
    }

    // Tìm appointment và verify quyền
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        throw new Error("Appointment not found");
    }

    // Verify appointment thuộc về patient này
    if (appointment.patient_id.toString() !== patientId) {
        throw new Error("You do not have permission to cancel this appointment");
    }

    // Chỉ cho phép hủy nếu status là SCHEDULED hoặc APPROVE
    if (!["SCHEDULED", "APPROVE"].includes(appointment.status)) {
        throw new Error(`Cannot cancel appointment with status: ${appointment.status}`);
    }

    // Cập nhật status thành CANCELLED
    appointment.status = "CANCELLED";
    await appointment.save();

    // Populate để lấy thông tin đầy đủ cho notification
    const populated = await Appointment.findById(appointment._id)
        .populate({
            path: "doctor_id",
            select: "title degree user_id",
            populate: { path: "user_id", select: "full_name" },
        })
        .populate("specialty_id", "name")
        .populate("clinic_id", "name")
        .lean();

    // Tạo notification cho bệnh nhân
    try {
        await createAppointmentStatusUpdateNotification(populated, "CANCELLED");
    } catch (notifError) {
        console.error("Error creating cancellation notification:", notifError);
        // Không throw error vì việc hủy appointment đã thành công
    }

    return populated;
}

module.exports = {
    createAsync,
    getByIdAsync,
    getAppointmentsByPatient,
    checkSlotAvailability,
    getAvailableSlotsForDoctor,
    findAvailableDoctorForClinic,
    clinicBookingAsync,
    cancelAppointmentAsync
};
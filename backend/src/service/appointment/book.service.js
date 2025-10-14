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

    // 1) Kiểm tra slot
    const slot = await Slot.findById(slot_id);
    if (!slot) throw new Error("Slot not found");
    if (slot.status !== "AVAILABLE") throw new Error("Slot is unavailable");
    if (slot.booked_count >= slot.max_patients) throw new Error("Slot is full");

    // 2) Kiểm tra bệnh nhân
    const patient = await Patient.findById(patient_id);
    if (!patient) throw new Error("Patient not found");

    // 3) Tạo lịch
    const booking_code = randomBookingCode();
    const appt = new Appointment({
        slot_id, doctor_id, patient_id, specialty_id, clinic_id,
        full_name, phone, email, dob, gender,
        province_code, ward_code, address_text, reason,
        booking_code,
    });
    await appt.save();

    // 4) Cập nhật slot
    await Slot.findByIdAndUpdate(slot_id, { $inc: { booked_count: 1 } });

    // 5) Lấy dữ liệu populate để trả về/gửi mail
    const populated = await Appointment.findById(appt._id)
        .populate({ path: "doctor_id", select: "title degree avatar_url user_id", populate: { path: "user_id", select: "full_name" } })
        .populate("specialty_id", "name")
        .populate("clinic_id", "name address")
        .lean();

    // 6) Gửi email
    let email_sent = false, email_error = null;
    try {
        await sendBookingEmail({
            to: email,
            subject: `[${booking_code}] Xác nhận đặt lịch khám`,
            booking: populated,
            doctor: populated.doctor_id,
            clinic: populated.clinic_id,
            specialty: populated.specialty_id,
            slot: slot.toObject(),
        });
        email_sent = true;
    } catch (e) {
        email_error = e?.message || String(e);
    }

    return { ...populated, email_sent, email_error };
}

async function getByIdAsync(id) {
    const data = await Appointment.findById(id)
        .populate({ path: "doctor_id", select: "title degree avatar_url user_id", populate: { path: "user_id", select: "full_name" } })
        .populate("specialty_id", "name")
        .populate("clinic_id", "name address")
        .lean();
    if (!data) throw new Error("Appointment not found");
    return data;
}

module.exports = { createAsync, getByIdAsync };

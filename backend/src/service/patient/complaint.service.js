const Complaint = require("../../model/appointment/Complaint");
const Patient = require("../../model/patient/Patient");
const Doctor = require("../../model/doctor/Doctor");
const Clinic = require("../../model/clinic/Clinic");
const Appointment = require("../../model/appointment/Appointment");
const mongoose = require("mongoose");

/**
 * Tạo khiếu nại mới
 */
exports.createComplaint = async (patientId, data) => {
    try {
        const { title, content, evidence, complaint_type, doctor_id, clinic_id, appointment_id } = data;

        // Validate
        if (!title || !content || !complaint_type) {
            throw new Error("Tiêu đề, nội dung và loại khiếu nại là bắt buộc");
        }

        if (complaint_type === "DOCTOR" && !doctor_id) {
            throw new Error("doctor_id là bắt buộc khi khiếu nại về bác sĩ");
        }

        if (complaint_type === "CLINIC" && !clinic_id) {
            throw new Error("clinic_id là bắt buộc khi khiếu nại về phòng khám");
        }

        // Kiểm tra patient tồn tại
        const patient = await Patient.findById(patientId);
        if (!patient) {
            throw new Error("Không tìm thấy bệnh nhân");
        }

        // Kiểm tra doctor/clinic tồn tại
        if (doctor_id) {
            const doctor = await Doctor.findById(doctor_id);
            if (!doctor) {
                throw new Error("Không tìm thấy bác sĩ");
            }
        }

        if (clinic_id) {
            const clinic = await Clinic.findById(clinic_id);
            if (!clinic) {
                throw new Error("Không tìm thấy phòng khám");
            }
        }

        // Kiểm tra appointment nếu có
        if (appointment_id) {
            const appointment = await Appointment.findById(appointment_id);
            if (!appointment) {
                throw new Error("Không tìm thấy lịch hẹn");
            }
            // Kiểm tra appointment thuộc về patient này
            if (appointment.patient_id.toString() !== patientId.toString()) {
                throw new Error("Lịch hẹn không thuộc về bệnh nhân này");
            }
        }

        // Tạo complaint
        const complaint = await Complaint.create({
            title,
            content,
            evidence: evidence || [],
            complaint_type,
            patient_id: patientId,
            doctor_id: doctor_id || null,
            clinic_id: clinic_id || null,
            appointment_id: appointment_id || null,
            status: "PENDING",
        });

        // Populate và trả về
        return await Complaint.findById(complaint._id)
            .populate("patient_id", "user_id")
            .populate({
                path: "patient_id",
                populate: {
                    path: "user_id",
                    select: "full_name email phone_number",
                },
            })
            .populate("doctor_id", "user_id title")
            .populate({
                path: "doctor_id",
                populate: {
                    path: "user_id",
                    select: "full_name",
                },
            })
            .populate("clinic_id", "name address")
            .populate("appointment_id", "scheduled_date start_time")
            .lean();
    } catch (error) {
        throw error;
    }
};

/**
 * Lấy danh sách khiếu nại của bệnh nhân
 */
exports.getPatientComplaints = async (patientId, { page = 1, limit = 10, status, complaint_type } = {}) => {
    try {
        const match = { patient_id: new mongoose.Types.ObjectId(patientId) };

        if (status) {
            match.status = status;
        }

        if (complaint_type) {
            match.complaint_type = complaint_type;
        }

        const skip = (page - 1) * limit;

        const [complaints, total] = await Promise.all([
            Complaint.find(match)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("doctor_id", "user_id title")
                .populate({
                    path: "doctor_id",
                    populate: {
                        path: "user_id",
                        select: "full_name",
                    },
                })
                .populate("clinic_id", "name address")
                .populate("appointment_id", "scheduled_date start_time")
                .lean(),
            Complaint.countDocuments(match),
        ]);

        return {
            data: complaints,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Lấy chi tiết khiếu nại
 */
exports.getComplaintById = async (complaintId, patientId) => {
    try {
        const complaint = await Complaint.findOne({
            _id: complaintId,
            patient_id: patientId,
        })
            .populate("patient_id", "user_id")
            .populate({
                path: "patient_id",
                populate: {
                    path: "user_id",
                    select: "full_name email phone_number",
                },
            })
            .populate("doctor_id", "user_id title")
            .populate({
                path: "doctor_id",
                populate: {
                    path: "user_id",
                    select: "full_name",
                },
            })
            .populate("clinic_id", "name address")
            .populate("appointment_id", "scheduled_date start_time")
            .populate("resolved_by", "username email")
            .lean();

        if (!complaint) {
            throw new Error("Không tìm thấy khiếu nại");
        }

        return complaint;
    } catch (error) {
        throw error;
    }
};


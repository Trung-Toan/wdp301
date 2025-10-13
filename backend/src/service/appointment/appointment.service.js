const Appointment = require("../../model/appointment/Appointment");
const doctorService = require("./../doctor/doctor.service");
/**
 * Lấy danh sách ID duy nhất của các bệnh nhân đã có lịch hẹn ở trạng thái 'COMPLETED'.
 * @param {mongoose.Types.ObjectId | string} doctorId ID của bác sĩ cần lọc.
 * @returns {Promise<Array<mongoose.Types.ObjectId>>}
 */
exports.uniquePatientIdsWithAppointmentIsCompleted = async (doctorId) => {
    return await Appointment.distinct('patient_id', {
        doctor_id: doctorId,
        status: 'COMPLETED'
    });
};

exports.getListAppointments = async (req) => {
    const { page = 1, limit = 10 } = req.query;
    const { status = null } = req.params;
    const accountId = req.user.sub;

    // Tìm bác sĩ theo account_id
    const doctor = await doctorService.findDoctorByAccountId(accountId);
    if (!doctor) {
        throw new Error('Truy cập bị từ chối: Không tìm thấy bác sĩ.');
    }

    // Ép kiểu số nguyên
    const currentPage = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Tính toán skip
    const skip = (currentPage - 1) * limitNumber;

    // Đếm tổng số lịch hẹn
    const totalAppointments = await Appointment.countDocuments({
        doctor_id: doctor._id, ...(status ? { status } : {})
    });

    // Tính tổng số trang
    const totalPages = Math.ceil(totalAppointments / limitNumber);

    // Lấy danh sách lịch hẹn có phân trang
    const appointments = await Appointment.find({ doctor_id: doctor._id, ...(status ? { status } : {}) })
        .lean()
        .sort({ appointment_date: -1 })
        .skip(skip)
        .limit(limitNumber);

    // Trả về cùng định dạng bạn đang dùng
    return {
        appointments: appointments,
        pagination: {
            totalItems: totalAppointments,
            totalPages: totalPages,
            currentPage: currentPage,
            limit: limitNumber,
        },
    };
};

exports.getAppointmentById = async (req) => {
    try{
        const appointmentId = req.params.appointmentId;
        const appointment = await Appointment.findById(appointmentId).lean();
        return { appointment };
    } catch (error) {
        console.error("Lỗi khi tìm cuộc hẹn bằng ID:", error);
        return null;
    }
};

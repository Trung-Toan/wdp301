const Doctor = require("../../model/doctor/Doctor");
const userService = require("../user/user.service");
const appointmentService = require("../appointment/appointment.service");
const patientService = require("../patient/patient.service");
/**
 * Hàm tìm kiếm một bác sĩ dựa trên user_id.
 */
exports.findDoctorByUserId = async (userId) => {
    try {
        const doctor = await Doctor.findOne({ user_id: userId });
        return doctor;
    } catch (error) {
        console.error("Lỗi khi tìm bác sĩ bằng user_id:", error);
        return null;
    }
};

/**
 * Thực hiện phân trang trên một mảng ID.
 */
const getPaginatedIds = (allIds, { page, limit }) => {
    const skip = (page - 1) * limit;
    return allIds.slice(skip, skip + limit);
};

exports.findDoctorByAccountId = async (accountId) => {
    try {
        const user = await userService.findUserByAccountId(accountId);
        const doctor = await exports.findDoctorByUserId(user._id);
        return doctor;
    } catch (error) {
        console.error("Lỗi khi tìm bác sĩ bằng account_id:", error);
        return null;
    }
};

/**
 * Lấy danh sách người dùng là bệnh nhân của bác sĩ (đã khám xong) kèm theo phân trang.
 */
exports.getListPatients = async (req) => {
    const { page = 1, limit = 10, search = "" } = req.query;

    try {
        // Bước 1: Xác thực và lấy thông tin bác sĩ
        const accountId = req.user.sub;

        const doctor = await exports.findDoctorByAccountId(accountId);
        if (!doctor) throw new Error('Truy cập bị từ chối: Không tìm thấy bác sĩ.');

        return await patientService.getPatientAvailableOfDoctor(doctor._id, parseInt(page), parseInt(limit), search);
    } catch (error) {
        throw error;
    }
};

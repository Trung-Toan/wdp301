const Patient = require("../../model/patient/Patient");
const User = require("../../model/user/User");
const Appointment = require("../../model/appointment/Appointment");
const Doctor = require("../../model/doctor/Doctor");
const userService = require("../user/user.service");


/**
 * Hàm tìm kiếm một bác sĩ dựa trên user_id.
 * @param {mongoose.Types.ObjectId | string} userId - ID của người dùng cần tìm.
 * @returns {Promise<Doctor|null>}
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
 * Lấy danh sách ID duy nhất của các bệnh nhân đã có lịch hẹn ở trạng thái 'COMPLETED'.
 * @param {mongoose.Types.ObjectId | string} doctorId ID của bác sĩ cần lọc.
 * @returns {Promise<Array<mongoose.Types.ObjectId>>}
 */
exports.uniquePatientIdsCompleted = async (doctorId) => {
    return await Appointment.distinct('patient_id', {
        doctor_id: doctorId,
        status: 'COMPLETED'
    });
};

/**
 * Từ danh sách ID bệnh nhân, truy vấn và trả về danh sách document User tương ứng.
 * @param {Array<mongoose.Types.ObjectId>} patientIds Mảng chứa ID của các bệnh nhân.
 * @returns {Promise<Array<User>>} Mảng chứa các document User đầy đủ.
 */
const getUsersFromPatientIds = async (patientIds) => {
    if (!patientIds || patientIds.length === 0) {
        return [];
    }
    // Từ ID của patient, tìm ra user_id tương ứng
    const patients = await Patient.find({ _id: { $in: patientIds } }).select('user_id');
    const userIds = patients.map(p => p.user_id);

    // Lấy thông tin đầy đủ của User từ user_id
    return await User.find({ _id: { $in: userIds } });
};

/**
 * Thực hiện phân trang trên một mảng ID.
 * @param {Array<any>} allIds Mảng chứa tất cả ID.
 * @param {object} paginationOptions - Tùy chọn phân trang.
 * @param {number} paginationOptions.page - Trang hiện tại.
 * @param {number} paginationOptions.limit - Số lượng mục trên mỗi trang.
 * @returns {Array<any>} Mảng chứa các ID của trang hiện tại.
 */
const getPaginatedIds = (allIds, { page, limit }) => {
    const skip = (page - 1) * limit;
    return allIds.slice(skip, skip + limit);
};

/**
 * Lấy danh sách người dùng là bệnh nhân của bác sĩ (đã khám xong) kèm theo phân trang.
 * @param {*} req
 * @returns {Promise<object>}
 */
exports.getListPatients = async (req) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        // Bước 1: Xác thực và lấy thông tin bác sĩ
        const accountId = req.user.sub;
        const user = await userService.findUserByAccountId(accountId);
        if (!user) throw new Error('Truy cập bị từ chối: Không tìm thấy người dùng.');
        
        const doctor = await exports.findDoctorByUserId(user._id);
        if (!doctor) throw new Error('Truy cập bị từ chối: Không tìm thấy bác sĩ.');

        // Bước 2: Lấy toàn bộ ID bệnh nhân hợp lệ
        const allPatientIds = await exports.uniquePatientIdsCompleted(doctor._id);
        const totalPatients = allPatientIds.length;
        
        if (totalPatients === 0) {
            return { patients: [], pagination: { totalItems: 0, totalPages: 0, currentPage: 1, limit: parseInt(limit) } };
        }

        // Bước 3: Lấy ra các ID cho trang hiện tại
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const paginatedPatientIds = getPaginatedIds(allPatientIds, { page: pageNumber, limit: limitNumber });

        // Bước 4: Lấy thông tin user từ các ID đã phân trang
        const userDocs = await getUsersFromPatientIds(paginatedPatientIds);

        // Bước 5: Tạo đối tượng trả về
        const totalPages = Math.ceil(totalPatients / limitNumber);
        return {
            patients: userDocs,
            pagination: {
                totalItems: totalPatients,
                totalPages: totalPages,
                currentPage: pageNumber,
                limit: limitNumber
            }
        };
    } catch (error) {
        throw error;
    }
};
const Patient = require("../../model/patient/Patient");
const User = require("../../model/user/User");
const Appointment = require("../../model/appointment/Appointment");
const Doctor = require("../../model/doctor/Doctor");
const userService = require("../user/user.service");

exports.findDoctorByUserId = async (userId) => {
    return await Doctor.findOne({ user_id: userId }).populate("user_id");
}


// get list patient users of doctor with pagination (chỉ users của patients đã khám COMPLETED)
exports.getListPatients = async (req, { page = 1, limit = 10 } = {}) => {
    try {
        // Lấy Account.id từ JWT
        const accountId = req.user.sub;

        // Từ accountId, lấy User tương ứng
        const user = await userService.findUserByAccountId(accountId);

        if (!user) {
            throw new Error('Truy cập bị từ chối: Không tìm thấy người dùng hoặc không được phép');
        }

        // Từ User, lấy Doctor tương ứng
        console.log("user_id: ", user.id);
        // const doctor = await  exports.findDoctorByUserId(user.id);
        // console.log("doctor: ", doctor);
        // if (!doctor) {
        //     throw new Error('Truy cập bị từ chối: Không tìm thấy bác sĩ hoặc không được phép');
        // }
        
        

        // // Bước 2: Lấy tất cả unique patient IDs từ Appointments COMPLETED
        // // Sử dụng distinct() để lấy unique, kèm sort theo createdAt (giả sử Appointment có field này)
        // const patientIds = await Appointment.distinct('patient', {
        //     doctor: doctorId,
        //     status: 'COMPLETED'
        // }).sort({ createdAt: -1 });  // Sort descending theo thời gian khám gần nhất

        // // Bước 3: Tính pagination trên mảng IDs (dễ hiểu: slice như array JS)
        // const skip = (page - 1) * limit;
        // const totalItems = patientIds.length;
        // const totalPages = Math.ceil(totalItems / limit);

        // // Slice IDs cho page hiện tại (unique và paginated)
        // const paginatedPatientIds = patientIds.slice(skip, skip + limit);

        // if (paginatedPatientIds.length === 0) {
        //     return {
        //         users: [],
        //         page,
        //         limit,
        //         totalItems,
        //         totalPages
        //     };
        // }

        // // Bước 4: Lấy Patients từ IDs đã paginate, populate User (chỉ fields cần)
        // const patients = await Patient.find({
        //     _id: { $in: paginatedPatientIds }
        // })
        //     .populate({
        //         path: 'user',
        //         select: 'fullName gender DOB address avatarUrl account'  // Chỉ lấy fields User cần
        //     })
        //     .sort({ _id: 1 });  // Sort theo _id để khớp order từ slice (nếu cần)

        // // Bước 5: Map chỉ trả User info (dễ hiểu: transform ở JS)
        // const users = patients.map(patient => ({
        //     _id: patient.user._id,
        //     fullName: patient.user.fullName,
        //     gender: patient.user.gender,
        //     DOB: patient.user.DOB,
        //     address: patient.user.address,
        //     avatarUrl: patient.user.avatarUrl,
        //     accountId: patient.user.account  // ObjectId của Account
        // }));

        return {
            users: user,
        };
    } catch (error) {
        throw error;
    }
};
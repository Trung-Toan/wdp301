const Patient = require("../../model/patient/Patient");
const User = require("../../model/user/User");
const Appointment = require("../../model/appointment/Appointment");
const Doctor = require("../../model/doctor/Doctor");

// get list patient users of doctor with pagination (chỉ users của patients đã khám COMPLETED)
const getListPatients = async (req, { page = 1, limit = 10 } = {}) => {
    try {
        // Lấy Account.id từ JWT
        const accountId = req.user.sub;

        // Từ accountId, lấy User tương ứng
        const user = await User.findOne({
            account: accountId,
        }).populate('account', '_id role');
        if (!user) {
            throw new Error('Access denied: User not found or not authorized');
        }

        // Từ User, lấy Doctor tương ứng
        const doctor = await Doctor.findOne({ user: user._id })
            .populate({
                path: 'user',
                populate: {
                    path: 'account',
                    select: '_id'
                }
            });

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
            users: accountId,
            page,
            limit,
            totalItems,
            totalPages
        };
    } catch (error) {
        throw error;
    }
};
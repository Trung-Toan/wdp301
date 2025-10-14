const Appointment = require("../../model/appointment/Appointment");
const doctorService = require("./../doctor/doctor.service");
const slotService = require("../slot/slot.service");
const { now } = require("mongoose");

/**
 * Lấy danh sách ID duy nhất của các bệnh nhân đã có lịch hẹn ở trạng thái 'COMPLETED'.
 * @param {mongoose.Types.ObjectId | string} doctorId ID của bác sĩ cần lọc.
 * @returns {Promise<Array<mongoose.Types.ObjectId>>}
 */
exports.uniquePatientIdsWithAppointmentIsCompleted = async (doctorId, search) => {
    // Xây dựng pipeline cho aggregation
    const pipeline = [
        // 1. Lọc các cuộc hẹn ban đầu: chỉ của bác sĩ này và đã 'COMPLETED'
        {
            $match: {
                doctor_id: doctorId,
                status: 'COMPLETED'
            }
        },
        // 2. Join với collection 'patients' để lấy patient_code
        {
            $lookup: {
                from: 'patients',
                localField: 'patient_id',
                foreignField: '_id',
                as: 'patientInfo'
            }
        },
        { $unwind: '$patientInfo' },

        // 3. Join với collection 'users' để lấy full_name và account_id
        {
            $lookup: {
                from: 'users',
                localField: 'patientInfo.user_id',
                foreignField: '_id',
                as: 'userInfo'
            }
        },
        { $unwind: '$userInfo' },

        // 4. Join với collection 'accounts' để lấy phone_number
        {
            $lookup: {
                from: 'accounts',
                localField: 'userInfo.account_id',
                foreignField: '_id',
                as: 'accountInfo'
            }
        },
        { $unwind: '$accountInfo' },
    ];

    // 5. Nếu có điều kiện tìm kiếm, thêm bước lọc cuối cùng
    if (search && search.trim() !== '') {
        pipeline.push({
            $match: {
                $or: [
                    // Tìm kiếm trong mã bệnh nhân
                    { 'patientInfo.patient_code': { $regex: search, $options: 'i' } },
                    // Tìm kiếm trong tên bệnh nhân
                    { 'userInfo.full_name': { $regex: search, $options: 'i' } },
                    // Tìm kiếm trong số điện thoại
                    { 'accountInfo.phone_number': { $regex: search, $options: 'i' } },
                    // Tìm kiếm trong số điện thoại
                    { 'accountInfo.email': { $regex: search, $options: 'i' } }
                ]
            }
        });
    }

    // 6. Nhóm kết quả lại để lấy các patient_id duy nhất
    pipeline.push({
        $group: {
            _id: '$patient_id'
        }
    });

    // 7. Định dạng lại đầu ra
    pipeline.push({
        $project: {
            _id: 0,
            patient_id: '$_id'
        }
    });


    const results = await Appointment.aggregate(pipeline);

    // Trả về một mảng các ObjectId của patient
    return results.map(item => item.patient_id);
};

exports.getListAppointments = async (req) => {
    const accountId = req.user.sub;

    // Tìm bác sĩ theo account_id
    const doctor = await doctorService.findDoctorByAccountId(accountId);
    if (!doctor) {
        throw new Error('Truy cập bị từ chối: Không tìm thấy bác sĩ.');
    }

    const { page = 1, limit = 10, status = null, slot = await slotService.getSlotAtNowByDocterId(doctor._id), date = new Date() } = req.query;

    // Ép kiểu số nguyên
    const currentPage = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Tính toán skip
    const skip = (currentPage - 1) * limitNumber;

    // Đếm tổng số lịch hẹn
    const totalAppointments = await Appointment.countDocuments({
        doctor_id: doctor._id, ...(status ? { status } : {}), slot_id: slot, 
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
    try {
        const appointmentId = req.params.appointmentId;
        const appointment = await Appointment.findById(appointmentId).lean();
        return { appointment };
    } catch (error) {
        console.error("Lỗi khi tìm cuộc hẹn bằng ID:", error);
        return null;
    }
};

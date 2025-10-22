const Appointment = require("../../model/appointment/Appointment");
const doctorService = require("./../doctor/doctor.service");
const slotService = require("../slot/slot.service");
const { now } = require("mongoose");

/**
 * Lấy danh sách ID duy nhất của các bệnh nhân đã có lịch hẹn ở trạng thái 'COMPLETED'.
 * @param {mongoose.Types.ObjectId | string} doctorId ID của bác sĩ cần lọc.
 * @returns {Promise<Array<mongoose.Types.ObjectId>>}
 */
exports.uniquePatientIdsWithAppointmentIsCompleted = async (
  doctorId,
  search
) => {
  // Xây dựng pipeline cho aggregation
  const pipeline = [
    // 1. Lọc các cuộc hẹn ban đầu: chỉ của bác sĩ này và đã 'COMPLETED'
    {
      $match: {
        doctor_id: doctorId,
        status: "COMPLETED",
      },
    },
    // 2. Join với collection 'patients' để lấy patient_code
    {
      $lookup: {
        from: "patients",
        localField: "patient_id",
        foreignField: "_id",
        as: "patientInfo",
      },
    },
    { $unwind: "$patientInfo" },

    // 3. Join với collection 'users' để lấy full_name và account_id
    {
      $lookup: {
        from: "users",
        localField: "patientInfo.user_id",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },

    // 4. Join với collection 'accounts' để lấy phone_number
    {
      $lookup: {
        from: "accounts",
        localField: "userInfo.account_id",
        foreignField: "_id",
        as: "accountInfo",
      },
    },
    { $unwind: "$accountInfo" },
  ];

  // 5. Nếu có điều kiện tìm kiếm, thêm bước lọc cuối cùng
  if (search && search.trim() !== "") {
    pipeline.push({
      $match: {
        $or: [
          // Tìm kiếm trong mã bệnh nhân
          { "patientInfo.patient_code": { $regex: search, $options: "i" } },
          // Tìm kiếm trong tên bệnh nhân
          { "userInfo.full_name": { $regex: search, $options: "i" } },
          // Tìm kiếm trong số điện thoại
          { "accountInfo.phone_number": { $regex: search, $options: "i" } },
          // Tìm kiếm trong số điện thoại
          { "accountInfo.email": { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  // 6. Nhóm kết quả lại để lấy các patient_id duy nhất
  pipeline.push({
    $group: {
      _id: "$patient_id",
    },
  });

  // 7. Định dạng lại đầu ra
  pipeline.push({
    $project: {
      _id: 0,
      patient_id: "$_id",
    },
  });

  const results = await Appointment.aggregate(pipeline);

  // Trả về một mảng các ObjectId của patient
  return results.map((item) => item.patient_id);
};

exports.getListAppointments = async (req, doctorId) => {
  const slotObj =
    (await slotService.getSlotAtNowByDocterId(doctorId)) ||
    (await slotService.getFirtAvailableSlotByDoctorId(doctorId));

  const {
    page = 1,
    limit = 10,
    status = null,
    slot = slotObj?._id,
    date = new Date(),
  } = req.query;

  const slotNow = await slotService.getSlotById(slot);

  // Ép kiểu số nguyên
  const currentPage = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  // Tính toán skip
  const skip = (currentPage - 1) * limitNumber;

  // Đếm tổng số lịch hẹn
  const totalAppointments = await Appointment.countDocuments({
    doctor_id: doctorId,
    ...(status ? { status } : {}),
    slot_id: slot,
    scheduled_date: date,
  });

  // Tính tổng số trang
  const totalPages = Math.ceil(totalAppointments / limitNumber);

  // Lấy danh sách lịch hẹn có phân trang
  const appointments = await Appointment.find({
    doctor_id: doctorId,
    ...(status ? { status } : {}),
    slot_id: slot,
    scheduled_date: date,
  })
    .select(
      "_id slot_id patient_id scheduled_date status created_at phone full_name"
    )
    .populate({
      path: "patient_id",
      select: "patient_code",
    })
    .lean()
    .sort({ appointment_date: -1 })
    .skip(skip)
    .limit(limitNumber);

  // Định dạng dữ liệu trả về
  const formData = appointments.map((app) => ({
    appointment: {
      appointment_id: app._id,
      scheduled_date: app.scheduled_date,
      status: app.status,
      created_at: app.created_at,
    },

    patient: {
      patient_id: app.patient_id._id,
      patient_code: app.patient_id.patient_code,
      phone_number: app.phone,
      patient_name: app.full_name,
    },
  }));


  // Trả về cùng định dạng bạn đang dùng
  return {
    appointments: formData,
    slot: {
      slot_select: {
        slot_id: slotNow?._id,
        start_time: slotNow?.start_time,
        end_time: slotNow?.end_time,
      },
      slot_list: (await slotService.getListSlotsByDoctorId(doctorId)) || [],
    },
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
    const { appointmentId } = req.params;
    const appointment = await Appointment.findById(appointmentId)
      .populate("slot_id", "start_time end_time")
      .populate({
        path: "patient_id",
        select: "patient_code user_id",
        populate: {
          path: "user_id",
          select: "full_name account_id",
          populate: {
            path: "account_id",
            select: "email phone_number",
          },
        },
      })
      .populate("specialty_id", "name")
      .lean();
    const formattedAppointment = {
      patient: {
        id: appointment.patient_id._id,
        patient_code: appointment.patient_id.patient_code,
        full_name: appointment.patient_id.user_id.full_name,
        email: appointment.patient_id.user_id.account_id.email,
        phone_number: appointment.patient_id.user_id.account_id.phone_number,
      },
      appointment: {
        id: appointment._id,
        slot: {
          id: appointment.slot_id._id,
          start_time: appointment.slot_id.start_time,
          end_time: appointment.slot_id.end_time,
        },
        scheduled_date: appointment.scheduled_date,
        status: appointment.status,
        specialty: appointment.specialty_id
          ? {
              id: appointment.specialty_id._id,
              name: appointment.specialty_id.name,
            }
          : null,
        reason: appointment.reason,
        created_at: appointment.createdAt,
      },
    };
    return { appointment: formattedAppointment };
  } catch (error) {
    console.error("Lỗi khi tìm cuộc hẹn bằng ID:", error);
    return null;
  }
};
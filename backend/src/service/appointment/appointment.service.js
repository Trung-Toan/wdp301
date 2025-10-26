const Appointment = require("../../model/appointment/Appointment");
const doctorService = require("./../doctor/doctor.service");
const slotService = require("../slot/slot.service");
const Patient = require("../../model/patient/Patient");
const medical_recordService = require("../medical_record/medicalRecord.service");
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
  const now = new Date();
  let { date = now } = req.query;
  date = new Date(date);

  date.setHours(
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds()
  );
  const slotObj =
    (await slotService.getSlotAtDateByDocterId(doctorId, date)) ||
    (await slotService.getFirstAvailableSlotByDoctorId(doctorId, date));

  const {
    page = 1,
    limit = 10,
    status = null,
    slot = slotObj?._id,
  } = req.query;

  const slotNow = await slotService.getSlotById(slot, date);

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
      slot_list: (await slotService.getListSlotsByDoctorId(doctorId, date)) || [],
    },
    pagination: {
      totalItems: totalAppointments,
      totalPages: totalPages,
      currentPage: currentPage,
      limit: limitNumber,
    },
  };
};

exports.getPatientsWithAppointments = async (
  doctorId,
  appointmentStatus = "COMPLETED",
  pageParam = 1, limitParam = 10, search = ""
) => {
  const page = parseInt(pageParam) || 1;
  const limit = parseInt(limitParam) || 10;
  const skip = (page - 1) * limit;

  const searchRegex = { $regex: search, $options: "i" };

  const matchingPatients = await Patient.find({
    patient_code: searchRegex,
  }).select("_id");
  const matchingPatientIds = matchingPatients.map((p) => p._id);

  const allAppointments = await Appointment.find({
    doctor_id: doctorId,
    status: appointmentStatus,
    $or: [
      { full_name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { patient_id: { $in: matchingPatientIds } },
    ],
  })
    .populate({
      path: "patient_id",
      select: "patient_code",
    })
    .lean();

  const uniquePatientsMap = new Map();
  allAppointments.forEach((app) => {
    const patientKey = `${app.full_name}|${app.email}|${app.phone}|${app.dob}`;
    if (!uniquePatientsMap.has(patientKey)) {
      uniquePatientsMap.set(patientKey, app);
    }
  });
  const uniqueAppointments = Array.from(uniquePatientsMap.values());

  const totalItems = uniqueAppointments.length;
  const totalPages = Math.ceil(totalItems / limit);

  const paginatedResults = uniqueAppointments.slice(skip, skip + limit);

  const formatData = paginatedResults.map((app) => ({
    appointment_id: app._id,
    doctor_id: app.doctor_id,
    patient_id: app.patient_id._id,
    specialty_id: app.specialty_id,
    slot_id: app.slot_id,
    scheduled_date: app.scheduled_date,
    patient_code: app.patient_id.patient_code,
    full_name: app.full_name,
    email: app.email,
    phone: app.phone,
    dob: app.dob,
    gender: app.gender
  }));

  const pagination = {
    totalItems: totalItems,
    totalPages: totalPages,
    page: page,
    limit: limit,
  };

  return {
    patients: formatData,
    pagination: pagination,
  };
};

exports.getAppointmentById = async (req, appointmentId) => {
  try {

    const appointment = await Appointment.findById(appointmentId)
      .populate("slot_id", "start_time end_time")
      .populate({
        path: "patient_id",
        select: "patient_code",
      })
      .populate("specialty_id", "name")
      .lean();
    const medical_record = await medical_recordService.getMedicalRecordByAppointment_fullname_phone_email_dob(appointment?.doctor_id, appointment?.full_name, appointment?.phone, appointment?.email, appointment?.dob);
    const formattedAppointment = {
      patient: {
        id: appointment?.patient_id?._id || null,
        patient_code: appointment?.patient_id?.patient_code || null,
        full_name: appointment?.full_name || null,
        email: appointment?.email || null,
        phone_number: appointment?.phone || null,
        dob: appointment?.dob || null,
        gender: appointment?.gender || null,
      },
      medical_record: medical_record || [],
      appointment: {
        id: appointment._id || null,
        slot: {
          id: appointment.slot_id._id || null,
          start_time: appointment.slot_id.start_time || null,
          end_time: appointment.slot_id.end_time || null,
        },
        scheduled_date: appointment.scheduled_date || null,
        status: appointment.status || null,
        specialty: appointment.specialty_id
          ? {
            id: appointment.specialty_id._id || null,
            name: appointment.specialty_id.name || null,
          }
          : null,
        reason: appointment.reason || null,
        created_at: appointment.createdAt || null,
      },
    };
    return { appointment: formattedAppointment };
  } catch (error) {
    console.error("Lỗi khi tìm cuộc hẹn bằng ID:", error);
    return null;
  }
};


exports.getAppointmentByIdDefault = async (appointmentId) => {
  try {
    return await Appointment.findById(appointmentId).lean() || null;
  } catch (error) {
    console.log(`Lỗi tại getAppointmentByIdDefault(${appointmentId}): `, erorr);
    return null;
  }
}


exports.updateAppointment = async (id, appData) => {
  try {
    const updatedApp = await Appointment.findByIdAndUpdate(
      id,
      { $set: appData },
      { new: true }
    ).lean();
    return updatedApp || null;
  } catch (error) {
    console.log("Lỗi không thể cập nhật app: ", error);
    return null;
  }
}

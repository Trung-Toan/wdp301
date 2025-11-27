// src/service/doctor/doctor.service.js
const mongoose = require("mongoose");
const Doctor = require("../../model/doctor/Doctor");
const userService = require("../user/user.service");
const patientService = require("../patient/patient.service");
const License = require("../../model/clinic/License");
const User = require("../../model/user/User");
const Account = require("../../model/auth/Account");
const Appointment = require("../../model/appointment/Appointment");
const MedicalRecord = require("../../model/patient/MedicalRecord");
const Absence = require("../../model/doctor/Absence");

// Helpers ngày UTC (khớp kiểu lưu scheduled_date là date-only UTC)
const startOfUTCDay = (d) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
const addUTCDays = (d, days) =>
  new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + days)
  );

/**
 * Dashboard stats cho Doctor
 * Trả về object:
 * {
 *   todayPatients,
 *   appointmentChange,         // % so với hôm qua
 *   pendingPrescriptions,      // MedicalRecord.prescription.status = "PENDING"
 *   pendingRequests,           // Access Requests đang PENDING trên các hồ sơ do bác sĩ sở hữu
 *   totalPatients,             // distinct bệnh nhân của bác sĩ (từ Appointment, loại CANCELLED)
 *   upcomingAppointments       // số lịch hẹn trong 7 ngày tới
 * }
 */
exports.dashboard = async (doctorId) => {
  const doctorObjectId = new mongoose.Types.ObjectId(doctorId);

  // Các nhóm trạng thái theo nghiệp vụ
  const ACTIVE_APPT = ["SCHEDULED", "APPROVED"];
  const COUNT_TODAY_APPT = ["SCHEDULED", "APPROVED", "COMPLETED"];
  const EXCLUDE_TOTAL_PATIENTS = ["CANCELLED", "NO_SHOW"];

  // Mốc ngày UTC cho hôm nay/hôm qua và 7 ngày tới
  const now = new Date();
  const nowUTC = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
      now.getUTCMilliseconds()
    )
  );
  const todayStart = startOfUTCDay(now);
  const todayEnd = addUTCDays(now, 1);
  const yesterdayStart = addUTCDays(now, -1);
  const yesterdayEnd = todayStart;
  const upcomingStart = todayStart;
  const upcomingEnd = addUTCDays(now, 7);

  // 1) Bệnh nhân hôm nay (distinct theo patient_id)
  const todayPatientsIdsPromise = Appointment.distinct("patient_id", {
    doctor_id: doctorObjectId,
    scheduled_date: { $gte: todayStart, $lt: todayEnd },
    status: { $in: COUNT_TODAY_APPT },
  });

  // 2) Lịch hẹn hôm nay & hôm qua (để tính % change "Tổng lịch hẹn")
  const todayApptPromise = Appointment.countDocuments({
    doctor_id: doctorObjectId,
    scheduled_date: { $gte: todayStart, $lt: todayEnd },
    status: { $in: COUNT_TODAY_APPT },
  });

  const yesterdayApptPromise = Appointment.countDocuments({
    doctor_id: doctorObjectId,
    scheduled_date: { $gte: yesterdayStart, $lt: yesterdayEnd },
    status: { $in: COUNT_TODAY_APPT },
  });

  // 3) Đơn thuốc chờ duyệt
  const pendingPrescriptionsPromise = MedicalRecord.countDocuments({
    doctor_id: doctorObjectId,
    "prescription.status": "PENDING",
  });

  // 4) Yêu cầu truy cập bệnh án đang PENDING
  const pendingRequestsAggPromise = MedicalRecord.aggregate([
    { $match: { doctor_id: doctorObjectId } },
    { $unwind: "$access_requests" },
    { $match: { "access_requests.status": "PENDING" } },
    { $count: "cnt" },
  ]);

  // 5) Tổng bệnh nhân (distinct, loại CANCELLED/NO_SHOW)
  const totalPatientsDistinctPromise = Appointment.distinct("patient_id", {
    doctor_id: doctorObjectId,
    status: { $nin: EXCLUDE_TOTAL_PATIENTS },
  });

  // 6) Lịch hẹn sắp tới (7 ngày)
  const upcomingAppointmentsPromise = Appointment.countDocuments({
    doctor_id: doctorObjectId,
    scheduled_date: { $gte: upcomingStart, $lt: upcomingEnd },
    status: { $in: ACTIVE_APPT },
  });

  // 7) danh sách lịch hẹn của ngày hôm nay

  const todayAppointmentsList = await Appointment.aggregate([
    {
      $match: {
        doctor_id: doctorObjectId,
        scheduled_date: { $gte: todayStart, $lt: todayEnd },
        status: "APPROVE",
      },
    },
    {
      $lookup: {
        from: "slots",
        localField: "slot_id",
        foreignField: "_id",
        as: "slot",
      },
    },
    { $unwind: "$slot" },
    {
      $addFields: {
        slotStartDiff: {
          $abs: {
            $subtract: ["$slot.start_time", nowUTC],
          },
        },
      },
    },
    {
      $sort: {
        slotStartDiff: 1,
        booked_at: 1,
      },
    },
  ]);

  const [
    todayPatientsIds,
    todayAppt,
    yesterdayAppt,
    pendingPrescriptions,
    pendingRequestsAgg,
    totalPatientsDistinct,
    upcomingAppointments,
  ] = await Promise.all([
    todayPatientsIdsPromise,
    todayApptPromise,
    yesterdayApptPromise,
    pendingPrescriptionsPromise,
    pendingRequestsAggPromise,
    totalPatientsDistinctPromise,
    upcomingAppointmentsPromise,
  ]);

  const todayPatients = (todayPatientsIds || []).length;
  const pendingRequests =
    Array.isArray(pendingRequestsAgg) && pendingRequestsAgg[0]?.cnt
      ? pendingRequestsAgg[0].cnt
      : 0;

  // % thay đổi so với hôm qua
  let appointmentChange = 0;
  if (yesterdayAppt === 0) {
    appointmentChange = todayAppt > 0 ? 100 : 0;
  } else {
    appointmentChange = Math.round(
      ((todayAppt - yesterdayAppt) / yesterdayAppt) * 100
    );
  }

  return {
    todayPatients,
    appointmentChange,
    pendingPrescriptions: pendingPrescriptions || 0,
    pendingRequests,
    todayAppointmentsList,
    totalPatients: (totalPatientsDistinct || []).length,
    upcomingAppointments: upcomingAppointments || 0,
  };
};
/**
 * Tìm bác sĩ theo user_id
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

exports.findDoctorById = async (doctorId) => {
  try {
    const doctor = await Doctor.findById(doctorId);
    return doctor;
  } catch (error) {
    console.error("Lỗi khi tìm bác sĩ bằng doctorId:", error);
    return null;
  }
};

/**
 * (Helper) Phân trang một mảng id (nếu cần dùng)
 */
const getPaginatedIds = (allIds, { page, limit }) => {
  const skip = (page - 1) * limit;
  return allIds.slice(skip, skip + limit);
};

/**
 * Tìm bác sĩ theo account_id
 */
exports.findDoctorByAccountId = async (accountId) => {
  try {
    const user = await userService.findUserByAccountId(accountId);
    if (!user) return null;
    const doctor = await exports.findDoctorByUserId(user._id);
    return doctor;
  } catch (error) {
    console.error("Lỗi khi tìm bác sĩ bằng account_id:", error);
    return null;
  }
};

/**
 * Lấy danh sách bệnh nhân đã khám xong của bác sĩ (có phân trang + search)
 */
exports.getListPatients = async (req) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  try {
    const accountId = req.user.sub;
    const doctor = await exports.findDoctorByAccountId(accountId);
    if (!doctor) throw new Error("Truy cập bị từ chối: Không tìm thấy bác sĩ.");

    // get patient available of doctor on appointment service
    return await patientService.getPatientAvailableOfDoctor(
      doctor._id,
      parseInt(page, 10),
      parseInt(limit, 10),
      search
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy hồ sơ bác sĩ theo accountId
 */
exports.getProfile = async (accountId) => {
  const user = await User.findOne({ account_id: accountId });
  if (!user) throw new Error("Không tìm thấy người dùng của tài khoản này");

  const doctor = await Doctor.findOne({ user_id: user._id })
    .populate({
      path: "user_id",
      select: "full_name dob gender address avatar_url account_id",
      populate: {
        path: "account_id",
        select: "username email phone_number",
      },
    })
    .populate("clinic_id", "name")
    .populate("specialty_id", "name")
    .lean();

  if (!doctor) throw new Error("Không tìm thấy hồ sơ bác sĩ");
  return doctor;
};

/**
 * Cập nhật hồ sơ bác sĩ (doctor + user + account)
 * - Chỉ cập nhật các trường được gửi lên (!== undefined)
 * - Trả về hồ sơ đã populate sau cập nhật
 */
exports.updateProfile = async (accountId, data) => {
  const {
    // Doctor
    title,
    degree,
    experience,
    description,
    // User
    gender,
    dob,
    address,
    avatar_url,
    // Account
    username,
    email,
    phone_number,
  } = data || {};

  const user = await User.findOne({ account_id: accountId });
  if (!user) throw new Error("Không tìm thấy người dùng của tài khoản này");

  const doctor = await Doctor.findOne({ user_id: user._id });
  if (!doctor) throw new Error("Không tìm thấy hồ sơ bác sĩ");

  // Cập nhật các trường của Doctor nếu có gửi lên
  if (title !== undefined) doctor.title = title;
  if (degree !== undefined) doctor.degree = degree;
  if (experience !== undefined) doctor.experience = experience;
  if (description !== undefined) doctor.description = description;

  await doctor.save();

  // Chuẩn bị payload update cho User
  const userUpdate = {};
  if (gender !== undefined) userUpdate.gender = gender;
  if (dob !== undefined) {
    // Cho phép null/"" để xoá ngày sinh
    userUpdate.dob = dob ? new Date(dob) : null;
  }
  if (address !== undefined) userUpdate.address = address;
  if (avatar_url !== undefined) userUpdate.avatar_url = avatar_url;

  // Chuẩn bị payload update cho Account
  const accountUpdate = {};
  if (username !== undefined) accountUpdate.username = username;
  if (email !== undefined) accountUpdate.email = email;
  if (phone_number !== undefined) accountUpdate.phone_number = phone_number;

  // Thực hiện cập nhật song song (chỉ chạy nếu có trường cần update)
  await Promise.all([
    Object.keys(userUpdate).length
      ? User.findByIdAndUpdate(
          doctor.user_id,
          { $set: userUpdate },
          { new: true }
        )
      : Promise.resolve(null),
    Object.keys(accountUpdate).length
      ? Account.findByIdAndUpdate(
          accountId,
          { $set: accountUpdate },
          { new: true }
        )
      : Promise.resolve(null),
  ]);

  // Trả về hồ sơ đã cập nhật (giống getProfile)
  const updatedProfile = await Doctor.findOne({ user_id: user._id })
    .populate({
      path: "user_id",
      select: "full_name dob gender address avatar_url account_id",
      populate: {
        path: "account_id",
        select: "username email phone_number",
      },
    })
    .populate("clinic_id", "name")
    .populate("specialty_id", "name")
    .lean();

  if (!updatedProfile)
    throw new Error("Không tìm thấy hồ sơ bác sĩ sau cập nhật");
  return updatedProfile;
};

/**
 * Đổi mật khẩu tài khoản bác sĩ
 * - Validation & đối chiếu mật khẩu cũ làm ở Controller
 * - Ở Service chỉ thực hiện gán mật khẩu mới và save()
 * - Account model có pre('save') để hash
 */
exports.changePassword = async (acc_id, newPassword) => {
  try {
    const account = await Account.findById(acc_id);
    if (!account) throw new Error("Không tìm thấy tài khoản.");

    account.password = newPassword;

    // (tuỳ chọn) nếu có field passwordChangedAt thì cập nhật
    if ("passwordChangedAt" in account) {
      account.passwordChangedAt = new Date();
    }

    await account.save(); // pre-save sẽ hash
    return true;
  } catch (error) {
    throw new Error("Đổi mật khẩu thất bại: " + error.message);
  }
};

/**
 * Gửi chứng chỉ hành nghề (tạo bản ghi License ở trạng thái PENDING)
 */
exports.uploadLicense = async (accountId, payload) => {
  const user = await User.findOne({ account_id: accountId });
  if (!user) throw new Error("Không tìm thấy người dùng của tài khoản này");

  const doctor = await Doctor.findOne({ user_id: user._id });
  if (!doctor) throw new Error("Không tìm thấy hồ sơ bác sĩ");

  const { licenseNumber, issued_by, issued_date, expiry_date, document_url } =
    payload || {};

  const license = await License.create({
    licenseNumber,
    issued_by,
    issued_date,
    expiry_date,
    document_url,
    rejected_reason: "",
    doctor_id: doctor._id,
    status: "PENDING",
  });

  return license;
};

/**
 * Lấy danh sách chứng chỉ của bác sĩ
 */
exports.getMyLicense = async (accountId) => {
  const user = await User.findOne({ account_id: accountId });
  if (!user) throw new Error("Không tìm thấy người dùng của tài khoản này");

  const doctor = await Doctor.findOne({ user_id: user._id });
  if (!doctor) throw new Error("Không tìm thấy hồ sơ bác sĩ");

  const licenses = await License.find({ doctor_id: doctor._id }).lean();
  return licenses;
};

// Đăng ký lịch nghỉ cho bác sĩ
exports.registerAbsence = async (accountId, payload) => {

  try {
    const { startTime, endTime, reason } = payload;
    const start = new Date(startTime);
    const end = new Date(endTime);

    // 1. Xác định bác sĩ từ accountId
    const user = await User.findOne({ account_id: accountId });
    if (!user) throw new Error("User không tồn tại");
    
    const doctor = await Doctor.findOne({ user_id: user._id });
    if (!doctor) throw new Error("Hồ sơ bác sĩ không tồn tại");

    // 2. Validate thời gian
    if (start >= end) {
      throw new Error("Thời gian kết thúc phải sau thời gian bắt đầu");
    }
    if (start < new Date()) {
      throw new Error("Không thể đăng ký nghỉ trong quá khứ");
    }
    
    const conflictingAppointments = await Appointment.find({
      doctor_id: doctor._id,
      status: { $in: ["SCHEDULED", "APPROVE"] }, // Chỉ hủy các lịch chưa hoàn thành
      appointment_date: { 
        $gte: start, 
        $lte: end 
      }
    });

    // 4. Hủy các lịch hẹn đó
    const appointmentIds = conflictingAppointments.map(app => app._id);
    
    if (appointmentIds.length > 0) {
      await Appointment.updateMany(
        { _id: { $in: appointmentIds } },
        { 
          $set: { 
            status: "DOCTOR_CANCELLED", // Trạng thái riêng để biết do bác sĩ hủy
            cancellation_reason: `Bác sĩ nghỉ đột xuất: ${reason}` 
          } 
        }
      );
      
      // TODO: Tại đây bạn có thể bắn event để gửi Email/Notification cho danh sách bệnh nhân
      // sendCancellationNotifications(conflictingAppointments, reason);
    }

    // 5. Tạo bản ghi nghỉ phép
    const newAbsence = await Absence.create({
      doctor_id: doctor._id,
      start_time: start,
      end_time: end,
      reason: reason,
      cancelled_appointments_count: appointmentIds.length
    });


    return {
      ok: true,
      message: `Đăng ký nghỉ thành công. Đã hủy ${appointmentIds.length} lịch hẹn trùng.`,
      data: newAbsence[0]
    };

  } catch (error) {
    console.error("Lỗi khi đăng ký nghỉ:", error);
    throw error; // Ném lỗi để controller bắt
  }
};

// Lấy danh sách lịch nghỉ của bác sĩ
exports.getMyAbsences = async (accountId) => {
  try {
    const user = await User.findOne({ account_id: accountId });
    if (!user) throw new Error("User không tồn tại");
    
    const doctor = await Doctor.findOne({ user_id: user._id });
    if (!doctor) throw new Error("Hồ sơ bác sĩ không tồn tại");

    const absences = await Absence.find({ doctor_id: doctor._id })
      .sort({ startTime: -1 }) // Mới nhất lên đầu
      .lean();

    return { ok: true, data: absences };
  } catch (error) {
    console.error("Lỗi lấy lịch nghỉ:", error);
    throw error;
  }
};
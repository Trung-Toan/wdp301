const Doctor = require("../../model/doctor/Doctor");
const userService = require("../user/user.service");
const appointmentService = require("../appointment/appointment.service");
const patientService = require("../patient/patient.service");
const License = require("../../model/clinic/License");
const User = require("../../model/user/User");
const Account = require("../../model/auth/Account");
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
    if (!doctor) throw new Error("Truy cập bị từ chối: Không tìm thấy bác sĩ.");

    return await patientService.getPatientAvailableOfDoctor(
      doctor._id,
      parseInt(page),
      parseInt(limit),
      search
    );
  } catch (error) {
    throw error;
  }
};

//lấy Profile bác sĩ
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

//chỉnh sửa profile
exports.updateProfile = async (accountId, data) => {
  const {
    title,
    degree,
    experience,
    description,
    gender,
    dob,
    address,
    avatar_url,
    username,
    email,
    phone_number,
  } = data;

  const user = await User.findOne({ account_id: accountId });
  if (!user) throw new Error("Không tìm thấy người dùng của tài khoản này");

  const doctor = await Doctor.findOne({ user_id: user._id });
  if (!doctor) throw new Error("Không tìm thấy hồ sơ bác sĩ");

  if (title !== undefined) doctor.title = title;
  if (degree !== undefined) doctor.degree = degree;
  if (experience !== undefined) doctor.experience = experience;
  if (description !== undefined) doctor.description = description;
  await doctor.save();

  await User.findByIdAndUpdate(
    doctor.user_id,
    {
      ...(gender && { gender }),
      ...(dob && { dob }),
      ...(address && { address }),
      ...(avatar_url && { avatar_url }),
    },
    { new: true }
  );

  await Account.findByIdAndUpdate(
    accountId,
    {
      ...(username && { username }),
      ...(email && { email }),
      ...(phone_number && { phone_number }),
    },
    { new: true }
  );

  const updatedDoctor = await Doctor.findById(doctor._id)
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

  return updatedDoctor;
};

//gửi chứng chỉ
exports.uploadLicense = async (userId, payload) => {
  const doctor = await Doctor.findOne({ user_id: userId });
  if (!doctor) throw new Error("Không tìm thấy hồ sơ bác sĩ");

  const { licenseNumber, issued_by, issued_date, expiry_date, document_url } =
    payload;

  const license = await License.create({
    licenseNumber,
    issued_by,
    issued_date,
    expiry_date,
    document_url,
    doctor_id: doctor._id,
    status: "PENDING",
  });

  return license;
};

//lấy chứng chỉ bác sĩ
exports.getMyLicense = async (userId) => {
  const doctor = await Doctor.findOne({ user_id: userId });
  if (!doctor) throw new Error("Không tìm thấy hồ sơ bác sĩ");

  const licenses = await License.find({ doctor_id: doctor._id }).lean();
  return licenses;
};

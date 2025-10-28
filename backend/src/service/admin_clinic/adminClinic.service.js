const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Account = require("../../model/auth/Account");
const User = require("../../model/user/User");
const Doctor = require("../../model/doctor/Doctor");
const AdminClinic = require("../../model/user/AdminClinic");
const Clinic = require("../../model/clinic/Clinic");

const SALT_ROUNDS = 12;

const hashPassword = async (s) => bcrypt.hash(s, SALT_ROUNDS);

//tạo bác sĩ
exports.createDoctor = async (payload) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      username,
      password,
      phone_number,
      full_name,
      clinic_id,
      specialty_id,
    } = payload;

    //Tạo tài khoản
    const hashedPassword = await hashPassword(password);
    const acc = await Account.create(
      [
        {
          username: username.trim(),
          email: `doc-${username}@example.com`,
          phone_number: phone_number?.trim(),
          password: hashedPassword,
          role: "DOCTOR",
          status: "ACTIVE",
          email_verified: false,
        },
      ],
      { session }
    );

    //Tạo User (liên kết Account)
    const user = await User.create(
      [
        {
          full_name,
          dob: null,
          gender: null,
          address: "",
          account_id: acc[0]._id,
        },
      ],
      { session }
    );

    //Tạo Doctor (liên kết User)
    const doctor = await Doctor.create(
      [
        {
          title: "",
          degree: "",
          description: "",
          experience: "",
          clinic_id,
          specialty_id,
          user_id: user[0]._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return {
      ok: true,
      message: "Tạo bác sĩ thành công",
      data: {
        account: acc[0],
        user: user[0],
        doctor: doctor[0],
      },
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Lỗi khi tạo bác sĩ:", error);
    return {
      ok: false,
      message: "Không thể tạo bác sĩ: " + error.message,
    };
  }
};

//Lấy clinic mà admin clinic hiện tại quản lý
exports.getClinicByAdmin = async (accountId) => {
  try {
    const user = await User.findOne({ account_id: accountId });
    if (!user)
      throw new Error("Không tìm thấy user tương ứng với account này.");

    const adminClinic = await AdminClinic.findOne({ user_id: user._id });
    if (!adminClinic)
      throw new Error("Không tìm thấy admin clinic tương ứng với user này.");

    const clinic = await Clinic.findOne({ created_by: adminClinic._id });
    if (!clinic) throw new Error("Admin clinic này chưa có phòng khám nào.");

    if (clinic.status !== "ACTIVE")
      throw new Error("Phòng khám này chưa đăng ký.");

    return { ok: true, data: clinic };
  } catch (error) {
    console.error("Lỗi khi lấy clinic của admin:", error);
    return { ok: false, message: error.message };
  }
};

//lấy danh sách bác sĩ theo clinic mà admin_clinic đang quản lý
exports.getDoctorsByAdminClinic = async (adminAccountId) => {
  try {
    //Lấy user tương ứng với account id
    const user = await User.findOne({ account_id: adminAccountId });
    if (!user) throw new Error("Không tìm thấy user của admin clinic");

    //Tìm bản ghi AdminClinic tương ứng
    const adminClinic = await AdminClinic.findOne({ user_id: user._id });
    if (!adminClinic) throw new Error("Không tìm thấy admin clinic");

    //Lấy clinic do admin clinic này tạo
    const clinics = await Clinic.find({ created_by: adminClinic._id });
    if (!clinics.length) return [];

    const clinicIds = clinics.map((c) => c._id);

    //Lấy danh sách bác sĩ thuộc các clinic đó
    const doctors = await Doctor.find({ clinic_id: { $in: clinicIds } })
      .populate({
        path: "user_id",
        populate: { path: "account_id", model: "Account" },
      })
      .populate("specialty_id")
      .populate("clinic_id");

    return doctors;
  } catch (err) {
    console.error("Lỗi trong getDoctorsByAdminClinic:", err);
    throw err;
  }
};

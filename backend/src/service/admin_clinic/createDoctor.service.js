const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Account = require("../../model/auth/Account");
const User = require("../../model/user/User");
const Doctor = require("../../model/doctor/Doctor");

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
          email: "",
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

const { default: mongoose } = require("mongoose");
const Doctor = require("../../model/doctor/Doctor");
const User = require("../../model/user/User");
const Account = require("../../model/auth/Account");

exports.findAccountByDoctorId = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw new Error("Doctor not found");

  const user = await User.findById(doctor.user_id);
    if (!user) throw new Error("User not found");

  const account = await Account.findById(user.account_id);
  return account || null;
};

exports.deleteDoctorById = async (doctorId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let account = await this.findAccountByDoctorId(doctorId);
        account.status = "INACTIVE";
        const saved = await account.save({ session });
        await session.commitTransaction();
        session.endSession();
        return saved;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
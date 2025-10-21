const User = require("../../model/user/User");
const Patient = require('../../model/patient/Patient');

exports.findUserByAccountId = async (accountId) => {
  try {
    const user = await User.findOne({ account_id: accountId }).populate('account_id', '_id role');
    const fomatUser = {
      _id: user._id,
      full_name: user.full_name,
      dob: user.dob,
      gender: user.gender,
      address: user.address,
      avatar_url: user.avatar_url,
      account_id: {
        _id: user.account_id._id,
        role: user.account_id.role
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
    return fomatUser;
  } catch (error) {
    console.error("Lỗi khi tìm user bằng account_id:", error);
    return null;
  }
}

exports.getUsersFromPatientIds = async (patientIds) => {
  if (!patientIds || patientIds.length === 0) {
    return [];
  }

  try {
    // Lấy danh sách bệnh nhân và user_id tương ứng
    const patients = await Patient.find({ _id: { $in: patientIds } })
      .select('_id patient_code user_id')
      .populate({
        path: 'user_id',
        select: "_id full_name account_id",
        populate: {
          path: 'account_id',
          select: '_id email email phone_number'
        }
      })
      .lean();

    const patient = patients.map(p => ({
      patient_id: p._id,
      user_id: p.user_id._id,
      account_id: p.user_id.account_id._id,
      patient_code: p.patient_code,
      full_name: p.user_id.full_name,
      email: p.user_id.account_id.email,
      phone_number: p.user_id.account_id.phone_number,
    }));

    return patient;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách user từ patientIds:", error);
    return [];
  }
};

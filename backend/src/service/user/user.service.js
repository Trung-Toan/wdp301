const User = require("../../model/user/User");
const Patient = require('../../model/patient/Patient');

exports.findUserByAccountId = async (accountId) => {
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
}

/**
 * Từ danh sách ID bệnh nhân, truy vấn và trả về danh sách document User tương ứng.
 * Mỗi document User sẽ được bổ sung thêm trường `patient_id`.
 * @param {Array<mongoose.Types.ObjectId>} patientIds Mảng chứa ID của các bệnh nhân.
 * @returns {Promise<Array<User>>} Mảng chứa các document User đã được bổ sung.
 */
exports.getUsersFromPatientIds = async (patientIds) => {
  if (!patientIds || patientIds.length === 0) {
    return [];
  }

  // Lấy danh sách bệnh nhân và user_id tương ứng
  const patients = await Patient.find({ _id: { $in: patientIds } })
    .select('_id user_id')
    .lean();

  // Map bệnh nhân thành cặp { patient_id, user_id }
  const patientMap = new Map(patients.map(p => [p.user_id.toString(), p._id]));

  // Lấy danh sách user_id
  const userIds = patients.map(p => p.user_id);

  // Lấy danh sách user tương ứng
  const users = await User.find({ _id: { $in: userIds } }).lean();

  // Gắn thêm trường patient_id vào từng user
  const usersWithPatientId = users.map(user => ({
    ...user,
    id: patientMap.get(user._id.toString()) || null,
    user_id: user._id
  }));

  return usersWithPatientId;
};

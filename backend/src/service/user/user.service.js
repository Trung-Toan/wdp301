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

exports.getUsersFromPatientIds = async (patientIds) => {
  if (!patientIds || patientIds.length === 0) {
    return [];
  }

  const patients = await Patient.find({ _id: { $in: patientIds } })
    .select('_id user_id')
    .lean();

  const patientMap = new Map(patients.map(p => [p.user_id.toString(), p._id]));

  const userIds = patients.map(p => p.user_id);

  const users = await User.find({ _id: { $in: userIds } }).lean();

  const usersWithPatientId = users.map(user => ({
    ...user,
    id: patientMap.get(user._id.toString()) || null,
    user_id: user._id
  }));

  return usersWithPatientId;
};

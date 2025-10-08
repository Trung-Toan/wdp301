const User = require("../../model/user/User");
const Account = require("../../model/auth/Account");

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
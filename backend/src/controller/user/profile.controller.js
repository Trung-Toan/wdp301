const User = require("../../model/user/User");
const Account = require("../../model/auth/Account");

function ok(res, data, status = 200) { return res.status(status).json({ success: true, data }); }
function fail(res, err, status = 500) { return res.status(status).json({ success: false, error: err?.message || String(err) }); }

exports.getMyProfile = async (req, res) => {
    try {
        const accountId = req.user?.sub;
        if (!accountId) return fail(res, new Error("Unauthorized"), 401);

        const user = await User.findOne({ account_id: accountId })
            .populate("account_id", "username email status role")
            .lean();

        if (!user) return fail(res, new Error("User not found"), 404);

        return ok(res, {
            id: user._id,
            full_name: user.full_name,
            dob: user.dob,
            gender: user.gender,
            address: user.address,
            avatar_url: user.avatar_url || "https://i.pravatar.cc/150?img=12", // ảnh mặc định
            account: user.account_id,
            notify_upcoming: user.notify_upcoming,
            notify_results: user.notify_results,
            notify_marketing: user.notify_marketing,
            privacy_allow_doctor_view: user.privacy_allow_doctor_view,
            privacy_share_with_providers: user.privacy_share_with_providers,
        });
    } catch (err) {
        return fail(res, err);
    }
};



exports.updateMyProfile = async (req, res) => {
    try {
        const accountId = req.user?.sub;
        if (!accountId) return fail(res, new Error("Unauthorized"), 401);

        let { full_name, email, phone, dob, gender, address, avatar_url } = req.body || {};

        const userSet = {};
        if (full_name !== undefined) userSet.full_name = full_name;
        if (dob !== undefined) userSet.dob = dob;
        if (gender !== undefined) userSet.gender = gender;
        if (address !== undefined) userSet.address = address;
        if (avatar_url !== undefined) userSet.avatar_url = avatar_url;

        const user = await User.findOneAndUpdate(
            { account_id: accountId },
            Object.keys(userSet).length ? { $set: userSet } : {},
            { new: true }
        ).lean();

        if (!user) return fail(res, new Error("User not found"), 404);

        const accountSet = {};
        if (phone !== undefined) {
            const normalizedPhone = String(phone).trim();
            if (normalizedPhone.length > 0) {
                const dupPhone = await Account.exists({
                    _id: { $ne: accountId },
                    phone_number: normalizedPhone,
                });
                if (dupPhone) {
                    return fail(res, new Error("Số điện thoại đã được sử dụng bởi tài khoản khác."), 409);
                }
                accountSet.phone_number = normalizedPhone;
            } else {
            }
        }

        if (email !== undefined) {
            const normalizedEmail = String(email).trim().toLowerCase();
            if (normalizedEmail.length > 0) {
                const dupEmail = await Account.exists({
                    _id: { $ne: accountId },
                    email: normalizedEmail,
                });
                if (dupEmail) {
                    return fail(res, new Error("Email đã được sử dụng bởi tài khoản khác."), 409);
                }
                accountSet.email = normalizedEmail;
            }
        }

        if (Object.keys(accountSet).length) {
            await Account.findByIdAndUpdate(accountId, { $set: accountSet }, { new: true });
        }

        return ok(res, user);
    } catch (err) {
        if (err?.code === 11000) {
            const field = Object.keys(err?.keyPattern || {})[0] || "field";
            return fail(res, new Error(`${field} đã tồn tại.`), 409);
        }
        return fail(res, err);
    }
};


exports.updateSettings = async (req, res) => {
    try {
        const accountId = req.user?.sub;
        if (!accountId) return fail(res, new Error("Unauthorized"), 401);
        const {
            notify_upcoming,
            notify_results,
            notify_marketing,
            privacy_allow_doctor_view,
            privacy_share_with_providers,
        } = req.body || {};

        const user = await User.findOneAndUpdate(
            { account_id: accountId },
            {
                $set: {
                    ...(notify_upcoming !== undefined ? { notify_upcoming } : {}),
                    ...(notify_results !== undefined ? { notify_results } : {}),
                    ...(notify_marketing !== undefined ? { notify_marketing } : {}),
                    ...(privacy_allow_doctor_view !== undefined ? { privacy_allow_doctor_view } : {}),
                    ...(privacy_share_with_providers !== undefined ? { privacy_share_with_providers } : {}),
                },
            },
            { new: true }
        ).lean();

        return ok(res, user);
    } catch (err) { return fail(res, err); }
};



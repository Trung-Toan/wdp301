const User = require("../../model/user/User");
const Account = require("../../model/auth/Account");
const Patient = require("../../model/patient/Patient");

function ok(res, data, status = 200) { return res.status(status).json({ success: true, data }); }
function fail(res, err, status = 500) { return res.status(status).json({ success: false, error: err?.message || String(err) }); }

exports.getMyProfile = async (req, res) => {
    try {
        const accountId = req.user?.sub;

        if (!accountId) return fail(res, new Error("Unauthorized"), 401);

        const user = await User.findOne({ account_id: accountId })
            .populate("account_id", "username email status role")
            .populate("patients", "province_code ward_code") // virtual
            .lean({ virtuals: true }); // cần virtuals:true để có patients

        if (!user) return fail(res, new Error("User not found"), 404);

        return ok(res, {
            id: user._id,
            full_name: user.full_name,
            dob: user.dob,
            gender: user.gender,
            address: user.address,
            avatar_url: user.avatar_url || "https://i.pravatar.cc/150?img=12",
            account: user.account_id,
            notify_upcoming: user.notify_upcoming,
            notify_results: user.notify_results,
            notify_marketing: user.notify_marketing,
            privacy_allow_doctor_view: user.privacy_allow_doctor_view,
            privacy_share_with_providers: user.privacy_share_with_providers,
            province_code: user.patients?.province_code || null,
            ward_code: user.patients?.ward_code || null,
        });

    } catch (err) {
        return fail(res, err);
    }
};

exports.updateMyProfile = async (req, res) => {
    try {
        const accountId = req.user?.sub;
        if (!accountId) return fail(res, new Error("Unauthorized"), 401);

        const {
            full_name,
            email,
            phone,
            dob,
            gender,
            address,
            avatar_url,
            province_code,
            ward_code,
            blood_type,
            allergies,
            chronic_diseases,
            medications,
            surgery_history,
        } = req.body || {};

        // --- Update User table ---
        const userSet = {};
        if (full_name !== undefined) userSet.full_name = full_name;
        if (dob !== undefined) userSet.dob = dob;
        if (gender !== undefined) userSet.gender = gender;
        if (address !== undefined) userSet.address = address;
        if (avatar_url !== undefined) userSet.avatar_url = avatar_url;

        const user = await User.findOneAndUpdate(
            { account_id: accountId },
            { $set: userSet },
            { new: true }
        ).lean();

        if (!user) return fail(res, new Error("Không tìm thấy người dùng."), 404);

        const userId = user._id;

        // --- Update Account table (email, phone) ---
        const accountSet = {};

        // Check phone duplication
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
            }
        }

        // Check email duplication
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
            await Account.findByIdAndUpdate(accountId, { $set: accountSet });
        }

        // ---Update Patient table ---
        const patientSet = {};
        if (province_code !== undefined) patientSet.province_code = province_code;
        if (ward_code !== undefined) patientSet.ward_code = ward_code;
        if (blood_type !== undefined) patientSet.blood_type = blood_type;
        if (allergies !== undefined) patientSet.allergies = allergies;
        if (chronic_diseases !== undefined) patientSet.chronic_diseases = chronic_diseases;
        if (medications !== undefined) patientSet.medications = medications;
        if (surgery_history !== undefined) patientSet.surgery_history = surgery_history;

        if (Object.keys(patientSet).length) {
            await Patient.findOneAndUpdate({ user_id: userId }, { $set: patientSet });
        }

        // --- Lấy lại dữ liệu đầy đủ sau khi update ---
        const updatedUser = await User.findById(userId)
            .populate("patients")
            .populate("account_id", "email phone_number role")
            .lean();

        return ok(res, updatedUser);
    } catch (err) {
        if (err?.code === 11000) {
            const field = Object.keys(err?.keyPattern || {})[0] || "field";
            return fail(res, new Error(`${field} đã tồn tại.`), 409);
        }
        console.error("updateMyProfile error:", err);
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



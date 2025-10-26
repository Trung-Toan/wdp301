const svc = require('../../service/auth/auth.service');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/env');
const bcrypt = require('bcryptjs');
const { verifyGoogleIdToken } = require('../../utils/verify-google');
const { loginWithGoogle } = require('../../service/auth/google.service');
const User = require('../../model/user/User');
const Patient = require('../../model/patient/Patient');
const AdminClinic = require('../../model/user/AdminClinic');
const Account = require('../../model/auth/Account');


exports.googleLogin = async (req, res) => {
    try {
        const { id_token } = req.body;
        // Log để debug
        console.log('Google Login Debug:', {
            hasIdToken: !!id_token,
            idTokenLength: id_token?.length,
            idTokenStart: id_token?.substring(0, 50) + '...'
        });

        const profile = await verifyGoogleIdToken(id_token);
        console.log('Google Profile verified:', {
            sub: profile.sub,
            email: profile.email,
            email_verified: profile.email_verified,
            name: profile.name
        });

        const { account, tokens } = await loginWithGoogle({
            googleProfile: profile,
            ua: req.headers['user-agent'] || '',
            ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip,
        });

        // account ở đây có _id theo contract ở function trên
        res.json({
            ok: true,
            account: { id: account._id, email: account.email, role: account.role, email_verified: account.email_verified },
            tokens,
        });
    } catch (e) {
        console.error('Google Login Error:', {
            message: e.message,
            stack: e.stack,
            name: e.name
        });
        res.status(400).json({
            ok: false,
            message: 'Google login thất bại',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

exports.registerPatients = async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            confirmPassword,
            phone_number,
            role,
            fullName,
            dob,
            gender,
            address,
            province_code,
            ward_code,
        } = req.body;

        // Kiểm tra xác nhận mật khẩu
        if (password !== confirmPassword) {
            return res.status(400).json({ ok: false, message: "Mật khẩu xác nhận không khớp" });
        }

        // Validate role
        const userRole = role || "PATIENT";
        if (!["PATIENT", "ADMIN_CLINIC"].includes(userRole)) {
            return res.status(400).json({ ok: false, message: "Loại tài khoản không hợp lệ" });
        }

        let account, user, additionalData;

        if (userRole === "PATIENT") {
            // Đăng ký bệnh nhân
            account = await svc.registerPatients({
                username,
                email,
                password,
                phone_number,
                role: userRole,
            });

            // Tạo bản ghi user liên kết với account_id
            user = await User.create({
                full_name: fullName,
                dob,
                gender,
                address,
                account_id: account._id,
            });

            // Tạo bản ghi bệnh nhân (Patient) liên kết với user_id
            const patient = new Patient({
                user_id: user._id,
                province_code: province_code || null,
                ward_code: ward_code || null,
                blood_type: null,
                allergies: [],
                chronic_diseases: [],
                medications: [],
                surgery_history: [],
            });

            // Middleware pre("save") sẽ tự sinh patient_code
            await patient.save();
            additionalData = { patient };

        } else if (userRole === "ADMIN_CLINIC") {
            // Đăng ký chủ phòng khám
            account = await svc.registerClinicOwner({
                username,
                email,
                password,
                phone_number,
                role: userRole,
            });

            // Tạo bản ghi user liên kết với account_id
            user = await User.create({
                full_name: fullName,
                dob,
                gender,
                address,
                account_id: account._id,
            });

            // Tạo bản ghi AdminClinic liên kết với user_id
            const adminClinic = await AdminClinic.create({
                user_id: user._id,
            });
            additionalData = { adminClinic };
        }

        // Trả kết quả về cho FE
        res.json({
            ok: true,
            message: userRole === "PATIENT"
                ? "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản."
                : "Đăng ký thành công! Tài khoản của bạn đang chờ phê duyệt. Vui lòng kiểm tra email để xác minh tài khoản.",
            data: {
                account,
                user,
                ...additionalData,
            },
        });
    } catch (e) {
        console.error("Lỗi đăng ký:", e);
        res.status(400).json({ ok: false, message: e.message });
    }
};


exports.verifyEmail = async (req, res) => {
    try {
        const token = req.body?.token || req.query?.token;
        const accountId = req.body?.account_id || req.query?.account;

        const data = await svc.verifyEmail({ token, accountId });
        return res.json({ ok: true, ...data });
    } catch (e) {
        return res.status(400).json({ ok: false, message: e.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const ip =
            req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.ip ||
            req.connection?.remoteAddress ||
            '';
        const user_agent = req.headers['user-agent'] || '';

        const data = await svc.login({ email, password, ip, user_agent });
        res.json({ ok: true, ...data });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const ip =
            req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.ip ||
            req.connection?.remoteAddress ||
            '';
        const user_agent = req.headers['user-agent'] || '';

        const data = await svc.refresh({ refreshToken, ip, user_agent });
        res.json({ ok: true, ...data });
    } catch (e) {
        res.status(401).json({ ok: false, message: e.message });
    }
};

exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const data = await svc.logout({ refreshToken });
        res.json({ ok: true, ...data });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.requestVerifyEmail = async (req, res) => {
    try {
        const accountId = req.user.sub;
        const data = await svc.requestVerifyEmail({ accountId });
        res.json({ ok: true, ...data });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const data = await svc.requestPasswordReset({ email });
        res.json({ ok: true, ...data });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const data = await svc.resetPassword({ token, newPassword });
        res.json({ ok: true, ...data });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const accountId = req.user?.sub;
        if (!accountId) return res.status(401).json({ ok: false, message: "Unauthorized" });

        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword)
            return res.status(400).json({ ok: false, message: "Missing fields" });

        const account = await Account.findById(accountId).select('+password');
        if (!account) return res.status(404).json({ ok: false, message: "Account not found" });

        const isMatch = await bcrypt.compare(currentPassword, account.password);
        if (!isMatch) return res.status(400).json({ ok: false, message: "Mật khẩu hiện tại không đúng" });

        const salt = await bcrypt.genSalt(10);
        account.password = await bcrypt.hash(newPassword, salt);
        await account.save();

        res.json({ ok: true, message: "Mật khẩu đã được thay đổi thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, message: "Server error" });
    }
};


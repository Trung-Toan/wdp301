const svc = require('../../service/auth/auth.service');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/env');
const bcrypt = require('bcryptjs');
const { verifyGoogleIdToken } = require('../../utils/verify-google');
const { loginWithGoogle } = require('../../service/auth/google.service');
const User = require('../../model/user/User');
const Patient = require('../../model/patient/Patient');
const Relative = require('../../model/patient/Relative');
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

        const { account, user, patient, tokens } = await loginWithGoogle({
            googleProfile: profile,
            ua: req.headers['user-agent'] || '',
            ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip,
        });

        // account ở đây có _id theo contract ở function trên
        res.json({
            ok: true,
            account: { id: account._id, email: account.email, role: account.role, email_verified: account.email_verified },
            user,
            patient,
            tokens,
        });
    } catch (e) {
        console.error('Google Login Error:', {
            message: e.message,
            stack: e.stack,
            name: e.name
        });
        
        // Provide more specific error messages
        let errorMessage = 'Google login thất bại';
        let statusCode = 400;
        
        if (e.message.includes('Missing id_token')) {
            errorMessage = 'Thiếu thông tin xác thực từ Google';
        } else if (e.message.includes('Invalid Google token') || e.message.includes('Invalid issuer')) {
            errorMessage = 'Token xác thực Google không hợp lệ';
        } else if (e.message.includes('Client ID mismatch')) {
            errorMessage = 'Cấu hình Google OAuth không đúng. Vui lòng liên hệ quản trị viên.';
            statusCode = 500;
        } else if (e.message.includes('Token has expired')) {
            errorMessage = 'Token đã hết hạn. Vui lòng thử lại.';
        } else if (e.message.includes('Account is null')) {
            errorMessage = 'Không thể tạo tài khoản. Vui lòng thử lại.';
            statusCode = 500;
        }
        
        res.status(statusCode).json({
            ok: false,
            message: errorMessage,
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

            // Kiểm tra có Patient nào chưa có user_id và khớp phone/email không
            // (Trường hợp người thân đã có lịch khám, giờ mới tạo tài khoản)
            const existingPatient = await Patient.findOne({
                user_id: null, // Chưa có tài khoản
                $or: [
                    { phone: phone_number }, // Match qua phone
                    { email: email } // Hoặc email
                ]
            });

            let patient;
            if (existingPatient) {
                // Tìm thấy Patient chưa có user_id → Link với User mới
                existingPatient.user_id = user._id;
                existingPatient.phone = phone_number; // Cập nhật phone
                existingPatient.email = email; // Cập nhật email
                // Ưu tiên địa chỉ mới từ form đăng ký
                if (province_code) existingPatient.province_code = province_code;
                if (ward_code) existingPatient.ward_code = ward_code;
                await existingPatient.save();
                
                patient = existingPatient;
                
                // Cập nhật Relative nếu có (link với Patient này)
                // Tìm Relative có patient_id trùng với Patient này
                await Relative.updateMany(
                    { patient_id: existingPatient._id },
                    { 
                        $set: { 
                            // Không cập nhật user_id của Relative vì user_id là người sở hữu danh sách
                            // Chỉ cập nhật thông tin liên hệ nếu cần
                            phone: phone_number, // Cập nhật phone
                            email: email, // Cập nhật email
                            province_code: province_code || undefined,
                            ward_code: ward_code || undefined,
                            address: address || undefined
                        } 
                    }
                );
                
                console.log("✅ Linked existing Patient with User:", existingPatient._id, "patient_code:", existingPatient.patient_code);
            } else {
                // Không tìm thấy → Tạo Patient mới
                patient = new Patient({
                    user_id: user._id,
                    phone: phone_number, // Lưu phone
                    email: email, // Lưu email
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
                
                // Kiểm tra có Relative nào khớp không (trường hợp người thân đã được thêm vào danh sách)
                // Tìm Relative chưa có patient_id và khớp phone/email
                const matchingRelative = await Relative.findOne({
                    patient_id: null, // Chưa có Patient
                    $or: [
                        { phone: phone_number },
                        { email: email }
                    ]
                });
                
                if (matchingRelative) {
                    // Link Relative với Patient mới
                    // Lưu ý: Không cập nhật user_id của Relative vì user_id là người sở hữu danh sách
                    matchingRelative.patient_id = patient._id;
                    await matchingRelative.save();
                    
                    console.log("✅ Linked Relative with new Patient:", matchingRelative._id);
                }
            }
            
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
        const { email, username, password } = req.body;
        // Hỗ trợ cả email và username, ưu tiên email nếu có
        const usernameOrEmail = email || username;
        
        if (!usernameOrEmail) {
            return res.status(400).json({ ok: false, message: "Email hoặc username là bắt buộc" });
        }
        
        const ip =
            req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.ip ||
            req.connection?.remoteAddress ||
            '';
        const user_agent = req.headers['user-agent'] || '';

        const data = await svc.login({ usernameOrEmail, password, ip, user_agent });
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
        const { token, newPassword, accountId } = req.body;
        const data = await svc.resetPassword({ token, newPassword, accountId });
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


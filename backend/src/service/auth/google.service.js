const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const { normalizeEmail } = require('../../utils/normalizeEmail');
const { signAccessToken, signRefreshToken, hashToken } = require('../../utils/jwt');
const { REFRESH_EXPIRES_DAYS } = require('../../config/env');

const Account = require('../../model/auth/Account');
const Session = require('../../model/auth/Session');
const LoginAttempt = require('../../model/auth/LoginAttempt');
const AuthProviders = require('../../model/auth/AuthProviders');
const User = require('../../model/user/User');
const Patient = require('../../model/patient/Patient');

const fp = (s) => crypto.createHash('sha256').update(s).digest('hex');

async function generateUniqueUsername({ name, emailCanon }) {
    const baseFromName = String(name || '').toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const baseFromEmail = String(emailCanon || '').split('@')[0]
        .toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

    let base = baseFromName || baseFromEmail || 'user';
    if (!base.length) base = 'user';

    for (let i = 0; i < 10; i++) {
        const candidate = i === 0 ? base : `${base}_${Math.random().toString(36).slice(2, 8)}`;
        const exists = await Account.exists({ username: candidate });
        if (!exists) return candidate;
    }
    return `user_${new mongoose.Types.ObjectId().toString().slice(-6)}`;
}

async function randomHashedPassword() {
    const raw = crypto.randomBytes(24).toString('hex');
    return bcrypt.hash(raw, 12);
}

exports.loginWithGoogle = async ({ googleProfile, ua, ip }) => {
    const { sub: provider_user_id, email, email_verified, name } = googleProfile;

    const emailCanon = normalizeEmail(email || "");
    let acc = null;

    console.log('Starting Google login process:', {
        provider_user_id,
        email,
        emailCanon,
        name
    });

    let link = await AuthProviders.findOne({ provider: "google", provider_user_id }).lean();
    console.log('AuthProviders lookup result:', link);

    if (link) {
        acc = await Account.findById(link.account_id);
        console.log('Found existing account via AuthProviders:', acc ? acc._id : 'null');

        // If AuthProviders exists but Account doesn't, clean up the orphaned record
        if (!acc) {
            console.log('Orphaned AuthProviders record found, cleaning up...');
            await AuthProviders.deleteOne({ _id: link._id });
            link = null; // Reset link so we can proceed with normal account creation
        }
    }

    if (link && acc) {
        // Case 1: Đã có link Google với account -> Đăng nhập luôn
        console.log('✅ Using existing account via Google link:', acc._id);
        // Nếu tài khoản có rồi, cập nhật email_verified nếu cần
        if (!acc.email_verified && email_verified) {
            await Account.updateOne({ _id: acc._id }, { $set: { email_verified: true } });
            acc.email_verified = true;
        }
    } else {
        // Case 2: Chưa có link, kiểm tra email đã tồn tại chưa
        if (emailCanon) {
            acc = await Account.findOne({ email: emailCanon });
            console.log('🔍 Account lookup by email result:', acc ? acc._id : 'null');
        }

        if (acc) {
            // Case 2a: Email đã tồn tại -> Link Google account với account hiện có và đăng nhập
            console.log('✅ Email đã tồn tại, linking Google account với account hiện có:', acc._id);
            
            // Cập nhật email_verified nếu cần
            if (!acc.email_verified && email_verified) {
                await Account.updateOne({ _id: acc._id }, { $set: { email_verified: true } });
                acc.email_verified = true;
            }

            // Cập nhật thông tin user nếu thiếu (từ Google profile)
            const user = await User.findOne({ account_id: acc._id });
            if (user) {
                // Cập nhật full_name nếu chưa có hoặc là giá trị mặc định
                if ((!user.full_name || user.full_name === "Chưa cập nhật") && name) {
                    await User.updateOne(
                        { _id: user._id },
                        { $set: { full_name: name } }
                    );
                    console.log('✅ Updated user full_name from Google profile');
                }

                // Kiểm tra và tạo Patient nếu thiếu (cho các tài khoản cũ)
                if (acc.role === 'PATIENT') {
                    const existingPatient = await Patient.findOne({ user_id: user._id });
                    if (!existingPatient) {
                        console.log('Creating missing Patient record for existing account:', acc._id);
                        await Patient.create({
                            user_id: user._id,
                        });
                        console.log('✅ Patient record created successfully for existing account');
                    }
                }
            }

            // Tạo link Google với account hiện có (nếu chưa có)
            if (!link) {
                try {
                    await AuthProviders.create({
                        provider: "google",
                        provider_user_id,
                        email: email || undefined,
                        account_id: acc._id,
                    });
                    console.log('✅ AuthProviders link created successfully for existing account');
                } catch (err) {
                    console.error('Error creating AuthProviders record:', err);
                    if (err.code === 11000) {
                        // Duplicate key - link đã tồn tại, không sao
                        link = await AuthProviders.findOne({ provider: "google", provider_user_id });
                        console.log('⚠️  Duplicate AuthProviders record found (already linked):', link);
                    } else {
                        throw err;
                    }
                }
            }
        } else {
            // Case 2b: Email chưa tồn tại -> Tạo account mới
            if (!emailCanon) throw new Error("Google account has no email");

            console.log('🆕 Creating new account for email:', emailCanon);
            // Bọc toàn bộ quá trình tạo trong Transaction để đảm bảo đồng bộ
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                // Tạo account
                acc = await Account.create(
                    [
                        {
                            username: await generateUniqueUsername({ name, emailCanon }),
                            email: emailCanon,
                            password: await randomHashedPassword(),
                            role: "PATIENT",
                            status: "ACTIVE",
                            email_verified: !!email_verified,
                        },
                    ],
                    { session }
                );
                acc = acc[0];
                console.log('✅ Account created successfully:', acc._id);

                // Tạo user tương ứng
                const user = await User.create(
                    [
                        {
                            full_name: name || "Chưa cập nhật",
                            gender: "Khác",
                            account_id: acc._id,
                        },
                    ],
                    { session }
                );
                console.log('✅ User created successfully:', user[0]._id);

                // Tạo patient tương ứng
                await Patient.create(
                    [
                        {
                            user_id: user[0]._id,
                        },
                    ],
                    { session }
                );
                console.log('✅ Patient created successfully');

                // Tạo link Google với account mới
                await AuthProviders.create(
                    [
                        {
                            provider: "google",
                            provider_user_id,
                            email: email || undefined,
                            account_id: acc._id,
                        },
                    ],
                    { session }
                );
                console.log('✅ AuthProviders link created successfully for new account');

                // Commit transaction
                await session.commitTransaction();
                session.endSession();
            } catch (err) {
                console.error('❌ Error during account creation:', err);
                await session.abortTransaction();
                session.endSession();

                if (err.code === 11000) {
                    // Duplicate key - có thể account đã được tạo bởi request khác
                    acc = await Account.findOne({ email: emailCanon });
                    if (!acc) throw err;
                    
                    // Thử tạo link nếu chưa có
                    const existingLink = await AuthProviders.findOne({ 
                        provider: "google", 
                        provider_user_id 
                    });
                    if (!existingLink) {
                        await AuthProviders.create({
                            provider: "google",
                            provider_user_id,
                            email: email || undefined,
                            account_id: acc._id,
                        });
                    }
                } else {
                    throw err;
                }
            }
        }
    }

    console.log('Final account state before token generation:', {
        accountExists: !!acc,
        accountId: acc?._id,
        accountRole: acc?.role
    });

    if (!acc) {
        throw new Error('Account is null after processing. This should not happen.');
    }

    // Ghi log đăng nhập
    try {
        await LoginAttempt.create({
            ip,
            email: email || "",
            ok: true,
            reason: "google_login",
            account_id: acc?._id,
            user_agent: ua || "",
        });
        console.log('LoginAttempt record created successfully');
    } catch (e) {
        console.error("LoginAttempt.create failed", e);
    }

    // Token
    const jti = new mongoose.Types.ObjectId().toString();
    const accessToken = signAccessToken({ sub: acc._id.toString(), role: acc.role, jti });
    const refreshToken = signRefreshToken({ sub: acc._id.toString(), jti });

    const refresh_fingerprint = fp(refreshToken);
    const expiresAt = new Date(Date.now() + (REFRESH_EXPIRES_DAYS || 7) * 24 * 3600 * 1000);

    try {
        await Session.create({
            account_id: acc._id,
            refresh_token_hash: await hashToken(refreshToken),
            refresh_fingerprint,
            ip,
            user_agent: ua || "",
            expires_at: expiresAt,
        });
    } catch (e) {
        console.error("Session.create failed", e);
        throw new Error("Không thể tạo session. Vui lòng thử lại.");
    }

    // Thêm phần lấy thông tin user và patient (giống login)
    let user = null;
    let patient = null;

    user = await User.findOne({ account_id: acc._id })
        .select("full_name avatar_url dob gender address")
        .lean();

    console.log("🔍 GOOGLE LOGIN DEBUG - user found:", user);

    // Nếu là bệnh nhân, lấy thêm thông tin patient
    if (acc.role === "PATIENT" && user) {
        console.log("🔍 GOOGLE LOGIN DEBUG - searching for patient with user_id:", user._id);
        patient = await Patient.findOne({ user_id: user._id }).lean();
        console.log("🔍 GOOGLE LOGIN DEBUG - patient found:", patient);

        // Nếu không tìm thấy, thử tìm tất cả patients
        if (!patient) {
            const allPatients = await Patient.find({}).lean();
            console.log("🔍 GOOGLE LOGIN DEBUG - all patients in DB:", allPatients);
        }
    }

    return {
        account: {
            _id: acc._id,
            email: acc.email,
            role: acc.role,
            email_verified: acc.email_verified,
        },
        user,
        patient,
        tokens: { accessToken, refreshToken, refreshExpiresAt: expiresAt },
    };
};

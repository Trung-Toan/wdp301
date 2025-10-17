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

    let link = await AuthProviders.findOne({ provider: "google", provider_user_id }).lean();
    if (link) {
        acc = await Account.findById(link.account_id);
    } else {
        if (emailCanon) {
            acc = await Account.findOne({ email: emailCanon });
        }

        if (!acc) {
            if (!emailCanon) throw new Error("Google account has no email");

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

                // Tạo patient tương ứng
                await Patient.create(
                    [
                        {
                            user_id: user[0]._id,
                        },
                    ],
                    { session }
                );

                // Commit transaction
                await session.commitTransaction();
                session.endSession();
            } catch (err) {
                await session.abortTransaction();
                session.endSession();

                if (err.code === 11000) {
                    acc = await Account.findOne({ email: emailCanon });
                    if (!acc) throw err;
                } else {
                    throw err;
                }
            }
        } else {
            // Nếu tài khoản có rồi, cập nhật email_verified nếu cần
            if (!acc.email_verified && email_verified) {
                await Account.updateOne({ _id: acc._id }, { $set: { email_verified: true } });
                acc.email_verified = true;
            }
        }

        try {
            await AuthProviders.create({
                provider: "google",
                provider_user_id,
                email: email || undefined,
                account_id: acc._id,
            });
        } catch (err) {
            if (err.code === 11000) {
                link = await AuthProviders.findOne({ provider: "google", provider_user_id });
            } else {
                throw err;
            }
        }
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

    return {
        account: {
            _id: acc._id,
            email: acc.email,
            role: acc.role,
            email_verified: acc.email_verified,
        },
        tokens: { accessToken, refreshToken, refreshExpiresAt: expiresAt },
    };
};

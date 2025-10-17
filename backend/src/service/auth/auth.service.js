const Account = require('../../model/auth/Account');
const EmailVerification = require('../../model/auth/EmailVerification');
const PasswordReset = require('../../model/auth/PasswordReset');
const Session = require('../../model/auth/Session');
const LoginAttempt = require('../../model/auth/LoginAttempt');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const {
    JWT_SECRET,
    ACCESS_EXPIRES,
    REFRESH_EXPIRES_DAYS,
    REQUIRE_EMAIL_VERIFICATION,
    APP_BASE_URL,
} = require('../../config/env');

const {
    sendMail,
    buildVerifyEmailTemplate,
    buildResetPasswordTemplate,
} = require('./email.service');
const Patient = require('../../model/patient/Patient');
const User = require('../../model/user/User');

const SALT_ROUNDS = 12;
const randomToken = (bytes = 48) => crypto.randomBytes(bytes).toString('hex');
const hashPassword = (s) => bcrypt.hash(s, SALT_ROUNDS);
const comparePassword = (s, h) => bcrypt.compare(s, h);
const hashOpaque = (s) => bcrypt.hash(s, SALT_ROUNDS);
const compareOpaque = (s, h) => bcrypt.compare(s, h);
const addDays = (d, days) => { const x = new Date(d); x.setDate(x.getDate() + days); return x; };
const signAccessToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
const sanitizeAccount = (acc) => { const o = acc.toObject ? acc.toObject() : { ...acc }; delete o.password; return o; };
const fpRefresh = (token) => crypto.createHash('sha256').update(token).digest('hex');

exports.registerPatients = async ({ username, email, password, phone_number, role }) => {
    const emailNorm = (email || '').trim().toLowerCase();
    const hash = await hashPassword(password);

    const acc = await Account.create({
        username: username.trim(),
        email: emailNorm,
        phone_number: phone_number?.trim(),
        password: hash,
        role: role || 'PATIENT',
        status: 'ACTIVE',
        email_verified: false,
    });

    const token = randomToken(32);
    const tokenHash = await hashOpaque(token);

    await EmailVerification.create({
        token_hash: tokenHash,
        expires_at: addDays(new Date(), 1),
        used: false,
        account_id: acc._id,
    });

    const html = buildVerifyEmailTemplate({
        accountId: String(acc._id),
        token,
        apiBaseUrl: APP_BASE_URL,
    });

    await sendMail(acc.email, 'Xác minh email của bạn', html);

    return sanitizeAccount(acc);
};

exports.verifyEmail = async ({ token, accountId }) => {
    if (!token) throw new Error('Missing token');
    if (!accountId) throw new Error('Missing accountId');

    const recs = await EmailVerification.find({
        account_id: accountId,
        used: false,
        expires_at: { $gt: new Date() },
    })
        .sort({ _id: -1 })
        .limit(10);

    if (!recs.length) throw new Error('Verification not found');

    let matched = null;
    for (const r of recs) {
        const ok = await compareOpaque(token, r.token_hash);
        if (ok) { matched = r; break; }
    }
    if (!matched) throw new Error('Invalid token');

    await Account.findByIdAndUpdate(matched.account_id, { $set: { email_verified: true } });

    matched.used = true;
    matched.used_at = new Date();
    await matched.save();

    return { ok: true };
};


exports.login = async ({ email, password, ip, user_agent }) => {
    const emailNorm = (email || '').trim().toLowerCase();
    const acc = await Account.findOne({ email: emailNorm }).select('+password');

    if (!acc) {
        await LoginAttempt.create({ ip, email: emailNorm, ok: false, reason: 'not_found' });
        throw new Error('Email hoặc mật khẩu sai');
    }

    if (acc.status !== 'ACTIVE') {
        await LoginAttempt.create({ ip, email: emailNorm, account_id: acc._id, ok: false, reason: 'status_not_active' });
        throw new Error('Tài khoản chưa active');
    }

    const passOk = await comparePassword(password, acc.password);
    if (!passOk) {
        await LoginAttempt.create({ ip, email: emailNorm, account_id: acc._id, ok: false, reason: 'wrong_password' });
        throw new Error('Email hoặc mật khẩu sai');
    }

    // Đăng nhập thành công
    await LoginAttempt.create({
        ip,
        email: emailNorm,
        account_id: acc._id,
        ok: true,
        reason: acc.email_verified ? 'ok' : 'email_not_verified_but_login_allowed'
    });

    // Tạo access token
    const payload = { sub: String(acc._id), role: acc.role, email_verified: !!acc.email_verified };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });

    // Tạo refresh token
    const refreshToken = randomToken(48);
    const refreshHash = await hashOpaque(refreshToken);
    const refreshFingerprint = fpRefresh(refreshToken);
    const expiresAt = addDays(new Date(), REFRESH_EXPIRES_DAYS);

    await Session.create({
        account_id: acc._id,
        refresh_token_hash: refreshHash,
        refresh_fingerprint: refreshFingerprint,
        created_at: new Date(),
        expires_at: expiresAt,
        ip,
        user_agent,
    });

    let patient = null;
    if (acc.role === "PATIENT") {
        // Tìm user theo account_id
        const user = await User.findOne({ account_id: acc._id }).lean();

        if (user) {
            // Tìm patient theo user_id
            patient = await Patient.findOne({ user_id: user._id }).lean();
        }
    }


    // Trả về dữ liệu gồm cả account và patient
    return {
        ok: true,
        account: sanitizeAccount(acc),
        patient,
        tokens: {
            accessToken,
            refreshToken,
            refreshExpiresAt: expiresAt,
        },
        mustVerify: !acc.email_verified,
    };
};


exports.refresh = async ({ refreshToken, ip, user_agent }) => {
    if (!refreshToken) throw new Error('Missing refresh token');

    const fingerprint = fpRefresh(refreshToken);

    const session = await Session.findOne({
        refresh_fingerprint: fingerprint,
        revoked_at: { $exists: false },
    });

    if (!session) throw new Error('Session not found');

    const match = await compareOpaque(refreshToken, session.refresh_token_hash);
    if (!match) throw new Error('Invalid refresh token');
    if (session.expires_at <= new Date()) throw new Error('Refresh token expired');

    const acc = await Account.findById(session.account_id);
    if (!acc || acc.status !== 'ACTIVE') throw new Error('Account not active');

    session.revoked_at = new Date();
    session.revoked_reason = 'rotated';
    await session.save();

    const newRefresh = randomToken(48);
    const newRefreshHash = await hashOpaque(newRefresh);
    const newFingerprint = fpRefresh(newRefresh);
    const expiresAt = addDays(new Date(), REFRESH_EXPIRES_DAYS);

    await Session.create({
        account_id: acc._id,
        refresh_token_hash: newRefreshHash,
        refresh_fingerprint: newFingerprint,
        created_at: new Date(),
        expires_at: expiresAt,
        ip,
        user_agent,
    });

    const accessToken = signAccessToken({ sub: String(acc._id), role: acc.role });

    return {
        account: sanitizeAccount(acc),
        tokens: { accessToken, refreshToken: newRefresh, refreshExpiresAt: expiresAt },
    };
};

exports.logout = async ({ refreshToken }) => {
    if (!refreshToken) return { ok: true };

    const fingerprint = fpRefresh(refreshToken);

    const session = await Session.findOne({
        refresh_fingerprint: fingerprint,
        revoked_at: { $exists: false },
    });

    if (!session) return { ok: true };

    const match = await compareOpaque(refreshToken, session.refresh_token_hash);
    if (!match) return { ok: true };

    session.revoked_at = new Date();
    session.revoked_reason = 'logout';
    await session.save();

    return { ok: true };
};

exports.requestVerifyEmail = async ({ accountId }) => {
    const acc = await Account.findById(accountId);
    if (!acc) throw new Error('Account not found');
    if (acc.email_verified) return { ok: true };

    const token = randomToken(32);
    const tokenHash = await hashOpaque(token);

    await EmailVerification.create({
        token_hash: tokenHash,
        expires_at: addDays(new Date(), 1),
        used: false,
        account_id: acc._id,
    });

    const html = buildVerifyEmailTemplate({
        accountId: String(acc._id),
        token,
        apiBaseUrl: APP_BASE_URL,
    });

    await sendMail(acc.email, 'Verify your email', html);
    return { ok: true };
};

exports.requestPasswordReset = async ({ email }) => {
    const emailNorm = (email || '').trim().toLowerCase();
    const acc = await Account.findOne({ email: emailNorm });
    if (!acc) return { ok: true };

    const token = randomToken(32);
    const tokenHash = await hashOpaque(token);

    await PasswordReset.create({
        token_hash: tokenHash,
        expires_at: addDays(new Date(), 1),
        used: false,
        account_id: acc._id,
    });

    const html = buildResetPasswordTemplate(token, APP_BASE_URL);
    await sendMail(acc.email, 'Reset your password', html);

    return { ok: true };
};

exports.resetPassword = async ({ token, newPassword }) => {
    if (!token) throw new Error('Missing token');

    const rec = await PasswordReset.findOne({ used: false }).sort({ created_at: -1 });
    if (!rec) throw new Error('Reset request not found');

    const ok = await compareOpaque(token, rec.token_hash);
    if (!ok) throw new Error('Invalid token');
    if (rec.expires_at <= new Date()) throw new Error('Token expired');

    const newHash = await hashPassword(newPassword);
    await Account.findByIdAndUpdate(rec.account_id, { $set: { password: newHash } });

    await Session.updateMany(
        { account_id: rec.account_id, revoked_at: { $exists: false } },
        { $set: { revoked_at: new Date(), revoked_reason: 'password_reset' } }
    );

    rec.used = true;
    rec.used_at = new Date();
    await rec.save();

    return { ok: true };
};


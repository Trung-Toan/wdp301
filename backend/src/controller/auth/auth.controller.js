const svc = require('../../service/auth/auth.service');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/env');

const { verifyGoogleIdToken } = require('../../utils/verify-google');
const { loginWithGoogle } = require('../../service/auth/google.service');

exports.googleLogin = async (req, res) => {
    try {
        const { id_token } = req.body;
        const profile = await verifyGoogleIdToken(id_token);

        const { account, tokens } = await loginWithGoogle({
            googleProfile: profile,
            ua: req.headers['user-agent'] || '',
            ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip,
        });

        res.json({
            ok: true,
            account: { id: account._id, email: account.email, role: account.role, email_verified: account.email_verified },
            tokens,
        });
    } catch (e) {
        res.status(400).json({ ok: false, message: 'Google login thất bại: ' + e.message });
    }
};



exports.register = async (req, res) => {
    try {
        const { username, email, password, phone_number, role } = req.body;
        const account = await svc.register({ username, email, password, phone_number, role });
        res.json({ ok: true, account });
    } catch (e) {
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

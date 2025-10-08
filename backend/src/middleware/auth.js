const { verifyAccessToken } = require('../utils/jwt');
const Account = require('../model/auth/Account');
const { REQUIRE_EMAIL_VERIFICATION } = require('../config/env');

function authRequired(req, res, next) {
    try {
        const h = req.headers.authorization || '';
        const token = h.startsWith('Bearer ') ? h.slice(7) : null;
        if (!token) return res.status(401).json({ ok: false, message: 'Unauthorized' });

        req.user = verifyAccessToken(token); // { sub, role, email_verified, ... }
        next();
    } catch (e) {
        return res.status(401).json({ ok: false, message: 'Invalid or expired token' });
    }
}

function roleRequired(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ ok: false, message: 'Forbidden' });
        }
        next();
    };
}

/**
 * Middleware chặn user chưa verify email
 * - Nếu REQUIRE_EMAIL_VERIFICATION = false → bỏ qua
 * - Nếu token có claim email_verified thì check nhanh
 * - Nếu không có, fallback truy DB
 */
async function verifiedEmailRequired(req, res, next) {
    if (!REQUIRE_EMAIL_VERIFICATION) return next();
    if (!req.user) {
        return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }

    if (typeof req.user.email_verified === 'boolean') {
        if (req.user.email_verified) return next();
        return res.status(403).json({
            ok: false,
            code: 'EMAIL_NOT_VERIFIED',
            message: 'Please verify your email to continue.',
        });
    }

    try {
        const acc = await Account.findById(req.user.sub).select('email_verified');
        if (acc && acc.email_verified) return next();
        return res.status(403).json({
            ok: false,
            code: 'EMAIL_NOT_VERIFIED',
            message: 'Please verify your email to continue.',
        });
    } catch {
        return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }
}

module.exports = { authRequired, roleRequired, verifiedEmailRequired };

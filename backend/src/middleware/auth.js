const { verifyAccessToken } = require('../utils/jwt');
const Account = require('../model/auth/Account');
const { REQUIRE_EMAIL_VERIFICATION } = require('../config/env');

function authRequired(req, res, next) {
    try {
        const h = req.headers.authorization || '';
        console.log('Auth middleware - Authorization header:', h);

        // Handle both "Bearer token" and "Bearer Bearer token" cases
        let token = null;
        if (h.startsWith('Bearer ')) {
            token = h.slice(7); // Remove first "Bearer "
            // If token still starts with "Bearer ", remove it too (handle duplicate Bearer)
            if (token.startsWith('Bearer ')) {
                token = token.slice(7);
            }
        }

        console.log('Auth middleware - Extracted token:', token ? token.substring(0, 50) + '...' : 'null');

        if (!token) {
            console.log('Auth middleware - No token found');
            return res.status(401).json({ ok: false, message: 'Unauthorized' });
        }

        console.log('Auth middleware - Verifying token...');
        req.user = verifyAccessToken(token); // { sub, role, email_verified, ... }
        console.log('Auth middleware - Token verified successfully:', {
            sub: req.user.sub,
            role: req.user.role,
            email_verified: req.user.email_verified
        });
        next();
    } catch (e) {
        console.error('Auth middleware - Token verification failed:', {
            message: e.message,
            name: e.name
        });
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

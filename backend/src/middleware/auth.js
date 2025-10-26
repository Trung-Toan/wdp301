const { verifyAccessToken } = require('../utils/jwt');
const Account = require('../model/auth/Account');
const AdminClinic = require('../model/user/AdminClinic');
const AdminSystem = require('../model/user/AdminSystem');
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

/**
 * Middleware xác thực cho Admin Clinic
 * Kiểm tra token và lấy thông tin admin_clinic_id
 */
async function authenticateAdminClinic(req, res, next) {
    try {
        const h = req.headers.authorization || '';
        let token = null;

        if (h.startsWith('Bearer ')) {
            token = h.slice(7);
            if (token.startsWith('Bearer ')) {
                token = token.slice(7);
            }
        }

        if (!token) {
            return res.status(401).json({ ok: false, message: 'Unauthorized' });
        }

        req.user = verifyAccessToken(token);

        // Kiểm tra role
        if (req.user.role !== 'ADMIN_CLINIC') {
            return res.status(403).json({ ok: false, message: 'Forbidden - Admin Clinic access required' });
        }

        // Lấy admin_clinic_id từ database
        const adminClinic = await AdminClinic.findOne({ user_id: req.user.sub });
        if (!adminClinic) {
            return res.status(404).json({ ok: false, message: 'Admin Clinic not found' });
        }

        req.user.admin_clinic_id = adminClinic._id;
        next();
    } catch (e) {
        console.error('Admin Clinic auth middleware error:', e);
        return res.status(401).json({ ok: false, message: 'Invalid or expired token' });
    }
}

/**
 * Middleware xác thực cho Admin System
 * Kiểm tra token và lấy thông tin admin_system_id
 */
async function authenticateAdminSystem(req, res, next) {
    try {
        const h = req.headers.authorization || '';
        let token = null;

        if (h.startsWith('Bearer ')) {
            token = h.slice(7);
            if (token.startsWith('Bearer ')) {
                token = token.slice(7);
            }
        }

        if (!token) {
            return res.status(401).json({ ok: false, message: 'Unauthorized' });
        }

        req.user = verifyAccessToken(token);

        // Kiểm tra role
        if (req.user.role !== 'ADMIN_SYSTEM') {
            return res.status(403).json({ ok: false, message: 'Forbidden - Admin System access required' });
        }

        // Lấy admin_system_id từ database
        const adminSystem = await AdminSystem.findOne({ user_id: req.user.sub });
        if (!adminSystem) {
            return res.status(404).json({ ok: false, message: 'Admin System not found' });
        }

        req.user.admin_system_id = adminSystem._id;
        next();
    } catch (e) {
        console.error('Admin System auth middleware error:', e);
        return res.status(401).json({ ok: false, message: 'Invalid or expired token' });
    }
}

module.exports = {
    authRequired,
    roleRequired,
    verifiedEmailRequired,
    authenticateAdminClinic,
    authenticateAdminSystem
};

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { JWT_SECRET, ACCESS_EXPIRES, REFRESH_EXPIRES_DAYS } = require('../config/env');

function signAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
}

function signRefreshToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: `${REFRESH_EXPIRES_DAYS}d` });
}

function verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

function hashToken(token) {
    return bcrypt.hash(token, 12);
}

function compareToken(token, hash) {
    return bcrypt.compare(token, hash);
}

function fingerprint(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    hashToken,
    compareToken,
    fingerprint
};

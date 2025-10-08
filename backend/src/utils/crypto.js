const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

function randomToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
}

async function hashPassword(plain) {
    return bcrypt.hash(plain, SALT_ROUNDS);
}

async function comparePassword(plain, hash) {
    return bcrypt.compare(plain, hash);
}

async function hashOpaqueToken(token) {
    return bcrypt.hash(token, SALT_ROUNDS);
}

async function compareOpaqueToken(token, hash) {
    return bcrypt.compare(token, hash);
}

module.exports = {
    randomToken,
    hashPassword,
    comparePassword,
    hashOpaqueToken,
    compareOpaqueToken,
};

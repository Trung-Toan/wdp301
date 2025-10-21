require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client();

const ALLOWED_CLIENT_IDS = process.env.GOOGLE_CLIENT_IDS
    ? process.env.GOOGLE_CLIENT_IDS.split(',').map(s => s.trim()).filter(Boolean)
    : [process.env.GOOGLE_CLIENT_ID];

async function verifyGoogleIdToken(idToken) {
    if (!idToken) throw new Error('Missing id_token');

    const ticket = await client.verifyIdToken({
        idToken,
        audience: ALLOWED_CLIENT_IDS,
    });
    const payload = ticket.getPayload();

    if (!['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss)) {
        throw new Error('Invalid issuer');
    }
    return payload;
}

module.exports = { verifyGoogleIdToken, ALLOWED_CLIENT_IDS };

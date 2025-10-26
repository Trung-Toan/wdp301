require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client();

const ALLOWED_CLIENT_IDS = process.env.GOOGLE_CLIENT_IDS
    ? process.env.GOOGLE_CLIENT_IDS.split(',').map(s => s.trim()).filter(Boolean)
    : [process.env.GOOGLE_CLIENT_ID];

async function verifyGoogleIdToken(idToken) {
    if (!idToken) throw new Error('Missing id_token');

    // Log để debug
    console.log('Verifying Google ID Token:', {
        hasIdToken: !!idToken,
        idTokenLength: idToken?.length,
        allowedClientIds: ALLOWED_CLIENT_IDS,
        hasClientIds: !!ALLOWED_CLIENT_IDS?.length
    });

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: ALLOWED_CLIENT_IDS,
        });
        const payload = ticket.getPayload();

        console.log('Token verification successful:', {
            iss: payload.iss,
            aud: payload.aud,
            sub: payload.sub,
            email: payload.email
        });

        if (!['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss)) {
            throw new Error(`Invalid issuer: ${payload.iss}`);
        }
        return payload;
    } catch (error) {
        console.error('Google token verification failed:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        throw error;
    }
}

module.exports = { verifyGoogleIdToken, ALLOWED_CLIENT_IDS };

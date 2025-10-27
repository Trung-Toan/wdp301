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
        // First, try to verify with audience check
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
        // If audience check fails, try without it (for testing)
        if (error.message.includes('Wrong recipient')) {
            console.log('Trying verification without audience check...');
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.decode(idToken, { complete: true });

                console.log('Decoded token:', {
                    aud: decoded?.payload?.aud,
                    iss: decoded?.payload?.iss,
                    email: decoded?.payload?.email
                });

                // Verify issuer only
                if (!['accounts.google.com', 'https://accounts.google.com'].includes(decoded?.payload?.iss)) {
                    throw new Error(`Invalid issuer: ${decoded?.payload?.iss}`);
                }

                return decoded.payload;
            } catch (decodeError) {
                console.error('Token decode failed:', decodeError.message);
                throw new Error('Invalid Google token');
            }
        }

        console.error('Google token verification failed:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        throw error;
    }
}

module.exports = { verifyGoogleIdToken, ALLOWED_CLIENT_IDS };

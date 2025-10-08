require('dotenv').config();

const {
    MONGO_URI,
    PORT = 3000,
    JWT_SECRET,
    ACCESS_EXPIRES = '15m',
    REFRESH_EXPIRES_DAYS,
    REFRESH_TOKEN_EXPIRES_IN,
    FRONTEND_ORIGIN = 'http://localhost:3000',
    APP_NAME = 'WDP301 API',
    APP_VERSION = '1.0.0',
    APP_BASE_URL = `http://localhost:${PORT}`,
    EMAIL_FROM = 'mediclinicschedulesp@gmail.com',

    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
} = process.env;

const parsedRefreshDays =
    Number(REFRESH_EXPIRES_DAYS) ||
    (typeof REFRESH_TOKEN_EXPIRES_IN === 'string' && REFRESH_TOKEN_EXPIRES_IN.endsWith('d')
        ? Number(REFRESH_TOKEN_EXPIRES_IN.replace('d', ''))
        : 30);

module.exports = {
    MONGODB_URI: MONGO_URI,
    PORT: Number(PORT),
    JWT_SECRET,
    ACCESS_EXPIRES,
    REFRESH_EXPIRES_DAYS: parsedRefreshDays,
    FRONTEND_ORIGIN,
    APP_NAME,
    APP_VERSION,
    APP_BASE_URL,
    EMAIL_FROM,

    SMTP_HOST,
    SMTP_PORT: Number(SMTP_PORT),
    SMTP_USER,
    SMTP_PASS,
};

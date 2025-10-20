const nodemailer = require('nodemailer');
const { FRONTEND_ORIGIN, APP_BASE_URL, EMAIL_FROM, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = require('../../config/env');

const transporter = nodemailer.createTransport({
    host: SMTP_HOST || 'smtp.gmail.com',
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
});

transporter.verify()
    .then(() => console.log('✅ SMTP ready:', SMTP_HOST, SMTP_PORT))
    .catch(err => console.error('❌ SMTP verify failed:', err.message));

async function sendMail(to, subject, html) {
    const info = await transporter.sendMail({
        from: EMAIL_FROM || SMTP_USER,
        to,
        subject,
        html,
    });
    console.log('✅ Email sent:', info.messageId);
    return true;
}

function buildVerifyEmailTemplate({ accountId, token, apiBaseUrl = APP_BASE_URL }) {
    if (!accountId || !token) {
        throw new Error(`buildVerifyEmailTemplate missing param: accountId=${accountId}, token=${token}`);
    }
    const url = `${apiBaseUrl}/api/auth/verify-email?account=${encodeURIComponent(accountId)}&token=${encodeURIComponent(token)}`;
    return `<p>Click to verify your email:</p><p><a href="${url}">${url}</a></p>`;
}

function buildResetPasswordTemplate(token, accountId, baseUrl = FRONTEND_ORIGIN) {
    if (!token) throw new Error('buildResetPasswordTemplate missing token');
    if (!accountId) throw new Error('buildResetPasswordTemplate missing accountId');

    const url = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}&accountId=${encodeURIComponent(accountId)}`;
    console.log("🔍 url =", url);

    return `<p>Click to reset your password:</p><p><a href="${url}">${url}</a></p>`;
}



module.exports = { sendMail, buildVerifyEmailTemplate, buildResetPasswordTemplate };

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
    if (!token) throw new Error("buildResetPasswordTemplate missing token");
    if (!accountId) throw new Error("buildResetPasswordTemplate missing accountId");

    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}&accountId=${encodeURIComponent(accountId)}`;
    const now = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Đặt lại mật khẩu</title>
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          background-color: #f5f6fa;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        h2 {
          color: #2b6cb0;
        }
        a.button {
          display: inline-block;
          margin-top: 20px;
          padding: 12px 24px;
          color: #fff !important;
          background-color: #2b6cb0;
          border-radius: 6px;
          text-decoration: none;
          font-weight: bold;
        }
        a.button:hover {
          background-color: #1e4e8c;
        }
        p.note {
          color: #555;
          font-size: 14px;
          margin-top: 20px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 13px;
          color: #888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Xin chào,</h2>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
        <p>Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu. Liên kết này sẽ hết hạn sau <strong>24 giờ</strong>.</p>

        <p style="text-align:center;">
          <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
        </p>

        <p class="note">
          Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.<br/>
          Yêu cầu được tạo lúc: <strong>${now}</strong>.
        </p>

        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Your Company. Mọi quyền được bảo lưu.</p>
        </div>
      </div>
    </body>
    </html>
    `;
}




module.exports = { sendMail, buildVerifyEmailTemplate, buildResetPasswordTemplate };

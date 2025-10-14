const nodemailer = require("nodemailer");
const config = require("../config/env");

const transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: !!config.SMTP_SECURE,
    auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
    },
});

async function verifyMailer() {
    try {
        await transporter.verify();
        console.log("[MAILER] SMTP ready");
    } catch (e) {
        console.warn("[MAILER] SMTP verify failed:", e?.message || e);
    }
}
verifyMailer().catch(() => { });

function formatVND(n) {
    try { return new Intl.NumberFormat("vi-VN").format(Number(n || 0)) + "₫"; }
    catch { return `${n}₫`; }
}

function formatDateTimeRangeVN(start, end) {
    const fmt = new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric"
    });
    const s = fmt.format(new Date(start));
    const e = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(new Date(end));
    return `${s} – ${e}`;
}

function bookingHtml({ booking, doctor, clinic, specialty, slot }) {
    const timeRange = slot ? formatDateTimeRangeVN(slot.start_time, slot.end_time) : "";
    const fee = formatVND(booking.fee_amount);
    const appUrl = config.APP_BASE_URL || "http://localhost:3000";

    return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:auto;">
    <h2>✅ Xác nhận đặt lịch khám thành công</h2>
    <p>Xin chào <b>${booking.full_name}</b>,</p>
    <p>Bạn đã đặt lịch khám thành công. Thông tin chi tiết:</p>
    <table style="border-collapse:collapse;width:100%;">
      <tr><td style="padding:6px 0;">Mã đặt lịch</td><td><b>${booking.booking_code}</b></td></tr>
      <tr><td style="padding:6px 0;">Bác sĩ</td><td>${doctor?.title || ""} ${doctor?.user_id?.full_name || ""}</td></tr>
      <tr><td style="padding:6px 0;">Chuyên khoa</td><td>${specialty?.name || ""}</td></tr>
      <tr><td style="padding:6px 0;">Cơ sở</td><td>${clinic?.name || ""}</td></tr>
      <tr><td style="padding:6px 0;">Thời gian</td><td>${timeRange}</td></tr>
      <tr><td style="padding:6px 0;">Phí khám</td><td><b>${fee}</b></td></tr>
      <tr><td style="padding:6px 0;">Lý do khám</td><td>${booking.reason || "-"}</td></tr>
    </table>
    <p>Vui lòng đến trước <b>10–15 phút</b> để làm thủ tục.</p>
    <p>
      <a href="${appUrl}#/bookings/${booking._id}" 
         style="background:#2563eb;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block">
        Xem chi tiết lịch khám
      </a>
    </p>
    <hr/>
    <small>Nếu bạn không thực hiện đặt lịch này, vui lòng bỏ qua email.</small>
  </div>`;
}

async function sendBookingEmail({ to, subject, booking, doctor, clinic, specialty, slot }) {
    const html = bookingHtml({ booking, doctor, clinic, specialty, slot });
    const info = await transporter.sendMail({
        from: config.MAIL_FROM || config.EMAIL_FROM || config.SMTP_USER,
        to,
        subject,
        html,
    });
    return info?.messageId;
}

module.exports = { sendBookingEmail };

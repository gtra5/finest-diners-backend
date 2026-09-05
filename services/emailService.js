const nodemailer = require('nodemailer');

// ─── SMTP configuration ──────────────────────────────────────────────────────
// Configure these in .env to send real email:
//   SMTP_HOST=smtp.gmail.com
//   SMTP_PORT=587
//   SMTP_USER=you@gmail.com
//   SMTP_PASS=<app password>     (not your Gmail login; generate an app password)
//   SMTP_FROM=Finest Diners <you@gmail.com>
// If SMTP is not configured, sendOtpEmail falls back to printing the code to
// the server console so the flow still works in development / Render logs.

const isSmtpConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

// Send a 6-digit OTP to the given address. Resolves true when emailed, false
// when (unconfigured) the code was logged to the console instead.
const sendOtpEmail = async (to, otp) => {
  const subject = 'Your Finest Diners admin code';
  const text =
    `Your Finest Diners admin access code is: ${otp}\n\n` +
    'This code expires in 10 minutes. If you did not request it, you can ignore this email.';

  if (!isSmtpConfigured()) {
    console.log(`[OTP] SMTP not configured — dev fallback. Code for ${to}: ${otp}`);
    return false;
  }

  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
    });
    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error.message);
    console.log(`[OTP] Dev fallback — code for ${to}: ${otp}`);
    return false;
  }
};

module.exports = { sendOtpEmail, isSmtpConfigured };
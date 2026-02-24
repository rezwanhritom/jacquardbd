import nodemailer from "nodemailer";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const MAIL_FROM = process.env.MAIL_FROM || process.env.SMTP_USER || "noreply@jacquard.com";

function getTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

/**
 * Send verification email with link to frontend verify-email page.
 * @param {string} to - recipient email
 * @param {string} plainToken - raw token (not hashed) to include in link
 * @returns {Promise<{ sent: boolean, error?: string }>}
 */
export async function sendVerificationEmail(to, plainToken) {
  const verifyUrl = `${FRONTEND_URL.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(plainToken)}`;
  const transporter = getTransporter();

  if (!transporter) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[Email] (no SMTP) Verification link:", verifyUrl);
    }
    return { sent: true };
  }

  try {
    await transporter.sendMail({
      from: MAIL_FROM,
      to,
      subject: "Verify your email – Jacquard",
      html: `
        <p>Thanks for signing up. Please verify your email by clicking the link below:</p>
        <p><a href="${verifyUrl}" style="color: #2563eb;">Verify my email</a></p>
        <p>Or copy this link: ${verifyUrl}</p>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't create an account, you can ignore this email.</p>
      `,
      text: `Verify your email: ${verifyUrl}\n\nThis link expires in 24 hours.`,
    });
    return { sent: true };
  } catch (err) {
    console.error("[Email] sendVerificationEmail error:", err?.message);
    return { sent: false, error: err?.message };
  }
}

// Filepath = backend\src\services\emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP FAILED:", error);
  } else {
    console.log("✅ SMTP READY");
  }
});

// Generic low-level sender — every other email function should funnel through this.
async function sendEmail({ to, subject, html, text }) {
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
    text,
  });

  console.log("EMAIL SENT", info.messageId);
  return info;
}

async function sendTestEmail(email) {
  return sendEmail({
    to: email,
    subject: "SMTP Test",
    text: "Your SMTP configuration is working.",
  });
}

async function sendOTPEmail(email, otp) {
  return sendEmail({
    to: email,
    subject: "Your Verification Code",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });
}

// ---- Account Created Template ----
// Matches the required spec exactly:
// Subject: Community Response Hub - Account Created
// Fields: {{Full Name}}, {{Role}}, {{Email}}, {{Generated Password}}, {{Application URL}}
function buildAccountCreatedEmail({
  fullName,
  role,
  email,
  generatedPassword,
  applicationUrl,
}) {
  const subject = "Community Response Hub - Account Created";

  const text = `Hello ${fullName},

Welcome to Community Response Hub.

An account has been created for you.

Account Details:
Role: ${role}
Email: ${email}
Temporary Password: ${generatedPassword}
Login URL: ${applicationUrl}

For security purposes, we recommend changing your password after logging in.

Password management enhancements will be introduced in a future release.

If you did not expect this account, please contact your administrator.

Thank you,
Community Response Hub Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2>Community Response Hub</h2>

      <p>Hello ${fullName},</p>

      <p>Welcome to Community Response Hub.</p>

      <p>An account has been created for you.</p>

      <h3>Account Details</h3>

      <table cellpadding="6">
        <tr>
          <td><strong>Role:</strong></td>
          <td>${role}</td>
        </tr>
        <tr>
          <td><strong>Email:</strong></td>
          <td>${email}</td>
        </tr>
        <tr>
          <td><strong>Temporary Password:</strong></td>
          <td>${generatedPassword}</td>
        </tr>
        <tr>
          <td><strong>Login URL:</strong></td>
          <td><a href="${applicationUrl}">${applicationUrl}</a></td>
        </tr>
      </table>

      <p>For security purposes, we recommend changing your password after logging in.</p>

      <p>Password management enhancements will be introduced in a future release.</p>

      <p>If you did not expect this account, please contact your administrator.</p>

      <br />

      <p>Thank you,</p>
      <p>Community Response Hub Team</p>
    </div>
  `;

  return { subject, html, text };
}

async function sendAdminCreatedUserEmail({
  email,
  firstName,
  lastName,
  roleName,
  temporaryPassword,
  applicationUrl,
}) {
  const fullName = lastName ? `${firstName} ${lastName}` : firstName;
  const resolvedUrl =
    applicationUrl || process.env.FRONTEND_URL || "http://localhost:8081";

  const { subject, html, text } = buildAccountCreatedEmail({
    fullName,
    role: roleName,
    email,
    generatedPassword: temporaryPassword,
    applicationUrl: resolvedUrl,
  });

  return sendEmail({ to: email, subject, html, text });
}

module.exports = {
  sendEmail,
  sendTestEmail,
  sendOTPEmail,
  sendAdminCreatedUserEmail,
  buildAccountCreatedEmail,
};

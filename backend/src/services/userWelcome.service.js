// backend/src/services/userWelcome.service.js

const { sendEmail, buildAccountCreatedEmail } = require('./emailService');

async function sendWelcomeEmail({
  email,
  firstName,
  lastName,
  roleName,
  temporaryPassword,
}) {
  const applicationUrl =
    process.env.FRONTEND_URL ||
    'http://localhost:8081';

  const fullName = lastName ? `${firstName} ${lastName}` : firstName;

  const { subject, html, text } = buildAccountCreatedEmail({
    fullName,
    role: roleName,
    email,
    generatedPassword: temporaryPassword,
    applicationUrl,
  });

  await sendEmail({ to: email, subject, html, text });
}

module.exports = {
  sendWelcomeEmail,
};
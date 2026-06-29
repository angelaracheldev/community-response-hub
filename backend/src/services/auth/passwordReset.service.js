// Filepath = backend/src/services/auth/passwordReset.service.js
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../config/database'); // ⚠️ adjust to your actual db pool path
const { sendOTPEmail } = require('../emailService'); // ⚠️ adjust to your actual export name

// const db = require('../../config/database');
// const { sendOTPEmail } = require('../emailService');

const OTP_PURPOSE = 'password_reset';
const OTP_EXPIRY_MINUTES = 10;
const RESET_TOKEN_EXPIRY = '10m';

function generateOtp() {
  // 6-digit numeric OTP
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Step 1: request an OTP for password reset.
 * Always resolves "success" to the caller regardless of whether
 * the email exists, to avoid leaking which emails are registered.
 */
async function requestPasswordResetOtp(email) {
  const normalizedEmail = email.trim().toLowerCase();

  const userResult = await pool.query(
    `SELECT user_id, email FROM users WHERE email = $1`,
    [normalizedEmail]
  );

  if (userResult.rows.length === 0) {
    // Silently no-op — same response shape as the success path
    return { success: true };
  }

  const user = userResult.rows[0];
  const otpCode = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await pool.query(
    `INSERT INTO email_verification_otps (user_id, email, otp_code, purpose, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [user.user_id, user.email, otpCode, OTP_PURPOSE, expiresAt]
  );
  

  await sendOTPEmail(user.email, otpCode); // ⚠️ adjust to match your actual emailService signature

  return { success: true };
}

/**
 * Step 2: verify the OTP. Returns a short-lived reset token on success.
 */
async function verifyPasswordResetOtp(email, otpCode) {
  const normalizedEmail = email.trim().toLowerCase();

  const otpResult = await pool.query(
    `SELECT otp_id, otp_code, expires_at, verified
     FROM email_verification_otps
     WHERE email = $1 AND purpose = $2
     ORDER BY created_at DESC
     LIMIT 1`,
    [normalizedEmail, OTP_PURPOSE]
  );

  if (otpResult.rows.length === 0) {
    return { success: false, message: 'No password reset request found for this email.' };
  }

  const otpRow = otpResult.rows[0];

  if (otpRow.verified) {
    return { success: false, message: 'This code has already been used. Please request a new one.' };
  }

  if (new Date() > new Date(otpRow.expires_at)) {
    return { success: false, message: 'This code has expired. Please request a new one.' };
  }

  if (otpRow.otp_code !== otpCode.trim()) {
    return { success: false, message: 'Incorrect code. Please try again.' };
  }

  await pool.query(
    `UPDATE email_verification_otps SET verified = true WHERE otp_id = $1`,
    [otpRow.otp_id]
  );

  const resetToken = jwt.sign(
    { email: normalizedEmail, purpose: OTP_PURPOSE },
    process.env.JWT_SECRET, // ⚠️ reuse whatever secret you already sign auth tokens with
    { expiresIn: RESET_TOKEN_EXPIRY }
  );

  return { success: true, resetToken };
}

/**
 * Step 3: reset the password using the short-lived reset token.
 */
async function resetPassword(resetToken, newPassword) {
  let payload;
  try {
    payload = jwt.verify(resetToken, process.env.JWT_SECRET);
  } catch (err) {
    return { success: false, message: 'This reset session has expired. Please start again.' };
  }

  if (payload.purpose !== OTP_PURPOSE) {
    return { success: false, message: 'Invalid reset session.' };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10); // ⚠️ match your existing salt rounds

  const result = await pool.query(
    `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
     WHERE email = $2
     RETURNING user_id`,
    [passwordHash, payload.email]
  );

  if (result.rows.length === 0) {
    return { success: false, message: 'User no longer exists.' };
  }

  return { success: true };
}

module.exports = {
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
};
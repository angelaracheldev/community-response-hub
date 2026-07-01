// Filepath = backend/src/services/profile/otp.service.js

const crypto = require('crypto');
const db = require('../../config/database');
const { sendOTPEmail } = require('../emailService');

const OTP_PURPOSE = 'profile_email_change';
const OTP_EXPIRY_MINUTES = 10;

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

async function createProfileEmailOTP(user, newEmail) {
  const email = newEmail.trim().toLowerCase();

  // Remove any previous pending OTPs for this email/purpose
  await db.query(
    `
    DELETE FROM email_verification_otps
    WHERE email = $1
      AND purpose = $2
      AND verified = FALSE
    `,
    [email, OTP_PURPOSE]
  );

  const otp = generateOTP();
  const expiresAt = new Date(
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
  );

  await db.query(
    `
    INSERT INTO email_verification_otps
    (
      user_id,
      email,
      otp_code,
      purpose,
      expires_at
    )
    VALUES
    ($1,$2,$3,$4,$5)
    `,
    [
      user.user_id,
      email,
      otp,
      OTP_PURPOSE,
      expiresAt,
    ]
  );

  await sendOTPEmail(email, otp);

  return {
    success: true,
    message: 'Verification code sent.',
  };
}

async function resendProfileEmailOTP(user, newEmail) {
  return createProfileEmailOTP(user, newEmail);
}

async function verifyProfileEmailOTP(userId, newEmail, otp) {
  const email = newEmail.trim().toLowerCase();

  const result = await db.query(
    `
    SELECT
      otp_id,
      otp_code,
      expires_at,
      verified
    FROM email_verification_otps
    WHERE
      user_id = $1
      AND email = $2
      AND purpose = $3
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [
      userId,
      email,
      OTP_PURPOSE,
    ]
  );

  if (!result.rowCount) {
    return {
      success: false,
      message: 'No verification request found.',
    };
  }

  const record = result.rows[0];

  if (record.verified) {
    return {
      success: false,
      message: 'This OTP has already been used.',
    };
  }

  if (new Date() > new Date(record.expires_at)) {
    return {
      success: false,
      message: 'OTP has expired.',
    };
  }

  if (record.otp_code !== otp.trim()) {
    return {
      success: false,
      message: 'Invalid OTP.',
    };
  }

  await db.query(
    `
    UPDATE email_verification_otps
    SET
      verified = TRUE
    WHERE otp_id = $1
    `,
    [record.otp_id]
  );

  return {
    success: true,
    message: 'OTP verified successfully.',
  };
}

module.exports = {
  OTP_PURPOSE,
  generateOTP,
  createProfileEmailOTP,
  resendProfileEmailOTP,
  verifyProfileEmailOTP,
};
// Filepath = \src\services\auth\emailOtp.service.js
const crypto = require('crypto');
const db = require('../../config/database');
const { sendOTPEmail } = require('../emailService');


// 1. Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 2. Hash OTP
function hashOTP(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

// 4. Verify OTP

async function createAndSendOTP({ user_id, email, purpose }) {
  try {
    const otp = generateOTP();
    const hashed = hashOTP(otp);

    await db.query(`
      DELETE FROM email_verification_otps
      WHERE email = $1 AND purpose = $2
    `, [email, purpose]);

    await db.query(`
      INSERT INTO email_verification_otps (
        user_id,
        email,
        otp_code,
        purpose,
        expires_at,
        verified
      )
      VALUES (
        $1, $2, $3, $4,
        NOW() + INTERVAL '5 minutes',
        FALSE
      )
    `, [user_id || null, email, hashed, purpose]);

    await sendOTPEmail(email, otp);

    console.log('OTP CREATED FOR:', email);

    return { otp };

  } catch (error) {
    console.error('CREATE OTP ERROR', error);
    throw error;
  }
}


async function verifyOTP({ email, otp, purpose }) {
  const hashed = hashOTP(otp);

  const result = await db.query(`
    SELECT *
    FROM email_verification_otps
    WHERE email = $1
      AND purpose = $2
      AND otp_code = $3
      AND verified = FALSE
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
  `, [email, purpose, hashed]);

  if (result.rows.length === 0) {
    return { success: false, message: 'Invalid or expired OTP' };
  }

  const otpRow = result.rows[0];

  // mark OTP used
  await db.query(`
    UPDATE email_verification_otps
    SET verified = TRUE
    WHERE otp_id = $1
  `, [otpRow.otp_id]);

  // mark user verified (ONLY if user_id exists)
  if (otpRow.user_id) {
    await db.query(`
      UPDATE users
      SET is_email_verified = TRUE
      WHERE user_id = $1
    `, [otpRow.user_id]);
  }

  return { success: true, message: 'Email verified' };
}

module.exports = {
  createAndSendOTP,
  verifyOTP,
  generateOTP,
  hashOTP,
};

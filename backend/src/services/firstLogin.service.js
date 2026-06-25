// Filepath = backend\src\services\firstLogin.service.js
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const db = require('../config/database');
const usersRepository = require('../repositories/users.repository');

const {
  verifyOTP,
  createAndSendOTP,
} = require('./auth/emailOtp.service');


async function verifyFirstLoginOTP(email, otp) {
  console.log('VERIFY OTP INPUT:', {
    email,
    otp,
    purpose: 'admin_created_user',
  });

  const result = await verifyOTP({
    email,
    otp,
    purpose: 'admin_created_user',
  });

  if (!result.success) {
    return {
      error: {
        status: 400,
        body: {
          status: 'error',
          message: result.message,
        },
      },
    };
  }

  return {
    body: {
      status: 'ok',
      message: 'OTP verified successfully',
    },
  };
}

async function changePassword(userId, newPassword) {
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await db.query(
    `
    UPDATE users
    SET
      password_hash = $1,
      salt = $2,
      must_change_password = FALSE,
      updated_at = NOW()
    WHERE user_id = $3
    `,
    [passwordHash, salt, userId]
  );

  return {
    body: {
      status: 'ok',
      message: 'Password changed successfully',
      timestamp: new Date().toISOString(),
    },
  };
}

async function resendOTP(user) {
  return createAndSendOTP({
    user_id: user.user_id,
    email: user.email,
    purpose: 'admin_created_user',
  });
}

async function getStatus(user) {
   console.log('FIRST LOGIN USER:', user);
  return {
    body: {
      status: 'ok',
      onboarding: {
        is_email_verified: user.is_email_verified,
        must_change_password: user.must_change_password,
      },
      timestamp: new Date().toISOString(),
    },
  };
}

module.exports = {
  verifyFirstLoginOTP,
  changePassword,
  resendOTP,
  getStatus,
};

// Filepath = backend/src/services/profile/email.service.js

const db = require('../../config/database');

const passwordService = require('./password.service');
const otpService = require('./otp.service');

/**
 * Step 1
 * Verify current password and send OTP to the new email.
 */
async function requestEmailChange(
  user,
  currentPassword,
  newEmail
) {
  const normalizedEmail = newEmail.trim().toLowerCase();

  // Prevent changing to the same email
  if (normalizedEmail === user.email.toLowerCase()) {
    return {
    status: 400,
    body: {
      success: false,
      message: 'New email must be different from your current email.',
    },
  };
  }

  // Verify password first
  const passwordResult =
    await passwordService.verifyCurrentPassword(
      user,
      currentPassword
    );

  if (!passwordResult.success) {
     return {
        status: 400,
        body: passwordResult,
    };
  }

  // Check duplicate email
  const existing = await db.query(
    `
    SELECT user_id
    FROM users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1
    `,
    [normalizedEmail]
  );

  if (existing.rowCount > 0) {
      return {
        status: 400,
        body: {
            success: false,
            message: 'Email address is already in use.',
        },
    };
  }

  // Generate OTP
  const otpResult =
  await otpService.createProfileEmailOTP(
    user,
    normalizedEmail
  );

return {
  status: otpResult.success ? 200 : 400,
  body: otpResult,
};
}

/**
 * Step 2
 * Verify OTP then update the user's email.
 */
async function verifyEmailOTP(
  user,
  newEmail,
  otp
) {
  const normalizedEmail = newEmail.trim().toLowerCase();

  const otpResult = await otpService.verifyProfileEmailOTP(
      user.user_id,
      normalizedEmail,
      otp
    );

  if (!otpResult.success) {

  return {
    status: 400,
    body: otpResult,
  };
}

  const existing = await db.query(
  `
  SELECT user_id
  FROM users
  WHERE LOWER(email) = LOWER($1)
    AND user_id <> $2
  LIMIT 1
  `,
  [normalizedEmail, user.user_id]
);

if (existing.rowCount) {
  return {
    status: 400,
    body: {
      success: false,
      message: 'Email address is already in use.',
    },
  };
}

  await db.query(
    `
    UPDATE users
    SET
      email = $1,
      is_email_verified = TRUE,
      updated_at = NOW()
    WHERE user_id = $2
    `,
    [
      normalizedEmail,
      user.user_id,
    ]
  );

  return {
    status: 200,
    body: {
        success: true,
        message: 'Email address updated successfully.',
        email: normalizedEmail,
    },
};
}

/**
 * Step 3
 * Resend OTP
 */
async function resendEmailOTP(
  user,
  newEmail
) {
  const normalizedEmail =
    newEmail.trim().toLowerCase();

  // Ensure another account hasn't claimed the email
  const existing = await db.query(
    `
    SELECT user_id
    FROM users
    WHERE LOWER(email)=LOWER($1)
      AND user_id <> $2
    LIMIT 1
    `,
    [
      normalizedEmail,
      user.user_id,
    ]
  );

  if (existing.rowCount) {
     return {
    status: 400,
    body: {
      success: false,
      message: 'Email address is already in use.',
    },
  };
  }

 const result = await otpService.resendProfileEmailOTP(
  user,
  normalizedEmail
);

return {
  status: result.success ? 200 : 400,
  body: result,
};
}

module.exports = {
  requestEmailChange,
  verifyEmailOTP,
  resendEmailOTP,
};
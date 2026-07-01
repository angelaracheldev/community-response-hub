// Filepath = backend/src/services/profile/profile.service.js
console.log("PROFILE SERVICE FILE LOADED");

const passwordService = require('./password.service');
const emailService = require('./email.service');

/**
 * Returns the authenticated user's profile.
 */
async function getProfile(user) {
  return {
    status: 200,
    body: {
      success: true,
      message: 'Profile retrieved successfully.',
      profile: {
        userId: user.user_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role_name,
        phoneNumber: user.phone_number,
        address: user.address,
        profileImageUrl: user.profile_image_url,
      },
    },
  };
}

/**
 * Verify the user's current password.
 */
async function verifyCurrentPassword(user, currentPassword) {
  return passwordService.verifyCurrentPassword(
    user,
    currentPassword
  );
}

/**
 * Change password.
 */
async function changePassword(
  user,
  currentPassword,
  newPassword
) {
  return passwordService.changePassword(
    user,
    currentPassword,
    newPassword
  );
}

/**
 * Request email change.
 */
async function requestEmailChange(
  user,
  currentPassword,
  newEmail
) {
  return emailService.requestEmailChange(
    user,
    currentPassword,
    newEmail
  );
}

/**
 * Verify email OTP.
 */
async function verifyEmailOTP(
  user,
  newEmail,
  otp
) {
  return emailService.verifyEmailOTP(
    user,
    newEmail,
    otp
  );
}

/**
 * Resend email OTP.
 */
async function resendEmailOTP(
  user,
  newEmail
) {
  return emailService.resendEmailOTP(
    user,
    newEmail
  );
}

module.exports = {
  getProfile,
  verifyCurrentPassword,
  changePassword,
  requestEmailChange,
  verifyEmailOtp: verifyEmailOTP,
  resendEmailOtp: resendEmailOTP,
};
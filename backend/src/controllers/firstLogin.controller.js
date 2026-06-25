// Filepath=backend\src\controllers\firstLogin.controller.js
const { handleService } = require('../utils/controllerHelpers');

const firstLoginService = require('../services/firstLogin.service');

const verifyOTP = handleService(
  (req) =>
  firstLoginService.verifyFirstLoginOTP(
    req.body.email,   // 👈 ADD EMAIL
    req.body.otp
  ),
  {
    validate: true,
    logLabel: 'Failed to verify first login OTP',
    fallbackMessage: 'Unable to verify OTP',
  }
  
);

const changePassword = handleService(
  (req) =>
    firstLoginService.changePassword(
      req.user.user_id,
      req.body.newPassword
    ),
  {
    validate: true,
    logLabel: 'Failed to change password',
    fallbackMessage: 'Unable to change password',
  }
);

const resendOTP = handleService(
  (req) => firstLoginService.resendOTP(req.user),
  {
    logLabel: 'Failed to resend OTP',
    fallbackMessage: 'Unable to resend OTP',
  }
);

const getStatus = handleService(
  (req) => firstLoginService.getStatus(req.user),
  {
    logLabel: 'Failed to retrieve onboarding status',
    fallbackMessage: 'Unable to retrieve onboarding status',
  }
);

module.exports = {
  verifyOTP,
  changePassword,
  resendOTP,
  getStatus,
};
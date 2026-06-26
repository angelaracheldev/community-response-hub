// Filepath = backend\src\controllers\passwordReset.controller.js
const passwordResetService = require('../services/auth/passwordReset.service');

const { validateEmail, validateOtp, validatePassword } = require('../validators/passwordReset.validator');


async function requestOtp(req, res) {
  const { email } = req.body;

  const emailError = validateEmail(email);
  if (emailError) return res.status(400).json({ success: false, message: emailError });

  try {
    await passwordResetService.requestPasswordResetOtp(email);
    return res.status(200).json({
      success: true,
      message: 'If that email address is registered, a one-time password has been sent.',
    });
  } catch (err) {
    console.error('requestOtp error:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
}

async function verifyOtp(req, res) {
  const { email, otp } = req.body;

  const emailError = validateEmail(email);
  if (emailError) return res.status(400).json({ success: false, message: emailError });

  const otpError = validateOtp(otp);
  if (otpError) return res.status(400).json({ success: false, message: otpError });

  try {
    const result = await passwordResetService.verifyPasswordResetOtp(email, otp);
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }
    return res.status(200).json({ success: true, resetToken: result.resetToken });
  } catch (err) {
    console.error('verifyOtp error:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
}

async function resetPassword(req, res) {
  const { resetToken, newPassword, confirmPassword } = req.body;

  if (!resetToken) {
    return res.status(400).json({ success: false, message: 'Missing reset session.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match.' });
  }

  const passwordError = validatePassword(newPassword);
  if (passwordError) return res.status(400).json({ success: false, message: passwordError });

  try {
    const result = await passwordResetService.resetPassword(resetToken, newPassword);
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }
    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('resetPassword error:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
}


module.exports = { requestOtp, verifyOtp, resetPassword };
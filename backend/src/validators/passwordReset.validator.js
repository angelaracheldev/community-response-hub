// Filepath = backend/src/validators/passwordReset.validator.js
const PASSWORD_MIN_LENGTH = 8;

function validateEmail(email) {
  if (!email || typeof email !== 'string') return 'Email is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Please enter a valid email address.';
  return null;
}

function validateOtp(otp) {
  if (!otp || typeof otp !== 'string') return 'OTP code is required.';
  if (!/^\d{6}$/.test(otp.trim())) return 'OTP code must be 6 digits.';
  return null;
}

function validatePassword(password) {
  if (!password || typeof password !== 'string') return 'Password is required.';
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  return null;
}

module.exports = { validateEmail, validateOtp, validatePassword, PASSWORD_MIN_LENGTH };
// Filepath = backend\src\controllers\auth.controller.js
const { handleService } = require('../utils/controllerHelpers');
const authService = require('../services/auth.service');

const register = handleService(
  (req) => {
    const { firstName, lastName, email, password, phoneNumber, address } = req.body;
    return authService.register({ firstName, lastName, email, password, phoneNumber, address });
  },
  { validate: true, logLabel: 'Register failed', fallbackMessage: 'Unable to register user', defaultStatus: 201 }
);

const login = handleService(
  (req) => authService.login(req.body),
  { validate: true, logLabel: 'Login failed', fallbackMessage: 'Unable to login' }
);

const getMe = handleService(
  (req) => authService.getMe(req.user),
  { logLabel: 'Get me failed', fallbackMessage: 'Unable to retrieve profile' }
);

const logout = handleService(
  () => authService.logout(),
  { logLabel: 'Logout failed', fallbackMessage: 'Unable to logout' }
);

const refreshToken = handleService(
  (req) => authService.refreshToken(req.body.refreshToken),
  {
    validate: true,
    logLabel: 'Refresh token failed',
    fallbackMessage: 'Invalid or expired refresh token',
    statusOnError: 401,
  }
);

module.exports = {
  register,
  login,
  getMe,
  logout,
  refreshToken,
};

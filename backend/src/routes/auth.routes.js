const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');
const {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
} = require('../validators/auth.validator');

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/me', authMiddleware, authController.getMe);
router.post('/logout', authMiddleware, authController.logout);
router.post('/refresh-token', refreshTokenValidation, authController.refreshToken);

module.exports = router;

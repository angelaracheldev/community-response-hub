// Filepath = backend\src\routes\emailVerification.routes.js
const express = require('express');
const router = express.Router();

const {
  createAndSendOTP,
  verifyOTP,
} = require('../services/auth/emailOtp.service');

// SEND OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { user_id, email, purpose } = req.body;

    await createAndSendOTP({ user_id, email, purpose });

    res.json({ success: true, message: 'OTP sent' });
  }
  catch (err) {
    console.error('SEND OTP ROUTE ERROR');
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});


module.exports = router;
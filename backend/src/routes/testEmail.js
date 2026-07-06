const express = require('express');
const router = express.Router();

const { sendTestEmail } = require('../services/emailService');

router.get('/test-email', async (req, res) => {
  try {
    
    await sendTestEmail('sampletestghelay@gmail.com');

    console.log('TEST EMAIL ROUTE HIT');

    res.json({
      success: true,
      message: 'Email sent',
    });
  } catch (error) {
    console.error('Error: ',error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
const router = require('express').Router();

// Simple auth stubs for local testing
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    return res.json({ status: 'ok', token: 'local-dev-token', user: { user_id: 'local-admin', role_name: 'admin', email } });
  }
  res.status(400).json({ status: 'error', message: 'email and password required' });
});

module.exports = router;

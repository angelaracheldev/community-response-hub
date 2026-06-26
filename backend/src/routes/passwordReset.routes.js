// Filepath = backend/src/routes/passwordReset.routes.js
const express = require('express');

console.log("express =", typeof express);

const router = express.Router();

console.log("router =", router);


const controller = require('../controllers/passwordReset.controller');

console.log('controller =', controller);

router.post('/request-otp', controller.requestOtp);
router.post('/verify-otp', controller.verifyOtp);
router.post('/reset', controller.resetPassword);

console.log("exporting router");

module.exports = router;



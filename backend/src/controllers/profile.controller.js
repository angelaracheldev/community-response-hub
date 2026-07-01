// Filepath = backend/src/controllers/profile.controller.js
console.log("PROFILE CONTROLLER LOADED");
const profileService = require('../services/profile/profile.service');
async function getProfile(req, res, next) {
  try {
    const result = await profileService.getProfile(req.user);
    console.log("RESULT =", result);
    console.log("RESULT BODY =", result.body);
    res.status(result.status || 200).json(result.body);
  } catch (err) {
    next(err);
  }
}

async function verifyCurrentPassword(req, res, next) {
  console.log("verifyCurrentPassword()");

  try {
    const result = await profileService.verifyCurrentPassword(
      req.user,
      req.body.currentPassword
    );

    console.log("VERIFY RESULT =", result);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res) {
  try {
    console.log("CONTROLLER changePassword");

    const result = await profileService.changePassword(
      req.user,
      req.body.currentPassword,
      req.body.newPassword
    );
    

    if (result.body && !result.body.success) {
      return res.status(result.status || 400).json(result.body);
    }

    console.log("CONTROLLER RESULT =", result);
console.log("CONTROLLER RESULT BODY =", result.body);


    return res.status(result.status || 200).json(result.body);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}



async function requestEmailChange(req, res, next) {
  try {
    const result = await profileService.requestEmailChange(
      req.user,
      req.body.currentPassword,
      req.body.newEmail
    );

    if (result.error) {
      return res
        .status(result.error.status)
        .json(result.error.body);
    }
    console.log("RESULT =", result);
    console.log("RESULT BODY =", result.body);
    res.status(result.status || 200).json(result.body);
  } catch (err) {
    next(err);
  }
}

async function resendEmailOtp(req, res, next) {
  try {
    const result = await profileService.resendEmailOtp(
      req.user,
      req.body.newEmail
    );

    if (result.error) {
      return res
        .status(result.error.status)
        .json(result.error.body);
    }
    console.log("RESULT =", result);
    console.log("RESULT BODY =", result.body);
    res.status(result.status || 200).json(result.body);
  } catch (err) {
    next(err);
  }
}

async function verifyEmailOtp(req, res, next) {
  try {
    const result = await profileService.verifyEmailOtp(
      req.user,
      req.body.newEmail,
      req.body.otp
    );

    if (result.error) {
      return res
        .status(result.error.status)
        .json(result.error.body);
    }
    console.log("RESULT =", result);
    console.log("RESULT BODY =", result.body);
    res.status(result.status || 200).json(result.body);
  } catch (err) {
    next(err);
  }
}
module.exports = {
  getProfile,
  verifyCurrentPassword,
  changePassword,
  requestEmailChange,
  resendEmailOtp,
  verifyEmailOtp,
};
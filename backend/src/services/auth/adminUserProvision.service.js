// Filepath = backend\src\services\auth\adminUserProvision.service.js
const crypto = require('crypto');
const { createAndSendOTP } = require('./emailOtp.service');
const { sendAdminCreatedUserEmail } = require('../emailService');


async function provisionAdminCreatedUser(
  user,
  roleName,
  temporaryPassword
) {
  const { otp } = await createAndSendOTP({
    user_id: user.user_id,
    email: user.email,
    purpose: 'admin_created_user',
  });

  try{
    await sendAdminCreatedUserEmail({
    email: user.email,
    firstName: user.first_name,
    roleName,
    temporaryPassword,
    otp,
  });
  } catch (err){
     console.error("Email failed but user created:", err);
  }
  
}

module.exports = {
  provisionAdminCreatedUser,
};
// Filepath = backend/src/services/profile/password.service.js
console.log("PASSWORD SERVICE FILE LOADED");
console.log("LOADED password.service.js");
const bcrypt = require('bcrypt');
const db = require('../../config/database');

const SALT_ROUNDS = 12;

/**
 * Verify the user's current password.
 */
async function verifyCurrentPassword(user, currentPassword) {

  const isMatch = await bcrypt.compare(
    currentPassword,
    user.password_hash
  );

  if (!isMatch) {
    return {
      success: false,
      message: "Current password is incorrect."
    };
  }

  return {
    success: true,
    message: "Password verified successfully."
  };
}

/**
 * Change the user's password.
 */
async function changePassword(user, currentPassword, newPassword) {
  console.log("RETURNING PASSWORD CHANGED");


  const verification = await verifyCurrentPassword(
    user,
    currentPassword
  );


  if (!verification.success) {
    return verification;
  }


  const samePassword = await bcrypt.compare(
    newPassword,
    user.password_hash
  );


  if (samePassword) {
    return {
      success: false,
      message: 'Your new password must be different from your current password.',
    };
  }


  const salt = await bcrypt.genSalt(SALT_ROUNDS);

  const passwordHash = await bcrypt.hash(
    newPassword,
    salt
  );

  await db.query(
    `
    UPDATE users
    SET
        password_hash = $1,
        salt = $2,
        must_change_password = FALSE,
        updated_at = NOW()
    WHERE user_id = $3
    `,
    [
      passwordHash,
      salt,
      user.user_id,
    ]
  );
const response = {
    status: 200,
    body: {
        success: true,
        message: "Password changed successfully.",
        forceLogout: true,
    },
};

console.log("PASSWORD SERVICE RESPONSE =", response);

return response;  return {
    success: true,
    message: "Password changed successfully.",
    forceLogout: true,
};
}

module.exports = {
  verifyCurrentPassword,
  changePassword,
};
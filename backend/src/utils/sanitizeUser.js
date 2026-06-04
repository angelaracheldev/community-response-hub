function sanitizeAuthUser(user) {
  const { password_hash, salt, ...safe } = user;
  return safe;
}

function sanitizeUser(user) {
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

module.exports = {
  sanitizeAuthUser,
  sanitizeUser,
};

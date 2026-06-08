const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { jwtSecret } = require('../config');
const { setIo } = require('./emitter');

const USER_SELECT = `
  SELECT u.user_id, u.user_code, u.first_name, u.last_name, u.email, u.phone_number, u.address, u.profile_image_url, u.role_id, r.role_name, u.is_verified, u.is_active
  FROM users u
  LEFT JOIN roles r ON u.role_id = r.role_id
  WHERE u.user_id = $1
`;

async function authenticateSocketUser(socket) {
  const token = socket.handshake.auth?.token;
  if (!token || typeof token !== 'string') {
    throw new Error('Authorization token required');
  }

  const payload = jwt.verify(token, jwtSecret);
  if (!payload?.userId) {
    throw new Error('Invalid token payload');
  }

  const result = await db.query(USER_SELECT, [payload.userId]);
  if (!result.rowCount) {
    throw new Error('User not found');
  }

  const user = result.rows[0];
  if (!user.is_active) {
    throw new Error('User account is inactive');
  }

  return user;
}

function initSocket(io) {
  setIo(io);

  io.use(async (socket, next) => {
    try {
      socket.user = await authenticateSocketUser(socket);
      next();
    } catch (error) {
      console.error('Socket auth error:', error.message);
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const { user_id: userId, role_name: roleName } = socket.user;

    socket.join(`user:${userId}`);
    if (roleName) {
      socket.join(`role:${roleName}`);
    }

    socket.on('disconnect', () => {
      // Connection cleanup is handled automatically by Socket.IO room membership.
    });
  });
}

module.exports = initSocket;

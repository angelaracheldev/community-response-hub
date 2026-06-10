const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const authRepository = require('../repositories/auth.repository');
const { setIo } = require('./emitter');

async function authenticateSocketUser(socket) {
  const token = socket.handshake.auth?.token;
  if (!token || typeof token !== 'string') {
    throw new Error('Authorization token required');
  }

  const payload = jwt.verify(token, jwtSecret);
  if (!payload?.userId) {
    throw new Error('Invalid token payload');
  }

  const result = await authRepository.findUserWithRoleById(payload.userId);
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

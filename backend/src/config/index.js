const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  port: process.env.API_PORT || 5000,
  host: process.env.API_HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || '*',
  jwtSecret: process.env.JWT_SECRET || 'change_this_secret_for_dev',
};

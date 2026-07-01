// Filepath = backend\src\config\index.js
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local'), override: true });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || 'change_this_secret_for_dev';

if (nodeEnv === 'production' && (!process.env.JWT_SECRET || jwtSecret === 'change_this_secret_for_dev')) {
  throw new Error('JWT_SECRET must be set to a strong value in production');
}

module.exports = {
  port: Number(process.env.API_PORT || process.env.PORT || 5000),
  host: process.env.API_HOST || '0.0.0.0',
  nodeEnv,
  frontendUrl: process.env.FRONTEND_URL || '*',
  jwtSecret,
};

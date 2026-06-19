const { nodeEnv } = require('../config');

function isProduction() {
  return nodeEnv === 'production';
}

function safeErrorPayload(message, error) {
  const body = { status: 'error', message };
  if (!isProduction() && error?.message) {
    body.error = error.message;
  }
  return body;
}

module.exports = {
  isProduction,
  safeErrorPayload,
};

const { validationResult } = require('express-validator');
const { safeErrorPayload } = require('./safeError');

function hasValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ status: 'error', errors: errors.array() });
    return true;
  }
  return false;
}

function sendServiceResult(res, result, defaultStatus = 200) {
  if (result.error) {
    return res.status(result.error.status).json(result.error.body);
  }
  const status = result.status || defaultStatus;
  return res.status(status).json(result.body);
}

function handleService(fn, options = {}) {
  const {
    logLabel = 'Request failed',
    fallbackMessage = 'An unexpected error occurred',
    validate = false,
    defaultStatus = 200,
    statusOnError = 500,
  } = options;

  return async (req, res) => {
    if (validate && hasValidationErrors(req, res)) {
      return undefined;
    }

    try {
      const result = await fn(req, res);
      if (result === undefined) {
        return undefined;
      }
      return sendServiceResult(res, result, defaultStatus);
    } catch (error) {
      console.error(`${logLabel}:`, error.message);
      return res.status(statusOnError).json(safeErrorPayload(fallbackMessage, error));
    }
  };
}

module.exports = {
  hasValidationErrors,
  sendServiceResult,
  handleService,
};

const { ApiError } = require('../utils/errors');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err);

  if (err instanceof ApiError) {
    return res.status(err.code).json({
      success: false,
      message: err.message
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

module.exports = errorHandler;

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  logger.error('Unhandled error', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    statusCode: err.statusCode || 500
  });

  if (err.isOperational) {
    return res.status(statusCode).json({ error: err.message });
  }

  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = { AppError, errorHandler };
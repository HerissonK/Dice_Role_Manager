class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  } else {
    console.error('❌ Error:', err.message);
  }

  if (err.isOperational) {
    return res.status(statusCode).json({ error: err.message });
  }

  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = { AppError, errorHandler };
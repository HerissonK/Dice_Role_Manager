// utils/errorHandler.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Middleware global
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';
  
  // Log complet en dev, minimal en prod
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  } else {
    console.error(err.message);
  }
  
  res.status(statusCode).json({ error: message });
});
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Middleware global d'erreur Express (4 paramètres obligatoires)
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  // Log complet en dev, minimal en prod
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  } else {
    console.error('❌ Error:', err.message);
  }

  // Erreurs opérationnelles connues → message clair
  if (err.isOperational) {
    return res.status(statusCode).json({ error: err.message });
  }

  // Erreurs inattendues → message générique (ne pas exposer les détails)
  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = { AppError, errorHandler };
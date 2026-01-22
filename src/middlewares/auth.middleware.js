const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Invalid Authorization header' });
  }

  try {
    console.log('Token received:', token);
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    console.error('JWT error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authenticate };

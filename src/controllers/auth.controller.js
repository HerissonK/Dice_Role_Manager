const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const jwtConfig = require('../config/jwt');

// --- Controllers ---
const validator = require('validator');

function validateRegistration(req, res, next) {
  const { username, email, password } = req.body;
  
  const errors = [];
  
  if (!username || username.length < 3 || username.length > 50) {
    errors.push('Username must be 3-50 characters');
  }
  
  if (!validator.isEmail(email)) {
    errors.push('Invalid email format');
  }
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
  if (!passwordRegex.test(password)) {
    errors.push('Password must contain uppercase, lowercase and number');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
}

module.exports = { validateRegistration };

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}

// --- Exports ---
module.exports = { login };

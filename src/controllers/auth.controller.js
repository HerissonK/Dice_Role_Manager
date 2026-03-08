const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const jwtConfig = require('../config/jwt');
const validator = require('validator');
const { AppError } = require('../utils/errorHandler');

// MIDDLEWARE DE VALIDATION
function validateRegistration(req, res, next) {
  const { username, email, password } = req.body;
  const errors = [];

  if (!username || username.length < 3 || username.length > 50) {
    errors.push('Username must be 3-50 characters');
  }

  if (!email || !validator.isEmail(email)) {
    errors.push('Invalid email format');
  }

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
  if (password && !passwordRegex.test(password)) {
    errors.push('Password must contain uppercase, lowercase and number');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}

async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new AppError('Cet email est déjà utilisé', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, passwordHash });

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email et mot de passe requis', 400);
    }

    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('Identifiants invalides', 401);
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new AppError('Identifiants invalides', 401);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

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
    next(error);
  }
}

module.exports = { validateRegistration, register, login };
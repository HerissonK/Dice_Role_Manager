const express = require('express');
const cors = require('cors');
const characterRoutes = require('./routes/character.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  optionsSuccessStatus: 200
};

const rateLimit = require('express-rate-limit');

// Limiter les tentatives de connexion
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  message: 'Too many login attempts, please try again later'
});

app.use('/api/auth/login', loginLimiter);

// Limiter les créations
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10
});

app.use('/api/characters', createLimiter);

app.use(cors(corsOptions));

app.use(express.json());

app.use('/api/characters', characterRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;

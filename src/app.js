const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const characterRoutes = require('./routes/character.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

/* ✅ 1. CORS EN PREMIER */
const corsOptions = {
  origin: true, //process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
};

app.use(cors(corsOptions));

/* ✅ 2. JSON */
app.use(express.json());


/* ✅ 3. RATE LIMITERS */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
});

app.use('/api/auth/login', loginLimiter);

const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
});

app.use('/api/characters', createLimiter);

/* ✅ 4. ROUTES */
app.use('/api/characters', characterRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;

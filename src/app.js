// REMPLACER tout le fichier par :
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./utils/errorHandler');

const characterRoutes = require('./routes/character.routes');
const authRoutes = require('./routes/auth.routes');
const playRoutes = require('./routes/play.routes');

const app = express();

/* 1. SÉCURITÉ */
app.use(helmet());

/* 2. CORS */
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
  : ['http://localhost:8080'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin "${origin}" not allowed`));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

/* 3. JSON */
app.use(express.json());

/* 4. RATE LIMITERS */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many login attempts, please try again later',
});
app.use('/api/auth/login', loginLimiter);

const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
});
app.use('/api/characters', createLimiter);

/* 5. ROUTES */
app.use('/api/characters', characterRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', playRoutes);

/* 6. ERROR HANDLER — doit être en dernier */
app.use(errorHandler);

module.exports = app;
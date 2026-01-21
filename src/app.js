const express = require('express');
const cors = require('cors');
const characterRoutes = require('./routes/character.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

// Activer CORS pour toutes les origines
app.use(cors());

app.use(express.json());

app.use('/api/characters', characterRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;

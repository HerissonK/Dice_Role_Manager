const express = require('express');
const characterRoutes = require('./routes/character.routes');

const app = express();

app.use(express.json());

app.use('/api/characters', characterRoutes);

module.exports = app;

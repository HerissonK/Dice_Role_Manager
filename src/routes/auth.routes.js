const express = require('express');
const router = express.Router();

const { validateRegistration, register, login } = require('../controllers/auth.controller');

// Inscription : validation PUIS création
router.post('/register', validateRegistration, register);

// Connexion
router.post('/login', login);

module.exports = router;
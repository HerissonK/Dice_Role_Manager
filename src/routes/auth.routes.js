const express = require('express');
const router = express.Router();

const { validateRegistration , login } = require('../controllers/auth.controller');

// AUTH
router.post('/register', validateRegistration);
router.post('/login', login);

module.exports = router;


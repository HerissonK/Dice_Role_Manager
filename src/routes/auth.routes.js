const express = require('express');
const router = express.Router();
const { register, login, authenticate } = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);

router.get('/profile', authenticate);

module.exports = router;

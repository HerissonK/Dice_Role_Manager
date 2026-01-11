const express = require('express');
const router = express.Router();

const { createCharacter } = require('../controllers/character.controller');

router.post('/', createCharacter);

module.exports = router;

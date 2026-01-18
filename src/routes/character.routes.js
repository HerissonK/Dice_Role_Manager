const express = require('express');
const router = express.Router();

const {
  createCharacter,
  getCharacterById,
  getAllCharacters
} = require('../controllers/character.controller');

router.post('/', createCharacter);
router.get('/', getAllCharacters);
router.get('/:id', getCharacterById);
module.exports = router;

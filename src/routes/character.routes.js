const express = require('express');
const router = express.Router();

const {
  createCharacter,
  getCharacterById,
  getAllCharacters,
  updateCharacter,
  deleteCharacter
} = require('../controllers/character.controller');

router.post('/', createCharacter);
router.get('/', getAllCharacters);
router.get('/:id', getCharacterById);
router.put('/:id', updateCharacter);
router.delete('/:id', deleteCharacter);
module.exports = router;

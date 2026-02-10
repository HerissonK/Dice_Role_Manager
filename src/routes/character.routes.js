const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');

const {
  createCharacter,
  getCharacters,
  getCharacterById,
  updateCharacter,
  deleteCharacter,
} = require('../controllers/character.controller');

// Auth obligatoire
router.use(authenticate);

// Routes
router.post('/', createCharacter);
router.get('/', getCharacters);
router.get('/:id', getCharacterById);
router.put('/:id', updateCharacter);
router.delete('/:id', deleteCharacter);

module.exports = router;

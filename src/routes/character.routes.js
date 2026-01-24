const express = require('express');
const router = express.Router();

const {
  createCharacter,
  getCharacters,
  getCharacterById,
  updateCharacter,
  deleteCharacter
} = require('../controllers/character.controller');

const { authenticate } = require('../middlewares/auth.middleware');

// Auth obligatoire
router.use(authenticate);

// Routes
router.post('/', createCharacter);
router.get('/', getCharacters);
router.get('/:id', getCharacterById);
router.put('/:id', updateCharacter);
router.delete('/:id', deleteCharacter);

module.exports = router;

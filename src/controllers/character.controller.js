const Character = require('../models/character.model');

const createCharacter = async (req, res) => {
  try {
    const characterId = await Character.create(req.body);

    res.status(201).json({
      id: characterId,
      status: 'created'
    });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
};


const getCharacterById = async (req, res) => {
  try {
    const { id } = req.params;

    const character = await Character.findById(id);

    if (!character) {
      return res.status(404).json({
        error: 'Character not found'
      });
    }

    res.json(character);
  } catch (error) {
    res.status(500).json({
      error: 'Server error'
    });
  }
};

const getAllCharacters = async (req, res) => {
  try {
    const characters = await Character.findAll();
    res.json(characters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
};

module.exports = {
  createCharacter,
  getCharacterById,
  getAllCharacters
};

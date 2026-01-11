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

module.exports = {
  createCharacter
};

const Character = require('../models/character.model');

const createCharacter = async (req, res) => {
  try {
    const characterId = await Character.create({
      ...req.body,
      userId: req.user.id
    });

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

    const character = await Character.findById(id, req.user.id);

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
    const characters = await Character.findAllByUser(req.user.id);
    res.json(characters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
};

const updateCharacter = async (req, res) => {
  console.log('PUT /api/characters/:id HIT');
  console.log(req.body);

  try {
    const { id } = req.params;

    await Character.updateById(id, req.user.id, req.body);

    if (!updated) {
      return res.status(404).json({ error: 'Character not found' });
    }

    res.json({ status: 'updated' });
  } catch (error) {
    console.error('UPDATE ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

async function deleteCharacter(req, res) {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid character ID' });
    }

    await Character.deleteById(id, req.user.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Character not found' });
    }

    return res.status(200).json({ message: 'Character deleted successfully' });

  } catch (error) {
    console.error('Delete Character Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  createCharacter,
  getCharacterById,
  getAllCharacters,
  updateCharacter,
  deleteCharacter
};

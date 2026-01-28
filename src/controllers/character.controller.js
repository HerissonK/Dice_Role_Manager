const Character = require('../models/character.model');
const { calculateArmorClass } = require('../services/armor.service');

/**
 * CREATE
 */
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
    res.status(400).json({ error: error.message });
  }
};

/**
 * GET ALL CHARACTERS (by user)
 */
const getCharacters = async (req, res) => {
  try {
    const characters = await Character.findAllByUser(req.user.id);
    res.json(characters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
};

/**
 * GET ONE CHARACTER
 */
const getCharacterById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid character ID' });
    }

    const character = await Character.findById(id, req.user.id);

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    res.json(character);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * ARMOR CLASS
 */
const getCharacterArmorClass = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid character ID' });
    }

    const character = await Character.findById(id, req.user.id);
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const dex = character.dexterity;
    const dexModifier = Math.floor((dex - 10) / 2);

    const equippedItems = await Character.getEquippedItems(id, req.user.id);

    const armorClass = calculateArmorClass(equippedItems, dexModifier);

    res.json({
      characterId: id,
      armorClass,
      equippedItems
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to calculate armor class' });
  }
};

/**
 * UPDATE
 */
const updateCharacter = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const updated = await Character.updateById(id, req.user.id, req.body);

    if (!updated) {
      return res.status(404).json({ error: 'Character not found' });
    }

    res.json({ status: 'updated' });
  } catch (error) {
    console.error('UPDATE ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE
 */
const deleteCharacter = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const deleted = await Character.deleteById(id, req.user.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Character not found' });
    }

    res.json({ status: 'deleted' });
  } catch (error) {
    console.error('DELETE ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createCharacter,
  getCharacters,
  getCharacterById,
  getCharacterArmorClass,
  updateCharacter,
  deleteCharacter
};

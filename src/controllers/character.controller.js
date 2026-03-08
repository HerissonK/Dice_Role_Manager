const Character = require('../models/character.model');
const { calculateArmorClass } = require('../services/armor.service');
const { AppError } = require('../utils/errorHandler');

/**
 * Utilitaire : parse et valide un ID numérique depuis req.params
 */
function parseId(param) {
  const id = parseInt(param, 10);
  if (isNaN(id)) throw new AppError('Invalid character ID', 400);
  return id;
}

/**
 * CREATE
 */
const createCharacter = async (req, res, next) => {
  try {
    const characterId = await Character.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json({ id: characterId, status: 'created' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET ALL CHARACTERS (by user)
 */
const getCharacters = async (req, res, next) => {
  try {
    const characters = await Character.findAllByUser(req.user.id);
    res.json(characters);
  } catch (error) {
    next(error);
  }
};

/**
 * GET ONE CHARACTER
 */
const getCharacterById = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const character = await Character.findById(id, req.user.id);

    if (!character) {
      throw new AppError('Character not found', 404);
    }

    res.json(character);
  } catch (error) {
    next(error);
  }
};

/**
 * ARMOR CLASS
 */
const getCharacterArmorClass = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);

    const character = await Character.findById(id, req.user.id);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    const dexModifier = Math.floor((character.abilities.dex - 10) / 2);
    const equippedItems = await Character.getEquippedItems(id, req.user.id);
    const armorClass = calculateArmorClass(equippedItems, dexModifier);

    res.json({ characterId: id, armorClass, equippedItems });
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE
 */
const updateCharacter = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const updated = await Character.updateById(id, req.user.id, req.body);

    if (!updated) {
      throw new AppError('Character not found', 404);
    }

    res.json({ status: 'updated' });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE
 */
const deleteCharacter = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const deleted = await Character.deleteById(id, req.user.id);

    if (!deleted) {
      throw new AppError('Character not found', 404);
    }

    res.json({ status: 'deleted' });
  } catch (error) {
    next(error);
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
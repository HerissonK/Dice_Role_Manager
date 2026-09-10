const Character = require('../models/character.model');
const { AppError } = require('../utils/errorHandler');
 
/**
 * Renvoie ce qu'un personnage doit choisir en sorts/tours de magie au
 * niveau 1 pour une classe donnée, avant même sa création (utilisé par
 * le builder à l'étape de choix de la classe).
 * GET /api/classes/:classId/starting-spells
 */
const getStartingSpells = async (req, res, next) => {
  try {
    const classId = parseInt(req.params.classId, 10);
    if (isNaN(classId)) throw new AppError('Invalid class ID', 400);
 
    const result = await Character.getStartingSpellcasting(classId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getStartingFightingStyle = async (req, res, next) => {
  try {
    const classId = parseInt(req.params.classId, 10);
    if (isNaN(classId)) throw new AppError('Invalid class ID', 400);
 
    const result = await Character.getFightingStyleChoice(classId, 1);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getStartingFavoredEnemy = async (req, res, next) => {
  try {
    const classId = parseInt(req.params.classId, 10);
    if (isNaN(classId)) throw new AppError('Invalid class ID', 400);
 
    const result = await Character.getFavoredEnemyChoice(classId, 1);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
 
const getStartingFavoredTerrain = async (req, res, next) => {
  try {
    const classId = parseInt(req.params.classId, 10);
    if (isNaN(classId)) throw new AppError('Invalid class ID', 400);
 
    const result = await Character.getFavoredTerrainChoice(classId, 1);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getStartingExpertise = async (req, res, next) => {
  try {
    const classId = parseInt(req.params.classId, 10);
    if (isNaN(classId)) throw new AppError('Invalid class ID', 400);
 
    const result = await Character.getExpertiseChoice(classId, 1);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
 
module.exports = {
  getStartingSpells,
  getStartingFightingStyle,
  getStartingFavoredEnemy,
  getStartingFavoredTerrain,
  getStartingExpertise
};
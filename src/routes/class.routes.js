const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');
const {
  getStartingSpells,
  getStartingFightingStyle,
  getStartingFavoredEnemy,
  getStartingFavoredTerrain
} = require('../controllers/class.controller');
 
router.use(authenticate);
router.get('/:classId/starting-fighting-style', getStartingFightingStyle);
router.get('/:classId/starting-spells', getStartingSpells);
router.get('/:classId/starting-favored-enemy', getStartingFavoredEnemy);
router.get('/:classId/starting-favored-terrain', getStartingFavoredTerrain);
 
module.exports = router;

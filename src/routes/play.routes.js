const express = require('express');
const router = express.Router();
const playController = require('../controllers/play.controller');
const authenticate = require('../middlewares/auth.middleware');

// Routes existantes
router.get('/play/:id', authenticate, playController.getPlayCharacter);
router.post('/play/:id/roll/ability', authenticate, playController.rollAbility);
router.post('/play/roll', authenticate, playController.rollFreeDice);
router.post('/play/:id/roll/attack', authenticate, playController.rollAttack);
router.post('/play/:id/roll/damage', authenticate, playController.rollDamage);
router.post('/play/:id/roll/resolve-attack', authenticate, playController.resolveAttack);
router.get('/play/:id/journal', authenticate, playController.getRollJournal);

module.exports = router;
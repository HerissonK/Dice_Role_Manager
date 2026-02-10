const express = require('express');
const router = express.Router();
const playController = require('../controllers/play.controller');
const authenticate = require('../middlewares/auth.middleware');

// Charger le personnage pour jouer
router.get('/play/:id', authenticate, playController.getPlayCharacter);

// Lancer un dé pour une capacité
router.post('/play/:id/roll/ability', authenticate, playController.rollAbility);

// Lancer un dé libre
router.post('/play/roll', authenticate, playController.rollFreeDice);

module.exports = router;

const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');
const { getStartingSpells } = require('../controllers/class.controller');
 
router.use(authenticate);
 
router.get('/:classId/starting-spells', getStartingSpells);
 
module.exports = router;

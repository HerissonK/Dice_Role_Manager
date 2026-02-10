const Character = require('../models/character.model');

// Récupérer le personnage pour la page de jeu
exports.getPlayCharacter = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const character = await Character.findById(id, userId);
    if (!character) return res.status(404).json({ message: 'Personnage introuvable' });
    res.json(character);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lancer un dé pour une caractéristique
exports.rollAbility = (req, res) => {
  const { ability } = req.body;
  const value = req.body.value ?? 0;

  const roll = Math.floor(Math.random() * 20) + 1 + value;
  res.json({ roll });
};

// Lancer un dé libre
exports.rollFreeDice = (req, res) => {
  const { dice } = req.body; // ex: "1d6"
  const [count, sides] = dice.split('d').map(Number);
  let total = 0;
  for (let i = 0; i < count; i++) total += Math.floor(Math.random() * sides) + 1;
  res.json({ roll: total });
};

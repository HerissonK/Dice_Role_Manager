const Character = require('../models/character.model');

// ✅ NOUVEAU: Jet d'attaque avec arme
exports.rollAttack = async (req, res) => {
  const { id } = req.params;
  const { weaponId } = req.body;
  const userId = req.user.id;

  try {
    // 1. Récupérer le personnage
    const character = await Character.findById(id, userId);
    if (!character) {
      return res.status(404).json({ message: 'Personnage introuvable' });
    }

    // 2. Trouver l'arme
    const weapon = character.items.find(item => item.id === weaponId);
    if (!weapon || !weapon.damage_dice) {
      return res.status(400).json({ message: 'Arme introuvable' });
    }

    // 3. Calculer le modificateur
    const abilities = character.abilities;
    const attackMod = getAttackModifier(weapon, abilities);
    const proficiencyBonus = 2; // Niveau 1-4

    // 4. Lancer le d20
    const d20Roll = Math.floor(Math.random() * 20) + 1;
    const totalAttack = d20Roll + attackMod + proficiencyBonus;

    // 5. Réponse
    res.json({
      weaponName: weapon.name,
      d20: d20Roll,
      attackModifier: attackMod,
      proficiencyBonus: proficiencyBonus,
      total: totalAttack,
      isCritical: d20Roll === 20,
      isFumble: d20Roll === 1
    });

  } catch (err) {
    console.error('Erreur rollAttack:', err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ NOUVEAU: Jet de dégâts
exports.rollDamage = async (req, res) => {
  const { id } = req.params;
  const { weaponId, isCritical } = req.body;
  const userId = req.user.id;

  try {
    // 1. Récupérer le personnage
    const character = await Character.findById(id, userId);
    if (!character) {
      return res.status(404).json({ message: 'Personnage introuvable' });
    }

    // 2. Trouver l'arme
    const weapon = character.items.find(item => item.id === weaponId);
    if (!weapon || !weapon.damage_dice) {
      return res.status(400).json({ message: 'Arme introuvable' });
    }

    // 3. Parser les dés (ex: "1d6" -> 1 dé de 6 faces)
    const [count, sides] = weapon.damage_dice.split('d').map(Number);
    
    // 4. Lancer les dés
    let rolls = [];
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1);
    }
    
    // 5. Coup critique = doubler les dés
    if (isCritical) {
      for (let i = 0; i < count; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
      }
    }
    
    const diceTotal = rolls.reduce((sum, r) => sum + r, 0);

    // 6. Ajouter le modificateur
    const abilities = character.abilities;
    const damageMod = getAttackModifier(weapon, abilities);
    const totalDamage = diceTotal + damageMod;

    // 7. Réponse
    res.json({
      weaponName: weapon.name,
      damageType: weapon.damage_type,
      dice: weapon.damage_dice,
      rolls: rolls,
      diceTotal: diceTotal,
      damageModifier: damageMod,
      total: totalDamage,
      isCritical: isCritical || false
    });

  } catch (err) {
    console.error('Erreur rollDamage:', err);
    res.status(500).json({ message: err.message });
  }
};

// Fonction helper : Calculer le modificateur d'attaque
function getAttackModifier(weapon, abilities) {
  const strMod = Math.floor((abilities.str - 10) / 2);
  const dexMod = Math.floor((abilities.dex - 10) / 2);

  // Arme à distance → DEX
  if (weapon.category?.includes('ranged')) {
    return dexMod;
  }

  // Arme finesse → meilleur des deux
  if (weapon.properties?.includes('finesse')) {
    return Math.max(strMod, dexMod);
  }

  // Mêlée classique → FOR
  return strMod;
}

// Garder les fonctions existantes
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

exports.rollAbility = (req, res) => {
  const { ability } = req.body;
  const value = req.body.value ?? 0;

  const roll = Math.floor((Math.random() * 20) + 1);
  res.json({ roll });
};

exports.rollFreeDice = (req, res) => {
  const { dice } = req.body;
  const [count, sides] = dice.split('d').map(Number);
  let total = 0;
  for (let i = 0; i < count; i++) total += Math.floor(Math.random() * sides) + 1;
  res.json({ roll: total });
};
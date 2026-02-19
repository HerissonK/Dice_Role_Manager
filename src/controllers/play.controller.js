const Character = require('../models/character.model');

// ✅ NOUVEAU: Jet d'attaque avec arme
exports.rollAttack = async (req, res) => {
  const { id } = req.params;
  const { weaponId } = req.body;
  const userId = req.user.id;

  try {
    const character = await Character.findById(id, userId);
    if (!character) {
      return res.status(404).json({ message: 'Personnage introuvable' });
    }

    // ✅ Cherche par id numérique OU par nom (fallback)
    const weapon = character.items.find(item =>
      item.id === weaponId || item.id === Number(weaponId)
    );
    if (!weapon) {
      return res.status(400).json({ message: `Arme id=${weaponId} introuvable dans les items du personnage` });
    }

    // ✅ Accepte damage_dice (DB) OU damage (data.js legacy)
    const damageDice = weapon.damage_dice || weapon.damage;
    if (!damageDice) {
      return res.status(400).json({ message: 'Cet item n\'est pas une arme' });
    }

    const abilities = character.abilities;
    const attackMod = getWeaponAttackMod(weapon, abilities);
    const proficiencyBonus = 2;

    const d20Roll = Math.floor(Math.random() * 20) + 1;
    const totalAttack = d20Roll + attackMod + proficiencyBonus;

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

exports.rollDamage = async (req, res) => {
  const { id } = req.params;
  const { weaponId, isCritical } = req.body;
  const userId = req.user.id;

  try {
    const character = await Character.findById(id, userId);
    if (!character) {
      return res.status(404).json({ message: 'Personnage introuvable' });
    }

    const weapon = character.items.find(item =>
      item.id === weaponId || item.id === Number(weaponId)
    );
    if (!weapon) {
      return res.status(400).json({ message: `Arme id=${weaponId} introuvable` });
    }

    // ✅ Accepte damage_dice (DB) OU damage (data.js legacy)
    const damageDice = weapon.damage_dice || weapon.damage;
    if (!damageDice) {
      return res.status(400).json({ message: 'Cet item n\'est pas une arme' });
    }

    const [count, sides] = damageDice.split('d').map(Number);

    let rolls = [];
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1);
    }

    // Coup critique = doubler les dés
    if (isCritical) {
      for (let i = 0; i < count; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
      }
    }

    const diceTotal = rolls.reduce((sum, r) => sum + r, 0);
    const abilities = character.abilities;
    
    // ✅ CORRECTION : Utiliser le même modificateur que l'attaque (DEX pour armes à distance)
    const damageMod = getWeaponAttackMod(weapon, abilities);
    const totalDamage = diceTotal + damageMod;

    res.json({
      weaponName: weapon.name,
      damageType: weapon.damage_type || weapon.damageType || '',
      dice: damageDice,
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

/**
 * ✅ FONCTION CORRIGÉE : Calculer le modificateur d'attaque/dégâts
 * Cette fonction gère correctement :
 * - Armes à distance (category ranged) → DEX
 * - Armes finesse → MAX(STR, DEX)
 * - Armes de mêlée → STR
 */
function getWeaponAttackMod(weapon, abilities) {
  const strMod = Math.floor((abilities.str - 10) / 2);
  const dexMod = Math.floor((abilities.dex - 10) / 2);

  // Vérifier si l'arme est à distance via la catégorie
  const category = weapon.category || '';
  const isRanged = category.includes('ranged');

  // ✅ Parser les properties (peut être un string JSON ou un array)
  let properties = weapon.properties || [];
  if (typeof properties === 'string') {
    try { 
      properties = JSON.parse(properties); 
    } catch { 
      properties = []; 
    }
  }
  
  // Vérifier les propriétés spéciales
  const hasRange   = properties.includes('range');
  const isThrown   = properties.includes('thrown');
  const hasFinesse = properties.includes('finesse');

  // 🎯 Arme à distance (sauf thrown) → DEX
  if (isRanged || (hasRange && !isThrown && !hasFinesse)) {
    return dexMod;
  }

  // 🗡️ Arme finesse → MAX(STR, DEX)
  if (hasFinesse) {
    return Math.max(strMod, dexMod);
  }

  // 🪓 Mêlée classique → STR
  return strMod;
}

// ❌ SUPPRIMER l'ancienne fonction getAttackModifier (remplacée par getWeaponAttackMod)

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
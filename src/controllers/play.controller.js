const Character = require('../models/character.model');
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
 * Calcule le modificateur d'attaque/dégâts selon le type d'arme
 * - Armes à distance → DEX
 * - Finesse          → MAX(STR, DEX)
 * - Mêlée classique  → STR
 */
function getWeaponAttackMod(weapon, abilities) {
  const strMod = Math.floor((abilities.str - 10) / 2);
  const dexMod = Math.floor((abilities.dex - 10) / 2);

  const category = weapon.category || '';
  const isRanged = category.includes('ranged');

  let properties = weapon.properties || [];
  if (typeof properties === 'string') {
    try {
      properties = JSON.parse(properties);
    } catch {
      properties = [];
    }
  }

  const hasRange   = properties.includes('range');
  const isThrown   = properties.includes('thrown');
  const hasFinesse = properties.includes('finesse');

  if (isRanged || (hasRange && !isThrown && !hasFinesse)) return dexMod;
  if (hasFinesse) return Math.max(strMod, dexMod);
  return strMod;
}

/**
 * Charge le personnage pour le mode jeu
 */
exports.getPlayCharacter = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const character = await Character.findById(id, req.user.id);

    if (!character) throw new AppError('Personnage introuvable', 404);

    res.json(character);
  } catch (err) {
    next(err);
  }
};

/**
 * Jet de caractéristique — charge le personnage depuis la DB
 * FIX: n'accepte plus la valeur envoyée par le client
 */
exports.rollAbility = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const { ability } = req.body;

    const validAbilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    if (!ability || !validAbilities.includes(ability)) {
      throw new AppError(`Caractéristique invalide. Valeurs acceptées : ${validAbilities.join(', ')}`, 400);
    }

    const character = await Character.findById(id, req.user.id);
    if (!character) throw new AppError('Personnage introuvable', 404);

    const score = character.abilities[ability];
    const modifier = Math.floor((score - 10) / 2);
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + modifier;

    res.json({
      ability,
      score,
      modifier,
      d20,
      total,
      isCritical: d20 === 20,
      isFumble: d20 === 1
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Jet d'attaque avec arme
 */
exports.rollAttack = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const { weaponId } = req.body;

    if (!weaponId) throw new AppError('weaponId est requis', 400);

    const character = await Character.findById(id, req.user.id);
    if (!character) throw new AppError('Personnage introuvable', 404);

    const weapon = character.items.find(item =>
      item.id === weaponId || item.id === Number(weaponId)
    );
    if (!weapon) throw new AppError(`Arme id=${weaponId} introuvable`, 400);

    const damageDice = weapon.damage_dice || weapon.damage;
    if (!damageDice) throw new AppError('Cet item n\'est pas une arme', 400);

    const attackMod = getWeaponAttackMod(weapon, character.abilities);
    const proficiencyBonus = 2;
    const d20 = Math.floor(Math.random() * 20) + 1;

    res.json({
      weaponName: weapon.name,
      d20,
      attackModifier: attackMod,
      proficiencyBonus,
      total: d20 + attackMod + proficiencyBonus,
      isCritical: d20 === 20,
      isFumble: d20 === 1
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Jet de dégâts
 */
exports.rollDamage = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const { weaponId, isCritical } = req.body;

    if (!weaponId) throw new AppError('weaponId est requis', 400);

    const character = await Character.findById(id, req.user.id);
    if (!character) throw new AppError('Personnage introuvable', 404);

    const weapon = character.items.find(item =>
      item.id === weaponId || item.id === Number(weaponId)
    );
    if (!weapon) throw new AppError(`Arme id=${weaponId} introuvable`, 400);

    const damageDice = weapon.damage_dice || weapon.damage;
    if (!damageDice) throw new AppError('Cet item n\'est pas une arme', 400);

    const [count, sides] = damageDice.split('d').map(Number);
    const diceCount = isCritical ? count * 2 : count; // dés doublés sur critique

    const rolls = Array.from({ length: diceCount }, () =>
      Math.floor(Math.random() * sides) + 1
    );

    const diceTotal = rolls.reduce((sum, r) => sum + r, 0);
    const damageMod = getWeaponAttackMod(weapon, character.abilities);

    res.json({
      weaponName: weapon.name,
      damageType: weapon.damage_type || weapon.damageType || '',
      dice: isCritical ? `${diceCount}d${sides}` : damageDice,
      rolls,
      diceTotal,
      damageModifier: damageMod,
      total: diceTotal + damageMod,
      isCritical: isCritical || false
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Lanceur de dés libre (NdX)
 */
exports.rollFreeDice = (req, res, next) => {
  try {
    const { dice } = req.body;

    if (!dice || !dice.includes('d')) {
      throw new AppError('Format invalide. Exemple : "2d6"', 400);
    }

    const [count, sides] = dice.split('d').map(Number);

    if (!count || !sides || count < 1 || sides < 2 || count > 100) {
      throw new AppError('Valeurs de dés invalides (ex: 1d20, 4d6, max 100 dés)', 400);
    }

    const rolls = Array.from({ length: count }, () =>
      Math.floor(Math.random() * sides) + 1
    );

    const total = rolls.reduce((sum, r) => sum + r, 0);

    res.json({ dice, rolls, total });

  } catch (err) {
    next(err);
  }
};
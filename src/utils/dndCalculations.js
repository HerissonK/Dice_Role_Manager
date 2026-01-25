const { weapons, armors } = require('../data/dndData');

function getAbilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

function getWeaponDamage(weaponId, abilities) {
  const weapon = weapons.find(w => w.id === weaponId);
  if (!weapon) return null;

  const ability = weapon.ability;
  const mod = getAbilityModifier(abilities[ability]);

  return {
    weapon: weapon.name,
    formula: `${weapon.damage} ${mod >= 0 ? '+' : ''}${mod}`,
    damageType: weapon.damageType
  };
}

function calculateArmorClass(equipment, abilities) {
  let ac = 10;
  const dexMod = getAbilityModifier(abilities.dexterity);

  equipment.armor.forEach(id => {
    const armor = armors.find(a => a.id === id);
    if (!armor) return;

    if (armor.baseAC) {
      ac = armor.dexBonus ? armor.baseAC + dexMod : armor.baseAC;
    }

    if (armor.bonusAC) {
      ac += armor.bonusAC;
    }
  });

  return ac;
}

module.exports = {
  getAbilityModifier,
  getWeaponDamage,
  calculateArmorClass
};
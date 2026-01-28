function calculateArmorClass(equippedItems, dexModifier) {
  let baseArmor = null;
  let shieldBonus = 0;

  for (const item of equippedItems) {
    // Bouclier
    if (item.category === 'shield') {
      shieldBonus += item.armor_class || 2;
      continue;
    }

    // Armures
    if (item.category.startsWith('armor')) {
      baseArmor = item;
    }
  }

  // Pas d’armure → AC = 10 + DEX
  if (!baseArmor) {
    return 10 + dexModifier + shieldBonus;
  }

  let armorAC = baseArmor.armor_class;

  switch (baseArmor.dex_modifier_rule) {
    case 'full':
      armorAC += dexModifier;
      break;
    case 'max2':
      armorAC += Math.min(dexModifier, 2);
      break;
    case 'none':
      break;
  }

  return armorAC + shieldBonus;
}

module.exports = {
  calculateArmorClass,
};

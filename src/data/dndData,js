// src/data/dndData.js

// ===== ARMES =====
const weapons = [
  {
    id: 'longsword',
    name: 'Épée longue',
    type: 'martial',
    damage: '1d8',
    versatile: '1d10',
    damageType: 'tranchant',
    ability: 'strength'
  },
  {
    id: 'warhammer',
    name: 'Marteau de guerre',
    type: 'martial',
    damage: '1d8',
    versatile: '1d10',
    damageType: 'contondant',
    ability: 'strength'
  },
  {
    id: 'shortsword',
    name: 'Épée courte',
    type: 'martial',
    damage: '1d6',
    finesse: true,
    damageType: 'perforant',
    ability: 'dexterity'
  }
];

// ===== ARMURES =====
const armors = [
  {
    id: 'leather',
    name: 'Armure de cuir',
    type: 'light',
    baseAC: 11,
    dexBonus: true
  },
  {
    id: 'chain_mail',
    name: 'Cotte de mailles',
    type: 'heavy',
    baseAC: 16,
    dexBonus: false,
    stealthDisadvantage: true
  },
  {
    id: 'shield',
    name: 'Bouclier',
    type: 'shield',
    bonusAC: 2
  }
];

// ===== CLASSES =====
const classes = [
  {
    id: 6,
    name: 'Paladin',
    hitDie: 10,
    primaryAbility: 'strength',
    armorProficiencies: ['Toutes armures', 'Boucliers'],
    weaponProficiencies: ['Armes de guerre'],
    savingThrows: ['wisdom', 'charisma'],
    skills: ['Athlétisme', 'Intimidation', 'Persuasion', 'Religion'],
    skillChoices: 2,

    equipmentChoices: [
      {
        id: 'weapon_choice',
        label: 'Choix d’armes',
        options: [
          {
            id: 'sword_shield',
            label: 'Épée longue + Bouclier',
            weapons: ['longsword'],
            armor: ['shield']
          },
          {
            id: 'two_weapons',
            label: 'Épée longue + Marteau',
            weapons: ['longsword', 'warhammer'],
            armor: []
          }
        ]
      },
      {
        id: 'armor_choice',
        label: 'Armure',
        options: [
          {
            id: 'chain_mail',
            label: 'Cotte de mailles',
            armor: ['chain_mail']
          }
        ]
      }
    ]
  }
];

module.exports = {
  weapons,
  armors,
  classes
};

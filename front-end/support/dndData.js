// Données D&D 5e pour le Character Builder

/* ============================
   COMPÉTENCES
============================ */
const allSkills = [
    { id: 1, name: 'Acrobaties', ability: 'dexterity' },
    { id: 2, name: 'Dressage', ability: 'wisdom' },
    { id: 3, name: 'Arcanes', ability: 'intelligence' },
    { id: 4, name: 'Athlétisme', ability: 'strength' },
    { id: 5, name: 'Tromperie', ability: 'charisma' },
    { id: 6, name: 'Histoire', ability: 'intelligence' },
    { id: 7, name: 'Intuition', ability: 'wisdom' },
    { id: 8, name: 'Intimidation', ability: 'charisma' },
    { id: 9, name: 'Investigation', ability: 'intelligence' },
    { id: 10, name: 'Médecine', ability: 'wisdom' },
    { id: 11, name: 'Nature', ability: 'intelligence' },
    { id: 12, name: 'Perception', ability: 'wisdom' },
    { id: 13, name: 'Représentation', ability: 'charisma' },
    { id: 14, name: 'Persuasion', ability: 'charisma' },
    { id: 15, name: 'Religion', ability: 'intelligence' },
    { id: 16, name: 'Escamotage', ability: 'dexterity' },
    { id: 17, name: 'Discrétion', ability: 'dexterity' },
    { id: 18, name: 'Survie', ability: 'wisdom' },
];

/* ============================
   RACES
============================ */
const races = [
    {
        id: 1,
        name: 'Humain',
        description: 'Polyvalents et ambitieux, les humains sont la race la plus répandue.',
        abilityBonuses: {
            strength: 1,
            dexterity: 1,
            constitution: 1,
            intelligence: 1,
            wisdom: 1,
            charisma: 1,
        },
        traits: ['Polyvalence'],
        speed: 30,
        languages: ['Commun', '+1 au choix'],
    },
    {
        id: 2,
        name: 'Elfe',
        description: 'Êtres gracieux et immortels, doués de sens aiguisés.',
        abilityBonuses: { dexterity: 2 },
        traits: ['Vision dans le noir', 'Sens aiguisés', 'Ascendance féerique', 'Transe'],
        speed: 30,
        languages: ['Commun', 'Elfique'],
    },
    {
        id: 3,
        name: 'Nain',
        description: 'Robustes et endurants, artisans et guerriers courageux.',
        abilityBonuses: { constitution: 2 },
        traits: ['Vision dans le noir', 'Résistance naine', 'Connaissance de la pierre'],
        speed: 25,
        languages: ['Commun', 'Nain'],
    },
    {
        id: 4,
        name: 'Halfelin',
        description: 'Petits et agiles, chanceux et discrets.',
        abilityBonuses: { dexterity: 2 },
        traits: ['Chanceux', 'Brave', 'Agilité halfeline'],
        speed: 25,
        languages: ['Commun', 'Halfelin'],
    },
    {
        id: 5,
        name: 'Drakéide',
        description: 'Descendants des dragons.',
        abilityBonuses: { strength: 2, charisma: 1 },
        traits: ['Ascendance draconique', 'Arme de souffle'],
        speed: 30,
        languages: ['Commun', 'Draconique'],
    },
    {
        id: 6,
        name: 'Demi-elfe',
        description: 'Combinant les meilleurs aspects humains et elfiques.',
        abilityBonuses: { charisma: 2 },
        traits: ['Vision dans le noir', 'Ascendance féerique'],
        speed: 30,
        languages: ['Commun', 'Elfique', '+1 au choix'],
    },
];

/* ============================
   ARMES
============================ */

const weapons = {
    longsword: {
        id: 'longsword',
        name: 'Épée longue',
        category: 'martial_melee',
        damage: '1d8',
        damageType: 'slashing',
        properties: ['versatile'],
        versatileDamage: '1d10'
    },

    shortsword: {
        id: 'shortsword',
        name: 'Epée courte',
        category: 'martial_melee',
        damage: '1d6',
        damageType: 'piercing',
        properties: ['finesse', 'light'],
        versatileDamage: '1d8'
    },

    greatsword: {
        id: 'greatsword',
        name: 'Epée a deux mains',
        category: 'martial_melee',
        damage: '2d6',
        damageType: 'slashing',
        properties: ['heavy', 'two-handed'],
        versatileDamage: '2d6'
    },

    javelin: {
        id: 'javelin',
        name: 'Javelot',
        category: 'simple_melee',
        damage: '1d6',
        damageType: 'piercing',
        properties: ['thrown', 'range'],
        range: '30/120'
    },

    morningstar: {
        id: 'morningstar',
        name: 'Étoile du matin',
        category: 'martial_melee',
        damage: '1d8',
        damageType: 'piercing',
        properties: []
    },

    shortbow: {
        id: 'shortbow',
        name: 'Arc court',
        category: 'simple_ranged',
        damage: '1d6',
        damageType: 'piercing',
        properties: ['range'],
        range: '80/320'
    },

    longbow: {
        id: 'longbow',
        name: 'Arc long',
        category: 'martial_ranged',
        damage: '1d8',
        damageType: 'piercing',
        properties: ['heavy', 'range', 'two-handed'],
        range: '150/600'
    },

    dagger: {
        id: 'dagger',
        name: 'Dague',
        category: 'simple_melee',
        damage: '1d4',
        damageType: 'piercing',
        properties: ['finesse', 'light', 'thrown'],
        range: '20/60'
    },

    crossbow_light: {
        id: 'crossbow_light',
        name: 'Arbalète légère',
        category: 'simple_ranged',
        damage: '1d8',
        damageType: 'piercing',
        properties: ['loading', 'range', 'two-handed'],
        range: '80/320'
    },

    rapier: {
        id: 'rapier',
        name: 'Rapière',
        category: 'martial_melee',
        damage: '1d8',
        damageType: 'piercing',
        properties: ['finesse']
    }
};


/* ============================
   ARMURES
============================ */
const armors = {
    padded: {
        id: 'padded',
        name: 'Armure matelassée',
        category: 'armor_light',
        armor_class: 11,
        dex_modifier_rule: 'full',
    },
    leather: {
        id: 'leather',
        name: 'Armure de cuir',
        category: 'armor_light',
        armor_class: 11,
        dex_modifier_rule: 'full',
    },
    studded_leather: {
        id: 'studded_leather',
        name: 'Armure de cuir cloutée',
        category: 'armor_light',
        armor_class: 12,
        dex_modifier_rule: 'full',
    },
    hide: {
        id: 'hide',
        name: 'Armure de peau',
        category: 'armor_medium',
        armor_class: 12,
        dex_modifier_rule: 'max2',
    },
    chain_shirt: {
        id: 'chain_shirt',
        name: 'Chemise de mailles',
        category: 'armor_medium',
        armor_class: 13,
        dex_modifier_rule: 'max2',
    },
    scale_mail: {
        id: 'scale_mail',
        name: 'Cotte d’écailles',
        category: 'armor_medium',
        armor_class: 14,
        dex_modifier_rule: 'max2',
    },
    breastplate: {
        id: 'breastplate',
        name: 'Cuirasse',
        category: 'armor_medium',
        armor_class: 14,
        dex_modifier_rule: 'max2',
    },
    half_plate: {
        id: 'half_plate',
        name: 'Demi-plate',
        category: 'armor_medium',
        armor_class: 15,
        dex_modifier_rule: 'max2',
    },
    ring_mail: {
        id: 'ring_mail',
        name: 'Broigne',
        category: 'armor_heavy',
        armor_class: 14,
        dex_modifier_rule: 'none',
    },
    chain_mail: {
        id: 'chain_mail',
        name: 'Cotte de mailles',
        category: 'armor_heavy',
        armor_class: 16,
        dex_modifier_rule: 'none',
    },
    splint: {
        id: 'splint',
        name: 'Clibanion',
        category: 'armor_heavy',
        armor_class: 17,
        dex_modifier_rule: 'none',
    },
    plate: {
        id: 'plate',
        name: 'Harnois',
        category: 'armor_heavy',
        armor_class: 18,
        dex_modifier_rule: 'none',
    }
};


/* ============================
   CLASSES
============================ */
const classes = [
    {
        id: 1,
        name: 'Guerrier',
        description: 'Maître des armes et des armures.',
        hitDie: 10,
        primaryAbility: 'strength',
        savingThrows: ['strength', 'constitution'],
        armorProficiencies: ['Toutes armures', 'Boucliers'],
        weaponProficiencies: ['Armes courantes', 'Armes de guerre'],
        skills: ['Acrobaties', 'Athlétisme', 'Dressage', 'Histoire', 'Intimidation', 'Intuition', 'Perception', 'Survie'],
        skillChoices: 2,

        // ✅ ÉQUIPEMENT
        equipmentChoices: [
            {
                id: 'weapon_main',
                label: 'Arme principale',
                options: [
                    {
                        id: 'martial_weapon_shield',
                        name: 'Protecteur',
                        items: ['Epée longue', 'Bouclier', 'Cotte de mailles'],
                        itemsData: [
                            armors.chain_mail,
                            weapons.longsword,
                            { name: 'Bouclier', category: 'shield', armor_class: 2 }
                        ]
                    },
                    {
                        id: 'two_martial_weapons',
                        name: 'Combattant à deux mains',
                        items: ['Epée à deux mains', 'Cotte de mailles'],
                        itemsData: [
                            armors.chain_mail,
                            weapons.greatsword
                        ]
                    }
                ]
            },
            {
                id: 'pack',
                label: 'Paquetage',
                options: [
                    {
                        id: 'priest_pack',
                        name: 'Paquetage d’explorateur souterain',
                        items: ['Sac', 'Bougies', 'Encens', 'Vêtements', 'Rations']
                    },
                    {
                        id: 'explorer_pack',
                        name: 'Paquetage d’explorateur',
                        items: ['Sac', 'Torche', 'Corde', 'Rations']
                    }
                ]
            }
        ]
    },
    {
        id: 2,
        name: 'Magicien',
        description: 'Érudit de la magie arcanique.',
        hitDie: 6,
        primaryAbility: 'intelligence',
        savingThrows: ['intelligence', 'wisdom'],
        armorProficiencies: ['Aucune'],
        weaponProficiencies: ['Dague', 'Bâton'],
        skills: ['Arcanes', 'Histoire', 'Intuition', 'Investigation', 'Médecine', 'Religion'],
        skillChoices: 2,

        // ✅ ÉQUIPEMENT
        equipmentChoices: [
            {
                id: 'weapon_main',
                label: 'Arme principale',
                options: [
                    {
                        id: 'martial_weapon_shield',
                        name: 'Dague',
                        items: ['dagger'],
                        itemsData: [
                            weapons.dagger,
                        ]
                        
                    },
                    {
                        id: 'two_martial_weapons',
                        name: 'Dague',
                        items: ['dagger'],
                        itemsData: [
                            weapons.dagger,
                        ]
                    }
                ]
            },
            {
                id: 'pack',
                label: 'Paquetage',
                options: [
                    {
                        id: 'priest_pack',
                        name: 'Paquetage de l’erudit',
                        items: ['Sac', 'Bougies', 'Encens', 'Vêtements', 'Rations']
                    },
                    {
                        id: 'explorer_pack',
                        name: 'Paquetage d’explorateur',
                        items: ['Sac', 'Torche', 'Corde', 'Rations']
                    }
                ]
            }
        ]
    },
    {
        id: 3,
        name: 'Roublard',
        description: 'Expert en discrétion.',
        hitDie: 8,
        primaryAbility: 'dexterity',
        savingThrows: ['dexterity', 'intelligence'],
        armorProficiencies: ['Armures légères'],
        weaponProficiencies: ['Armes courantes'],
        skills: ['Acrobaties', 'Athlétisme', 'Discrétion', 'Escamotage', 'Intimidation', 'Perception', 'Persuasion'],
        skillChoices: 4,

        // ✅ ÉQUIPEMENT
        equipmentChoices: [
            {
                id: 'weapon_main',
                label: 'Arme principale',
                options: [
                    {
                        id: 'martial_weapon_shield',
                        name: 'Rapiere + arc court',
                        items: ['Rapiere', 'arc court', 'armure de cuir'],
                        itemsData: [
                            weapons.rapier,
                            weapons.shortbow,
                            armors.leather,
                        ]
                    },
                    {
                        id: 'two_martial_weapons',
                        name: 'Deux epees courtes',
                        items: ['2 Epee courte', 'armure de cuir'],
                        itemsData: [
                            weapons.shortsword,
                            weapons.shortsword,
                            armors.leather,
                        ]
                    }
                ]
            },
            {
                id: 'pack',
                label: 'Paquetage',
                options: [
                    {
                        id: 'priest_pack',
                        name: 'Paquetage du cambrioleur',
                        items: ['Sac', 'Bougies', 'Encens', 'Vêtements', 'Rations']
                    },
                    {
                        id: 'explorer_pack',
                        name: 'Paquetage d’explorateur',
                        items: ['Sac', 'Torche', 'Corde', 'Rations']
                    }
                ]
            }
        ]
    },
    {
        id: 4,
        name: 'Clerc',
        description: 'Intermédiaire divin.',
        hitDie: 8,
        primaryAbility: 'wisdom',
        savingThrows: ['wisdom', 'charisma'],
        armorProficiencies: ['Armures légères', 'Boucliers'],
        weaponProficiencies: ['Armes courantes'],
        skills: ['Histoire', 'Intuition', 'Médecine', 'Religion'],
        skillChoices: 2,

        // ✅ ÉQUIPEMENT
        equipmentChoices: [
            {
                id: 'weapon_main',
                label: 'Arme principale',
                options: [
                    {
                        id: 'martial_weapon_shield',
                        name: 'Masse + bouclier',
                        items: ['Morgenstern', 'bouclier', 'armure d\'écailles'],
                        itemsData: [
                            armors.scale_mail,
                            weapons.morningstar,
                            { name: 'Bouclier', category: 'shield', armor_class: 2 }
                        ]
                    },
                    {
                        id: 'two_martial_weapons',
                        name: 'Masse + bouclier',
                        items: ['Morgenstern', 'bouclier', 'Armure de cuir'],
                        itemsData: [
                            armors.leather,
                            weapons.morningstar,
                            { name: 'Bouclier', category: 'shield', armor_class: 2 }
                        ]
                    }
                ]
            },
            {
                id: 'pack',
                label: 'Paquetage',
                options: [
                    {
                        id: 'priest_pack',
                        name: 'Paquetage de l’ecclésiastique',
                        items: ['Sac', 'Bougies', 'Encens', 'Vêtements', 'Rations']
                    },
                    {
                        id: 'explorer_pack',
                        name: 'Paquetage d’explorateur',
                        items: ['Sac', 'Torche', 'Corde', 'Rations']
                    }
                ]
            }
        ]
    },
    {
        id: 5,
        name: 'Rôdeur',
        description: 'Traqueur et éclaireur.',
        hitDie: 10,
        primaryAbility: 'dexterity',
        savingThrows: ['strength', 'dexterity'],
        armorProficiencies: ['Armures légères', 'Boucliers'],
        weaponProficiencies: ['Armes de guerre'],
        skills: ['Athlétisme', 'Discrétion', 'Nature', 'Perception', 'Survie'],
        skillChoices: 3,

        // ✅ ÉQUIPEMENT
        equipmentChoices: [
            {
                id: 'weapon_main',
                label: 'Archetype d\'equipment',
                options: [
                    {
                        id: 'martial_weapon_shield',
                        name: 'Guerrier',
                        items: ['armure en ecailles', '2 epees courtes', 'arc long', 'carquois avec 20 fleches'],
                        itemsData: [
                            armors.scale_mail,
                            weapons.shortsword,
                            weapons.shortsword,
                            weapons.longbow
                        ]
                    },
                    {
                        id: 'two_martial_weapons',
                        name: 'Rôdeur',
                        items: ['armure en cuir', '2 epees courtes', 'arc long', 'carquois avec 20 fleches'],
                        itemsData: [
                            armors.leather,
                            weapons.shortsword,
                            weapons.shortsword,
                            weapons.longbow
                        ]
                    }
                ]
            },
            {
                id: 'pack',
                label: 'Paquetage',
                options: [
                    {
                        id: 'priest_pack',
                        name: 'Paquetage de l’explorateur soutairrain',
                        items: ['Sac', 'Bougies', 'Encens', 'Vêtements', 'Rations']
                    },
                    {
                        id: 'explorer_pack',
                        name: 'Paquetage d’explorateur',
                        items: ['Sac', 'Torche', 'Corde', 'Rations']
                    }
                ]
            },
        ]
    },
    {
        id: 6,
        name: 'Paladin',
        description: 'Guerrier sacré.',
        hitDie: 10,
        primaryAbility: 'strength',
        savingThrows: ['wisdom', 'charisma'],
        armorProficiencies: ['Toutes armures', 'Boucliers'],
        weaponProficiencies: ['Armes de guerre'],
        skills: ['Athlétisme', 'Intimidation', 'Persuasion', 'Religion'],
        skillChoices: 2,

        // ✅ ÉQUIPEMENT
        equipmentChoices: [
            {
                id: 'weapon_main',
                label: 'Arme principale',
                options: [
                    {
                        id: 'martial_weapon_shield',
                        name: 'Épée longue + bouclier',
                        items: ['Epee longue', 'bouclier'],
                        itemsData: [
                            armors.chain_mail,
                            weapons.longsword,
                            { name: 'Bouclier', category: 'shield', armor_class: 2 }
                        ]
                    },
                    {
                        id: 'two_martial_weapons',
                        name: 'Épée à deux mains',
                        items: ['Epee a deux mains'],
                        itemsData: [
                            armors.chain_mail,
                            weapons.greatsword
                        ]
                    }
                ]
            },
            {
                id: 'pack',
                label: 'Paquetage',
                options: [
                    {
                        id: 'priest_pack',
                        name: 'Paquetage de prêtre',
                        items: ['Sac', 'Bougies', 'Encens', 'Vêtements', 'Rations']
                    },
                    {
                        id: 'explorer_pack',
                        name: 'Paquetage d’explorateur',
                        items: ['Sac', 'Torche', 'Corde', 'Rations']
                    }
                ]
            },
        ]
    }

];

/* ============================
   HISTORIQUES
============================ */
const backgrounds = [
    { id: 1, name: 'Acolyte', skillProficiencies: ['Intuition', 'Religion'], toolProficiencies: [], languages: 2, feature: 'Refuge des fidèles', equipment: [] },
    { id: 2, name: 'Criminel', skillProficiencies: ['Discrétion', 'Tromperie'], toolProficiencies: [], languages: 0, feature: 'Relations dans la pègre', equipment: [] },
    { id: 3, name: 'Érudit', skillProficiencies: ['Arcanes', 'Histoire'], toolProficiencies: [], languages: 2, feature: 'Chercheur', equipment: [] },
    { id: 4, name: 'Soldat', skillProficiencies: ['Athlétisme', 'Intimidation'], toolProficiencies: [], languages: 0, feature: 'Grade militaire', equipment: [] },
    { id: 5, name: 'Héros du peuple', skillProficiencies: ['Dressage', 'Survie'], toolProficiencies: [], languages: 0, feature: 'Hospitalité rustique', equipment: [] },
    { id: 6, name: 'Noble', skillProficiencies: ['Histoire', 'Persuasion'], toolProficiencies: [], languages: 1, feature: 'Position privilégiée', equipment: [] },
];

/* ============================
   POINT BUY
============================ */
const pointBuyCosts = {
    8: 0,
    9: 1,
    10: 2,
    11: 3,
    12: 4,
    13: 5,
    14: 7,
    15: 9,
};

/* ============================
   UTILITAIRES
============================ */
function getAbilityModifier(score) {
    return Math.floor((score - 10) / 2);
}

const abilityNames = {
    strength: 'Force',
    dexterity: 'Dextérité',
    constitution: 'Constitution',
    intelligence: 'Intelligence',
    wisdom: 'Sagesse',
    charisma: 'Charisme',
};

const abilityAbbrev = {
    strength: 'FOR',
    dexterity: 'DEX',
    constitution: 'CON',
    intelligence: 'INT',
    wisdom: 'SAG',
    charisma: 'CHA',
};

const abilityDescriptions = {
    strength: 'Puissance physique',
    dexterity: 'Agilité',
    constitution: 'Endurance',
    intelligence: 'Raisonnement',
    wisdom: 'Perception',
    charisma: 'Présence',
};

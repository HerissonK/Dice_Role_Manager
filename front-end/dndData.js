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
                        name: 'Arme de guerre + bouclier',
                        items: ['Arme de guerre', 'Bouclier']
                    },
                    {
                        id: 'two_martial_weapons',
                        name: 'Deux armes de guerre',
                        items: ['Arme de guerre', 'Arme de guerre']
                    }
                ]
            },
            {
                id: 'javelins_or_weapon',
                label: 'Arme secondaire',
                options: [
                    {
                        id: 'javelins',
                        name: 'Cinq javelots',
                        items: ['Javelot x5']
                    },
                    {
                        id: 'simple_weapon',
                        name: 'Arme courante',
                        items: ['Arme courante']
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
            {
                id: 'holy_symbol',
                label: 'Symbole sacré',
                options: [
                    {
                        id: 'emblem',
                        name: 'Emblème sacré',
                        items: ['Emblème sacré']
                    },
                    {
                        id: 'amulet',
                        name: 'Amulette',
                        items: ['Amulette']
                    }
                ]
            }
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


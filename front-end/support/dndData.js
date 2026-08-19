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
        subspecies: [],
    },
    {
        id: 2,
        name: 'Elfe',
        description: 'Êtres gracieux et immortels, doués de sens aiguisés.',
        abilityBonuses: { dexterity: 2 },
        traits: ['Vision dans le noir', 'Sens aiguisés', 'Ascendance féerique', 'Transe'],
        speed: 30,
        languages: ['Commun', 'Elfique'],
        subspecies: [
            {
                id: 3,
                name: 'Haut-elfe',
                description: 'Formé aux arts martiaux et versé dans la magie arcanique.',
                abilityBonuses: { intelligence: 1 },
                traits: ['Sort mineur (cantrip) au choix', 'Maîtrise d\'une arme de guerre'],
            },
            {
                id: 4,
                name: 'Elfe sylvestre',
                description: 'Rapide et discret, en harmonie avec les forêts profondes.',
                abilityBonuses: { wisdom: 1 },
                traits: ['Masque de la nature (camouflage)', 'Vitesse accrue'],
                speedOverride: 35,
            },
        ],
    },
    {
        id: 3,
        name: 'Nain',
        description: 'Robustes et endurants, artisans et guerriers courageux.',
        abilityBonuses: { constitution: 2 },
        traits: ['Vision dans le noir', 'Résistance naine', 'Connaissance de la pierre'],
        speed: 25,
        languages: ['Commun', 'Nain'],
        subspecies: [
        {
            id: 1,
            name: 'Nain des collines',
            description: 'Sens aiguisés, intuition profonde et grande résistance.',
            abilityBonuses: { wisdom: 1 },
            traits: ['Ténacité naine (+1 PV par niveau)'],
        },
        {
            id: 2,
            name: 'Nain des montagnes',
            description: 'Robuste et habitué au maniement des armes et armures.',
            abilityBonuses: { strength: 2 },
            traits: ['Maîtrise des armures légères et intermédiaires'],
        },
        ],
    },
    {
        id: 4,
        name: 'Halfelin',
        description: 'Petits et agiles, chanceux et discrets.',
        abilityBonuses: { dexterity: 2 },
        traits: ['Chanceux', 'Brave', 'Agilité halfeline'],
        speed: 25,
        languages: ['Commun', 'Halfelin'],
        subspecies: [
            {
                id: 7,
                name: 'Halfelin pied-léger',
                description: 'Discret et sociable, capable de se dissimuler facilement.',
                abilityBonuses: { charisma: 1 },
                traits: ['Discrétion naturelle (peut se cacher derrière une créature plus grande)'],
            },
            {
                id: 8,
                name: 'Halfelin robuste',
                description: 'Plus résistant physiquement que ses cousins.',
                abilityBonuses: { constitution: 1 },
                traits: ['Résistance au poison'],
            },
        ],
    },
    {
        id: 5,
        name: 'Drakéide',
        description: 'Descendants des dragons.',
        abilityBonuses: { strength: 2, charisma: 1 },
        traits: ['Ascendance draconique', 'Arme de souffle'],
        speed: 30,
        languages: ['Commun', 'Draconique'],
        subspecies: [],
    },
    {
        id: 6,
        name: 'Demi-elfe',
        description: 'Combinant les meilleurs aspects humains et elfiques.',
        abilityBonuses: { charisma: 2 },
        traits: ['Vision dans le noir', 'Ascendance féerique'],
        speed: 30,
        languages: ['Commun', 'Elfique', '+1 au choix'],
        subspecies: [],
    },
    {
        id: 7,
        name: 'Demi-orc',
        description: 'Puissants et endurants, tiraillés entre deux héritages.',
        abilityBonuses: { strength: 2, constitution: 1 },
        traits: ['Vision dans le noir', 'Robustesse implacable', 'Attaques sauvages'],
        speed: 30,
        languages: ['Commun', 'Orc'],
        subspecies: [],
    },
    {
        id: 8,
        name: 'Gnome',
        description: 'Petits, curieux et ingénieux, doués pour la magie et l\'artisanat.',
        abilityBonuses: { intelligence: 2 },
        traits: ['Vision dans le noir', 'Ruse gnome'],
        speed: 25,
        languages: ['Commun', 'Gnome'],
        subspecies: [
            {
                id: 5,
                name: 'Gnome des forêts',
                description: 'Discret et doué pour l\'illusion, à l\'aise avec les petits animaux.',
                abilityBonuses: { dexterity: 1 },
                traits: ['Illusion mineure (cantrip)', 'Communication avec les petites bêtes'],
            },
            {
                id: 6,
                name: 'Gnome des rochers',
                description: 'Bricoleur ingénieux, robuste et inventif.',
                abilityBonuses: { constitution: 1 },
                traits: ['Bricolage (créations mécaniques miniatures)'],
            },
        ],
    },
    {
        id: 9,
        name: 'Tieffelin',
        description: 'Marqués par un héritage infernal lointain.',
        abilityBonuses: { charisma: 2, intelligence: 1 },
        traits: ['Vision dans le noir', 'Résistance infernale', 'Legs de l\'infernal'],
        speed: 30,
        languages: ['Commun', 'Infernal'],
        subspecies: [],
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
    },

    // ============================
    // ARMES COURANTES DE MÊLÉE (ajoutées)
    // ============================
    club: {
        id: 'club',
        name: 'Gourdin',
        category: 'simple_melee',
        damage: '1d4',
        damageType: 'bludgeoning',
        properties: ['light']
    },
    greatclub: {
        id: 'greatclub',
        name: 'Gourdin géant',
        category: 'simple_melee',
        damage: '1d8',
        damageType: 'bludgeoning',
        properties: ['two-handed']
    },
    handaxe: {
        id: 'handaxe',
        name: 'Hachette',
        category: 'simple_melee',
        damage: '1d6',
        damageType: 'slashing',
        properties: ['light', 'thrown'],
        range: '20/60'
    },
    lighthammer: {
        id: 'lighthammer',
        name: 'Marteau léger',
        category: 'simple_melee',
        damage: '1d4',
        damageType: 'bludgeoning',
        properties: ['light', 'thrown'],
        range: '20/60'
    },
    mace: {
        id: 'mace',
        name: 'Masse d\'armes',
        category: 'simple_melee',
        damage: '1d6',
        damageType: 'bludgeoning',
        properties: []
    },
    quarterstaff: {
        id: 'quarterstaff',
        name: 'Bâton',
        category: 'simple_melee',
        damage: '1d6',
        damageType: 'bludgeoning',
        properties: ['versatile'],
        versatileDamage: '1d8'
    },
    sickle: {
        id: 'sickle',
        name: 'Faucille',
        category: 'simple_melee',
        damage: '1d4',
        damageType: 'slashing',
        properties: ['light']
    },
    spear: {
        id: 'spear',
        name: 'Épieu',
        category: 'simple_melee',
        damage: '1d6',
        damageType: 'piercing',
        properties: ['thrown', 'versatile'],
        versatileDamage: '1d8',
        range: '20/60'
    },

    // ============================
    // ARMES COURANTES À DISTANCE
    // ============================
    dart: {
        id: 'dart',
        name: 'Fléchette',
        category: 'simple_ranged',
        damage: '1d4',
        damageType: 'piercing',
        properties: ['finesse', 'thrown'],
        range: '20/60'
    },
    sling: {
        id: 'sling',
        name: 'Fronde',
        category: 'simple_ranged',
        damage: '1d4',
        damageType: 'bludgeoning',
        properties: ['range'],
        range: '30/120'
    },

    // ============================
    // ARMES DE GUERRE DE MÊLÉE
    // ============================
    battleaxe: {
        id: 'battleaxe',
        name: 'Hache d\'armes',
        category: 'martial_melee',
        damage: '1d8',
        damageType: 'slashing',
        properties: ['versatile'],
        versatileDamage: '1d10'
    },
    greataxe: {
        id: 'greataxe',
        name: 'Hache d\'armes à deux mains',
        category: 'martial_melee',
        damage: '1d12',
        damageType: 'slashing',
        properties: ['heavy', 'two-handed']
    },
    flail: {
        id: 'flail',
        name: 'Fléau d\'armes',
        category: 'martial_melee',
        damage: '1d8',
        damageType: 'bludgeoning',
        properties: []
    },
    glaive: {
        id: 'glaive',
        name: 'Glaive',
        category: 'martial_melee',
        damage: '1d10',
        damageType: 'slashing',
        properties: ['heavy', 'reach', 'two-handed']
    },
    halberd: {
        id: 'halberd',
        name: 'Hallebarde',
        category: 'martial_melee',
        damage: '1d10',
        damageType: 'slashing',
        properties: ['heavy', 'reach', 'two-handed']
    },
    lance: {
        id: 'lance',
        name: 'Lance de cavalier',
        category: 'martial_melee',
        damage: '1d12',
        damageType: 'piercing',
        properties: ['reach', 'special']
    },
    maul: {
        id: 'maul',
        name: 'Maillet',
        category: 'martial_melee',
        damage: '2d6',
        damageType: 'bludgeoning',
        properties: ['heavy', 'two-handed']
    },
    pike: {
        id: 'pike',
        name: 'Pique',
        category: 'martial_melee',
        damage: '1d10',
        damageType: 'piercing',
        properties: ['heavy', 'reach', 'two-handed']
    },
    scimitar: {
        id: 'scimitar',
        name: 'Cimeterre',
        category: 'martial_melee',
        damage: '1d6',
        damageType: 'slashing',
        properties: ['finesse', 'light']
    },
    trident: {
        id: 'trident',
        name: 'Trident',
        category: 'martial_melee',
        damage: '1d6',
        damageType: 'piercing',
        properties: ['thrown', 'versatile'],
        versatileDamage: '1d8',
        range: '20/60'
    },
    warpick: {
        id: 'warpick',
        name: 'Pic de guerre',
        category: 'martial_melee',
        damage: '1d8',
        damageType: 'piercing',
        properties: []
    },
    warhammer: {
        id: 'warhammer',
        name: 'Marteau de guerre',
        category: 'martial_melee',
        damage: '1d8',
        damageType: 'bludgeoning',
        properties: ['versatile'],
        versatileDamage: '1d10'
    },
    whip: {
        id: 'whip',
        name: 'Fouet',
        category: 'martial_melee',
        damage: '1d4',
        damageType: 'slashing',
        properties: ['finesse', 'reach']
    },

    // ============================
    // ARMES DE GUERRE À DISTANCE
    // ============================
    handcrossbow: {
        id: 'handcrossbow',
        name: 'Arbalète de poing',
        category: 'martial_ranged',
        damage: '1d6',
        damageType: 'piercing',
        properties: ['light', 'loading', 'range'],
        range: '30/120'
    },
    heavycrossbow: {
        id: 'heavycrossbow',
        name: 'Arbalète lourde',
        category: 'martial_ranged',
        damage: '1d10',
        damageType: 'piercing',
        properties: ['heavy', 'loading', 'range', 'two-handed'],
        range: '100/400'
    },
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
    },
    {
        id: 7,
        name: 'Barbare',
        description: 'Guerrier primitif capable d\'entrer dans une rage destructrice.',
        hitDie: 12,
        primaryAbility: 'strength',
        savingThrows: ['strength', 'constitution'],
        armorProficiencies: ['Armures légères', 'Armures intermédiaires', 'Boucliers'],
        weaponProficiencies: ['Armes courantes', 'Armes de guerre'],
        skills: ['Dressage', 'Athlétisme', 'Intimidation', 'Nature', 'Perception', 'Survie'],
        skillChoices: 2,

        equipmentChoices: [
            {
                id: 'weapon_main',
                label: 'Arme principale',
                options: [
                    {
                        id: 'greataxe_javelins',
                        name: 'Guerrier bestial',
                        items: ['Hache d\'armes à deux mains', 'Javelot'],
                        itemsData: [weapons.greataxe, weapons.javelin]
                    },
                    {
                        id: 'handaxes_javelins',
                        name: 'Chasseur',
                        items: ['Hachette', 'Hachette', 'Javelot'],
                        itemsData: [weapons.handaxe, weapons.handaxe, weapons.javelin]
                    }
                ]
            },
            {
                id: 'pack',
                label: 'Paquetage',
                options: [
                    {
                        id: 'priest_pack',
                        name: 'Paquetage du guerrier',
                        items: ['Sac', 'Bougies', 'Encens', 'Vêtements', 'Rations']
                    },
                    {
                        id: 'explorer_pack',
                        name: 'Paquetage d\'explorateur',
                        items: ['Sac', 'Torche', 'Corde', 'Rations']
                    }
                ]
            }
        ]
    },
    {
        id: 8,
        name: 'Barde',
        description: 'Artiste polyvalent qui manie la magie par la musique et les mots.',
        hitDie: 8,
        primaryAbility: 'charisma',
        savingThrows: ['dexterity', 'charisma'],
        armorProficiencies: ['Armures légères'],
        weaponProficiencies: ['Armes courantes', 'Arbalète de poing', 'Épée longue', 'Rapière', 'Épée courte'],
        skills: ['Acrobaties', 'Dressage', 'Arcanes', 'Athlétisme', 'Tromperie', 'Histoire', 'Intuition', 'Intimidation', 'Investigation', 'Médecine', 'Nature', 'Perception', 'Représentation', 'Persuasion', 'Religion', 'Escamotage', 'Discrétion', 'Survie'],
        skillChoices: 3,

        equipmentChoices: [
            {
                id: 'weapon_main',
                label: 'Arme principale',
                options: [
                    {
                        id: 'rapier_dagger',
                        name: 'Barde vagabond',
                        items: ['Rapière', 'Dague', 'Armure de cuir'],
                        itemsData: [weapons.rapier, weapons.dagger, armors.leather]
                    },
                    {
                        id: 'longsword_dagger',
                        name: 'Barde érudit',
                        items: ['Épée longue', 'Dague', 'Armure de cuir'],
                        itemsData: [weapons.longsword, weapons.dagger, armors.leather]
                    }
                ]
            },
            {
                id: 'pack',
                label: 'Paquetage',
                options: [
                    {
                        id: 'priest_pack',
                        name: 'Paquetage du ménestrel',
                        items: ['Sac', 'Bougies', 'Encens', 'Vêtements', 'Rations']
                    },
                    {
                        id: 'explorer_pack',
                        name: 'Paquetage d\'explorateur',
                        items: ['Sac', 'Torche', 'Corde', 'Rations']
                    }
                ]
            }
        ]
    },
    {
        id: 9,
        name: 'Druide',
        description: 'Gardien de la nature, capable de se transformer en animal.',
        hitDie: 8,
        primaryAbility: 'wisdom',
        savingThrows: ['intelligence', 'wisdom'],
        armorProficiencies: ['Armures légères', 'Armures intermédiaires (non métalliques)', 'Boucliers (non métalliques)'],
        weaponProficiencies: ['Dague', 'Javelot', 'Fronde', 'Bâton'],
        skills: ['Arcanes', 'Dressage', 'Intuition', 'Médecine', 'Nature', 'Perception', 'Religion', 'Survie'],
        skillChoices: 2,

        equipmentChoices: [
            {
                id: 'weapon_main',
                label: 'Arme principale',
                options: [
                    {
                        id: 'shield_scimitar',
                        name: 'Druide sauvage',
                        items: ['Cimeterre', 'Armure de cuir', 'Bouclier (non métallique)'],
                        itemsData: [
                            weapons.scimitar,
                            armors.leather,
                            { name: 'Bouclier en bois', category: 'shield', armor_class: 2 }
                        ]
                    },
                    {
                        id: 'sling_club',
                        name: 'Druide errant',
                        items: ['Fronde', 'Gourdin', 'Armure de peau'],
                        itemsData: [weapons.sling, weapons.club, armors.hide]
                    }
                ]
            },
            {
                id: 'pack',
                label: 'Paquetage',
                options: [
                    {
                        id: 'priest_pack',
                        name: 'Paquetage du druide',
                        items: ['Sac', 'Bougies', 'Encens', 'Vêtements', 'Rations']
                    },
                    {
                        id: 'explorer_pack',
                        name: 'Paquetage d\'explorateur',
                        items: ['Sac', 'Torche', 'Corde', 'Rations']
                    }
                ]
            }
        ]
    },
    {
        id: 10,
        name: 'Moine',
        description: 'Adepte des arts martiaux qui canalise une énergie intérieure (le ki).',
        hitDie: 8,
        primaryAbility: 'dexterity',
        savingThrows: ['strength', 'dexterity'],
        armorProficiencies: ['Aucune'],
        weaponProficiencies: ['Armes courantes', 'Épée courte'],
        skills: ['Acrobaties', 'Athlétisme', 'Histoire', 'Intuition', 'Religion', 'Discrétion'],
        skillChoices: 2,

        equipmentChoices: [
            {
                id: 'weapon_main',
                label: 'Arme principale',
                options: [
                    {
                        id: 'shortsword_monk',
                        name: 'Moine martial',
                        items: ['Épée courte'],
                        itemsData: [weapons.shortsword]
                    },
                    {
                        id: 'quarterstaff_darts',
                        name: 'Moine ascète',
                        items: ['Bâton', 'Fléchette'],
                        itemsData: [weapons.quarterstaff, weapons.dart]
                    }
                ]
            },
            {
                id: 'pack',
                label: 'Paquetage',
                options: [
                    {
                        id: 'priest_pack',
                        name: 'Paquetage du moine',
                        items: ['Sac', 'Bougies', 'Encens', 'Vêtements', 'Rations']
                    },
                    {
                        id: 'explorer_pack',
                        name: 'Paquetage d\'explorateur',
                        items: ['Sac', 'Torche', 'Corde', 'Rations']
                    }
                ]
            }
        ]
    },
    {
        id: 11,
        name: 'Ensorceleur',
        description: 'Lanceur de sorts dont la magie jaillit d\'un don inné.',
        hitDie: 6,
        primaryAbility: 'charisma',
        savingThrows: ['constitution', 'charisma'],
        armorProficiencies: ['Aucune'],
        weaponProficiencies: ['Dague', 'Fronde', 'Bâton', 'Arbalète légère'],
        skills: ['Arcanes', 'Tromperie', 'Intuition', 'Intimidation', 'Persuasion', 'Religion'],
        skillChoices: 2,

        equipmentChoices: [
            {
                id: 'weapon_main',
                label: 'Arme principale',
                options: [
                    {
                        id: 'shortsword_monk',
                        name: 'Moine martial',
                        items: ['Épée courte'],
                        itemsData: [weapons.shortsword]
                    },
                    {
                        id: 'quarterstaff_darts',
                        name: 'Moine ascète',
                        items: ['Bâton', 'Fléchette'],
                        itemsData: [weapons.quarterstaff, weapons.dart]
                    }
                ]
            },
            {
                id: 'pack',
                label: 'Paquetage',
                options: [
                    {
                        id: 'priest_pack',
                        name: 'Paquetage de l\'ensorceleur',
                        items: ['Sac', 'Bougies', 'Encens', 'Vêtements', 'Rations']
                    },
                    {
                        id: 'explorer_pack',
                        name: 'Paquetage d\'explorateur',
                        items: ['Sac', 'Torche', 'Corde', 'Rations']
                    }
                ]
            }
        ]
    },
    {
        id: 12,
        name: 'Occultiste',
        description: 'Lanceur de sorts lié par un pacte à une entité surnaturelle.',
        hitDie: 8,
        primaryAbility: 'charisma',
        savingThrows: ['wisdom', 'charisma'],
        armorProficiencies: ['Armures légères'],
        weaponProficiencies: ['Armes courantes'],
        skills: ['Arcanes', 'Tromperie', 'Histoire', 'Intimidation', 'Investigation', 'Nature', 'Religion'],
        skillChoices: 2,

        equipmentChoices: [
            {
                id: 'weapon_main',
                label: 'Arme principale',
                options: [
                    {
                        id: 'tome_pact',
                        name: 'Occultiste du pacte du grimoire',
                        items: ['Arbalète légère', 'Armure de cuir', 'Dague'],
                        itemsData: [weapons.crossbow_light, armors.leather, weapons.dagger]
                    },
                    {
                        id: 'blade_pact',
                        name: 'Occultiste du pacte de la lame',
                        items: ['Épée courte', 'Armure de cuir'],
                        itemsData: [weapons.shortsword, armors.leather]
                    }
                ]
            },
            {
                id: 'pack',
                label: 'Paquetage',
                options: [
                    {
                        id: 'priest_pack',
                        name: 'Paquetage de l\'occultiste',
                        items: ['Sac', 'Bougies', 'Encens', 'Vêtements', 'Rations']
                    },
                    {
                        id: 'explorer_pack',
                        name: 'Paquetage d\'explorateur',
                        items: ['Sac', 'Torche', 'Corde', 'Rations']
                    }
                ]
            }
        ]
    },
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
    { id: 7, name: 'Charlatan', skillProficiencies: ['Tromperie', 'Escamotage'], toolProficiencies: [], languages: 0, feature: 'Fausse identité', equipment: [] },
    { id: 8, name: 'Artisan de guilde', skillProficiencies: ['Intuition', 'Persuasion'], toolProficiencies: [], languages: 1, feature: 'Reconnaissance de guilde', equipment: [] },
    { id: 9, name: 'Ermite', skillProficiencies: ['Médecine', 'Religion'], toolProficiencies: [], languages: 1, feature: 'Découverte', equipment: [] },
    { id: 10, name: 'Marginal', skillProficiencies: ['Athlétisme', 'Survie'], toolProficiencies: [], languages: 1, feature: 'Guide de voyage', equipment: [] },
    { id: 11, name: 'Marin', skillProficiencies: ['Athlétisme', 'Perception'], toolProficiencies: [], languages: 0, feature: 'Sens marin', equipment: [] },
    { id: 12, name: 'Gamin des rues', skillProficiencies: ['Escamotage', 'Discrétion'], toolProficiencies: [], languages: 0, feature: 'Passages secrets de la ville', equipment: [] },
    { id: 13, name: 'Saltimbanque', skillProficiencies: ['Acrobaties', 'Représentation'], toolProficiencies: [], languages: 0, feature: 'Grâce du public', equipment: [] },
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
    //panssement a la con pour que les skills puissent afficher les abréviations
    str: 'FOR',
    dex: 'DEX',
    con: 'CON',
    int: 'INT',
    wis: 'SAG',
    cha: 'CHA',
};

const abilityDescriptions = {
    strength: 'Puissance physique',
    dexterity: 'Agilité',
    constitution: 'Endurance',
    intelligence: 'Raisonnement',
    wisdom: 'Perception',
    charisma: 'Présence',
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { pointBuyCosts };
}

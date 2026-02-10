-- =====================================================
-- RESET (DEV ONLY)
-- =====================================================
DROP TABLE IF EXISTS personnage_item CASCADE;
DROP TABLE IF EXISTS personnage_caracteristique CASCADE;
DROP TABLE IF EXISTS personnage CASCADE;
DROP TABLE IF EXISTS item CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TABLE IF EXISTS dnd_skill CASCADE;
DROP TABLE IF EXISTS dnd_species CASCADE;
DROP TABLE IF EXISTS dnd_class CASCADE;
DROP TABLE IF EXISTS dnd_background CASCADE;


-- =====================================================
-- USERS
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- D&D SKILLS
-- =====================================================
CREATE TABLE dnd_skill (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    ability VARCHAR(20) NOT NULL
);

-- =====================================================
-- D&D SPECIES
-- =====================================================
CREATE TABLE dnd_species (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    ability_bonuses JSONB NOT NULL,
    traits JSONB NOT NULL,
    speed INTEGER NOT NULL,
    languages JSONB NOT NULL
);

-- =====================================================
-- D&D CLASSES
-- =====================================================
CREATE TABLE dnd_class (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    hit_die INTEGER NOT NULL,
    primary_ability VARCHAR(20) NOT NULL,
    saving_throws JSONB NOT NULL,
    armor_proficiencies JSONB NOT NULL,
    weapon_proficiencies JSONB NOT NULL,
    skills JSONB NOT NULL,
    skill_choices INTEGER NOT NULL,
    equipment_choices JSONB NOT NULL
);

-- =====================================================
-- D&D BACKGROUNDS
-- =====================================================
CREATE TABLE dnd_background (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    skill_proficiencies JSONB NOT NULL,
    tool_proficiencies JSONB NOT NULL,
    languages INTEGER NOT NULL,
    feature TEXT NOT NULL,
    equipment JSONB NOT NULL
);

-- =====================================================
-- D&D WEAPONS
-- =====================================================
CREATE TABLE dnd_weapon (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    damage VARCHAR(10),
    damage_type VARCHAR(20),
    properties JSONB,
    versatile_damage VARCHAR(10),
    range VARCHAR(20)
);

-- =====================================================
-- D&D ARMORS
-- =====================================================
CREATE TABLE dnd_armor (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    armor_class INTEGER NOT NULL,
    dex_modifier_rule VARCHAR(10) NOT NULL
);

-- =====================================================
-- PERSONNAGE
-- =====================================================
CREATE TABLE personnage (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    class_id INTEGER REFERENCES dnd_class(id),
    species_id INTEGER REFERENCES dnd_species(id),
    background_id INTEGER REFERENCES dnd_background(id),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PERSONNAGE CARACTÉRISTIQUES
-- =====================================================
CREATE TABLE personnage_caracteristique (
    personnage_id INTEGER REFERENCES personnage(id) ON DELETE CASCADE,
    caracteristique VARCHAR(10) NOT NULL,
    valeur INTEGER NOT NULL,
    PRIMARY KEY (personnage_id, caracteristique)
);

-- =====================================================
-- INSERT D&D SKILLS
-- =====================================================
INSERT INTO dnd_skill (id, name, ability) VALUES
(1,'Acrobaties','dexterity'),
(2,'Dressage','wisdom'),
(3,'Arcanes','intelligence'),
(4,'Athlétisme','strength'),
(5,'Tromperie','charisma'),
(6,'Histoire','intelligence'),
(7,'Intuition','wisdom'),
(8,'Intimidation','charisma'),
(9,'Investigation','intelligence'),
(10,'Médecine','wisdom'),
(11,'Nature','intelligence'),
(12,'Perception','wisdom'),
(13,'Représentation','charisma'),
(14,'Persuasion','charisma'),
(15,'Religion','intelligence'),
(16,'Escamotage','dexterity'),
(17,'Discrétion','dexterity'),
(18,'Survie','wisdom');

-- =====================================================
-- ADMIN PAR DÉFAUT
-- password = Admin123!
-- =====================================================
INSERT INTO users (username, email, password_hash, role)
VALUES (
    'admin',
    'admin@dice.local',
    '$2b$10$AW5ufc9ZCHTjWS5R2DBRwe4B1u1pX09ejriPe3lkhErxmj8QXnYma',
    'admin'
);


-- ============================
-- INSERT DND SPECIES (RACES)
-- ============================
INSERT INTO dnd_species (id, name, description, ability_bonuses, traits, speed, languages) VALUES
(1, 'Humain', 'Polyvalents et ambitieux, les humains sont la race la plus répandue.', 
 '{"strength":1,"dexterity":1,"constitution":1,"intelligence":1,"wisdom":1,"charisma":1}'::jsonb, '["Polyvalence"]'::jsonb, 30, '["Commun","+1 au choix"]'::jsonb),
(2, 'Elfe', 'Êtres gracieux et immortels, doués de sens aiguisés.', '{"dexterity":2}'::jsonb, '["Vision dans le noir","Sens aiguisés","Ascendance féerique","Transe"]'::jsonb, 30, '["Commun","Elfique"]'::jsonb),
(3, 'Nain', 'Robustes et endurants, artisans et guerriers courageux.', '{"constitution":2}'::jsonb, '["Vision dans le noir","Résistance naine","Connaissance de la pierre"]'::jsonb, 25, '["Commun","Nain"]'::jsonb),
(4, 'Halfelin', 'Petits et agiles, chanceux et discrets.', '{"dexterity":2}'::jsonb, '["Chanceux","Brave","Agilité halfeline"]'::jsonb, 25, '["Commun","Halfelin"]'::jsonb),
(5, 'Drakéide', 'Descendants des dragons.', '{"strength":2,"charisma":1}'::jsonb, '["Ascendance draconique","Arme de souffle"]'::jsonb, 30, '["Commun","Draconique"]'::jsonb),
(6, 'Demi-elfe', 'Combinant les meilleurs aspects humains et elfiques.', '{"charisma":2}'::jsonb, '["Vision dans le noir","Ascendance féerique"]'::jsonb, 30, '["Commun","Elfique","+1 au choix"]'::jsonb);

-- ============================
-- INSERT DND CLASSES
-- ============================
INSERT INTO dnd_class (id, name, description, hit_die, primary_ability, saving_throws, armor_proficiencies, weapon_proficiencies, skills, skill_choices, equipment_choices) VALUES
(1, 'Guerrier', 'Maître des armes et des armures.', 10, 'strength', '["strength","constitution"]'::jsonb, '["Toutes armures","Boucliers"]'::jsonb, '["Armes courantes","Armes de guerre"]'::jsonb, '["Acrobaties","Athlétisme","Dressage","Histoire","Intimidation","Intuition","Perception","Survie"]'::jsonb, 2, '[]'::jsonb),
(2, 'Magicien', 'Érudit de la magie arcanique.', 6, 'intelligence', '["intelligence","wisdom"]'::jsonb, '[]'::jsonb, '["Dague","Bâton"]'::jsonb, '["Arcanes","Histoire","Intuition","Investigation","Médecine","Religion"]'::jsonb, 2, '[]'::jsonb),
(3, 'Roublard', 'Expert en discrétion.', 8, 'dexterity', '["dexterity","intelligence"]'::jsonb, '["Armures légères"]'::jsonb, '["Armes courantes"]'::jsonb, '["Acrobaties","Athlétisme","Discrétion","Escamotage","Intimidation","Perception","Persuasion"]'::jsonb, 4, '[]'::jsonb),
(4, 'Clerc', 'Intermédiaire divin.', 8, 'wisdom', '["wisdom","charisma"]'::jsonb, '["Armures légères","Boucliers"]'::jsonb, '["Armes courantes"]'::jsonb, '["Histoire","Intuition","Médecine","Religion"]'::jsonb, 2, '[]'::jsonb),
(5, 'Rôdeur', 'Traqueur et éclaireur.', 10, 'dexterity', '["strength","dexterity"]'::jsonb, '["Armures légères","Boucliers"]'::jsonb, '["Armes de guerre"]'::jsonb, '["Athlétisme","Discrétion","Nature","Perception","Survie"]'::jsonb, 3, '[]'::jsonb),
(6, 'Paladin', 'Guerrier sacré.', 10, 'strength', '["wisdom","charisma"]'::jsonb, '["Toutes armures","Boucliers"]'::jsonb, '["Armes de guerre"]'::jsonb, '["Athlétisme","Intimidation","Persuasion","Religion"]'::jsonb, 2, '[]'::jsonb);

-- ============================
-- INSERT DND BACKGROUNDS
-- ============================
INSERT INTO dnd_background (id, name, skill_proficiencies, tool_proficiencies, languages, feature, equipment) VALUES
(1, 'Acolyte', '["Intuition","Religion"]'::jsonb, '[]'::jsonb, 2, 'Refuge des fidèles', '[]'::jsonb),
(2, 'Criminel', '["Discrétion","Tromperie"]'::jsonb, '[]'::jsonb, 0, 'Relations dans la pègre', '[]'::jsonb),
(3, 'Érudit', '["Arcanes","Histoire"]'::jsonb, '[]'::jsonb, 2, 'Chercheur', '[]'::jsonb),
(4, 'Soldat', '["Athlétisme","Intimidation"]'::jsonb, '[]'::jsonb, 0, 'Grade militaire', '[]'::jsonb),
(5, 'Héros du peuple', '["Dressage","Survie"]'::jsonb, '[]'::jsonb, 0, 'Hospitalité rustique', '[]'::jsonb),
(6, 'Noble', '["Histoire","Persuasion"]'::jsonb, '[]'::jsonb, 1, 'Position privilégiée', '[]'::jsonb);

-- ============================
-- INSERT DND WEAPONS
-- ============================
INSERT INTO dnd_weapon (id, name, category, damage, damage_type, properties, versatile_damage, range) VALUES
('longsword', 'Épée longue', 'martial_melee', '1d8', 'slashing', '["versatile"]'::jsonb, '1d10', NULL),
('shortsword', 'Epée courte', 'martial_melee', '1d6', 'piercing', '["finesse","light"]'::jsonb, '1d8', NULL),
('greatsword', 'Epée a deux mains', 'martial_melee', '2d6', 'slashing', '["heavy","two-handed"]'::jsonb, '2d6', NULL),
('javelin', 'Javelot', 'simple_melee', '1d6', 'piercing', '["thrown","range"]'::jsonb, NULL, '30/120'),
('morningstar', 'Étoile du matin', 'martial_melee', '1d8', 'piercing', '[]'::jsonb, NULL, NULL),
('shortbow', 'Arc court', 'simple_ranged', '1d6', 'piercing', '["range"]'::jsonb, NULL, '80/320'),
('longbow', 'Arc long', 'martial_ranged', '1d8', 'piercing', '["heavy","range","two-handed"]'::jsonb, NULL, '150/600'),
('dagger', 'Dague', 'simple_melee', '1d4', 'piercing', '["finesse","light","thrown"]'::jsonb, '1d4', '20/60'),
('crossbow_light', 'Arbalète légère', 'simple_ranged', '1d8', 'piercing', '["loading","range","two-handed"]'::jsonb, NULL, '80/320'),
('rapier', 'Rapière', 'martial_melee', '1d8', 'piercing', '["finesse"]'::jsonb, NULL, NULL);

-- ============================
-- INSERT DND ARMORS
-- ============================
INSERT INTO dnd_armor (id, name, category, armor_class, dex_modifier_rule) VALUES
('padded', 'Armure matelassée', 'armor_light', 11, 'full'),
('leather', 'Armure de cuir', 'armor_light', 11, 'full'),
('studded_leather', 'Armure de cuir cloutée', 'armor_light', 12, 'full'),
('hide', 'Armure de peau', 'armor_medium', 12, 'max2'),
('chain_shirt', 'Chemise de mailles', 'armor_medium', 13, 'max2'),
('scale_mail', 'Cotte d’écailles', 'armor_medium', 14, 'max2'),
('breastplate', 'Cuirasse', 'armor_medium', 14, 'max2'),
('half_plate', 'Demi-plate', 'armor_medium', 15, 'max2'),
('ring_mail', 'Broigne', 'armor_heavy', 14, 'none'),
('chain_mail', 'Cotte de mailles', 'armor_heavy', 16, 'none'),
('splint', 'Clibanion', 'armor_heavy', 17, 'none'),
('plate', 'Harnois', 'armor_heavy', 18, 'none');

CREATE TABLE item (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    armor_class INTEGER,
    dex_modifier_rule VARCHAR(10),
    damage_dice VARCHAR(10),
    damage_type VARCHAR(20)
);

CREATE TABLE personnage_item (
    personnage_id INTEGER REFERENCES personnage(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES item(id) ON DELETE CASCADE,
    equipped BOOLEAN DEFAULT true,
    PRIMARY KEY (personnage_id, item_id)
);


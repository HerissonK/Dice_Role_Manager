-- =====================================================
-- SCRIPT D&D CHARACTER BUILDER - DATABASE SETUP
-- Version: 3.0 (Nettoyée — suppression des tables orphelines
-- dnd_skill, dnd_weapon, dnd_armor, remplacées en pratique par
-- la table générique `item` et par personnage_skill en texte libre)
-- =====================================================

-- =====================================================
-- SUPPRESSION DES TABLES (ordre inversé des dépendances)
-- =====================================================
-- Tables actuelles de l'application
DROP TABLE IF EXISTS personnage_skill CASCADE;
DROP TABLE IF EXISTS personnage_item CASCADE;
DROP TABLE IF EXISTS personnage_caracteristique CASCADE;
DROP TABLE IF EXISTS personnage CASCADE;
DROP TABLE IF EXISTS item CASCADE;
DROP TABLE IF EXISTS dnd_background CASCADE;
DROP TABLE IF EXISTS dnd_class CASCADE;
DROP TABLE IF EXISTS dnd_species CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Résidus d'anciennes versions du schéma (v1 en français, v2 avec
-- dnd_skill/dnd_weapon/dnd_armor) — à supprimer une bonne fois pour
-- avoir une base propre avec exactement 9 tables au final.
DROP TABLE IF EXISTS dnd_armor CASCADE;
DROP TABLE IF EXISTS dnd_skill CASCADE;
DROP TABLE IF EXISTS dnd_weapon CASCADE;
DROP TABLE IF EXISTS background CASCADE;
DROP TABLE IF EXISTS classe CASCADE;
DROP TABLE IF EXISTS espece CASCADE;

-- =====================================================
-- TABLE: USERS
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Contraintes
    CONSTRAINT chk_username_length CHECK (LENGTH(username) >= 2),
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_role CHECK (role IN ('user', 'admin', 'moderator'))
);

-- Index pour performances
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- TABLE: D&D SPECIES (RACES)
-- =====================================================
CREATE TABLE dnd_species (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    ability_bonuses JSONB NOT NULL DEFAULT '{}'::jsonb,
    traits JSONB NOT NULL DEFAULT '[]'::jsonb,
    speed INTEGER NOT NULL DEFAULT 30,
    languages JSONB NOT NULL DEFAULT '[]'::jsonb,

    CONSTRAINT chk_speed CHECK (speed > 0 AND speed <= 60)
);

-- =====================================================
-- TABLE: D&D CLASSES
-- =====================================================
CREATE TABLE dnd_class (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    hit_die INTEGER NOT NULL,
    primary_ability VARCHAR(20) NOT NULL,
    saving_throws JSONB NOT NULL DEFAULT '[]'::jsonb,
    armor_proficiencies JSONB NOT NULL DEFAULT '[]'::jsonb,
    weapon_proficiencies JSONB NOT NULL DEFAULT '[]'::jsonb,
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    skill_choices INTEGER NOT NULL DEFAULT 2,
    equipment_choices JSONB NOT NULL DEFAULT '[]'::jsonb,

    CONSTRAINT chk_hit_die CHECK (hit_die IN (6, 8, 10, 12)),
    CONSTRAINT chk_primary_ability CHECK (primary_ability IN ('strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma')),
    CONSTRAINT chk_skill_choices CHECK (skill_choices >= 0 AND skill_choices <= 10)
);

-- =====================================================
-- TABLE: D&D BACKGROUNDS
-- =====================================================
CREATE TABLE dnd_background (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    skill_proficiencies JSONB NOT NULL DEFAULT '[]'::jsonb,
    tool_proficiencies JSONB NOT NULL DEFAULT '[]'::jsonb,
    languages INTEGER NOT NULL DEFAULT 0,
    feature TEXT NOT NULL,
    equipment JSONB NOT NULL DEFAULT '[]'::jsonb,

    CONSTRAINT chk_languages CHECK (languages >= 0 AND languages <= 5)
);

-- =====================================================
-- TABLE: ITEMS (GÉNÉRIQUE — armes, armures, boucliers)
-- =====================================================
CREATE TABLE item (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    armor_class INTEGER,
    dex_modifier_rule VARCHAR(10),
    damage_dice VARCHAR(10),
    damage_type VARCHAR(20),
    properties JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_item_category CHECK (category IN ('weapon', 'armor', 'shield', 'gear', 'consumable', 'magic'))
);

CREATE INDEX idx_item_category ON item(category);

-- =====================================================
-- TABLE: PERSONNAGE
-- =====================================================
CREATE TABLE personnage (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    class_id INTEGER NOT NULL REFERENCES dnd_class(id) ON DELETE RESTRICT,
    species_id INTEGER NOT NULL REFERENCES dnd_species(id) ON DELETE RESTRICT,
    background_id INTEGER NOT NULL REFERENCES dnd_background(id) ON DELETE RESTRICT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_level CHECK (level >= 1 AND level <= 20),
    CONSTRAINT chk_name_length CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 100)
);

-- Index pour performances
CREATE INDEX idx_personnage_user ON personnage(user_id);
CREATE INDEX idx_personnage_class ON personnage(class_id);
CREATE INDEX idx_personnage_species ON personnage(species_id);
CREATE INDEX idx_personnage_background ON personnage(background_id);

-- =====================================================
-- TABLE: PERSONNAGE CARACTÉRISTIQUES
-- =====================================================
CREATE TABLE personnage_caracteristique (
    personnage_id INTEGER NOT NULL REFERENCES personnage(id) ON DELETE CASCADE,
    caracteristique VARCHAR(10) NOT NULL,
    valeur INTEGER NOT NULL,

    PRIMARY KEY (personnage_id, caracteristique),

    CONSTRAINT chk_caracteristique CHECK (caracteristique IN ('str', 'dex', 'con', 'int', 'wis', 'cha')),
    CONSTRAINT chk_valeur CHECK (valeur >= 1 AND valeur <= 30)
);

CREATE INDEX idx_perso_carac_perso ON personnage_caracteristique(personnage_id);

-- =====================================================
-- TABLE: PERSONNAGE ITEMS
-- =====================================================
CREATE TABLE personnage_item (
    personnage_id INTEGER NOT NULL REFERENCES personnage(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES item(id) ON DELETE CASCADE,
    equipped BOOLEAN DEFAULT true,
    quantity INTEGER DEFAULT 1,

    PRIMARY KEY (personnage_id, item_id),

    CONSTRAINT chk_quantity CHECK (quantity >= 1)
);

CREATE INDEX idx_perso_item_perso ON personnage_item(personnage_id);
CREATE INDEX idx_perso_item_item ON personnage_item(item_id);

-- =====================================================
-- TABLE: PERSONNAGE_SKILL
-- Compétences choisies par le joueur (nom en texte libre,
-- non liée à une table de référence dnd_skill)
-- =====================================================
CREATE TABLE personnage_skill (
    personnage_id INTEGER NOT NULL REFERENCES personnage(id) ON DELETE CASCADE,
    skill_name VARCHAR(50) NOT NULL,
    source VARCHAR(20) NOT NULL DEFAULT 'class',

    PRIMARY KEY (personnage_id, skill_name),

    CONSTRAINT chk_skill_source CHECK (source IN ('class', 'background', 'feat', 'other'))
);

CREATE INDEX idx_perso_skill_perso ON personnage_skill(personnage_id);

COMMENT ON TABLE personnage_skill IS 'Compétences maîtrisées par personnage (choisies par le joueur)';
COMMENT ON COLUMN personnage_skill.skill_name IS 'Nom de la compétence (ex: Acrobaties, Perception)';
COMMENT ON COLUMN personnage_skill.source IS 'Origine: class (choix de classe), background (auto), feat, other';

-- =====================================================
-- INSERTION DES DONNÉES DE RÉFÉRENCE D&D
-- =====================================================

-- ============================
-- INSERT: SPECIES (RACES)
-- ============================
INSERT INTO dnd_species (id, name, description, ability_bonuses, traits, speed, languages) VALUES
(1, 'Humain', 'Polyvalents et ambitieux, les humains sont la race la plus répandue.',
 '{"str":1,"dex":1,"con":1,"int":1,"wis":1,"cha":1}'::jsonb,
 '["Polyvalence"]'::jsonb,
 30,
 '["Commun","+1 au choix"]'::jsonb),
(2, 'Elfe', 'Êtres gracieux et immortels, doués de sens aiguisés.',
 '{"dex":2}'::jsonb,
 '["Vision dans le noir","Sens aiguisés","Ascendance féerique","Transe"]'::jsonb,
 30,
 '["Commun","Elfique"]'::jsonb),
(3, 'Nain', 'Robustes et endurants, artisans et guerriers courageux.',
 '{"con":2}'::jsonb,
 '["Vision dans le noir","Résistance naine","Connaissance de la pierre"]'::jsonb,
 25,
 '["Commun","Nain"]'::jsonb),
(4, 'Halfelin', 'Petits et agiles, chanceux et discrets.',
 '{"dex":2}'::jsonb,
 '["Chanceux","Brave","Agilité halfeline"]'::jsonb,
 25,
 '["Commun","Halfelin"]'::jsonb),
(5, 'Drakéide', 'Descendants des dragons.',
 '{"str":2,"cha":1}'::jsonb,
 '["Ascendance draconique","Arme de souffle"]'::jsonb,
 30,
 '["Commun","Draconique"]'::jsonb),
(6, 'Demi-elfe', 'Combinant les meilleurs aspects humains et elfiques.',
 '{"cha":2}'::jsonb,
 '["Vision dans le noir","Ascendance féerique"]'::jsonb,
 30,
 '["Commun","Elfique","+1 au choix"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================
-- INSERT: CLASSES
-- ============================
INSERT INTO dnd_class (id, name, description, hit_die, primary_ability, saving_throws, armor_proficiencies, weapon_proficiencies, skills, skill_choices, equipment_choices) VALUES
(1, 'Guerrier', 'Maître des armes et des armures.',
 10, 'strength',
 '["strength","constitution"]'::jsonb,
 '["Toutes armures","Boucliers"]'::jsonb,
 '["Armes courantes","Armes de guerre"]'::jsonb,
 '["Acrobaties","Athlétisme","Dressage","Histoire","Intimidation","Intuition","Perception","Survie"]'::jsonb,
 2, '[]'::jsonb),
(2, 'Magicien', 'Érudit de la magie arcanique.',
 6, 'intelligence',
 '["intelligence","wisdom"]'::jsonb,
 '[]'::jsonb,
 '["Dague","Bâton"]'::jsonb,
 '["Arcanes","Histoire","Intuition","Investigation","Médecine","Religion"]'::jsonb,
 2, '[]'::jsonb),
(3, 'Roublard', 'Expert en discrétion.',
 8, 'dexterity',
 '["dexterity","intelligence"]'::jsonb,
 '["Armures légères"]'::jsonb,
 '["Armes courantes"]'::jsonb,
 '["Acrobaties","Athlétisme","Discrétion","Escamotage","Intimidation","Perception","Persuasion"]'::jsonb,
 4, '[]'::jsonb),
(4, 'Clerc', 'Intermédiaire divin.',
 8, 'wisdom',
 '["wisdom","charisma"]'::jsonb,
 '["Armures légères","Boucliers"]'::jsonb,
 '["Armes courantes"]'::jsonb,
 '["Histoire","Intuition","Médecine","Religion"]'::jsonb,
 2, '[]'::jsonb),
(5, 'Rôdeur', 'Traqueur et éclaireur.',
 10, 'dexterity',
 '["strength","dexterity"]'::jsonb,
 '["Armures légères","Boucliers"]'::jsonb,
 '["Armes de guerre"]'::jsonb,
 '["Athlétisme","Discrétion","Nature","Perception","Survie"]'::jsonb,
 3, '[]'::jsonb),
(6, 'Paladin', 'Guerrier sacré.',
 10, 'strength',
 '["wisdom","charisma"]'::jsonb,
 '["Toutes armures","Boucliers"]'::jsonb,
 '["Armes de guerre"]'::jsonb,
 '["Athlétisme","Intimidation","Persuasion","Religion"]'::jsonb,
 2, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================
-- INSERT: BACKGROUNDS
-- ============================
INSERT INTO dnd_background (id, name, skill_proficiencies, tool_proficiencies, languages, feature, equipment) VALUES
(1, 'Acolyte', '["Intuition","Religion"]'::jsonb, '[]'::jsonb, 2, 'Refuge des fidèles', '[]'::jsonb),
(2, 'Criminel', '["Discrétion","Tromperie"]'::jsonb, '[]'::jsonb, 0, 'Relations dans la pègre', '[]'::jsonb),
(3, 'Érudit', '["Arcanes","Histoire"]'::jsonb, '[]'::jsonb, 2, 'Chercheur', '[]'::jsonb),
(4, 'Soldat', '["Athlétisme","Intimidation"]'::jsonb, '[]'::jsonb, 0, 'Grade militaire', '[]'::jsonb),
(5, 'Héros du peuple', '["Dressage","Survie"]'::jsonb, '[]'::jsonb, 0, 'Hospitalité rustique', '[]'::jsonb),
(6, 'Noble', '["Histoire","Persuasion"]'::jsonb, '[]'::jsonb, 1, 'Position privilégiée', '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Remarque : les armes/armures/boucliers de référence D&D 5e sont désormais
-- insérées exclusivement via populate_item_table.sql, dans la table
-- générique `item` (plus de duplication dans dnd_weapon / dnd_armor).

-- =====================================================
-- CRÉATION DE L'ADMINISTRATEUR PAR DÉFAUT
-- =====================================================
-- Email: admin@dice.local
-- Password: Admin123!
-- Hash généré avec bcrypt (10 rounds)

-- Suppression de l'ancien admin s'il existe
DELETE FROM users WHERE email = 'admin@dice.local';

-- Insertion du nouvel admin
INSERT INTO users (username, email, password_hash, role)
VALUES (
    'admin',
    'admin@dice.local',
    '$2b$10$AW5ufc9ZCHTjWS5R2DBRwe4B1u1pX09ejriPe3lkhErxmj8QXnYma',
    'admin'
);

-- =====================================================
-- VÉRIFICATION ET FEEDBACK
-- =====================================================
DO $$
DECLARE
    admin_count INTEGER;
    tables_count INTEGER;
BEGIN
    -- Compter les admins
    SELECT COUNT(*) INTO admin_count FROM users WHERE role = 'admin';

    -- Compter les tables
    SELECT COUNT(*) INTO tables_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';

    -- Afficher les résultats
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATABASE SETUP COMPLETED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables créées: %', tables_count;
    RAISE NOTICE 'Administrateurs: %', admin_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ADMIN CREDENTIALS:';
    RAISE NOTICE 'Email: admin@dice.local';
    RAISE NOTICE 'Password: Admin123!';
    RAISE NOTICE '========================================';

    -- Vérifier que tout est OK
    IF admin_count = 0 THEN
        RAISE EXCEPTION 'ERREUR: Aucun administrateur créé!';
    END IF;

    IF tables_count <> 9 THEN
        RAISE WARNING 'Attention: % tables créées (attendu: 9)', tables_count;
    END IF;
END $$;

-- =====================================================
-- STATISTIQUES DES DONNÉES DE RÉFÉRENCE
-- =====================================================
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DONNÉES INSÉRÉES:';
    RAISE NOTICE '========================================';

    FOR rec IN
        SELECT
            'Species' as type, COUNT(*) as count FROM dnd_species
        UNION ALL
        SELECT 'Classes', COUNT(*) FROM dnd_class
        UNION ALL
        SELECT 'Backgrounds', COUNT(*) FROM dnd_background
        UNION ALL
        SELECT 'Users', COUNT(*) FROM users
    LOOP
        RAISE NOTICE '% : %', RPAD(rec.type, 15), rec.count;
    END LOOP;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'Rappel : Items (armes/armures/boucliers)';
    RAISE NOTICE 'sont peuplés par populate_item_table.sql';
    RAISE NOTICE '========================================';
END $$;
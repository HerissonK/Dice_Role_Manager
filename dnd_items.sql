DROP TABLE IF EXISTS personnage_item CASCADE;
DROP TABLE IF EXISTS item CASCADE;

CREATE TABLE item (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL, 
    -- armor_light, armor_medium, armor_heavy, shield, weapon_melee, weapon_ranged

    armor_class INTEGER,
    dex_modifier_rule TEXT,
    -- full | max2 | none | null

    damage_dice TEXT,
    damage_type TEXT,

    properties JSONB DEFAULT '{}'
);

CREATE TABLE personnage_item (
    id SERIAL PRIMARY KEY,
    personnage_id INTEGER NOT NULL REFERENCES personnage(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES item(id),
    equipped BOOLEAN DEFAULT false
);

-- ARMURES LÉGÈRES
INSERT INTO item (name, category, armor_class, dex_modifier_rule)
VALUES
('Armure de cuir', 'armor_light', 11, 'full'),
('Armure de cuir clouté', 'armor_light', 12, 'full');

-- ARMURES INTERMÉDIAIRES
INSERT INTO item (name, category, armor_class, dex_modifier_rule)
VALUES
('Chemise de mailles', 'armor_medium', 13, 'max2'),
('Armure d’écailles', 'armor_medium', 14, 'max2'),
('Cuirasse', 'armor_medium', 14, 'max2');

-- ARMURES LOURDES
INSERT INTO item (name, category, armor_class, dex_modifier_rule)
VALUES
('Cotte de mailles', 'armor_heavy', 16, 'none'),
('Armure de plates', 'armor_heavy', 18, 'none');

INSERT INTO item (name, category, armor_class)
VALUES
('Bouclier', 'shield', 2);

-- ARMES DE CORPS À CORPS
INSERT INTO item (name, category, damage_dice, damage_type, properties)
VALUES
('Épée longue', 'weapon_melee', '1d8', 'slashing', '{"versatile":"1d10"}'),
('Masse', 'weapon_melee', '1d6', 'bludgeoning', '{}'),
('Hache de bataille', 'weapon_melee', '1d8', 'slashing', '{"versatile":"1d10"}');

-- ARMES À DISTANCE
INSERT INTO item (name, category, damage_dice, damage_type, properties)
VALUES
('Arc long', 'weapon_ranged', '1d8', 'piercing', '{"range":"150/600"}'),
('Arbalète légère', 'weapon_ranged', '1d8', 'piercing', '{"loading":true}');

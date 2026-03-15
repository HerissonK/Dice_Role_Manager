-- =====================================================
-- PEUPLER LA TABLE item
-- Exécuter: psql -U herissonk -d dnd -f populate_item_table.sql
-- =====================================================

-- Vider d'abord pour éviter les doublons
DELETE FROM personnage_item;
DELETE FROM item;

-- Reset la séquence
ALTER SEQUENCE item_id_seq RESTART WITH 1;

-- ============================
-- ARMES
-- ============================
INSERT INTO item (name, category, damage_dice, damage_type, properties) VALUES
('Épée longue',        'weapon', '1d8', 'slashing', '["versatile"]'),
('Épée courte',        'weapon', '1d6', 'piercing',  '["finesse","light"]'),
('Épée à deux mains',  'weapon', '2d6', 'slashing',  '["heavy","two-handed"]'),
('Javelot',            'weapon', '1d6', 'piercing',  '["thrown","range"]'),
('Étoile du matin',    'weapon', '1d8', 'piercing',  '[]'),
('Arc court',          'weapon', '1d6', 'piercing',  '["range"]'),
('Arc long',           'weapon', '1d8', 'piercing',  '["heavy","range","two-handed"]'),
('Dague',              'weapon', '1d4', 'piercing',  '["finesse","light","thrown"]'),
('Arbalète légère',    'weapon', '1d8', 'piercing',  '["loading","range","two-handed"]'),
('Rapière',            'weapon', '1d8', 'piercing',  '["finesse"]');

-- ============================
-- ARMURES
-- ============================
INSERT INTO item (name, category, armor_class, dex_modifier_rule) VALUES
('Armure matelassée',      'armor', 11, 'full'),
('Armure de cuir',         'armor', 11, 'full'),
('Armure de cuir cloutée', 'armor', 12, 'full'),
('Armure de peau',         'armor', 12, 'max2'),
('Chemise de mailles',     'armor', 13, 'max2'),
('Cotte d''écailles',      'armor', 14, 'max2'),
('Cuirasse',               'armor', 14, 'max2'),
('Demi-plate',             'armor', 15, 'max2'),
('Broigne',                'armor', 14, 'none'),
('Cotte de mailles',       'armor', 16, 'none'),
('Clibanion',              'armor', 17, 'none'),
('Harnois',                'armor', 18, 'none');

-- ============================
-- BOUCLIER
-- ============================
INSERT INTO item (name, category, armor_class, dex_modifier_rule) VALUES
('Bouclier', 'shield', 2, 'full');

-- ============================
-- VÉRIFICATION
-- ============================
SELECT 
    id,
    name,
    category,
    COALESCE(damage_dice, '-') AS dés,
    COALESCE(damage_type, '-') AS type_dégâts,
    COALESCE(armor_class::text, '-') AS CA
FROM item 
ORDER BY category, name;

SELECT COUNT(*) AS total_items FROM item;
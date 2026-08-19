-- =====================================================
-- PEUPLER LA TABLE item
-- Exécuter: psql -U herissonk -d dnd -f populate_item_table.sql
--
-- v2 : liste d'armes complétée (armes courantes + armes de guerre,
-- mêlée et distance) pour couvrir les besoins des nouvelles classes
-- (Barbare, Barde, Druide, Moine, Ensorceleur, Occultiste).
-- Les armures étaient déjà complètes (12 entrées = 3 légères +
-- 5 intermédiaires + 4 lourdes + bouclier), non modifiées ici.
--
-- Non incluses volontairement : Sarbacane et Filet, dont les
-- dégâts/mécaniques (dégât fixe, absence de dégât) ne rentrent pas
-- dans le modèle dice_dice utilisé par le reste de l'application.
-- =====================================================

-- Vider d'abord pour éviter les doublons
DELETE FROM personnage_item;
DELETE FROM item;

-- Reset la séquence
ALTER SEQUENCE item_id_seq RESTART WITH 1;

-- ============================
-- ARMES COURANTES DE MÊLÉE
-- ============================
INSERT INTO item (name, category, damage_dice, damage_type, properties) VALUES
('Gourdin',            'weapon', '1d4', 'bludgeoning', '["light"]'),
('Dague',              'weapon', '1d4', 'piercing',    '["finesse","light","thrown"]'),
('Gourdin géant',      'weapon', '1d8', 'bludgeoning', '["two-handed"]'),
('Hachette',           'weapon', '1d6', 'slashing',    '["light","thrown"]'),
('Javelot',            'weapon', '1d6', 'piercing',    '["thrown"]'),
('Marteau léger',      'weapon', '1d4', 'bludgeoning', '["light","thrown"]'),
('Masse d''armes',     'weapon', '1d6', 'bludgeoning', '[]'),
('Bâton',              'weapon', '1d6', 'bludgeoning', '["versatile"]'),
('Faucille',           'weapon', '1d4', 'slashing',    '["light"]'),
('Épieu',              'weapon', '1d6', 'piercing',    '["thrown","versatile"]');

-- ============================
-- ARMES COURANTES À DISTANCE
-- ============================
INSERT INTO item (name, category, damage_dice, damage_type, properties) VALUES
('Arc court',          'weapon', '1d6', 'piercing', '["range"]'),
('Arbalète légère',    'weapon', '1d8', 'piercing', '["loading","range","two-handed"]'),
('Fléchette',          'weapon', '1d4', 'piercing', '["finesse","thrown"]'),
('Fronde',             'weapon', '1d4', 'bludgeoning', '["range"]');

-- ============================
-- ARMES DE GUERRE DE MÊLÉE
-- ============================
INSERT INTO item (name, category, damage_dice, damage_type, properties) VALUES
('Épée longue',                  'weapon', '1d8',  'slashing',    '["versatile"]'),
('Épée courte',                  'weapon', '1d6',  'piercing',    '["finesse","light"]'),
('Épée à deux mains',            'weapon', '2d6',  'slashing',    '["heavy","two-handed"]'),
('Étoile du matin',              'weapon', '1d8',  'piercing',    '[]'),
('Rapière',                      'weapon', '1d8',  'piercing',    '["finesse"]'),
('Hache d''armes',               'weapon', '1d8',  'slashing',    '["versatile"]'),
('Hache d''armes à deux mains',  'weapon', '1d12', 'slashing',    '["heavy","two-handed"]'),
('Fléau d''armes',               'weapon', '1d8',  'bludgeoning', '[]'),
('Glaive',                       'weapon', '1d10', 'slashing',    '["heavy","reach","two-handed"]'),
('Hallebarde',                   'weapon', '1d10', 'slashing',    '["heavy","reach","two-handed"]'),
('Lance de cavalier',            'weapon', '1d12', 'piercing',    '["reach","special"]'),
('Maillet',                      'weapon', '2d6',  'bludgeoning', '["heavy","two-handed"]'),
('Pique',                        'weapon', '1d10', 'piercing',    '["heavy","reach","two-handed"]'),
('Cimeterre',                    'weapon', '1d6',  'slashing',    '["finesse","light"]'),
('Trident',                      'weapon', '1d6',  'piercing',    '["thrown","versatile"]'),
('Pic de guerre',                'weapon', '1d8',  'piercing',    '[]'),
('Marteau de guerre',            'weapon', '1d8',  'bludgeoning', '["versatile"]'),
('Fouet',                        'weapon', '1d4',  'slashing',    '["finesse","reach"]');

-- ============================
-- ARMES DE GUERRE À DISTANCE
-- ============================
INSERT INTO item (name, category, damage_dice, damage_type, properties) VALUES
('Arc long',              'weapon', '1d8',  'piercing', '["heavy","range","two-handed"]'),
('Arbalète de poing',     'weapon', '1d6',  'piercing', '["light","loading","range"]'),
('Arbalète lourde',       'weapon', '1d10', 'piercing', '["heavy","loading","range","two-handed"]');

-- ============================
-- ARMURES (déjà complètes — inchangées)
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
SELECT COUNT(*) AS total_armes FROM item WHERE category = 'weapon';
SELECT COUNT(*) AS total_armures FROM item WHERE category IN ('armor', 'shield');
-- =====================================================
-- CRÉATION CIBLÉE DE personnage_known_spell (manquante car sa création
-- avait échoué silencieusement : dnd_spell n'existait pas encore au
-- moment où add-multilevel.sql avait été exécuté, avant add-progression.sql).
-- personnage_asi n'est pas concernée, elle existe déjà correctement.
-- À exécuter : psql -U postgres -d dnd -f Documentation/add-known-spell-only.sql
-- =====================================================

DROP TABLE IF EXISTS personnage_known_spell CASCADE;

CREATE TABLE personnage_known_spell (
    personnage_id INTEGER NOT NULL REFERENCES personnage(id) ON DELETE CASCADE,
    spell_id INTEGER NOT NULL REFERENCES dnd_spell(id) ON DELETE RESTRICT,
    level_learned INTEGER NOT NULL CHECK (level_learned BETWEEN 1 AND 20),

    PRIMARY KEY (personnage_id, spell_id)
);

CREATE INDEX idx_known_spell_personnage ON personnage_known_spell(personnage_id);

COMMENT ON TABLE personnage_known_spell IS 'Sorts appris par un personnage à sorts connus, avec le niveau auquel chacun a été choisi (permet de filtrer par niveau de jeu : level_learned <= niveau choisi)';

-- Vérification
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'personnage_known_spell'
ORDER BY ordinal_position;
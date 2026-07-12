-- =====================================================
-- CRÉATION D'UN RÔLE APPLICATIF RESTREINT
-- À exécuter avec un compte superuser (ex: postgres),
-- une seule fois, après init.sql.
-- =====================================================
--
-- Objectif : séparer le rôle utilisé pour l'administration de la base
-- (création/modification de tables, exécuté par le superuser lors des
-- migrations) du rôle utilisé par l'application Node.js au quotidien
-- (lecture/écriture de données uniquement, aucun droit de DDL).
--
-- ⚠️ Changez le mot de passe ci-dessous avant toute utilisation réelle,
-- et ne le committez jamais dans un dépôt Git.

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'dice_app') THEN
    CREATE ROLE dice_app WITH LOGIN PASSWORD 'Reception123+';
  END IF;
END
$$;

-- Connexion à la base et au schéma (base réelle : dnd)
GRANT CONNECT ON DATABASE dnd TO dice_app;
GRANT USAGE ON SCHEMA public TO dice_app;

-- Droits limités aux opérations CRUD applicatives — aucun droit de
-- création, modification ou suppression de tables (pas de CREATE, DROP,
-- ALTER). Ce rôle ne peut pas non plus créer d'autres rôles.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO dice_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO dice_app;

-- S'assure que les tables créées ultérieurement par le superuser (via de
-- futures migrations) héritent automatiquement des mêmes droits pour
-- dice_app, sans avoir à relancer ce script à chaque évolution du schéma.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO dice_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO dice_app;

-- Vérification
SELECT rolname, rolcanlogin, rolcreatedb, rolsuper
FROM pg_roles
WHERE rolname = 'dice_app';

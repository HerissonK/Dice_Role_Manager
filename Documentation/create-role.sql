cd ~/Dice_Role_Manager
cat > Documentation/create-roles.sql << 'EOF'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'dice_app') THEN
    CREATE ROLE dice_app WITH LOGIN PASSWORD 'Reception123+';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE dice_roll_manager TO dice_app;
GRANT USAGE ON SCHEMA public TO dice_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO dice_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO dice_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO dice_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO dice_app;

SELECT rolname, rolcanlogin, rolcreatedb, rolsuper
FROM pg_roles
WHERE rolname = 'dice_app';
EOF
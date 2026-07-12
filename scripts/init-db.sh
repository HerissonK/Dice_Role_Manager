#!/usr/bin/env bash
# Initialise la base de données : schéma, rôle applicatif restreint, données de référence.
# Usage : ./scripts/init-db.sh
set -euo pipefail

DB_NAME="${DB_NAME:-dice_roll_manager}"
DB_SUPERUSER="${DB_SUPERUSER:-postgres}"

echo "==> Création de la base ${DB_NAME}..."
psql -U "$DB_SUPERUSER" -c "CREATE DATABASE ${DB_NAME};" 2>/dev/null || \
  echo "    (déjà existante, on continue)"

echo "==> Création du schéma (tables, contraintes)..."
psql -U "$DB_SUPERUSER" -d "$DB_NAME" -f Documentation/init.sql

echo "==> Création du rôle applicatif restreint (dice_app)..."
psql -U "$DB_SUPERUSER" -d "$DB_NAME" -f Documentation/create-roles.sql

echo "==> Peuplement des données de référence (items)..."
psql -U "$DB_SUPERUSER" -d "$DB_NAME" -f Documentation/populate_item_table.sql

echo "==> Base de données initialisée avec succès."
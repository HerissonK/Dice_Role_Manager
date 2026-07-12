#!/usr/bin/env bash
# Restaure la base de données depuis un fichier de sauvegarde.
# Usage : ./scripts/restore-db.sh backups/backup_20260712_143000.sql
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage : ./scripts/restore-db.sh <fichier_de_sauvegarde.sql>"
  exit 1
fi

DB_NAME="${DB_NAME:-dice_roll_manager}"
DB_SUPERUSER="${DB_SUPERUSER:-postgres}"

psql -U "$DB_SUPERUSER" -d "$DB_NAME" < "$1"

echo "Restauration effectuée depuis $1"
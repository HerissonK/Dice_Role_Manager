#!/usr/bin/env bash
# Sauvegarde la base de données dans le dossier backups/, horodatée.
# Usage : ./scripts/backup-db.sh
set -euo pipefail

DB_NAME="${DB_NAME:-dice_roll_manager}"
DB_SUPERUSER="${DB_SUPERUSER:-postgres}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p backups
pg_dump -U "$DB_SUPERUSER" "$DB_NAME" > "backups/backup_${TIMESTAMP}.sql"

echo "Sauvegarde créée : backups/backup_${TIMESTAMP}.sql"
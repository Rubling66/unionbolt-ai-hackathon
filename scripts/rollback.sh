#!/usr/bin/env bash
# =============================================================================
# UnionBolts Database Rollback Script
# Usage: ./scripts/rollback.sh <backup_file.dump> [--phase 1|2|3]
# Restores from a pg_dump custom-format backup.
# ⚠  DESTRUCTIVE: Drops and recreates the database.
# =============================================================================

set -euo pipefail

if [ $# -lt 1 ]; then
    echo "Usage: $0 <backup_file.dump> [--phase 1|2|3]"
    echo "Restores the database from a pg_dump custom-format backup."
    echo ""
    echo "Available backups:"
    ls -1 backups/*.dump 2>/dev/null || echo "  (none found in backups/)"
    exit 1
fi

BACKUP_FILE="$1"
PHASE="${2:-full}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "Error: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

# Load credentials
if [ -f "${PROJECT_DIR}/.env.local" ]; then
    export $(grep -v '^#' "${PROJECT_DIR}/.env.local" | grep 'SUPABASE_DB_' | xargs)
fi

: "${SUPABASE_DB_HOST:?SUPABASE_DB_HOST not set}"
: "${SUPABASE_DB_NAME:=postgres}"
: "${SUPABASE_DB_USER:=postgres}"
: "${SUPABASE_DB_PASSWORD:?SUPABASE_DB_PASSWORD not set}"
: "${SUPABASE_DB_PORT:=5432}"

echo "=== UnionBolts Database Rollback ==="
echo "Backup: ${BACKUP_FILE}"
echo "Target: ${SUPABASE_DB_HOST}:${SUPABASE_DB_PORT}/${SUPABASE_DB_NAME}"
echo "Phase: ${PHASE}"
echo ""
echo "⚠  WARNING: This will DROP and RECREATE the database."
read -p "Are you sure? Type 'yes' to continue: " CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
    echo "Rollback cancelled."
    exit 0
fi

echo "Restoring from ${BACKUP_FILE}..."

PGPASSWORD="${SUPABASE_DB_PASSWORD}" pg_restore \
    -h "${SUPABASE_DB_HOST}" \
    -p "${SUPABASE_DB_PORT}" \
    -U "${SUPABASE_DB_USER}" \
    -d "${SUPABASE_DB_NAME}" \
    --clean \
    --if-exists \
    --no-owner \
    --no-acl \
    --verbose \
    "${BACKUP_FILE}"

echo "Rollback complete."

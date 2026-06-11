#!/usr/bin/env bash
# =============================================================================
# UnionBolts Database Backup Script
# Usage: ./scripts/backup.sh [--phase 1|2|3]
# Requires: pg_dump (PostgreSQL client tools), .env.local with SUPABASE_DB_* vars
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_DIR}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PHASE="${1:-full}"

# Load credentials from .env.local
if [ -f "${PROJECT_DIR}/.env.local" ]; then
    export $(grep -v '^#' "${PROJECT_DIR}/.env.local" | grep 'SUPABASE_DB_' | xargs)
fi

: "${SUPABASE_DB_HOST:?SUPABASE_DB_HOST not set}"
: "${SUPABASE_DB_NAME:=postgres}"
: "${SUPABASE_DB_USER:=postgres}"
: "${SUPABASE_DB_PASSWORD:?SUPABASE_DB_PASSWORD not set}"
: "${SUPABASE_DB_PORT:=5432}"

mkdir -p "${BACKUP_DIR}"

echo "=== UnionBolts Database Backup ==="
echo "Host: ${SUPABASE_DB_HOST}"
echo "Database: ${SUPABASE_DB_NAME}"
echo "Timestamp: ${TIMESTAMP}"
echo "Phase: ${PHASE}"

PGPASSWORD="${SUPABASE_DB_PASSWORD}" pg_dump \
    -h "${SUPABASE_DB_HOST}" \
    -p "${SUPABASE_DB_PORT}" \
    -U "${SUPABASE_DB_USER}" \
    -d "${SUPABASE_DB_NAME}" \
    --no-owner \
    --no-acl \
    --format=custom \
    --verbose \
    -f "${BACKUP_DIR}/unionbolts_${PHASE}_${TIMESTAMP}.dump"

echo "Backup complete: ${BACKUP_DIR}/unionbolts_${PHASE}_${TIMESTAMP}.dump"

# Also create a plain-text schema-only backup for review
PGPASSWORD="${SUPABASE_DB_PASSWORD}" pg_dump \
    -h "${SUPABASE_DB_HOST}" \
    -p "${SUPABASE_DB_PORT}" \
    -U "${SUPABASE_DB_USER}" \
    -d "${SUPABASE_DB_NAME}" \
    --schema-only \
    --no-owner \
    --no-acl \
    -f "${BACKUP_DIR}/unionbolts_schema_${TIMESTAMP}.sql"

echo "Schema backup: ${BACKUP_DIR}/unionbolts_schema_${TIMESTAMP}.sql"
echo "Done."

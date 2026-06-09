#!/usr/bin/env bash
# Restore a gzipped pg dump.
# Usage: ./scripts/restore.sh backups/mavericks_tech-20260609.sql.gz
set -euo pipefail

FILE="${1:?usage: restore.sh <path-to.sql.gz>}"
[[ -f "$FILE" ]] || { echo "no such file: $FILE"; exit 1; }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT}/.env"
if [[ -f "$ENV_FILE" ]]; then set -a; . "$ENV_FILE"; set +a; fi

: "${DB_NAME:?DB_NAME unset}"
: "${DB_USER:?DB_USER unset}"
: "${DB_HOST:=localhost}"
: "${DB_PORT:=5432}"

echo "[restore] WARNING: this DROPS and recreates ${DB_NAME}@${DB_HOST}"
read -r -p "continue? (yes/no) " ans
[[ "$ans" == "yes" ]] || { echo "abort"; exit 1; }

PGPASSWORD="${DB_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" postgres \
  -c "DROP DATABASE IF EXISTS ${DB_NAME};" \
  -c "CREATE DATABASE ${DB_NAME};"

gunzip -c "$FILE" | PGPASSWORD="${DB_PASSWORD:-}" psql \
  -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"

echo "[restore] done"

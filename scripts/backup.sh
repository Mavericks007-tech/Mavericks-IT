#!/usr/bin/env bash
# pg_dump → ./backups/<db>-YYYYMMDD-HHMMSS.sql.gz
# Optional: push to S3 if AWS_S3_BACKUP_BUCKET set.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT}/.env"

if [[ -f "$ENV_FILE" ]]; then
  set -a; . "$ENV_FILE"; set +a
fi

: "${DB_NAME:?DB_NAME unset}"
: "${DB_USER:?DB_USER unset}"
: "${DB_HOST:=localhost}"
: "${DB_PORT:=5432}"

mkdir -p "${ROOT}/backups"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
OUT="${ROOT}/backups/${DB_NAME}-${STAMP}.sql.gz"

echo "[backup] dumping ${DB_NAME}@${DB_HOST}:${DB_PORT} → ${OUT}"
PGPASSWORD="${DB_PASSWORD:-}" pg_dump \
  -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" \
  | gzip > "$OUT"

SIZE=$(du -h "$OUT" | cut -f1)
echo "[backup] wrote ${OUT} (${SIZE})"

if [[ -n "${AWS_S3_BACKUP_BUCKET:-}" ]]; then
  KEY="db-backups/$(basename "$OUT")"
  echo "[backup] uploading to s3://${AWS_S3_BACKUP_BUCKET}/${KEY}"
  aws s3 cp "$OUT" "s3://${AWS_S3_BACKUP_BUCKET}/${KEY}"
fi

# Retention: keep last 14 local dumps
ls -1t "${ROOT}/backups"/*.sql.gz 2>/dev/null | tail -n +15 | xargs -r rm -f
echo "[backup] done"

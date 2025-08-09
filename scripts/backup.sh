#!/usr/bin/env bash
set -euo pipefail

# Simple backup utility for DevForge (Postgres dump + volumes)
# Usage:
#   ./scripts/backup.sh [backup_dir]
# Example:
#   ./scripts/backup.sh ./backups

BACKUP_DIR=${1:-"./backups"}
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DEST="${BACKUP_DIR}/devforge-${TIMESTAMP}"

mkdir -p "${DEST}"

echo "[+] Dumping Postgres database..."
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U "${POSTGRES_USER:-devforge}" "${POSTGRES_DB:-devforge}" > "${DEST}/postgres.sql"

echo "[+] Archiving volumes..."
# Postgres data
docker run --rm \
  -v devforge_postgres_data:/data \
  -v "${DEST}:/backup" \
  alpine sh -c "cd /data && tar czf /backup/postgres_data.tgz ."

# Redis data
docker run --rm \
  -v devforge_redis_data:/data \
  -v "${DEST}:/backup" \
  alpine sh -c "cd /data && tar czf /backup/redis_data.tgz ."

# Storage data (app uploads/storage)
docker run --rm \
  -v devforge_storage_data:/data \
  -v "${DEST}:/backup" \
  alpine sh -c "cd /data && tar czf /backup/storage_data.tgz ."

# Caddy data (certificates) and config
docker run --rm \
  -v devforge_caddy_data:/data \
  -v "${DEST}:/backup" \
  alpine sh -c "cd /data && tar czf /backup/caddy_data.tgz ."

docker run --rm \
  -v devforge_caddy_config:/data \
  -v "${DEST}:/backup" \
  alpine sh -c "cd /data && tar czf /backup/caddy_config.tgz ."

echo "[+] Saving compose file and env snapshot..."
cp docker-compose.prod.yml "${DEST}/docker-compose.prod.yml"
[ -f .env ] && cp .env "${DEST}/.env"

echo "[✓] Backup complete: ${DEST}"



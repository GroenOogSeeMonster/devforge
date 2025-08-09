#!/usr/bin/env bash
set -euo pipefail

# Restore utility for DevForge
# Usage:
#   ./scripts/restore.sh <backup_dir>

if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup_dir>" >&2
  exit 1
fi

SRC="$1"

if [ ! -d "$SRC" ]; then
  echo "Backup directory not found: $SRC" >&2
  exit 1
fi

echo "[+] Stopping stack..."
docker compose -f docker-compose.prod.yml down

echo "[+] Restoring volumes..."

# Postgres volume
docker volume inspect devforge_postgres_data >/dev/null 2>&1 || docker volume create devforge_postgres_data >/dev/null
docker run --rm \
  -v devforge_postgres_data:/data \
  -v "${SRC}:/backup" \
  alpine sh -c "cd /data && rm -rf ./* && tar xzf /backup/postgres_data.tgz"

# Redis volume
docker volume inspect devforge_redis_data >/dev/null 2>&1 || docker volume create devforge_redis_data >/dev/null
docker run --rm \
  -v devforge_redis_data:/data \
  -v "${SRC}:/backup" \
  alpine sh -c "cd /data && rm -rf ./* && tar xzf /backup/redis_data.tgz"

# Storage volume
docker volume inspect devforge_storage_data >/dev/null 2>&1 || docker volume create devforge_storage_data >/dev/null
docker run --rm \
  -v devforge_storage_data:/data \
  -v "${SRC}:/backup" \
  alpine sh -c "cd /data && rm -rf ./* && tar xzf /backup/storage_data.tgz"

# Caddy data and config (optional)
if [ -f "${SRC}/caddy_data.tgz" ]; then
  docker volume inspect devforge_caddy_data >/dev/null 2>&1 || docker volume create devforge_caddy_data >/dev/null
  docker run --rm \
    -v devforge_caddy_data:/data \
    -v "${SRC}:/backup" \
    alpine sh -c "cd /data && rm -rf ./* && tar xzf /backup/caddy_data.tgz"
fi
if [ -f "${SRC}/caddy_config.tgz" ]; then
  docker volume inspect devforge_caddy_config >/dev/null 2>&1 || docker volume create devforge_caddy_config >/dev/null
  docker run --rm \
    -v devforge_caddy_config:/data \
    -v "${SRC}:/backup" \
    alpine sh -c "cd /data && rm -rf ./* && tar xzf /backup/caddy_config.tgz"
fi

echo "[+] Starting stack..."
docker compose -f docker-compose.prod.yml up -d postgres redis

echo "[+] Waiting for Postgres to be ready..."
until docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -U "${POSTGRES_USER:-devforge}" >/dev/null 2>&1; do
  sleep 2
  echo -n "."
done
echo ""

if [ -f "${SRC}/postgres.sql" ]; then
  echo "[+] Restoring database dump..."
  cat "${SRC}/postgres.sql" | docker compose -f docker-compose.prod.yml exec -T postgres psql -U "${POSTGRES_USER:-devforge}" -d "${POSTGRES_DB:-devforge}"
fi

echo "[+] Bringing up remaining services..."
docker compose -f docker-compose.prod.yml up -d

echo "[✓] Restore complete from: ${SRC}"



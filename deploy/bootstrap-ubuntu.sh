#!/usr/bin/env bash
set -euo pipefail

# DevForge Ubuntu Bootstrap Installer
# This script installs Docker, clones the repository, and starts the stack

if [ $(id -u) -ne 0 ]; then
  echo "Please run as root (sudo)" >&2
  exit 1
fi

REPO_URL=${REPO_URL:-"https://github.com/your-org/devforge.git"}
APP_DIR=${APP_DIR:-"/opt/devforge"}
DOMAIN=${DOMAIN:-""}
TLS_EMAIL=${TLS_EMAIL:-""}

apt-get update -y
apt-get install -y ca-certificates curl git
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

mkdir -p "${APP_DIR}"
if [ ! -d "${APP_DIR}/.git" ]; then
  git clone "${REPO_URL}" "${APP_DIR}"
fi

cd "${APP_DIR}"

if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
  fi
fi

# Ensure strong secrets
if grep -q 'your-super-secret-jwt-key-change-this-in-production' .env; then
  sed -i "s|your-super-secret-jwt-key-change-this-in-production|$(openssl rand -hex 32)|g" .env || true
fi
if grep -q 'your-session-secret-key-change-this-in-production' .env; then
  sed -i "s|your-session-secret-key-change-this-in-production|$(openssl rand -hex 32)|g" .env || true
fi
if grep -q 'your-32-character-encryption-key' .env; then
  sed -i "s|your-32-character-encryption-key|$(openssl rand -hex 32)|g" .env || true
fi

if [ -z "${DOMAIN}" ] || [ -z "${TLS_EMAIL}" ]; then
  echo "Set DOMAIN and TLS_EMAIL env vars before running to enable HTTPS (Let's Encrypt)."
  echo "Example: DOMAIN=devforge.example.com TLS_EMAIL=admin@example.com /bin/bash deploy/bootstrap-ubuntu.sh"
  exit 0
fi

export DOMAIN
export TLS_EMAIL

docker compose -f docker-compose.prod.yml up -d --build

echo "DevForge started. Visit: https://${DOMAIN}"



SHELL := /bin/bash

.PHONY: build build-frontend build-backend up down logs ps prune backup restore

build:
	docker compose -f docker-compose.prod.yml build

build-frontend:
	docker compose -f docker-compose.prod.yml build frontend

build-backend:
	docker compose -f docker-compose.prod.yml build backend

up:
	DOMAIN=$${DOMAIN:?set DOMAIN} TLS_EMAIL=$${TLS_EMAIL:?set TLS_EMAIL} docker compose -f docker-compose.prod.yml up -d --build

down:
	docker compose -f docker-compose.prod.yml down

logs:
	docker compose -f docker-compose.prod.yml logs -f --tail=200

ps:
	docker compose -f docker-compose.prod.yml ps

prune:
	docker system prune -f

backup:
	./scripts/backup.sh ./backups

restore:
	./scripts/restore.sh $(DIR)



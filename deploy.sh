#!/bin/bash
# AlphaFilms — production deploy / update script
# Run: bash deploy.sh

set -e

echo "→ Pulling latest code..."
git pull origin main

echo "→ Building images..."
docker compose build --no-cache

echo "→ Restarting stack..."
docker compose up -d --remove-orphans

echo "→ Cleaning up unused images..."
docker image prune -f

echo "✓ Deploy complete!"
docker compose ps

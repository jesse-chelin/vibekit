#!/bin/bash
set -e

echo "Deploying Vibekit..."

cd /opt/vibekit

# Pull latest
git pull origin main

# Build and restart
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
systemctl reload vibekit

echo "Deployment complete!"
docker compose ps

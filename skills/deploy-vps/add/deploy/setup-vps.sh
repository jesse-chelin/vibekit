#!/bin/bash
set -e

echo "Setting up VPS for Vibekit..."

# Install Docker if not present
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi

# Install Caddy
if ! command -v caddy &> /dev/null; then
  echo "Installing Caddy..."
  apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
  apt-get update
  apt-get install -y caddy
fi

# Setup firewall
echo "Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Copy Caddyfile
cp deploy/Caddyfile /etc/caddy/Caddyfile
systemctl reload caddy

# Install systemd service
cp deploy/vibekit.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable vibekit

echo ""
echo "VPS setup complete! Run 'deploy/deploy.sh' to deploy your app."

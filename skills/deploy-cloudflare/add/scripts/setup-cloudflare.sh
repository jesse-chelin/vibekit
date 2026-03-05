#!/bin/bash
set -euo pipefail

# ─── Cloudflare Tunnel Setup ────────────────────────────────
# Creates a tunnel, configures DNS, and writes the token to .env.local

TUNNEL_NAME="${1:-vibekit}"
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env.local"
CONFIG_FILE="$PROJECT_ROOT/cloudflared/config.yml"

echo "=== Cloudflare Tunnel Setup ==="
echo ""

# ─── Check cloudflared ───────────────────────────────────────

if ! command -v cloudflared &> /dev/null; then
  echo "cloudflared is not installed."
  echo ""

  # Detect OS and suggest install
  if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if command -v apt-get &> /dev/null; then
      echo "Installing via apt..."
      curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg > /dev/null
      echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/cloudflared.list
      sudo apt-get update && sudo apt-get install -y cloudflared
    elif command -v dnf &> /dev/null; then
      echo "Installing via dnf..."
      sudo dnf install -y cloudflared
    elif command -v pacman &> /dev/null; then
      echo "Installing via pacman..."
      sudo pacman -S --noconfirm cloudflared
    else
      echo "Please install cloudflared manually:"
      echo "  https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/"
      exit 1
    fi
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v brew &> /dev/null; then
      echo "Installing via Homebrew..."
      brew install cloudflared
    else
      echo "Please install cloudflared: brew install cloudflared"
      exit 1
    fi
  else
    echo "Please install cloudflared manually:"
    echo "  https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/"
    exit 1
  fi

  echo ""
fi

echo "cloudflared version: $(cloudflared --version)"
echo ""

# ─── Login ───────────────────────────────────────────────────

echo "Checking Cloudflare authentication..."
if ! cloudflared tunnel list &> /dev/null; then
  echo "You need to log in to Cloudflare first."
  echo ""
  cloudflared tunnel login
  echo ""
fi

# ─── Check for existing tunnel ───────────────────────────────

EXISTING_TUNNEL=$(cloudflared tunnel list --output json 2>/dev/null | grep -o "\"$TUNNEL_NAME\"" || true)
if [[ -n "$EXISTING_TUNNEL" ]]; then
  echo "Tunnel '$TUNNEL_NAME' already exists."
  read -rp "Use the existing tunnel? [Y/n] " USE_EXISTING
  if [[ "${USE_EXISTING:-Y}" =~ ^[Nn] ]]; then
    echo "Please choose a different tunnel name: ./scripts/setup-cloudflare.sh <name>"
    exit 1
  fi
else
  echo "Creating tunnel '$TUNNEL_NAME'..."
  cloudflared tunnel create "$TUNNEL_NAME"
  echo ""
fi

# ─── Get tunnel ID ───────────────────────────────────────────

TUNNEL_ID=$(cloudflared tunnel list --output json 2>/dev/null | python3 -c "
import sys, json
tunnels = json.load(sys.stdin)
for t in tunnels:
    if t['name'] == '$TUNNEL_NAME':
        print(t['id'])
        break
" 2>/dev/null || echo "")

if [[ -z "$TUNNEL_ID" ]]; then
  echo "Error: Could not find tunnel ID. Please check 'cloudflared tunnel list'."
  exit 1
fi

echo "Tunnel ID: $TUNNEL_ID"
echo ""

# ─── Configure DNS ───────────────────────────────────────────

read -rp "Enter your domain (e.g. myapp.example.com): " DOMAIN

if [[ -z "$DOMAIN" ]]; then
  echo "Error: Domain is required."
  exit 1
fi

echo "Routing DNS for $DOMAIN..."
cloudflared tunnel route dns "$TUNNEL_NAME" "$DOMAIN" || echo "DNS route may already exist."
echo ""

# ─── Get tunnel token ────────────────────────────────────────

echo "Getting tunnel token..."
TUNNEL_TOKEN=$(cloudflared tunnel token "$TUNNEL_NAME" 2>/dev/null || echo "")

if [[ -z "$TUNNEL_TOKEN" ]]; then
  echo ""
  echo "Could not automatically retrieve the tunnel token."
  echo "Please get it from: Cloudflare Dashboard → Zero Trust → Networks → Tunnels → $TUNNEL_NAME"
  read -rp "Paste the tunnel token here: " TUNNEL_TOKEN
fi

# ─── Write config ────────────────────────────────────────────

echo "Writing cloudflared config..."
mkdir -p "$(dirname "$CONFIG_FILE")"
cat > "$CONFIG_FILE" << EOF
tunnel: $TUNNEL_NAME

ingress:
  - hostname: $DOMAIN
    service: http://app:3000
    originRequest:
      noTLSVerify: true
  - service: http_status:404
EOF

# ─── Write env var ───────────────────────────────────────────

if grep -q "CLOUDFLARE_TUNNEL_TOKEN" "$ENV_FILE" 2>/dev/null; then
  # Update existing
  sed -i.bak "s|CLOUDFLARE_TUNNEL_TOKEN=.*|CLOUDFLARE_TUNNEL_TOKEN=$TUNNEL_TOKEN|" "$ENV_FILE"
  rm -f "$ENV_FILE.bak"
else
  # Append
  echo "" >> "$ENV_FILE"
  echo "# Cloudflare Tunnel" >> "$ENV_FILE"
  echo "CLOUDFLARE_TUNNEL_TOKEN=$TUNNEL_TOKEN" >> "$ENV_FILE"
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "  Domain:  https://$DOMAIN"
echo "  Tunnel:  $TUNNEL_NAME ($TUNNEL_ID)"
echo "  Token:   Written to .env.local"
echo "  Config:  $CONFIG_FILE"
echo ""
echo "To start:"
echo "  docker compose -f docker-compose.yml -f docker-compose.cloudflare.yml up -d"
echo ""
echo "To verify:"
echo "  docker compose logs cloudflared"
echo ""

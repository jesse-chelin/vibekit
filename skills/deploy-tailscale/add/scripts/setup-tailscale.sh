#!/bin/bash
set -euo pipefail

# ─── Tailscale Funnel Setup ─────────────────────────────────
# Configures Tailscale Serve + Funnel to expose your app publicly

APP_PORT="${1:-3000}"

echo "=== Tailscale Funnel Setup ==="
echo ""

# ─── Check Tailscale installed ───────────────────────────────

if ! command -v tailscale &> /dev/null; then
  echo "Tailscale is not installed."
  echo ""
  if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Install with:"
    echo "  curl -fsSL https://tailscale.com/install.sh | sh"
    echo ""
    read -rp "Install now? [Y/n] " INSTALL
    if [[ "${INSTALL:-Y}" =~ ^[Yy]$ ]]; then
      curl -fsSL https://tailscale.com/install.sh | sh
    else
      echo "Please install Tailscale and re-run this script."
      exit 1
    fi
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Install from: https://tailscale.com/download/mac"
    echo "Or: brew install tailscale"
    exit 1
  else
    echo "Install from: https://tailscale.com/download"
    exit 1
  fi
  echo ""
fi

echo "Tailscale version: $(tailscale version | head -1)"
echo ""

# ─── Check Tailscale connected ──────────────────────────────

TS_STATUS=$(tailscale status --json 2>/dev/null || echo '{"BackendState":"Stopped"}')
BACKEND_STATE=$(echo "$TS_STATUS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('BackendState','Stopped'))" 2>/dev/null || echo "Stopped")

if [[ "$BACKEND_STATE" != "Running" ]]; then
  echo "Tailscale is not connected (state: $BACKEND_STATE)."
  echo "Starting Tailscale..."
  echo ""
  sudo tailscale up
  echo ""

  # Re-check
  TS_STATUS=$(tailscale status --json 2>/dev/null || echo '{"BackendState":"Stopped"}')
  BACKEND_STATE=$(echo "$TS_STATUS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('BackendState','Stopped'))" 2>/dev/null || echo "Stopped")

  if [[ "$BACKEND_STATE" != "Running" ]]; then
    echo "Error: Tailscale failed to connect. Please run 'sudo tailscale up' manually."
    exit 1
  fi
fi

# Get the machine's Tailscale hostname
TS_HOSTNAME=$(tailscale status --json 2>/dev/null | python3 -c "
import sys, json
data = json.load(sys.stdin)
self_node = data.get('Self', {})
dns = self_node.get('DNSName', '')
# Remove trailing dot
print(dns.rstrip('.'))
" 2>/dev/null || echo "")

echo "Connected as: ${TS_HOSTNAME:-unknown}"
echo ""

# ─── Configure Tailscale Serve ───────────────────────────────

echo "Configuring Tailscale Serve to proxy port $APP_PORT..."
tailscale serve --bg https / http://localhost:$APP_PORT 2>/dev/null || \
  tailscale serve https / http://localhost:$APP_PORT 2>/dev/null || {
    echo "Error configuring Tailscale Serve."
    echo "You may need to run: sudo tailscale serve https / http://localhost:$APP_PORT"
    exit 1
  }
echo "Serve configured."
echo ""

# ─── Enable Funnel ───────────────────────────────────────────

echo "Enabling Tailscale Funnel..."
tailscale funnel 443 on 2>/dev/null || {
  echo ""
  echo "Error: Could not enable Funnel."
  echo ""
  echo "Funnel must be enabled in your Tailscale admin console:"
  echo "  1. Go to https://login.tailscale.com/admin/dns"
  echo "  2. Enable HTTPS certificates"
  echo "  3. Enable Funnel"
  echo ""
  echo "After enabling, re-run this script."
  exit 1
}
echo "Funnel enabled."
echo ""

# ─── Show status ─────────────────────────────────────────────

echo "=== Setup Complete ==="
echo ""
echo "Your app is publicly available at:"
echo ""
if [[ -n "$TS_HOSTNAME" ]]; then
  echo "  https://$TS_HOSTNAME"
else
  echo "  (Check 'tailscale funnel status' for your URL)"
fi
echo ""
echo "Serve status:"
tailscale serve status 2>/dev/null || echo "  Run 'tailscale serve status' to check."
echo ""
echo "To stop sharing publicly:"
echo "  tailscale funnel 443 off"
echo ""
echo "To stop serve completely:"
echo "  tailscale serve reset"
echo ""

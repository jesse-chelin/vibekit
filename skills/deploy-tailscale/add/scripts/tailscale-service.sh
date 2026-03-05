#!/bin/bash
set -euo pipefail

# ─── Tailscale + App systemd Service ────────────────────────
# Creates a systemd user service that starts the app and configures
# Tailscale Serve on boot.

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVICE_DIR="$HOME/.config/systemd/user"
SERVICE_NAME="vibekit"
APP_PORT=3000

echo "=== Creating systemd Service ==="
echo ""

# Create service directory
mkdir -p "$SERVICE_DIR"

# Determine start command
if [[ -f "$PROJECT_ROOT/docker-compose.yml" ]]; then
  START_CMD="docker compose -f $PROJECT_ROOT/docker-compose.yml up -d && sleep 5"
  STOP_CMD="docker compose -f $PROJECT_ROOT/docker-compose.yml down"
  echo "Detected docker-compose setup."
else
  START_CMD="cd $PROJECT_ROOT && pnpm start"
  STOP_CMD=""
  echo "Using pnpm start."
fi

# Write service file
cat > "$SERVICE_DIR/$SERVICE_NAME.service" << EOF
[Unit]
Description=Vibekit App with Tailscale Funnel
After=network-online.target tailscaled.service
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$PROJECT_ROOT

# Start the app
ExecStart=/bin/bash -c '$START_CMD'

# Configure Tailscale Serve and Funnel
ExecStartPost=/bin/bash -c 'sleep 2 && tailscale serve https / http://localhost:$APP_PORT && tailscale funnel 443 on'

# Cleanup on stop
ExecStop=/bin/bash -c 'tailscale funnel 443 off; tailscale serve reset; $STOP_CMD'

Restart=on-failure
RestartSec=10

[Install]
WantedBy=default.target
EOF

echo "Service file written to: $SERVICE_DIR/$SERVICE_NAME.service"
echo ""

# Reload systemd and enable
systemctl --user daemon-reload
systemctl --user enable "$SERVICE_NAME.service"

echo "Service enabled. It will start automatically on login."
echo ""
echo "Commands:"
echo "  systemctl --user start $SERVICE_NAME    # Start now"
echo "  systemctl --user stop $SERVICE_NAME     # Stop"
echo "  systemctl --user status $SERVICE_NAME   # Check status"
echo "  systemctl --user restart $SERVICE_NAME  # Restart"
echo "  journalctl --user -u $SERVICE_NAME -f   # View logs"
echo ""

read -rp "Start the service now? [Y/n] " START_NOW
if [[ "${START_NOW:-Y}" =~ ^[Yy]$ ]]; then
  systemctl --user start "$SERVICE_NAME.service"
  echo ""
  echo "Service started. Check status with:"
  echo "  systemctl --user status $SERVICE_NAME"
fi

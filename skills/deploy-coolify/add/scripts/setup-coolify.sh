#!/bin/bash
set -euo pipefail

# ─── Coolify Deployment Setup ────────────────────────────────
# Guides you through setting up your app on Coolify

echo "=== Coolify Deployment Setup ==="
echo ""

# ─── Gather Info ─────────────────────────────────────────────

read -rp "Coolify Dashboard URL (e.g. https://coolify.example.com): " COOLIFY_URL
if [[ -z "$COOLIFY_URL" ]]; then
  echo "Error: Coolify URL is required."
  exit 1
fi

# Remove trailing slash
COOLIFY_URL="${COOLIFY_URL%/}"

echo ""
echo "Checking Coolify accessibility..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$COOLIFY_URL" 2>/dev/null || echo "000")

if [[ "$HTTP_STATUS" == "000" ]]; then
  echo "Error: Cannot reach $COOLIFY_URL"
  echo "Make sure Coolify is running and accessible."
  exit 1
fi

echo "Coolify is accessible (HTTP $HTTP_STATUS)."
echo ""

# ─── Check API Access ────────────────────────────────────────

echo "Coolify has an API, but the easiest setup is via the Dashboard."
echo ""
echo "=== Follow these steps in the Coolify Dashboard ==="
echo ""
echo "1. Open: $COOLIFY_URL"
echo ""
echo "2. Create a new Application:"
echo "   - Click 'New Resource' → 'Application'"
echo "   - Select your Git provider and repository"
echo "   - Build Pack: 'Docker Compose'"
echo "   - Docker Compose Location: docker-compose.coolify.yml"
echo ""
echo "3. Set Environment Variables:"
echo "   Go to Application → Environment and add:"
echo ""

# Generate credentials
AUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
PG_PASSWORD=$(openssl rand -base64 16 2>/dev/null || head -c 16 /dev/urandom | base64)

echo "   POSTGRES_USER=vibekit"
echo "   POSTGRES_PASSWORD=$PG_PASSWORD"
echo "   POSTGRES_DB=vibekit"
echo "   DATABASE_URL=postgresql://vibekit:$PG_PASSWORD@db:5432/vibekit"
echo "   AUTH_SECRET=$AUTH_SECRET"
echo "   AUTH_URL=https://your-app-domain.com  (set after configuring domain)"
echo "   NEXT_PUBLIC_APP_URL=https://your-app-domain.com"
echo ""

# Save to a local file for reference
CREDS_FILE=".coolify-credentials"
cat > "$CREDS_FILE" << EOF
# Coolify Deployment Credentials
# Generated on $(date)
# IMPORTANT: This file contains secrets. Do NOT commit to git.

POSTGRES_USER=vibekit
POSTGRES_PASSWORD=$PG_PASSWORD
POSTGRES_DB=vibekit
DATABASE_URL=postgresql://vibekit:$PG_PASSWORD@db:5432/vibekit
AUTH_SECRET=$AUTH_SECRET
AUTH_URL=https://your-app-domain.com
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
EOF

echo "   Credentials saved to $CREDS_FILE (do NOT commit this file)"
echo ""

# Check gitignore
if ! grep -q "$CREDS_FILE" .gitignore 2>/dev/null; then
  echo "$CREDS_FILE" >> .gitignore
  echo "   Added $CREDS_FILE to .gitignore"
fi
echo ""

echo "4. Configure Domain:"
echo "   Go to Application → Settings → Domains"
echo "   Add your domain — Coolify will auto-provision SSL"
echo ""

echo "5. Deploy:"
echo "   Click 'Deploy' in the Application dashboard"
echo "   Coolify will build the Docker image and start the containers"
echo ""

echo "6. After Deploy:"
echo "   Update AUTH_URL and NEXT_PUBLIC_APP_URL with your actual domain"
echo "   Redeploy for the changes to take effect"
echo ""

echo "=== Setup Guide Complete ==="
echo ""
echo "Your Coolify Dashboard: $COOLIFY_URL"
echo "Credentials file: $CREDS_FILE"
echo ""

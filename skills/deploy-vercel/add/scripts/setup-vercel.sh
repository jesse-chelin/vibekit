#!/bin/bash
set -euo pipefail

# ─── Vercel Deployment Setup ────────────────────────────────
# Links project, configures environment, and runs first deploy

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "=== Vercel Deployment Setup ==="
echo ""

# ─── Install Vercel CLI ──────────────────────────────────────

if ! command -v vercel &> /dev/null; then
  echo "Installing Vercel CLI..."
  npm install -g vercel
  echo ""
fi

echo "Vercel CLI version: $(vercel --version)"
echo ""

# ─── Login ───────────────────────────────────────────────────

echo "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
  echo "You need to log in to Vercel."
  vercel login
  echo ""
fi

echo "Logged in as: $(vercel whoami)"
echo ""

# ─── Link Project ───────────────────────────────────────────

if [[ ! -d ".vercel" ]]; then
  echo "Linking project to Vercel..."
  vercel link
  echo ""
else
  echo "Project already linked to Vercel."
  echo ""
fi

# ─── Environment Variables ───────────────────────────────────

echo "=== Environment Variables ==="
echo ""
echo "Your app needs these environment variables set in Vercel."
echo "You can set them now or later in the Vercel Dashboard."
echo ""

# DATABASE_URL
echo "1. DATABASE_URL (PostgreSQL connection string)"
echo "   Recommended providers: Neon (neon.tech), Supabase, Vercel Postgres"
read -rp "   Enter DATABASE_URL (or press Enter to skip): " DB_URL
if [[ -n "$DB_URL" ]]; then
  vercel env add DATABASE_URL production <<< "$DB_URL"
  vercel env add DATABASE_URL preview <<< "$DB_URL"
  echo "   Set for production and preview."
fi
echo ""

# AUTH_SECRET
echo "2. AUTH_SECRET (random secret for authentication)"
AUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
read -rp "   Use generated secret '$AUTH_SECRET'? [Y/n] " USE_SECRET
if [[ "${USE_SECRET:-Y}" =~ ^[Yy]$ ]]; then
  vercel env add AUTH_SECRET production <<< "$AUTH_SECRET"
  vercel env add AUTH_SECRET preview <<< "$AUTH_SECRET"
  echo "   Set for production and preview."
else
  read -rp "   Enter your own AUTH_SECRET: " CUSTOM_SECRET
  if [[ -n "$CUSTOM_SECRET" ]]; then
    vercel env add AUTH_SECRET production <<< "$CUSTOM_SECRET"
    vercel env add AUTH_SECRET preview <<< "$CUSTOM_SECRET"
  fi
fi
echo ""

echo "Note: After your first deploy, set these additional variables:"
echo "  AUTH_URL=https://your-app.vercel.app"
echo "  NEXT_PUBLIC_APP_URL=https://your-app.vercel.app"
echo ""

# ─── Database Migration ─────────────────────────────────────

if [[ -n "${DB_URL:-}" ]]; then
  read -rp "Run database migration now? [Y/n] " MIGRATE
  if [[ "${MIGRATE:-Y}" =~ ^[Yy]$ ]]; then
    echo "Running migration..."
    ./scripts/vercel-db-migrate.sh "$DB_URL"
    echo ""
  fi
fi

# ─── Deploy ──────────────────────────────────────────────────

echo "=== Deploying ==="
echo ""
read -rp "Deploy to production now? [Y/n] " DEPLOY
if [[ "${DEPLOY:-Y}" =~ ^[Yy]$ ]]; then
  echo "Building and deploying..."
  DEPLOY_URL=$(vercel --prod 2>&1 | grep -oE 'https://[^ ]+' | head -1 || echo "")

  echo ""
  echo "=== Deployment Complete ==="
  echo ""
  if [[ -n "$DEPLOY_URL" ]]; then
    echo "  URL: $DEPLOY_URL"
    echo ""
    echo "Now set these env vars in Vercel Dashboard → Settings → Environment Variables:"
    echo "  AUTH_URL=$DEPLOY_URL"
    echo "  NEXT_PUBLIC_APP_URL=$DEPLOY_URL"
  else
    echo "  Check the Vercel Dashboard for your deployment URL."
  fi
else
  echo ""
  echo "To deploy later:"
  echo "  vercel --prod"
fi

echo ""
echo "Useful commands:"
echo "  vercel              # Preview deploy"
echo "  vercel --prod       # Production deploy"
echo "  vercel domains add  # Add custom domain"
echo "  vercel env ls       # List environment variables"
echo "  vercel logs         # View deployment logs"
echo ""

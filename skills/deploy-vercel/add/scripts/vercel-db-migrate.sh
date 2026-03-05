#!/bin/bash
set -euo pipefail

# ─── Database Migration: SQLite → PostgreSQL ─────────────────
# Switches Prisma provider and pushes schema to a PostgreSQL database

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCHEMA_FILE="$PROJECT_ROOT/prisma/schema.prisma"
DATABASE_URL="${1:-}"

echo "=== Database Migration ==="
echo ""

if [[ -z "$DATABASE_URL" ]]; then
  read -rp "Enter your PostgreSQL DATABASE_URL: " DATABASE_URL
fi

if [[ -z "$DATABASE_URL" ]]; then
  echo "Error: DATABASE_URL is required."
  echo "Format: postgresql://user:password@host:5432/database"
  exit 1
fi

# Validate it looks like a Postgres URL
if [[ ! "$DATABASE_URL" =~ ^postgres(ql)?:// ]]; then
  echo "Warning: URL doesn't look like a PostgreSQL connection string."
  read -rp "Continue anyway? [y/N] " CONTINUE
  if [[ ! "${CONTINUE:-N}" =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# ─── Update Prisma schema ───────────────────────────────────

echo "Updating Prisma schema to use PostgreSQL..."
if grep -q 'provider = "sqlite"' "$SCHEMA_FILE"; then
  sed -i.bak 's/provider = "sqlite"/provider = "postgresql"/' "$SCHEMA_FILE"
  rm -f "$SCHEMA_FILE.bak"
  echo "  Provider changed to postgresql."
else
  echo "  Provider is already set to postgresql (or non-sqlite)."
fi

# ─── Generate client ─────────────────────────────────────────

echo "Generating Prisma client..."
cd "$PROJECT_ROOT"
DATABASE_URL="$DATABASE_URL" npx prisma generate
echo ""

# ─── Push schema ─────────────────────────────────────────────

echo "Pushing schema to database..."
DATABASE_URL="$DATABASE_URL" npx prisma db push --accept-data-loss
echo ""

# ─── Optional: Seed ──────────────────────────────────────────

read -rp "Seed the database with demo data? [y/N] " SEED
if [[ "${SEED:-N}" =~ ^[Yy]$ ]]; then
  echo "Seeding..."
  DATABASE_URL="$DATABASE_URL" npx tsx prisma/seed.ts
  echo "Database seeded."
fi

echo ""
echo "=== Migration Complete ==="
echo ""
echo "Your PostgreSQL database is ready."
echo "Make sure DATABASE_URL is set in your Vercel environment variables."
echo ""
echo "Note: The Prisma schema has been changed to 'postgresql'."
echo "For local dev, you can either:"
echo "  1. Use the same Postgres DB locally (set DATABASE_URL in .env.local)"
echo "  2. Change the provider back to 'sqlite' for local dev"
echo ""

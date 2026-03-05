#!/bin/bash
set -e

echo "Setting up Vibekit..."
echo ""

# Check for pnpm
if ! command -v pnpm &> /dev/null; then
  echo "pnpm not found. Installing..."
  npm install -g pnpm
fi

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
  echo "Creating .env.local..."
  AUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
  cat > .env.local << EOF
DATABASE_URL="file:./dev.db"
AUTH_SECRET="${AUTH_SECRET}"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EOF
  echo "Generated .env.local with a random AUTH_SECRET"
fi

# Generate Prisma client and push schema
echo "Setting up database..."
pnpm db:generate
pnpm db:push

# Seed database
echo "Seeding demo data..."
pnpm db:seed

echo ""
echo "Done! Run 'pnpm dev' to start the app."
echo "Open http://localhost:3000"
echo ""
echo "Demo account: demo@vibekit.dev (any password)"

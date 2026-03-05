#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  Vibekit — Let's set up your app${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ─── Step 1: Check prerequisites ─────────────────────────────────────────────

echo -e "${BLUE}Checking prerequisites...${NC}"
echo ""

MISSING=0

# Check Node.js
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v | sed 's/v//')
  NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
  if [ "$NODE_MAJOR" -ge 18 ]; then
    echo -e "  ${GREEN}✓${NC} Node.js $NODE_VERSION"
  else
    echo -e "  ${RED}✗${NC} Node.js $NODE_VERSION (need 18+)"
    echo -e "    ${YELLOW}→ Update at: https://nodejs.org${NC}"
    MISSING=1
  fi
else
  echo -e "  ${RED}✗${NC} Node.js not found"
  echo -e "    ${YELLOW}→ Install at: https://nodejs.org${NC}"
  MISSING=1
fi

# Check pnpm
if command -v pnpm &> /dev/null; then
  echo -e "  ${GREEN}✓${NC} pnpm $(pnpm -v)"
else
  echo -e "  ${YELLOW}!${NC} pnpm not found — installing now..."
  npm install -g pnpm
  if command -v pnpm &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} pnpm $(pnpm -v) installed"
  else
    echo -e "  ${RED}✗${NC} Failed to install pnpm"
    echo -e "    ${YELLOW}→ Try: npm install -g pnpm${NC}"
    MISSING=1
  fi
fi

# Check Claude Code
if command -v claude &> /dev/null; then
  echo -e "  ${GREEN}✓${NC} Claude Code"
else
  echo -e "  ${YELLOW}!${NC} Claude Code not found"
  echo -e "    ${YELLOW}→ Install: npm install -g @anthropic-ai/claude-code${NC}"
  echo -e "    ${YELLOW}→ You'll need this to build your app, but setup can continue without it.${NC}"
fi

# Check git
if command -v git &> /dev/null; then
  echo -e "  ${GREEN}✓${NC} git $(git --version | sed 's/git version //')"
else
  echo -e "  ${RED}✗${NC} git not found"
  echo -e "    ${YELLOW}→ Install at: https://git-scm.com${NC}"
  MISSING=1
fi

echo ""

if [ "$MISSING" -eq 1 ]; then
  echo -e "${RED}Some prerequisites are missing. Please install them and run this script again.${NC}"
  exit 1
fi

echo -e "${GREEN}All prerequisites met.${NC}"
echo ""

# ─── Step 2: What are you building? ──────────────────────────────────────────

echo -e "${BOLD}What kind of app are you building?${NC}"
echo ""
echo "  1) SaaS / Productivity tool   (project management, CRM, task tracker, etc.)"
echo "  2) Dashboard / Analytics       (data visualization, metrics, reporting)"
echo "  3) AI-powered app              (chatbot, content generation, smart assistant)"
echo "  4) E-commerce / Marketplace    (store, listings, payments)"
echo "  5) Community / Social          (forum, chat, social network)"
echo "  6) Internal tool               (admin panel, team tool, business workflow)"
echo "  7) Something else              (Claude will help you figure it out)"
echo ""
read -p "Pick a number [1-7]: " APP_TYPE

case $APP_TYPE in
  1) CATEGORY="saas" ;;
  2) CATEGORY="dashboard" ;;
  3) CATEGORY="ai" ;;
  4) CATEGORY="ecommerce" ;;
  5) CATEGORY="social" ;;
  6) CATEGORY="internal" ;;
  *) CATEGORY="custom" ;;
esac

echo ""
read -p "What's your app called? (e.g., 'FitTracker', 'TeamBoard'): " APP_NAME

if [ -z "$APP_NAME" ]; then
  APP_NAME="My App"
fi

echo ""
echo -e "${BLUE}Setting up ${BOLD}${APP_NAME}${NC}${BLUE} (${CATEGORY})...${NC}"
echo ""

# Save the user's intent so Claude can read it
mkdir -p .vibekit
cat > .vibekit/intent.json << EOF
{
  "appName": "${APP_NAME}",
  "category": "${CATEGORY}",
  "setupDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "setupComplete": true
}
EOF

# ─── Step 3: Install dependencies ────────────────────────────────────────────

echo -e "${BLUE}[1/3] Installing dependencies...${NC}"
pnpm install --silent 2>&1 | tail -1
echo -e "  ${GREEN}✓${NC} Dependencies installed"
echo ""

# ─── Step 4: Set up environment ──────────────────────────────────────────────

if [ ! -f .env.local ]; then
  echo -e "${BLUE}[2/3] Creating environment config...${NC}"
  AUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
  cat > .env.local << EOF
DATABASE_URL="file:./dev.db"
AUTH_SECRET="${AUTH_SECRET}"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EOF
  echo -e "  ${GREEN}✓${NC} Environment configured"
else
  echo -e "${BLUE}[2/3] Environment config...${NC}"
  echo -e "  ${GREEN}✓${NC} .env.local already exists"
fi
echo ""

# ─── Step 5: Set up database ─────────────────────────────────────────────────

echo -e "${BLUE}[3/3] Setting up database...${NC}"
pnpm db:generate 2>&1 | tail -1
pnpm db:push 2>&1 | tail -1
pnpm db:seed 2>&1 | tail -1
echo -e "  ${GREEN}✓${NC} Database ready with demo data"
echo ""

# ─── Done ─────────────────────────────────────────────────────────────────────

echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD}  Setup complete!${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${BOLD}Next steps:${NC}"
echo ""
echo -e "  ${BOLD}1.${NC} Start the dev server to verify everything works:"
echo ""
echo -e "     ${GREEN}pnpm dev${NC}"
echo ""
echo -e "     Open ${BLUE}http://localhost:3000${NC} — you should see a working app."
echo -e "     (Demo login: ${BOLD}demo@vibekit.dev${NC} with any password)"
echo ""
echo -e "  ${BOLD}2.${NC} Open Claude Code to build ${BOLD}${APP_NAME}${NC}:"
echo ""
echo -e "     ${GREEN}claude${NC}"
echo ""
echo -e "     Claude will read your project, see that you want to build"
echo -e "     a ${BOLD}${CATEGORY}${NC} app called ${BOLD}${APP_NAME}${NC}, and guide you through"
echo -e "     turning this starter into your app. Just describe what"
echo -e "     you want in plain English."
echo ""
echo -e "  That's it. Claude handles the rest."
echo ""

#!/bin/bash
set -e

# ─── Colors & Styling ────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
DIM='\033[2m'
ITALIC='\033[3m'
NC='\033[0m'

# Box-drawing characters
H_LINE="─"
V_LINE="│"
TL="╭"
TR="╮"
BL="╰"
BR="╯"

# ─── Helper Functions ─────────────────────────────────────────────────────────

spinner() {
  local pid=$1
  local msg=$2
  local frames=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
  local i=0
  tput civis 2>/dev/null || true  # hide cursor
  while kill -0 "$pid" 2>/dev/null; do
    printf "\r  ${CYAN}${frames[$i]}${NC} ${msg}"
    i=$(( (i + 1) % ${#frames[@]} ))
    sleep 0.08
  done
  wait "$pid" 2>/dev/null
  local exit_code=$?
  tput cnorm 2>/dev/null || true  # show cursor
  if [ $exit_code -eq 0 ]; then
    printf "\r  ${GREEN}✓${NC} ${msg}                    \n"
  else
    printf "\r  ${RED}✗${NC} ${msg}                    \n"
    return $exit_code
  fi
}

draw_box() {
  local width=$1
  shift
  local lines=("$@")
  local bar=""
  for ((i=0; i<width; i++)); do bar+="$H_LINE"; done
  echo -e "  ${DIM}${TL}${bar}${TR}${NC}"
  for line in "${lines[@]}"; do
    local stripped
    stripped=$(echo -e "$line" | sed 's/\x1b\[[0-9;]*m//g')
    local len=${#stripped}
    local pad=$((width - len))
    local spaces=""
    for ((i=0; i<pad; i++)); do spaces+=" "; done
    echo -e "  ${DIM}${V_LINE}${NC}${line}${spaces}${DIM}${V_LINE}${NC}"
  done
  echo -e "  ${DIM}${BL}${bar}${BR}${NC}"
}

# ─── Banner ───────────────────────────────────────────────────────────────────

clear 2>/dev/null || true
echo ""
echo ""
echo -e "  ${CYAN}${BOLD}  ╦  ╦${NC}${BOLD}╦╔╗ ╔═╗╦╔═╦╔╦╗${NC}"
echo -e "  ${CYAN}${BOLD}  ╚╗╔╝${NC}${BOLD}║╠╩╗║╣ ╠╩╗║ ║ ${NC}"
echo -e "  ${CYAN}${BOLD}   ╚╝ ${NC}${BOLD}╩╚═╝╚═╝╩ ╩╩ ╩ ${NC}"
echo ""
echo -e "  ${DIM}Build real apps, not demos.${NC}"
echo ""
echo ""

sleep 0.3

# ─── Step 1: Check prerequisites ─────────────────────────────────────────────

echo -e "  ${WHITE}${BOLD}Preflight check${NC}"
echo -e "  ${DIM}Making sure you have everything you need.${NC}"
echo ""

MISSING=0

# Check Node.js
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v | sed 's/v//')
  NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
  if [ "$NODE_MAJOR" -ge 18 ]; then
    echo -e "  ${GREEN}✓${NC} Node.js ${DIM}v${NODE_VERSION}${NC}"
  else
    echo -e "  ${RED}✗${NC} Node.js v${NODE_VERSION} ${RED}(need 18+)${NC}"
    echo -e "    ${DIM}→ Update at: ${CYAN}https://nodejs.org${NC}"
    MISSING=1
  fi
else
  echo -e "  ${RED}✗${NC} Node.js ${RED}not found${NC}"
  echo -e "    ${DIM}→ Install at: ${CYAN}https://nodejs.org${NC}"
  MISSING=1
fi

# Check pnpm
if command -v pnpm &> /dev/null; then
  echo -e "  ${GREEN}✓${NC} pnpm ${DIM}v$(pnpm -v)${NC}"
else
  echo -e "  ${YELLOW}○${NC} pnpm ${DIM}not found — installing...${NC}"
  npm install -g pnpm > /dev/null 2>&1
  if command -v pnpm &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} pnpm ${DIM}v$(pnpm -v) installed${NC}"
  else
    echo -e "  ${RED}✗${NC} pnpm ${RED}failed to install${NC}"
    echo -e "    ${DIM}→ Try: ${CYAN}npm install -g pnpm${NC}"
    MISSING=1
  fi
fi

# Check Claude Code
if command -v claude &> /dev/null; then
  echo -e "  ${GREEN}✓${NC} Claude Code"
else
  echo -e "  ${YELLOW}○${NC} Claude Code ${DIM}not found${NC}"
  echo -e "    ${DIM}→ Install: ${CYAN}npm install -g @anthropic-ai/claude-code${NC}"
  echo -e "    ${DIM}  You'll need this later to build your app.${NC}"
fi

# Check git
if command -v git &> /dev/null; then
  echo -e "  ${GREEN}✓${NC} git ${DIM}v$(git --version | sed 's/git version //')${NC}"
else
  echo -e "  ${RED}✗${NC} git ${RED}not found${NC}"
  echo -e "    ${DIM}→ Install at: ${CYAN}https://git-scm.com${NC}"
  MISSING=1
fi

echo ""

if [ "$MISSING" -eq 1 ]; then
  echo -e "  ${RED}${BOLD}Missing prerequisites.${NC} Install them and run this again."
  echo ""
  exit 1
fi

sleep 0.2

# ─── Step 2: What are you building? ──────────────────────────────────────────

echo ""
echo -e "  ${WHITE}${BOLD}What are you building?${NC}"
echo -e "  ${DIM}Pick the closest match. Claude will refine it with you later.${NC}"
echo ""
echo ""

echo -e "  ${CYAN}${BOLD}1${NC}  ${BOLD}SaaS / Productivity${NC}"
echo -e "     ${DIM}Project management, CRM, task tracker, booking system${NC}"
echo ""
echo -e "     ${DIM}┌──────────────────────────────┐${NC}"
echo -e "     ${DIM}│${NC} ${BOLD}Dashboard${NC}    ${DIM}▊▊▊▊${NC} ${GREEN}+12%${NC}     ${DIM}│${NC}"
echo -e "     ${DIM}│${NC} ${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━│${NC}"
echo -e "     ${DIM}│${NC} ☐ Task one     ${DIM}│${NC} ☑ Task two ${DIM}│${NC}"
echo -e "     ${DIM}│${NC} ☐ Task three   ${DIM}│${NC} ☐ Task four${DIM}│${NC}"
echo -e "     ${DIM}└──────────────────────────────┘${NC}"
echo ""

echo -e "  ${CYAN}${BOLD}2${NC}  ${BOLD}Dashboard / Analytics${NC}"
echo -e "     ${DIM}Data visualization, metrics, reporting, monitoring${NC}"
echo ""
echo -e "     ${DIM}┌──────────────────────────────┐${NC}"
echo -e "     ${DIM}│${NC} ${GREEN}2,847${NC}  ${CYAN}1,203${NC}  ${YELLOW}94%${NC}  ${MAGENTA}↑ 8.2${NC}  ${DIM}│${NC}"
echo -e "     ${DIM}│${NC}                              ${DIM}│${NC}"
echo -e "     ${DIM}│${NC}  ${DIM}▂${NC}${CYAN}▃▅▆▇█▇▅▆▇${NC}  ${DIM}▁▂${NC}${GREEN}▃▅▇█▆▅▃▂${NC}   ${DIM}│${NC}"
echo -e "     ${DIM}└──────────────────────────────┘${NC}"
echo ""

echo -e "  ${CYAN}${BOLD}3${NC}  ${BOLD}AI-powered app${NC}"
echo -e "     ${DIM}Chatbot, content generation, smart assistant${NC}"
echo ""
echo -e "     ${DIM}┌──────────────────────────────┐${NC}"
echo -e "     ${DIM}│${NC}  ${BLUE}◉${NC} How can I help?           ${DIM}│${NC}"
echo -e "     ${DIM}│${NC}                              ${DIM}│${NC}"
echo -e "     ${DIM}│${NC}  ${DIM}You:${NC} Summarize my notes  ${DIM}▸${NC}  ${DIM}│${NC}"
echo -e "     ${DIM}│${NC}  ${CYAN}AI:${NC}  Here's a summary...    ${DIM}│${NC}"
echo -e "     ${DIM}└──────────────────────────────┘${NC}"
echo ""

echo -e "  ${CYAN}${BOLD}4${NC}  ${BOLD}E-commerce / Marketplace${NC}"
echo -e "     ${DIM}Online store, listings, payments, inventory${NC}"
echo ""
echo -e "     ${DIM}┌──────────────────────────────┐${NC}"
echo -e "     ${DIM}│${NC} ${BOLD}⬡${NC} Product     ${GREEN}\$29${NC}  ${DIM}★★★★☆${NC}   ${DIM}│${NC}"
echo -e "     ${DIM}│${NC} ${BOLD}⬡${NC} Product     ${GREEN}\$49${NC}  ${DIM}★★★★★${NC}   ${DIM}│${NC}"
echo -e "     ${DIM}│${NC}          ${DIM}──────────────${NC}     ${DIM}│${NC}"
echo -e "     ${DIM}│${NC}          ${BOLD}Cart: 2 items${NC}      ${DIM}│${NC}"
echo -e "     ${DIM}└──────────────────────────────┘${NC}"
echo ""

echo -e "  ${CYAN}${BOLD}5${NC}  ${BOLD}Community / Social${NC}"
echo -e "     ${DIM}Forum, chat, social network, community platform${NC}"
echo ""
echo -e "     ${DIM}┌──────────────────────────────┐${NC}"
echo -e "     ${DIM}│${NC} ${GREEN}●${NC} Alex ${DIM}is typing...${NC}         ${DIM}│${NC}"
echo -e "     ${DIM}│${NC} ${DIM}●${NC} Sam  Hey everyone! 👋      ${DIM}│${NC}"
echo -e "     ${DIM}│${NC} ${DIM}●${NC} Jo   Welcome!              ${DIM}│${NC}"
echo -e "     ${DIM}│${NC} ${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━│${NC}"
echo -e "     ${DIM}│${NC}  ${DIM}Type a message...${NC}      ${CYAN}▸${NC}   ${DIM}│${NC}"
echo -e "     ${DIM}└──────────────────────────────┘${NC}"
echo ""

echo -e "  ${CYAN}${BOLD}6${NC}  ${BOLD}Internal tool${NC}"
echo -e "     ${DIM}Admin panel, team tool, business workflow${NC}"
echo ""
echo -e "     ${DIM}┌──────────────────────────────┐${NC}"
echo -e "     ${DIM}│${NC} ${BOLD}Users${NC} ${DIM}│${NC} ${BOLD}Roles${NC} ${DIM}│${NC} ${BOLD}Settings${NC}    ${DIM}│${NC}"
echo -e "     ${DIM}│${NC} ${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━│${NC}"
echo -e "     ${DIM}│${NC} Jane   Admin   ${GREEN}Active${NC}      ${DIM}│${NC}"
echo -e "     ${DIM}│${NC} Bob    Editor  ${GREEN}Active${NC}      ${DIM}│${NC}"
echo -e "     ${DIM}│${NC} Carol  Viewer  ${YELLOW}Pending${NC}     ${DIM}│${NC}"
echo -e "     ${DIM}└──────────────────────────────┘${NC}"
echo ""

echo -e "  ${CYAN}${BOLD}7${NC}  ${BOLD}Something else${NC}"
echo -e "     ${DIM}Describe it to Claude and build whatever you want${NC}"
echo ""

echo ""
read -p "  Pick a number [1-7]: " APP_TYPE

case $APP_TYPE in
  1) CATEGORY="saas" ; CATEGORY_LABEL="SaaS / Productivity" ;;
  2) CATEGORY="dashboard" ; CATEGORY_LABEL="Dashboard / Analytics" ;;
  3) CATEGORY="ai" ; CATEGORY_LABEL="AI-powered app" ;;
  4) CATEGORY="ecommerce" ; CATEGORY_LABEL="E-commerce / Marketplace" ;;
  5) CATEGORY="social" ; CATEGORY_LABEL="Community / Social" ;;
  6) CATEGORY="internal" ; CATEGORY_LABEL="Internal tool" ;;
  *) CATEGORY="custom" ; CATEGORY_LABEL="Custom" ;;
esac

echo ""
echo ""
echo -e "  ${WHITE}${BOLD}What's your app called?${NC}"
echo -e "  ${DIM}Something short and memorable. You can always change it later.${NC}"
echo ""
read -p "  App name: " APP_NAME

if [ -z "$APP_NAME" ]; then
  APP_NAME="My App"
fi

echo ""
echo ""

# Save the user's intent so Claude can read it
mkdir -p .vibekit
cat > .vibekit/intent.json << EOF
{
  "appName": "${APP_NAME}",
  "category": "${CATEGORY}",
  "categoryLabel": "${CATEGORY_LABEL}",
  "setupDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "setupComplete": true
}
EOF

# ─── Step 3: Install everything ──────────────────────────────────────────────

echo -e "  ${WHITE}${BOLD}Setting up ${APP_NAME}${NC}"
echo -e "  ${DIM}This takes about 30 seconds.${NC}"
echo ""

# Dependencies
pnpm install --silent > /dev/null 2>&1 &
spinner $! "Installing dependencies"

# Environment
if [ ! -f .env.local ]; then
  AUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
  cat > .env.local << EOF
DATABASE_URL="file:./dev.db"
AUTH_SECRET="${AUTH_SECRET}"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EOF
  echo -e "  ${GREEN}✓${NC} Environment configured"
else
  echo -e "  ${GREEN}✓${NC} Environment already configured"
fi

# Database
(pnpm db:generate > /dev/null 2>&1 && pnpm db:push > /dev/null 2>&1 && pnpm db:seed > /dev/null 2>&1) &
spinner $! "Setting up database"

echo ""

# ─── Done ─────────────────────────────────────────────────────────────────────

sleep 0.3

echo ""
echo -e "  ${GREEN}${BOLD}⚡ ${APP_NAME} is ready.${NC}"
echo ""
echo ""

draw_box 44 \
  " ${BOLD}Next steps${NC}                                 " \
  "                                            " \
  " ${BOLD}1.${NC} Start the dev server:                   " \
  "                                            " \
  "    ${GREEN}pnpm dev${NC}                                " \
  "                                            " \
  "    Open ${CYAN}http://localhost:3000${NC}               " \
  "    ${DIM}Login: demo@vibekit.dev (any password)${NC}  " \
  "                                            " \
  " ${BOLD}2.${NC} Build your app with Claude:              " \
  "                                            " \
  "    ${GREEN}claude${NC}                                  " \
  "                                            " \
  "    ${DIM}Claude knows you're building${NC}             " \
  "    ${DIM}a ${BOLD}${CATEGORY_LABEL}${NC}${DIM} called ${BOLD}${APP_NAME}${NC}${DIM}.${NC}  " \
  "    ${DIM}Just describe what you want.${NC}             " \
  "                                            "

echo ""
echo ""

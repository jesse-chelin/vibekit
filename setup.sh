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
NC='\033[0m'

# ─── Helper Functions ─────────────────────────────────────────────────────────

spinner() {
  local pid=$1
  local msg=$2
  local logfile=$3
  local frames=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
  local i=0
  tput civis 2>/dev/null || true
  while kill -0 "$pid" 2>/dev/null; do
    printf "\r  ${CYAN}${frames[$i]}${NC} ${msg}"
    i=$(( (i + 1) % ${#frames[@]} ))
    sleep 0.08
  done
  wait "$pid" 2>/dev/null
  local exit_code=$?
  tput cnorm 2>/dev/null || true
  if [ $exit_code -eq 0 ]; then
    printf "\r  ${GREEN}✓${NC} ${msg}                    \n"
  else
    printf "\r  ${RED}✗${NC} ${msg}                    \n"
    echo ""
    if [ -n "$logfile" ] && [ -f "$logfile" ]; then
      echo -e "  ${RED}Something went wrong. Here's what happened:${NC}"
      echo -e "  ${DIM}$(cat "$logfile" | tail -10)${NC}"
      echo ""
    fi
    echo -e "  ${DIM}Try running the failed step manually to see the full error.${NC}"
    exit 1
  fi
}

# Draws a box with auto-padded lines. Only uses safe box-drawing chars for borders.
# Usage: draw_box <indent> <width> "line1" "line2" ...
draw_box() {
  local indent="$1"
  local width=$2
  shift 2
  local lines=("$@")
  local bar=""
  for ((i=0; i<width; i++)); do bar+="─"; done
  echo -e "${indent}${DIM}╭${bar}╮${NC}"
  for line in "${lines[@]}"; do
    local stripped
    stripped=$(echo -e "$line" | sed 's/\x1b\[[0-9;]*m//g')
    local len=${#stripped}
    local pad=$((width - len))
    if [ $pad -lt 0 ]; then pad=0; fi
    local spaces=""
    for ((i=0; i<pad; i++)); do spaces+=" "; done
    echo -e "${indent}${DIM}│${NC}${line}${spaces}${DIM}│${NC}"
  done
  echo -e "${indent}${DIM}╰${bar}╯${NC}"
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

# ─── Step 1: Preflight ───────────────────────────────────────────────────────

echo -e "  ${WHITE}${BOLD}Preflight check${NC}"
echo -e "  ${DIM}Making sure you have everything you need.${NC}"
echo ""

MISSING=0

if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v | sed 's/v//')
  NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
  if [ "$NODE_MAJOR" -ge 18 ]; then
    echo -e "  ${GREEN}✓${NC} Node.js ${DIM}v${NODE_VERSION}${NC}"
  else
    echo -e "  ${RED}✗${NC} Node.js v${NODE_VERSION} ${RED}(need 18+)${NC}"
    echo -e "    ${DIM}Update at: ${CYAN}https://nodejs.org${NC}"
    MISSING=1
  fi
else
  echo -e "  ${RED}✗${NC} Node.js ${RED}not found${NC}"
  echo -e "    ${DIM}Install at: ${CYAN}https://nodejs.org${NC}"
  MISSING=1
fi

if command -v pnpm &> /dev/null; then
  echo -e "  ${GREEN}✓${NC} pnpm ${DIM}v$(pnpm -v)${NC}"
else
  echo -e "  ${YELLOW}○${NC} pnpm ${DIM}not found — installing...${NC}"
  npm install -g pnpm > /dev/null 2>&1
  if command -v pnpm &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} pnpm ${DIM}v$(pnpm -v) installed${NC}"
  else
    echo -e "  ${RED}✗${NC} pnpm ${RED}failed to install${NC}"
    echo -e "    ${DIM}Try: ${CYAN}npm install -g pnpm${NC}"
    MISSING=1
  fi
fi

if command -v claude &> /dev/null; then
  echo -e "  ${GREEN}✓${NC} Claude Code"
else
  echo -e "  ${YELLOW}○${NC} Claude Code ${DIM}not found${NC}"
  echo -e "    ${DIM}Install: ${CYAN}npm install -g @anthropic-ai/claude-code${NC}"
  echo -e "    ${DIM}You'll need this later to build your app.${NC}"
fi

if command -v git &> /dev/null; then
  echo -e "  ${GREEN}✓${NC} git ${DIM}v$(git --version | sed 's/git version //')${NC}"
else
  echo -e "  ${RED}✗${NC} git ${RED}not found${NC}"
  echo -e "    ${DIM}Install at: ${CYAN}https://git-scm.com${NC}"
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

# Option 1
echo -e "  ${CYAN}${BOLD}1${NC}  ${BOLD}SaaS / Productivity${NC}"
echo -e "     ${DIM}Project management, CRM, task tracker, booking system${NC}"
echo ""
draw_box "     " 34 \
  " ${BOLD}Dashboard${NC}          ${GREEN}==== +12%${NC}  " \
  " ${DIM}--------------------------------${NC} " \
  " [ ] Task one     ${GREEN}[x]${NC} Task two " \
  " [ ] Task three   [ ] Task four"
echo ""

# Option 2
echo -e "  ${CYAN}${BOLD}2${NC}  ${BOLD}Dashboard / Analytics${NC}"
echo -e "     ${DIM}Data visualization, metrics, reporting${NC}"
echo ""
draw_box "     " 34 \
  " ${GREEN}2,847${NC}  ${CYAN}1,203${NC}  ${YELLOW}94%${NC}   ${MAGENTA}+8.2${NC}    " \
  "                                  " \
  "  ${DIM}.${NC}${CYAN}==${NC}${CYAN}=====${NC}${CYAN}==${NC}${DIM}..${NC}  ${DIM}.${NC}${GREEN}==${NC}${GREEN}=====${NC}${GREEN}==${NC}${DIM}.${NC}   " \
  " ${DIM}.'${NC}          ${DIM}'..'${NC}          ${DIM}'.${NC}  "
echo ""

# Option 3
echo -e "  ${CYAN}${BOLD}3${NC}  ${BOLD}AI-powered app${NC}"
echo -e "     ${DIM}Chatbot, content generation, smart assistant${NC}"
echo ""
draw_box "     " 34 \
  " ${CYAN}>${NC} ${BOLD}How can I help today?${NC}          " \
  "                                  " \
  " ${DIM}You:${NC} Summarize my notes     ${DIM}>${NC}  " \
  " ${CYAN}AI:${NC}  Here's what I found...    "
echo ""

# Option 4
echo -e "  ${CYAN}${BOLD}4${NC}  ${BOLD}E-commerce / Marketplace${NC}"
echo -e "     ${DIM}Online store, listings, payments, inventory${NC}"
echo ""
draw_box "     " 34 \
  " ${BOLD}*${NC} Product One    ${GREEN}\$29${NC}  ${YELLOW}****${NC}${DIM}*${NC}  " \
  " ${BOLD}*${NC} Product Two    ${GREEN}\$49${NC}  ${YELLOW}*****${NC}  " \
  " ${DIM}--------------------------------${NC} " \
  "        ${BOLD}Cart: 2 items${NC}  ${CYAN}[pay]${NC}   "
echo ""

# Option 5
echo -e "  ${CYAN}${BOLD}5${NC}  ${BOLD}Community / Social${NC}"
echo -e "     ${DIM}Forum, chat, social network, community platform${NC}"
echo ""
draw_box "     " 34 \
  " ${GREEN}*${NC} Alex ${DIM}is typing...${NC}            " \
  " ${DIM}*${NC} Sam  Hey everyone!           " \
  " ${DIM}*${NC} Jo   Welcome back!           " \
  " ${DIM}--------------------------------${NC} " \
  " ${DIM}Type a message...${NC}          ${CYAN}>${NC}  "
echo ""

# Option 6
echo -e "  ${CYAN}${BOLD}6${NC}  ${BOLD}Internal tool${NC}"
echo -e "     ${DIM}Admin panel, team tool, business workflow${NC}"
echo ""
draw_box "     " 34 \
  " ${BOLD}Users${NC}  | ${BOLD}Roles${NC}  | ${BOLD}Settings${NC}     " \
  " ${DIM}--------------------------------${NC} " \
  " Jane    Admin    ${GREEN}Active${NC}       " \
  " Bob     Editor   ${GREEN}Active${NC}       " \
  " Carol   Viewer   ${YELLOW}Pending${NC}      "
echo ""

# Option 7
echo -e "  ${CYAN}${BOLD}7${NC}  ${BOLD}Something else${NC}"
echo -e "     ${DIM}Tell Claude what you want and build whatever you imagine.${NC}"
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
echo -e "  ${DIM}Something short and memorable. You can change it later.${NC}"
echo ""
read -p "  App name: " APP_NAME

if [ -z "$APP_NAME" ]; then
  APP_NAME="My App"
fi

echo ""
echo ""

# Save intent for Claude
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

# ─── Step 3: Install ─────────────────────────────────────────────────────────

echo -e "  ${WHITE}${BOLD}Setting up ${APP_NAME}${NC}"
echo -e "  ${DIM}This takes about 30 seconds.${NC}"
echo ""

# Dependencies
LOGFILE=$(mktemp)
pnpm install --silent > "$LOGFILE" 2>&1 &
spinner $! "Installing dependencies" "$LOGFILE"

# Environment — write to .env (Prisma reads this) and .env.local (Next.js reads this)
if [ ! -f .env ]; then
  AUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
  cat > .env << EOF
DATABASE_URL="file:./dev.db"
AUTH_SECRET="${AUTH_SECRET}"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EOF
  cp .env .env.local
  echo -e "  ${GREEN}✓${NC} Environment configured"
else
  echo -e "  ${GREEN}✓${NC} Environment already configured"
fi

# Database
LOGFILE=$(mktemp)
(pnpm db:generate 2>&1 && pnpm db:push 2>&1 && pnpm db:seed 2>&1) > "$LOGFILE" 2>&1 &
spinner $! "Setting up database" "$LOGFILE"

echo ""
sleep 0.3

# ─── Done ─────────────────────────────────────────────────────────────────────

echo ""
echo -e "  ${GREEN}${BOLD}⚡ ${APP_NAME} is ready.${NC}"
echo ""

draw_box "  " 46 \
  "                                              " \
  " ${BOLD}Next steps${NC}                                   " \
  "                                              " \
  " ${BOLD}1.${NC} Start the dev server:                     " \
  "                                              " \
  "    ${GREEN}pnpm dev${NC}                                  " \
  "                                              " \
  "    Then open ${CYAN}http://localhost:3000${NC}            " \
  "    ${DIM}Login: demo@vibekit.dev (any password)${NC}    " \
  "                                              " \
  " ${BOLD}2.${NC} Open Claude Code to build your app:       " \
  "                                              " \
  "    ${GREEN}claude${NC}                                    " \
  "                                              " \
  "    ${DIM}Claude knows you're building a${NC}             " \
  "    ${BOLD}${CATEGORY_LABEL}${NC} ${DIM}called${NC} ${BOLD}${APP_NAME}${NC}${DIM}.${NC}              " \
  "    ${DIM}Just describe what you want.${NC}               " \
  "                                              "

echo ""
echo ""

#!/bin/bash

# Jorb Core - Quick Start Launcher
# This script starts Jorb Core with one command

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════╗
║      🚀 Jorb Core Launcher 🚀       ║
╚══════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Running setup first...${NC}\n"
    chmod +x setup.sh
    ./setup.sh
    echo ""
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}⚠️  Dependencies not installed. Running setup...${NC}\n"
    chmod +x setup.sh
    ./setup.sh
    echo ""
fi

# Start Docker services if available
if command -v docker &> /dev/null && docker info &> /dev/null; then
    echo -e "${BLUE}🐳 Starting database services...${NC}"
    docker-compose up -d postgres redis chromadb
    echo -e "${GREEN}✅ Services started${NC}\n"
else
    echo -e "${YELLOW}⚠️  Docker not available, skipping service startup${NC}\n"
fi

# Start backend
echo -e "${BLUE}🚀 Starting Jorb Core backend...${NC}\n"
cd packages/backend
npm run start:dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Jorb Core is running!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📍 Access Points:${NC}"
echo -e "   API: ${YELLOW}http://localhost:3000/api/v1${NC}"
echo -e "   Docs: ${YELLOW}http://localhost:3000/api/docs${NC}"
echo ""
echo -e "${BLUE}📖 Quick Commands:${NC}"
echo -e "   Register: ${YELLOW}curl -X POST http://localhost:3000/api/v1/auth/register${NC}"
echo -e "   See docs for more examples"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop${NC}\n"

# Wait for process
wait $BACKEND_PID

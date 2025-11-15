#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ASCII Art Logo
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ██╗ ██████╗ ██████╗ ██████╗      ██████╗ ██████╗ ██████╗███████╗
║   ██║██╔═══██╗██╔══██╗██╔══██╗    ██╔════╝██╔═══██╗██╔══██╗██╔════╝
║   ██║██║   ██║██████╔╝██████╔╝    ██║     ██║   ██║██████╔╝█████╗
║  ██ ║██║   ██║██╔══██╗██╔══██╗    ██║     ██║   ██║██╔══██╗██╔══╝
║  ╚═══╝╚██████╔╝██║  ██║██████╔╝    ╚██████╗╚██████╔╝██║  ██║███████╗
║       ╚═════╝ ╚═╝  ╚═╝╚═════╝      ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
║                                                           ║
║   Agentic Operating System - One-Click Setup             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${GREEN}🚀 Starting Jorb Core installation...${NC}\n"

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo -e "${YELLOW}Please install Node.js 18+ from https://nodejs.org${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher (current: $(node -v))${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v)${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker is not installed (optional but recommended)${NC}"
    echo -e "${YELLOW}   Install from https://docker.com for easy database setup${NC}"
    DOCKER_AVAILABLE=false
else
    echo -e "${GREEN}✅ Docker $(docker -v | cut -d' ' -f3 | cut -d',' -f1)${NC}"
    DOCKER_AVAILABLE=true

    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        echo -e "${YELLOW}⚠️  Docker is installed but not running${NC}"
        echo -e "${YELLOW}   Please start Docker Desktop${NC}"
        DOCKER_AVAILABLE=false
    fi
fi

# Check Docker Compose
if [ "$DOCKER_AVAILABLE" = true ]; then
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo -e "${YELLOW}⚠️  Docker Compose not found${NC}"
        DOCKER_AVAILABLE=false
    else
        echo -e "${GREEN}✅ Docker Compose${NC}"
    fi
fi

echo ""

# Step 1: Install dependencies
echo -e "${BLUE}📦 Step 1/6: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}\n"

# Step 2: Setup environment
echo -e "${BLUE}⚙️  Step 2/6: Setting up environment...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit .env and add your OpenAI API key!${NC}"
    echo ""

    # Prompt for OpenAI API key
    read -p "Enter your OpenAI API key (or press Enter to skip): " OPENAI_KEY
    if [ ! -z "$OPENAI_KEY" ]; then
        # Update .env file with the API key
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$OPENAI_KEY/" .env
        else
            # Linux
            sed -i "s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$OPENAI_KEY/" .env
        fi
        echo -e "${GREEN}✅ OpenAI API key configured${NC}"
    else
        echo -e "${YELLOW}⚠️  You can add it later by editing .env${NC}"
    fi
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi
echo ""

# Step 3: Setup Docker services
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo -e "${BLUE}🐳 Step 3/6: Starting Docker services...${NC}"
    echo "Starting PostgreSQL, Redis, and ChromaDB..."

    docker-compose up -d postgres redis chromadb

    # Wait for services to be ready
    echo "Waiting for services to be ready..."
    sleep 10

    # Check if services are running
    if docker-compose ps | grep -q "postgres.*Up" && \
       docker-compose ps | grep -q "redis.*Up" && \
       docker-compose ps | grep -q "chromadb.*Up"; then
        echo -e "${GREEN}✅ Docker services started${NC}"
    else
        echo -e "${YELLOW}⚠️  Some services may not be running. Check with: docker-compose ps${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Step 3/6: Docker not available - skipping${NC}"
    echo -e "${YELLOW}   You'll need to setup PostgreSQL, Redis, and ChromaDB manually${NC}"
    echo -e "${YELLOW}   Update .env with your database connection strings${NC}"
fi
echo ""

# Step 4: Generate Prisma client
echo -e "${BLUE}🗄️  Step 4/6: Generating database client...${NC}"
cd packages/backend
npm install
npx prisma generate
echo -e "${GREEN}✅ Prisma client generated${NC}"
cd ../..
echo ""

# Step 5: Run database migrations
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo -e "${BLUE}🗄️  Step 5/6: Running database migrations...${NC}"
    cd packages/backend
    npx prisma migrate deploy 2>/dev/null || npx prisma db push
    echo -e "${GREEN}✅ Database initialized${NC}"
    cd ../..
else
    echo -e "${YELLOW}⚠️  Step 5/6: Skipping migrations (no database)${NC}"
fi
echo ""

# Step 6: Build backend
echo -e "${BLUE}🔨 Step 6/6: Building backend...${NC}"
cd packages/backend
npm run build
echo -e "${GREEN}✅ Backend built${NC}"
cd ../..
echo ""

# Final summary
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📚 Quick Start:${NC}"
echo ""
echo -e "  1. Start the backend:"
echo -e "     ${YELLOW}npm run start${NC}"
echo ""
echo -e "  2. Access the API:"
echo -e "     ${YELLOW}http://localhost:3000/api/v1${NC}"
echo ""
echo -e "  3. View API documentation:"
echo -e "     ${YELLOW}http://localhost:3000/api/docs${NC}"
echo ""
echo -e "  4. Start landing page (optional):"
echo -e "     ${YELLOW}npm run start:landing${NC}"
echo ""
echo -e "${BLUE}📖 Documentation:${NC}"
echo -e "   README.md - Quick start and API examples"
echo -e "   PROJECT_SUMMARY.md - Complete overview"
echo -e "   http://localhost:3000/api/docs - Interactive API docs"
echo ""
echo -e "${BLUE}🔧 Useful Commands:${NC}"
echo -e "   ${YELLOW}npm run start${NC}        - Start backend"
echo -e "   ${YELLOW}npm run dev${NC}          - Development mode with auto-reload"
echo -e "   ${YELLOW}npm run docker:up${NC}    - Start all services with Docker"
echo -e "   ${YELLOW}npm run docker:down${NC}  - Stop all Docker services"
echo -e "   ${YELLOW}npm test${NC}             - Run tests"
echo ""
if [ -z "$OPENAI_KEY" ]; then
    echo -e "${YELLOW}⚠️  REMINDER: Add your OpenAI API key to .env before running!${NC}"
    echo ""
fi
echo -e "${GREEN}Happy building! 🚀${NC}"
echo ""

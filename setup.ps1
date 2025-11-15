# Jorb Core - Windows Setup Script
# PowerShell version

$ErrorActionPreference = "Stop"

# Colors
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# ASCII Art Logo
Write-ColorOutput Blue @"
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
"@

Write-ColorOutput Green "`n🚀 Starting Jorb Core installation...`n"

# Check prerequisites
Write-ColorOutput Blue "📋 Checking prerequisites..."

# Check Node.js
try {
    $nodeVersion = node -v
    $nodeVersionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($nodeVersionNumber -lt 18) {
        Write-ColorOutput Red "❌ Node.js version must be 18 or higher (current: $nodeVersion)"
        exit 1
    }
    Write-ColorOutput Green "✅ Node.js $nodeVersion"
} catch {
    Write-ColorOutput Red "❌ Node.js is not installed"
    Write-ColorOutput Yellow "Please install Node.js 18+ from https://nodejs.org"
    exit 1
}

# Check npm
try {
    $npmVersion = npm -v
    Write-ColorOutput Green "✅ npm $npmVersion"
} catch {
    Write-ColorOutput Red "❌ npm is not installed"
    exit 1
}

# Check Docker
$dockerAvailable = $false
try {
    $dockerVersion = docker -v
    Write-ColorOutput Green "✅ Docker installed"

    # Check if Docker is running
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $dockerAvailable = $true
        Write-ColorOutput Green "✅ Docker is running"
    } else {
        Write-ColorOutput Yellow "⚠️  Docker is installed but not running"
        Write-ColorOutput Yellow "   Please start Docker Desktop"
    }
} catch {
    Write-ColorOutput Yellow "⚠️  Docker is not installed (optional but recommended)"
    Write-ColorOutput Yellow "   Install from https://docker.com for easy database setup"
}

Write-Output ""

# Step 1: Install dependencies
Write-ColorOutput Blue "📦 Step 1/6: Installing dependencies..."
npm install
Write-ColorOutput Green "✅ Dependencies installed`n"

# Step 2: Setup environment
Write-ColorOutput Blue "⚙️  Step 2/6: Setting up environment..."
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-ColorOutput Green "✅ Created .env file"
    Write-ColorOutput Yellow "⚠️  IMPORTANT: Edit .env and add your OpenAI API key!"
    Write-Output ""

    # Prompt for OpenAI API key
    $openaiKey = Read-Host "Enter your OpenAI API key (or press Enter to skip)"
    if ($openaiKey) {
        (Get-Content .env) -replace 'OPENAI_API_KEY=.*', "OPENAI_API_KEY=$openaiKey" | Set-Content .env
        Write-ColorOutput Green "✅ OpenAI API key configured"
    } else {
        Write-ColorOutput Yellow "⚠️  You can add it later by editing .env"
    }
} else {
    Write-ColorOutput Green "✅ .env file already exists"
}
Write-Output ""

# Step 3: Setup Docker services
if ($dockerAvailable) {
    Write-ColorOutput Blue "🐳 Step 3/6: Starting Docker services..."
    Write-Output "Starting PostgreSQL, Redis, and ChromaDB..."

    docker-compose up -d postgres redis chromadb

    # Wait for services to be ready
    Write-Output "Waiting for services to be ready..."
    Start-Sleep -Seconds 10

    Write-ColorOutput Green "✅ Docker services started"
} else {
    Write-ColorOutput Yellow "⚠️  Step 3/6: Docker not available - skipping"
    Write-ColorOutput Yellow "   You'll need to setup PostgreSQL, Redis, and ChromaDB manually"
    Write-ColorOutput Yellow "   Update .env with your database connection strings"
}
Write-Output ""

# Step 4: Generate Prisma client
Write-ColorOutput Blue "🗄️  Step 4/6: Generating database client..."
Set-Location packages/backend
npm install
npx prisma generate
Write-ColorOutput Green "✅ Prisma client generated"
Set-Location ../..
Write-Output ""

# Step 5: Run database migrations
if ($dockerAvailable) {
    Write-ColorOutput Blue "🗄️  Step 5/6: Running database migrations..."
    Set-Location packages/backend
    try {
        npx prisma migrate deploy 2>$null
    } catch {
        npx prisma db push
    }
    Write-ColorOutput Green "✅ Database initialized"
    Set-Location ../..
} else {
    Write-ColorOutput Yellow "⚠️  Step 5/6: Skipping migrations (no database)"
}
Write-Output ""

# Step 6: Build backend
Write-ColorOutput Blue "🔨 Step 6/6: Building backend..."
Set-Location packages/backend
npm run build
Write-ColorOutput Green "✅ Backend built"
Set-Location ../..
Write-Output ""

# Final summary
Write-ColorOutput Green "═══════════════════════════════════════"
Write-ColorOutput Green "✅ Installation Complete!"
Write-ColorOutput Green "═══════════════════════════════════════"
Write-Output ""
Write-ColorOutput Blue "📚 Quick Start:"
Write-Output ""
Write-Output "  1. Start the backend:"
Write-ColorOutput Yellow "     npm run start"
Write-Output ""
Write-Output "  2. Access the API:"
Write-ColorOutput Yellow "     http://localhost:3000/api/v1"
Write-Output ""
Write-Output "  3. View API documentation:"
Write-ColorOutput Yellow "     http://localhost:3000/api/docs"
Write-Output ""
Write-Output "  4. Start landing page (optional):"
Write-ColorOutput Yellow "     npm run start:landing"
Write-Output ""
Write-ColorOutput Blue "📖 Documentation:"
Write-Output "   README.md - Quick start and API examples"
Write-Output "   PROJECT_SUMMARY.md - Complete overview"
Write-Output "   http://localhost:3000/api/docs - Interactive API docs"
Write-Output ""
Write-ColorOutput Blue "🔧 Useful Commands:"
Write-ColorOutput Yellow "   npm run start        " -NoNewline; Write-Output "- Start backend"
Write-ColorOutput Yellow "   npm run dev          " -NoNewline; Write-Output "- Development mode with auto-reload"
Write-ColorOutput Yellow "   npm run docker:up    " -NoNewline; Write-Output "- Start all services with Docker"
Write-ColorOutput Yellow "   npm run docker:down  " -NoNewline; Write-Output "- Stop all Docker services"
Write-ColorOutput Yellow "   npm test             " -NoNewline; Write-Output "- Run tests"
Write-Output ""
if (-not $openaiKey) {
    Write-ColorOutput Yellow "⚠️  REMINDER: Add your OpenAI API key to .env before running!"
    Write-Output ""
}
Write-ColorOutput Green "Happy building! 🚀"
Write-Output ""

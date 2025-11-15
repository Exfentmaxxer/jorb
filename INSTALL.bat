@echo off
SETLOCAL EnableDelayedExpansion

REM Jorb Core - Windows Installation Script
REM Double-click this file to install Jorb Core

color 0A
title Jorb Core - Installation

echo.
echo ====================================================================
echo.
echo       ██╗ ██████╗ ██████╗ ██████╗      ██████╗ ██████╗ ██████╗███████╗
echo       ██║██╔═══██╗██╔══██╗██╔══██╗    ██╔════╝██╔═══██╗██╔══██╗██╔════╝
echo       ██║██║   ██║██████╔╝██████╔╝    ██║     ██║   ██║██████╔╝█████╗
echo      ██ ║██║   ██║██╔══██╗██╔══██╗    ██║     ██║   ██║██╔══██╗██╔══╝
echo      ╚═══╝╚██████╔╝██║  ██║██████╔╝    ╚██████╗╚██████╔╝██║  ██║███████╗
echo           ╚═════╝ ╚═╝  ╚═╝╚═════╝      ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
echo.
echo    INSTALLATION WIZARD - One-Click Setup for Windows
echo.
echo ====================================================================
echo.

echo [INFO] Starting Jorb Core installation...
echo.

REM Check for Node.js
echo [STEP 1/7] Checking prerequisites...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js 18 or higher from:
    echo https://nodejs.org
    echo.
    echo After installation, run this script again.
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% found
echo.

REM Check npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)
echo [OK] npm found
echo.

REM Check Docker (optional)
set DOCKER_AVAILABLE=0
where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    docker info >nul 2>nul
    if !ERRORLEVEL! EQU 0 (
        set DOCKER_AVAILABLE=1
        echo [OK] Docker is installed and running
    ) else (
        echo [WARNING] Docker is installed but not running
        echo Please start Docker Desktop for automatic database setup
    )
) else (
    echo [WARNING] Docker not found - you'll need to setup databases manually
)
echo.

REM Install dependencies
echo [STEP 2/7] Installing dependencies...
echo This may take a few minutes...
echo.
call npm install
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo.
echo [OK] Dependencies installed
echo.

REM Setup environment
echo [STEP 3/7] Configuring environment...
if not exist .env (
    copy .env.example .env >nul
    echo [OK] Created .env file
    echo.
    echo IMPORTANT: You need to add your OpenAI API key!
    echo.
    set /p OPENAI_KEY="Enter your OpenAI API key (or press Enter to skip): "
    if not "!OPENAI_KEY!"=="" (
        powershell -Command "(Get-Content .env) -replace 'OPENAI_API_KEY=.*', 'OPENAI_API_KEY=!OPENAI_KEY!' | Set-Content .env"
        echo [OK] OpenAI API key configured
    ) else (
        echo [WARNING] You can add it later by editing .env file
    )
) else (
    echo [OK] .env file already exists
)
echo.

REM Start Docker services
if %DOCKER_AVAILABLE% EQU 1 (
    echo [STEP 4/7] Starting database services...
    echo Starting PostgreSQL, Redis, and ChromaDB...
    docker-compose up -d postgres redis chromadb
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Failed to start some services
    ) else (
        echo Waiting for services to be ready...
        timeout /t 10 /nobreak >nul
        echo [OK] Services started
    )
) else (
    echo [STEP 4/7] Skipping Docker services (not available)
    echo You'll need to setup PostgreSQL, Redis, and ChromaDB manually
    echo Update .env with your database connection strings
)
echo.

REM Generate Prisma client
echo [STEP 5/7] Generating database client...
cd packages\backend
call npm install
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Failed to generate Prisma client
    cd ..\..
    pause
    exit /b 1
)
cd ..\..
echo [OK] Database client generated
echo.

REM Run migrations
if %DOCKER_AVAILABLE% EQU 1 (
    echo [STEP 6/7] Setting up database...
    cd packages\backend
    call npx prisma db push 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Database setup had issues, but continuing...
    ) else (
        echo [OK] Database initialized
    )
    cd ..\..
) else (
    echo [STEP 6/7] Skipping database setup (no Docker)
)
echo.

REM Build backend
echo [STEP 7/7] Building backend...
cd packages\backend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Failed to build backend
    cd ..\..
    pause
    exit /b 1
)
cd ..\..
echo [OK] Backend built successfully
echo.

REM Installation complete
color 0A
echo ====================================================================
echo.
echo     INSTALLATION COMPLETE!
echo.
echo ====================================================================
echo.
echo Your Jorb Core installation is ready!
echo.
echo NEXT STEPS:
echo.
echo 1. Double-click "LAUNCH.bat" to start Jorb Core
echo    OR run: npm start
echo.
echo 2. Access the API at:
echo    http://localhost:3000/api/v1
echo.
echo 3. View interactive documentation:
echo    http://localhost:3000/api/docs
echo.
if "!OPENAI_KEY!"=="" (
    echo REMINDER: Don't forget to add your OpenAI API key to .env file!
    echo.
)
echo For help, see QUICKSTART.md or INSTALLATION_COMPLETE.md
echo.
echo ====================================================================
echo.
echo Press any key to exit...
pause >nul

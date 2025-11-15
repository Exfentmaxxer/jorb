@echo off
SETLOCAL EnableDelayedExpansion

REM Jorb Core - Complete Automated Windows Installation Script
REM Double-click this file to fully install and setup Jorb Core

color 0A
title Jorb Core - Complete Installation

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
echo    COMPLETE AUTOMATED INSTALLATION - Windows 10/11
echo.
echo ====================================================================
echo.

echo [INFO] Starting complete Jorb Core installation...
echo [INFO] This will take approximately 5-10 minutes
echo.

REM ============================================================================
REM STEP 1: PREREQUISITES CHECK
REM ============================================================================
echo [STEP 1/10] Checking prerequisites...
echo.

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Node.js is not installed!
    echo.
    echo REQUIRED: Node.js 18 or higher
    echo Download from: https://nodejs.org
    echo.
    echo Please install Node.js and run this script again.
    echo.
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% detected
echo.

REM Check npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] npm is not installed!
    echo npm should come with Node.js
    pause
    exit /b 1
)

for /f "tokens=1" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm %NPM_VERSION% detected
echo.

REM Check Docker (optional but recommended)
set DOCKER_AVAILABLE=0
where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    docker info >nul 2>nul
    if !ERRORLEVEL! EQU 0 (
        set DOCKER_AVAILABLE=1
        echo [OK] Docker Desktop is installed and running
        for /f "tokens=3" %%i in ('docker --version') do echo [OK] Docker version %%i
    ) else (
        echo [WARNING] Docker is installed but not running
        echo [INFO] Please start Docker Desktop for automatic database setup
        echo [INFO] Installation will continue, but databases won't start automatically
    )
) else (
    echo [WARNING] Docker Desktop not found
    echo [INFO] Docker is recommended but not required
    echo [INFO] You can setup databases manually later
)
echo.

REM ============================================================================
REM STEP 2: INSTALL ROOT DEPENDENCIES
REM ============================================================================
echo [STEP 2/10] Installing root project dependencies...
echo [INFO] This may take 2-3 minutes on first install...
echo.

call npm install --loglevel=error
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Failed to install root dependencies
    echo.
    pause
    exit /b 1
)
echo.
echo [OK] Root dependencies installed successfully
echo.

REM ============================================================================
REM STEP 3: INSTALL BACKEND DEPENDENCIES
REM ============================================================================
echo [STEP 3/10] Installing backend dependencies...
echo [INFO] Installing NestJS and all backend packages...
echo.

cd packages\backend
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Backend directory not found!
    cd ..\..
    pause
    exit /b 1
)

call npm install --loglevel=error
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Failed to install backend dependencies
    cd ..\..
    pause
    exit /b 1
)
cd ..\..

echo [OK] Backend dependencies installed successfully
echo.

REM ============================================================================
REM STEP 4: INSTALL LANDING PAGE DEPENDENCIES
REM ============================================================================
echo [STEP 4/10] Installing landing page dependencies...
echo [INFO] Installing Next.js and frontend packages...
echo.

cd apps\landing
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Landing page directory not found, skipping...
    cd ..\..
) else (
    call npm install --loglevel=error
    if !ERRORLEVEL! NEQ 0 (
        echo [WARNING] Failed to install landing page dependencies
        echo [INFO] Continuing with backend installation...
    ) else (
        echo [OK] Landing page dependencies installed successfully
    )
    cd ..\..
)
echo.

REM ============================================================================
REM STEP 5: ENVIRONMENT CONFIGURATION
REM ============================================================================
echo [STEP 5/10] Configuring environment...
echo.

REM Navigate to backend directory
cd packages\backend
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Cannot navigate to backend directory
    pause
    exit /b 1
)

if not exist .env (
    echo [INFO] Creating backend environment configuration...

    REM Check if .env.example exists
    if not exist .env.example (
        color 0C
        echo [ERROR] .env.example file not found in packages\backend
        echo [INFO] Please ensure .env.example exists in packages\backend directory
        cd ..\..
        pause
        exit /b 1
    )

    REM Copy .env.example to .env
    copy .env.example .env >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        color 0C
        echo [ERROR] Failed to create .env file
        cd ..\..
        pause
        exit /b 1
    )
    echo [OK] Created .env configuration file
    echo.

    echo ====================================================================
    echo IMPORTANT: OpenAI API Key Configuration
    echo ====================================================================
    echo.
    echo Jorb Core uses OpenAI for intelligent agent reasoning.
    echo You need an API key from: https://platform.openai.com/api-keys
    echo.
    echo You can either:
    echo   1. Enter it now (recommended)
    echo   2. Press Enter to skip and add it manually later
    echo.
    set /p OPENAI_KEY="Enter your OpenAI API key (or press Enter to skip): "

    if not "!OPENAI_KEY!"=="" (
        echo.
        echo [INFO] Configuring OpenAI API key...
        powershell -Command "(Get-Content .env) -replace 'OPENAI_API_KEY=.*', 'OPENAI_API_KEY=!OPENAI_KEY!' | Set-Content .env" 2>nul
        if !ERRORLEVEL! EQU 0 (
            echo [OK] OpenAI API key configured successfully
        ) else (
            echo [WARNING] Failed to auto-configure API key
            echo [INFO] Please manually edit packages\backend\.env and set your API key
        )
        echo.
    ) else (
        echo.
        echo [WARNING] Skipped API key configuration
        echo [INFO] To add it later, edit: packages\backend\.env
        echo [INFO] Set: OPENAI_API_KEY=sk-your-key-here
        echo.
    )

    REM Generate random JWT secret
    echo [INFO] Generating secure JWT secret...
    for /f %%i in ('powershell -Command "[guid]::NewGuid().ToString() + [guid]::NewGuid().ToString()"') do set JWT_SECRET=%%i
    if "!JWT_SECRET!"=="" (
        echo [WARNING] Failed to generate JWT secret, using default
        set JWT_SECRET=default-jwt-secret-please-change-in-production
    )

    powershell -Command "(Get-Content .env) -replace 'JWT_SECRET=.*', 'JWT_SECRET=!JWT_SECRET!' | Set-Content .env" 2>nul
    if !ERRORLEVEL! EQU 0 (
        echo [OK] JWT secret configured
    ) else (
        echo [WARNING] Failed to auto-configure JWT secret
        echo [INFO] Please manually edit packages\backend\.env
    )
    echo.
) else (
    echo [OK] .env file already exists in packages\backend
    echo [INFO] Using existing configuration
    echo.
)

REM Return to root directory
cd ..\..
echo [OK] Environment configuration complete
echo.

REM ============================================================================
REM STEP 6: START DOCKER SERVICES
REM ============================================================================
if !DOCKER_AVAILABLE! EQU 1 (
    echo [STEP 6/10] Starting database services with Docker...
    echo [INFO] Starting PostgreSQL, Redis, and ChromaDB...
    echo.

    REM Stop any existing containers first
    docker-compose down >nul 2>nul

    REM Start the services
    docker-compose up -d postgres redis chromadb
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Some services may have failed to start
        echo [INFO] Continuing with installation...
    ) else (
        echo [OK] Docker services started
        echo.
        echo [INFO] Waiting for services to be ready...
        echo [INFO] PostgreSQL initialization (30 seconds)...

        REM Wait for PostgreSQL to be ready
        timeout /t 30 /nobreak >nul

        REM Check if services are running
        docker-compose ps | findstr "Up" >nul
        if !ERRORLEVEL! EQU 0 (
            echo [OK] Database services are running
        ) else (
            echo [WARNING] Some services may not be ready yet
            echo [INFO] They may need more time to start
        )
    )
) else (
    echo [STEP 6/10] Skipping Docker services (not available)
    echo [WARNING] You'll need to setup these services manually:
    echo   - PostgreSQL 16 (default port 5432)
    echo   - Redis 7 (default port 6379)
    echo   - ChromaDB (default port 8000)
    echo.
    echo [INFO] Update .env file with your database connection strings
)
echo.

REM ============================================================================
REM STEP 7: GENERATE PRISMA CLIENT
REM ============================================================================
echo [STEP 7/10] Generating database client (Prisma)...
echo [INFO] This creates type-safe database access layer...
echo.

cd packages\backend
call npx prisma generate --schema=./prisma/schema.prisma
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Failed to generate Prisma client
    cd ..\..
    pause
    exit /b 1
)
cd ..\..

echo [OK] Prisma client generated successfully
echo.

REM ============================================================================
REM STEP 8: INITIALIZE DATABASE
REM ============================================================================
if !DOCKER_AVAILABLE! EQU 1 (
    echo [STEP 8/10] Initializing database schema...
    echo [INFO] Creating tables and applying migrations...
    echo.

    cd packages\backend

    REM Try migrations first, fallback to db push
    call npx prisma migrate deploy 2>nul
    if !ERRORLEVEL! NEQ 0 (
        echo [INFO] Deploying schema with db push...
        call npx prisma db push --skip-generate
        if !ERRORLEVEL! NEQ 0 (
            echo [WARNING] Database initialization had issues
            echo [INFO] You may need to run migrations manually later
        ) else (
            echo [OK] Database schema initialized successfully
        )
    ) else (
        echo [OK] Database migrations applied successfully
    )

    cd ..\..
) else (
    echo [STEP 8/10] Skipping database initialization (no database available)
    echo [INFO] Run migrations manually when database is ready:
    echo   npm run migrate
)
echo.

REM ============================================================================
REM STEP 9: BUILD BACKEND
REM ============================================================================
echo [STEP 9/10] Building backend application...
echo [INFO] Compiling TypeScript to JavaScript...
echo [INFO] This may take 1-2 minutes...
echo.

cd packages\backend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Failed to build backend
    echo.
    echo Common causes:
    echo - TypeScript compilation errors
    echo - Missing dependencies
    echo - Syntax errors in code
    echo.
    cd ..\..
    pause
    exit /b 1
)
cd ..\..

echo [OK] Backend built successfully
echo.

REM ============================================================================
REM STEP 10: VERIFY INSTALLATION
REM ============================================================================
echo [STEP 10/10] Verifying installation...
echo.

REM Check critical files exist
set INSTALL_OK=1

if not exist "node_modules" (
    echo [ERROR] Root node_modules not found
    set INSTALL_OK=0
)

if not exist "packages\backend\node_modules" (
    echo [ERROR] Backend node_modules not found
    set INSTALL_OK=0
)

if not exist "packages\backend\dist" (
    echo [ERROR] Backend build output not found
    set INSTALL_OK=0
)

if not exist ".env" (
    echo [ERROR] Environment file not found
    set INSTALL_OK=0
)

if !INSTALL_OK! EQU 0 (
    color 0C
    echo.
    echo [ERROR] Installation verification failed
    echo Some critical files are missing
    echo.
    pause
    exit /b 1
)

echo [OK] All critical files present
echo [OK] Installation verification passed
echo.

REM ============================================================================
REM INSTALLATION COMPLETE
REM ============================================================================
color 0A
cls
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
echo ====================================================================
echo.
echo     ✓ INSTALLATION COMPLETE!
echo.
echo ====================================================================
echo.
echo Your Jorb Core installation is ready to use!
echo.
echo WHAT'S INSTALLED:
echo   ✓ Backend API (NestJS + TypeScript)
echo   ✓ Database layer (Prisma + PostgreSQL)
echo   ✓ Memory system (ChromaDB)
echo   ✓ Reasoning engine
echo   ✓ Tool/plugin system
if !DOCKER_AVAILABLE! EQU 1 (
    echo   ✓ Database services (PostgreSQL, Redis, ChromaDB)
)
echo.
echo NEXT STEPS:
echo.
echo 1. Launch Jorb Core:
echo    ^> Double-click "LAUNCH.bat"
echo    OR run: npm start
echo.
echo 2. Access the API:
echo    ^> API Docs: http://localhost:3000/api/docs
echo    ^> API Endpoint: http://localhost:3000/api/v1
echo.
echo 3. Optional - Start landing page:
echo    ^> Run: npm run start:landing
echo    ^> Access: http://localhost:3001
echo.
if "!OPENAI_KEY!"=="" (
    echo ⚠ IMPORTANT: Add your OpenAI API key to the .env file
    echo   Edit .env and set: OPENAI_API_KEY=sk-your-key-here
    echo.
)
if !DOCKER_AVAILABLE! EQU 0 (
    echo ⚠ REMINDER: Setup these databases manually:
    echo   - PostgreSQL, Redis, ChromaDB
    echo   - Update .env with connection strings
    echo.
)
echo HELPFUL COMMANDS:
echo   npm start              - Start production server
echo   npm run dev            - Development mode (auto-reload)
echo   npm run prisma:studio  - Database browser GUI
echo   npm run docker:logs    - View Docker logs
echo.
echo DOCUMENTATION:
echo   README.md              - Complete documentation
echo   QUICKSTART.md          - Quick start guide
echo   WINDOWS_QUICK_START.md - Windows-specific guide
echo.
echo ====================================================================
echo.
echo Installation took place on: %DATE% at %TIME%
echo.
echo Press any key to exit...
pause >nul

REM Create a completion marker file
echo Installation completed on %DATE% at %TIME% > .install-complete

exit /b 0

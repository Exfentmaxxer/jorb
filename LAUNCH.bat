@echo off
SETLOCAL EnableDelayedExpansion

REM Jorb Core - Windows Launch Script
REM Double-click this file to start Jorb Core

color 0B
title Jorb Core - Launcher

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
echo    LAUNCHER - Starting Jorb Core Agentic OS
echo.
echo ====================================================================
echo.

REM Check if installed
if not exist node_modules (
    color 0E
    echo [WARNING] Jorb Core is not installed!
    echo.
    echo Please run INSTALL.bat first to install Jorb Core.
    echo.
    pause
    exit /b 1
)

if not exist .env (
    color 0E
    echo [WARNING] .env file not found!
    echo.
    echo Please run INSTALL.bat first to setup Jorb Core.
    echo.
    pause
    exit /b 1
)

REM Check Docker availability
set DOCKER_AVAILABLE=0
where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    docker info >nul 2>nul
    if !ERRORLEVEL! EQU 0 (
        set DOCKER_AVAILABLE=1
    )
)

REM Start Docker services if available
if %DOCKER_AVAILABLE% EQU 1 (
    echo [INFO] Starting database services...
    docker-compose up -d postgres redis chromadb 2>nul
    if !ERRORLEVEL! EQU 0 (
        echo [OK] Database services started
    ) else (
        echo [WARNING] Some services may already be running
    )
    echo.
) else (
    echo [WARNING] Docker not available - ensure databases are running
    echo.
)

REM Check if backend is built
if not exist packages\backend\dist (
    echo [INFO] Backend not built. Building now...
    cd packages\backend
    call npm run build
    cd ..\..
    echo.
)

echo ====================================================================
echo.
echo     JORB CORE IS STARTING...
echo.
echo ====================================================================
echo.
echo Access Points:
echo   - API: http://localhost:3000/api/v1
echo   - Interactive Docs: http://localhost:3000/api/docs
echo.
echo The API documentation will open in your browser automatically.
echo.
echo Keep this window open to see logs.
echo Press Ctrl+C to stop Jorb Core.
echo.
echo ====================================================================
echo.

REM Wait a moment then open browser
start /B cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000/api/docs"

REM Start the backend (this will keep the window open)
cd packages\backend
call npm run start:dev

REM If we get here, the server stopped
echo.
echo [INFO] Jorb Core has stopped.
echo.
pause

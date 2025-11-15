# 🪟 Jorb Core - Windows Installation Guide

## 📦 One-Click Installation for Windows

This guide will help you install and run Jorb Core on Windows 10/11 with just a few clicks!

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install

1. **Navigate to the Jorb Core folder** (where you extracted/cloned the files)
2. **Double-click `INSTALL.bat`**
3. Follow the prompts and wait for installation to complete (~5 minutes)

![Installation](https://img.shields.io/badge/Click-INSTALL.bat-success)

### Step 2: Launch

1. **Double-click `LAUNCH.bat`**
2. Wait for services to start
3. Browser will automatically open to http://localhost:3000/api/docs

![Launch](https://img.shields.io/badge/Click-LAUNCH.bat-blue)

### Step 3: Test

Your browser should open automatically. If not, visit:
- **API Docs:** http://localhost:3000/api/docs
- **API Endpoint:** http://localhost:3000/api/v1

**That's it! You're ready to build intelligent agents! 🎉**

---

## 📋 What Each File Does

### INSTALL.bat
**Purpose:** Complete installation and setup

**What it does:**
- ✅ Checks for Node.js (required)
- ✅ Checks for Docker (optional but recommended)
- ✅ Installs all dependencies
- ✅ Sets up configuration files
- ✅ Prompts for your OpenAI API key
- ✅ Starts database services (PostgreSQL, Redis, ChromaDB)
- ✅ Initializes the database
- ✅ Builds the backend

**When to run:** Once, for initial setup

### LAUNCH.bat
**Purpose:** Start Jorb Core

**What it does:**
- ✅ Checks if installation is complete
- ✅ Starts database services
- ✅ Launches the backend server
- ✅ Opens your browser to the API docs
- ✅ Shows live logs

**When to run:** Every time you want to start Jorb Core

---

## 🖱️ Creating Desktop Shortcuts

To access Jorb Core from your desktop:

### Method 1: Drag and Drop (Easiest)

1. **Right-click** on `INSTALL.bat` or `LAUNCH.bat`
2. Select **"Send to" → "Desktop (create shortcut)"**
3. The shortcut will appear on your desktop
4. You can rename it (e.g., "Install Jorb Core" or "Launch Jorb Core")

### Method 2: Manual Shortcut Creation

1. **Right-click** on your desktop
2. Select **"New" → "Shortcut"**
3. Click **"Browse"** and navigate to the Jorb Core folder
4. Select `LAUNCH.bat`
5. Click **"Next"**
6. Name it "Jorb Core" or "Launch Jorb Core"
7. Click **"Finish"**

**Optional:** Right-click the shortcut → Properties → Change Icon to customize

---

## 📝 Prerequisites

### Required

✅ **Windows 10 or 11**
✅ **Node.js 18 or higher** - [Download here](https://nodejs.org)
   - Choose the LTS (Long Term Support) version
   - During installation, check "Automatically install necessary tools"

### Recommended

✅ **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop)
   - Makes database setup automatic
   - If you don't have Docker, you'll need to install PostgreSQL, Redis, and ChromaDB manually

### Optional

✅ **Git** - [Download here](https://git-scm.com/download/win)
   - Only needed if you want to clone from GitHub
   - You can also download as ZIP

---

## 🔧 First-Time Setup

### 1. Install Prerequisites

If you haven't already:

1. **Download and install Node.js** from https://nodejs.org
   - Choose the LTS version (20.x or higher)
   - Restart your computer after installation

2. **Download and install Docker Desktop** (recommended)
   - From https://www.docker.com/products/docker-desktop
   - Start Docker Desktop after installation

### 2. Get Your OpenAI API Key

You'll need an OpenAI API key to use the AI features:

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Keep it handy - you'll enter it during installation

### 3. Run Installation

1. **Double-click `INSTALL.bat`**
2. When prompted, paste your OpenAI API key
3. Wait for installation to complete (~5 minutes)
4. You'll see "INSTALLATION COMPLETE!" when done

---

## 🎯 Daily Usage

After initial installation, using Jorb Core is simple:

### Starting Jorb Core

1. **Double-click `LAUNCH.bat`**
2. Wait ~10 seconds for startup
3. Browser opens automatically to the API docs
4. Start building!

### Stopping Jorb Core

In the command window that's running:
- Press **`Ctrl + C`**
- Type **`Y`** when asked to terminate
- Close the window

Or just close the command window.

---

## 💻 Using the API

Once Jorb Core is running, you can interact with it:

### Via Browser (Interactive Docs)

1. Open http://localhost:3000/api/docs
2. Click "Authorize" and enter your credentials
3. Try API calls directly in your browser

### Via Command Line (curl)

Open PowerShell or Command Prompt:

```powershell
# Register a user
curl -X POST http://localhost:3000/api/v1/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"test123\",\"name\":\"Test User\"}"

# Login
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"test123\"}"

# Create a task (replace YOUR_TOKEN with the token from login)
curl -X POST http://localhost:3000/api/v1/tasks -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d "{\"title\":\"Calculate 2+2\",\"priority\":5}"
```

### Via Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Import the API at http://localhost:3000/api/docs
3. Start making requests

---

## 🐛 Troubleshooting

### "Node.js is not installed"

**Solution:**
1. Download Node.js from https://nodejs.org
2. Install it (choose LTS version)
3. Restart your computer
4. Run `INSTALL.bat` again

### "Docker is not running"

**Solutions:**

**Option A (Recommended):** Install Docker
1. Download Docker Desktop from https://docker.com
2. Install and start it
3. Look for the Docker icon in your system tray
4. Run `INSTALL.bat` again

**Option B:** Use without Docker
1. Install PostgreSQL, Redis, and ChromaDB manually
2. Edit `.env` file with your database connection strings
3. Run `INSTALL.bat` (it will skip Docker steps)

### "OpenAI API key not found"

**Solution:**
1. Open the `.env` file in Notepad
2. Find the line `OPENAI_API_KEY=`
3. Add your key: `OPENAI_API_KEY=sk-your-key-here`
4. Save the file

### "Port 3000 already in use"

**Solution:**
1. Open `.env` in Notepad
2. Change `PORT=3000` to `PORT=3001`
3. Save and restart Jorb Core
4. Access at http://localhost:3001 instead

### "npm: command not found"

**Solution:**
1. Close all command windows
2. Restart your computer
3. Open a new command window
4. Type `npm -v` to verify it works
5. Run `INSTALL.bat` again

### Fresh Start

If something went wrong, start over:

1. Delete the `node_modules` folder
2. Delete the `.env` file
3. Run `INSTALL.bat` again

---

## 📚 Additional Resources

- **QUICKSTART.md** - Quick start guide with examples
- **README.md** - Full documentation
- **PROJECT_SUMMARY.md** - Architecture overview
- **INSTALLATION_COMPLETE.md** - Detailed installation guide

---

## 🎓 Next Steps

After installation and launch:

1. **Explore the API** - http://localhost:3000/api/docs
2. **Create your first agent** - See QUICKSTART.md
3. **Read the documentation** - See README.md
4. **Try the built-in tools** - Calculator, scheduler, email drafter, etc.
5. **Build custom tools** - Extend with your own functionality

---

## 🆘 Getting Help

- **Documentation:** See `.md` files in this folder
- **API Docs:** http://localhost:3000/api/docs (when running)
- **Issues:** Check if Docker/Node.js are running
- **Community:** See README.md for community links

---

## ⚙️ Advanced Options

### Running from Command Line

If you prefer using the command line:

```cmd
REM Install
npm run setup:windows

REM Start
npm start

REM Development mode (auto-reload)
npm run dev

REM Stop
Ctrl+C
```

### Viewing Logs

To see what's happening:
- Logs appear in the `LAUNCH.bat` window
- Backend logs: `packages/backend/logs/`
- Docker logs: `docker-compose logs -f`

### Database Management

View and edit your database:

```cmd
npm run prisma:studio
```

Opens a visual database browser at http://localhost:5555

---

## ✅ Installation Checklist

Before running `LAUNCH.bat`, make sure:

- ✅ Node.js is installed (check: `node -v` in cmd)
- ✅ Docker Desktop is installed and running (optional)
- ✅ You've run `INSTALL.bat` once
- ✅ You have your OpenAI API key in `.env`
- ✅ No errors appeared during installation

---

## 🎊 You're Ready!

Once you see "INSTALLATION COMPLETE!", you can:

1. **Double-click `LAUNCH.bat`** to start Jorb Core
2. **Visit** http://localhost:3000/api/docs
3. **Start building** intelligent agents!

**Happy building! 🚀**

---

*Last updated: 2025-01-15*
*Version: 1.0.0*
*Windows 10/11 Compatible*

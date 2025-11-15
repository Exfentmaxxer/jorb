# 🪟 Jorb Core - Windows Quick Start

## ✅ Your Double-Click Installation is Ready!

Everything is set up for **Windows 10/11** with simple double-click installation and launch.

---

## 🖱️ Installation in 3 Mouse Clicks

### Click 1: Create Desktop Shortcuts (Optional)

**File:** `CREATE_SHORTCUTS.vbs`

**What it does:**
- Creates 2 shortcuts on your desktop
- "Install Jorb Core" - for installation
- "Launch Jorb Core" - to start the app

**Action:** Just double-click it!

---

### Click 2: Install Jorb Core (One Time)

**File:** `INSTALL.bat`

**What it does:**
- ✅ Checks Node.js and Docker
- ✅ Installs all dependencies
- ✅ Sets up configuration
- ✅ Asks for your OpenAI API key
- ✅ Starts database services
- ✅ Builds the backend

**Time:** ~5 minutes

**Action:** Double-click and follow prompts

---

### Click 3: Launch Jorb Core (Every Time)

**File:** `LAUNCH.bat`

**What it does:**
- ✅ Starts database services
- ✅ Launches backend server
- ✅ Opens browser to API docs
- ✅ Shows live logs

**Action:** Double-click to start!

---

## 📦 Before You Start

Make sure you have:

### ✅ Required

**Node.js 18+**
- Download: https://nodejs.org
- Choose "LTS" version
- Restart computer after install

### ✅ Recommended

**Docker Desktop**
- Download: https://docker.com/products/docker-desktop
- Makes database setup automatic
- Start Docker Desktop before running INSTALL.bat

### ✅ For AI Features

**OpenAI API Key**
- Get from: https://platform.openai.com/api-keys
- You'll enter it during installation
- Or add to `.env` file later

---

## 🎯 Step-by-Step Guide

### First Time Setup

1. **Install Node.js**
   - Go to https://nodejs.org
   - Download LTS version
   - Run installer (check all default options)
   - Restart your computer

2. **Install Docker** (recommended)
   - Go to https://docker.com/products/docker-desktop
   - Download Docker Desktop for Windows
   - Run installer
   - Start Docker Desktop (whale icon in system tray)

3. **Get OpenAI API Key**
   - Go to https://platform.openai.com/api-keys
   - Create account or log in
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

4. **Run Installation**
   - Open the Jorb Core folder
   - Double-click `INSTALL.bat`
   - When prompted, paste your OpenAI API key
   - Wait ~5 minutes
   - You'll see "INSTALLATION COMPLETE!"

5. **Launch Jorb Core**
   - Double-click `LAUNCH.bat`
   - Wait ~10 seconds
   - Browser opens to http://localhost:3000/api/docs
   - You're ready to build!

---

## 🎬 Visual Guide

```
┌─────────────────────────────────────────┐
│  Your Jorb Core Folder                  │
├─────────────────────────────────────────┤
│                                         │
│  📄 WINDOWS_README.txt    ← Read first! │
│  📄 CREATE_SHORTCUTS.vbs  ← Click 1st   │
│  📄 INSTALL.bat           ← Click 2nd   │
│  📄 LAUNCH.bat            ← Click 3rd   │
│                                         │
│  📁 packages/                           │
│  📁 apps/                               │
│  📁 mobile/                             │
│  📄 .env                  ← API key here│
│  📄 README.md                           │
│  📄 ...other files                      │
└─────────────────────────────────────────┘
```

---

## 🚀 After Installation

### To Start Jorb Core:

1. **Double-click `LAUNCH.bat`**
2. Wait for terminal window to show startup
3. Browser opens automatically
4. Start using the API!

### To Stop Jorb Core:

- In the terminal window, press **`Ctrl + C`**
- Type **`Y`** when asked
- Close the window

---

## 🌐 Access Points

When Jorb Core is running:

| What | URL |
|------|-----|
| **Interactive API Docs** | http://localhost:3000/api/docs |
| **API Endpoint** | http://localhost:3000/api/v1 |
| **Database Browser** | Run: `npm run prisma:studio` |

---

## 💻 Your First API Call

Once running, test it:

### 1. Open PowerShell or Command Prompt

### 2. Register a User

```powershell
curl -X POST http://localhost:3000/api/v1/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"test123\",\"name\":\"Test User\"}"
```

### 3. Login (Save the Token!)

```powershell
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"test123\"}"
```

### 4. Create an Intelligent Agent Task

```powershell
curl -X POST http://localhost:3000/api/v1/tasks -H "Authorization: Bearer YOUR_TOKEN_HERE" -H "Content-Type: application/json" -d "{\"title\":\"Calculate quarterly revenue\",\"description\":\"Add: Jan $50K + Feb $75K + Mar $100K\",\"priority\":5}"
```

The agent will automatically:
- 🧠 Plan the calculation
- 🔧 Execute the calculator tool
- 💾 Store the result
- ✅ Return the answer: $225K

---

## 🐛 Common Issues

### ❌ "Node.js is not installed"

**Fix:**
1. Install Node.js from https://nodejs.org
2. Restart computer
3. Run `INSTALL.bat` again

### ❌ "Docker is not running"

**Fix Option 1 (Recommended):**
1. Install Docker Desktop
2. Start Docker Desktop
3. Look for whale icon in system tray
4. Run `INSTALL.bat` again

**Fix Option 2:**
- Continue without Docker
- Setup databases manually (see guide)

### ❌ "OpenAI API key not found"

**Fix:**
1. Right-click `.env` → Open with Notepad
2. Find: `OPENAI_API_KEY=`
3. Change to: `OPENAI_API_KEY=sk-your-key-here`
4. Save file
5. Restart Jorb Core

### ❌ "Port 3000 already in use"

**Fix:**
1. Open `.env` in Notepad
2. Change `PORT=3000` to `PORT=3001`
3. Save file
4. Restart Jorb Core
5. Access at http://localhost:3001

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **WINDOWS_README.txt** | Quick reference (start here!) |
| **WINDOWS_INSTALL_GUIDE.md** | Complete Windows guide |
| **QUICKSTART.md** | Usage examples |
| **README.md** | Full documentation |
| **PROJECT_SUMMARY.md** | Architecture overview |

---

## ✅ Installation Checklist

Before running `LAUNCH.bat`, verify:

- ✅ Node.js is installed (`node -v` in cmd)
- ✅ Docker Desktop is running (optional)
- ✅ `INSTALL.bat` completed successfully
- ✅ `.env` file has OpenAI API key
- ✅ No red error messages during install

---

## 🎓 Next Steps

After successful launch:

1. **Explore API Docs** - http://localhost:3000/api/docs
2. **Create Tasks** - Build your first intelligent agent
3. **Try Tools** - Calculator, scheduler, email drafter, etc.
4. **Read Guides** - See QUICKSTART.md for examples
5. **Build Custom Tools** - Extend functionality

---

## 🎊 Success!

You should see:

✅ Terminal window with green startup logs
✅ Browser opened to API docs
✅ No error messages
✅ "Jorb Core is running..." message

**You're ready to build intelligent agents! 🚀**

---

## 🆘 Need Help?

1. **Check** `WINDOWS_README.txt` (quick reference)
2. **Read** `WINDOWS_INSTALL_GUIDE.md` (detailed guide)
3. **See** `QUICKSTART.md` (usage examples)
4. **Visit** http://localhost:3000/api/docs (when running)

---

## 💡 Pro Tips

### Create Desktop Shortcuts

Double-click `CREATE_SHORTCUTS.vbs` to add shortcuts to your desktop for easy access!

### Use Interactive Docs

Instead of curl, use the browser:
1. Go to http://localhost:3000/api/docs
2. Click endpoints to expand
3. Try API calls directly
4. See request/response examples

### View Database

```cmd
npm run prisma:studio
```

Opens visual database browser at http://localhost:5555

---

**Made with ❤️ for Windows Users**

*Total setup time: 5 minutes*
*Technical skill required: None*
*Just double-click and go!*

🚀 **Happy Building!**

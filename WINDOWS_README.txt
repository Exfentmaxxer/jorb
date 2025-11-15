╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║      JORB CORE - WINDOWS INSTALLATION INSTRUCTIONS       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝


🎯 QUICK START (3 Simple Steps)
================================================================================

STEP 1: CREATE DESKTOP SHORTCUTS (Optional but Recommended)
   → Double-click: CREATE_SHORTCUTS.vbs
   → This creates shortcuts on your desktop for easy access

STEP 2: INSTALL JORB CORE (One Time Only)
   → Double-click: INSTALL.bat
   → Wait 5 minutes while it installs everything
   → Enter your OpenAI API key when prompted

STEP 3: LAUNCH JORB CORE (Every Time You Want to Use It)
   → Double-click: LAUNCH.bat
   → Browser opens automatically to the API docs
   → Start building intelligent agents!


📦 WHAT YOU NEED BEFORE STARTING
================================================================================

REQUIRED:
✓ Windows 10 or 11
✓ Node.js 18 or higher → Download from https://nodejs.org

RECOMMENDED:
✓ Docker Desktop → Download from https://docker.com
  (Makes database setup automatic - highly recommended!)

OPTIONAL:
✓ OpenAI API key → Get from https://platform.openai.com/api-keys
  (Needed for AI features - you can add it during installation)


🖱️ FILES TO CLICK
================================================================================

1. CREATE_SHORTCUTS.vbs
   → Creates desktop shortcuts (run once, optional)

2. INSTALL.bat
   → Installs Jorb Core (run once)
   → Takes ~5 minutes
   → Will ask for OpenAI API key

3. LAUNCH.bat
   → Starts Jorb Core (run every time you want to use it)
   → Opens browser automatically
   → Shows live logs


📚 DETAILED GUIDES
================================================================================

For detailed instructions, see:
   → WINDOWS_INSTALL_GUIDE.md - Complete Windows guide
   → QUICKSTART.md - Quick start with examples
   → README.md - Full documentation


🐛 TROUBLESHOOTING
================================================================================

"Node.js is not installed"
   → Download and install from https://nodejs.org
   → Restart computer
   → Run INSTALL.bat again

"Docker is not running"
   → Download Docker Desktop from https://docker.com
   → Start Docker Desktop (look for whale icon in system tray)
   OR
   → Skip Docker and setup databases manually (see guide)

"OpenAI API key not found"
   → Open .env file in Notepad
   → Add: OPENAI_API_KEY=sk-your-key-here
   → Save and restart

Can't find your issue?
   → See WINDOWS_INSTALL_GUIDE.md for more help


🎯 WHAT HAPPENS AFTER INSTALLATION?
================================================================================

After you double-click LAUNCH.bat:

1. Terminal window opens showing startup logs
2. Services start (PostgreSQL, Redis, ChromaDB)
3. Backend server starts
4. Browser opens to: http://localhost:3000/api/docs
5. You can now use Jorb Core!

To stop: Press Ctrl+C in the terminal window


🌐 ACCESS POINTS
================================================================================

Once running, access:

   API Docs (Interactive):  http://localhost:3000/api/docs
   API Endpoint:            http://localhost:3000/api/v1
   Database Browser:        npm run prisma:studio


✅ SUCCESS INDICATORS
================================================================================

Installation successful when:
✓ INSTALL.bat shows "INSTALLATION COMPLETE!"
✓ No red error messages appear
✓ .env file exists in the folder

Launch successful when:
✓ Browser opens automatically
✓ You see logs in the terminal window
✓ http://localhost:3000/api/docs loads


📞 GETTING HELP
================================================================================

1. Check WINDOWS_INSTALL_GUIDE.md (detailed troubleshooting)
2. Check QUICKSTART.md (usage examples)
3. Visit http://localhost:3000/api/docs (when running)


🎊 YOU'RE READY!
================================================================================

To get started right now:

1. Double-click: INSTALL.bat
2. Wait for "INSTALLATION COMPLETE!"
3. Double-click: LAUNCH.bat
4. Browser opens to API docs
5. Start building intelligent agents!


Happy building! 🚀

═══════════════════════════════════════════════════════════════

Need more help? See WINDOWS_INSTALL_GUIDE.md for complete instructions.

# ✅ Jorb Core - One-Click Installation Ready!

## 🎉 Your System is Ready to Install and Launch

Jorb Core now features a **complete one-click installation and launch system**. Everything is automated and ready to go!

---

## 🚀 Installation Methods

### Method 1: Automated Setup Script (Recommended)

#### macOS / Linux:
```bash
chmod +x setup.sh
./setup.sh
```

#### Windows:
```powershell
powershell -ExecutionPolicy Bypass -File setup.ps1
```

**What the script does:**
1. ✅ Checks prerequisites (Node.js 18+, Docker)
2. ✅ Installs all npm dependencies
3. ✅ Creates and configures .env file
4. ✅ Prompts for OpenAI API key (or skip and add later)
5. ✅ Starts Docker services (PostgreSQL, Redis, ChromaDB)
6. ✅ Generates Prisma database client
7. ✅ Runs database migrations
8. ✅ Builds the backend
9. ✅ Shows you what to do next

**Time:** Under 5 minutes (including downloads)

---

### Method 2: Using npm Scripts

```bash
npm run setup          # macOS/Linux
npm run setup:windows  # Windows
```

Same automated setup, just using npm.

---

### Method 3: Quick Launcher

For subsequent startups after initial setup:

```bash
chmod +x start.sh
./start.sh
```

This will:
- Check if setup is complete
- Start Docker services
- Launch the backend
- Display access URLs

---

## 🎯 After Installation

Once setup completes, start Jorb Core:

```bash
npm start
```

### Access Points

- **API:** http://localhost:3000/api/v1
- **Interactive Docs:** http://localhost:3000/api/docs
- **Landing Page:** http://localhost:3001 (optional, run `npm run start:landing`)

---

## 📋 Available Commands

### Essential Commands

```bash
npm start              # Start production backend
npm run dev            # Development mode with auto-reload
npm run start:all      # Start backend + landing page
npm run start:landing  # Start landing page only
```

### Docker Management

```bash
npm run docker:up      # Start all Docker services
npm run docker:down    # Stop all Docker services
npm run docker:logs    # View container logs
npm run services:start # Start only databases (PostgreSQL, Redis, ChromaDB)
npm run services:stop  # Stop only databases
```

### Database Operations

```bash
npm run migrate        # Run database migrations
npm run migrate:dev    # Create and run new migration
npm run prisma:studio  # Visual database browser
npm run prisma:generate # Regenerate Prisma client
```

### Development Tools

```bash
npm run dev            # Backend with auto-reload
npm run dev:landing    # Landing page with hot reload
npm run build          # Build all packages
npm test               # Run tests
npm run lint           # Run linter
npm run format         # Format code
```

### Cleanup

```bash
npm run clean          # Remove all build artifacts
npm run clean:docker   # Remove Docker volumes and data
```

---

## 🧪 Test Your Installation

### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Save the `access_token` from the response!**

### 3. Create Your First Agent Task

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Calculate quarterly revenue",
    "description": "Sum: Jan $50K + Feb $75K + Mar $100K",
    "priority": 5
  }'
```

**Expected:** The agent will plan, execute the calculator tool, and return the result!

### 4. Check Task Status

```bash
curl http://localhost:3000/api/v1/tasks/TASK_ID_FROM_PREVIOUS_RESPONSE \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 🔧 Configuration

### Environment Variables

Key settings in `.env`:

```bash
# Required
OPENAI_API_KEY=sk-...          # Your OpenAI API key
DATABASE_URL=postgresql://...   # Auto-configured with Docker
JWT_SECRET=your-secret-here     # Change in production!

# Optional
PORT=3000                       # API server port
NODE_ENV=development            # development | production
RATE_LIMIT_MAX=100             # Max requests per minute
```

### Get an OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Create a new API key
4. Copy it to your `.env` file

---

## 🐛 Troubleshooting

### "OpenAI API key not found"
**Solution:** Edit `.env` and add your OpenAI API key

### "Database connection failed"
**Solution:** Make sure Docker is running:
```bash
docker-compose ps
npm run services:start
```

### "Port 3000 already in use"
**Solution:** Change the port in `.env`:
```bash
PORT=3001
```

### Start Fresh
```bash
npm run clean:docker  # Remove all data
npm run clean         # Remove build files
npm run setup         # Run setup again
```

### Docker Not Installed
You can still run Jorb Core, but you'll need to:
1. Install PostgreSQL, Redis, and ChromaDB manually
2. Update `.env` with your connection strings
3. Run `npm run migrate`

---

## 📚 Documentation

- **QUICKSTART.md** - Quick start guide with examples
- **README.md** - Complete documentation
- **PROJECT_SUMMARY.md** - Project overview and architecture
- **BRAND_GUIDELINES.md** - Branding and design system
- **http://localhost:3000/api/docs** - Interactive API documentation

---

## 🎯 Next Steps

1. ✅ **Explore the API** - Open http://localhost:3000/api/docs
2. ✅ **Try built-in tools** - calculator, scheduler, email_drafter, etc.
3. ✅ **Test memory system** - Store and search semantic memories
4. ✅ **Build custom tools** - Extend with your own functionality
5. ✅ **Read the docs** - Understand the architecture
6. ✅ **Deploy to production** - Use Docker Compose or Kubernetes

---

## 💡 Pro Tips

### Use the Interactive API Docs

Open http://localhost:3000/api/docs in your browser to:
- See all available endpoints
- Try API calls directly
- View request/response schemas
- Test authentication

### Enable Auto-Reload in Development

```bash
npm run dev  # Backend reloads on file changes
```

### Visual Database Browser

```bash
npm run prisma:studio
```

Opens a GUI at http://localhost:5555 to browse your database.

### Monitor Docker Logs

```bash
npm run docker:logs
```

See real-time logs from all services.

### Test with Multiple Users

Create different users for testing task isolation and memory separation.

---

## 🏗️ What's Included

Your installation includes:

### Backend (packages/backend/)
- ✅ NestJS API server
- ✅ Reasoning & planning engine
- ✅ Memory system with ChromaDB
- ✅ Tool/plugin architecture
- ✅ 6 built-in tools
- ✅ WebSocket real-time updates
- ✅ JWT authentication
- ✅ Rate limiting
- ✅ Metrics & monitoring
- ✅ Audit logging
- ✅ Health checks

### Frontend (apps/landing/)
- ✅ Next.js landing page
- ✅ Tailwind CSS styling
- ✅ Responsive design
- ✅ Marketing content

### Infrastructure
- ✅ Docker Compose setup
- ✅ PostgreSQL database
- ✅ Redis cache
- ✅ ChromaDB vector store
- ✅ Prisma ORM
- ✅ Auto-migrations

### Documentation
- ✅ Comprehensive guides
- ✅ API examples
- ✅ Mobile SDK docs
- ✅ Brand guidelines
- ✅ Marketing materials

---

## 🚢 Production Deployment

When you're ready for production:

### Docker (Recommended)

```bash
# Build production images
docker-compose build

# Start in production mode
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Manual Deployment

```bash
# Build
npm run build

# Set production environment
export NODE_ENV=production

# Update .env with production values
# - Change JWT_SECRET
# - Use production database URL
# - Enable HTTPS

# Start
npm start
```

### Kubernetes

Helm charts available in `deploy/kubernetes/` (to be created for production use).

---

## ❓ Need Help?

- **Quick Start:** QUICKSTART.md
- **Full Docs:** README.md
- **Architecture:** PROJECT_SUMMARY.md
- **API Reference:** http://localhost:3000/api/docs
- **Issues:** File on GitHub
- **Community:** Discord (see README)

---

## ✨ Success Indicators

You'll know everything is working when:

✅ Setup script completes without errors
✅ `npm start` launches successfully
✅ http://localhost:3000/api/docs loads
✅ You can register a user
✅ You can create and complete a task
✅ Docker services are running (`docker-compose ps`)

---

## 🎊 You're Ready!

**Jorb Core is now installed and ready to build intelligent agents!**

Start exploring with:
```bash
npm start
```

Then open: http://localhost:3000/api/docs

**Happy building! 🚀**

---

*Last updated: 2025-01-15*
*Version: 1.0.0*

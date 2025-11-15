# 🚀 Jorb Core - Quick Start Guide

Get Jorb Core running in **under 5 minutes** with one command!

## One-Click Installation

### macOS / Linux

```bash
chmod +x setup.sh
./setup.sh
```

### Windows

```powershell
powershell -ExecutionPolicy Bypass -File setup.ps1
```

Or use npm:

```bash
npm run setup          # macOS/Linux
npm run setup:windows  # Windows
```

That's it! The script will:
- ✅ Check prerequisites (Node.js, Docker)
- ✅ Install all dependencies
- ✅ Configure environment
- ✅ Start database services
- ✅ Run migrations
- ✅ Build the backend

## Start the System

```bash
npm start
```

Access:
- **API:** http://localhost:3000/api/v1
- **Documentation:** http://localhost:3000/api/docs

## Optional: Start Landing Page

```bash
npm run start:landing
```

Access at: http://localhost:3001

## Your First Agent

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

### 2. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `access_token` from the response.

### 3. Create Your First Task

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Calculate quarterly revenue",
    "description": "Sum up Q1 2024 sales: $50K (Jan), $75K (Feb), $100K (Mar)",
    "priority": 5
  }'
```

The agent will:
1. 🧠 Plan how to solve it
2. 🔧 Execute the calculator tool
3. 💾 Store the result in memory
4. ✅ Return the answer

### 4. Check Task Status

```bash
curl http://localhost:3000/api/v1/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Common Commands

```bash
# Development with auto-reload
npm run dev

# Start all services (backend + landing)
npm run start:all

# View logs
npm run docker:logs

# Database GUI
npm run prisma:studio

# Stop everything
npm run docker:down
```

## Troubleshooting

### "OpenAI API key not found"

Edit `.env` and add your key:
```bash
OPENAI_API_KEY=sk-your-key-here
```

Get a key at: https://platform.openai.com/api-keys

### "Database connection failed"

Make sure Docker is running:
```bash
docker-compose ps
```

Restart services:
```bash
npm run services:start
```

### "Port 3000 already in use"

Stop the conflicting service or change the port in `.env`:
```bash
PORT=3001
```

### Fresh Start

```bash
# Clean everything
npm run clean:docker
npm run clean

# Run setup again
npm run setup
```

## Next Steps

1. **Explore the API** - http://localhost:3000/api/docs
2. **Read the docs** - README.md and PROJECT_SUMMARY.md
3. **Try built-in tools** - calculator, scheduler, email_drafter, etc.
4. **Build custom tools** - See packages/backend/src/tool/built-in/
5. **Create agents** - Use the memory system for context
6. **Deploy to production** - Use Docker Compose or Kubernetes

## Interactive API Documentation

Open http://localhost:3000/api/docs in your browser for:
- 📚 Complete API reference
- 🧪 Try API calls directly
- 📝 Request/response examples
- 🔐 Authentication testing

## Development Mode

For active development with hot reload:

```bash
# Backend with auto-reload
npm run dev

# Landing page with hot reload (in another terminal)
npm run dev:landing
```

## Environment Variables

Key variables in `.env`:

```bash
# Required
OPENAI_API_KEY=sk-...           # Get from OpenAI
DATABASE_URL=postgresql://...   # Auto-configured if using Docker
JWT_SECRET=change-this          # Change in production

# Optional
PORT=3000                       # API port
NODE_ENV=development            # development | production
RATE_LIMIT_MAX=100             # Requests per minute
```

## Production Deployment

See full deployment guide in README.md, or quick deploy with Docker:

```bash
# Build production images
docker-compose build

# Start in production mode
docker-compose up -d
```

## Need Help?

- 📖 **Documentation:** README.md, PROJECT_SUMMARY.md
- 🐛 **Issues:** File on GitHub
- 💬 **Community:** Join Discord (see README)
- 📧 **Support:** support@jorb.ai

---

**You're ready to build intelligent agents! 🎉**

Visit http://localhost:3000/api/docs to explore the API.

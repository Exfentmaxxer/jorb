# Jorb Core - Enterprise Agentic Operating System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue)](https://www.typescriptlang.org)
[![NestJS](https://img.shields.io/badge/NestJS-10%2B-red)](https://nestjs.com)

**Jorb Core** is a production-ready, enterprise-grade agentic operating system that combines advanced reasoning, persistent memory, and extensible tool execution to power autonomous AI agents.

## 🌟 Features

### Core Capabilities

- **🧠 Advanced Reasoning Engine**: Multi-step task decomposition with reflection and self-correction
- **💾 Persistent Memory System**: Short-, mid-, and long-term memory with semantic search powered by ChromaDB
- **🔧 Plugin Architecture**: Extensible tool system with sandboxed execution and automatic retries
- **🔄 Real-time Updates**: WebSocket support for streaming task progress
- **📊 Enterprise Monitoring**: Comprehensive metrics, audit logging, and health checks
- **🔐 Production Security**: JWT authentication, rate limiting, and input validation

### Built-in Tools

- **Calculator**: Mathematical expression evaluation
- **Scheduler**: Time-based task management
- **Email Drafter**: AI-powered email generation
- **HTTP Client**: External API integration
- **File I/O**: Sandboxed file operations
- **Browser Automation**: Web interaction (stub)

## 🏗️ Architecture

```
jorb-core/
├── packages/
│   └── backend/          # NestJS backend service
│       ├── src/
│       │   ├── reasoning/    # Planning & execution engine
│       │   ├── memory/       # Memory system & ChromaDB
│       │   ├── tool/         # Plugin system & built-in tools
│       │   ├── task/         # Task management
│       │   ├── auth/         # Authentication & authorization
│       │   ├── session/      # Session management
│       │   ├── websocket/    # Real-time updates
│       │   ├── metrics/      # Performance monitoring
│       │   ├── audit/        # Audit logging
│       │   └── health/       # Health checks
│       └── prisma/           # Database schema & migrations
├── apps/
│   └── landing/          # Marketing website (Next.js)
├── mobile/
│   ├── ios-sdk/          # Swift SDK
│   ├── android-sdk/      # Kotlin SDK
│   └── example-ios/      # iOS demo app
└── docs/                 # Documentation site
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- PostgreSQL 16+
- Redis 7+
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/jorb-core.git
   cd jorb-core
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys and configuration
   ```

4. **Start infrastructure**
   ```bash
   docker-compose up -d postgres redis chromadb
   ```

5. **Run database migrations**
   ```bash
   npm run migrate
   ```

6. **Start the backend**
   ```bash
   cd packages/backend
   npm run start:dev
   ```

7. **Access the API**
   - API: http://localhost:3000/api/v1
   - Docs: http://localhost:3000/api/docs

## 📚 API Documentation

### Authentication

Register a new user:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secure123","name":"John Doe"}'
```

Login:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secure123"}'
```

### Task Creation

Create a task:
```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Analyze quarterly sales data",
    "description": "Generate insights from Q1 2024 sales",
    "priority": 5
  }'
```

Get task status:
```bash
curl http://localhost:3000/api/v1/tasks/{taskId} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Memory System

Store a memory:
```bash
curl -X POST http://localhost:3000/api/v1/memory \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "SEMANTIC",
    "content": "User prefers data visualizations in dark mode",
    "metadata": {"category": "preferences"}
  }'
```

Search memories:
```bash
curl -X POST http://localhost:3000/api/v1/memory/search \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the user preferences for charts?",
    "limit": 5
  }'
```

### Tool Execution

List available tools:
```bash
curl http://localhost:3000/api/v1/tools \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Execute a tool:
```bash
curl -X POST http://localhost:3000/api/v1/tools/calculator/execute \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {"expression": "2 + 2 * 10"}
  }'
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | - |
| `CHROMA_URL` | ChromaDB URL | http://localhost:8000 |
| `JWT_SECRET` | Secret for JWT signing | - |
| `OPENAI_API_KEY` | OpenAI API key for LLM & embeddings | - |
| `RATE_LIMIT_TTL` | Rate limit window (seconds) | 60 |
| `RATE_LIMIT_MAX` | Max requests per window | 100 |

## 🏢 Production Deployment

### Docker Deployment

Build and run all services:
```bash
docker-compose up --build
```

Run in production mode:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Kubernetes

Helm chart available in `deploy/kubernetes/`:
```bash
helm install jorb-core ./deploy/kubernetes/jorb-core \
  --set image.tag=latest \
  --set env.jwtSecret=your-secret \
  --set env.openaiApiKey=your-api-key
```

## 📱 Mobile SDKs

### iOS SDK

```swift
import JorbSDK

let client = JorbClient(apiUrl: "https://api.jorb.ai", apiKey: "your-key")

// Create a task
Task {
    let task = try await client.tasks.create(
        title: "Analyze sales data",
        description: "Generate Q1 insights"
    )
    print("Task created: \\(task.id)")
}

// Subscribe to task updates
client.tasks.subscribe(taskId: taskId) { update in
    print("Progress: \\(update.progress)%")
}
```

### Android SDK

```kotlin
val client = JorbClient("https://api.jorb.ai", "your-key")

// Create a task
lifecycleScope.launch {
    val task = client.tasks.create(
        title = "Analyze sales data",
        description = "Generate Q1 insights"
    )
    println("Task created: ${task.id}")
}

// Subscribe to updates
client.tasks.subscribe(taskId) { update ->
    println("Progress: ${update.progress}%")
}
```

## 🧪 Testing

Run all tests:
```bash
npm test
```

Run e2e tests:
```bash
npm run test:e2e
```

Generate coverage report:
```bash
npm run test:cov
```

## 📊 Monitoring

### Metrics Endpoint

```bash
curl http://localhost:3000/api/v1/metrics
```

### Health Checks

```bash
# Liveness
curl http://localhost:3000/api/v1/health/live

# Readiness
curl http://localhost:3000/api/v1/health/ready
```

### Audit Logs

All user actions are automatically logged to the `audit_logs` table with:
- User ID and action
- Resource type and ID
- IP address and user agent
- Timestamp and metadata

## 🛠️ Development

### Project Structure

- `/packages/backend` - NestJS backend service
- `/apps/landing` - Next.js marketing website
- `/mobile/ios-sdk` - Swift SDK for iOS
- `/mobile/android-sdk` - Kotlin SDK for Android
- `/docs` - Documentation site

### Adding a New Tool

1. Create tool class in `packages/backend/src/tool/built-in/`:
   ```typescript
   import { Injectable } from '@nestjs/common';
   import { ToolDefinition } from '../tool.service';

   @Injectable()
   export class MyCustomTool {
     getDefinition(): ToolDefinition {
       return {
         name: 'my_custom_tool',
         version: '1.0.0',
         description: 'Does something useful',
         schema: {
           input: {
             type: 'object',
             properties: {
               param: { type: 'string' }
             },
             required: ['param']
           },
           output: { type: 'object' }
         },
         execute: async (input) => {
           return { result: `Processed: ${input.param}` };
         }
       };
     }
   }
   ```

2. Register in `tool.module.ts`
3. Tool will be automatically loaded on startup

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Documentation**: https://docs.jorb.ai
- **Website**: https://jorb.ai
- **GitHub**: https://github.com/yourusername/jorb-core
- **Discord**: https://discord.gg/jorbcore

## 🙏 Acknowledgments

Built with:
- [NestJS](https://nestjs.com) - Backend framework
- [Prisma](https://www.prisma.io) - Database ORM
- [ChromaDB](https://www.trychroma.com) - Vector database
- [OpenAI](https://openai.com) - LLM & embeddings
- [Next.js](https://nextjs.org) - Web framework

## 📞 Support

- Email: support@jorb.ai
- Discord: https://discord.gg/jorbcore
- Issues: https://github.com/yourusername/jorb-core/issues

---

**Made with ❤️ by the Jorb Core team**

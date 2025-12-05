# Intelligence Adjacent Framework - Agent SDK

Building AI systems that augment human intelligence, not replace it.

**Status:** Phase 1 Complete (Workflow-Aware Model Selection with Dynamic Discovery) | **Framework:** Node.js + TypeScript | **Deployment:** Docker

---

## Quick Start (5 minutes)

Get the Agent SDK running with Docker:

```bash
git clone https://github.com/notchrisgroves/ia-framework-sdk.git
cd ia-framework-sdk

cp .env.example .env
# Edit .env and add: OPENROUTER_API_KEY=sk-or-your-key-here
# Get key from: https://openrouter.ai/keys

docker-compose up
```

Server runs on `http://localhost:3000`

**For complete setup, testing, and API documentation**, see [`docs/QUICKSTART.md`](./docs/QUICKSTART.md)

---

## What is the Agent SDK?

IA Framework is a production-ready Node.js application that deploys specialized AI agents for:

- **Security**: Penetration testing, vulnerability assessment, security advisory
- **Writing**: Blog posts, technical documentation, security reports
- **Research**: OSINT intelligence gathering, job analysis, career guidance
- **Compliance**: GDPR analysis, contract review, regulatory research

**Agents automatically route your request to the right specialist** based on keywords.

### Key Capabilities

✅ **Multi-model orchestration** - Dynamically selects from 200+ OpenRouter models
✅ **Workflow-aware selection** - Each skill phase uses cost-optimized models
✅ **Real-time model discovery** - Automatically finds best available model
✅ **Type-safe** - Full TypeScript with strict types
✅ **Docker-ready** - Single-command deployment
✅ **Production-grade** - Health checks, logging, error handling

---

## Documentation

Start based on what you need:

| I want to... | Read this |
|---|---|
| **Get running in 5 minutes** | [`docs/QUICKSTART.md`](./docs/QUICKSTART.md) |
| **Understand the architecture** | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) |
| **Learn how agents route to skills** | [`docs/AGENT_SKILL_MAPPING.md`](./docs/AGENT_SKILL_MAPPING.md) |
| **Dive into OpenRouter integration** | [`docs/OPENROUTER_INTEGRATION.md`](./docs/OPENROUTER_INTEGRATION.md) |

**Full documentation index:** [`docs/README.md`](./docs/README.md)

---

## API Endpoints

### Health & Status

```bash
# Health check
curl http://localhost:3000/health

# Ready check
curl http://localhost:3000/ready

# List available agents
curl http://localhost:3000/agents
```

### Query Endpoint

```bash
# Send a query (automatically routes to appropriate agent)
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"prompt": "I need to do a penetration test"}'
```

### Routing Debug

```bash
# Get all routing rules
curl http://localhost:3000/routing/rules

# Test routing for a query
curl -X POST http://localhost:3000/routing/test \
  -H "Content-Type: application/json" \
  -d '{"query": "pentest hackerone"}'
```

---

## Configuration

### Environment Variables

```env
# Required - Get from https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-...

# Optional
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

### Docker Compose

```bash
# Start with all services
docker-compose up

# Stop
docker-compose down
```

---

## Development

### Project Structure

```
src/
├── agents/           # Specialized agents (security, writer, advisor, legal)
├── services/         # Model discovery, integrations
├── clients/          # Model client with workflow awareness
├── config/           # Workflow definitions, capability mapping
├── types/            # TypeScript types
├── server.ts         # Express server setup
└── main.ts           # Entry point

docs/                # Complete documentation
docker-compose.yml   # Docker orchestration
tests/              # Test suite
```

### Common Commands

```bash
npm run dev          # Start with hot-reload
npm run build        # Build for production
npm start            # Run production build
npm test             # Run test suite
npm run lint         # Lint code
```

---

## Deployment

### Docker (Recommended)

```bash
# Build image
docker build -t ia-framework:latest .

# Run container
docker run -e OPENROUTER_API_KEY=your-key ia-framework:latest
```

### Cloud Platforms

Production-ready for:
- AWS ECS / Fargate
- Google Cloud Run
- Azure Container Instances
- Fly.io
- DigitalOcean App Platform
- Modal

---

## Security

✅ Environment variables for all credentials (never hardcoded)
✅ Non-root container execution
✅ Health checks and monitoring
✅ Graceful signal handling
✅ API key validation

---

## Project Roadmap

| Phase | Status | What |
|-------|--------|------|
| **Phase 1** | ✅ COMPLETE | Workflow-aware model selection with dynamic discovery |
| **Phase 2** | 📋 PLANNED | Convert SKILL.md files to executable TypeScript modules |
| **Phase 3** | 📋 PLANNED | Integrate VPS security tool APIs |
| **Phase 4** | 📋 PLANNED | Multi-turn conversation support with state tracking |

---

## Support

**Documentation**: See [`docs/`](./docs/README.md)
**Issues**: GitHub Issues
**License**: MIT

---

**Intelligence Adjacent Framework** - Augmenting human intelligence with AI

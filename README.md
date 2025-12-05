# Intelligence Adjacent Framework (Agent SDK)

Building AI systems that augment human intelligence, not replace it.

## Overview

IA Framework is an Agent SDK application that provides specialized AI agents for security, writing, research, and compliance work. Deploy as a Docker container with one command.

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- `ANTHROPIC_API_KEY` environment variable

### Option 1: Docker (Recommended)

```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

docker-compose -f docker/docker-compose.yml up
```

Server runs on `http://localhost:3000`

### Option 2: Local Development

```bash
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

npm run dev
```

TypeScript hot-reloads automatically.

## Architecture

### Agents

- **Security Agent** - Penetration testing, vulnerability assessment, security advisory
- **Writer Agent** - Blog posts, technical documentation, security reports
- **Advisor Agent** - OSINT research, job analysis, career guidance
- **Legal Agent** - Compliance review, contract analysis, regulatory research
- **Router Agent** - Intelligent request routing to appropriate specialist

### Features

✅ **Keyword-based routing** - Requests automatically routed to the right agent
✅ **Type-safe** - Full TypeScript with strict types
✅ **API-first** - REST endpoints for all operations
✅ **Docker-ready** - One-command deployment
✅ **Health checks** - Built-in monitoring
✅ **Production-grade** - Security, logging, error handling

## API Endpoints

### Health & Status

```bash
# Health check
curl http://localhost:3000/health

# Ready check
curl http://localhost:3000/ready

# List agents
curl http://localhost:3000/agents
```

### Main Query Endpoint

```bash
# Send a query (routes to appropriate agent)
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"prompt": "I need to do a penetration test on hackerone"}'
```

### Routing Endpoints (Debug)

```bash
# Get all routing rules
curl http://localhost:3000/routing/rules

# Test routing for a query
curl -X POST http://localhost:3000/routing/test \
  -H "Content-Type: application/json" \
  -d '{"query": "pentest from hackerone"}'
```

## Configuration

### Environment Variables

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Optional
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Resources (for mounted resources)
RESOURCES_PATH=/app/resources
RESOURCES_SECURITY=/app/resources/security
```

### Mounting Resources

To include optional resources:

```bash
docker-compose -f docker/docker-compose.yml up
# Automatically mounts resources if ia-framework-resources exists
```

## Development

### Project Structure

```
src/
├── agents/           # Specialized agents
├── skills/           # Skill modules (under development)
├── tools/            # Tool integrations
├── config/           # Configuration
├── types/            # TypeScript types
├── server.ts         # Express server
└── main.ts           # Entry point

docker/              # Docker configuration
tests/               # Test suite
examples/            # Usage examples
```

### Scripts

```bash
npm run dev           # Start with hot-reload
npm run build         # Build for production
npm start             # Run production build
npm test              # Run test suite
npm run lint          # Lint code
npm run agents:list   # List all agents
```

### Adding a New Agent

1. Create `src/agents/your-agent.ts`
2. Extend `AgentName` type in `src/types/index.ts`
3. Add routing rules in `src/agents/router-agent.ts`
4. Export in `src/server.ts`

## Deployment

### Docker Hub

```bash
# Build
docker build -t ia-framework:latest .

# Push
docker push your-registry/ia-framework:latest

# Run
docker run -e ANTHROPIC_API_KEY=your-key ia-framework:latest
```

### Cloud Platforms

The Docker image is production-ready for:
- AWS ECS
- Google Cloud Run
- Azure Container Instances
- Fly.io
- Modal
- DigitalOcean App Platform

Example with Fly.io:

```bash
fly deploy
```

## Resources

- **Optional Resources Repo**: `ia-framework-resources` (10GB tools/templates)
  - Mount via Docker volume
  - Separate versioning
  - Users choose subsets

## Security

✅ Non-root user execution
✅ Health checks & monitoring
✅ Environment variable isolation
✅ Credentials never in image
✅ Signal handling for graceful shutdown

## License

MIT

## Contributing

See CONTRIBUTING.md (coming soon)

## Support

Issues? Questions?

- GitHub Issues: https://github.com/yourusername/ia-framework/issues
- Documentation: See `/docs`

---

**IA Framework** - Augmenting human intelligence with AI

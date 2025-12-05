/**
 * IA Framework - Express Server
 *
 * Main entry point for the Agent SDK application.
 * Provides REST API for agent routing and execution.
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { router } from './agents/router-agent';
import { securityAgent } from './agents/security-agent';
import { writerAgent } from './agents/writer-agent';
import { advisorAgent } from './agents/advisor-agent';
import { legalAgent } from './agents/legal-agent';
import { ApiResponse, QueryResponse } from './types/index';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in project root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ============================================================
// HEALTH CHECK ENDPOINTS
// ============================================================

/**
 * Health check endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Ready check endpoint (more detailed)
 */
app.get('/ready', (_req: Request, res: Response): void => {
  const ready: ApiResponse = {
    success: true,
    data: {
      status: 'ready',
      agents: ['security', 'writer', 'advisor', 'legal'],
      apiKey: process.env.ANTHROPIC_API_KEY ? 'configured' : 'missing',
      port: PORT
    }
  };

  if (!process.env.ANTHROPIC_API_KEY) {
    ready.success = false;
    ready.error = {
      code: 'MISSING_API_KEY',
      message: 'ANTHROPIC_API_KEY not configured'
    };
    res.status(503).json(ready);
    return;
  }

  res.json(ready);
});

// ============================================================
// AGENT ENDPOINTS
// ============================================================

/**
 * List available agents
 */
app.get('/agents', (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      agents: ['security', 'writer', 'advisor', 'legal', 'director'],
      total: 5,
      description: 'Specialized agents for different domains'
    }
  };
  res.json(response);
});

/**
 * Get routing rules (for debugging)
 */
app.get('/routing/rules', (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      rules: router.getRules(),
      description: 'Keyword-based routing rules for agent selection'
    }
  };
  res.json(response);
});

/**
 * Test routing for a query (for debugging)
 */
app.post('/routing/test', (req: Request, res: Response): void => {
  const { query } = req.body;

  if (!query) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_QUERY',
        message: 'Query parameter is required'
      }
    });
    return;
  }

  const results = router.testRoute(query);
  const response: ApiResponse = {
    success: true,
    data: {
      query,
      results,
      recommended: results[0] || null
    }
  };

  res.json(response);
});

// ============================================================
// MAIN QUERY ENDPOINT
// ============================================================

/**
 * Main endpoint - Process user query and route to appropriate agent
 */
app.post('/query', async (req: Request, res: Response): Promise<void> => {
  const { prompt } = req.body;

  if (!prompt) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_PROMPT',
        message: 'Prompt parameter is required'
      }
    });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({
      success: false,
      error: {
        code: 'MISSING_API_KEY',
        message: 'ANTHROPIC_API_KEY not configured'
      }
    });
    return;
  }

  try {
    // Route the query
    const routing = router.route(prompt);

    if (!routing) {
      const message = await router.processMessage(prompt);
      res.json({
        success: true,
        data: {
          agent: 'director' as const,
          routing_confidence: 0,
          message: message.content
        }
      } as ApiResponse<QueryResponse>);
      return;
    }

    // Dispatch to appropriate agent
    let agentMessage = null;

    switch (routing.agent) {
      case 'security':
        agentMessage = await securityAgent.processMessage(prompt);
        break;
      case 'writer':
        agentMessage = await writerAgent.processMessage(prompt);
        break;
      case 'advisor':
        agentMessage = await advisorAgent.processMessage(prompt);
        break;
      case 'legal':
        agentMessage = await legalAgent.processMessage(prompt);
        break;
      default:
        agentMessage = await router.processMessage(prompt);
    }

    const response: ApiResponse<QueryResponse> = {
      success: true,
      data: {
        agent: routing.agent,
        routing_confidence: routing.confidence,
        message: agentMessage.content
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Query processing error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'QUERY_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error processing query'
      }
    });
  }
});

// ============================================================
// ERROR HANDLING
// ============================================================

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint not found: ${req.method} ${req.path}`
    }
  });
});

/**
 * Error handler
 */
app.use((err: unknown, _req: Request, res: Response) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: 'Internal server error'
    }
  });
});

// ============================================================
// SERVER STARTUP
// ============================================================

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Intelligence Adjacent Framework      ║
║          Agent SDK Server              ║
╚════════════════════════════════════════╝

✅ Server running on port ${PORT}
📝 API Documentation:
   - GET  /health          - Health check
   - GET  /ready           - Ready check
   - GET  /agents          - List agents
   - POST /query           - Main query endpoint
   - GET  /routing/rules   - Show routing rules
   - POST /routing/test    - Test routing

🚀 Ready to accept queries

Environment:
   - NODE_ENV: ${process.env.NODE_ENV || 'development'}
   - ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? '✅ configured' : '❌ missing'}
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;

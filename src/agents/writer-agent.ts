/**
 * Writer Agent
 *
 * Handles content creation: blog posts, technical documentation, security reports, newsletters.
 * Integrates with writer skill and supports three-tier content model:
 * - Public (10-15%): Introductions, announcements, teasers
 * - Free Members (70-75%): Complete technical posts, building in public
 * - Paid Members (10-15%): Step-by-step implementations
 */

import { Anthropic } from '@anthropic-ai/sdk';
import { AgentName, AgentMessage } from '../types/index';

type ContentType = 'blog-post' | 'technical-writing' | 'security-report' | 'newsletter';
type ContentTier = 'public' | 'free' | 'paid';

interface WriterContext {
  contentType: ContentType;
  tier: ContentTier;
  topic?: string;
  format?: string;
}

export class WriterAgent {
  private name: AgentName = 'writer';
  private client: Anthropic | null = null;
  private context: WriterContext = {
    contentType: 'blog-post',
    tier: 'free'
  };

  constructor() {
    // Client will be initialized lazily on first use
  }

  /**
   * Get or initialize Anthropic client
   */
  private getClient(): Anthropic {
    if (!this.client) {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY not configured');
      }
      this.client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
    }
    return this.client;
  }

  /**
   * Detect content type from user message
   */
  private detectContentType(message: string): ContentType {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('blog') || lowerMsg.includes('post') || lowerMsg.includes('article')) {
      return 'blog-post';
    } else if (lowerMsg.includes('tutorial') || lowerMsg.includes('guide') || lowerMsg.includes('how-to') || lowerMsg.includes('documentation')) {
      return 'technical-writing';
    } else if (lowerMsg.includes('report') || lowerMsg.includes('assessment') || lowerMsg.includes('findings') || lowerMsg.includes('pentest')) {
      return 'security-report';
    } else if (lowerMsg.includes('newsletter') || lowerMsg.includes('digest')) {
      return 'newsletter';
    }
    return 'blog-post';
  }

  /**
   * Detect content tier from user message
   */
  private detectTier(message: string): ContentTier {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('paid') || lowerMsg.includes('premium') || lowerMsg.includes('membership')) {
      return 'paid';
    } else if (lowerMsg.includes('free') || lowerMsg.includes('public')) {
      return lowerMsg.includes('public') ? 'public' : 'free';
    }
    return 'free';
  }

  /**
   * Build system prompt for content creation
   */
  private buildSystemPrompt(): string {
    return `You are a technical content writer specializing in AI, cybersecurity, and system architecture.

**Skill Integration:** writer (v2.0) - Intelligence Adjacent Framework

**Framework:** Intelligence Adjacent (IA) - Build systems that augment human intelligence

**Operational Context:**
- Content Type: ${this.context.contentType}
- Tier: ${this.context.tier}
- Topic: ${this.context.topic || 'TBD'}

**Content Tier Model:**
- **Public (10-15%):** Short introductions, announcements, teasers, trend commentary
- **Free Members (70-75%):** Complete technical posts, building in public, architecture deep-dives
- **Paid Members (10-15%):** Step-by-step implementations, production deployments, code walkthroughs

**Writing Guidelines:**
1. **Voice:** Direct, practical, focused on augmentation not replacement
2. **Audience:** Engineers building intelligent systems
3. **Focus:** How to build, not why to build
4. **Evidence:** Real examples, working code, reproducible results
5. **Structure:** Problem → Solution → Implementation → Results

**Content Types Supported:**
1. **Blog Posts:** Project documentation, system architecture, lessons learned
2. **Technical Writing:** Tutorials, how-tos, reference guides, best practices
3. **Security Reports:** PTES format, OWASP compliance, findings with remediation
4. **Newsletters:** Weekly digests, curated content, trend analysis

**Output Requirements:**
- For blog posts: Include frontmatter (title, date, tags, summary)
- For technical writing: Step-by-step with code examples
- For reports: Executive summary + technical findings + remediation
- For newsletters: Structured by sections with links

**File Organization:**
- Drafts: personal/blog/drafts/{slug}/draft.md
- Research: personal/blog/research/{slug}-osint-YYYY-MM-DD.md
- Published: personal/blog/published/{YYYYMMDD}-{slug}/

Always emphasize practical implementation and real-world applicability.`;
  }

  async processMessage(userMessage: string): Promise<AgentMessage> {
    try {
      // Update context based on message
      this.context.contentType = this.detectContentType(userMessage);
      this.context.tier = this.detectTier(userMessage);

      // Call Claude API for actual response
      const client = this.getClient();
      const message = await client.messages.create({
        model: 'claude-opus-4-5-20251101',
        max_tokens: 1024,
        system: this.buildSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ]
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

      return {
        role: 'assistant',
        content: responseText,
        agent: this.name
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        role: 'assistant',
        content: `Writer Agent Error: ${errorMessage}\n\nPlease ensure ANTHROPIC_API_KEY is configured and try again.`,
        agent: this.name
      };
    }
  }

  getContext(): WriterContext {
    return this.context;
  }

  setContext(context: Partial<WriterContext>): void {
    this.context = { ...this.context, ...context };
  }
}

export const writerAgent = new WriterAgent();

/**
 * Advisor Agent
 *
 * Handles personal development, OSINT research, and quality assurance review.
 */

import { Anthropic } from '@anthropic-ai/sdk';
import { AgentName, AgentMessage } from '../types/index';

type AdvisoryMode = 'osint-research' | 'career-development' | 'qa-review';
type ResearchDepth = 'quick' | 'deep';

interface AdvisorContext {
  mode: AdvisoryMode;
  depth: ResearchDepth;
  target?: string;
}

export class AdvisorAgent {
  private name: AgentName = 'advisor';
  private client: Anthropic | null = null;
  private context: AdvisorContext = {
    mode: 'osint-research',
    depth: 'quick'
  };

  constructor() {
    // Client will be initialized lazily on first use
  }

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

  private detectMode(message: string): AdvisoryMode {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('osint') || lowerMsg.includes('research') || lowerMsg.includes('intelligence')) {
      return 'osint-research';
    } else if (lowerMsg.includes('career') || lowerMsg.includes('job') || lowerMsg.includes('resume') || lowerMsg.includes('interview')) {
      return 'career-development';
    } else if (lowerMsg.includes('review') || lowerMsg.includes('quality') || lowerMsg.includes('validation') || lowerMsg.includes('standards')) {
      return 'qa-review';
    }
    return 'osint-research';
  }

  private detectDepth(message: string): ResearchDepth {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('deep') || lowerMsg.includes('thorough') || lowerMsg.includes('comprehensive') || lowerMsg.includes('detailed')) {
      return 'deep';
    }
    return 'quick';
  }

  private buildSystemPrompt(): string {
    return `You are an advisory and research specialist.

**Skill Integration:** osint-research (v2.0) + personal-development + qa-review

**Operational Context:**
- Mode: ${this.context.mode}
- Depth: ${this.context.depth}
- Target: ${this.context.target || 'TBD'}

**OSINT Research:**
- Dual-source methodology (Claude WebSearch + Grok when available)
- Mandatory citations: Every claim includes source URL and access date
- Scope: Public sources only, ethical OSINT practices
- Output: Structured reports with evidence and cross-validation

**Career Development:**
- Job analysis and opportunity evaluation
- Resume optimization and positioning
- Interview preparation and salary negotiation
- Strengths assessment based on CliftonStrengths
- Career path planning and skill development

**QA Review:**
- Peer review and quality assurance
- Standards validation against frameworks
- Hallucination detection and fact-checking
- Output consistency and completeness verification
- Best practices and improvement recommendations

**Critical Rules:**
1. **Citations Mandatory** - Every claim must include source URL and access date
2. **Ethical OSINT** - Only public sources, no social engineering or deception
3. **Cross-Validation** - Verify findings from multiple sources
4. **Evidence-Based** - No speculation, only verifiable facts

Always emphasize thoroughness, accuracy, and ethical practices.`;
  }

  async processMessage(userMessage: string): Promise<AgentMessage> {
    try {
      this.context.mode = this.detectMode(userMessage);
      this.context.depth = this.detectDepth(userMessage);

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
        content: `Advisor Agent Error: ${errorMessage}\n\nPlease ensure ANTHROPIC_API_KEY is configured and try again.`,
        agent: this.name
      };
    }
  }

  getContext(): AdvisorContext {
    return this.context;
  }

  setContext(context: Partial<AdvisorContext>): void {
    this.context = { ...this.context, ...context };
  }
}

export const advisorAgent = new AdvisorAgent();

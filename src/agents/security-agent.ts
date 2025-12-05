/**
 * Security Agent
 *
 * Handles penetration testing, vulnerability assessment, security advisory, and code review.
 * Integrates with security-testing skill and supports three testing modes:
 * - Penetration Testing (exploitation)
 * - Vulnerability Scanning (detection only)
 * - Network Segmentation Testing
 *
 * Uses OpenRouter/Anthropic for model selection optimization.
 */

import { createModelClient, ModelClient } from '../clients/model-client';
import { AgentName, EngagementPhase, AgentMessage } from '../types/index';

type SecurityTestingMode = 'penetration-testing' | 'vulnerability-scanning' | 'network-segmentation';
type EngagementMode = 'director' | 'mentor' | 'demo';

interface SecurityContext {
  mode: SecurityTestingMode;
  engagementMode: EngagementMode;
  scope?: string;
  targetType?: string;
  methodology?: string;
}

export class SecurityAgent {
  private name: AgentName = 'security';
  private currentPhase: EngagementPhase = 'explore';
  private modelClient: ModelClient;
  private context: SecurityContext = {
    mode: 'vulnerability-scanning',
    engagementMode: 'director'
  };

  constructor() {
    // Initialize model client with agent-specific configuration
    this.modelClient = createModelClient('security');
  }

  /**
   * Detects the testing mode from user message
   */
  private detectMode(message: string): SecurityTestingMode {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('pentest') || lowerMsg.includes('exploitation') || lowerMsg.includes('exploit')) {
      return 'penetration-testing';
    } else if (lowerMsg.includes('segmentation') || lowerMsg.includes('isolation') || lowerMsg.includes('network')) {
      return 'network-segmentation';
    }
    return 'vulnerability-scanning';
  }

  /**
   * Detects engagement mode from user message
   */
  private detectEngagementMode(message: string): EngagementMode {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('mentor') || lowerMsg.includes('learn')) {
      return 'mentor';
    } else if (lowerMsg.includes('demo') || lowerMsg.includes('test')) {
      return 'demo';
    }
    return 'director';
  }

  /**
   * Build system prompt for security testing
   */
  private buildSystemPrompt(): string {
    return `You are a security testing specialist agent.

**Skill Integration:** security-testing (v3.1)

**Operational Context:**
- Testing Mode: ${this.context.mode}
- Engagement Mode: ${this.context.engagementMode}
- Current Phase: ${this.currentPhase}

**Core Principles:**
1. EXPLORE-PLAN-CODE-COMMIT workflow enforced
2. Authorization required before any testing
3. Scope verification mandatory
4. Close-loop approach: Find AND fix (self-hosted) or Report (bug bounty)
5. Evidence-based findings only, no fabrication

**Available Methodologies:**
- Network (MITRE ATT&CK + NIST SP 800-115)
- Web/API (OWASP Top 10 + ASVS + WSTG)
- Mobile (OWASP MASTG + MASVS)
- Web3 (DeFiHackLabs + Immunefi)
- AI/LLM (MITRE ATLAS + OWASP LLM Top 10)
- Cloud (CIS Benchmarks - AWS, GCP, Azure)
- Active Directory (AD Assessment Framework)

**Server Coordination:**
Available servers: kali-pentest, metasploit, ai-security, cloud-security, mobile-security, ad-security

**Response Format:**
For EXPLORE phase: Ask clarifying questions about scope and target
For PLAN phase: Generate test plan with tools and timeline
For CODE phase: Coordinate with servers to execute tests
For COMMIT phase: Document findings with remediation guidance

Always emphasize scope compliance and authorization verification.`;
  }

  async processMessage(userMessage: string): Promise<AgentMessage> {
    try {
      // Update context based on message
      this.context.mode = this.detectMode(userMessage);
      this.context.engagementMode = this.detectEngagementMode(userMessage);

      // Call model API for actual response
      const response = await this.modelClient.generateCompletion(
        this.buildSystemPrompt(),
        userMessage,
        1024
      );

      return {
        role: 'assistant',
        content: response.content,
        agent: this.name
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        role: 'assistant',
        content: `Security Agent Error: ${errorMessage}\n\nPlease ensure OPENROUTER_API_KEY or ANTHROPIC_API_KEY is configured.`,
        agent: this.name
      };
    }
  }

  getPhase(): EngagementPhase {
    return this.currentPhase;
  }

  setPhase(phase: EngagementPhase): void {
    this.currentPhase = phase;
  }

  getContext(): SecurityContext {
    return this.context;
  }

  setContext(context: Partial<SecurityContext>): void {
    this.context = { ...this.context, ...context };
  }
}

export const securityAgent = new SecurityAgent();

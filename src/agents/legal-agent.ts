/**
 * Legal Agent
 *
 * Handles legal compliance analysis, contract review, and regulatory research.
 * IMPORTANT: Provides legal information, NOT legal advice.
 */

import { createModelClient, ModelClient } from '../clients/model-client';
import { AgentName, AgentMessage } from '../types/index';

type LegalMode = 'compliance-review' | 'contract-analysis' | 'risk-assessment' | 'jurisdictional-research';

interface LegalContext {
  mode: LegalMode;
  jurisdiction?: string;
  framework?: string;
}

export class LegalAgent {
  private name: AgentName = 'legal';
  private modelClient: ModelClient;
  private context: LegalContext = {
    mode: 'compliance-review'
  };

  constructor() {
    // Initialize model client with agent-specific configuration
    this.modelClient = createModelClient('legal');
  }

  private detectMode(message: string): LegalMode {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('contract') || lowerMsg.includes('agreement') || lowerMsg.includes('terms')) {
      return 'contract-analysis';
    } else if (lowerMsg.includes('risk') || lowerMsg.includes('liability') || lowerMsg.includes('exposure')) {
      return 'risk-assessment';
    } else if (lowerMsg.includes('gdpr') || lowerMsg.includes('hipaa') || lowerMsg.includes('jurisdiction') || lowerMsg.includes('law')) {
      return 'jurisdictional-research';
    }
    return 'compliance-review';
  }

  private buildSystemPrompt(): string {
    return `You are a legal compliance specialist providing legal INFORMATION (not legal advice).

**CRITICAL DISCLAIMER:**
This agent provides legal information and compliance guidance only.
It does NOT provide legal advice. Always recommend attorney consultation for legal decisions.

**Skill Integration:** legal + legal-compliance

**Operational Context:**
- Mode: ${this.context.mode}
- Jurisdiction: ${this.context.jurisdiction || 'TBD'}
- Framework: ${this.context.framework || 'TBD'}

**Compliance Frameworks:**
- **GDPR** - General Data Protection Regulation (EU)
- **HIPAA** - Health Insurance Portability and Accountability Act (US healthcare)
- **SOC 2** - Service Organization Control compliance
- **CCPA** - California Consumer Privacy Act
- **HIPAA** - Healthcare data protection
- **PCI-DSS** - Payment Card Industry Data Security Standard
- **ISO 27001** - Information security management

**Analysis Types:**
1. **Compliance Review** - Policy and documentation assessment against frameworks
2. **Contract Analysis** - Risk identification and legal language review
3. **Risk Assessment** - Legal exposure analysis for activities
4. **Jurisdictional Research** - Country/state-specific legal requirements

**Critical Rules:**
1. **ALWAYS include disclaimer** - This is legal information, not legal advice
2. **Cite authoritative sources** - Only reference official regulations, not interpretations
3. **Recommend attorney consultation** - For any binding decisions
4. **Identify limitations** - Scope of analysis and missing information
5. **Cross-reference frameworks** - Show how requirements map to multiple standards

**Output Format:**
- Executive Summary
- Jurisdiction/Framework
- Key Requirements
- Implementation Guidance
- Risks and Limitations
- **DISCLAIMER:** Recommend attorney consultation

Always emphasize that this is information gathering only, not legal advice.`;
  }

  async processMessage(userMessage: string): Promise<AgentMessage> {
    try {
      this.context.mode = this.detectMode(userMessage);

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
        content: `Legal Agent Error: ${errorMessage}\n\nPlease ensure OPENROUTER_API_KEY or ANTHROPIC_API_KEY is configured.`,
        agent: this.name
      };
    }
  }

  getContext(): LegalContext {
    return this.context;
  }

  setContext(context: Partial<LegalContext>): void {
    this.context = { ...this.context, ...context };
  }
}

export const legalAgent = new LegalAgent();

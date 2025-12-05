/**
 * Router Agent
 *
 * Intercepts user messages and routes them to the appropriate specialized agent
 * based on keyword matching and context analysis.
 */

import { AgentName, RoutingRule, RoutingDecision, AgentMessage } from '../types/index';

export class RouterAgent {
  private routingRules: RoutingRule[] = [
    {
      keywords: [
        'pentest',
        'penetration test',
        'penetration testing',
        'hackerone',
        'bug bounty',
        'vulnerability',
        'security test',
        'security assessment',
        'red team',
        'exploitation',
        'scanner',
        'nmap',
        'burp',
        'cve',
        'exploit'
      ],
      agent: 'security'
    },
    {
      keywords: [
        'blog',
        'write',
        'post',
        'article',
        'content',
        'ghost',
        'cms',
        'newsletter',
        'documentation',
        'technical writing',
        'tutorial',
        'guide',
        'how-to'
      ],
      agent: 'writer'
    },
    {
      keywords: [
        'research',
        'investigate',
        'osint',
        'intelligence',
        'find',
        'search',
        'analyze data',
        'job analysis',
        'job posting',
        'career',
        'resume',
        'strengths',
        'cliftonstrengths'
      ],
      agent: 'advisor'
    },
    {
      keywords: [
        'legal',
        'compliance',
        'gdpr',
        'contract',
        'license',
        'law',
        'regulation',
        'privacy',
        'tos',
        'terms'
      ],
      agent: 'legal'
    }
  ];

  /**
   * Route a user message to the appropriate agent
   */
  public route(message: string): RoutingDecision | null {
    const lowerMessage = message.toLowerCase();

    // Score each agent based on keyword matches
    const scores: Record<AgentName, { score: number; matchedKeywords: string[] }> = {
      security: { score: 0, matchedKeywords: [] },
      writer: { score: 0, matchedKeywords: [] },
      advisor: { score: 0, matchedKeywords: [] },
      legal: { score: 0, matchedKeywords: [] },
      director: { score: 0, matchedKeywords: [] }
    };

    // Check each routing rule
    for (const rule of this.routingRules) {
      for (const keyword of rule.keywords) {
        if (lowerMessage.includes(keyword)) {
          scores[rule.agent].score += 10;
          scores[rule.agent].matchedKeywords.push(keyword);
        }
      }
    }

    // Find agent with highest score
    let bestAgent: AgentName | null = null;
    let bestScore = 0;

    for (const [agent, data] of Object.entries(scores)) {
      if (data.score > bestScore) {
        bestScore = data.score;
        bestAgent = agent as AgentName;
      }
    }

    if (bestAgent && bestScore > 0) {
      const confidence = Math.min(bestScore / 100, 1.0); // Normalize to 0-1
      const reason = `Matched keywords: ${scores[bestAgent].matchedKeywords.slice(0, 3).join(', ')}`;

      return {
        agent: bestAgent,
        confidence,
        reason
      };
    }

    return null;
  }

  /**
   * Process a user message and return response
   */
  public async processMessage(userMessage: string): Promise<AgentMessage> {
    const routing = this.route(userMessage);

    if (!routing) {
      return {
        role: 'assistant',
        agent: 'director',
        content: `I need more context to help you. What would you like help with?

**I can assist with:**
- **Security:** Penetration testing, bug bounties, vulnerability assessment
- **Writing:** Blog posts, documentation, technical content, newsletters
- **Research:** OSINT, job analysis, career guidance, data analysis
- **Legal:** Compliance review, contract analysis, privacy guidance

Please describe what you need, and I'll route you to the right specialist.`
      };
    }

    // In actual implementation, this would dispatch to the appropriate agent
    // For now, we return a routing confirmation
    return {
      role: 'assistant',
      agent: routing.agent,
      content: `I'm routing you to the ${routing.agent} agent.

**Routing Details:**
- Agent: ${routing.agent}
- Confidence: ${(routing.confidence * 100).toFixed(0)}%
- Reason: ${routing.reason}

Processing your request...`
    };
  }

  /**
   * Get all available routing rules
   */
  public getRules(): RoutingRule[] {
    return this.routingRules;
  }

  /**
   * Get agents that match a query (for debugging/testing)
   */
  public testRoute(message: string): { agent: AgentName; score: number; matched: string[] }[] {
    const lowerMessage = message.toLowerCase();
    const results: { agent: AgentName; score: number; matched: string[] }[] = [];

    for (const rule of this.routingRules) {
      const matched: string[] = [];
      let score = 0;

      for (const keyword of rule.keywords) {
        if (lowerMessage.includes(keyword)) {
          matched.push(keyword);
          score += 10;
        }
      }

      if (matched.length > 0) {
        results.push({
          agent: rule.agent,
          score,
          matched
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }
}

// Export singleton instance
export const router = new RouterAgent();

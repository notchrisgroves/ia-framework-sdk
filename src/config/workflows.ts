/**
 * Skill Workflows - Phase-to-Model Mappings
 *
 * Defines which models should be used for each phase of each skill's workflow.
 * Models are selected dynamically from OpenRouter based on capability requirements.
 *
 * Format: skill -> phase -> primary model + optional comparison model
 */

export interface ModelSelector {
  capability: string;        // Text which capability to search for (e.g., "reasoning", "vision")
  preference?: string;       // Preferred provider (e.g., "anthropic", "x-ai")
  minContextLength?: number; // Minimum context window required
  reasoningEnabled?: boolean; // Does this phase need extended reasoning?
}

export interface WorkflowPhase {
  primaryModel: ModelSelector;
  compareModel?: ModelSelector;
  decisionCriteria?: {
    condition: string;  // e.g., "confidence < 0.7" or "complexity > medium"
    action: string;     // e.g., "compare-with-opus"
  };
  description: string;
}

export interface SkillWorkflow {
  name: string;
  description: string;
  modelPreference: string;    // e.g., "sonnet-grok-dual"
  phases: Record<string, WorkflowPhase>;
}

/**
 * WORKFLOWS REGISTRY
 *
 * Each skill defines its phases and which models should be used.
 * Models are selected by CAPABILITY, not hardcoded ID.
 */
export const SKILL_WORKFLOWS: Record<string, SkillWorkflow> = {
  // Writer Skill: Blog post creation with QA loop
  'writer': {
    name: 'writer',
    description: 'Content creation for Intelligence Adjacent blog posts',
    modelPreference: 'sonnet-grok-dual-with-qa',
    phases: {
      'research': {
        primaryModel: {
          capability: 'text-understanding',
          preference: 'anthropic',
          minContextLength: 100000
        },
        description: 'Gather system context from documentation'
      },
      'writing': {
        primaryModel: {
          capability: 'text-generation',
          preference: 'anthropic',
        },
        description: 'Create detailed blog post draft'
      },
      'qa-review': {
        primaryModel: {
          capability: 'text-reasoning',
          preference: 'x-ai',  // Grok for alternative perspective QA
        },
        description: 'QA review for technical accuracy'
      },
      'tier-assignment': {
        primaryModel: {
          capability: 'text-classification',
          preference: 'anthropic',
        },
        description: 'Classify content tier (public/members/paid)'
      },
      'compare-quality': {
        primaryModel: {
          capability: 'text-generation',
          preference: 'anthropic',
          reasoningEnabled: true
        },
        compareModel: {
          capability: 'text-generation',
          preference: 'anthropic',
          reasoningEnabled: true
        },
        decisionCriteria: {
          condition: 'sonnet-confidence < 0.85',
          action: 'compare-with-opus'
        },
        description: 'Optional: Compare Sonnet output with Opus for quality validation'
      }
    }
  },

  // OSINT Research Skill: Multi-source intelligence gathering
  'osint-research': {
    name: 'osint-research',
    description: 'Dual-source OSINT with Claude WebSearch + Grok verification',
    modelPreference: 'sonnet-grok-dual',
    phases: {
      'scope-definition': {
        primaryModel: {
          capability: 'text-understanding',
          preference: 'anthropic',
        },
        description: 'Define research target and objectives'
      },
      'claude-search': {
        primaryModel: {
          capability: 'text-generation-with-search',
          preference: 'anthropic',
          minContextLength: 200000
        },
        description: 'Execute comprehensive WebSearch queries'
      },
      'grok-intel': {
        primaryModel: {
          capability: 'real-time-search',
          preference: 'x-ai',
        },
        description: 'Gather social media and real-time intelligence'
      },
      'cross-validation': {
        primaryModel: {
          capability: 'text-reasoning',
          preference: 'anthropic',
        },
        compareModel: {
          capability: 'text-reasoning',
          preference: 'x-ai',
        },
        decisionCriteria: {
          condition: 'findings-conflict',
          action: 'resolve-with-secondary-source'
        },
        description: 'Compare and validate findings from both sources'
      },
      'synthesis': {
        primaryModel: {
          capability: 'text-reasoning',
          preference: 'anthropic',
        },
        description: 'Consolidate findings into comprehensive report'
      }
    }
  },

  // Security Testing Skill: Penetration testing with cost optimization
  'security-testing': {
    name: 'security-testing',
    description: 'Penetration testing with phase-appropriate model selection',
    modelPreference: 'sonnet-with-opus-fallback',
    phases: {
      'explore': {
        primaryModel: {
          capability: 'text-understanding',
          preference: 'anthropic',  // Sonnet: cheap exploration
        },
        description: 'Understand scope and attack surface'
      },
      'plan': {
        primaryModel: {
          capability: 'text-reasoning',
          preference: 'anthropic',  // Sonnet: cost-effective planning
        },
        description: 'Create test plan from attack surface'
      },
      'code-attempt': {
        primaryModel: {
          capability: 'code-generation',
          preference: 'anthropic',  // Try with Sonnet first
        },
        compareModel: {
          capability: 'code-reasoning',
          preference: 'anthropic',
        },
        decisionCriteria: {
          condition: 'stuck-on-exploit',
          action: 'escalate-to-opus'
        },
        description: 'Execute exploitation: try Sonnet, escalate to Opus if stuck'
      },
      'code-analysis': {
        primaryModel: {
          capability: 'code-reasoning',
          preference: 'anthropic',  // Grok for novel techniques
        },
        compareModel: {
          capability: 'social-analysis',
          preference: 'x-ai',  // Grok for niche/novel security techniques from social
        },
        description: 'Analyze exploitation: use Claude + Grok for novel techniques'
      },
      'commit': {
        primaryModel: {
          capability: 'text-reasoning',
          preference: 'anthropic',  // Opus for final validation
          reasoningEnabled: true
        },
        description: 'Final validation and remediation guidance'
      }
    }
  },

  // Legal Compliance Skill: Regulatory analysis
  'legal-compliance': {
    name: 'legal-compliance',
    description: 'Legal compliance and regulatory research',
    modelPreference: 'opus-only',  // Legal accuracy is critical
    phases: {
      'research': {
        primaryModel: {
          capability: 'text-reasoning',
          preference: 'anthropic',
          reasoningEnabled: true
        },
        description: 'Research applicable regulations'
      },
      'analysis': {
        primaryModel: {
          capability: 'text-reasoning',
          preference: 'anthropic',
          reasoningEnabled: true
        },
        description: 'Analyze compliance requirements'
      },
      'recommendations': {
        primaryModel: {
          capability: 'text-reasoning',
          preference: 'anthropic',
          reasoningEnabled: true
        },
        description: 'Provide compliance guidance with disclaimers'
      }
    }
  }
};

/**
 * ROUTER AGENT CONFIGURATION
 *
 * Maps user keywords to skill → phase combinations
 */
export const ROUTER_KEYWORDS: Record<string, { skill: string; phase?: string }> = {
  // Writer keywords
  'blog': { skill: 'writer', phase: 'writing' },
  'post': { skill: 'writer', phase: 'writing' },
  'article': { skill: 'writer', phase: 'writing' },
  'write': { skill: 'writer', phase: 'writing' },
  'document': { skill: 'writer', phase: 'research' },
  'newsletter': { skill: 'writer', phase: 'writing' },

  // OSINT keywords
  'osint': { skill: 'osint-research', phase: 'scope-definition' },
  'research': { skill: 'osint-research', phase: 'claude-search' },
  'intelligence': { skill: 'osint-research', phase: 'grok-intel' },
  'investigate': { skill: 'osint-research', phase: 'synthesis' },

  // Security keywords
  'pentest': { skill: 'security-testing', phase: 'explore' },
  'penetration': { skill: 'security-testing', phase: 'explore' },
  'vulnerability': { skill: 'security-testing', phase: 'plan' },
  'exploit': { skill: 'security-testing', phase: 'code-attempt' },
  'security': { skill: 'security-testing', phase: 'explore' },
  'audit': { skill: 'security-testing', phase: 'plan' },

  // Legal keywords
  'gdpr': { skill: 'legal-compliance', phase: 'analysis' },
  'compliance': { skill: 'legal-compliance', phase: 'analysis' },
  'legal': { skill: 'legal-compliance', phase: 'research' },
  'contract': { skill: 'legal-compliance', phase: 'analysis' },
  'risk': { skill: 'legal-compliance', phase: 'recommendations' }
};

/**
 * MODEL CAPABILITY MAPPING
 *
 * Maps capability names to actual model characteristics
 * Used by model discovery service to find the right models
 */
export const CAPABILITY_DEFINITIONS: Record<string, {
  description: string;
  features: string[];
}> = {
  'text-generation': {
    description: 'Standard text generation',
    features: ['text-output', 'instruction-following']
  },
  'text-understanding': {
    description: 'Text comprehension and analysis',
    features: ['text-input', 'context-understanding']
  },
  'text-reasoning': {
    description: 'Complex reasoning and analysis',
    features: ['extended-thinking', 'step-by-step-reasoning']
  },
  'text-generation-with-search': {
    description: 'Text generation with web search capability',
    features: ['web-search', 'real-time-data']
  },
  'text-classification': {
    description: 'Text classification and categorization',
    features: ['structured-output', 'classification']
  },
  'code-generation': {
    description: 'Code generation and programming',
    features: ['code-output', 'syntax-correct']
  },
  'code-reasoning': {
    description: 'Complex code analysis and reasoning',
    features: ['code-understanding', 'debugging']
  },
  'real-time-search': {
    description: 'Real-time search and current events',
    features: ['web-search', 'real-time-data', 'social-media']
  },
  'social-analysis': {
    description: 'Social media analysis and sentiment',
    features: ['social-media-data', 'sentiment-analysis']
  },
  'vision': {
    description: 'Image understanding and generation',
    features: ['image-input', 'image-output']
  }
};

/**
 * Get workflow for skill
 */
export function getWorkflow(skill: string): SkillWorkflow | undefined {
  return SKILL_WORKFLOWS[skill];
}

/**
 * Get phase configuration from workflow
 */
export function getPhaseConfig(skill: string, phase: string): WorkflowPhase | undefined {
  const workflow = getWorkflow(skill);
  if (!workflow) return undefined;
  return workflow.phases[phase];
}

/**
 * Resolve keyword to skill and phase
 */
export function resolveKeywordToSkill(keyword: string): { skill: string; phase?: string } | undefined {
  const lower = keyword.toLowerCase();
  return ROUTER_KEYWORDS[lower] || Object.values(ROUTER_KEYWORDS).find(
    r => lower.includes(r.skill.split('-')[0])
  );
}

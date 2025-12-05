/**
 * Model Client - Workflow-Aware Unified API
 *
 * Dynamically selects models based on:
 * 1. Skill workflows (skill → phase → required capability)
 * 2. Available models from OpenRouter (dynamically discovered)
 * 3. Cost optimization and capability matching
 *
 * Supports multi-model orchestration:
 * - Primary model for main work
 * - Comparison models for validation
 * - Fallback chains for robustness
 */

import { modelDiscovery, OpenRouterModel } from '../services/model-discovery';
import { getPhaseConfig, ModelSelector } from '../config/workflows';

type ModelProvider = 'openrouter' | 'anthropic';

interface ModelMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ModelResponse {
  content: string;
  model: string;
  modelId: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    input_tokens?: number;
    output_tokens?: number;
    [key: string]: any;
  };
  capability?: string;
  provider?: ModelProvider;
}

/**
 * Workflow-aware model client
 * Selects models based on skill → phase requirements
 */
export class ModelClient {
  private provider: ModelProvider = 'openrouter';
  private apiKey: string = '';
  private baseUrl = 'https://openrouter.ai/api/v1';

  private agentName?: string;
  private skill?: string;
  private phase?: string;
  private selectedModel?: OpenRouterModel;

  constructor(agentName?: string, skill?: string, phase?: string) {
    this.agentName = agentName;
    this.skill = skill;
    this.phase = phase;
  }

  /**
   * Initialize provider and API key (lazy initialization)
   */
  private async initializeProvider(): Promise<void> {
    if (this.apiKey) return; // Already initialized

    if (process.env.OPENROUTER_API_KEY) {
      this.provider = 'openrouter';
      this.apiKey = process.env.OPENROUTER_API_KEY;
      modelDiscovery.setApiKey(this.apiKey);
    } else if (process.env.ANTHROPIC_API_KEY) {
      this.provider = 'anthropic';
      this.apiKey = process.env.ANTHROPIC_API_KEY;
    } else {
      throw new Error('Neither OPENROUTER_API_KEY nor ANTHROPIC_API_KEY configured. Please set one in your .env file.');
    }
  }

  /**
   * Select model based on workflow requirements
   */
  private async selectModel(): Promise<OpenRouterModel> {
    if (this.selectedModel) {
      return this.selectedModel;
    }

    // If skill and phase provided, use workflow-based selection
    if (this.skill && this.phase) {
      const phaseConfig = getPhaseConfig(this.skill, this.phase);
      if (phaseConfig) {
        const model = await modelDiscovery.findModel(phaseConfig.primaryModel);
        if (model) {
          this.selectedModel = model;
          return model;
        }
      }
    }

    // Fallback: use agent-based selection for backward compatibility
    const fallbackModel = await this.selectModelByAgent();
    if (fallbackModel) {
      this.selectedModel = fallbackModel;
      return fallbackModel;
    }

    throw new Error('No suitable model found');
  }

  /**
   * Select model by agent name (backward compatibility)
   */
  private async selectModelByAgent(): Promise<OpenRouterModel | null> {
    if (!this.agentName) return null;

    const requirements = this.getAgentRequirements(this.agentName);
    if (!requirements) return null;

    return modelDiscovery.findModel(requirements);
  }

  /**
   * Get capability requirements by agent type
   */
  private getAgentRequirements(agent: string): ModelSelector | null {
    switch (agent) {
      case 'router':
        return { capability: 'text-generation' };
      case 'security':
        return { capability: 'text-reasoning', preference: 'anthropic' };
      case 'writer':
        return { capability: 'text-generation', preference: 'anthropic' };
      case 'advisor':
        return { capability: 'real-time-search', preference: 'x-ai' };
      case 'legal':
        return { capability: 'text-reasoning', preference: 'anthropic' };
      default:
        return { capability: 'text-reasoning', preference: 'anthropic' };
    }
  }

  /**
   * Call OpenRouter API
   */
  private async callOpenRouter(
    model: OpenRouterModel,
    messages: ModelMessage[],
    systemPrompt: string,
    maxTokens: number
  ): Promise<ModelResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/notchrisgroves/ia-framework-sdk',
        'X-Title': 'IA Framework Agent SDK'
      },
      body: JSON.stringify({
        model: model.id,
        messages: [
          {
            role: 'user',
            content: systemPrompt + '\n\n---\n\nUser: ' + messages[messages.length - 1].content
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${error}`);
    }

    const data = await response.json() as any;

    return {
      content: data.choices[0].message.content,
      model: model.name,
      modelId: model.id,
      provider: 'openrouter',
      capability: this.phase,
      usage: data.usage
    };
  }

  /**
   * Call Anthropic API as fallback
   */
  private async callAnthropic(
    messages: ModelMessage[],
    systemPrompt: string,
    maxTokens: number
  ): Promise<ModelResponse> {
    const { Anthropic } = await import('@anthropic-ai/sdk');

    const client = new Anthropic({
      apiKey: this.apiKey
    });

    const response = await client.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    });

    return {
      content: response.content[0].type === 'text' ? response.content[0].text : '',
      model: response.model,
      modelId: response.model,
      provider: 'anthropic',
      usage: response.usage
    };
  }

  /**
   * Generate a completion from the model
   *
   * @param systemPrompt - System prompt for the model
   * @param userMessage - User message
   * @param maxTokens - Max tokens in response (default 1024)
   */
  async generateCompletion(
    systemPrompt: string,
    userMessage: string,
    maxTokens: number = 1024
  ): Promise<ModelResponse> {
    // Initialize on first use
    await this.initializeProvider();

    const messages: ModelMessage[] = [
      {
        role: 'user',
        content: userMessage
      }
    ];

    try {
      if (this.provider === 'openrouter') {
        const model = await this.selectModel();
        return await this.callOpenRouter(model, messages, systemPrompt, maxTokens);
      } else {
        return await this.callAnthropic(messages, systemPrompt, maxTokens);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Model API error (${this.provider}): ${errorMessage}`);
    }
  }

  /**
   * Compare two models for quality assessment
   * Returns results from both models for comparison
   */
  async compareModels(
    primaryCapability: ModelSelector,
    compareCapability: ModelSelector,
    systemPrompt: string,
    userMessage: string,
    maxTokens: number = 1024
  ): Promise<{ primary: ModelResponse; comparison: ModelResponse }> {
    await this.initializeProvider();

    if (this.provider !== 'openrouter') {
      throw new Error('Model comparison only supported with OpenRouter');
    }

    // Get both models
    const primaryModel = await modelDiscovery.findModel(primaryCapability);
    const compareModel = await modelDiscovery.findModel(compareCapability);

    if (!primaryModel || !compareModel) {
      throw new Error('Could not find models for comparison');
    }

    const messages: ModelMessage[] = [
      {
        role: 'user',
        content: userMessage
      }
    ];

    const [primaryResponse, comparisonResponse] = await Promise.all([
      this.callOpenRouter(primaryModel, messages, systemPrompt, maxTokens),
      this.callOpenRouter(compareModel, messages, systemPrompt, maxTokens)
    ]);

    return { primary: primaryResponse, comparison: comparisonResponse };
  }

  /**
   * Set workflow context (skill + phase)
   */
  setWorkflow(skill: string, phase: string): void {
    this.skill = skill;
    this.phase = phase;
    this.selectedModel = undefined; // Clear cached model
  }

  /**
   * Get information about selected model
   */
  async getInfo(): Promise<{
    provider: ModelProvider;
    model: string;
    modelId: string;
    skill?: string;
    phase?: string;
    agent?: string;
  }> {
    const model = await this.selectModel();
    return {
      provider: this.provider,
      model: model.name,
      modelId: model.id,
      skill: this.skill,
      phase: this.phase,
      agent: this.agentName
    };
  }
}

/**
 * Create model client with agent configuration
 */
export function createModelClient(agentName: string, skill?: string, phase?: string): ModelClient {
  return new ModelClient(agentName, skill, phase);
}

export type { ModelResponse, OpenRouterModel };

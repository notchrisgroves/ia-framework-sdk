/**
 * Model Client - Unified API for Claude, Grok, Perplexity, and other models
 *
 * Abstracts OpenRouter API to support model selection by agent type.
 * Falls back to Anthropic SDK if OpenRouter key not configured.
 */

type ModelProvider = 'openrouter' | 'anthropic';

interface ModelMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ModelResponse {
  content: string;
  model: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    input_tokens?: number;
    output_tokens?: number;
    [key: string]: any;
  };
}

/**
 * Model assignments by agent type
 * Selects best model for each agent's specific needs
 */
const AGENT_MODELS: Record<string, string> = {
  'router': 'meta-llama/llama-3-8b-instruct',    // Fast, cheap routing
  'security': 'anthropic/claude-opus-4-5',       // Complex analysis, security focus
  'writer': 'anthropic/claude-opus-4-5',         // Quality content generation
  'advisor': 'grok-vision',                      // Research + vision for OSINT
  'legal': 'anthropic/claude-opus-4-5',          // Legal accuracy critical
  'default': 'anthropic/claude-opus-4-5'
};

export class ModelClient {
  private provider: ModelProvider;
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  private agentName?: string;

  constructor(agentName?: string) {
    // Store agent name for model selection
    this.agentName = agentName;
    // Don't initialize provider/apiKey yet - do it lazily when first used
    this.provider = 'openrouter'; // Default
    this.apiKey = '';
  }

  /**
   * Initialize provider and API key (lazy initialization)
   */
  private initializeProvider(): void {
    if (this.apiKey) return; // Already initialized

    if (process.env.OPENROUTER_API_KEY) {
      this.provider = 'openrouter';
      this.apiKey = process.env.OPENROUTER_API_KEY;
    } else if (process.env.ANTHROPIC_API_KEY) {
      this.provider = 'anthropic';
      this.apiKey = process.env.ANTHROPIC_API_KEY;
    } else {
      throw new Error('Neither OPENROUTER_API_KEY nor ANTHROPIC_API_KEY configured. Please set one in your .env file.');
    }
  }

  /**
   * Get the appropriate model for this agent
   */
  private getModel(): string {
    if (this.provider === 'anthropic') {
      return 'claude-opus-4-5-20251101';
    }
    return this.agentName && AGENT_MODELS[this.agentName]
      ? AGENT_MODELS[this.agentName]
      : AGENT_MODELS['default'];
  }

  /**
   * Call OpenRouter API
   */
  private async callOpenRouter(
    model: string,
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
        model,
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
      model: data.model,
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
      usage: response.usage
    };
  }

  /**
   * Generate a completion from the model
   */
  async generateCompletion(
    systemPrompt: string,
    userMessage: string,
    maxTokens: number = 1024
  ): Promise<ModelResponse> {
    // Initialize provider and API key on first use
    this.initializeProvider();

    const messages: ModelMessage[] = [
      {
        role: 'user',
        content: userMessage
      }
    ];

    try {
      if (this.provider === 'openrouter') {
        const model = this.getModel();
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
   * Get information about which provider and model is being used
   */
  getInfo() {
    return {
      provider: this.provider,
      model: this.getModel(),
      agent: this.agentName
    };
  }
}

/**
 * Get model client with agent-specific configuration
 */
export function createModelClient(agentName: string): ModelClient {
  return new ModelClient(agentName);
}

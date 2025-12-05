/**
 * Model Discovery Service
 *
 * Dynamically fetches available models from OpenRouter API.
 * Caches results for 1 hour to avoid excessive API calls.
 * Filters models by capability requirements.
 */

interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  architecture: {
    modality: string;
    input_modalities: string[];
    output_modalities: string[];
  };
  supported_parameters: string[];
}

interface CachedModels {
  models: Map<string, OpenRouterModel>;
  timestamp: number;
  ttl: number; // milliseconds
}

class ModelDiscoveryService {
  private cache: CachedModels = {
    models: new Map(),
    timestamp: 0,
    ttl: 60 * 60 * 1000 // 1 hour
  };

  private apiKey: string = '';
  private baseUrl = 'https://openrouter.ai/api/v1';

  /**
   * Initialize with API key
   */
  setApiKey(key: string): void {
    this.apiKey = key;
  }

  /**
   * Fetch all available models from OpenRouter
   */
  async fetchAvailableModels(): Promise<Map<string, OpenRouterModel>> {
    // Check cache first
    if (this.isCacheValid()) {
      return this.cache.models;
    }

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json() as { data: OpenRouterModel[] };
      const models = new Map<string, OpenRouterModel>();

      for (const model of data.data) {
        models.set(model.id, model);
      }

      // Update cache
      this.cache = {
        models,
        timestamp: Date.now(),
        ttl: 60 * 60 * 1000
      };

      return models;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch models from OpenRouter: ${errorMessage}`);
    }
  }

  /**
   * Find best model matching capability requirements
   */
  async findModel(requirements: {
    capability: string;
    preference?: string;
    minContextLength?: number;
  }): Promise<OpenRouterModel | null> {
    const models = await this.fetchAvailableModels();
    const candidates: OpenRouterModel[] = [];

    for (const model of models.values()) {
      // Filter by capability
      if (!this.matchesCapability(model, requirements.capability)) {
        continue;
      }

      // Filter by context length
      if (requirements.minContextLength && model.context_length < requirements.minContextLength) {
        continue;
      }

      // Filter by provider preference
      if (requirements.preference && !model.id.startsWith(requirements.preference)) {
        continue;
      }

      candidates.push(model);
    }

    // Sort by cost (lower is better) and return best match
    if (candidates.length === 0) {
      return null;
    }

    candidates.sort((a, b) => {
      const costA = parseFloat(a.pricing.prompt) + parseFloat(a.pricing.completion);
      const costB = parseFloat(b.pricing.prompt) + parseFloat(b.pricing.completion);
      return costA - costB;
    });

    return candidates[0];
  }

  /**
   * Find multiple models for comparison
   */
  async findModelComparison(requirements: {
    capability: string;
    preference?: string;
  }): Promise<OpenRouterModel[]> {
    const models = await this.fetchAvailableModels();
    const candidates: OpenRouterModel[] = [];

    for (const model of models.values()) {
      if (!this.matchesCapability(model, requirements.capability)) {
        continue;
      }

      if (requirements.preference && !model.id.startsWith(requirements.preference)) {
        continue;
      }

      candidates.push(model);
    }

    return candidates;
  }

  /**
   * Check if model matches capability requirement
   */
  private matchesCapability(model: OpenRouterModel, capability: string): boolean {
    const modelId = model.id.toLowerCase();
    const modelName = model.name.toLowerCase();
    const modelDesc = model.description.toLowerCase();

    switch (capability) {
      case 'text-generation':
        return model.architecture.output_modalities.includes('text');

      case 'text-understanding':
        return model.architecture.input_modalities.includes('text');

      case 'text-reasoning':
        return (
          modelId.includes('opus') ||
          modelId.includes('sonnet') ||
          modelId.includes('deepseek') ||
          modelDesc.includes('reasoning') ||
          modelDesc.includes('advanced reasoning')
        );

      case 'text-generation-with-search':
        return (
          modelId.includes('claude') &&
          (modelDesc.includes('search') || modelName.includes('websearch'))
        );

      case 'text-classification':
        return (
          modelId.includes('claude') ||
          modelId.includes('mistral')
        );

      case 'code-generation':
        return (
          modelDesc.includes('code') ||
          modelDesc.includes('programming') ||
          modelId.includes('grok') ||
          modelId.includes('claude')
        );

      case 'code-reasoning':
        return (
          modelDesc.includes('code reasoning') ||
          modelDesc.includes('debugging') ||
          modelId.includes('opus') ||
          modelId.includes('grok')
        );

      case 'real-time-search':
        return (
          modelId.includes('grok') ||
          modelId.includes('sonar') ||
          modelDesc.includes('real-time')
        );

      case 'social-analysis':
        return (
          modelId.includes('grok') &&
          modelDesc.includes('X/Twitter')
        );

      case 'vision':
        return model.architecture.input_modalities.includes('image');

      default:
        return false;
    }
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(): boolean {
    if (this.cache.models.size === 0) {
      return false;
    }

    const age = Date.now() - this.cache.timestamp;
    return age < this.cache.ttl;
  }

  /**
   * Get model info by ID
   */
  async getModelInfo(modelId: string): Promise<OpenRouterModel | null> {
    const models = await this.fetchAvailableModels();
    return models.get(modelId) || null;
  }

  /**
   * List all available models grouped by provider
   */
  async listByProvider(): Promise<Record<string, OpenRouterModel[]>> {
    const models = await this.fetchAvailableModels();
    const grouped: Record<string, OpenRouterModel[]> = {};

    for (const model of models.values()) {
      const provider = model.id.split('/')[0];
      if (!grouped[provider]) {
        grouped[provider] = [];
      }
      grouped[provider].push(model);
    }

    return grouped;
  }

  /**
   * Clear cache (for testing or manual refresh)
   */
  clearCache(): void {
    this.cache.models.clear();
    this.cache.timestamp = 0;
  }

  /**
   * Get cache age in milliseconds
   */
  getCacheAge(): number {
    return Date.now() - this.cache.timestamp;
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.models.size;
  }
}

// Export singleton instance
export const modelDiscovery = new ModelDiscoveryService();

export type { OpenRouterModel };

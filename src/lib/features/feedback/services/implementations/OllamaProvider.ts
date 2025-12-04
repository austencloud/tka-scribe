/**
 * OllamaProvider
 *
 * AI provider implementation for local Ollama models.
 * Connects to a local Ollama instance for feedback analysis.
 */

import { injectable } from "inversify";
import type {
  IAIProviderService,
  AnalysisResponse,
  ProviderConnectionTest,
  AnalysisContext,
} from "../contracts/IAIProviderService";
import type { FeedbackItem } from "../../domain/models/feedback-models";
import type { ClarifyingQuestion, AnalysisResult } from "../../domain/models/analysis-models";
import type { OllamaConfig } from "../../domain/models/ai-settings-models";
import { DEFAULT_AI_SETTINGS } from "../../domain/models/ai-settings-models";
import {
  CLARITY_FIRST_SYSTEM_PROMPT,
  buildAnalysisPrompt,
  buildClaudeCodePrompt,
  extractJsonFromResponse,
  parseAnalysisResponse,
} from "../prompts/analysis-prompt";

/**
 * Ollama API response types
 */
interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

interface OllamaModelInfo {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details?: {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

@injectable()
export class OllamaProvider implements IAIProviderService {
  private config: OllamaConfig = DEFAULT_AI_SETTINGS.ollama;

  /**
   * Update the provider configuration
   */
  setConfig(config: OllamaConfig): void {
    this.config = config;
  }

  getProviderType(): "ollama" {
    return "ollama";
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get list of installed Ollama models
   */
  async getInstalledModels(): Promise<{ id: string; name: string; size: string; parameterSize?: string }[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        method: "GET",
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();
      const models: OllamaModelInfo[] = data.models || [];

      return models.map((m) => ({
        id: m.name,
        name: m.name,
        size: formatBytes(m.size),
        parameterSize: m.details?.parameter_size,
      }));
    } catch (error) {
      console.error("Failed to get Ollama models:", error);
      return [];
    }
  }

  async testConnection(): Promise<ProviderConnectionTest> {
    const startTime = performance.now();

    try {
      // Check if Ollama is running
      const tagsResponse = await fetch(`${this.config.baseUrl}/api/tags`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });

      if (!tagsResponse.ok) {
        return {
          success: false,
          message: `Ollama server returned ${tagsResponse.status}`,
        };
      }

      const tagsData = await tagsResponse.json();
      const models: OllamaModelInfo[] = tagsData.models || [];

      // Check if configured model is available
      const configuredModel = models.find(
        (m) =>
          m.name === this.config.modelId ||
          m.name.startsWith(`${this.config.modelId}:`)
      );

      if (!configuredModel) {
        return {
          success: false,
          message: `Model "${this.config.modelId}" not found. Available: ${models.map((m) => m.name).join(", ") || "none"}`,
          latencyMs: Math.round(performance.now() - startTime),
        };
      }

      return {
        success: true,
        message: `Connected to Ollama with model ${configuredModel.name}`,
        latencyMs: Math.round(performance.now() - startTime),
        modelInfo: {
          name: configuredModel.name,
          parameters: configuredModel.details?.parameter_size,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to connect: ${error instanceof Error ? error.message : "Unknown error"}`,
        latencyMs: Math.round(performance.now() - startTime),
      };
    }
  }

  async analyzeFeedback(
    feedback: FeedbackItem,
    previousQuestions?: ClarifyingQuestion[],
    context?: AnalysisContext
  ): Promise<AnalysisResponse> {
    const userPrompt = buildAnalysisPrompt(feedback, previousQuestions);

    try {
      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.config.modelId,
          prompt: userPrompt,
          system: CLARITY_FIRST_SYSTEM_PROMPT,
          stream: false,
          options: {
            temperature: 0.3, // Lower temperature for more consistent output
            num_ctx: this.config.contextLength || 4096,
          },
        }),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data: OllamaGenerateResponse = await response.json();
      const rawResponse = data.response;

      // Extract and parse JSON from response
      const jsonStr = extractJsonFromResponse(rawResponse);
      const parsed = parseAnalysisResponse(jsonStr);

      if (!parsed.success) {
        console.warn("Failed to parse Ollama response:", parsed.error);
        return {
          rawResponse,
          result: {
            summary: "Analysis failed - could not parse AI response",
            confirmedFacts: [],
            confidence: "low",
            suggestedActions: ["Retry analysis", "Review raw response"],
          },
          questions: [],
        };
      }

      return {
        rawResponse,
        result: parsed.result as AnalysisResult,
        questions: parsed.questions,
        tokenUsage: data.prompt_eval_count && data.eval_count
          ? {
              input: data.prompt_eval_count,
              output: data.eval_count,
              total: data.prompt_eval_count + data.eval_count,
            }
          : undefined,
      };
    } catch (error) {
      console.error("Ollama analysis failed:", error);
      throw error;
    }
  }

  async generateClaudeCodePrompt(
    feedback: FeedbackItem,
    analysis: AnalysisResult
  ): Promise<string> {
    // Use the pre-built prompt template
    return buildClaudeCodePrompt(feedback, analysis);
  }
}

/**
 * Create a standalone Ollama provider instance
 * Useful for testing or non-DI contexts
 */
export function createOllamaProvider(config?: Partial<OllamaConfig>): OllamaProvider {
  const provider = new OllamaProvider();
  if (config) {
    provider.setConfig({ ...DEFAULT_AI_SETTINGS.ollama, ...config });
  }
  return provider;
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

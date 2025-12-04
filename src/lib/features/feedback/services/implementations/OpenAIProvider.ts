/**
 * OpenAIProvider
 *
 * AI provider implementation for OpenAI's GPT API.
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
import type { OpenAIConfig } from "../../domain/models/ai-settings-models";
import { DEFAULT_AI_SETTINGS } from "../../domain/models/ai-settings-models";
import {
  CLARITY_FIRST_SYSTEM_PROMPT,
  buildAnalysisPrompt,
  buildClaudeCodePrompt,
  extractJsonFromResponse,
  parseAnalysisResponse,
} from "../prompts/analysis-prompt";

/**
 * OpenAI API message structure
 */
interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * OpenAI API response
 */
interface OpenAIResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: "assistant";
      content: string;
    };
    finish_reason: "stop" | "length" | "content_filter";
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@injectable()
export class OpenAIProvider implements IAIProviderService {
  private config: OpenAIConfig = DEFAULT_AI_SETTINGS.openai;
  private apiKey: string | null = null;

  private readonly API_URL = "https://api.openai.com/v1/chat/completions";

  /**
   * Update the provider configuration
   */
  setConfig(config: OpenAIConfig): void {
    this.config = config;
  }

  /**
   * Set the API key
   */
  setApiKey(key: string): void {
    this.apiKey = key;
  }

  getProviderType(): "openai" {
    return "openai";
  }

  async isAvailable(): Promise<boolean> {
    return this.apiKey !== null && this.apiKey.length > 0;
  }

  async testConnection(): Promise<ProviderConnectionTest> {
    if (!this.apiKey) {
      return {
        success: false,
        message: "API key not configured",
      };
    }

    const startTime = performance.now();

    try {
      // Send a minimal test request
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.modelId,
          max_tokens: 10,
          messages: [{ role: "user", content: "Hi" }],
        }),
        signal: AbortSignal.timeout(10000),
      });

      const latencyMs = Math.round(performance.now() - startTime);

      if (response.ok) {
        const data: OpenAIResponse = await response.json();
        return {
          success: true,
          message: `Connected to OpenAI API`,
          latencyMs,
          modelInfo: {
            name: data.model,
          },
        };
      }

      // Handle specific error codes
      if (response.status === 401) {
        return {
          success: false,
          message: "Invalid API key",
          latencyMs,
        };
      }

      if (response.status === 429) {
        return {
          success: false,
          message: "Rate limited - try again later",
          latencyMs,
        };
      }

      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: `API error: ${response.status} - ${(errorData as { error?: { message?: string } }).error?.message || response.statusText}`,
        latencyMs,
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        latencyMs: Math.round(performance.now() - startTime),
      };
    }
  }

  async analyzeFeedback(
    feedback: FeedbackItem,
    previousQuestions?: ClarifyingQuestion[],
    context?: AnalysisContext
  ): Promise<AnalysisResponse> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const userPrompt = buildAnalysisPrompt(feedback, previousQuestions);

    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.modelId,
          max_tokens: this.config.maxTokens,
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content: CLARITY_FIRST_SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
        }),
        signal: AbortSignal.timeout(60000),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenAI API error: ${response.status} - ${(errorData as { error?: { message?: string } }).error?.message || response.statusText}`
        );
      }

      const data: OpenAIResponse = await response.json();
      const rawResponse = data.choices[0]?.message?.content || "";

      // Extract and parse JSON from response
      const jsonStr = extractJsonFromResponse(rawResponse);
      const parsed = parseAnalysisResponse(jsonStr);

      if (!parsed.success) {
        console.warn("Failed to parse OpenAI response:", parsed.error);
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
        tokenUsage: {
          input: data.usage.prompt_tokens,
          output: data.usage.completion_tokens,
          total: data.usage.total_tokens,
          // Rough cost estimate for GPT-4o-mini
          estimatedCost:
            (data.usage.prompt_tokens * 0.00015 +
              data.usage.completion_tokens * 0.0006) /
            1000,
        },
      };
    } catch (error) {
      console.error("OpenAI analysis failed:", error);
      throw error;
    }
  }

  async generateClaudeCodePrompt(
    feedback: FeedbackItem,
    analysis: AnalysisResult
  ): Promise<string> {
    return buildClaudeCodePrompt(feedback, analysis);
  }
}

/**
 * Create a standalone OpenAI provider instance
 */
export function createOpenAIProvider(
  config?: Partial<OpenAIConfig>,
  apiKey?: string
): OpenAIProvider {
  const provider = new OpenAIProvider();
  if (config) {
    provider.setConfig({ ...DEFAULT_AI_SETTINGS.openai, ...config });
  }
  if (apiKey) {
    provider.setApiKey(apiKey);
  }
  return provider;
}

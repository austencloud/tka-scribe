/**
 * ClaudeProvider
 *
 * AI provider implementation for Anthropic's Claude API.
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
import type { ClaudeConfig } from "../../domain/models/ai-settings-models";
import { DEFAULT_AI_SETTINGS } from "../../domain/models/ai-settings-models";
import {
  CLARITY_FIRST_SYSTEM_PROMPT,
  buildAnalysisPrompt,
  buildClaudeCodePrompt,
  extractJsonFromResponse,
  parseAnalysisResponse,
} from "../prompts/analysis-prompt";

/**
 * Claude API message structure
 */
interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Claude API response
 */
interface ClaudeResponse {
  id: string;
  type: "message";
  role: "assistant";
  content: Array<{
    type: "text";
    text: string;
  }>;
  model: string;
  stop_reason: "end_turn" | "max_tokens" | "stop_sequence";
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

@injectable()
export class ClaudeProvider implements IAIProviderService {
  private config: ClaudeConfig = DEFAULT_AI_SETTINGS.claude;
  private apiKey: string | null = null;

  private readonly API_URL = "https://api.anthropic.com/v1/messages";
  private readonly API_VERSION = "2023-06-01";

  /**
   * Update the provider configuration
   */
  setConfig(config: ClaudeConfig): void {
    this.config = config;
  }

  /**
   * Set the API key
   */
  setApiKey(key: string): void {
    this.apiKey = key;
  }

  getProviderType(): "claude" {
    return "claude";
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
          "x-api-key": this.apiKey,
          "anthropic-version": this.API_VERSION,
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
        const data: ClaudeResponse = await response.json();
        return {
          success: true,
          message: `Connected to Claude API`,
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
      throw new Error("Claude API key not configured");
    }

    const userPrompt = buildAnalysisPrompt(feedback, previousQuestions);

    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": this.API_VERSION,
        },
        body: JSON.stringify({
          model: this.config.modelId,
          max_tokens: this.config.maxTokens,
          system: CLARITY_FIRST_SYSTEM_PROMPT,
          messages: [
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
          `Claude API error: ${response.status} - ${(errorData as { error?: { message?: string } }).error?.message || response.statusText}`
        );
      }

      const data: ClaudeResponse = await response.json();
      const rawResponse = data.content[0]?.text || "";

      // Extract and parse JSON from response
      const jsonStr = extractJsonFromResponse(rawResponse);
      const parsed = parseAnalysisResponse(jsonStr);

      if (!parsed.success) {
        console.warn("Failed to parse Claude response:", parsed.error);
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
          input: data.usage.input_tokens,
          output: data.usage.output_tokens,
          total: data.usage.input_tokens + data.usage.output_tokens,
          // Rough cost estimate for Claude 3.5 Sonnet
          estimatedCost:
            (data.usage.input_tokens * 0.003 + data.usage.output_tokens * 0.015) /
            1000,
        },
      };
    } catch (error) {
      console.error("Claude analysis failed:", error);
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
 * Create a standalone Claude provider instance
 */
export function createClaudeProvider(
  config?: Partial<ClaudeConfig>,
  apiKey?: string
): ClaudeProvider {
  const provider = new ClaudeProvider();
  if (config) {
    provider.setConfig({ ...DEFAULT_AI_SETTINGS.claude, ...config });
  }
  if (apiKey) {
    provider.setApiKey(apiKey);
  }
  return provider;
}

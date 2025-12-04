/**
 * IAIProviderService
 *
 * Contract for AI provider implementations (Ollama, Claude, OpenAI).
 * Each provider implements this interface for consistent analysis behavior.
 */

import type { FeedbackItem } from "../../domain/models/feedback-models";
import type {
  AnalysisResult,
  ClarifyingQuestion,
  TokenUsage,
  AIProviderType,
} from "../../domain/models/analysis-models";

/**
 * Response from AI analysis
 */
export interface AnalysisResponse {
  /**
   * Structured analysis result (if successful)
   */
  result?: AnalysisResult;

  /**
   * Clarifying questions (if ambiguity detected)
   */
  questions?: ClarifyingQuestion[];

  /**
   * Raw response from the AI (for debugging)
   */
  rawResponse: string;

  /**
   * Token usage (for API providers)
   */
  tokenUsage?: TokenUsage;
}

/**
 * Connection test result
 */
export interface ProviderConnectionTest {
  success: boolean;
  message: string;
  latencyMs?: number;
  modelInfo?: {
    name: string;
    version?: string;
    parameters?: string;
  };
}

/**
 * Provider configuration for analysis
 */
export interface AnalysisContext {
  /**
   * Maximum number of clarification rounds allowed
   */
  maxClarificationRounds: number;

  /**
   * Whether to include code context suggestions
   */
  includeCodeContext: boolean;

  /**
   * Additional context about the application
   */
  appContext?: string;
}

export interface IAIProviderService {
  /**
   * Get the provider type identifier
   */
  getProviderType(): AIProviderType;

  /**
   * Check if the provider is available and properly configured
   */
  isAvailable(): Promise<boolean>;

  /**
   * Test connection with a simple ping
   */
  testConnection(): Promise<ProviderConnectionTest>;

  /**
   * Analyze feedback and generate initial analysis
   *
   * @param feedback - The feedback item to analyze
   * @param previousQuestions - Previously answered clarifying questions (for refinement)
   * @param context - Analysis configuration
   */
  analyzeFeedback(
    feedback: FeedbackItem,
    previousQuestions?: ClarifyingQuestion[],
    context?: AnalysisContext
  ): Promise<AnalysisResponse>;

  /**
   * Generate a Claude Code investigation prompt
   *
   * @param feedback - The original feedback
   * @param analysis - The analysis result
   */
  generateClaudeCodePrompt(
    feedback: FeedbackItem,
    analysis: AnalysisResult
  ): Promise<string>;
}

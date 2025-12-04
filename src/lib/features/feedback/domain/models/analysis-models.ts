/**
 * Feedback Analysis Models
 *
 * Types for AI-powered feedback analysis system.
 * Supports multiple AI providers (Ollama, Claude, OpenAI).
 */

import type { FeedbackType, FeedbackPriority } from "./feedback-models";

/**
 * Supported AI provider types
 */
export type AIProviderType = "ollama" | "claude" | "openai";

/**
 * Analysis workflow status
 */
export type AnalysisStatus =
  | "pending" // Not yet analyzed
  | "analyzing" // Currently being analyzed
  | "needs_clarification" // AI has questions
  | "awaiting_user" // Admin passed question to user
  | "completed" // Analysis complete
  | "failed"; // Analysis failed

/**
 * Confidence level for AI analysis
 */
export type ConfidenceLevel = "high" | "medium" | "low";

/**
 * A clarifying question from the AI
 */
export interface ClarifyingQuestion {
  id: string;
  question: string;
  category?: "context" | "reproduction" | "expected_behavior" | "priority" | "scope";
  isRequired?: boolean;
  suggestedAnswers?: string[];
  answer?: string;
  answeredBy?: "admin" | "user";
  answeredAt?: Date;
  passedToUser?: boolean;
}

/**
 * Structured analysis result from AI
 */
export interface AnalysisResult {
  // Core interpretation
  summary: string;
  confirmedFacts: string[];

  // Suggested categorization
  suggestedType?: FeedbackType;
  suggestedPriority?: FeedbackPriority;
  suggestedModule?: string;
  suggestedTab?: string;

  // Confidence and reasoning
  confidence: ConfidenceLevel;
  confidenceReason?: string;

  // Technical analysis
  technicalNotes?: string;
  affectedAreas?: string[];
  relatedFeatures?: string[];
  reproductionSteps?: string[];

  // Action items
  suggestedActions: string[];
}

/**
 * Claude Code investigation prompt
 */
export interface ClaudeCodePrompt {
  id: string;
  generatedAt: Date;
  prompt: string;
  suggestedFiles?: string[];
  investigationGoals?: string[];
  copied: boolean;
  copiedAt?: Date;
}

/**
 * Error information for failed analysis
 */
export interface AnalysisError {
  code: AnalysisErrorCode;
  message: string;
  timestamp: Date;
  retryable: boolean;
  details?: string;
}

/**
 * Error codes for analysis failures
 */
export type AnalysisErrorCode =
  | "PROVIDER_UNAVAILABLE" // Can't connect to AI provider
  | "RATE_LIMITED" // API rate limit hit
  | "INVALID_API_KEY" // API key rejected
  | "CONTEXT_TOO_LONG" // Feedback exceeds context window
  | "PARSE_ERROR" // Failed to parse AI response
  | "TIMEOUT" // Request timed out
  | "UNKNOWN";

/**
 * Token usage tracking (for API providers)
 */
export interface TokenUsage {
  input: number;
  output: number;
  total: number;
  estimatedCost?: number;
}

/**
 * Complete Feedback Analysis Record
 */
export interface FeedbackAnalysis {
  id: string;
  feedbackId: string;
  createdAt: Date;
  updatedAt: Date;

  // Analysis metadata
  provider: AIProviderType;
  modelId: string;
  status: AnalysisStatus;

  // Analysis results
  result?: AnalysisResult;
  rawResponse?: string;

  // Clarification workflow
  clarifyingQuestions: ClarifyingQuestion[];
  questionRound: number; // Track iteration count
  maxRounds: number;

  // Claude Code integration
  claudeCodePrompts: ClaudeCodePrompt[];

  // Error handling
  error?: AnalysisError;

  // Token/cost tracking (for API providers)
  tokenUsage?: TokenUsage;
}

/**
 * Analysis status display configuration
 */
export const ANALYSIS_STATUS_CONFIG: Record<
  AnalysisStatus,
  { label: string; color: string; icon: string }
> = {
  pending: { label: "Not Analyzed", color: "#6b7280", icon: "fa-circle" },
  analyzing: { label: "Analyzing...", color: "#3b82f6", icon: "fa-spinner fa-spin" },
  needs_clarification: { label: "Needs Clarification", color: "#f59e0b", icon: "fa-question-circle" },
  awaiting_user: { label: "Awaiting User", color: "#8b5cf6", icon: "fa-user-clock" },
  completed: { label: "Complete", color: "#10b981", icon: "fa-check-circle" },
  failed: { label: "Failed", color: "#ef4444", icon: "fa-exclamation-circle" },
};

/**
 * Confidence level display configuration
 */
export const CONFIDENCE_CONFIG: Record<
  ConfidenceLevel,
  { label: string; color: string; icon: string }
> = {
  high: { label: "High Confidence", color: "#10b981", icon: "fa-check" },
  medium: { label: "Medium Confidence", color: "#f59e0b", icon: "fa-minus" },
  low: { label: "Low Confidence", color: "#ef4444", icon: "fa-exclamation" },
};

/**
 * AI Provider display configuration
 */
export const PROVIDER_CONFIG: Record<
  AIProviderType,
  { label: string; icon: string; description: string; requiresApiKey: boolean }
> = {
  ollama: {
    label: "Ollama",
    icon: "fa-server",
    description: "Local AI models - no API key needed",
    requiresApiKey: false,
  },
  claude: {
    label: "Claude",
    icon: "fa-brain",
    description: "Anthropic's Claude API",
    requiresApiKey: true,
  },
  openai: {
    label: "OpenAI",
    icon: "fa-robot",
    description: "OpenAI GPT models",
    requiresApiKey: true,
  },
};

/**
 * Feedback type display configuration
 */
export const TYPE_SUGGESTIONS: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  bug: { label: "Bug Report", color: "#ef4444", icon: "fa-bug" },
  feature: { label: "Feature Request", color: "#8b5cf6", icon: "fa-lightbulb" },
  general: { label: "General Feedback", color: "#3b82f6", icon: "fa-comment" },
  unclear: { label: "Unclear", color: "#6b7280", icon: "fa-question" },
};

// Aliases for component compatibility
export const STATUS_DISPLAY = ANALYSIS_STATUS_CONFIG;
export const CONFIDENCE_DISPLAY = CONFIDENCE_CONFIG;

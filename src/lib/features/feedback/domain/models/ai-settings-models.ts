/**
 * AI Settings Models
 *
 * Configuration types for AI-powered feedback analysis.
 */

import type { AIProviderType as _AIProviderType } from "./analysis-models";

// Re-export for backwards compatibility
export type AIProviderType = _AIProviderType;

/**
 * Ollama-specific configuration
 */
export interface OllamaConfig {
  baseUrl: string; // Default: http://localhost:11434
  modelId: string; // e.g., "llama3.2", "mistral", "codellama"
  timeout: number; // Request timeout in ms
  contextLength?: number; // Optional context window override
}

/**
 * Claude API configuration
 */
export interface ClaudeConfig {
  modelId: string; // e.g., "claude-3-5-sonnet-20241022"
  maxTokens: number;
}

/**
 * OpenAI API configuration
 */
export interface OpenAIConfig {
  modelId: string; // e.g., "gpt-4o", "gpt-4o-mini"
  maxTokens: number;
}

/**
 * Complete AI Analysis Settings
 * Stored in Firebase: users/{uid}/settings/aiAnalysis
 */
export interface AIAnalysisSettings {
  enabled: boolean;
  defaultProvider: AIProviderType;

  // Provider-specific configs
  ollama: OllamaConfig;
  claude: ClaudeConfig;
  openai: OpenAIConfig;

  // Analysis behavior
  autoAnalyzeOnNew: boolean;
  maxClarificationRounds: number;
  generateClaudeCodePrompts: boolean;

  // UI preferences
  showConfidenceIndicators: boolean;
  expandAnalysisByDefault: boolean;
}

/**
 * API Key storage (separate from settings for security)
 * Stored in Firebase: users/{uid}/settings/aiApiKeys
 */
export interface AIApiKeyStorage {
  claudeApiKey?: string; // Stored encrypted
  openaiApiKey?: string; // Stored encrypted
  lastUpdated: Date;
}

/**
 * Default AI settings
 */
export const DEFAULT_AI_SETTINGS: AIAnalysisSettings = {
  enabled: false,
  defaultProvider: "ollama",

  ollama: {
    baseUrl: "http://localhost:11434",
    modelId: "llama3.2",
    timeout: 60000,
  },

  claude: {
    modelId: "claude-3-5-sonnet-20241022",
    maxTokens: 4096,
  },

  openai: {
    modelId: "gpt-4o-mini",
    maxTokens: 4096,
  },

  autoAnalyzeOnNew: false,
  maxClarificationRounds: 3,
  generateClaudeCodePrompts: true,

  showConfidenceIndicators: true,
  expandAnalysisByDefault: true,
};

/**
 * Available Ollama models (commonly used)
 */
export const OLLAMA_MODELS = [
  { id: "llama3.2", name: "Llama 3.2", description: "Latest Llama model, good general purpose" },
  { id: "llama3.2:1b", name: "Llama 3.2 1B", description: "Smaller, faster version" },
  { id: "llama3.1", name: "Llama 3.1", description: "Previous generation Llama" },
  { id: "mistral", name: "Mistral", description: "Fast and efficient" },
  { id: "codellama", name: "Code Llama", description: "Optimized for code understanding" },
  { id: "deepseek-coder", name: "DeepSeek Coder", description: "Specialized for code" },
  { id: "qwen2.5-coder", name: "Qwen 2.5 Coder", description: "Strong code understanding" },
];

/**
 * Available Claude models
 */
export const CLAUDE_MODELS = [
  { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", description: "Best balance of speed and quality" },
  { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", description: "Fastest, most cost-effective" },
  { id: "claude-3-opus-20240229", name: "Claude 3 Opus", description: "Most capable, highest quality" },
];

/**
 * Available OpenAI models
 */
export const OPENAI_MODELS = [
  { id: "gpt-4o", name: "GPT-4o", description: "Most capable model" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and cost-effective" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "Previous flagship model" },
];

/**
 * Connection test result
 */
export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
  modelInfo?: {
    name: string;
    version?: string;
  };
}

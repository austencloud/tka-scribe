/**
 * Deep Analysis Models
 *
 * Types for the thorough, background AI codebase analysis system.
 * Uses local Ollama (qwen2.5:32b) to deeply explore the codebase
 * until reaching a confidence threshold.
 */

import type { FeedbackItem } from "./feedback-models";

/**
 * Deep analysis status
 */
export type DeepAnalysisStatus =
  | "idle"
  | "starting"
  | "exploring" // Actively reading files
  | "analyzing" // Processing gathered context
  | "synthesizing" // Building the game plan
  | "completed"
  | "stopped" // User cancelled
  | "error";

/**
 * Confidence assessment for understanding
 */
export interface ConfidenceAssessment {
  overall: number; // 0-100
  codeUnderstanding: number;
  problemClarity: number;
  solutionConfidence: number;
  reasoning: string;
}

/**
 * A file that was explored during analysis
 */
export interface ExploredFile {
  path: string;
  relativePath: string;
  relevance: "high" | "medium" | "low";
  reason: string;
  linesRead: number;
  keyFindings: string[];
  timestamp: Date;
}

/**
 * A concept or pattern discovered in the codebase
 */
export interface DiscoveredConcept {
  name: string;
  description: string;
  relatedFiles: string[];
  confidence: number;
}

/**
 * An exploration step in the agentic loop
 */
export interface ExplorationStep {
  id: number;
  type: "search" | "read" | "analyze" | "synthesize";
  description: string;
  query?: string;
  filesExamined?: string[];
  findings?: string;
  timestamp: Date;
  durationMs: number;
}

/**
 * A suggested action for the implementation
 */
export interface SuggestedAction {
  priority: number;
  type: "create" | "modify" | "delete" | "investigate";
  target: string;
  description: string;
  reasoning: string;
  estimatedComplexity: "low" | "medium" | "high";
  relatedFiles: string[];
}

/**
 * The final game plan for Claude implementation
 */
export interface GamePlan {
  summary: string;
  problemStatement: string;
  codebaseContext: string;
  architectureNotes: string;
  suggestedApproach: string;
  actions: SuggestedAction[];
  potentialChallenges: string[];
  testingConsiderations: string[];
  relatedPatterns: string[];
}

/**
 * Progress event for SSE streaming
 */
export interface DeepAnalysisProgress {
  status: DeepAnalysisStatus;
  phase: string;
  message: string;
  progress: number; // 0-100
  confidence: ConfidenceAssessment;
  currentStep?: ExplorationStep;
  filesExplored: number;
  totalTokensUsed: number;
  elapsedTimeMs: number;
}

/**
 * Complete deep analysis result
 */
export interface DeepAnalysisResult {
  id: string;
  feedbackId: string;
  startedAt: Date;
  completedAt?: Date;
  status: DeepAnalysisStatus;

  // Configuration used
  config: DeepAnalysisConfig;

  // Progress tracking
  confidenceHistory: ConfidenceAssessment[];
  explorationSteps: ExplorationStep[];
  exploredFiles: ExploredFile[];
  discoveredConcepts: DiscoveredConcept[];

  // Final output
  gamePlan?: GamePlan;
  claudePrompt?: string;

  // Statistics
  totalFilesExplored: number;
  totalLinesRead: number;
  totalTokensUsed: number;
  totalDurationMs: number;

  // Error info
  error?: {
    message: string;
    step?: number;
    recoverable: boolean;
  };
}

/**
 * Configuration for deep analysis
 */
export interface DeepAnalysisConfig {
  // Confidence thresholds
  targetConfidence: number; // Stop when overall confidence reaches this (default: 85)
  minConfidenceGain: number; // Stop if gain per step falls below this (default: 2)

  // Limits
  maxFiles: number; // Maximum files to explore (default: 50)
  maxTokens: number; // Maximum tokens to use (default: 100000)
  maxDurationMs: number; // Maximum time (default: 5 minutes)
  maxSteps: number; // Maximum exploration steps (default: 30)

  // Model settings
  modelId: string;
  temperature: number;
  contextWindow: number;

  // Search settings
  searchPaths: string[]; // Paths to search (default: src/)
  excludePatterns: string[]; // Patterns to exclude
  fileExtensions: string[]; // File types to consider

  // Behavior
  thoroughMode: boolean; // Read more context around findings
  followImports: boolean; // Trace import chains
  includeTests: boolean; // Include test files
}

/**
 * Default configuration for deep analysis
 */
export const DEFAULT_DEEP_ANALYSIS_CONFIG: DeepAnalysisConfig = {
  targetConfidence: 85,
  minConfidenceGain: 2,

  maxFiles: 50,
  maxTokens: 100000,
  maxDurationMs: 5 * 60 * 1000, // 5 minutes
  maxSteps: 30,

  modelId: "qwen2.5:32b",
  temperature: 0.3,
  contextWindow: 32768,

  searchPaths: ["src/"],
  excludePatterns: [
    "node_modules",
    ".svelte-kit",
    "build",
    "dist",
    ".git",
    "*.test.*",
    "*.spec.*",
  ],
  fileExtensions: [".ts", ".svelte", ".js", ".json"],

  thoroughMode: true,
  followImports: true,
  includeTests: false,
};

/**
 * Status display configuration
 */
export const DEEP_ANALYSIS_STATUS_CONFIG: Record<
  DeepAnalysisStatus,
  { label: string; color: string; icon: string }
> = {
  idle: { label: "Ready", color: "#6b7280", icon: "fa-circle" },
  starting: { label: "Starting...", color: "#3b82f6", icon: "fa-spinner fa-spin" },
  exploring: { label: "Exploring Codebase", color: "#8b5cf6", icon: "fa-search" },
  analyzing: { label: "Analyzing", color: "#f59e0b", icon: "fa-brain" },
  synthesizing: { label: "Building Game Plan", color: "#10b981", icon: "fa-magic" },
  completed: { label: "Complete", color: "#10b981", icon: "fa-check-circle" },
  stopped: { label: "Stopped", color: "#6b7280", icon: "fa-stop-circle" },
  error: { label: "Error", color: "#ef4444", icon: "fa-exclamation-circle" },
};

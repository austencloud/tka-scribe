/**
 * Deep Analysis Engine
 *
 * An agentic analysis system that deeply explores the codebase to understand
 * feedback context. Uses tool calling to iteratively gather information until
 * it reaches a confidence threshold.
 */

import type { OllamaMessage, OllamaTool } from "./ollama-client";
import { ollamaChat, DEFAULT_OLLAMA_CONFIG } from "./ollama-client";
import {
  findFiles,
  grepFiles,
  readFile,
  listDirectory,
  getProjectStructure,
  findRelatedFiles,
  type SearchOptions,
} from "./code-search";
import type { FeedbackItem } from "../../domain/models/feedback-models";

/**
 * Analysis progress event types
 */
export type AnalysisEventType =
  | "started"
  | "thinking"
  | "tool_call"
  | "tool_result"
  | "confidence_update"
  | "iteration"
  | "completed"
  | "error";

/**
 * Analysis progress event
 */
export interface AnalysisEvent {
  type: AnalysisEventType;
  timestamp: Date;
  message: string;
  data?: unknown;
}

/**
 * Deep analysis configuration
 */
export interface DeepAnalysisConfig {
  /** Root directory of the project */
  projectRoot: string;
  /** Maximum number of analysis iterations */
  maxIterations: number;
  /** Confidence threshold to stop (0-1) */
  confidenceThreshold: number;
  /** Maximum files to read in total */
  maxFilesRead: number;
  /** Maximum total content size to accumulate (chars) */
  maxTotalContent: number;
  /** Ollama config overrides */
  ollamaConfig?: Partial<typeof DEFAULT_OLLAMA_CONFIG>;
}

export const DEFAULT_ANALYSIS_CONFIG: DeepAnalysisConfig = {
  projectRoot: process.cwd(),
  maxIterations: 20,
  confidenceThreshold: 0.85,
  maxFilesRead: 50,
  maxTotalContent: 500000, // ~500KB of context
};

/**
 * File that has been read during analysis
 */
export interface ReadFileRecord {
  path: string;
  contentSize: number;
  readAt: Date;
  relevance: "high" | "medium" | "low";
}

/**
 * Analysis state tracking
 */
export interface AnalysisState {
  iteration: number;
  confidence: number;
  confidenceReason: string;
  filesRead: ReadFileRecord[];
  totalContentRead: number;
  searchesPerformed: string[];
  thinking: string[];
  findings: string[];
  isComplete: boolean;
  stoppedReason?: string;
}

/**
 * Final analysis result
 */
export interface DeepAnalysisResult {
  feedback: FeedbackItem;
  state: AnalysisState;
  
  // Core findings
  summary: string;
  technicalAnalysis: string;
  
  // Identified components
  affectedFiles: string[];
  affectedModules: string[];
  relatedFeatures: string[];
  
  // Understanding level
  mechanicsIdentified: string[];
  dataFlowTraced: boolean;
  stateManagementUnderstood: boolean;
  
  // Recommendations
  suggestedFix: string;
  implementationSteps: string[];
  riskAssessment: string;
  
  // For Claude handoff
  claudeCodePrompt: string;
  contextFiles: string[];
}

/**
 * Define the tools available to the AI
 */
const ANALYSIS_TOOLS: OllamaTool[] = [
  {
    type: "function",
    function: {
      name: "search_files",
      description: "Search for files by name pattern (glob). Use this to find specific files like '*.svelte' or 'FeedbackService.ts'",
      parameters: {
        type: "object",
        properties: {
          pattern: {
            type: "string",
            description: "Glob pattern to match files, e.g., '**/*.svelte', '**/Feedback*.ts'",
          },
          maxResults: {
            type: "string",
            description: "Maximum number of files to return (default 20)",
          },
        },
        required: ["pattern"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "grep_content",
      description: "Search for text content within files. Use this to find where specific code, functions, or terms are used.",
      parameters: {
        type: "object",
        properties: {
          searchText: {
            type: "string",
            description: "Text to search for in file contents",
          },
          extensions: {
            type: "string",
            description: "Comma-separated file extensions to search, e.g., '.ts,.svelte' (default: .ts,.svelte,.js)",
          },
          maxResults: {
            type: "string",
            description: "Maximum number of matching files (default 30)",
          },
        },
        required: ["searchText"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read the full or partial content of a specific file. Use this to understand implementation details.",
      parameters: {
        type: "object",
        properties: {
          filePath: {
            type: "string",
            description: "Relative path to the file from project root",
          },
          startLine: {
            type: "string",
            description: "Optional starting line number (1-indexed)",
          },
          endLine: {
            type: "string",
            description: "Optional ending line number (1-indexed)",
          },
        },
        required: ["filePath"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_directory",
      description: "List contents of a directory to understand project structure.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Relative path to the directory (use '.' for root)",
          },
          recursive: {
            type: "string",
            description: "Whether to list recursively ('true' or 'false', default 'false')",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "find_related_files",
      description: "Find files that are imported by or related to a specific file.",
      parameters: {
        type: "object",
        properties: {
          filePath: {
            type: "string",
            description: "Relative path to the file to find relations for",
          },
        },
        required: ["filePath"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "report_confidence",
      description: "Report your current confidence level in understanding the feedback and relevant code. Call this periodically.",
      parameters: {
        type: "object",
        properties: {
          confidence: {
            type: "string",
            description: "Confidence level from 0 to 100 as a percentage",
          },
          reason: {
            type: "string",
            description: "Brief explanation of what you understand and what's still unclear",
          },
          findings: {
            type: "string",
            description: "Key findings so far, one per line",
          },
        },
        required: ["confidence", "reason"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "complete_analysis",
      description: "Call when you have sufficient understanding to provide a complete analysis.",
      parameters: {
        type: "object",
        properties: {
          summary: {
            type: "string",
            description: "High-level summary of what the feedback is about",
          },
          technicalAnalysis: {
            type: "string",
            description: "Detailed technical analysis of the issue/request",
          },
          affectedFiles: {
            type: "string",
            description: "Comma-separated list of files that would need changes",
          },
          mechanicsIdentified: {
            type: "string",
            description: "Key mechanics/patterns identified, one per line",
          },
          suggestedFix: {
            type: "string",
            description: "Suggested approach to address the feedback",
          },
          implementationSteps: {
            type: "string",
            description: "Step-by-step implementation plan, one step per line",
          },
          riskAssessment: {
            type: "string",
            description: "Assessment of risks and potential side effects",
          },
        },
        required: [
          "summary",
          "technicalAnalysis",
          "affectedFiles",
          "suggestedFix",
          "implementationSteps",
        ],
      },
    },
  },
];

/**
 * Execute a tool call and return the result
 */
async function executeTool(
  toolName: string,
  args: Record<string, string>,
  config: DeepAnalysisConfig,
  state: AnalysisState
): Promise<{ result: string; shouldStop?: boolean; confidence?: number }> {
  const searchOptions: SearchOptions = {
    rootDir: config.projectRoot,
    maxResults: 30,
  };

  switch (toolName) {
    case "search_files": {
      const files = await findFiles(args.pattern || "**/*", {
        ...searchOptions,
        maxResults: parseInt(args.maxResults || "20", 10),
      });
      state.searchesPerformed.push(`search_files: ${args.pattern}`);
      return {
        result: files.length > 0
          ? `Found ${files.length} files:\n${files.join("\n")}`
          : `No files found matching pattern: ${args.pattern}`,
      };
    }

    case "grep_content": {
      const extensions = args.extensions
        ? args.extensions.split(",").map((e) => e.trim())
        : [".ts", ".svelte", ".js"];
      
      const matches = await grepFiles(args.searchText || "", {
        ...searchOptions,
        extensions,
        maxResults: parseInt(args.maxResults || "30", 10),
        contextLines: 2,
      });

      state.searchesPerformed.push(`grep_content: "${args.searchText}"`);

      if (matches.length === 0) {
        return { result: `No files containing "${args.searchText}" found` };
      }

      const resultLines = matches.map((m) => {
        const lineInfo = m.lineMatches
          ?.map((lm) => `  Line ${lm.lineNumber}: ${lm.content.trim()}`)
          .join("\n");
        return `${m.relativePath}:\n${lineInfo || "  (match found)"}`;
      });

      return { result: `Found in ${matches.length} files:\n${resultLines.join("\n\n")}` };
    }

    case "read_file": {
      const filePath = args.filePath || "";
      const fullPath = `${config.projectRoot}/${filePath}`;

      // Check limits
      if (state.filesRead.length >= config.maxFilesRead) {
        return {
          result: `Cannot read more files. Limit of ${config.maxFilesRead} files reached. Please complete your analysis with the information gathered.`,
        };
      }

      if (state.totalContentRead >= config.maxTotalContent) {
        return {
          result: `Content limit reached (${Math.round(config.maxTotalContent / 1024)}KB). Please complete your analysis with the information gathered.`,
        };
      }

      try {
        const { content, truncated, totalLines } = await readFile(fullPath, {
          startLine: args.startLine ? parseInt(args.startLine, 10) : undefined,
          endLine: args.endLine ? parseInt(args.endLine, 10) : undefined,
          maxSize: 50000, // 50KB per file
        });

        state.filesRead.push({
          path: filePath,
          contentSize: content.length,
          readAt: new Date(),
          relevance: "medium",
        });
        state.totalContentRead += content.length;

        const header = `File: ${filePath} (${totalLines} lines${truncated ? ", truncated" : ""})`;
        return { result: `${header}\n${"=".repeat(header.length)}\n${content}` };
      } catch (error) {
        return { result: `Error reading file: ${error instanceof Error ? error.message : "Unknown error"}` };
      }
    }

    case "list_directory": {
      const dirPath = args.path === "." ? config.projectRoot : `${config.projectRoot}/${args.path}`;
      const recursive = args.recursive === "true";

      try {
        const entries = await listDirectory(dirPath, { recursive, maxDepth: 2 });
        const dirs = entries.filter((e) => e.type === "directory").map((e) => `📁 ${e.name}/`);
        const files = entries.filter((e) => e.type === "file").map((e) => `📄 ${e.name}`);

        return {
          result: `Directory: ${args.path}\n\nDirectories:\n${dirs.join("\n") || "(none)"}\n\nFiles:\n${files.join("\n") || "(none)"}`,
        };
      } catch (error) {
        return { result: `Error listing directory: ${error instanceof Error ? error.message : "Unknown error"}` };
      }
    }

    case "find_related_files": {
      const filePath = args.filePath || "";
      const fullPath = `${config.projectRoot}/${filePath}`;

      try {
        const related = await findRelatedFiles(fullPath, config.projectRoot);
        return {
          result: related.length > 0
            ? `Files related to ${filePath}:\n${related.join("\n")}`
            : `No related files found for ${filePath}`,
        };
      } catch (error) {
        return { result: `Error finding related files: ${error instanceof Error ? error.message : "Unknown error"}` };
      }
    }

    case "report_confidence": {
      const confidence = parseInt(args.confidence || "0", 10) / 100;
      state.confidence = confidence;
      state.confidenceReason = args.reason || "";
      
      if (args.findings) {
        const newFindings = args.findings.split("\n").filter(Boolean);
        state.findings.push(...newFindings);
      }

      return {
        result: `Confidence recorded: ${args.confidence}%`,
        confidence,
      };
    }

    case "complete_analysis": {
      state.isComplete = true;
      return {
        result: "Analysis marked as complete",
        shouldStop: true,
      };
    }

    default:
      return { result: `Unknown tool: ${toolName}` };
  }
}

/**
 * Build the system prompt for deep analysis
 */
function buildSystemPrompt(feedback: FeedbackItem, projectStructure: string): string {
  return `You are an expert code analyst performing deep analysis of user feedback for a SvelteKit application called "TKA Studio" (The Kinetic Alphabet).

Your goal is to thoroughly understand the feedback by exploring the actual codebase. You have access to tools that let you search for files, read code, and explore the project structure.

## Your Approach

1. **Start Broad**: Begin by understanding the project structure and identifying relevant modules
2. **Follow the Trail**: When you find relevant files, explore their imports and related files
3. **Trace Data Flow**: Understand how data flows through the application
4. **Understand State**: Identify state management patterns (Svelte 5 runes, stores, services)
5. **Map Dependencies**: Build a mental model of how components interact
6. **Report Progress**: Periodically report your confidence level and findings
7. **Be Thorough**: Don't stop at the first relevant file - explore comprehensively

## The Feedback to Analyze

**Type**: ${feedback.type}
**Title**: ${feedback.title}
**Description**: ${feedback.description}
**Reported Module**: ${feedback.reportedModule || feedback.capturedModule || "Unknown"}
**Reported Tab**: ${feedback.reportedTab || feedback.capturedTab || "Unknown"}
${feedback.priority ? `**Priority**: ${feedback.priority}` : ""}

## Project Structure (src/)
${projectStructure}

## Key Patterns in This Codebase

- **Svelte 5**: Uses $state, $derived, $effect runes (not Svelte 4 stores)
- **Inversify DI**: Dependency injection with inversify decorators
- **Feature Folders**: src/lib/features/{feature}/ with components/, services/, state/, domain/
- **Shared Code**: src/lib/shared/ for cross-cutting concerns
- **State Management**: .svelte.ts files contain reactive state using runes

## Rules

1. You MUST call tools to explore the codebase - don't assume or guess
2. Report confidence periodically with report_confidence
3. Continue exploring until you reach 85%+ confidence OR hit iteration limits
4. When you have sufficient understanding, call complete_analysis with detailed findings
5. Focus on understanding the mechanics, not just finding the files

Begin your analysis now. Start by exploring the relevant module/feature directories.`;
}

/**
 * Run the deep analysis loop
 */
export async function runDeepAnalysis(
  feedback: FeedbackItem,
  config: Partial<DeepAnalysisConfig> = {},
  onProgress?: (event: AnalysisEvent) => void
): Promise<DeepAnalysisResult> {
  const fullConfig: DeepAnalysisConfig = {
    ...DEFAULT_ANALYSIS_CONFIG,
    ...config,
  };

  const ollamaConfig = {
    ...DEFAULT_OLLAMA_CONFIG,
    ...fullConfig.ollamaConfig,
  };

  const emit = (type: AnalysisEventType, message: string, data?: unknown) => {
    onProgress?.({ type, timestamp: new Date(), message, data });
  };

  emit("started", "Beginning deep analysis...");

  // Get project structure first
  const structure = await getProjectStructure(fullConfig.projectRoot);
  const srcStructure = structure.srcStructure || "Unable to read src/ structure";

  // Initialize state
  const state: AnalysisState = {
    iteration: 0,
    confidence: 0,
    confidenceReason: "",
    filesRead: [],
    totalContentRead: 0,
    searchesPerformed: [],
    thinking: [],
    findings: [],
    isComplete: false,
  };

  // Initialize conversation
  const messages: OllamaMessage[] = [
    {
      role: "system",
      content: buildSystemPrompt(feedback, srcStructure),
    },
    {
      role: "user",
      content: "Please begin your analysis. Start by exploring the project structure and identifying the relevant modules for this feedback.",
    },
  ];

  let completionArgs: Record<string, string> | null = null;

  // Main analysis loop
  while (
    state.iteration < fullConfig.maxIterations &&
    state.confidence < fullConfig.confidenceThreshold &&
    !state.isComplete
  ) {
    state.iteration++;
    emit("iteration", `Starting iteration ${state.iteration}/${fullConfig.maxIterations}`, {
      iteration: state.iteration,
      confidence: state.confidence,
    });

    try {
      // Call Ollama with tools
      const response = await ollamaChat(messages, ANALYSIS_TOOLS, ollamaConfig);
      const assistantMessage = response.message;

      // Add assistant response to conversation
      messages.push(assistantMessage);

      // Handle thinking/content
      if (assistantMessage.content) {
        state.thinking.push(assistantMessage.content);
        emit("thinking", assistantMessage.content.slice(0, 200) + "...");
      }

      // Handle tool calls
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        for (const toolCall of assistantMessage.tool_calls) {
          const args = JSON.parse(toolCall.function.arguments || "{}");
          
          emit("tool_call", `Calling ${toolCall.function.name}`, {
            tool: toolCall.function.name,
            args,
          });

          const { result, shouldStop, confidence } = await executeTool(
            toolCall.function.name,
            args,
            fullConfig,
            state
          );

          emit("tool_result", `${toolCall.function.name} completed`, {
            resultPreview: result.slice(0, 300),
          });

          // Save completion args if this was complete_analysis
          if (toolCall.function.name === "complete_analysis") {
            completionArgs = args;
          }

          // Add tool result to conversation
          messages.push({
            role: "tool",
            content: result,
          });

          if (confidence !== undefined) {
            emit("confidence_update", `Confidence: ${Math.round(confidence * 100)}%`, {
              confidence,
              reason: state.confidenceReason,
            });
          }

          if (shouldStop) {
            state.isComplete = true;
            break;
          }
        }
      } else {
        // No tool calls - prompt for action
        messages.push({
          role: "user",
          content: "Please continue your analysis. Use the available tools to explore the codebase, or call complete_analysis if you have sufficient understanding.",
        });
      }

    } catch (error) {
      emit("error", `Error in iteration ${state.iteration}: ${error instanceof Error ? error.message : "Unknown"}`, { error });
      
      // Add error context and continue
      messages.push({
        role: "user",
        content: `There was an error: ${error instanceof Error ? error.message : "Unknown"}. Please continue your analysis.`,
      });
    }
  }

  // Determine stop reason
  if (!state.isComplete) {
    if (state.iteration >= fullConfig.maxIterations) {
      state.stoppedReason = `Reached maximum iterations (${fullConfig.maxIterations})`;
    } else if (state.confidence >= fullConfig.confidenceThreshold) {
      state.stoppedReason = `Reached confidence threshold (${Math.round(state.confidence * 100)}%)`;
    }
  }

  emit("completed", "Deep analysis completed", { state });

  // Build result
  const result = buildAnalysisResult(feedback, state, completionArgs, fullConfig);
  
  return result;
}

/**
 * Build the final analysis result
 */
function buildAnalysisResult(
  feedback: FeedbackItem,
  state: AnalysisState,
  completionArgs: Record<string, string> | null,
  config: DeepAnalysisConfig
): DeepAnalysisResult {
  const summary = completionArgs?.summary || state.findings.join("\n") || "Analysis incomplete";
  const technicalAnalysis = completionArgs?.technicalAnalysis || state.thinking.slice(-3).join("\n\n");
  const affectedFiles = completionArgs?.affectedFiles?.split(",").map((f) => f.trim()) || 
    state.filesRead.map((f) => f.path);
  const suggestedFix = completionArgs?.suggestedFix || "";
  const implementationSteps = completionArgs?.implementationSteps?.split("\n").filter(Boolean) || [];
  const riskAssessment = completionArgs?.riskAssessment || "";
  const mechanicsIdentified = completionArgs?.mechanicsIdentified?.split("\n").filter(Boolean) || [];

  // Build Claude Code prompt
  const claudeCodePrompt = buildClaudePrompt(feedback, state, completionArgs);

  return {
    feedback,
    state,
    summary,
    technicalAnalysis,
    affectedFiles,
    affectedModules: extractModules(affectedFiles),
    relatedFeatures: extractFeatures(affectedFiles),
    mechanicsIdentified,
    dataFlowTraced: state.confidence > 0.6,
    stateManagementUnderstood: state.confidence > 0.7,
    suggestedFix,
    implementationSteps,
    riskAssessment,
    claudeCodePrompt,
    contextFiles: state.filesRead.slice(0, 10).map((f) => f.path),
  };
}

/**
 * Extract unique modules from file paths
 */
function extractModules(files: string[]): string[] {
  const modules = new Set<string>();
  for (const file of files) {
    const match = file.match(/src\/lib\/features\/([^/]+)/);
    if (match) modules.add(match[1] || "");
  }
  return Array.from(modules).filter(Boolean);
}

/**
 * Extract feature names from file paths
 */
function extractFeatures(files: string[]): string[] {
  const features = new Set<string>();
  for (const file of files) {
    // Extract feature from path like "src/lib/features/feedback/..."
    const match = file.match(/features\/([^/]+)/);
    if (match) features.add(match[1] || "");
    // Also extract shared modules
    const sharedMatch = file.match(/shared\/([^/]+)/);
    if (sharedMatch) features.add(`shared/${sharedMatch[1]}`);
  }
  return Array.from(features).filter(Boolean);
}

/**
 * Build a prompt optimized for Claude Code
 */
function buildClaudePrompt(
  feedback: FeedbackItem,
  state: AnalysisState,
  completionArgs: Record<string, string> | null
): string {
  const sections: string[] = [];

  sections.push(`# Feedback Analysis for Claude Code

## Original Feedback
**Type**: ${feedback.type}
**Title**: ${feedback.title}
**Description**: ${feedback.description}
**Module**: ${feedback.reportedModule || feedback.capturedModule}
**Tab**: ${feedback.reportedTab || feedback.capturedTab}`);

  if (completionArgs?.summary) {
    sections.push(`## Pre-Analysis Summary
${completionArgs.summary}`);
  }

  if (completionArgs?.technicalAnalysis) {
    sections.push(`## Technical Analysis
${completionArgs.technicalAnalysis}`);
  }

  sections.push(`## Files Explored (${state.filesRead.length} total)
${state.filesRead.slice(0, 15).map((f) => `- ${f.path}`).join("\n")}`);

  if (state.findings.length > 0) {
    sections.push(`## Key Findings
${state.findings.map((f) => `- ${f}`).join("\n")}`);
  }

  if (completionArgs?.suggestedFix) {
    sections.push(`## Suggested Approach
${completionArgs.suggestedFix}`);
  }

  if (completionArgs?.implementationSteps) {
    sections.push(`## Implementation Steps
${completionArgs.implementationSteps}`);
  }

  if (completionArgs?.riskAssessment) {
    sections.push(`## Risk Assessment
${completionArgs.riskAssessment}`);
  }

  sections.push(`## Investigation Guidance
- Confidence level: ${Math.round(state.confidence * 100)}%
- Analysis iterations: ${state.iteration}
- Reason: ${state.confidenceReason || state.stoppedReason || "N/A"}

Please review the identified files and implement the suggested changes. The pre-analysis has explored the codebase structure - focus on implementation details and edge cases.`);

  return sections.join("\n\n");
}

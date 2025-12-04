/**
 * Deep Analysis Module Index
 *
 * Exports for the deep codebase analysis system using local Ollama.
 */

// Engine
export { 
  runDeepAnalysis, 
  DEFAULT_ANALYSIS_CONFIG,
  type AnalysisEvent,
  type AnalysisEventType,
  type DeepAnalysisConfig,
  type DeepAnalysisResult,
  type AnalysisState,
  type ReadFileRecord
} from "./deep-analysis-engine";

// Ollama Client
export {
  ollamaChat,
  ollamaChatStream,
  checkOllamaHealth,
  listOllamaModels,
  DEFAULT_OLLAMA_CONFIG,
  type OllamaConfig,
  type OllamaMessage,
  type OllamaTool,
  type OllamaToolCall,
  type OllamaChatRequest,
  type OllamaChatResponse,
  type OllamaStreamChunk
} from "./ollama-client";

// Code Search
export {
  findFiles,
  grepFiles,
  readFile,
  listDirectory,
  getProjectStructure,
  findRelatedFiles,
  type FileMatch,
  type SearchOptions
} from "./code-search";

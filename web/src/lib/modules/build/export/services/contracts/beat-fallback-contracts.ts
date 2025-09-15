/**
 * Beat Fallback Rendering Service Contracts
 *
 * Service contracts for fallback beat rendering when primary rendering fails.
 */

// Re-export from the main beat-fallback-interfaces file
export type {
  IBeatFallbackRenderer,
  FallbackRenderOptions,
  FallbackRenderResult,
  EmptyBeatOptions,
  ErrorBeatOptions
} from './beat-fallback-interfaces';

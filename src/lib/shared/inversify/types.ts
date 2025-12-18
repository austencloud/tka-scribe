/**
 * InversifyJS Service Type Identifiers
 *
 * This file re-exports all service identifiers from domain-specific type files.
 * For the architectural rationale, see: docs/architecture/DI-ARCHITECTURE.md
 *
 * ## Quick Reference
 *
 * The DI pattern used here is intentional for Svelte 5:
 * - Svelte components cannot use constructor injection (the framework creates instances)
 * - `resolve(TYPES.X)` at the component boundary is the only viable pattern
 * - Service-to-service dependencies use proper `@inject()` constructor injection
 *
 * ## Import Options
 *
 * ```typescript
 * // Option 1: Domain-specific (preferred for new code)
 * import { AnimationTypes } from '$shared/inversify/types';
 * const service = resolve(AnimationTypes.IAnimationPlaybackController);
 *
 * // Option 2: Unified TYPES object (backward compatible)
 * import { TYPES } from '$shared/inversify/types';
 * const service = resolve(TYPES.IAnimationPlaybackController);
 * ```
 */

// Re-export everything from the types directory
export {
  // Unified TYPES object (backward compatible)
  TYPES,
  // Domain-specific type groups
  AdminTypes,
  AnimationTypes,
  ArrowTypes,
  AuthTypes,
  BackgroundTypes,
  CoreTypes,
  CreateTypes,
  DiscoverTypes,
  ExportTypes,
  FeedbackTypes,
  GamificationTypes,
  GenerationTypes,
  LearnTypes,
  LibraryTypes,
  MessagingTypes,
  RenderingTypes,
  TrainTypes,
  UITypes,
  YouTubeTypes,
  // Type helper
  type ServiceType,
} from "./types/index";

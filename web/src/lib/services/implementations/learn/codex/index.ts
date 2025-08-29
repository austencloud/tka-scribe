/**
 * Codex Service Module Index
 *
 * Clean exports for the refactored codex system.
 */

// Domain types
export type {
  CodexConfiguration,
  CodexLetter,
  LessonConfiguration,
  LetterCategory,
  LetterMapping,
  LetterRow,
  MotionType,
} from "$lib/domain/learn/codex/types";

// Repositories
export {
  LetterMappingRepository,
  type ILetterMappingRepository,
} from "$lib/domain/learn/codex/LetterMappingRepository";
export {
  LessonRepository,
  type ILessonRepository,
} from "$lib/domain/learn/LessonRepository";

// Services
// TODO: Re-enable when PictographQueryService is implemented
// export {
//   PictographQueryService,
//   type IPictographQueryService,
// } from "./PictographQueryService";
export {
  PictographOperationsService,
  type IPictographOperationsService,
  type PictographOperation,
} from "./PictographOperationsService";

// Main service
export type { ICodexService } from "$lib/services/contracts/application-interfaces";
export { CodexService } from "./CodexService";

// Migration helper
export { CodexServiceMigrationHelper } from "./CodexServiceMigrationHelper";

// Legacy service (for migration period)
export { CodexService as LegacyCodexService } from "./CodexService";

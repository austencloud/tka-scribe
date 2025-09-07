// Clean barrel exports - export everything from all modules
export * from "./application";
export * from "./background";
export * from "./device";
export * from "./foundation";
export * from "./inversify";
export * from "./navigation";
export * from "./pictograph";
export * from "./settings";
export * from "./utils";
export * from "./validation";

// Explicitly export enums as values to ensure they're available for runtime use
export { DeviceType } from "./pictograph/domain/enums/enums";

// Explicitly export foundation utilities that are needed
export {
  safeLocalStorageGet,
  safeLocalStorageRemove,
  safeLocalStorageSet,
  safeSessionStorageGet,
  safeSessionStorageRemove,
  safeSessionStorageSet,
} from "./foundation/utils/safe-storage";

export {
  downloadBlob,
  downloadBlobBatch,
  generateTimestampedFilename,
  getFileExtensionForMimeType,
  sanitizeFilename,
  supportsFileDownload,
} from "./foundation/utils/file-download";
export type {
  ValidationErrorInfo,
  ValidationResult,
} from "./validation/ValidationResult";

// Export main application component
export { default as MainApplication } from "./application/components/MainApplication.svelte";

// Export Pictograph component as named export
export { default as Pictograph } from "./pictograph/components/Pictograph.svelte";

// Re-export module-specific domain types for global access
// Word-card module exports (avoid duplicates)
export type {
  ExportOptions,
  LayoutCalculationResult,
  PageCreationOptions,
  PageLayoutConfig,
  PageMargins,
  PageOrientation,
  PrintConfig,
  WordCardGridConfig,
  WordCardPaperSize,
} from "../modules/word-card/domain";

// Build module exports (avoid duplicates)
export type {
  GenerationOptions,
  LetterDerivationResult,
} from "../modules/build/generate/domain";
export type {
  BeatClickResult,
  BeatEditOperation,
  BeatEditResult,
  BeatFrameConfig,
  ConfigurationResult,
  ContainerDimensions,
  DeleteConfirmationData,
  DeleteResult,
  LayoutInfo,
  // OptionPickerLayoutCalculationParams, // Import from option picker domain
  // OptionPickerLayoutCalculationResult, // Import from option picker domain
  SequenceCreateRequest,
  SequenceCreationParams,
  SequenceCreationResult,
  WorkbenchConfig,
  WorkbenchMode,
} from "../modules/build/workbench/domain";

// Animator module exports
export type {
  AnimatedMotionParams,
  LetterIdentificationResult,
  MotionEndpoints,
  PropState,
  PropStates,
} from "../modules/animator/domain";

// Learn/Codex module exports
export { createLetterMapping } from "../modules/learn/codex/domain";
export type {
  CodexConfig,
  CodexLetterMapping,
  CodexLetterRow,
  CodexTransformationOperation,
} from "../modules/learn/codex/domain";

// Learn/Quiz module exports
export {
  QuizAnswerFeedback,
  QuizAnswerFormat,
  QuizMode,
  QuizQuestionFormat,
  QuizType,
} from "../modules/learn/quiz/domain";
export type {
  QuizAnswerOption,
  QuizAnswerResult,
  QuizConfig,
  QuizInfo,
  QuizProgress,
  QuizQuestionData,
  QuizResults,
  QuizSession,
  QuizTimerState,
} from "../modules/learn/quiz/domain";
export {
  LESSON_CONFIGS,
  LESSON_INFO,
  LESSON_TYPE_NAMES,
  QUIZ_DEFAULTS,
  QUIZ_MODE_NAMES,
} from "../modules/learn/quiz/domain/constants";

// CSV handling exports (from build module)
export type {
  CSVParseResult,
  CsvDataSet,
  ParsedCsvRow,
} from "../modules/build/generate/domain/csv-handling/CsvModels";

// Browse/Gallery module exports
export type {
  GalleryFilterValue,
  SectionConfig,
  SequenceSection,
} from "../modules/browse/gallery/domain";
export {
  GalleryFilterType,
  GallerySortMethod,
} from "../modules/browse/gallery/domain/enums/gallery-enums";

// Option Picker module exports
export type {
  LayoutCalculationParams,
  OptionPickerGridConfig,
  OptionPickerLayoutCalculationParams,
  OptionPickerLayoutCalculationResult,
  ResponsiveLayoutConfig,
} from "../modules/build/construct/option-picker/domain";

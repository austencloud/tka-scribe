/**
 * Service Contracts Index
 *
 * Central export for all service behavioral contracts.
 * These define what operations and behaviors are available.
 */

// ENTERPRISE PATTERN: One-to-one interface-to-implementation mapping
// Organized by domain structure that mirrors implementations

// Animation Domain
export * from "./animator/IAnimationControlService";
export * from "./animator/IAnimationStateService";
export * from "./animator/IBeatCalculationService";
export * from "./animator/IPropInterpolationService";
export * from "./animator/ISequenceAnimationEngine";
export * from "./animator/ISequenceAnimationOrchestrator";

// Application Domain
export * from "./build/construct/IConstructTabCoordinator";
export * from "./build/construct/option-picker/IOptionDataService";
export * from "./build/construct/start-position-picker/IStartPositionSelectionService";
export * from "./build/construct/start-position-picker/IStartPositionService";
export * from "./core/application/IApplicationInitializer";
export * from "./core/data/ICSVLoader";
export * from "./core/data/ICSVParser";
export * from "./core/data/IEnumMapper";
export * from "./core/device/IDeviceDetector";
export * from "./core/settings/ISettingsService";
export * from "./learn/ICodexService";

// Background Domain
export * from "./core/background/IBackgroundFactory";
export * from "./core/background/IBackgroundService";
export * from "./core/background/IBackgroundSystem";

// Build Domain - TODO: Move to individual interface files
export * from "./build/build-interfaces";

// Browse Domain
export * from "./browse/browse-interfaces";
export * from "./browse/IBrowseSectionService";
export * from "./browse/IMetadataExtractionService";

// Beat Frame Domain
export * from "./build/workbench/beat-frame-interfaces";

// Beat Grid Domain
export * from "./build/export/beat-grid-interfaces";

// Beat Fallback Domain
export * from "./build/export/beat-fallback-interfaces";

// Data Domain - Selective exports to avoid conflicts
export type {
  ILetterQueryHandler,
  IMotionQueryHandler,
} from "./core/data/data-interfaces";

// Export Domain
export * from "./build/export/export-interfaces";
export * from "./build/export/IBatchExportService";

// Generation Domain - Selective exports to avoid conflicts
export type {
  IDirectionCalculator,
  ILetterDeriver,
  ILetterGenerator,
  IOrientationCalculationService,
  IPictographGenerator,
  IPictographValidatorService,
  IPositionPatternService,
  ISequenceGenerationService,
} from "./build/generate/generate-interfaces";

// NOTE: Domain types should be imported directly from $domain, not re-exported from contracts

// Image Export Domain
export * from "./build/export/image-export-interfaces";

// Pictograph Domain - Selective exports to avoid conflicts
export type {
  IArrowRenderer,
  IFallbackArrowService,
  IGridRenderingService,
  IOverlayRenderer,
  ISvgColorTransformer,
  ISvgConfiguration,
  ISvgLoader,
  ISvgParser,
  ISvgUtilityService,
} from "./core/pictograph/pictograph-interfaces";

// TODO: Replace these consolidated interface files with individual domain-organized interfaces
// Following the one-to-one interface-to-implementation pattern

// Learn Domain - Individual interfaces (correct pattern)
export * from "./learn/ILessonRepository";
export * from "./learn/ILetterMappingRepository";

// Sequence Domain - Individual interface (correct pattern)
export * from "./build/workbench/ISequenceStateService";

// Temporary exports until migration to individual interfaces is complete
// TEMPORARILY REMOVED: export * from "./animator-interfaces"; (conflicts with IAnimationControlService)
export type { IMotionParameterService } from "./animator/animator-interfaces";
export * from "./browse/browse-panel-interfaces";
export * from "./build/construct/option-picker/option-picker-interfaces";
// TEMPORARILY REMOVED: export * from "./pictograph-interfaces"; (conflicts with IArrowPathResolutionService, IArrowPositioningService)
// Positioning Domain - Explicit exports to avoid conflicts
export * from "./build/construct/option-picker/responsive-layout-interfaces";
export * from "./core/pictograph/positioning/positioning-interfaces";

// Export sequence-interfaces but exclude conflicting types that are now in browse domain
// Only export service interfaces, not data models (which belong in domain)
export {
  type IPageFactoryService,
  type IPersistenceService,
  type IPrintablePageLayoutService,
  type ISequenceCardExportIntegrationService,
  type ISequenceDeletionService,
  type ISequenceDomainService,
  type ISequenceImportService,
  // Service interfaces (excluding conflicting IDeleteService)
  type ISequenceService,
  type IWorkbenchBeatOperationsService,
} from "./build/workbench/sequence-interfaces";

// NOTE: Domain types should be imported directly from $domain, not re-exported from contracts

// TEMPORARILY REMOVED: export * from "./sequence-state-interfaces"; (conflicts with ISequenceStateService)
export * from "./build/export/svg-conversion-interfaces";
export * from "./build/export/text-rendering-interfaces";
export * from "./build/workbench/workbench-interfaces";

// Movement Domain - Individual interfaces (correct pattern)
export * from "./core/data/ICsvPictographParserService";

// Utility Services
export * from "./core/application/IErrorHandlingService";
export * from "./core/pictograph/positioning/IBetaDetectionService";

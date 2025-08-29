/**
 * Interfaces Barrel Export
 *
 * Central export point for all service interfaces.
 * This provides a clean API for importing service interfaces throughout the application.
 */

// ============================================================================
// CORE TYPES AND DOMAIN MODELS
// ============================================================================

// Core types
export type {
  ArrowPlacementConfig,
  Coordinates,
  DifficultyLevel,
  GridData,
  GridMode,
  GridPoint,
  HandRotDir,
  LegacyArrowData,
  OptionFilters,
  PropPlacementData,
  PropPosition,
  ServiceInterface,
} from "./core-types";

// ArrowPosition is now exported from positioning/types.ts
export type { ArrowPosition } from "../positioning/types";

export { defineService } from "./core-types";

// Domain types
export type {
  ArrowPlacementData,
  BeatData,
  BrowseDisplayState,
  BrowseLoadingState,
  CacheConfig,
  CacheEntry,
  DeviceCapabilities,
  ExportOptions,
  ExportResult,
  FilterType,
  FilterValue,
  LayoutConfig,
  Location,
  MotionData,
  MotionType,
  Orientation,
  PictographData,
  PrintLayoutOptions,
  ProgressInfo,
  RotationDirection,
  SequenceCardExportSettings,
  SequenceData,
  SortMethod,
  ValidationResult,
} from "./domain-types";

// ============================================================================
// APPLICATION INTERFACES
// ============================================================================

export type { AppSettings } from "./application-interfaces";

// ============================================================================
// SEQUENCE INTERFACES
// ============================================================================

export type {
  IPersistenceService,
  ISequenceDomainService,
  ISequenceService,
  SequenceCreateRequest,
} from "./sequence-interfaces";

// ============================================================================
// PICTOGRAPH INTERFACES
// ============================================================================

export type {
  ArrowSvgData,
  IArrowPathResolutionService,
  IArrowPositioningService,
  IArrowRenderingService,
  IDataTransformer,
  IFallbackArrowService,
  IGridRenderingService,
  IOverlayRenderingService,
  ISvgColorTransformationService,
  ISvgConfiguration,
  ISvgLoadingService,
  ISvgParsingService,
  ISvgUtilityService,
  SVGDimensions,
} from "./pictograph-interfaces";

// ============================================================================
// POSITIONING INTERFACES
// ============================================================================

export type {
  IArrowAdjustmentCalculator,
  IArrowAdjustmentLookup,
  IArrowCoordinateSystemService,
  IArrowLocationCalculator,
  IArrowPlacementKeyService,
  IArrowPlacementService,
  IArrowPositioningOrchestrator,
  IArrowRotationCalculator,
  IAttributeKeyGenerator,
  IBetaOffsetCalculator,
  IDashLocationCalculator,
  IDefaultPlacementService,
  IDefaultPlacementServiceJson,
  IDirectionalTupleCalculator,
  IDirectionalTupleProcessor,
  IGridModeDeriver,
  IPlacementKeyGenerator,
  IPositionMapper,
  IPropRenderingService,
  IQuadrantIndexCalculator,
  ISpecialPlacementOriKeyGenerator,
  ISpecialPlacementService,
  ITurnsTupleKeyGenerator,
  Point,
  Position,
} from "./positioning-interfaces";

// Note: IArrowPositioningOrchestrator is now exported with other positioning interfaces below

// ============================================================================
// GENERATION INTERFACES
// ============================================================================

export type {
  GenerationOptions,
  IMotionGenerationService,
  ISequenceGenerationService,
} from "./generation-interfaces";

// ============================================================================
// BROWSE INTERFACES
// ============================================================================

export type {
  BrowseState,
  DeleteConfirmationData,
  DeleteResult,
  FilterState,
  IBrowseService,
  IDeleteService,
  IFavoritesService,
  IFilterPersistenceService,
  INavigationService,
  ISectionService,
  ISequenceIndexService,
  IThumbnailService,
  NavigationItem,
  NavigationSection,
  SectionConfiguration,
  SequenceSection,
} from "./browse-interfaces";

// ============================================================================
// DEVICE INTERFACES
// ============================================================================

export type {
  IDeviceDetector,
  ResponsiveSettings,
} from "./application/IDeviceDetector";

// ============================================================================
// APPLICATION INTERFACES
// ============================================================================

export type { IApplicationInitializer as IApplicationInitializationService } from "./application/IApplicationInitializer";
export type { ICodexService } from "./application/ICodexService";
export type { IConstructTabCoordinator } from "./application/IConstructTabCoordinator";
export type { ICSVLoader } from "./application/ICSVLoader";
export type { ICSVParser } from "./application/ICSVParser";
export type { IEnumMapper } from "./application/IEnumMapper";
export type { IOptionDataService } from "./application/IOptionDataService";
export type { ISettingsService } from "./application/ISettingsService";
export type { IStartPositionService } from "./application/IStartPositionService";

// ============================================================================
// ANIMATION INTERFACES
// ============================================================================

export type { IAnimationControlService } from "./animation/IAnimationControlService";
export type {
  IAnimationStateService,
  InterpolationResult,
} from "./animation/IAnimationStateService";
export type {
  BeatCalculationResult,
  IBeatCalculationService,
} from "./animation/IBeatCalculationService";
export type { IPropInterpolationService } from "./animation/IPropInterpolationService";
export type {
  ISequenceAnimationEngine,
  PropStates,
  SequenceMetadata,
} from "./animation/ISequenceAnimationEngine";
export type { ISequenceAnimationOrchestrator } from "./animation/ISequenceAnimationOrchestrator";

// ============================================================================
// BACKGROUND INTERFACES
// ============================================================================

export type { IBackgroundFactory } from "./background/IBackgroundFactory";
export type { IBackgroundService } from "./background/IBackgroundService";
export type { IBackgroundSystem } from "./background/IBackgroundSystem";

// ============================================================================
// EXPORT INTERFACES
// ============================================================================

export type {
  IEnhancedExportService,
  IExportService,
  ISequenceCardBatchService,
  ISequenceCardCacheService,
  ISequenceCardImageService,
  ISequenceCardLayoutService,
  ISequenceCardPageService,
} from "./export-interfaces";

// ============================================================================
// TKA IMAGE EXPORT INTERFACES
// ============================================================================

export type {
  BeatRenderOptions,
  CompositionOptions,
  ExportError,
  ExportProgress,
  ExportValidationResult,
  IBeatRenderingService,
  ICanvasManagementService,
  IDimensionCalculationService,
  IExportConfigurationManager,
  IExportMemoryCalculator,
  IExportOptionsValidator,
  IExportSettingsService,
  IFileExportService,
  IFilenameGeneratorService,
  IFontManagementService,
  IGridOverlayService,
  IImageCompositionService,
  IImagePreviewGenerator,
  ILayoutCalculationService,
  IReversalDetectionService,
  ITextRenderingService,
  ITKAImageExportService,
  LayoutConstraints,
  LayoutData,
  MemoryEstimate,
  RenderQualitySettings,
  TextRenderOptions,
  TKAImageExportOptions,
  UserInfo,
} from "./image-export-interfaces";

// Text rendering component interfaces
export type {
  IDifficultyBadgeRenderer,
  ITextRenderingUtils,
  IUserInfoRenderer,
  IWordTextRenderer,
} from "./text-rendering-interfaces";

export {
  IBeatRenderingServiceInterface,
  ICanvasManagementServiceInterface,
  IDimensionCalculationServiceInterface,
  IExportConfigurationManagerInterface,
  IExportMemoryCalculatorInterface,
  IExportOptionsValidatorInterface,
  IExportSettingsServiceInterface,
  IFileExportServiceInterface,
  IFilenameGeneratorServiceInterface,
  IFontManagementServiceInterface,
  IGridOverlayServiceInterface,
  IImageCompositionServiceInterface,
  IImagePreviewGeneratorInterface,
  ILayoutCalculationServiceInterface,
  IReversalDetectionServiceInterface,
  ITextRenderingServiceInterface,
  ITKAImageExportServiceInterface,
} from "./image-export-interfaces";

// Text rendering component DI interfaces
export {
  IDifficultyBadgeRendererInterface,
  ITextRenderingUtilsInterface,
  IUserInfoRendererInterface,
  IWordTextRendererInterface,
} from "./image-export-interfaces";

// ============================================================================
// PANEL INTERFACES
// ============================================================================

export type {
  IPanelManagementService,
  PanelConfiguration,
  PanelState,
  ResizeDirection,
  ResizeOperation,
} from "./panel-interfaces";

// ============================================================================
// METADATA TESTING INTERFACES
// ============================================================================

export type {
  IBatchAnalysisService,
  IMetadataAnalysisService,
  IMetadataExtractionService,
  ISequenceDiscoveryService,
} from "./metadata-testing-interfaces";

// ============================================================================
// OPTION PICKER INTERFACES
// ============================================================================

export type {
  IOptionPickerDataService,
  IOptionPickerLayoutService,
  OptionPickerGridConfiguration,
  OptionPickerLayoutCalculationParams,
  OptionPickerLayoutCalculationResult,
  OptionPickerLayoutDimensions,
} from "./option-picker-interfaces";

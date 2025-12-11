/**
 * InversifyJS Service Type Identifiers
 *
 * This file defines all the service identifiers used by the InversifyJS container.
 * These replace the string-based tokens from the old custom DI system.
 */

// Core Service Types
export const TYPES = {
  // === CORE SERVICES ===
  ISequenceService: Symbol.for("ISequenceService"),
  ISequenceDomainService: Symbol.for("ISequenceDomainService"),
  ISequenceAnalysisService: Symbol.for("ISequenceAnalysisService"),
  ISequenceValidationService: Symbol.for("ISequenceValidationService"),
  ISequenceStatisticsService: Symbol.for("ISequenceStatisticsService"),
  ISequenceTransformationService: Symbol.for("ISequenceTransformationService"),
  ISequenceImportService: Symbol.for("ISequenceImportService"),
  ISequenceDeletionService: Symbol.for("ISequenceDeletionService"),
  ISequenceTransformService: Symbol.for("ISequenceTransformService"),
  ISequenceExportService: Symbol.for("ISequenceExportService"),
  ISequencePersistenceService: Symbol.for("ISequencePersistenceService"),
  IPersistenceService: Symbol.for("IPersistenceService"),
  IPersistenceInitializationService: Symbol.for(
    "IPersistenceInitializationService"
  ),
  ISettingsState: Symbol.for("ISettingsState"),
  ISettingsPersistenceService: Symbol.for("ISettingsPersistenceService"),
  IDeviceDetector: Symbol.for("IDeviceDetector"),
  IResourceTracker: Symbol.for("IResourceTracker"),
  IPanelManagementService: Symbol.for("IPanelManagementService"),

  // === FOUNDATION SERVICES ===
  IFileDownloadService: Symbol.for("IFileDownloadService"),
  IStorageService: Symbol.for("IStorageService"),
  ISeoService: Symbol.for("ISeoService"),
  ISvgImageService: Symbol.for("ISvgImageService"),

  // === APPLICATION SERVICES ===
  IComponentManagementService: Symbol.for("IComponentManagementService"),
  IDataTransformationService: Symbol.for("IDataTransformationService"),
  IPictographCoordinator: Symbol.for("IPictographCoordinator"),
  IAnimationService: Symbol.for("IAnimationService"),
  IHapticFeedbackService: Symbol.for("IHapticFeedbackService"),
  IRippleEffectService: Symbol.for("IRippleEffectService"),

  // === AUTH SERVICES ===
  IAuthService: Symbol.for("IAuthService"),

  // === MOBILE SERVICES ===
  IMobileFullscreenService: Symbol.for("IMobileFullscreenService"),
  IPlatformDetectionService: Symbol.for("IPlatformDetectionService"),
  IGestureService: Symbol.for("IGestureService"),
  IPWAEngagementService: Symbol.for("IPWAEngagementService"),
  IPWAInstallDismissalService: Symbol.for("IPWAInstallDismissalService"),

  // === NAVIGATION UI SERVICES ===
  IViewportService: Symbol.for("IViewportService"),
  IModuleSelectionService: Symbol.for("IModuleSelectionService"),
  IKeyboardNavigationService: Symbol.for("IKeyboardNavigationService"),
  ISheetRouterService: Symbol.for("ISheetRouterService"),
  ISequenceEncoderService: Symbol.for("ISequenceEncoderService"),
  ISequenceViewerService: Symbol.for("ISequenceViewerService"),
  IURLSyncService: Symbol.for("IURLSyncService"),
  IDeepLinkService: Symbol.for("IDeepLinkService"),
  ILetterDeriverService: Symbol.for("ILetterDeriverService"),
  IPositionDeriverService: Symbol.for("IPositionDeriverService"),

  // === KEYBOARD SHORTCUT SERVICES ===
  IKeyboardShortcutService: Symbol.for("IKeyboardShortcutService"),
  IShortcutRegistryService: Symbol.for("IShortcutRegistryService"),
  ICommandPaletteService: Symbol.for("ICommandPaletteService"),
  IShortcutCustomizationService: Symbol.for("IShortcutCustomizationService"),

  // === Create Module ServiceS ===
  ICreateModuleService: Symbol.for("ICreateModuleService"),
  ICreateModuleHandlers: Symbol.for("ICreateModuleHandlers"),
  ICreateModuleInitializationService: Symbol.for(
    "ICreateModuleInitializationService"
  ),
  ICreateModuleEffectCoordinator: Symbol.for("ICreateModuleEffectCoordinator"),
  ICreationMethodPersistenceService: Symbol.for(
    "ICreationMethodPersistenceService"
  ),
  IDeepLinkSequenceService: Symbol.for("IDeepLinkSequenceService"),
  ICreateModuleLayoutService: Symbol.for("ICreateModuleLayoutService"),
  IResponsiveLayoutService: Symbol.for("IResponsiveLayoutService"),
  INavigationSyncService: Symbol.for("INavigationSyncService"),
  IBeatOperationsService: Symbol.for("IBeatOperationsService"),
  IKeyboardArrowAdjustmentService: Symbol.for(
    "IKeyboardArrowAdjustmentService"
  ),
  IUndoService: Symbol.for("IUndoService"),
  IQuizSessionService: Symbol.for("IQuizSessionService"),
  IQuizResultsAnalyzer: Symbol.for("IQuizResultsAnalyzer"),
  ITurnControlService: Symbol.for("ITurnControlService"),
  // === WRITE TAB SERVICES ===
  IActService: Symbol.for("IActService"),
  IMusicPlayerService: Symbol.for("IMusicPlayerService"),
  // === OPTION PICKER SERVICES ===
  IOptionPickerSizingService: Symbol.for("IOptionPickerSizingService"),
  IOptionPickerFilterPersistenceService: Symbol.for(
    "IOptionPickerFilterPersistenceService"
  ),
  IReversalChecker: Symbol.for("IReversalChecker"),
  IPositionAnalyzer: Symbol.for("IPositionAnalyzer"),
  IOptionSorter: Symbol.for("IOptionSorter"),
  IOptionFilter: Symbol.for("IOptionFilter"),
  IOptionOrganizerService: Symbol.for("IOptionOrganizerService"),
  IOptionLoader: Symbol.for("IOptionLoader"),
  ILayoutDetectionService: Symbol.for("ILayoutDetectionService"),
  IOptionTransitionCoordinator: Symbol.for("IOptionTransitionCoordinator"),
  ISectionTitleFormatter: Symbol.for("ISectionTitleFormatter"),

  // === START POSITION PICKER SERVICES ===
  // Simplified - only the core service needed

  // === RENDERING SERVICES ===
  ISvgUtilityService: Symbol.for("ISvgUtilityService"),
  ISvgPreloadService: Symbol.for("ISvgPreloadService"),
  ISvgConfig: Symbol.for("ISvgConfig"),
  IDataTransformer: Symbol.for("IDataTransformer"),
  IGridRenderingService: Symbol.for("IGridRenderingService"),
  IGridService: Symbol.for("IGridService"),
  IArrowRenderer: Symbol.for("IArrowRenderer"),
  IArrowLifecycleManager: Symbol.for("IArrowLifecycleManager"),

  // === ARROW RENDERING SERVICES ===
  IArrowPathResolver: Symbol.for("IArrowPathResolver"),
  IArrowSvgLoader: Symbol.for("IArrowSvgLoader"),
  IArrowSvgParser: Symbol.for("IArrowSvgParser"),
  IArrowSvgColorTransformer: Symbol.for("IArrowSvgColorTransformer"),

  IOverlayRenderer: Symbol.for("IOverlayRenderer"),
  IPropSvgLoader: Symbol.for("IPropSvgLoader"),

  // === POSITIONING SERVICES ===
  IArrowPositioningOrchestrator: Symbol.for("IArrowPositioningOrchestrator"),
  IArrowAdjustmentCalculator: Symbol.for("IArrowAdjustmentCalculator"),
  IGridPositionDeriver: Symbol.for("IGridPositionDeriver"),
  IPositionCalculatorService: Symbol.for("IPositionCalculatorService"),
  IOrientationCalculator: Symbol.for("IOrientationCalculator"),

  // === MOVEMENT SERVICES ===
  IPositionPatternService: Symbol.for("IPositionPatternService"),
  IPictographValidatorService: Symbol.for("IPictographValidatorService"),
  IGridModeDeriver: Symbol.for("IGridModeDeriver"),

  // === BROWSE SERVICES ===
  // Specialized Explore services (no orchestration layer - use directly!)
  IDiscoverThumbnailService: Symbol.for("IDiscoverThumbnailService"),
  IDiscoverCacheService: Symbol.for("IDiscoverCacheService"),
  IDiscoverFilterService: Symbol.for("IDiscoverFilterService"),
  IDiscoverLoader: Symbol.for("IDiscoverLoader"),
  IDiscoverMetadataExtractor: Symbol.for("IDiscoverMetadataExtractor"),
  IDiscoverSortService: Symbol.for("IDiscoverSortService"),
  IOptimizedDiscoverService: Symbol.for("IOptimizedDiscoverService"),
  INavigationService: Symbol.for("INavigationService"),
  IFavoritesService: Symbol.for("IFavoritesService"),
  IDeleteService: Symbol.for("IDeleteService"),
  IDiscoverEventHandlerService: Symbol.for("IDiscoverEventHandlerService"),
  ISectionService: Symbol.for("ISectionService"),
  ISequenceIndexService: Symbol.for("ISequenceIndexService"),
  IDiscoverPanelManager: Symbol.for("IDiscoverPanelManager"),
  IFilterPersistenceService: Symbol.for("IFilterPersistenceService"),
  ISequenceDifficultyCalculator: Symbol.for("ISequenceDifficultyCalculator"),

  // === COMMUNITY SERVICES ===
  ILeaderboardService: Symbol.for("ILeaderboardService"),
  ICommunityStatsService: Symbol.for("ICommunityStatsService"),
  IUserService: Symbol.for("IUserService"),

  // === WORKBENCH SERVICES ===
  IWorkbenchService: Symbol.for("IWorkbenchService"),
  IBuildConstructTabCoordinator: Symbol.for("IBuildConstructTabCoordinator"),
  IStartPositionService: Symbol.for("IStartPositionService"), // UNIFIED SERVICE

  // === EXPORT SERVICES ===
  IExportService: Symbol.for("IExportService"),
  IShareService: Symbol.for("IShareService"),
  IInstagramLinkService: Symbol.for("IInstagramLinkService"),
  IMediaBundlerService: Symbol.for("IMediaBundlerService"),
  IFirebaseVideoUploadService: Symbol.for("IFirebaseVideoUploadService"),
  IRecordingPersistenceService: Symbol.for("IRecordingPersistenceService"),
  ICollaborativeVideoService: Symbol.for("ICollaborativeVideoService"),
  IPageImageExportService: Symbol.for("IPageImageExportService"),
  IPageFactoryService: Symbol.for("IPageFactoryService"),
  IPrintablePageLayoutService: Symbol.for("IPrintablePageLayoutService"),
  IWordCardExportIntegrationService: Symbol.for(
    "IWordCardExportIntegrationService"
  ),
  IWordCardExportOrchestrator: Symbol.for("IWordCardExportOrchestrator"),
  IWordCardImageGenerationService: Symbol.for(
    "IWordCardImageGenerationService"
  ),
  IWordCardImageConversionService: Symbol.for(
    "IWordCardImageConversionService"
  ),
  IWordCardBatchProcessingService: Symbol.for(
    "IWordCardBatchProcessingService"
  ),
  IWordCardExportProgressTracker: Symbol.for("IWordCardExportProgressTracker"),
  IWordCardCacheService: Symbol.for("IWordCardCacheService"),
  IWordCardSVGCompositionService: Symbol.for("IWordCardSVGCompositionService"),
  IWordCardMetadataOverlayService: Symbol.for(
    "IWordCardMetadataOverlayService"
  ),
  IImageFormatConverterService: Symbol.for("IImageFormatConverterService"),
  ISVGToCanvasConverterService: Symbol.for("ISVGToCanvasConverterService"),

  // === IMAGE EXPORT SERVICES ===
  ITKAImageExportService: Symbol.for("ITKAImageExportService"),
  ICanvasManagementService: Symbol.for("ICanvasManagementService"),
  IImageCompositionService: Symbol.for("IImageCompositionService"),
  ILayoutCalculationService: Symbol.for("ILayoutCalculationService"),
  IDimensionCalculationService: Symbol.for("IDimensionCalculationService"),
  IFilenameGeneratorService: Symbol.for("IFilenameGeneratorService"),

  // === RENDER SERVICES ===
  ISequenceRenderService: Symbol.for("ISequenceRenderService"),
  ITextRenderingService: Symbol.for("ITextRenderingService"),
  IGlyphCacheService: Symbol.for("IGlyphCacheService"),
  IExportConfigManager: Symbol.for("IExportConfigManager"),
  IExportOptionsValidator: Symbol.for("IExportOptionsValidator"),
  IExportMemoryCalculator: Symbol.for("IExportMemoryCalculator"),
  IImagePreviewGenerator: Symbol.for("IImagePreviewGenerator"),
  IReversalDetectionService: Symbol.for("IReversalDetectionService"),

  // === GENERATION SERVICES ===
  // Refactored Generation Services (Single Responsibility)
  IRandomSelectionService: Symbol.for("IRandomSelectionService"),
  IPictographFilterService: Symbol.for("IPictographFilterService"),
  IBeatConverterService: Symbol.for("IBeatConverterService"),
  ITurnManagementService: Symbol.for("ITurnManagementService"),
  ISequenceMetadataService: Symbol.for("ISequenceMetadataService"),
  // New Focused Generation Services (replaced monolithic SequenceGenerationService)
  IStartPositionSelector: Symbol.for("IStartPositionSelector"),
  ITurnAllocationCalculator: Symbol.for("ITurnAllocationCalculator"),
  IBeatGenerationOrchestrator: Symbol.for("IBeatGenerationOrchestrator"),
  IPartialSequenceGenerator: Symbol.for("IPartialSequenceGenerator"),
  // Circular Generation (CAP) Services
  ICAPParameterProvider: Symbol.for("ICAPParameterProvider"), // NEW: Consolidated CAP parameter service
  IRotatedEndPositionSelector: Symbol.for("IRotatedEndPositionSelector"),
  ICAPEndPositionSelector: Symbol.for("ICAPEndPositionSelector"),
  IStrictRotatedCAPExecutor: Symbol.for("IStrictRotatedCAPExecutor"),
  IStrictMirroredCAPExecutor: Symbol.for("IStrictMirroredCAPExecutor"),
  IStrictSwappedCAPExecutor: Symbol.for("IStrictSwappedCAPExecutor"),
  IStrictInvertedCAPExecutor: Symbol.for(
    "IStrictInvertedCAPExecutor"
  ),
  IMirroredSwappedCAPExecutor: Symbol.for("IMirroredSwappedCAPExecutor"),
  ISwappedInvertedCAPExecutor: Symbol.for(
    "ISwappedInvertedCAPExecutor"
  ),
  IMirroredInvertedCAPExecutor: Symbol.for(
    "IMirroredInvertedCAPExecutor"
  ),
  IRotatedSwappedCAPExecutor: Symbol.for("IRotatedSwappedCAPExecutor"),
  IRotatedInvertedCAPExecutor: Symbol.for(
    "IRotatedInvertedCAPExecutor"
  ),
  IMirroredRotatedCAPExecutor: Symbol.for("IMirroredRotatedCAPExecutor"),
  IMirroredRotatedInvertedCAPExecutor: Symbol.for(
    "IMirroredRotatedInvertedCAPExecutor"
  ),
  IMirroredSwappedInvertedCAPExecutor: Symbol.for(
    "IMirroredSwappedInvertedCAPExecutor"
  ),
  IMirroredRotatedInvertedSwappedCAPExecutor: Symbol.for(
    "IMirroredRotatedInvertedSwappedCAPExecutor"
  ),
  ICAPExecutorSelector: Symbol.for("ICAPExecutorSelector"),
  // Generation UI Services (SRP Refactoring - Dec 2024)
  IResponsiveTypographyService: Symbol.for("IResponsiveTypographyService"),
  ICardConfigurationService: Symbol.for("ICardConfigurationService"),
  ICAPTypeService: Symbol.for("ICAPTypeService"),
  IGenerationOrchestrationService: Symbol.for(
    "IGenerationOrchestrationService"
  ),
  IPresetFormatterService: Symbol.for("IPresetFormatterService"),

  // === CODEX SERVICES ===
  ILetterQueryHandler: Symbol.for("ILetterQueryHandler"),
  IPictographTransformationService: Symbol.for(
    "IPictographTransformationService"
  ),
  ICodexLetterMappingRepo: Symbol.for("ICodexLetterMappingRepo"),

  // === ANIMATOR SERVICES ===
  ISequenceAnimationOrchestrator: Symbol.for("ISequenceAnimationOrchestrator"),
  IAnimationLoopService: Symbol.for("IAnimationLoopService"),
  IAnimationPlaybackController: Symbol.for("IAnimationPlaybackController"),
  IAnimationStateService: Symbol.for("IAnimationStateService"),
  IBeatCalculationService: Symbol.for("IBeatCalculationService"),
  IPropInterpolationService: Symbol.for("IPropInterpolationService"),
  ISequenceLoopabilityChecker: Symbol.for("ISequenceLoopabilityChecker"),
  IAnimationStorageService: Symbol.for("IAnimationStorageService"),

  // Animator Calculation Services
  IAngleCalculator: Symbol.for("IAngleCalculator"),
  ICoordinateUpdater: Symbol.for("ICoordinateUpdater"),
  IMotionCalculator: Symbol.for("IMotionCalculator"),
  IEndpointCalculator: Symbol.for("IEndpointCalculator"),

  // Animator Rendering Services
  ICanvasRenderer: Symbol.for("ICanvasRenderer"),
  IPixiAnimationRenderer: Symbol.for("IPixiAnimationRenderer"),
  ISVGGenerator: Symbol.for("ISVGGenerator"),
  IGifExportService: Symbol.for("IGifExportService"),
  IVideoExportService: Symbol.for("IVideoExportService"),
  IAnimatedImageTranscoder: Symbol.for("IAnimatedImageTranscoder"),
  IGifExportOrchestrator: Symbol.for("IGifExportOrchestrator"),

  // Animator Trail Services
  ITrailCaptureService: Symbol.for("ITrailCaptureService"),

  // Animator Mode-Specific Services
  ISequenceNormalizationService: Symbol.for("ISequenceNormalizationService"),
  ITunnelModeSequenceManager: Symbol.for("ITunnelModeSequenceManager"),

  // === APPLICATION SERVICES ===
  IApplicationInitializer: Symbol.for("IApplicationInitializer"),

  // === SHARED SERVICES ===
  IEnumMapper: Symbol.for("IEnumMapper"),
  ICSVParser: Symbol.for("ICSVParser"),

  // === ADDITIONAL SERVICES ===
  IMotionQueryHandler: Symbol.for("IMotionQueryHandler"),
  ILetterDeriver: Symbol.for("ILetterDeriver"),
  ICSVLoader: Symbol.for("ICsvLoader"),

  // === MISSING SERVICES ===
  IQuizRepoManager: Symbol.for("IQuizRepoManager"),

  // Learn Module
  ICodexService: Symbol.for("ICodexService"),
  ICodexPictographUpdater: Symbol.for("ICodexPictographUpdater"),
  IAngleCalculationService: Symbol.for("IAngleCalculationService"),
  IMotionCalculationService: Symbol.for("IMotionCalculationService"),
  IEndpointCalculationService: Symbol.for("IEndpointCalculationService"),
  ICoordinateUpdateService: Symbol.for("ICoordinateUpdateService"),

  IAnimatedPictographDataService: Symbol.for("IAnimatedPictographDataService"),
  IBackgroundManager: Symbol.for("IBackgroundManager"),
  IBackgroundRenderingService: Symbol.for("IBackgroundRenderingService"),
  IBackgroundPreloader: Symbol.for("IBackgroundPreloader"),
  IBackgroundConfigurationService: Symbol.for(
    "IBackgroundConfigurationService"
  ),

  // === DEEP OCEAN BACKGROUND SERVICES ===
  IBackgroundSystem: Symbol.for("IBackgroundSystem"),
  IBubblePhysics: Symbol.for("IBubblePhysics"),
  IMarineLifeAnimator: Symbol.for("IMarineLifeAnimator"),
  IParticleSystem: Symbol.for("IParticleSystem"),
  IFishSpriteManager: Symbol.for("IFishSpriteManager"),
  IOceanRenderer: Symbol.for("IOceanRenderer"),
  ILightRayCalculator: Symbol.for("ILightRayCalculator"),

  INightSkyCalculationService: Symbol.for("INightSkyCalculationService"),
  IBrowseStatePersister: Symbol.for("IBrowseStatePersister"),
  IArrowPlacementService: Symbol.for("IArrowPlacementService"),
  IMotionParameterService: Symbol.for("IMotionParameterService"),
  IAnimationControlService: Symbol.for("IAnimationControlService"),
  IMotionLetterIdentificationService: Symbol.for(
    "IMotionLetterIdentificationService"
  ),
  ICSVPictographLoader: Symbol.for("ICSVPictographLoader"),
  ICSVPictographParser: Symbol.for("ICSVPictographParser"),
  IArrowLocationService: Symbol.for("IArrowLocationService"),
  IArrowPlacementKeyService: Symbol.for("IArrowPlacementKeyService"),
  IPropPlacementService: Symbol.for("IPropPlacementService"),
  IValidationService: Symbol.for("IValidationService"),

  // === MISSING TYPES ===
  IArrowPathResolutionService: Symbol.for("IArrowPathResolutionService"),

  IUltimatePictographRenderingService: Symbol.for(
    "IUltimatePictographRenderingService"
  ),

  // === MISSING ARROW POSITIONING TYPES ===
  IDirectionCalculator: Symbol.for("IDirectionCalculator"),
  IArrowLocationCalculator: Symbol.for("IArrowLocationCalculator"),
  IArrowRotationCalculator: Symbol.for("IArrowRotationCalculator"),
  IDashLocationCalculator: Symbol.for("IDashLocationCalculator"),
  IArrowGridCoordinateService: Symbol.for("IArrowGridCoordinateService"),
  ISpecialPlacementService: Symbol.for("ISpecialPlacementService"),
  ISpecialPlacementDataService: Symbol.for("ISpecialPlacementDataService"),
  ILetterClassificationService: Symbol.for("ILetterClassificationService"),
  ITurnsTupleGeneratorService: Symbol.for("ITurnsTupleGeneratorService"),
  ISpecialPlacementLookupService: Symbol.for("ISpecialPlacementLookupService"),
  IDefaultPlacementService: Symbol.for("IDefaultPlacementService"),
  ISpecialPlacementOriKeyGenerator: Symbol.for(
    "ISpecialPlacementOriKeyGenerator"
  ),
  ArrowPlacementKeyService: Symbol.for("ArrowPlacementKeyService"),
  ITurnsTupleKeyGenerator: Symbol.for("ITurnsTupleKeyGenerator"),
  IAttributeKeyGenerator: Symbol.for("IAttributeKeyGenerator"),
  IRotationAngleOverrideKeyGenerator: Symbol.for(
    "IRotationAngleOverrideKeyGenerator"
  ),
  IHandpathDirectionCalculator: Symbol.for("IHandpathDirectionCalculator"),
  IRotationOverrideManager: Symbol.for("IRotationOverrideManager"),
  IDirectionalTupleProcessor: Symbol.for("IDirectionalTupleProcessor"),
  IDirectionalTupleCalculator: Symbol.for("IDirectionalTupleCalculator"),
  IQuadrantIndexCalculator: Symbol.for("IQuadrantIndexCalculator"),

  // === ARROW ORCHESTRATION TYPES ===
  IArrowAdjustmentProcessor: Symbol.for("IArrowAdjustmentProcessor"),
  IArrowCoordinateTransformer: Symbol.for("IArrowCoordinateTransformer"),
  IArrowDataProcessor: Symbol.for("IArrowDataProcessor"),
  IArrowQuadrantCalculator: Symbol.for("IArrowQuadrantCalculator"),

  // === MISSING IMAGE EXPORT TYPES ===
  IFileExportService: Symbol.for("IFileExportService"),

  // === UTILITY SERVICES ===
  IBetaDetectionService: Symbol.for("IBetaDetectionService"),
  IErrorHandlingService: Symbol.for("IErrorHandlingService"),

  // === STATE SERVICES ===
  IAppState: Symbol.for("IAppState"),
  IAppStateInitializer: Symbol.for("IAppStateInitializer"),
  IApplicationStateService: Symbol.for("IApplicationStateService"),
  IMainTabState: Symbol.for("IMainTabState"),
  IPerformanceMetricsState: Symbol.for("IPerformanceMetricsState"),

  // === GAMIFICATION SERVICES ===
  IAchievementService: Symbol.for("IAchievementService"),
  IDailyChallengeService: Symbol.for("IDailyChallengeService"),
  IWeeklyChallengeService: Symbol.for("IWeeklyChallengeService"),
  ISkillProgressionService: Symbol.for("ISkillProgressionService"),
  IChallengeCoordinator: Symbol.for("IChallengeCoordinator"),
  INotificationService: Symbol.for("INotificationService"),
  IStreakService: Symbol.for("IStreakService"),

  // === ADMIN SERVICES ===
  ISystemStateService: Symbol.for("ISystemStateService"),
  IAuditLogService: Symbol.for("IAuditLogService"),
  IAdminChallengeService: Symbol.for("IAdminChallengeService"),
  IAnalyticsDataService: Symbol.for("IAnalyticsDataService"),
  IAnnouncementService: Symbol.for("IAnnouncementService"),

  // === ANALYTICS SERVICES ===
  IActivityLogService: Symbol.for("IActivityLogService"),

  // === LIBRARY SERVICES ===
  ILibraryService: Symbol.for("ILibraryService"),
  ICollectionService: Symbol.for("ICollectionService"),
  ILibraryActService: Symbol.for("ILibraryActService"),
  ILibraryQueryService: Symbol.for("ILibraryQueryService"),
  IForkService: Symbol.for("IForkService"),
  ILibraryMigrationService: Symbol.for("ILibraryMigrationService"),

  // === FEEDBACK SERVICES ===
  IFeedbackSortingService: Symbol.for("IFeedbackSortingService"),
  IFeedbackEditingService: Symbol.for("IFeedbackEditingService"),
  IFeedbackSubtaskService: Symbol.for("IFeedbackSubtaskService"),
  IFeedbackFormattingService: Symbol.for("IFeedbackFormattingService"),

  // === GESTURAL PATH BUILDER SERVICES ===
  IHandPathDirectionDetector: Symbol.for("IHandPathDirectionDetector"),
  ISwipeDetectionService: Symbol.for("ISwipeDetectionService"),
  IPathToMotionConverter: Symbol.for("IPathToMotionConverter"),

  // === TRAIN MODULE SERVICES ===
  IPositionDetectionService: Symbol.for("IPositionDetectionService"),
  IOrientationTracker: Symbol.for("IOrientationTracker"),
  ICameraService: Symbol.for("ICameraService"),
  IPerformanceScoringService: Symbol.for("IPerformanceScoringService"),
  IPerformanceRecordingService: Symbol.for("IPerformanceRecordingService"),
  ITrainPersistenceService: Symbol.for("ITrainPersistenceService"),

  // === TRAIN MODULE - HAND DETECTION SERVICES ===
  IHandLandmarkerService: Symbol.for("IHandLandmarkerService"),
  IHandednessAnalyzer: Symbol.for("IHandednessAnalyzer"),
  IHandStateAnalyzer: Symbol.for("IHandStateAnalyzer"),
  IHandTrackingStabilizer: Symbol.for("IHandTrackingStabilizer"),
  IHandAssignmentService: Symbol.for("IHandAssignmentService"),

  // === TRAIN MODULE - PRACTICE SERVICES ===
  IVoiceCommandService: Symbol.for("IVoiceCommandService"),

  // === TRAIN MODULE - CHALLENGES & PROGRESS ===
  ITrainChallengeService: Symbol.for("ITrainChallengeService"),
  IPerformanceHistoryService: Symbol.for("IPerformanceHistoryService"),

} as const;

// Type helper for getting service types
export type ServiceType = (typeof TYPES)[keyof typeof TYPES];

// Export individual type groups for easier imports
export const CoreTypes = {
  ISequenceService: TYPES.ISequenceService,
  ISequenceDomainService: TYPES.ISequenceDomainService,
  ISequenceValidationService: TYPES.ISequenceValidationService,
  ISequenceStatisticsService: TYPES.ISequenceStatisticsService,
  ISequenceTransformationService: TYPES.ISequenceTransformationService,
  IPersistenceService: TYPES.IPersistenceService,
  ISettingsState: TYPES.ISettingsState,
} as const;

export const RenderingTypes = {
  ISvgUtilityService: TYPES.ISvgUtilityService,
  IGridRenderingService: TYPES.IGridRenderingService,
  IGridService: TYPES.IGridService,
  IArrowRenderer: TYPES.IArrowRenderer,
} as const;

export const PositioningTypes = {
  IArrowPositioningOrchestrator: TYPES.IArrowPositioningOrchestrator,
  IGridPositionDeriver: TYPES.IGridPositionDeriver,
  IPositionCalculatorService: TYPES.IPositionCalculatorService,
} as const;

export const BackgroundTypes = {
  IBackgroundManager: TYPES.IBackgroundManager,
  IBackgroundRenderingService: TYPES.IBackgroundRenderingService,
  IBackgroundPreloader: TYPES.IBackgroundPreloader,
  IBackgroundConfigurationService: TYPES.IBackgroundConfigurationService,
  INightSkyCalculationService: TYPES.INightSkyCalculationService,

  // Deep Ocean Background Services
  IBackgroundSystem: TYPES.IBackgroundSystem,
  IBubblePhysics: TYPES.IBubblePhysics,
  IMarineLifeAnimator: TYPES.IMarineLifeAnimator,
  IParticleSystem: TYPES.IParticleSystem,
  IFishSpriteManager: TYPES.IFishSpriteManager,
  IOceanRenderer: TYPES.IOceanRenderer,
  ILightRayCalculator: TYPES.ILightRayCalculator,
} as const;

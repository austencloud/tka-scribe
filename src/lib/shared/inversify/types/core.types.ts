/**
 * Core Service Type Identifiers
 *
 * Fundamental services for sequence management, persistence, and settings.
 */

export const CoreTypes = {
  // Sequence Services
  ISequenceRepository: Symbol.for("ISequenceRepository"),
  ISequenceDomainService: Symbol.for("ISequenceDomainService"),
  ISequenceAnalysisService: Symbol.for("ISequenceAnalysisService"),
  ISequenceValidator: Symbol.for("ISequenceValidator"),
  ISequenceStatsCalculator: Symbol.for("ISequenceStatsCalculator"),
  ISequenceTransformationService: Symbol.for("ISequenceTransformationService"),
  ISequenceImportService: Symbol.for("ISequenceImportService"),
  ISequenceImporter: Symbol.for("ISequenceImporter"),
  ISequenceExportService: Symbol.for("ISequenceExportService"),
  ISequenceIndexer: Symbol.for("ISequenceIndexer"),
  ISequencePersister: Symbol.for("ISequencePersister"),

  // Persistence Services
  IPersistenceService: Symbol.for("IPersistenceService"),
  IPersistenceInitializationService: Symbol.for(
    "IPersistenceInitializationService"
  ),

  // Settings Services
  ISettingsState: Symbol.for("ISettingsState"),
  ISettingsPersistenceService: Symbol.for("ISettingsPersistenceService"),

  // Onboarding Services
  IOnboardingPersistenceService: Symbol.for("IOnboardingPersistenceService"),

  // Device & Resource
  IDeviceDetector: Symbol.for("IDeviceDetector"),
  IResourceTracker: Symbol.for("IResourceTracker"),
  IPanelManagementService: Symbol.for("IPanelManagementService"),

  // Application
  IApplicationInitializer: Symbol.for("IApplicationInitializer"),
  IComponentManagementService: Symbol.for("IComponentManagementService"),
  IDataTransformationService: Symbol.for("IDataTransformationService"),
  IPictographCoordinator: Symbol.for("IPictographCoordinator"),
  IAnimationService: Symbol.for("IAnimationService"),
  IHapticFeedbackService: Symbol.for("IHapticFeedbackService"),
  IRippleEffectService: Symbol.for("IRippleEffectService"),

  // State
  IAppState: Symbol.for("IAppState"),
  IAppStateInitializer: Symbol.for("IAppStateInitializer"),
  IApplicationStateService: Symbol.for("IApplicationStateService"),
  IMainTabState: Symbol.for("IMainTabState"),
  IPerformanceMetricsState: Symbol.for("IPerformanceMetricsState"),

  // Dashboard
  IFollowingFeedService: Symbol.for("IFollowingFeedService"),

  // Library Services
  ITagService: Symbol.for("ITagService"),

  // Utility
  IBetaDetectionService: Symbol.for("IBetaDetectionService"),
  IErrorHandlingService: Symbol.for("IErrorHandlingService"),
  IEnumMapper: Symbol.for("IEnumMapper"),
  ICSVParser: Symbol.for("ICSVParser"),
  ICSVLoader: Symbol.for("ICsvLoader"),
  IValidationService: Symbol.for("IValidationService"),
} as const;

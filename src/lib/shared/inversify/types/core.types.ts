/**
 * Core Service Type Identifiers
 *
 * Fundamental services for sequence management, persistence, and settings.
 */

export const CoreTypes = {
  // Sequence Services
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

  // Persistence Services
  IPersistenceService: Symbol.for("IPersistenceService"),
  IPersistenceInitializationService: Symbol.for("IPersistenceInitializationService"),

  // Settings Services
  ISettingsState: Symbol.for("ISettingsState"),
  ISettingsPersistenceService: Symbol.for("ISettingsPersistenceService"),
  IBackgroundPopularityService: Symbol.for("IBackgroundPopularityService"),

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

  // Utility
  IBetaDetectionService: Symbol.for("IBetaDetectionService"),
  IErrorHandlingService: Symbol.for("IErrorHandlingService"),
  IEnumMapper: Symbol.for("IEnumMapper"),
  ICSVParser: Symbol.for("ICSVParser"),
  ICSVLoader: Symbol.for("ICsvLoader"),
  IValidationService: Symbol.for("IValidationService"),
} as const;

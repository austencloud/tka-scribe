/**
 * Create Module Service Type Identifiers
 *
 * Services for sequence creation, option picking, and workbench functionality.
 */

export const CreateTypes = {
  // Create Module Core
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
  ITurnControlService: Symbol.for("ITurnControlService"),

  // Write Tab
  IActService: Symbol.for("IActService"),
  IMusicPlayerService: Symbol.for("IMusicPlayerService"),

  // Option Picker
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
  IPictographPreparer: Symbol.for("IPictographPreparer"),

  // Workbench
  IWorkbenchService: Symbol.for("IWorkbenchService"),
  IBuildConstructTabCoordinator: Symbol.for("IBuildConstructTabCoordinator"),
  IStartPositionService: Symbol.for("IStartPositionService"),

  // Gestural Path Builder
  IHandPathDirectionDetector: Symbol.for("IHandPathDirectionDetector"),
  ISwipeDetectionService: Symbol.for("ISwipeDetectionService"),
  IPathToMotionConverter: Symbol.for("IPathToMotionConverter"),

  // Autocomplete
  IAutocompleteService: Symbol.for("IAutocompleteService"),

  // Panel Management
  IPanelPersistenceService: Symbol.for("IPanelPersistenceService"),
} as const;

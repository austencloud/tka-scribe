/**
 * Create Module Service Type Identifiers
 *
 * Services for sequence creation, option picking, and workbench functionality.
 */

export const CreateTypes = {
  // Create Module Core
  ICreateModuleOrchestrator: Symbol.for("ICreateModuleOrchestrator"),
  ICreateModuleHandlers: Symbol.for("ICreateModuleHandlers"),
  ICreateModuleInitializer: Symbol.for(
    "ICreateModuleInitializer"
  ),
  ICreateModuleEffectCoordinator: Symbol.for("ICreateModuleEffectCoordinator"),
  IDeepLinkSequenceHandler: Symbol.for("IDeepLinkSequenceHandler"),
  ICreateModuleLayoutManager: Symbol.for("ICreateModuleLayoutManager"),
  IResponsiveLayoutManager: Symbol.for("IResponsiveLayoutManager"),
  INavigationSyncer: Symbol.for("INavigationSyncer"),
  IBeatOperator: Symbol.for("IBeatOperator"),
  IKeyboardArrowAdjuster: Symbol.for(
    "IKeyboardArrowAdjuster"
  ),
  IUndoManager: Symbol.for("IUndoManager"),
  ITurnController: Symbol.for("ITurnController"),

  // Write Tab
  IActManager: Symbol.for("IActManager"),
  IMusicPlayer: Symbol.for("IMusicPlayer"),

  // Option Picker
  IOptionPickerSizingService: Symbol.for("IOptionPickerSizingService"),
  IOptionPickerFilterPersister: Symbol.for(
    "IOptionPickerFilterPersister"
  ),
  IReversalChecker: Symbol.for("IReversalChecker"),
  IPositionAnalyzer: Symbol.for("IPositionAnalyzer"),
  IOptionSorter: Symbol.for("IOptionSorter"),
  IOptionFilter: Symbol.for("IOptionFilter"),
  IOptionOrganizerService: Symbol.for("IOptionOrganizerService"),
  IOptionLoader: Symbol.for("IOptionLoader"),
  ILayoutDetector: Symbol.for("ILayoutDetector"),
  IOptionTransitionCoordinator: Symbol.for("IOptionTransitionCoordinator"),
  ISectionTitleFormatter: Symbol.for("ISectionTitleFormatter"),
  IPictographPreparer: Symbol.for("IPictographPreparer"),

  // Workbench
  IWorkbench: Symbol.for("IWorkbench"),
  IBuildConstructTabCoordinator: Symbol.for("IBuildConstructTabCoordinator"),
  IStartPositionManager: Symbol.for("IStartPositionManager"),

  // Gestural Path Builder
  IHandPathDirectionDetector: Symbol.for("IHandPathDirectionDetector"),
  ISwipeDetector: Symbol.for("ISwipeDetector"),
  IPathToMotionConverter: Symbol.for("IPathToMotionConverter"),

  // Autocomplete
  IAutocompleter: Symbol.for("IAutocompleter"),

  // Panel Management
  IPanelPersister: Symbol.for("IPanelPersister"),
} as const;

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { CreateModuleService } from "../../../features/create/shared/services/implementations/CreateModuleService";
import { ConstructCoordinator } from "../../../features/create/shared/services/implementations/ConstructCoordinator";
import { SequenceIndexService } from "../../../features/create/shared/services/implementations/SequenceIndexService";
import { SequencePersistenceService } from "../../../features/create/shared/services/implementations/SequencePersistenceService";
import { WorkbenchService } from "../../../features/create/shared/workspace-panel/shared/services/implementations/WorkbenchService";
import { SequenceExportService } from "../../../features/create/shared/services/implementations/SequenceExportService";
import { SequenceDeletionService } from "../../../features/create/shared/workspace-panel/sequence-toolkit/services/implementations/SequenceDeletionService";
import { SequenceTransformService } from "../../../features/create/shared/workspace-panel/sequence-toolkit/services/implementations/SequenceTransformService";
import { SequenceAnalysisService } from "../../../features/create/shared/services/implementations/SequenceAnalysisService";
import { CreateModuleHandlers } from "../../../features/create/shared/services/implementations/CreateModuleHandlers";
import { CreateModuleLayoutService } from "../../../features/create/shared/layout/services/CreateModuleLayoutService";
import { SequenceStatisticsService } from "../../../features/create/shared/services/implementations/SequenceStatisticsService";
import { SequenceTransformationService } from "../../../features/create/shared/services/implementations/SequenceTransformationService";
import { SequenceValidationService } from "../../../features/create/shared/services/implementations/SequenceValidationService";
import { UndoService } from "../../../features/create/shared/services/implementations/UndoService";
import { BeatOperationsService } from "../../../features/create/shared/services/implementations/BeatOperationsService";
import { KeyboardArrowAdjustmentService } from "../../../features/create/shared/services/implementations/KeyboardArrowAdjustmentService";
import { CreateModuleInitializationService } from "../../../features/create/shared/services/implementations/CreateModuleInitializationService";
import { NavigationSyncService } from "../../../features/create/shared/services/implementations/NavigationSyncService";
import { ResponsiveLayoutService } from "../../../features/create/shared/services/implementations/ResponsiveLayoutService";
import { CreationMethodPersistenceService } from "../../../features/create/shared/services/implementations/CreationMethodPersistenceService";
import { CreateModuleEffectCoordinator } from "../../../features/create/shared/services/implementations/CreateModuleEffectCoordinator";
import { DeepLinkSequenceService } from "../../../features/create/shared/services/implementations/DeepLinkSequenceService";

import { FilterPersistenceService } from "../../../features/create/construct/option-picker/services/FilterPersistenceService";
import { LayoutDetectionService } from "../../../features/create/construct/option-picker/services/implementations/LayoutDetectionService";
import { TurnControlService } from "../../../features/create/edit/services/TurnControlService";

import { TYPES } from "../types";
import { HandPathDirectionDetector } from "../../../features/create/assemble/handpath-builder/services/implementations/HandPathDirectionDetector";
import { PathToMotionConverter } from "../../../features/create/assemble/handpath-builder/services/implementations/PathToMotionConverter";
import { SwipeDetectionService } from "../../../features/create/assemble/handpath-builder/services/implementations/SwipeDetectionService";
import { ReversalChecker } from "../../../features/create/construct/option-picker/services/implementations/ReversalChecker";
import { StartPositionService } from "../../../features/create/construct/start-position-picker/services/implementations/StartPositionService";
import { CAPEndPositionSelector } from "../../../features/create/generate/circular/services/implementations/CAPEndPositionSelector";
import { CAPExecutorSelector } from "../../../features/create/generate/circular/services/implementations/CAPExecutorSelector";
import { MirroredInvertedCAPExecutor } from "../../../features/create/generate/circular/services/implementations/MirroredInvertedCAPExecutor";
import { MirroredRotatedCAPExecutor } from "../../../features/create/generate/circular/services/implementations/MirroredRotatedCAPExecutor";
import { MirroredRotatedInvertedCAPExecutor } from "../../../features/create/generate/circular/services/implementations/MirroredRotatedComplementaryCAPExecutor";
import { MirroredRotatedInvertedSwappedCAPExecutor } from "../../../features/create/generate/circular/services/implementations/MirroredRotatedComplementarySwappedCAPExecutor";
import { MirroredSwappedCAPExecutor } from "../../../features/create/generate/circular/services/implementations/MirroredSwappedCAPExecutor";
import { MirroredSwappedInvertedCAPExecutor } from "../../../features/create/generate/circular/services/implementations/MirroredSwappedInvertedCAPExecutor";
import { PartialSequenceGenerator } from "../../../features/create/generate/circular/services/implementations/PartialSequenceGenerator";
import { RotatedEndPositionSelector } from "../../../features/create/generate/circular/services/implementations/RotatedEndPositionSelector";
import { RotatedInvertedCAPExecutor } from "../../../features/create/generate/circular/services/implementations/RotatedInvertedCAPExecutor";
import { RotatedSwappedCAPExecutor } from "../../../features/create/generate/circular/services/implementations/RotatedSwappedCAPExecutor";
import { StrictInvertedCAPExecutor } from "../../../features/create/generate/circular/services/implementations/StrictInvertedCAPExecutor";
import { StrictMirroredCAPExecutor } from "../../../features/create/generate/circular/services/implementations/StrictMirroredCAPExecutor";
import { StrictRotatedCAPExecutor } from "../../../features/create/generate/circular/services/implementations/StrictRotatedCAPExecutor";
import { StrictSwappedCAPExecutor } from "../../../features/create/generate/circular/services/implementations/StrictSwappedCAPExecutor";
import { SwappedInvertedCAPExecutor } from "../../../features/create/generate/circular/services/implementations/SwappedComplementaryCAPExecutor";
import { BeatConverterService } from "../../../features/create/generate/shared/services/implementations/BeatConverterService";
import { BeatGenerationOrchestrator } from "../../../features/create/generate/shared/services/implementations/BeatGenerationOrchestrator";
import { CAPParameterProvider } from "../../../features/create/generate/shared/services/implementations/CAPParameterProvider";
import { CAPTypeService } from "../../../features/create/generate/shared/services/implementations/CAPTypeService";
import { CardConfigurationService } from "../../../features/create/generate/shared/services/implementations/CardConfigurationService";
import { GenerationOrchestrationService } from "../../../features/create/generate/shared/services/implementations/GenerationOrchestrationService";
import { PictographFilterService } from "../../../features/create/generate/shared/services/implementations/PictographFilterService";
import { ResponsiveTypographyService } from "../../../features/create/generate/shared/services/implementations/ResponsiveTypographyService";
import { SequenceMetadataService } from "../../../features/create/generate/shared/services/implementations/SequenceMetadataService";
import { StartPositionSelector } from "../../../features/create/generate/shared/services/implementations/StartPositionSelector";
import { TurnManagementService } from "../../../features/create/generate/shared/services/implementations/TurnManagementService";
import { TurnAllocator } from "../../../features/create/generate/shared/services/implementations/TurnAllocator";
import { OptionFilter } from "../../../features/create/construct/option-picker/services/implementations/OptionFilter";
import { PositionAnalyzer } from "../../../features/create/construct/option-picker/services/implementations/PositionAnalyzer";
import { OptionSorter } from "../../../features/create/construct/option-picker/services/implementations/OptionSorter";
import { OptionSizer } from "../../../features/create/construct/option-picker/services/implementations/OptionSizer";
import { OptionOrganizer } from "../../../features/create/construct/option-picker/services/implementations/OptionOrganizer";
import { OptionLoader } from "../../../features/create/construct/option-picker/services/implementations/OptionLoader";
import { OptionTransitionCoordinator } from "../../../features/create/construct/option-picker/services/implementations/OptionTransitionCoordinator";
import { SectionTitleFormatter } from "../../../features/create/construct/option-picker/services/implementations/SectionTitleFormatter";

export const createModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === Create Module ServiceS ===
    options.bind(TYPES.ICreateModuleService).to(CreateModuleService);
    options.bind(TYPES.ICreateModuleHandlers).to(CreateModuleHandlers);
    options
      .bind(TYPES.ICreateModuleLayoutService)
      .to(CreateModuleLayoutService);
    options
      .bind(TYPES.ICreateModuleInitializationService)
      .to(CreateModuleInitializationService);
    options
      .bind(TYPES.ICreateModuleEffectCoordinator)
      .to(CreateModuleEffectCoordinator);
    options
      .bind(TYPES.ICreationMethodPersistenceService)
      .to(CreationMethodPersistenceService);
    options.bind(TYPES.IDeepLinkSequenceService).to(DeepLinkSequenceService);
    options
      .bind(TYPES.IResponsiveLayoutService)
      .to(ResponsiveLayoutService)
      .inSingletonScope();
    options.bind(TYPES.INavigationSyncService).to(NavigationSyncService);
    options.bind(TYPES.IBeatOperationsService).to(BeatOperationsService);
    options
      .bind(TYPES.IKeyboardArrowAdjustmentService)
      .to(KeyboardArrowAdjustmentService);
    options.bind(TYPES.IUndoService).to(UndoService);
    options.bind(TYPES.IBuildConstructTabCoordinator).to(ConstructCoordinator);
    options.bind(TYPES.ITurnControlService).to(TurnControlService);

    // === OPTION PICKER SERVICES ===
    options.bind(TYPES.IOptionPickerSizingService).to(OptionSizer);
    options
      .bind(TYPES.IOptionPickerFilterPersistenceService)
      .to(FilterPersistenceService);
    options.bind(TYPES.IReversalChecker).to(ReversalChecker);
    options.bind(TYPES.IPositionAnalyzer).to(PositionAnalyzer);
    options.bind(TYPES.IOptionSorter).to(OptionSorter);
    options.bind(TYPES.IOptionFilter).to(OptionFilter);
    options.bind(TYPES.IOptionOrganizerService).to(OptionOrganizer);
    options.bind(TYPES.IOptionLoader).to(OptionLoader);
    options.bind(TYPES.ILayoutDetectionService).to(LayoutDetectionService);
    options
      .bind(TYPES.IOptionTransitionCoordinator)
      .to(OptionTransitionCoordinator);
    options.bind(TYPES.ISectionTitleFormatter).to(SectionTitleFormatter);

    // === START POSITION SERVICES ===
    options
      .bind(TYPES.IStartPositionService)
      .to(StartPositionService)
      .inSingletonScope();

    // === GESTURAL PATH BUILDER SERVICES === (January 2025)
    options
      .bind(TYPES.IHandPathDirectionDetector)
      .to(HandPathDirectionDetector);
    options.bind(TYPES.ISwipeDetectionService).to(SwipeDetectionService);
    options.bind(TYPES.IPathToMotionConverter).to(PathToMotionConverter);

    // === GENERATION SERVICES === (restored active services 2025-10-25)
    options.bind(TYPES.IBeatConverterService).to(BeatConverterService);
    options.bind(TYPES.IPictographFilterService).to(PictographFilterService);
    options.bind(TYPES.ITurnManagementService).to(TurnManagementService);

    // NEW: Consolidated CAP Parameter Provider (consolidates 4 services)
    options.bind(TYPES.ICAPParameterProvider).to(CAPParameterProvider);

    options.bind(TYPES.ISequenceMetadataService).to(SequenceMetadataService);

    // New Focused Generation Services (composable, single-responsibility)
    options.bind(TYPES.IStartPositionSelector).to(StartPositionSelector);
    options.bind(TYPES.ITurnAllocationCalculator).to(TurnAllocator);
    options
      .bind(TYPES.IBeatGenerationOrchestrator)
      .to(BeatGenerationOrchestrator);
    options.bind(TYPES.IPartialSequenceGenerator).to(PartialSequenceGenerator);

    // Circular Generation (CAP) Services
    options
      .bind(TYPES.IRotatedEndPositionSelector)
      .to(RotatedEndPositionSelector);
    options.bind(TYPES.ICAPEndPositionSelector).to(CAPEndPositionSelector);
    options.bind(TYPES.IStrictRotatedCAPExecutor).to(StrictRotatedCAPExecutor);
    options
      .bind(TYPES.IStrictMirroredCAPExecutor)
      .to(StrictMirroredCAPExecutor);
    options.bind(TYPES.IStrictSwappedCAPExecutor).to(StrictSwappedCAPExecutor);
    options
      .bind(TYPES.IStrictInvertedCAPExecutor)
      .to(StrictInvertedCAPExecutor);
    options
      .bind(TYPES.IMirroredSwappedCAPExecutor)
      .to(MirroredSwappedCAPExecutor);
    options
      .bind(TYPES.ISwappedInvertedCAPExecutor)
      .to(SwappedInvertedCAPExecutor);
    options
      .bind(TYPES.IMirroredInvertedCAPExecutor)
      .to(MirroredInvertedCAPExecutor);
    options
      .bind(TYPES.IRotatedSwappedCAPExecutor)
      .to(RotatedSwappedCAPExecutor);
    options
      .bind(TYPES.IRotatedInvertedCAPExecutor)
      .to(RotatedInvertedCAPExecutor);
    options
      .bind(TYPES.IMirroredRotatedCAPExecutor)
      .to(MirroredRotatedCAPExecutor);
    options
      .bind(TYPES.IMirroredRotatedInvertedCAPExecutor)
      .to(MirroredRotatedInvertedCAPExecutor);
    options
      .bind(TYPES.IMirroredSwappedInvertedCAPExecutor)
      .to(MirroredSwappedInvertedCAPExecutor);
    options
      .bind(TYPES.IMirroredRotatedInvertedSwappedCAPExecutor)
      .to(MirroredRotatedInvertedSwappedCAPExecutor);
    options.bind(TYPES.ICAPExecutorSelector).to(CAPExecutorSelector);

    // Generation UI Services (SRP Refactoring - Dec 2024)
    options
      .bind(TYPES.IResponsiveTypographyService)
      .to(ResponsiveTypographyService);
    options.bind(TYPES.ICardConfigurationService).to(CardConfigurationService);
    options.bind(TYPES.ICAPTypeService).to(CAPTypeService);

    // Generation Orchestration Services (SRP Refactoring - Dec 2024)
    options
      .bind(TYPES.IGenerationOrchestrationService)
      .to(GenerationOrchestrationService);

    // === BEAT GRID SERVICES ===
    // Note: BeatFallbackRenderer moved to render module

    // === WORKBENCH SERVICES ===
    options.bind(TYPES.IWorkbenchService).to(WorkbenchService);

    // === SEQUENCE SERVICES ===
    // NOTE: IReversalDetectionService, ISequenceDomainService, ISequenceImportService
    // moved to dataModule (Tier 1) - required by ISequenceService
    options.bind(TYPES.ISequenceAnalysisService).to(SequenceAnalysisService);

    // Focused sequence services (refactored from monolithic SequenceStateService)
    options
      .bind(TYPES.ISequenceValidationService)
      .to(SequenceValidationService);
    options
      .bind(TYPES.ISequenceStatisticsService)
      .to(SequenceStatisticsService);
    options
      .bind(TYPES.ISequenceTransformationService)
      .to(SequenceTransformationService);

    options.bind(TYPES.ISequenceExportService).to(SequenceExportService);
    // NOTE: ISequenceService, ISequenceImportService moved to dataModule (Tier 1)
    options
      .bind(TYPES.ISequencePersistenceService)
      .to(SequencePersistenceService);
    options.bind(TYPES.ISequenceIndexService).to(SequenceIndexService);
    options.bind(TYPES.ISequenceDeletionService).to(SequenceDeletionService);
    options.bind(TYPES.ISequenceTransformService).to(SequenceTransformService);

    // === LAYOUT SERVICES ===
    // Note: PrintablePageLayoutService handled in word-card module
  }
);

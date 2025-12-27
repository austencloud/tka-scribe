import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { CreateModuleOrchestrator } from "../../../features/create/shared/services/implementations/CreateModuleOrchestrator";
import { ConstructCoordinator } from "../../../features/create/shared/services/implementations/ConstructCoordinator";
import { SequenceIndexer } from "../../../features/create/shared/services/implementations/SequenceIndexer";
import { SequencePersister } from "../../../features/create/shared/services/implementations/SequencePersister";
import { Workbench } from "../../../features/create/shared/workspace-panel/shared/services/implementations/Workbench";
import { SequenceExporter } from "../../../features/create/shared/services/implementations/SequenceExporter";
import { SequenceAnalyzer } from "../../../features/create/shared/services/implementations/SequenceAnalyzer";
import { CreateModuleHandlers } from "../../../features/create/shared/services/implementations/CreateModuleHandlers";
import { CreateModuleLayoutManager } from "../../../features/create/shared/layout/services/CreateModuleLayoutManager";
import { SequenceStatsCalculator } from "../../../features/create/shared/services/implementations/SequenceStatsCalculator";
import { SequenceTransformer } from "../../../features/create/shared/services/implementations/sequence-transforms/SequenceTransformer";
import { SequenceValidator } from "../../../features/create/shared/services/implementations/SequenceValidator";
import { UndoManager } from "../../../features/create/shared/services/implementations/UndoManager";
import { BeatOperator } from "../../../features/create/shared/services/implementations/BeatOperator";
import { KeyboardArrowAdjuster } from "../../../features/create/shared/services/implementations/KeyboardArrowAdjuster";
import { CreateModuleInitializer } from "../../../features/create/shared/services/implementations/CreateModuleInitializer";
import { NavigationSyncer } from "../../../features/create/shared/services/implementations/NavigationSyncer";
import { ResponsiveLayoutManager } from "../../../features/create/shared/services/implementations/ResponsiveLayoutManager";
import { CreationMethodPersister } from "../../../features/create/shared/services/implementations/CreationMethodPersister";
import { CreateModuleEffectCoordinator } from "../../../features/create/shared/services/implementations/CreateModuleEffectCoordinator";
import { DeepLinkSequenceHandler } from "../../../features/create/shared/services/implementations/DeepLinkSequenceHandler";

import { FilterPersister } from "../../../features/create/construct/option-picker/services/FilterPersister";
import { LayoutDetector } from "../../../features/create/construct/option-picker/services/implementations/LayoutDetector";
import { TurnController } from "../../../features/create/edit/services/TurnController";

import { TYPES } from "../types";
import { HandPathDirectionDetector } from "../../../features/create/assemble/handpath-builder/services/implementations/HandPathDirectionDetector";
import { PathToMotionConverter } from "../../../features/create/assemble/handpath-builder/services/implementations/PathToMotionConverter";
import { SwipeDetector } from "../../../features/create/assemble/handpath-builder/services/implementations/SwipeDetector";
import { ReversalChecker } from "../../../features/create/construct/option-picker/services/implementations/ReversalChecker";
import { StartPositionManager } from "../../../features/create/construct/start-position-picker/services/implementations/StartPositionManager";
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
import { BeatConverter } from "../../../features/create/generate/shared/services/implementations/BeatConverter";
import { BeatGenerationOrchestrator } from "../../../features/create/generate/shared/services/implementations/BeatGenerationOrchestrator";
import { CAPParameterProvider } from "../../../features/create/generate/shared/services/implementations/CAPParameterProvider";
import { CAPTypeResolver } from "../../../features/create/generate/shared/services/implementations/CAPTypeResolver";
import { CAPDetector } from "../../../features/create/generate/circular/services/implementations/CAPDetector";
import { OrientationCycleDetector } from "../../../features/create/generate/circular/services/implementations/OrientationCycleDetector";
import { CardConfigurator } from "../../../features/create/generate/shared/services/implementations/CardConfigurator";
import { GenerationOrchestrator } from "../../../features/create/generate/shared/services/implementations/GenerationOrchestrator";
import { PictographFilter } from "../../../features/create/generate/shared/services/implementations/PictographFilter";
import { TypographyScaler } from "../../../features/create/generate/shared/services/implementations/TypographyScaler";
import { SequenceMetadataManager } from "../../../features/create/generate/shared/services/implementations/SequenceMetadataManager";
import { StartPositionSelector } from "../../../features/create/generate/shared/services/implementations/StartPositionSelector";
import { TurnManager } from "../../../features/create/generate/shared/services/implementations/TurnManager";
import { TurnAllocator } from "../../../features/create/generate/shared/services/implementations/TurnAllocator";
import { OptionFilter } from "../../../features/create/construct/option-picker/services/implementations/OptionFilter";
import { PositionAnalyzer } from "../../../features/create/construct/option-picker/services/implementations/PositionAnalyzer";
import { OptionSorter } from "../../../features/create/construct/option-picker/services/implementations/OptionSorter";
import { OptionSizer } from "../../../features/create/construct/option-picker/services/implementations/OptionSizer";
import { OptionOrganizer } from "../../../features/create/construct/option-picker/services/implementations/OptionOrganizer";
import { OptionLoader } from "../../../features/create/construct/option-picker/services/implementations/OptionLoader";
import { OptionTransitionCoordinator } from "../../../features/create/construct/option-picker/services/implementations/OptionTransitionCoordinator";
import { SectionTitleFormatter } from "../../../features/create/construct/option-picker/services/implementations/SectionTitleFormatter";
import { PictographPreparer } from "../../../features/create/construct/option-picker/services/implementations/PictographPreparer";
import { Autocompleter } from "../../../features/create/shared/services/implementations/Autocompleter";
import { PanelPersister } from "../../../features/create/shared/services/implementations/PanelPersister.svelte";

export const createModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === Create Module ServiceS ===
    options.bind(TYPES.ICreateModuleOrchestrator).to(CreateModuleOrchestrator);
    options.bind(TYPES.ICreateModuleHandlers).to(CreateModuleHandlers);
    options
      .bind(TYPES.ICreateModuleLayoutManager)
      .to(CreateModuleLayoutManager);
    options
      .bind(TYPES.ICreateModuleInitializer)
      .to(CreateModuleInitializer);
    options
      .bind(TYPES.ICreateModuleEffectCoordinator)
      .to(CreateModuleEffectCoordinator);
    options
      .bind(TYPES.ICreationMethodPersister)
      .to(CreationMethodPersister);
    options.bind(TYPES.IDeepLinkSequenceHandler).to(DeepLinkSequenceHandler);
    options
      .bind(TYPES.IResponsiveLayoutManager)
      .to(ResponsiveLayoutManager)
      .inSingletonScope();
    options.bind(TYPES.INavigationSyncer).to(NavigationSyncer);
    options.bind(TYPES.IBeatOperator).to(BeatOperator);
    options
      .bind(TYPES.IKeyboardArrowAdjuster)
      .to(KeyboardArrowAdjuster);
    options.bind(TYPES.IUndoManager).to(UndoManager);
    options.bind(TYPES.IBuildConstructTabCoordinator).to(ConstructCoordinator);
    options.bind(TYPES.ITurnController).to(TurnController);

    // === OPTION PICKER SERVICES ===
    options.bind(TYPES.IOptionPickerSizingService).to(OptionSizer);
    options
      .bind(TYPES.IOptionPickerFilterPersister)
      .to(FilterPersister);
    options.bind(TYPES.IReversalChecker).to(ReversalChecker);
    options.bind(TYPES.IPositionAnalyzer).to(PositionAnalyzer);
    options.bind(TYPES.IOptionSorter).to(OptionSorter);
    options.bind(TYPES.IOptionFilter).to(OptionFilter);
    options.bind(TYPES.IOptionOrganizerService).to(OptionOrganizer);
    options.bind(TYPES.IOptionLoader).to(OptionLoader);
    options.bind(TYPES.ILayoutDetector).to(LayoutDetector);
    options
      .bind(TYPES.IOptionTransitionCoordinator)
      .to(OptionTransitionCoordinator);
    options.bind(TYPES.ISectionTitleFormatter).to(SectionTitleFormatter);
    options.bind(TYPES.IPictographPreparer).to(PictographPreparer);

    // === START POSITION SERVICES ===
    options
      .bind(TYPES.IStartPositionManager)
      .to(StartPositionManager)
      .inSingletonScope();

    // === GESTURAL PATH BUILDER SERVICES === (January 2025)
    options
      .bind(TYPES.IHandPathDirectionDetector)
      .to(HandPathDirectionDetector);
    options.bind(TYPES.ISwipeDetector).to(SwipeDetector);
    options.bind(TYPES.IPathToMotionConverter).to(PathToMotionConverter);

    // === GENERATION SERVICES === (restored active services 2025-10-25)
    options.bind(TYPES.IBeatConverter).to(BeatConverter);
    options.bind(TYPES.IPictographFilter).to(PictographFilter);
    options.bind(TYPES.ITurnManager).to(TurnManager);

    // NEW: Consolidated CAP Parameter Provider (consolidates 4 services)
    options.bind(TYPES.ICAPParameterProvider).to(CAPParameterProvider);

    options.bind(TYPES.ISequenceMetadataManager).to(SequenceMetadataManager);

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
      .bind(TYPES.IResponsiveTypographer)
      .to(TypographyScaler);
    options.bind(TYPES.ICardConfigurator).to(CardConfigurator);
    options.bind(TYPES.ICAPTypeResolver).to(CAPTypeResolver);
    options.bind(TYPES.ICAPDetector).to(CAPDetector);
    options
      .bind(TYPES.IOrientationCycleDetector)
      .to(OrientationCycleDetector);

    // Generation Orchestration Services (SRP Refactoring - Dec 2024)
    options
      .bind(TYPES.IGenerationOrchestrator)
      .to(GenerationOrchestrator);

    // === BEAT GRID SERVICES ===
    // Note: BeatFallbackRenderer moved to render module

    // === WORKBENCH SERVICES ===
    options.bind(TYPES.IWorkbench).to(Workbench);

    // === SEQUENCE SERVICES ===
    // NOTE: IReversalDetector, ISequenceDomainManager, ISequenceImporter
    // moved to dataModule (Tier 1) - required by ISequenceRepository
    options.bind(TYPES.ISequenceAnalyzer).to(SequenceAnalyzer);

    // Focused sequence services (refactored from monolithic SequenceStateService)
    options
      .bind(TYPES.ISequenceValidator)
      .to(SequenceValidator);
    options
      .bind(TYPES.ISequenceStatsCalculator)
      .to(SequenceStatsCalculator);
    options
      .bind(TYPES.ISequenceTransformer)
      .to(SequenceTransformer);

    options.bind(TYPES.ISequenceExporter).to(SequenceExporter);
    // NOTE: ISequenceRepository, ISequenceImporter moved to dataModule (Tier 1)
    options
      .bind(TYPES.ISequencePersister)
      .to(SequencePersister);
    options.bind(TYPES.ISequenceIndexer).to(SequenceIndexer);

    // === AUTOCOMPLETE SERVICE ===
    options.bind(TYPES.IAutocompleter).to(Autocompleter);

    // === PANEL MANAGEMENT ===
    options.bind(TYPES.IPanelPersister).to(PanelPersister);

    // === LAYOUT SERVICES ===
    // Note: PrintablePageLayoutService handled in word-card module
  }
);

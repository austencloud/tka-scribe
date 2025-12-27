#!/bin/bash
cd "F:/_THE KINETIC ALPHABET/_TKA-SCRIBE"

# Assemble services
git mv "src/lib/features/create/assemble/handpath-builder/services/contracts/ISwipeDetectionService.ts" "src/lib/features/create/assemble/handpath-builder/services/contracts/ISwipeDetector.ts" 2>/dev/null
git mv "src/lib/features/create/assemble/handpath-builder/services/implementations/SwipeDetectionService.ts" "src/lib/features/create/assemble/handpath-builder/services/implementations/SwipeDetector.ts" 2>/dev/null

# Construct - option-picker
git mv "src/lib/features/create/construct/option-picker/services/contracts/ILayoutDetectionService.ts" "src/lib/features/create/construct/option-picker/services/contracts/ILayoutDetector.ts" 2>/dev/null
git mv "src/lib/features/create/construct/option-picker/services/FilterPersistenceService.ts" "src/lib/features/create/construct/option-picker/services/FilterPersister.ts" 2>/dev/null
git mv "src/lib/features/create/construct/option-picker/services/implementations/LayoutDetectionService.ts" "src/lib/features/create/construct/option-picker/services/implementations/LayoutDetector.ts" 2>/dev/null
git mv "src/lib/features/create/construct/option-picker/services/implementations/PictographPreparerService.ts" "src/lib/features/create/construct/option-picker/services/implementations/PictographPreparer.ts" 2>/dev/null

# Construct - start-position-picker
git mv "src/lib/features/create/construct/start-position-picker/services/contracts/IStartPositionService.ts" "src/lib/features/create/construct/start-position-picker/services/contracts/IStartPositionManager.ts" 2>/dev/null
git mv "src/lib/features/create/construct/start-position-picker/services/implementations/StartPositionService.ts" "src/lib/features/create/construct/start-position-picker/services/implementations/StartPositionManager.ts" 2>/dev/null

# Edit
git mv "src/lib/features/create/edit/services/TurnControlService.ts" "src/lib/features/create/edit/services/TurnController.ts" 2>/dev/null

# Generate - shared
git mv "src/lib/features/create/generate/shared/services/contracts/IBeatConverterService.ts" "src/lib/features/create/generate/shared/services/contracts/IBeatConverter.ts" 2>/dev/null
git mv "src/lib/features/create/generate/shared/services/contracts/ICAPTypeService.ts" "src/lib/features/create/generate/shared/services/contracts/ICAPTypeResolver.ts" 2>/dev/null
git mv "src/lib/features/create/generate/shared/services/contracts/ICardConfigurationService.ts" "src/lib/features/create/generate/shared/services/contracts/ICardConfigurator.ts" 2>/dev/null
git mv "src/lib/features/create/generate/shared/services/contracts/IGenerationOrchestrationService.ts" "src/lib/features/create/generate/shared/services/contracts/IGenerationOrchestrator.ts" 2>/dev/null
git mv "src/lib/features/create/generate/shared/services/contracts/IPanelPaddingCalculatorService.ts" "src/lib/features/create/generate/shared/services/contracts/IPanelPaddingCalculator.ts" 2>/dev/null
git mv "src/lib/features/create/generate/shared/services/contracts/IPictographFilterService.ts" "src/lib/features/create/generate/shared/services/contracts/IPictographFilter.ts" 2>/dev/null
git mv "src/lib/features/create/generate/shared/services/contracts/IResponsiveTypographyService.ts" "src/lib/features/create/generate/shared/services/contracts/IResponsiveTypographer.ts" 2>/dev/null
git mv "src/lib/features/create/generate/shared/services/contracts/ISequenceMetadataService.ts" "src/lib/features/create/generate/shared/services/contracts/ISequenceMetadataManager.ts" 2>/dev/null
git mv "src/lib/features/create/generate/shared/services/contracts/ITurnManagementService.ts" "src/lib/features/create/generate/shared/services/contracts/ITurnManager.ts" 2>/dev/null

git mv "src/lib/features/create/generate/shared/services/implementations/BeatConverterService.ts" "src/lib/features/create/generate/shared/services/implementations/BeatConverter.ts" 2>/dev/null
git mv "src/lib/features/create/generate/shared/services/implementations/CAPTypeService.ts" "src/lib/features/create/generate/shared/services/implementations/CAPTypeResolver.ts" 2>/dev/null
git mv "src/lib/features/create/generate/shared/services/implementations/CardConfigurationService.ts" "src/lib/features/create/generate/shared/services/implementations/CardConfigurator.ts" 2>/dev/null
git mv "src/lib/features/create/generate/shared/services/implementations/GenerationOrchestrationService.ts" "src/lib/features/create/generate/shared/services/implementations/GenerationOrchestrator.ts" 2>/dev/null
git mv "src/lib/features/create/generate/shared/services/implementations/PictographFilterService.ts" "src/lib/features/create/generate/shared/services/implementations/PictographFilter.ts" 2>/dev/null
git mv "src/lib/features/create/generate/shared/services/implementations/ResponsiveTypographyService.ts" "src/lib/features/create/generate/shared/services/implementations/ResponsiveTypographer.ts" 2>/dev/null
git mv "src/lib/features/create/generate/shared/services/implementations/SequenceMetadataService.ts" "src/lib/features/create/generate/shared/services/implementations/SequenceMetadataManager.ts" 2>/dev/null
git mv "src/lib/features/create/generate/shared/services/implementations/TurnManagementService.ts" "src/lib/features/create/generate/shared/services/implementations/TurnManager.ts" 2>/dev/null

# Record
git mv "src/lib/features/create/record/services/MetronomeService.ts" "src/lib/features/create/record/services/Metronome.ts" 2>/dev/null

# Shared - layout
git mv "src/lib/features/create/shared/layout/services/CreateModuleLayoutService.ts" "src/lib/features/create/shared/layout/services/CreateModuleLayoutManager.ts" 2>/dev/null
git mv "src/lib/features/create/shared/layout/services/ICreateModuleLayoutService.ts" "src/lib/features/create/shared/layout/services/ICreateModuleLayoutManager.ts" 2>/dev/null

# Shared - services
git mv "src/lib/features/create/shared/services/AutosaveService.ts" "src/lib/features/create/shared/services/Autosaver.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/SequencePersistenceService.ts" "src/lib/features/create/shared/services/SequencePersister.ts" 2>/dev/null

# Shared - contracts
git mv "src/lib/features/create/shared/services/contracts/IAutocompleteService.ts" "src/lib/features/create/shared/services/contracts/IAutocompleter.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/contracts/IBeatOperationsService.ts" "src/lib/features/create/shared/services/contracts/IBeatOperator.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/contracts/ICreateModuleEventService.ts" "src/lib/features/create/shared/services/contracts/ICreateModuleEventHandler.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/contracts/ICreateModuleInitializationService.ts" "src/lib/features/create/shared/services/contracts/ICreateModuleInitializer.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/contracts/ICreateModuleService.ts" "src/lib/features/create/shared/services/contracts/ICreateModuleOrchestrator.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/contracts/ICreateModuleTransitionService.ts" "src/lib/features/create/shared/services/contracts/ICreateModuleTransitioner.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/contracts/ICreationMethodPersistenceService.ts" "src/lib/features/create/shared/services/contracts/ICreationMethodPersister.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/contracts/IDeepLinkSequenceService.ts" "src/lib/features/create/shared/services/contracts/IDeepLinkSequenceHandler.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/contracts/IKeyboardArrowAdjustmentService.ts" "src/lib/features/create/shared/services/contracts/IKeyboardArrowAdjuster.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/contracts/INavigationSyncService.ts" "src/lib/features/create/shared/services/contracts/INavigationSyncer.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/contracts/IPanelPersistenceService.ts" "src/lib/features/create/shared/services/contracts/IPanelPersister.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/contracts/IPersistenceService.ts" "src/lib/features/create/shared/services/contracts/IPersister.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/contracts/IResponsiveLayoutService.ts" "src/lib/features/create/shared/services/contracts/IResponsiveLayoutManager.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/contracts/IReversalDetectionService.ts" "src/lib/features/create/shared/services/contracts/IReversalDetector.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/contracts/IRotationDirectionPatternService.ts" "src/lib/features/create/shared/services/contracts/IRotationDirectionPatternManager.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/contracts/ISequenceAnalysisService.ts" "src/lib/features/create/shared/services/contracts/ISequenceAnalyzer.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/contracts/ISequenceCoordinationService.ts" "src/lib/features/create/shared/services/contracts/ISequenceCoordinator.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/contracts/ISequenceCRUDService.ts" "src/lib/features/create/shared/services/contracts/ISequenceCRUD.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/contracts/ISequenceDomainService.ts" "src/lib/features/create/shared/services/contracts/ISequenceDomainManager.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/contracts/ISequenceExportService.ts" "src/lib/features/create/shared/services/contracts/ISequenceExporter.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/contracts/ISequenceSelectionService.ts" "src/lib/features/create/shared/services/contracts/ISequenceSelector.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/contracts/ISequenceTransformationService.ts" "src/lib/features/create/shared/services/contracts/ISequenceTransformer.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/contracts/ITurnPatternService.ts" "src/lib/features/create/shared/services/contracts/ITurnPatternManager.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/contracts/IUndoService.ts" "src/lib/features/create/shared/services/contracts/IUndoManager.ts" 2>/dev/null

# Shared - implementations
git mv "src/lib/features/create/shared/services/implementations/AutocompleteService.ts" "src/lib/features/create/shared/services/implementations/Autocompleter.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/implementations/BeatOperationsService.ts" "src/lib/features/create/shared/services/implementations/BeatOperator.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/implementations/CreateModuleEventService.ts" "src/lib/features/create/shared/services/implementations/CreateModuleEventHandler.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/implementations/CreateModuleInitializationService.ts" "src/lib/features/create/shared/services/implementations/CreateModuleInitializer.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/implementations/CreateModuleService.ts" "src/lib/features/create/shared/services/implementations/CreateModuleOrchestrator.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/implementations/CreateModuleTransitionService.ts" "src/lib/features/create/shared/services/implementations/CreateModuleTransitioner.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/implementations/CreationMethodPersistenceService.ts" "src/lib/features/create/shared/services/implementations/CreationMethodPersister.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/implementations/DeepLinkSequenceService.ts" "src/lib/features/create/shared/services/implementations/DeepLinkSequenceHandler.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/implementations/KeyboardArrowAdjustmentService.ts" "src/lib/features/create/shared/services/implementations/KeyboardArrowAdjuster.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/implementations/NavigationSyncService.ts" "src/lib/features/create/shared/services/implementations/NavigationSyncer.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/implementations/ResponsiveLayoutService.ts" "src/lib/features/create/shared/services/implementations/ResponsiveLayoutManager.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/implementations/ReversalDetectionService.ts" "src/lib/features/create/shared/services/implementations/ReversalDetector.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/implementations/RotationDirectionPatternService.ts" "src/lib/features/create/shared/services/implementations/RotationDirectionPatternManager.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/implementations/SequenceAnalysisService.ts" "src/lib/features/create/shared/services/implementations/SequenceAnalyzer.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/implementations/SequenceDomainService.ts" "src/lib/features/create/shared/services/implementations/SequenceDomainManager.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/implementations/TurnPatternService.ts" "src/lib/features/create/shared/services/implementations/TurnPatternManager.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/implementations/UndoService.ts" "src/lib/features/create/shared/services/implementations/UndoManager.ts" 2>/dev/null
git mv "src/lib/features/create/shared/services/implementations/sequence-transforms/SequenceTransformationService.ts" "src/lib/features/create/shared/services/implementations/sequence-transforms/SequenceTransformer.ts" 2>/dev/null

# Workspace panel
git mv "src/lib/features/create/shared/workspace-panel/shared/services/contracts/IWorkbenchService.ts" "src/lib/features/create/shared/workspace-panel/shared/services/contracts/IWorkbench.ts" 2>/dev/null
git mv "src/lib/features/create/shared/workspace-panel/shared/services/implementations/WorkbenchService.ts" "src/lib/features/create/shared/workspace-panel/shared/services/implementations/Workbench.ts" 2>/dev/null

echo "Done renaming files!"

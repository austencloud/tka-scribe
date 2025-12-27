$replacements = @{
    # Assemble
    'ISwipeDetectionService' = 'ISwipeDetector'
    'SwipeDetectionService' = 'SwipeDetector'

    # Construct - option-picker
    'ILayoutDetectionService' = 'ILayoutDetector'
    'LayoutDetectionService' = 'LayoutDetector'
    'FilterPersistenceService' = 'FilterPersister'
    'PictographPreparerService' = 'PictographPreparer'

    # Construct - start-position-picker
    'IStartPositionService' = 'IStartPositionManager'
    'StartPositionService' = 'StartPositionManager'

    # Edit
    'TurnControlService' = 'TurnController'

    # Generate - shared
    'IBeatConverterService' = 'IBeatConverter'
    'BeatConverterService' = 'BeatConverter'
    'ICAPTypeService' = 'ICAPTypeResolver'
    'CAPTypeService' = 'CAPTypeResolver'
    'ICardConfigurationService' = 'ICardConfigurator'
    'CardConfigurationService' = 'CardConfigurator'
    'IGenerationOrchestrationService' = 'IGenerationOrchestrator'
    'GenerationOrchestrationService' = 'GenerationOrchestrator'
    'IPanelPaddingCalculatorService' = 'IPanelPaddingCalculator'
    'IPictographFilterService' = 'IPictographFilter'
    'PictographFilterService' = 'PictographFilter'
    'IResponsiveTypographyService' = 'IResponsiveTypographer'
    'ResponsiveTypographyService' = 'ResponsiveTypographer'
    'ISequenceMetadataService' = 'ISequenceMetadataManager'
    'SequenceMetadataService' = 'SequenceMetadataManager'
    'ITurnManagementService' = 'ITurnManager'
    'TurnManagementService' = 'TurnManager'

    # Record
    'MetronomeService' = 'Metronome'

    # Shared - layout
    'ICreateModuleLayoutService' = 'ICreateModuleLayoutManager'
    'CreateModuleLayoutService' = 'CreateModuleLayoutManager'

    # Shared - services
    'AutosaveService' = 'Autosaver'
    'SequencePersistenceService' = 'SequencePersister'

    # Shared - contracts
    'IAutocompleteService' = 'IAutocompleter'
    'IBeatOperationsService' = 'IBeatOperator'
    'ICreateModuleEventService' = 'ICreateModuleEventHandler'
    'ICreateModuleInitializationService' = 'ICreateModuleInitializer'
    'ICreateModuleService' = 'ICreateModuleOrchestrator'
    'ICreateModuleTransitionService' = 'ICreateModuleTransitioner'
    'ICreationMethodPersistenceService' = 'ICreationMethodPersister'
    'IDeepLinkSequenceService' = 'IDeepLinkSequenceHandler'
    'IKeyboardArrowAdjustmentService' = 'IKeyboardArrowAdjuster'
    'INavigationSyncService' = 'INavigationSyncer'
    'IPanelPersistenceService' = 'IPanelPersister'
    'IResponsiveLayoutService' = 'IResponsiveLayoutManager'
    'IReversalDetectionService' = 'IReversalDetector'
    'IRotationDirectionPatternService' = 'IRotationDirectionPatternManager'
    'ISequenceAnalysisService' = 'ISequenceAnalyzer'
    'ISequenceCoordinationService' = 'ISequenceCoordinator'
    'ISequenceCRUDService' = 'ISequenceCRUD'
    'ISequenceDomainService' = 'ISequenceDomainManager'
    'ISequenceExportService' = 'ISequenceExporter'
    'ISequenceSelectionService' = 'ISequenceSelector'
    'ISequenceTransformationService' = 'ISequenceTransformer'
    'ITurnPatternService' = 'ITurnPatternManager'
    'IUndoService' = 'IUndoManager'

    # Shared - implementations
    'AutocompleteService' = 'Autocompleter'
    'BeatOperationsService' = 'BeatOperator'
    'CreateModuleEventService' = 'CreateModuleEventHandler'
    'CreateModuleInitializationService' = 'CreateModuleInitializer'
    'CreateModuleService' = 'CreateModuleOrchestrator'
    'CreateModuleTransitionService' = 'CreateModuleTransitioner'
    'CreationMethodPersistenceService' = 'CreationMethodPersister'
    'DeepLinkSequenceService' = 'DeepLinkSequenceHandler'
    'KeyboardArrowAdjustmentService' = 'KeyboardArrowAdjuster'
    'NavigationSyncService' = 'NavigationSyncer'
    'ResponsiveLayoutService' = 'ResponsiveLayoutManager'
    'ReversalDetectionService' = 'ReversalDetector'
    'RotationDirectionPatternService' = 'RotationDirectionPatternManager'
    'SequenceAnalysisService' = 'SequenceAnalyzer'
    'SequenceDomainService' = 'SequenceDomainManager'
    'TurnPatternService' = 'TurnPatternManager'
    'UndoService' = 'UndoManager'
    'SequenceTransformationService' = 'SequenceTransformer'

    # Workspace panel
    'IWorkbenchService' = 'IWorkbench'
    'WorkbenchService' = 'Workbench'
}

$excludeDirs = @('.git', 'node_modules', '.svelte-kit', 'dist', 'build')

Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.svelte" |
    Where-Object {
        $file = $_
        -not ($excludeDirs | Where-Object { $file.FullName -like "*\$_\*" })
    } |
    ForEach-Object {
        $filePath = $_.FullName
        $content = [System.IO.File]::ReadAllText($filePath)
        $original = $content

        foreach ($old in $replacements.Keys) {
            $content = $content -replace [regex]::Escape($old), $replacements[$old]
        }

        if ($content -ne $original) {
            [System.IO.File]::WriteAllText($filePath, $content)
            Write-Host "Updated: $filePath"
        }
    }

Write-Host "Done!"

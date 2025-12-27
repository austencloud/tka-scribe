$replacements = @{
    # Arrow Orchestration
    'ArrowGridCoordinateService' = 'ArrowGridCoordinator'
    'IArrowGridCoordinateService' = 'IArrowGridCoordinator'

    # Arrow Calculation
    'ArrowCalculationService' = 'ArrowCalculator'
    'IArrowCalculationService' = 'IArrowCalculator'
    'ArrowLocationService' = 'ArrowLocator'
    'IArrowLocationService' = 'IArrowLocator'
    'DirectionalTupleService' = 'DirectionalTupleGenerator'
    'IDirectionalTupleService' = 'IDirectionalTupleGenerator'

    # Arrow Key Generation
    'ArrowKeyGenerationService' = 'ArrowKeyGenerator'
    'IArrowKeyGenerationService' = 'IArrowKeyGenerator'
    'ArrowPlacementKeyService' = 'ArrowPlacementKeyGenerator'
    'IArrowPlacementKeyService' = 'IArrowPlacementKeyGenerator'

    # Arrow Placement
    'ArrowPlacementService' = 'ArrowPlacer'
    'IArrowPlacementService' = 'IArrowPlacer'
    'DefaultPlacementService' = 'DefaultPlacer'
    'IDefaultPlacementService' = 'IDefaultPlacer'
    'LetterClassificationService' = 'LetterClassifier'
    'ILetterClassificationService' = 'ILetterClassifier'
    'SpecialPlacementDataService' = 'SpecialPlacementDataProvider'
    'ISpecialPlacementDataService' = 'ISpecialPlacementDataProvider'
    'SpecialPlacementLookupService' = 'SpecialPlacementLookup'
    'ISpecialPlacementLookupService' = 'ISpecialPlacementLookup'
    'SpecialPlacementService' = 'SpecialPlacer'
    'ISpecialPlacementService' = 'ISpecialPlacer'
    'TurnsTupleGeneratorService' = 'TurnsTupleGenerator'
    'ITurnsTupleGeneratorService' = 'ITurnsTupleGenerator'
    'PropRotationStateService' = 'PropRotationStateTracker'
    'IPropRotationStateService' = 'IPropRotationStateTracker'

    # Grid
    'GridRenderingService' = 'GridRenderer'
    'IGridRenderingService' = 'IGridRenderer'

    # Prop
    'BetaDetectionService' = 'BetaDetector'
    'IBetaDetectionService' = 'IBetaDetector'
    'OrientationCalculationService' = 'OrientationCalculator'
    'IOrientationCalculationService' = 'IOrientationCalculator'
    'PropPlacementService' = 'PropPlacer'
    'IPropPlacementService' = 'IPropPlacer'
    'PropRenderingService' = 'PropRenderer'
    'IPropRenderingService' = 'IPropRenderer'
    'PropTypeConfigurationService' = 'PropTypeConfigurator'
    'IPropTypeConfigurationService' = 'IPropTypeConfigurator'

    # Shared
    'PictographRenderingService' = 'PictographRenderer'
    'IPictographRenderingService' = 'IPictographRenderer'
    'SvgPreloadService' = 'SvgPreloader'
    'ISvgPreloadService' = 'ISvgPreloader'
    'SvgSpriteSheetService' = 'SvgSpriteSheet'
    'ISvgSpriteSheetService' = 'ISvgSpriteSheet'
}

Get-ChildItem -Recurse -Path "src/lib" -Include "*.ts","*.svelte" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $modified = $false

    foreach ($key in $replacements.Keys) {
        if ($content -match $key) {
            $content = $content -replace $key, $replacements[$key]
            $modified = $true
        }
    }

    if ($modified) {
        Set-Content $_.FullName -Value $content -NoNewline
        Write-Host "Updated: $($_.FullName)"
    }
}

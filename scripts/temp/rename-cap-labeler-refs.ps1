$replacements = @{
    'BeatDataConversionService' = 'BeatDataConverter'
    'IBeatDataConversionService' = 'IBeatDataConverter'
    'BeatPairAnalysisService' = 'BeatPairAnalyzer'
    'IBeatPairAnalysisService' = 'IBeatPairAnalyzer'
    'CandidateFormattingService' = 'CandidateFormatter'
    'ICandidateFormattingService' = 'ICandidateFormatter'
    'CAPDesignationService' = 'CAPDesignator'
    'ICAPDesignationService' = 'ICAPDesignator'
    'CAPDetectionService' = 'CAPDetector'
    'ICAPDetectionService' = 'ICAPDetector'
    'CAPLabelsFirebaseService' = 'CAPLabelsFirebaseRepository'
    'ICAPLabelsFirebaseService' = 'ICAPLabelsFirebaseRepository'
    'LayeredPathDetectionService' = 'LayeredPathDetector'
    'ILayeredPathDetectionService' = 'ILayeredPathDetector'
    'NavigationService' = 'Navigator'
    'INavigationService' = 'INavigator'
    'PolyrhythmicDetectionService' = 'PolyrhythmicDetector'
    'IPolyrhythmicDetectionService' = 'IPolyrhythmicDetector'
    'ReflectionComparisonService' = 'ReflectionComparer'
    'IReflectionComparisonService' = 'IReflectionComparer'
    'RotationComparisonService' = 'RotationComparer'
    'IRotationComparisonService' = 'IRotationComparer'
    'SequenceLoadingService' = 'SequenceLoader'
    'ISequenceLoadingService' = 'ISequenceLoader'
    'SwapInvertComparisonService' = 'SwapInvertComparer'
    'ISwapInvertComparisonService' = 'ISwapInvertComparer'
    'TransformationAnalysisService' = 'TransformationAnalyzer'
    'ITransformationAnalysisService' = 'ITransformationAnalyzer'
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

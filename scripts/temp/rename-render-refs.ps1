$replacements = @{
    'CanvasManagementService' = 'CanvasManager'
    'ICanvasManagementService' = 'ICanvasManager'
    'DimensionCalculationService' = 'DimensionCalculator'
    'IDimensionCalculationService' = 'IDimensionCalculator'
    'FontManagementService' = 'FontManager'
    'IFontManagementService' = 'IFontManager'
    'ImageCompositionService' = 'ImageComposer'
    'IImageCompositionService' = 'IImageComposer'
    'ImageFormatConverterService' = 'ImageFormatConverter'
    'IImageFormatConverterService' = 'IImageFormatConverter'
    'LayoutCalculationService' = 'LayoutCalculator'
    'ILayoutCalculationService' = 'ILayoutCalculator'
    'SequenceRenderService' = 'SequenceRenderer'
    'ISequenceRenderService' = 'ISequenceRenderer'
    'SVGToCanvasConverterService' = 'SVGToCanvasConverter'
    'ISVGToCanvasConverterService' = 'ISVGToCanvasConverter'
    'TextRenderingService' = 'TextRenderer'
    'ITextRenderingService' = 'ITextRenderer'
    'FilenameGeneratorService' = 'FilenameGenerator'
    'GlyphCacheService' = 'GlyphCache'
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

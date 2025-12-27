$replacements = @{
    # Compose services
    'ITrailCaptureService' = 'ITrailCapturer'
    'TrailCaptureService' = 'TrailCapturer'
    'IVideoPreRenderService' = 'IVideoPreRenderer'
    'VideoPreRenderService' = 'VideoPreRenderer'

    # Discover types - these need exact replacements
    'TYPES\.IDiscoverThumbnailService' = 'TYPES.IDiscoverThumbnailProvider'
    'TYPES\.IDiscoverCacheService' = 'TYPES.IDiscoverCache'
    'TYPES\.IDiscoverFilterService' = 'TYPES.IDiscoverFilter'
    'TYPES\.IDiscoverSortService' = 'TYPES.IDiscoverSorter'
    'TYPES\.IOptimizedDiscoverService' = 'TYPES.IOptimizedDiscoverer'
    'TYPES\.IDiscoverEventHandlerService' = 'TYPES.IDiscoverEventHandler'
    'TYPES\.ISectionService' = 'TYPES.ISectionManager'
    'TYPES\.IFavoritesService' = 'TYPES.IFavoritesManager'
    'TYPES\.IDeleteService' = 'TYPES.IDiscoverDeleter'
}

$excludeDirs = @('.git', 'node_modules', '.svelte-kit', 'dist', 'build')

Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.svelte" |
    Where-Object {
        $file = $_
        -not ($excludeDirs | Where-Object { $file.FullName -like "*\$_\*" })
    } |
    ForEach-Object {
        $content = Get-Content $_.FullName -Raw
        $original = $content

        foreach ($old in $replacements.Keys) {
            $content = $content -replace $old, $replacements[$old]
        }

        if ($content -ne $original) {
            Set-Content -Path $_.FullName -Value $content -NoNewline
            Write-Host "Updated: $($_.FullName)"
        }
    }

Write-Host "Done!"

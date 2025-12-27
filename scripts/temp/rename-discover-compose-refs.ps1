$replacements = @{
    # Discover Display
    'DiscoverCacheService' = 'DiscoverCache'
    'IDiscoverCacheService' = 'IDiscoverCache'
    'DiscoverFilterService' = 'DiscoverFilter'
    'IDiscoverFilterService' = 'IDiscoverFilter'
    'DiscoverSectionService' = 'DiscoverSectionManager'
    'IDiscoverSectionService' = 'IDiscoverSectionManager'
    'DiscoverSortService' = 'DiscoverSorter'
    'IDiscoverSortService' = 'IDiscoverSorter'
    'DiscoverThumbnailService' = 'DiscoverThumbnailProvider'
    'IDiscoverThumbnailService' = 'IDiscoverThumbnailProvider'

    # Discover Navigation - be careful not to conflict with cap-labeler Navigator
    # leaving NavigationService -> Navigator which was already done

    # Discover Spotlight
    'SpotlightService' = 'SpotlightManager'
    'ISpotlightService' = 'ISpotlightManager'

    # Discover Shared
    'DiscoverDeleteService' = 'DiscoverDeleter'
    'IDiscoverDeleteService' = 'IDiscoverDeleter'
    'DiscoverEventHandlerService' = 'DiscoverEventHandler'
    'IDiscoverEventHandlerService' = 'IDiscoverEventHandler'
    'FavoritesService' = 'FavoritesManager'
    'IFavoritesService' = 'IFavoritesManager'
    'OptimizedDiscoverService' = 'OptimizedDiscoverer'
    'IOptimizedDiscoverService' = 'IOptimizedDiscoverer'
    'ISectionService' = 'ISectionManager'
    'SectionService' = 'SectionManager'
    'ISequenceIndexService' = 'ISequenceIndexer'
    'SequenceIndexService' = 'SequenceIndexer'
    'DiscoverPersistenceService' = 'DiscoverPersister'
    'IDiscoverPersistenceService' = 'IDiscoverPersister'
    'DiscoverScrollBehaviorService' = 'DiscoverScrollBehavior'
    'IDiscoverScrollBehaviorService' = 'IDiscoverScrollBehavior'

    # Compose Services
    'AnimationPlaybackControllerService' = 'AnimationPlaybackController'
    'IAnimationPlaybackControllerService' = 'IAnimationPlaybackController'
    'AnimationStorageService' = 'AnimationStorage'
    'IAnimationStorageService' = 'IAnimationStorage'
    'SequenceAnimationOrchestratorService' = 'SequenceAnimationOrchestrator'
    'ISequenceAnimationOrchestratorService' = 'ISequenceAnimationOrchestrator'
    'SequenceFramePreRendererService' = 'SequenceFramePreRenderer'
    'ISequenceFramePreRendererService' = 'ISequenceFramePreRenderer'
    'TrailCaptureService' = 'TrailCapturer'
    'ITrailCaptureService' = 'ITrailCapturer'
    'VideoPreRenderService' = 'VideoPreRenderer'
    'IVideoPreRenderService' = 'IVideoPreRenderer'
    'CompositeVideoRendererService' = 'CompositeVideoRenderer'
    'ICompositeVideoRendererService' = 'ICompositeVideoRenderer'
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

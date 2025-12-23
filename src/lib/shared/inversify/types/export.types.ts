/**
 * Export Service Type Identifiers
 *
 * Services for exporting sequences as images, videos, and other formats.
 */

export const ExportTypes = {
  // Core Export
  IExportService: Symbol.for("IExportService"),
  IShareService: Symbol.for("IShareService"),
  IInstagramLinkService: Symbol.for("IInstagramLinkService"),
  IMediaBundlerService: Symbol.for("IMediaBundlerService"),
  IFileExportService: Symbol.for("IFileExportService"),

  // Video Export
  IFirebaseVideoUploadService: Symbol.for("IFirebaseVideoUploadService"),
  IRecordingPersistenceService: Symbol.for("IRecordingPersistenceService"),
  ICollaborativeVideoService: Symbol.for("ICollaborativeVideoService"),
  IVideoExportService: Symbol.for("IVideoExportService"),
  IVideoExportOrchestrator: Symbol.for("IVideoExportOrchestrator"),
  ICompositeVideoRenderer: Symbol.for("ICompositeVideoRenderer"),

  // Image Export
  IPageImageExportService: Symbol.for("IPageImageExportService"),
  IPageFactoryService: Symbol.for("IPageFactoryService"),
  IPrintablePageLayoutService: Symbol.for("IPrintablePageLayoutService"),
  ITKAImageExportService: Symbol.for("ITKAImageExportService"),
  ICanvasManagementService: Symbol.for("ICanvasManagementService"),
  IImageCompositionService: Symbol.for("IImageCompositionService"),
  ILayoutCalculationService: Symbol.for("ILayoutCalculationService"),
  IDimensionCalculationService: Symbol.for("IDimensionCalculationService"),
  IFilenameGeneratorService: Symbol.for("IFilenameGeneratorService"),
  IImagePreviewGenerator: Symbol.for("IImagePreviewGenerator"),

  // Word Card Export
  IWordCardExportIntegrationService: Symbol.for(
    "IWordCardExportIntegrationService"
  ),
  IWordCardExportOrchestrator: Symbol.for("IWordCardExportOrchestrator"),
  IWordCardImageGenerationService: Symbol.for(
    "IWordCardImageGenerationService"
  ),
  IWordCardImageConversionService: Symbol.for(
    "IWordCardImageConversionService"
  ),
  IWordCardBatchProcessingService: Symbol.for(
    "IWordCardBatchProcessingService"
  ),
  IWordCardExportProgressTracker: Symbol.for("IWordCardExportProgressTracker"),
  IWordCardCacheService: Symbol.for("IWordCardCacheService"),
  IWordCardSVGCompositionService: Symbol.for("IWordCardSVGCompositionService"),
  IWordCardMetadataOverlayService: Symbol.for(
    "IWordCardMetadataOverlayService"
  ),

  // Format Conversion
  IImageFormatConverterService: Symbol.for("IImageFormatConverterService"),
  ISVGToCanvasConverterService: Symbol.for("ISVGToCanvasConverterService"),

  // Config
  IExportConfigManager: Symbol.for("IExportConfigManager"),
  IExportOptionsValidator: Symbol.for("IExportOptionsValidator"),
  IExportMemoryCalculator: Symbol.for("IExportMemoryCalculator"),
} as const;

/**
 * Comprehensive Service Registration Script
 *
 * This script finds all service implementations and adds missing bindings to the InversifyJS container.
 * It handles the complete migration from the old DI system to InversifyJS.
 */

const fs = require("fs").promises;
const path = require("path");

// All service implementations found in the codebase
const SERVICE_IMPLEMENTATIONS = [
  // Application Services
  {
    class: "DeviceDetectionService",
    interface: "IDeviceDetectionService",
    path: "../implementations/application/DeviceDetectionService",
  },

  // Background Services
  {
    class: "BackgroundService",
    interface: "IBackgroundService",
    path: "../implementations/background/BackgroundService",
  },

  // Browse Services
  {
    class: "BrowseService",
    interface: "IBrowseService",
    path: "../implementations/browse/BrowseService",
  },
  {
    class: "FavoritesService",
    interface: "IFavoritesService",
    path: "../implementations/browse/FavoritesService",
  },

  // Data Services
  {
    class: "ArrowPlacementService",
    interface: "IArrowPlacementService",
    path: "../implementations/data/ArrowPlacementService",
  },
  {
    class: "CsvLoaderService",
    interface: "ICsvLoaderService",
    path: "../implementations/data/CsvLoaderService",
  },
  {
    class: "CSVParserService",
    interface: "ICSVParserService",
    path: "../implementations/data/CSVParserService",
  },
  {
    class: "DataTransformationService",
    interface: "IDataTransformationService",
    path: "../implementations/data/DataTransformationService",
  },
  {
    class: "EnumMappingService",
    interface: "IEnumMappingService",
    path: "../implementations/data/EnumMappingService",
  },
  {
    class: "LetterQueryService",
    interface: "ILetterQueryService",
    path: "../implementations/data/LetterQueryService",
  },
  {
    class: "MotionQueryService",
    interface: "IMotionQueryService",
    path: "../implementations/data/MotionQueryService",
  },
  {
    class: "OptionFilteringService",
    interface: "IOptionFilteringService",
    path: "../implementations/data/OptionFilteringService",
  },
  {
    class: "ExampleSequenceService",
    interface: "IExampleSequenceService",
    path: "../implementations/data/PictographTransformationService",
  },

  // Domain Services
  {
    class: "GridModeDeriver",
    interface: "IGridModeDeriver",
    path: "../implementations/domain/GridModeDeriver",
  },
  {
    class: "LetterDeriver",
    interface: "ILetterDeriver",
    path: "../implementations/domain/LetterDeriver",
  },
  {
    class: "PictographValidatorService",
    interface: "IPictographValidatorService",
    path: "../implementations/domain/PictographValidatorService",
  },
  {
    class: "PositionPatternService",
    interface: "IPositionPatternService",
    path: "../implementations/domain/PositionPatternService",
  },
  {
    class: "SequenceDomainService",
    interface: "ISequenceDomainService",
    path: "../implementations/domain/SequenceDomainService",
  },
  {
    class: "StartPositionService",
    interface: "IStartPositionService",
    path: "../implementations/domain/StartPositionService",
  },

  // Export Services
  {
    class: "ExportService",
    interface: "IExportService",
    path: "../implementations/export/ExportService",
  },
  {
    class: "PageImageExportService",
    interface: "IPageImageExportService",
    path: "../implementations/export/PageImageExportService",
  },
  {
    class: "ThumbnailService",
    interface: "IThumbnailService",
    path: "../implementations/export/ThumbnailService",
  },

  // Generation Services
  {
    class: "PageFactoryService",
    interface: "IPageFactoryService",
    path: "../implementations/generation/PageFactoryService",
  },
  {
    class: "PictographGenerator",
    interface: "IPictographGenerator",
    path: "../implementations/generation/PictographGenerator",
  },
  {
    class: "SequenceGenerationService",
    interface: "ISequenceGenerationService",
    path: "../implementations/generation/SequenceGenerationService",
  },

  // Image Export Services
  {
    class: "BeatRenderingService",
    interface: "IBeatRenderingService",
    path: "../implementations/image-export/BeatRenderingService",
  },
  {
    class: "CanvasManagementService",
    interface: "ICanvasManagementService",
    path: "../implementations/image-export/CanvasManagementService",
  },
  {
    class: "ExportConfigurationManager",
    interface: "IExportConfigurationManager",
    path: "../implementations/image-export/ExportConfigurationManager",
  },
  {
    class: "ExportMemoryCalculator",
    interface: "IExportMemoryCalculator",
    path: "../implementations/image-export/ExportMemoryCalculator",
  },
  {
    class: "ExportOptionsValidator",
    interface: "IExportOptionsValidator",
    path: "../implementations/image-export/ExportOptionsValidator",
  },
  {
    class: "FileExportService",
    interface: "IFileExportService",
    path: "../implementations/image-export/FileExportService",
  },
  {
    class: "FilenameGeneratorService",
    interface: "IFilenameGeneratorService",
    path: "../implementations/image-export/FilenameGeneratorService",
  },
  {
    class: "GridOverlayService",
    interface: "IGridOverlayService",
    path: "../implementations/image-export/GridOverlayService",
  },
  {
    class: "ImageCompositionService",
    interface: "IImageCompositionService",
    path: "../implementations/image-export/ImageCompositionService",
  },
  {
    class: "ImagePreviewGenerator",
    interface: "IImagePreviewGenerator",
    path: "../implementations/image-export/ImagePreviewGenerator",
  },
  {
    class: "LayoutCalculationService",
    interface: "ILayoutCalculationService",
    path: "../implementations/image-export/LayoutCalculationService",
  },
  {
    class: "TextRenderingService",
    interface: "ITextRenderingService",
    path: "../implementations/image-export/TextRenderingService",
  },
  {
    class: "TKAImageExportService",
    interface: "ITKAImageExportService",
    path: "../implementations/image-export/TKAImageExportService",
  },

  // Layout Services
  {
    class: "BeatFrameService",
    interface: "IBeatFrameService",
    path: "../implementations/layout/BeatFrameService",
  },

  // Motion Tester Services
  {
    class: "AnimationControlService",
    interface: "IAnimationControlService",
    path: "../implementations/motion-tester/AnimationControlService",
  },
  {
    class: "MotionParameterService",
    interface: "IMotionParameterService",
    path: "../implementations/motion-tester/MotionParameterService",
  },

  // Movement Services
  {
    class: "CSVPictographGenerator",
    interface: "IPictographGenerator",
    path: "../implementations/movement/CSVMovementGeneratorService",
  },
  {
    class: "CSVPictographLoaderService",
    interface: "ICSVPictographLoaderService",
    path: "../implementations/movement/CSVPictographLoaderService",
  },

  // Navigation Services
  {
    class: "NavigationService",
    interface: "INavigationService",
    path: "../implementations/navigation/NavigationService",
  },
  {
    class: "PanelManagementService",
    interface: "IPanelManagementService",
    path: "../implementations/navigation/PanelManagementService",
  },
  {
    class: "SectionService",
    interface: "ISectionService",
    path: "../implementations/navigation/SectionService",
  },

  // Persistence Services
  {
    class: "FilterPersistenceService",
    interface: "IFilterPersistenceService",
    path: "../implementations/persistence/FilterPersistenceService",
  },
  {
    class: "LocalStoragePersistenceService",
    interface: "IPersistenceService",
    path: "../implementations/persistence/LocalStoragePersistenceService",
  },
  {
    class: "SettingsService",
    interface: "ISettingsService",
    path: "../implementations/persistence/SettingsService",
  },

  // Positioning Services
  {
    class: "ArrowLocationService",
    interface: "IArrowLocationService",
    path: "../implementations/positioning/ArrowLocationService",
  },
  {
    class: "ArrowPlacementKeyService",
    interface: "IArrowPlacementKeyService",
    path: "../implementations/positioning/ArrowPlacementKeyService",
  },
  {
    class: "ArrowPositioningService",
    interface: "IArrowPositioningService",
    path: "../implementations/positioning/ArrowPositioningService",
  },
  {
    class: "BetaOffsetCalculator",
    interface: "IBetaOffsetCalculator",
    path: "../implementations/positioning/BetaOffsetCalculator",
  },
  {
    class: "PropPlacementService",
    interface: "IPropPlacementService",
    path: "../implementations/positioning/PropPlacementService",
  },

  // Rendering Services
  {
    class: "ArrowRenderingService",
    interface: "IArrowRenderingService",
    path: "../implementations/rendering/ArrowRenderingService",
  },
  {
    class: "BeatGridService",
    interface: "IBeatGridService",
    path: "../implementations/rendering/BeatGridService",
  },
  {
    class: "GridRenderingService",
    interface: "IGridRenderingService",
    path: "../implementations/rendering/GridRenderingService",
  },
  {
    class: "OverlayRenderingService",
    interface: "IOverlayRenderingService",
    path: "../implementations/rendering/OverlayRenderingService",
  },
  {
    class: "PropCoordinatorService",
    interface: "IPropCoordinatorService",
    path: "../implementations/rendering/PropCoordinatorService",
  },
  {
    class: "SvgConfiguration",
    interface: "ISvgConfiguration",
    path: "../implementations/rendering/SvgConfiguration",
  },
  {
    class: "SvgUtilityService",
    interface: "ISvgUtilityService",
    path: "../implementations/rendering/SvgUtilityService",
  },

  // Sequence Services
  {
    class: "DeleteService",
    interface: "IDeleteService",
    path: "../implementations/sequence/DeleteService",
  },
  {
    class: "PrintablePageLayoutService",
    interface: "IPrintablePageLayoutService",
    path: "../implementations/sequence/PrintablePageLayoutService",
  },
  {
    class: "SequenceDeletionService",
    interface: "ISequenceDeletionService",
    path: "../implementations/sequence/SequenceDeletionService",
  },
  {
    class: "SequenceImportService",
    interface: "ISequenceImportService",
    path: "../implementations/sequence/SequenceImportService",
  },
  {
    class: "SequenceIndexService",
    interface: "ISequenceIndexService",
    path: "../implementations/sequence/SequenceIndexService",
  },
  {
    class: "SequenceService",
    interface: "ISequenceService",
    path: "../implementations/sequence/SequenceService",
  },
  {
    class: "SequenceStateService",
    interface: "ISequenceStateService",
    path: "../implementations/sequence/SequenceStateService",
  },

  // Workbench Services
  {
    class: "WorkbenchService",
    interface: "IWorkbenchService",
    path: "../implementations/workbench/WorkbenchService",
  },

  // Codex Services
  {
    class: "CodexService",
    interface: "ICodexService",
    path: "../codex/CodexService",
  },

  // Repository Services
  {
    class: "LessonRepository",
    interface: "ILessonRepository",
    path: "../../repositories/LessonRepository",
  },
  {
    class: "LetterMappingRepository",
    interface: "ILetterMappingRepository",
    path: "../../repositories/LetterMappingRepository",
  },
];

/**
 * Generate import statements for services
 */
function generateImports(services) {
  return services
    .map((service) => `import { ${service.class} } from "${service.path}";`)
    .join("\n");
}

/**
 * Generate binding statements for services
 */
function generateBindings(services) {
  return services
    .map(
      (service) =>
        `  container.bind(TYPES.${service.interface}).to(${service.class});`
    )
    .join("\n");
}

/**
 * Read current container file
 */
async function readContainerFile() {
  const containerPath = path.join(
    __dirname,
    "..",
    "src",
    "lib",
    "services",
    "inversify",
    "container.ts"
  );
  return await fs.readFile(containerPath, "utf8");
}

/**
 * Write updated container file
 */
async function writeContainerFile(content) {
  const containerPath = path.join(
    __dirname,
    "..",
    "src",
    "lib",
    "services",
    "inversify",
    "container.ts"
  );
  await fs.writeFile(containerPath, content, "utf8");
}

/**
 * Main function to add all missing service bindings
 */
async function addAllMissingBindings() {
  console.log("🚀 Starting comprehensive service registration...\n");

  try {
    // Read current container
    const currentContent = await readContainerFile();

    // Find services that are not already imported
    const newServices = SERVICE_IMPLEMENTATIONS.filter(
      (service) => !currentContent.includes(`import { ${service.class} }`)
    );

    console.log(
      `📊 Found ${newServices.length} services to add out of ${SERVICE_IMPLEMENTATIONS.length} total services`
    );

    if (newServices.length === 0) {
      console.log("✅ All services are already registered!");
      return;
    }

    // Generate new imports and bindings
    const newImports = generateImports(newServices);
    const newBindings = generateBindings(newServices);

    console.log("\n📦 New imports to add:");
    console.log(newImports);

    console.log("\n🔗 New bindings to add:");
    console.log(newBindings);

    // Add imports after existing imports
    let updatedContent = currentContent;

    // Find the last import statement
    const lastImportMatch = updatedContent.match(/import.*from.*;\s*$/gm);
    if (lastImportMatch) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      const lastImportIndex =
        updatedContent.lastIndexOf(lastImport) + lastImport.length;
      updatedContent =
        updatedContent.slice(0, lastImportIndex) +
        "\n\n" +
        newImports +
        "\n" +
        updatedContent.slice(lastImportIndex);
    }

    // Add bindings before the console.log success message
    const successLogIndex = updatedContent.indexOf(
      'console.log("✅ TKA Container: All services bound successfully");'
    );
    if (successLogIndex !== -1) {
      updatedContent =
        updatedContent.slice(0, successLogIndex) +
        newBindings +
        "\n\n  " +
        updatedContent.slice(successLogIndex);
    }

    // Write updated container
    await writeContainerFile(updatedContent);

    console.log("\n🎉 Successfully added all missing service bindings!");
    console.log(
      `📈 Container now has ${SERVICE_IMPLEMENTATIONS.length} total services bound`
    );
    console.log("\n🔄 Restart the dev server to see the changes");
  } catch (error) {
    console.error("❌ Error adding service bindings:", error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  addAllMissingBindings().catch(console.error);
}

module.exports = { addAllMissingBindings, SERVICE_IMPLEMENTATIONS };

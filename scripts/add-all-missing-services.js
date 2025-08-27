/**
 * Add All Missing Services Script
 * 
 * This script adds all missing service bindings to the InversifyJS container.
 */

const fs = require('fs');
const path = require('path');

// All missing service imports that need to be added
const MISSING_IMPORTS = `
// Additional service imports
import { ApplicationInitializationService } from "../implementations/application/ApplicationInitializationService";
import { BackgroundService } from "../implementations/background/BackgroundService";
import { FavoritesService } from "../implementations/browse/FavoritesService";
import { ArrowPlacementService } from "../implementations/data/ArrowPlacementService";
import { DataTransformationService } from "../implementations/data/DataTransformationService";
import { EnumMappingService } from "../implementations/data/EnumMappingService";
import { MotionQueryService } from "../implementations/data/MotionQueryService";
import { OptionFilteringService } from "../implementations/data/OptionFilteringService";
import { ExampleSequenceService } from "../implementations/data/PictographTransformationService";
import { LetterDeriver } from "../implementations/domain/LetterDeriver";
import { PictographValidatorService } from "../implementations/domain/PictographValidatorService";
import { PositionPatternService } from "../implementations/domain/PositionPatternService";
import { ExportService } from "../implementations/export/ExportService";
import { PageImageExportService } from "../implementations/export/PageImageExportService";
import { ThumbnailService } from "../implementations/export/ThumbnailService";
import { PageFactoryService } from "../implementations/generation/PageFactoryService";
import { PictographGenerator } from "../implementations/generation/PictographGenerator";
import { SequenceGenerationService } from "../implementations/generation/SequenceGenerationService";
import { BeatRenderingService } from "../implementations/image-export/BeatRenderingService";
import { CanvasManagementService } from "../implementations/image-export/CanvasManagementService";
import { ExportConfigurationManager } from "../implementations/image-export/ExportConfigurationManager";
import { ExportMemoryCalculator } from "../implementations/image-export/ExportMemoryCalculator";
import { ExportOptionsValidator } from "../implementations/image-export/ExportOptionsValidator";
import { FileExportService } from "../implementations/image-export/FileExportService";
import { FilenameGeneratorService } from "../implementations/image-export/FilenameGeneratorService";
import { GridOverlayService } from "../implementations/image-export/GridOverlayService";
import { ImageCompositionService } from "../implementations/image-export/ImageCompositionService";
import { ImagePreviewGenerator } from "../implementations/image-export/ImagePreviewGenerator";
import { LayoutCalculationService } from "../implementations/image-export/LayoutCalculationService";
import { TextRenderingService } from "../implementations/image-export/TextRenderingService";
import { TKAImageExportService } from "../implementations/image-export/TKAImageExportService";
import { AnimationControlService } from "../implementations/motion-tester/AnimationControlService";
import { MotionParameterService } from "../implementations/motion-tester/MotionParameterService";
import { CSVPictographLoaderService } from "../implementations/movement/CSVPictographLoaderService";
import { NavigationService } from "../implementations/navigation/NavigationService";
import { PanelManagementService } from "../implementations/navigation/PanelManagementService";
import { SectionService } from "../implementations/navigation/SectionService";
import { FilterPersistenceService } from "../implementations/persistence/FilterPersistenceService";
import { ArrowLocationService } from "../implementations/positioning/ArrowLocationService";
import { ArrowPlacementKeyService } from "../implementations/positioning/ArrowPlacementKeyService";
import { ArrowPositioningService } from "../implementations/positioning/ArrowPositioningService";
import { BetaOffsetCalculator } from "../implementations/positioning/BetaOffsetCalculator";
import { PropPlacementService } from "../implementations/positioning/PropPlacementService";
import { ArrowRenderingService } from "../implementations/rendering/ArrowRenderingService";
import { BeatGridService } from "../implementations/rendering/BeatGridService";
import { GridRenderingService } from "../implementations/rendering/GridRenderingService";
import { OverlayRenderingService } from "../implementations/rendering/OverlayRenderingService";
import { SvgConfiguration } from "../implementations/rendering/SvgConfiguration";
import { SvgUtilityService } from "../implementations/rendering/SvgUtilityService";
import { DeleteService } from "../implementations/sequence/DeleteService";
import { PrintablePageLayoutService } from "../implementations/sequence/PrintablePageLayoutService";
import { SequenceDeletionService } from "../implementations/sequence/SequenceDeletionService";
import { SequenceIndexService } from "../implementations/sequence/SequenceIndexService";
`;

// All missing service bindings that need to be added
const MISSING_BINDINGS = `
  // Additional service bindings
  container.bind(TYPES.IApplicationInitializationService).to(ApplicationInitializationService);
  container.bind(TYPES.IBackgroundService).to(BackgroundService);
  container.bind(TYPES.IFavoritesService).to(FavoritesService);
  container.bind(TYPES.IArrowPlacementService).to(ArrowPlacementService);
  container.bind(TYPES.IDataTransformationService).to(DataTransformationService);
  container.bind(TYPES.IEnumMappingService).to(EnumMappingService);
  container.bind(TYPES.IMotionQueryService).to(MotionQueryService);
  container.bind(TYPES.IOptionFilteringService).to(OptionFilteringService);
  container.bind(TYPES.IExampleSequenceService).to(ExampleSequenceService);
  container.bind(TYPES.ILetterDeriver).to(LetterDeriver);
  container.bind(TYPES.IPictographValidatorService).to(PictographValidatorService);
  container.bind(TYPES.IPositionPatternService).to(PositionPatternService);
  container.bind(TYPES.IExportService).to(ExportService);
  container.bind(TYPES.IPageImageExportService).to(PageImageExportService);
  container.bind(TYPES.IThumbnailService).to(ThumbnailService);
  container.bind(TYPES.IPageFactoryService).to(PageFactoryService);
  container.bind(TYPES.IPictographGenerator).to(PictographGenerator);
  container.bind(TYPES.ISequenceGenerationService).to(SequenceGenerationService);
  container.bind(TYPES.IBeatRenderingService).to(BeatRenderingService);
  container.bind(TYPES.ICanvasManagementService).to(CanvasManagementService);
  container.bind(TYPES.IExportConfigurationManager).to(ExportConfigurationManager);
  container.bind(TYPES.IExportMemoryCalculator).to(ExportMemoryCalculator);
  container.bind(TYPES.IExportOptionsValidator).to(ExportOptionsValidator);
  container.bind(TYPES.IFileExportService).to(FileExportService);
  container.bind(TYPES.IFilenameGeneratorService).to(FilenameGeneratorService);
  container.bind(TYPES.IGridOverlayService).to(GridOverlayService);
  container.bind(TYPES.IImageCompositionService).to(ImageCompositionService);
  container.bind(TYPES.IImagePreviewGenerator).to(ImagePreviewGenerator);
  container.bind(TYPES.ILayoutCalculationService).to(LayoutCalculationService);
  container.bind(TYPES.ITextRenderingService).to(TextRenderingService);
  container.bind(TYPES.ITKAImageExportService).to(TKAImageExportService);
  container.bind(TYPES.IAnimationControlService).to(AnimationControlService);
  container.bind(TYPES.IMotionParameterService).to(MotionParameterService);
  container.bind(TYPES.ICSVPictographLoaderService).to(CSVPictographLoaderService);
  container.bind(TYPES.INavigationService).to(NavigationService);
  container.bind(TYPES.IPanelManagementService).to(PanelManagementService);
  container.bind(TYPES.ISectionService).to(SectionService);
  container.bind(TYPES.IFilterPersistenceService).to(FilterPersistenceService);
  container.bind(TYPES.IArrowLocationService).to(ArrowLocationService);
  container.bind(TYPES.IArrowPlacementKeyService).to(ArrowPlacementKeyService);
  container.bind(TYPES.IArrowPositioningService).to(ArrowPositioningService);
  container.bind(TYPES.IBetaOffsetCalculator).to(BetaOffsetCalculator);
  container.bind(TYPES.IPropPlacementService).to(PropPlacementService);
  container.bind(TYPES.IArrowRenderingService).to(ArrowRenderingService);
  container.bind(TYPES.IBeatGridService).to(BeatGridService);
  container.bind(TYPES.IGridRenderingService).to(GridRenderingService);
  container.bind(TYPES.IOverlayRenderingService).to(OverlayRenderingService);
  container.bind(TYPES.ISvgConfiguration).to(SvgConfiguration);
  container.bind(TYPES.ISvgUtilityService).to(SvgUtilityService);
  container.bind(TYPES.IDeleteService).to(DeleteService);
  container.bind(TYPES.IPrintablePageLayoutService).to(PrintablePageLayoutService);
  container.bind(TYPES.ISequenceDeletionService).to(SequenceDeletionService);
  container.bind(TYPES.ISequenceIndexService).to(SequenceIndexService);
  container.bind(TYPES.IBrowseService).to(BrowseService);
`;

/**
 * Main function to add all missing services
 */
function addAllMissingServices() {
  console.log('🚀 Adding all missing services to InversifyJS container...\n');
  
  try {
    const containerPath = path.join(__dirname, '..', 'src', 'lib', 'services', 'inversify', 'container.ts');
    let content = fs.readFileSync(containerPath, 'utf8');
    
    // Add imports after the existing imports
    const lastImportIndex = content.lastIndexOf('import { BrowseService }');
    const afterLastImport = content.indexOf('\n', lastImportIndex) + 1;
    content = content.slice(0, afterLastImport) + MISSING_IMPORTS + content.slice(afterLastImport);
    
    // Add bindings before the success log
    const successLogIndex = content.indexOf('console.log("✅ TKA Container: All services bound successfully");');
    content = content.slice(0, successLogIndex) + MISSING_BINDINGS + '\n  ' + content.slice(successLogIndex);
    
    // Write the updated content
    fs.writeFileSync(containerPath, content, 'utf8');
    
    console.log('✅ Successfully added all missing services!');
    console.log('📈 Container now has 70+ services bound');
    console.log('🔄 Restart the dev server to see the changes');
    
  } catch (error) {
    console.error('❌ Error adding services:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  addAllMissingServices();
}

module.exports = { addAllMissingServices };

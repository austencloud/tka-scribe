#!/usr/bin/env node

/**
 * Batch Fix Injectable Decorators
 *
 * Automatically adds @injectable() decorators to service classes that are missing them.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Services that need @injectable() decorators based on our analysis
const servicesToFix = [
  "src/lib/services/implementations/browse/BrowseStatePersister.ts",
  "src/lib/services/implementations/conversion/ImageFormatConverterService.ts",
  "src/lib/services/implementations/conversion/SVGToCanvasConverterService.ts",
  "src/lib/services/implementations/data/ArrowPlacementService.ts",
  "src/lib/services/implementations/export/PageImageExportService.ts",
  "src/lib/services/implementations/export/sequence-card/SequenceCardBatchProcessingService.ts",
  "src/lib/services/implementations/export/sequence-card/SequenceCardCacheService.ts",
  "src/lib/services/implementations/export/sequence-card/SequenceCardImageConversionService.ts",
  "src/lib/services/implementations/export/sequence-card/SequenceCardImageGenerationService.ts",
  "src/lib/services/implementations/export/sequence-card/SequenceCardMetadataOverlayService.ts",
  "src/lib/services/implementations/export/sequence-card/SequenceCardSVGCompositionService.ts",
  "src/lib/services/implementations/export/SequenceCardExportIntegrationService.ts",
  "src/lib/services/implementations/image-export/CanvasManagementService.ts",
  "src/lib/services/implementations/image-export/FileExportService.ts",
  "src/lib/services/implementations/image-export/GridOverlayService.ts",
  "src/lib/services/implementations/movement/CSVPictographLoaderService.ts",
  "src/lib/services/implementations/positioning/ArrowLocationService.ts",
  "src/lib/services/implementations/positioning/ArrowPlacementKeyService.ts",
  "src/lib/services/implementations/positioning/PropPlacementService.ts",
  "src/lib/services/implementations/rendering/arrow/ArrowPathResolutionService.ts",
  "src/lib/services/implementations/rendering/arrow/ArrowPositioningService.ts",
  "src/lib/services/implementations/rendering/arrow/FallbackArrowService.ts",
  "src/lib/services/implementations/rendering/arrow/SvgColorTransformationService.ts",
  "src/lib/services/implementations/rendering/arrow/SvgLoadingService.ts",
  "src/lib/services/implementations/rendering/arrow/SvgParsingService.ts",
  "src/lib/services/implementations/sequence/PrintablePageLayoutService.ts",
];

async function fixInjectableDecorators() {
  console.log("🔧 Fixing @injectable() decorators...\n");

  let fixedCount = 0;
  let errorCount = 0;

  for (const servicePath of servicesToFix) {
    const fullPath = path.join(__dirname, servicePath);

    try {
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File not found: ${servicePath}`);
        continue;
      }

      const content = fs.readFileSync(fullPath, "utf8");

      // Check if already has @injectable()
      if (content.includes("@injectable()")) {
        console.log(`✅ ${servicePath}: Already has @injectable()`);
        continue;
      }

      // Check if it has inversify import
      const hasInversifyImport = content.includes('from "inversify"');

      let newContent = content;

      // Add inversify import if missing
      if (!hasInversifyImport) {
        // Find the last import statement
        const importLines = content
          .split("\n")
          .filter((line) => line.trim().startsWith("import"));
        if (importLines.length > 0) {
          const lastImportIndex = content.lastIndexOf(
            importLines[importLines.length - 1]
          );
          const afterLastImport = content.indexOf("\n", lastImportIndex) + 1;
          newContent =
            content.slice(0, afterLastImport) +
            'import { injectable } from "inversify";\n' +
            content.slice(afterLastImport);
        }
      } else {
        // Add injectable to existing import
        newContent = content.replace(
          /import\s*{([^}]*)}\s*from\s*["']inversify["']/,
          (match, imports) => {
            if (!imports.includes("injectable")) {
              const cleanImports = imports.trim();
              const newImports = cleanImports
                ? `${cleanImports}, injectable`
                : "injectable";
              return `import { ${newImports} } from "inversify"`;
            }
            return match;
          }
        );
      }

      // Add @injectable() decorator before export class
      newContent = newContent.replace(
        /^(export class \w+Service)/m,
        "@injectable()\n$1"
      );

      // Write the updated content
      fs.writeFileSync(fullPath, newContent, "utf8");
      console.log(`✅ ${servicePath}: Added @injectable() decorator`);
      fixedCount++;
    } catch (error) {
      console.error(`❌ Error fixing ${servicePath}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`- Services fixed: ${fixedCount}`);
  console.log(`- Errors: ${errorCount}`);

  return errorCount === 0;
}

// Run the fix
fixInjectableDecorators()
  .then((success) => {
    console.log(
      success
        ? "\n🎉 All @injectable() decorators fixed!"
        : "\n⚠️  Some errors occurred"
    );
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Error fixing decorators:", error);
    process.exit(1);
  });

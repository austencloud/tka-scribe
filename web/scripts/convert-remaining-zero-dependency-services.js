#!/usr/bin/env node

/**
 * Convert Remaining Zero-Dependency Services to InversifyJS
 *
 * This script converts the remaining services that have zero dependencies
 * and are still registered in the custom DI system.
 */

import fs from "fs/promises";

// Remaining zero-dependency services that are still in custom DI
const REMAINING_ZERO_DEPENDENCY_SERVICES = [
  // Browse services that are likely zero-dependency
  {
    name: "ThumbnailService",
    path: "src/lib/services/implementations/export/ThumbnailService.ts",
    interface: "IThumbnailService",
    interfacePath: "../interfaces/browse-interfaces",
    type: "IThumbnailService",
  },
  {
    name: "NavigationService",
    path: "src/lib/services/implementations/navigation/NavigationService.ts",
    interface: "INavigationService",
    interfacePath: "../interfaces/browse-interfaces",
    type: "INavigationService",
  },
  {
    name: "BrowseService",
    path: "src/lib/services/implementations/browse/BrowseService.ts",
    interface: "IBrowseService",
    interfacePath: "../interfaces/browse-interfaces",
    type: "IBrowseService",
  },
  // Services that might exist and be zero-dependency
  {
    name: "SequenceIndexService",
    path: "src/lib/services/implementations/browse/SequenceIndexService.ts",
    interface: "ISequenceIndexService",
    interfacePath: "../interfaces/browse-interfaces",
    type: "ISequenceIndexService",
  },
  {
    name: "FavoritesService",
    path: "src/lib/services/implementations/browse/FavoritesService.ts",
    interface: "IFavoritesService",
    interfacePath: "../interfaces/browse-interfaces",
    type: "IFavoritesService",
  },
  {
    name: "SectionService",
    path: "src/lib/services/implementations/browse/SectionService.ts",
    interface: "ISectionService",
    interfacePath: "../interfaces/browse-interfaces",
    type: "ISectionService",
  },
  {
    name: "DeleteService",
    path: "src/lib/services/implementations/browse/DeleteService.ts",
    interface: "IDeleteService",
    interfacePath: "../interfaces/browse-interfaces",
    type: "IDeleteService",
  },
];

/**
 * Analyze service dependencies by examining constructor
 */
async function analyzeDependencies(service) {
  try {
    const content = await fs.readFile(service.path, "utf-8");

    // Check if already converted
    if (content.includes("@injectable()")) {
      console.log(`✅ ${service.name}: Already converted`);
      return null;
    }

    const constructorRegex = /constructor\s*\(\s*([^)]*)\s*\)/s;
    const match = content.match(constructorRegex);

    if (!match || !match[1].trim()) {
      console.log(`📋 ${service.name}: Zero dependencies (empty constructor)`);
      return { ...service, dependencies: [] };
    }

    const params = match[1].trim();
    const paramCount = params.split(",").filter((p) => p.trim()).length;
    console.log(`📋 ${service.name}: ${paramCount} constructor parameters`);
    console.log(`   Parameters: ${params.replace(/\s+/g, " ")}`);

    return service;
  } catch (error) {
    console.error(`❌ Failed to analyze ${service.path}:`, error.message);
    return null;
  }
}

/**
 * Convert service with @injectable decorator
 */
async function convertService(service) {
  try {
    const content = await fs.readFile(service.path, "utf-8");

    let updatedContent = content;

    // Add inversify imports
    if (!content.includes("import { injectable")) {
      const importRegex = /^import.*from.*['"];$/m;
      const match = content.match(importRegex);
      if (match) {
        const insertIndex = content.indexOf(match[0]) + match[0].length;
        updatedContent =
          content.slice(0, insertIndex) +
          '\nimport { injectable } from "inversify";' +
          content.slice(insertIndex);
      }
    }

    // Add @injectable() decorator before class declaration
    const classRegex = /^export class (\w+)/m;
    updatedContent = updatedContent.replace(
      classRegex,
      "@injectable()\nexport class $1"
    );

    await fs.writeFile(service.path, updatedContent, "utf-8");
    console.log(`✅ Converted ${service.name}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to convert ${service.path}:`, error.message);
    return false;
  }
}

/**
 * Update container bindings
 */
async function updateContainerBindings(services) {
  const containerPath = "src/lib/services/inversify/container.ts";

  try {
    let content = await fs.readFile(containerPath, "utf-8");

    // Add implementation imports
    const implementationImports = services
      .map(
        (service) =>
          `import { ${service.name} } from "../implementations/${service.path.replace("src/lib/services/implementations/", "")}";`
      )
      .join("\n");

    // Add interface imports
    const interfaceImports = services
      .map(
        (service) =>
          `import type { ${service.interface} } from "${service.interfacePath}";`
      )
      .join("\n");

    // Add bindings
    const bindings = services
      .map(
        (service) =>
          `  container.bind<${service.interface}>(TYPES.${service.type}).to(${service.name});`
      )
      .join("\n");

    // Insert implementation imports after existing imports
    const lastImportIndex = content.lastIndexOf("import ");
    const lastImportEnd = content.indexOf("\n", lastImportIndex) + 1;
    content =
      content.slice(0, lastImportEnd) +
      implementationImports +
      "\n" +
      content.slice(lastImportEnd);

    // Insert interface imports after application interfaces
    const interfaceInsertPoint = content.indexOf(
      '} from "../interfaces/application-interfaces";'
    );
    const interfaceInsertEnd = content.indexOf("\n", interfaceInsertPoint) + 1;
    content =
      content.slice(0, interfaceInsertEnd) +
      interfaceImports +
      "\n" +
      content.slice(interfaceInsertEnd);

    // Insert bindings before return statement
    const returnIndex = content.lastIndexOf("return container;");
    content =
      content.slice(0, returnIndex) +
      bindings +
      "\n\n  " +
      content.slice(returnIndex);

    await fs.writeFile(containerPath, content, "utf-8");
    console.log(
      `✅ Updated container bindings for ${services.length} services`
    );
    return true;
  } catch (error) {
    console.error(`❌ Failed to update container bindings:`, error.message);
    return false;
  }
}

/**
 * Main conversion function
 */
async function convertRemainingZeroDependencyServices() {
  console.log(
    "🚀 Starting conversion of remaining zero-dependency services..."
  );

  // Analyze dependencies first
  console.log("\n📊 Analyzing service dependencies...");
  const analyzedServices = [];
  for (const service of REMAINING_ZERO_DEPENDENCY_SERVICES) {
    const analyzed = await analyzeDependencies(service);
    if (analyzed) {
      analyzedServices.push(analyzed);
    }
  }

  // Convert services
  console.log("\n🔄 Converting services...");
  const convertedServices = [];
  for (const service of analyzedServices) {
    const success = await convertService(service);
    if (success) {
      convertedServices.push(service);
    }
  }

  if (convertedServices.length > 0) {
    console.log(
      `\n📦 Updating container for ${convertedServices.length} converted services...`
    );
    await updateContainerBindings(convertedServices);
  }

  console.log(
    `\n🎉 Conversion complete! Converted ${convertedServices.length}/${REMAINING_ZERO_DEPENDENCY_SERVICES.length} services`
  );
  console.log(
    "📋 Converted services:",
    convertedServices.map((s) => s.name).join(", ")
  );
}

// Run the conversion
convertRemainingZeroDependencyServices().catch(console.error);

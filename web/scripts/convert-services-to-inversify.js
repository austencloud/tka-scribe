#!/usr/bin/env node

/**
 * Automated InversifyJS Service Conversion Script
 * 
 * This script programmatically converts services from the old custom DI system
 * to InversifyJS by:
 * 1. Adding @injectable() decorators to service classes
 * 2. Adding @inject() decorators for dependencies
 * 3. Updating container bindings
 * 4. Updating test files
 */

import fs from 'fs/promises';
import path from 'path';

// Service conversion configuration
const ZERO_DEPENDENCY_SERVICES = [
  {
    name: 'EnumMappingService',
    path: 'src/lib/services/implementations/data/EnumMappingService.ts',
    interface: 'IEnumMappingService',
    interfacePath: '../interfaces/data-interfaces',
    type: 'IEnumMappingService'
  },
  {
    name: 'CSVParserService', 
    path: 'src/lib/services/implementations/data/CSVParserService.ts',
    interface: 'ICSVParsingService',
    interfacePath: '../interfaces/data-interfaces',
    type: 'ICSVParsingService'
  },
  {
    name: 'DataTransformationService',
    path: 'src/lib/services/implementations/data/DataTransformationService.ts',
    interface: 'IDataTransformationService',
    interfacePath: '../interfaces/rendering-interfaces',
    type: 'IDataTransformationService'
  },
  {
    name: 'LetterQueryService',
    path: 'src/lib/services/implementations/data/LetterQueryService.ts',
    interface: 'ILetterQueryService',
    interfacePath: '../interfaces/data-interfaces',
    type: 'ILetterQueryService'
  },
  {
    name: 'MotionQueryService',
    path: 'src/lib/services/implementations/data/MotionQueryService.ts',
    interface: 'IMotionQueryService',
    interfacePath: '../interfaces/data-interfaces',
    type: 'IMotionQueryService'
  },
  {
    name: 'GridModeDeriver',
    path: 'src/lib/services/implementations/domain/GridModeDeriver.ts',
    interface: 'IGridModeDeriver',
    interfacePath: '../interfaces/domain-interfaces',
    type: 'IGridModeDeriver'
  },
  {
    name: 'LetterDeriver',
    path: 'src/lib/services/implementations/domain/LetterDeriver.ts',
    interface: 'ILetterDeriver',
    interfacePath: '../interfaces/domain-interfaces',
    type: 'ILetterDeriver'
  },
  {
    name: 'PictographValidatorService',
    path: 'src/lib/services/implementations/domain/PictographValidatorService.ts',
    interface: 'IPictographValidatorService',
    interfacePath: '../interfaces/domain-interfaces',
    type: 'IPictographValidatorService'
  },
  {
    name: 'PositionPatternService',
    path: 'src/lib/services/implementations/domain/PositionPatternService.ts',
    interface: 'IPositionPatternService',
    interfacePath: '../interfaces/domain-interfaces',
    type: 'IPositionPatternService'
  },
  {
    name: 'SvgConfiguration',
    path: 'src/lib/services/implementations/rendering/SvgConfiguration.ts',
    interface: 'ISvgConfiguration',
    interfacePath: '../interfaces/rendering-interfaces',
    type: 'ISvgConfiguration'
  },
  {
    name: 'FilenameGeneratorService',
    path: 'src/lib/services/implementations/image-export/FilenameGeneratorService.ts',
    interface: 'IFilenameGeneratorService',
    interfacePath: '../interfaces/image-export-interfaces',
    type: 'IFilenameGeneratorService'
  },
  {
    name: 'ExportOptionsValidator',
    path: 'src/lib/services/implementations/image-export/ExportOptionsValidator.ts',
    interface: 'IExportOptionsValidator',
    interfacePath: '../interfaces/image-export-interfaces',
    type: 'IExportOptionsValidator'
  }
];

/**
 * Add @injectable() decorator to a service class
 */
async function addInjectableDecorator(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Check if already has @injectable()
    if (content.includes('@injectable()')) {
      console.log(`✅ ${filePath} already has @injectable() decorator`);
      return false;
    }
    
    // Add inversify import
    let updatedContent = content;
    if (!content.includes('import { injectable }')) {
      // Find the first import statement and add inversify import after it
      const importRegex = /^import.*from.*['"];$/m;
      const match = content.match(importRegex);
      if (match) {
        const insertIndex = content.indexOf(match[0]) + match[0].length;
        updatedContent = content.slice(0, insertIndex) + 
          '\nimport { injectable } from "inversify";' + 
          content.slice(insertIndex);
      }
    }
    
    // Add @injectable() decorator before class declaration
    const classRegex = /^export class (\w+)/m;
    updatedContent = updatedContent.replace(classRegex, '@injectable()\nexport class $1');
    
    await fs.writeFile(filePath, updatedContent, 'utf-8');
    console.log(`✅ Added @injectable() decorator to ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to add @injectable() to ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Update container bindings for converted services
 */
async function updateContainerBindings(services) {
  const containerPath = 'src/lib/services/inversify/container.ts';
  
  try {
    let content = await fs.readFile(containerPath, 'utf-8');
    
    // Add interface imports
    const interfaceImports = services.map(service => 
      `import type { ${service.interface} } from "${service.interfacePath}";`
    ).join('\n');
    
    // Add implementation imports  
    const implementationImports = services.map(service =>
      `import { ${service.name} } from "../implementations/${service.path.replace('src/lib/services/implementations/', '')}";`
    ).join('\n');
    
    // Add bindings
    const bindings = services.map(service =>
      `  container.bind<${service.interface}>(TYPES.${service.type}).to(${service.name});`
    ).join('\n');
    
    // Insert imports after existing imports
    const importInsertPoint = content.lastIndexOf('import');
    const importEndPoint = content.indexOf('\n', importInsertPoint) + 1;
    
    content = content.slice(0, importEndPoint) + 
      interfaceImports + '\n' + 
      implementationImports + '\n' + 
      content.slice(importEndPoint);
    
    // Insert bindings after existing bindings
    const bindingInsertPoint = content.lastIndexOf('container.bind');
    const bindingEndPoint = content.indexOf('\n', bindingInsertPoint) + 1;
    
    content = content.slice(0, bindingEndPoint) + 
      bindings + '\n' + 
      content.slice(bindingEndPoint);
    
    await fs.writeFile(containerPath, content, 'utf-8');
    console.log(`✅ Updated container bindings for ${services.length} services`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to update container bindings:`, error.message);
    return false;
  }
}

/**
 * Update test file to include new services
 */
async function updateTestFile(services) {
  const testPath = 'src/lib/services/inversify/test-service-resolution.ts';
  
  try {
    let content = await fs.readFile(testPath, 'utf-8');
    
    // Add interface imports
    const interfaceImports = services.map(service => 
      `import type { ${service.interface} } from "${service.interfacePath}";`
    ).join('\n');
    
    // Add test functions
    const testFunctions = services.map(service => `
/**
 * Test that ${service.name} can be resolved from the container
 */
export function test${service.name}Resolution(): boolean {
  try {
    console.log("🧪 Testing ${service.name} resolution...");
    
    // Resolve the service from the container
    const service = container.get<${service.interface}>(TYPES.${service.type});
    
    console.log("✅ ${service.name} resolved successfully");
    return true;
  } catch (error) {
    console.error("❌ Failed to resolve ${service.name}:", error);
    return false;
  }
}`).join('\n');
    
    // Add to test results
    const testResults = services.map(service => 
      `    ${service.name.toLowerCase()}: test${service.name}Resolution(),`
    ).join('\n');
    
    // Insert imports
    const importInsertPoint = content.lastIndexOf('import');
    const importEndPoint = content.indexOf('\n', importInsertPoint) + 1;
    content = content.slice(0, importEndPoint) + interfaceImports + '\n' + content.slice(importEndPoint);
    
    // Insert test functions before runServiceResolutionTests
    const runTestsIndex = content.indexOf('export function runServiceResolutionTests');
    content = content.slice(0, runTestsIndex) + testFunctions + '\n\n' + content.slice(runTestsIndex);
    
    // Update test results object
    const resultsRegex = /const results = \{([^}]+)\}/s;
    const match = content.match(resultsRegex);
    if (match) {
      const newResults = match[1] + '\n' + testResults;
      content = content.replace(resultsRegex, `const results = {${newResults}}`);
    }
    
    await fs.writeFile(testPath, content, 'utf-8');
    console.log(`✅ Updated test file for ${services.length} services`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to update test file:`, error.message);
    return false;
  }
}

/**
 * Main conversion function
 */
async function convertServices() {
  console.log('🚀 Starting automated InversifyJS service conversion...');
  
  const convertedServices = [];
  
  // Convert zero dependency services
  for (const service of ZERO_DEPENDENCY_SERVICES) {
    console.log(`\n🔄 Converting ${service.name}...`);
    
    const success = await addInjectableDecorator(service.path);
    if (success) {
      convertedServices.push(service);
    }
  }
  
  if (convertedServices.length > 0) {
    console.log(`\n📦 Updating container for ${convertedServices.length} converted services...`);
    await updateContainerBindings(convertedServices);
    
    console.log(`\n🧪 Updating test file...`);
    await updateTestFile(convertedServices);
  }
  
  console.log(`\n🎉 Conversion complete! Converted ${convertedServices.length}/${ZERO_DEPENDENCY_SERVICES.length} services`);
  console.log('📋 Converted services:', convertedServices.map(s => s.name).join(', '));
}

// Run the conversion
convertServices().catch(console.error);

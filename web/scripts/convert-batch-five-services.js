#!/usr/bin/env node

/**
 * InversifyJS Batch Five Services Conversion Script
 * 
 * Converts services that can now be converted because their dependencies
 * are available in the InversifyJS container.
 */

import fs from 'fs/promises';
import path from 'path';

// Batch Five: Services with dependencies that are now available
const BATCH_FIVE_SERVICES = [
  {
    name: 'ValidationService',
    path: 'src/lib/services/implementations/domain/ValidationService.ts',
    interface: 'IValidationService',
    interfacePath: '../interfaces/domain-interfaces',
    type: 'IValidationService',
    dependencies: [
      { name: 'pictographValidatorService', type: 'IPictographValidatorService', token: 'TYPES.IPictographValidatorService' }
    ]
  },
  {
    name: 'PositionMappingService',
    path: 'src/lib/services/implementations/positioning/PositionMappingService.ts',
    interface: 'IPositionMappingService',
    interfacePath: '../interfaces/positioning-interfaces',
    type: 'IPositionMappingService',
    dependencies: [] // Check if truly zero dependencies
  },
  {
    name: 'ArrowPositioningOrchestrator',
    path: 'src/lib/services/implementations/positioning/ArrowPositioningOrchestrator.ts',
    interface: 'IArrowPositioningOrchestrator',
    interfacePath: '../interfaces/positioning-interfaces',
    type: 'IArrowPositioningOrchestrator',
    dependencies: [] // Check dependencies
  },
  {
    name: 'PropRenderingService',
    path: 'src/lib/services/implementations/rendering/PropRenderingService.ts',
    interface: 'IPropRenderingService',
    interfacePath: '../interfaces/pictograph-interfaces',
    type: 'IPropRenderingService',
    dependencies: [
      { name: 'svgUtilityService', type: 'ISvgUtilityService', token: 'TYPES.ISvgUtilityService' }
    ]
  },
  {
    name: 'ImageExportService',
    path: 'src/lib/services/implementations/image-export/ImageExportService.ts',
    interface: 'IImageExportService',
    interfacePath: '../interfaces/image-export-interfaces',
    type: 'IImageExportService',
    dependencies: [
      { name: 'exportMemoryCalculator', type: 'IExportMemoryCalculator', token: 'TYPES.IExportMemoryCalculator' },
      { name: 'filenameGeneratorService', type: 'IFilenameGeneratorService', token: 'TYPES.IFilenameGeneratorService' }
    ]
  },
  {
    name: 'SequenceValidationService',
    path: 'src/lib/services/implementations/domain/SequenceValidationService.ts',
    interface: 'ISequenceValidationService',
    interfacePath: '../interfaces/sequence-interfaces',
    type: 'ISequenceValidationService',
    dependencies: [
      { name: 'pictographValidatorService', type: 'IPictographValidatorService', token: 'TYPES.IPictographValidatorService' }
    ]
  }
];

/**
 * Analyze service dependencies by examining constructor
 */
async function analyzeDependencies(service) {
  try {
    const content = await fs.readFile(service.path, 'utf-8');
    const constructorRegex = /constructor\s*\(\s*([^)]*)\s*\)/s;
    const match = content.match(constructorRegex);
    
    if (!match || !match[1].trim()) {
      console.log(`📋 ${service.name}: Zero dependencies (empty constructor)`);
      return { ...service, dependencies: [] };
    }
    
    const params = match[1].trim();
    const paramCount = params.split(',').filter(p => p.trim()).length;
    console.log(`📋 ${service.name}: ${paramCount} constructor parameters`);
    console.log(`   Parameters: ${params.replace(/\s+/g, ' ')}`);
    
    return service;
  } catch (error) {
    console.error(`❌ Failed to analyze ${service.path}:`, error.message);
    return service;
  }
}

/**
 * Convert service with @injectable and @inject decorators
 */
async function convertServiceWithDependencies(service) {
  try {
    const content = await fs.readFile(service.path, 'utf-8');
    
    // Check if already converted
    if (content.includes('@injectable()')) {
      console.log(`✅ ${service.path} already has @injectable() decorator`);
      return false;
    }
    
    let updatedContent = content;
    
    // Add inversify imports
    if (!content.includes('import { injectable')) {
      const importRegex = /^import.*from.*['"];$/m;
      const match = content.match(importRegex);
      if (match) {
        const insertIndex = content.indexOf(match[0]) + match[0].length;
        const imports = service.dependencies.length > 0 
          ? '\nimport { injectable, inject } from "inversify";'
          : '\nimport { injectable } from "inversify";';
        updatedContent = content.slice(0, insertIndex) + imports + content.slice(insertIndex);
      }
    }
    
    // Add TYPES import if service has dependencies
    if (service.dependencies.length > 0) {
      const typesImport = '\nimport { TYPES } from "../../inversify/types";';
      const importRegex = /^import.*from.*['"];$/m;
      const matches = [...updatedContent.matchAll(new RegExp(importRegex, 'gm'))];
      if (matches.length > 0) {
        const lastMatch = matches[matches.length - 1];
        const insertIndex = updatedContent.indexOf(lastMatch[0]) + lastMatch[0].length;
        updatedContent = updatedContent.slice(0, insertIndex) + typesImport + updatedContent.slice(insertIndex);
      }
    }
    
    // Add @injectable() decorator before class declaration
    const classRegex = /^export class (\w+)/m;
    updatedContent = updatedContent.replace(classRegex, '@injectable()\nexport class $1');
    
    // Add @inject() decorators to constructor parameters
    if (service.dependencies.length > 0) {
      const constructorRegex = /constructor\s*\(\s*([^)]+)\s*\)/s;
      const constructorMatch = updatedContent.match(constructorRegex);
      
      if (constructorMatch) {
        let params = constructorMatch[1];
        
        service.dependencies.forEach(dep => {
          const paramRegex = new RegExp(`(private\\s+${dep.name}\\s*:\\s*${dep.type})`, 'g');
          params = params.replace(paramRegex, `@inject(${dep.token}) $1`);
        });
        
        updatedContent = updatedContent.replace(constructorRegex, `constructor(\n    ${params}\n  )`);
      }
    }
    
    await fs.writeFile(service.path, updatedContent, 'utf-8');
    console.log(`✅ Converted ${service.name} with ${service.dependencies.length} dependencies`);
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
  const containerPath = 'src/lib/services/inversify/container.ts';
  
  try {
    let content = await fs.readFile(containerPath, 'utf-8');
    
    // Add implementation imports  
    const implementationImports = services.map(service =>
      `import { ${service.name} } from "../implementations/${service.path.replace('src/lib/services/implementations/', '')}";`
    ).join('\n');
    
    // Add interface imports
    const interfaceImports = services.map(service => 
      `import type { ${service.interface} } from "${service.interfacePath}";`
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
    
    // Insert bindings before the return statement
    const returnIndex = content.lastIndexOf('return container;');
    const bindingInsertPoint = content.lastIndexOf('\n', returnIndex);
    
    content = content.slice(0, bindingInsertPoint) + 
      '\n' + bindings + '\n' + 
      content.slice(bindingInsertPoint);
    
    await fs.writeFile(containerPath, content, 'utf-8');
    console.log(`✅ Updated container bindings for ${services.length} services`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to update container bindings:`, error.message);
    return false;
  }
}

/**
 * Main conversion function
 */
async function convertBatchFiveServices() {
  console.log('🚀 Starting Batch Five services conversion...');
  
  // Analyze dependencies first
  console.log('\n📊 Analyzing service dependencies...');
  const analyzedServices = [];
  for (const service of BATCH_FIVE_SERVICES) {
    const analyzed = await analyzeDependencies(service);
    analyzedServices.push(analyzed);
  }
  
  // Convert services
  console.log('\n🔄 Converting services...');
  const convertedServices = [];
  for (const service of analyzedServices) {
    const success = await convertServiceWithDependencies(service);
    if (success) {
      convertedServices.push(service);
    }
  }
  
  if (convertedServices.length > 0) {
    console.log(`\n📦 Updating container for ${convertedServices.length} converted services...`);
    await updateContainerBindings(convertedServices);
  }
  
  console.log(`\n🎉 Conversion complete! Converted ${convertedServices.length}/${BATCH_FIVE_SERVICES.length} services`);
  console.log('📋 Converted services:', convertedServices.map(s => s.name).join(', '));
}

// Run the conversion
convertBatchFiveServices().catch(console.error);

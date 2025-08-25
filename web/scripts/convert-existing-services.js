#!/usr/bin/env node

/**
 * InversifyJS Existing Services Conversion Script
 * 
 * Converts services that actually exist and are ready for conversion
 */

import fs from 'fs/promises';
import path from 'path';

// Services that actually exist and are ready for conversion
const EXISTING_SERVICES = [
  {
    name: 'DimensionCalculationService',
    path: 'src/lib/services/implementations/image-export/DimensionCalculationService.ts',
    interface: 'IDimensionCalculationService',
    interfacePath: '../interfaces/image-export-interfaces',
    type: 'IDimensionCalculationService',
    dependencies: [] // Zero dependencies
  },
  {
    name: 'LayoutCalculationService',
    path: 'src/lib/services/implementations/image-export/LayoutCalculationService.ts',
    interface: 'ILayoutCalculationService',
    interfacePath: '../interfaces/image-export-interfaces',
    type: 'ILayoutCalculationService',
    dependencies: [] // Check dependencies
  },
  {
    name: 'ArrowPositioningService',
    path: 'src/lib/services/implementations/positioning/ArrowPositioningService.ts',
    interface: 'IArrowPositioningService',
    interfacePath: '../interfaces/positioning-interfaces',
    type: 'IArrowPositioningService',
    dependencies: [] // Check dependencies
  },
  {
    name: 'StartPositionService',
    path: 'src/lib/services/implementations/domain/StartPositionService.ts',
    interface: 'IStartPositionService',
    interfacePath: '../interfaces/application-interfaces',
    type: 'IStartPositionService',
    dependencies: [] // Check dependencies
  },
  {
    name: 'BetaOffsetCalculator',
    path: 'src/lib/services/implementations/positioning/BetaOffsetCalculator.ts',
    interface: 'IBetaOffsetCalculator',
    interfacePath: '../interfaces/positioning-interfaces',
    type: 'IBetaOffsetCalculator',
    dependencies: [] // Check dependencies
  },
  {
    name: 'OrientationCalculationService',
    path: 'src/lib/services/implementations/positioning/OrientationCalculationService.ts',
    interface: 'IOrientationCalculationService',
    interfacePath: '../interfaces/positioning-interfaces',
    type: 'IOrientationCalculationService',
    dependencies: [] // Check dependencies
  }
];

/**
 * Analyze service dependencies by examining constructor
 */
async function analyzeDependencies(service) {
  try {
    const content = await fs.readFile(service.path, 'utf-8');
    
    // Check if already converted
    if (content.includes('@injectable()')) {
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
    const paramCount = params.split(',').filter(p => p.trim()).length;
    console.log(`📋 ${service.name}: ${paramCount} constructor parameters`);
    console.log(`   Parameters: ${params.replace(/\s+/g, ' ')}`);
    
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
    const content = await fs.readFile(service.path, 'utf-8');
    
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
    
    // Add @inject() decorators to constructor parameters if needed
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
 * Add missing types to types.ts
 */
async function addMissingTypes(services) {
  const typesPath = 'src/lib/services/inversify/types.ts';
  
  try {
    let content = await fs.readFile(typesPath, 'utf-8');
    
    const missingTypes = [];
    
    for (const service of services) {
      if (!content.includes(`${service.type}:`)) {
        missingTypes.push(`  ${service.type}: Symbol.for("${service.type}"),`);
      }
    }
    
    if (missingTypes.length > 0) {
      // Add missing types before the closing brace
      const insertPoint = content.lastIndexOf('};');
      content = content.slice(0, insertPoint) + 
        missingTypes.join('\n') + '\n' +
        content.slice(insertPoint);
      
      await fs.writeFile(typesPath, content, 'utf-8');
      console.log(`✅ Added ${missingTypes.length} missing types`);
    }
  } catch (error) {
    console.error(`❌ Failed to add missing types:`, error.message);
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
async function convertExistingServices() {
  console.log('🚀 Starting existing services conversion...');
  
  // Analyze dependencies first
  console.log('\n📊 Analyzing service dependencies...');
  const analyzedServices = [];
  for (const service of EXISTING_SERVICES) {
    const analyzed = await analyzeDependencies(service);
    if (analyzed) {
      analyzedServices.push(analyzed);
    }
  }
  
  if (analyzedServices.length === 0) {
    console.log('🎉 All services are already converted!');
    return;
  }
  
  // Add missing types first
  console.log('\n🔧 Adding missing types...');
  await addMissingTypes(analyzedServices);
  
  // Convert services
  console.log('\n🔄 Converting services...');
  const convertedServices = [];
  for (const service of analyzedServices) {
    const success = await convertService(service);
    if (success) {
      convertedServices.push(service);
    }
  }
  
  if (convertedServices.length > 0) {
    console.log(`\n📦 Updating container for ${convertedServices.length} converted services...`);
    await updateContainerBindings(convertedServices);
  }
  
  console.log(`\n🎉 Conversion complete! Converted ${convertedServices.length}/${EXISTING_SERVICES.length} services`);
  console.log('📋 Converted services:', convertedServices.map(s => s.name).join(', '));
}

// Run the conversion
convertExistingServices().catch(console.error);

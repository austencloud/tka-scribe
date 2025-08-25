/**
 * InversifyJS Application Bootstrap
 *
 * This file handles the initialization of the InversifyJS container
 * and replaces the complex bootstrap.ts from the old DI system.
 */

import "reflect-metadata";
import {
  container,
  getContainerDebugInfo,
  validateContainer,
} from "./container";
import { runServiceResolutionTests } from "./test-service-resolution";

/**
 * Initialize the InversifyJS container and all services
 * This replaces the createWebApplication() function from the old bootstrap
 */
export async function initializeInversifyContainer(): Promise<void> {
  console.log("🚀 Initializing InversifyJS container...");

  try {
    // TODO: Load service modules here as they are converted
    // Example:
    // await loadCoreServices();
    // await loadRenderingServices();
    // await loadPositioningServices();

    // Validate container configuration
    const validation = validateContainer();

    if (!validation.isValid) {
      console.warn("⚠️ Container validation warnings:");
      console.warn(
        `Missing services: ${validation.missingServices.join(", ")}`
      );
    }

    // Log container status
    const debugInfo = getContainerDebugInfo();
    console.log(
      `✅ InversifyJS container initialized with ${debugInfo.serviceCount} services`
    );
    console.log(`📋 Bound services: ${debugInfo.boundServices.join(", ")}`);

    // Run service resolution tests
    runServiceResolutionTests();
  } catch (error) {
    console.error("❌ Failed to initialize InversifyJS container:", error);
    throw error;
  }
}

/**
 * Load core services module
 * TODO: Implement as services are converted
 */
async function loadCoreServices(): Promise<void> {
  console.log("🔧 Loading core services...");

  // TODO: Import and bind core services
  // Example:
  // const { SequenceService } = await import("../implementations/sequence/SequenceService");
  // container.bind<ISequenceService>(TYPES.ISequenceService).to(SequenceService);

  console.log("✅ Core services loaded");
}

/**
 * Load rendering services module
 * TODO: Implement as services are converted
 */
async function loadRenderingServices(): Promise<void> {
  console.log("🔧 Loading rendering services...");

  // TODO: Import and bind rendering services
  // Example:
  // const { PictographRenderingService } = await import("../implementations/rendering/PictographRenderingService");
  // container.bind<IPictographRenderingService>(TYPES.IPictographRenderingService).to(PictographRenderingService);

  console.log("✅ Rendering services loaded");
}

/**
 * Load positioning services module
 * TODO: Implement as services are converted
 */
async function loadPositioningServices(): Promise<void> {
  console.log("🔧 Loading positioning services...");

  // TODO: Import and bind positioning services

  console.log("✅ Positioning services loaded");
}

/**
 * Load movement services module
 * TODO: Implement as services are converted
 */
async function loadMovementServices(): Promise<void> {
  console.log("🔧 Loading movement services...");

  // TODO: Import and bind movement services

  console.log("✅ Movement services loaded");
}

/**
 * Load browse services module
 * TODO: Implement as services are converted
 */
async function loadBrowseServices(): Promise<void> {
  console.log("🔧 Loading browse services...");

  // TODO: Import and bind browse services

  console.log("✅ Browse services loaded");
}

/**
 * Load export services module
 * TODO: Implement as services are converted
 */
async function loadExportServices(): Promise<void> {
  console.log("🔧 Loading export services...");

  // TODO: Import and bind export services

  console.log("✅ Export services loaded");
}

/**
 * Get the initialized container
 * This provides backward compatibility with the old bootstrap pattern
 */
export function getContainer() {
  return container;
}

/**
 * Legacy resolve function for backward compatibility
 * This allows existing code to work during the migration
 */
export function resolve<T>(serviceType: symbol): T {
  return container.get<T>(serviceType);
}

// Export container and types for convenience
export { container } from "./container";
export { TYPES } from "./types";

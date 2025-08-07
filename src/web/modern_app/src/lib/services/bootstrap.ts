/**
 * Application Bootstrap - TKA V2 Modern
 * 
 * This module creates and configures the application's dependency injection container,
 * registering all services and their dependencies following the clean architecture
 * pattern established in the desktop application.
 */

import { ServiceContainer } from '@tka/shared/di/core/ServiceContainer';
import type { ServiceInterface } from '@tka/shared/di/core/types';

// Import service interfaces
import {
	ISequenceService,
	ISequenceDomainService,
	IPictographService,
	IPictographRenderingService,
	IArrowPositioningService,
	IArrowPlacementDataService,
	IArrowPlacementKeyService,
	IPropRenderingService,
	IPersistenceService,
	ISequenceGenerationService,
	IMotionGenerationService,
	IApplicationInitializationService,
	ISettingsService,
	IExportService,
} from './interfaces';

// Import service implementations
import { SequenceService } from './implementations/SequenceService';
import { SequenceDomainService } from './implementations/SequenceDomainService';
import { PictographService } from './implementations/PictographService';
import { PictographRenderingService } from './implementations/PictographRenderingService';
import { ArrowPositioningService } from './implementations/ArrowPositioningService';
import { ArrowPlacementDataService } from './implementations/ArrowPlacementDataService';
import { ArrowPlacementKeyService } from './implementations/ArrowPlacementKeyService';
import { PropRenderingService } from './implementations/PropRenderingService';
import { LocalStoragePersistenceService } from './implementations/LocalStoragePersistenceService';
import { SequenceGenerationService } from './implementations/SequenceGenerationService';
import { MotionGenerationService } from './implementations/MotionGenerationService';
import { ApplicationInitializationService } from './implementations/ApplicationInitializationService';
import { SettingsService } from './implementations/SettingsService';
import { ExportService } from './implementations/ExportService';

/**
 * Create and configure the web application DI container
 */
export async function createWebApplication(): Promise<ServiceContainer> {
	const container = new ServiceContainer('tka-web-v2');

	try {
		// Register domain services (no dependencies)
		container.registerSingleton(ISequenceDomainService, SequenceDomainService);

		// Register infrastructure services
		container.registerSingleton(IPersistenceService, LocalStoragePersistenceService);
		container.registerSingleton(ISettingsService, SettingsService);

		// Register placement services (no dependencies)
		container.registerSingleton(IArrowPlacementDataService, ArrowPlacementDataService);
		container.registerSingleton(IArrowPlacementKeyService, ArrowPlacementKeyService);

		// Register rendering services
		container.registerSingleton(IPropRenderingService, PropRenderingService);
		container.registerSingleton(IPictographRenderingService, PictographRenderingService);
		container.registerSingleton(IArrowPositioningService, ArrowPositioningService);
		container.registerSingleton(IPictographService, PictographService);

		// Register application services (with dependencies)
		container.registerSingleton(ISequenceService, SequenceService);
		container.registerSingleton(IExportService, ExportService);

		// Register generation services
		container.registerSingleton(IMotionGenerationService, MotionGenerationService);
		container.registerSingleton(ISequenceGenerationService, SequenceGenerationService);

		// Register application initialization service
		container.registerSingleton(IApplicationInitializationService, ApplicationInitializationService);

		// Validate all registrations can be resolved
		await validateContainerConfiguration(container);

		console.log('✅ TKA V2 Modern application container initialized successfully');
		return container;
	} catch (error) {
		console.error('❌ Failed to initialize application container:', error);
		throw new Error(`Application initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Validate that all registered services can be resolved
 */
async function validateContainerConfiguration(container: ServiceContainer): Promise<void> {
	const servicesToValidate = [
		ISequenceService,
		ISequenceDomainService,
		IPictographService,
		IPictographRenderingService,
		IArrowPositioningService,
		IArrowPlacementDataService,
		IArrowPlacementKeyService,
		IPropRenderingService,
		IPersistenceService,
		ISettingsService,
		IApplicationInitializationService,
	];

	for (const serviceInterface of servicesToValidate) {
		try {
			const service = container.resolve(serviceInterface);
			if (!service) {
				throw new Error(`Service ${serviceInterface.name} resolved to null/undefined`);
			}
		} catch (error) {
			throw new Error(`Failed to resolve ${serviceInterface.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}
}

/**
 * Global container instance for use throughout the application
 */
let globalContainer: ServiceContainer | null = null;

/**
 * Get the global container instance
 */
export function getContainer(): ServiceContainer {
	if (!globalContainer) {
		throw new Error('Application container not initialized. Call createWebApplication() first.');
	}
	return globalContainer;
}

/**
 * Set the global container instance (used by bootstrap)
 */
export function setGlobalContainer(container: ServiceContainer): void {
	globalContainer = container;
}

/**
 * Helper function to resolve services from the global container
 */
export function resolve<T>(serviceInterface: ServiceInterface<T>): T {
	return getContainer().resolve(serviceInterface);
}

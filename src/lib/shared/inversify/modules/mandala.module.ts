import type { ContainerModuleLoadOptions } from 'inversify';
import { ContainerModule } from 'inversify';

import { MandalaTypes } from '../types/mandala.types';
import { MandalaTransformer } from '$lib/features/mandala-generator/services/implementations/MandalaTransformer';
import type { IMandalaTransformer } from '$lib/features/mandala-generator/services/contracts/IMandalaTransformer';

/**
 * Inversify module for the Mandala Generator feature.
 * Registers all mandala-related services.
 */
export const mandalaModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
	// Core transformation service
	options
		.bind<IMandalaTransformer>(MandalaTypes.IMandalaTransformer)
		.to(MandalaTransformer)
		.inSingletonScope();

	// Additional services will be registered here as implemented:
	// - IMandalaGenerator
	// - IMandalaRandomizer
	// - IMandalaExporter
	// - IMandalaRepository
	// - IMandalaAssetLoader
});

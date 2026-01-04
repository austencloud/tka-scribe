/**
 * Dependency injection symbols for the Mandala Generator feature.
 */
export const MandalaTypes = {
	/** Core symmetry transformation service */
	IMandalaTransformer: Symbol.for('IMandalaTransformer'),

	/** Mandala generation orchestrator */
	IMandalaGenerator: Symbol.for('IMandalaGenerator'),

	/** Random mandala generation */
	IMandalaRandomizer: Symbol.for('IMandalaRandomizer'),

	/** Export to PNG/SVG */
	IMandalaExporter: Symbol.for('IMandalaExporter'),

	/** Firebase persistence */
	IMandalaRepository: Symbol.for('IMandalaRepository'),

	/** Arrow SVG asset loading for mandala */
	IMandalaAssetLoader: Symbol.for('IMandalaAssetLoader')
} as const;

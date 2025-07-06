import { SERVICE_TOKENS } from '$lib/core/di/ServiceTokens';
import { Injectable } from '$lib/core/di/ServiceDecorator';
import type { BackgroundService } from '$lib/core/services/BackgroundService';
import type { BackgroundSystemFactory } from '$lib/core/services/BackgroundSystem';
import { ErrorSeverity, type ErrorHandler } from '$lib/core/services/ErrorHandling';
import type {
	BackgroundSystem,
	BackgroundType,
	QualityLevel,
	Dimensions
} from '$lib/components/Backgrounds/types/types';
import { getContainer } from '$lib/core/di/ContainerProvider';

@Injectable(SERVICE_TOKENS.BACKGROUND_SERVICE)
export class BackgroundServiceImpl implements BackgroundService {
	private currentBackground: BackgroundType = 'snowfall';
	private backgroundSystem: BackgroundSystem | null = null;
	private quality: QualityLevel = 'medium';
	private availableBackgrounds: BackgroundType[] = ['snowfall', 'nightSky'];
	private dimensions: Dimensions = { width: 1280, height: 720 };

	private errorHandler: ErrorHandler;
	private backgroundFactory: BackgroundSystemFactory;

	constructor() {
		const container = getContainer();
		this.errorHandler = container.get<ErrorHandler>(SERVICE_TOKENS.ERROR_HANDLER);
		this.backgroundFactory = container.get<BackgroundSystemFactory>(
			SERVICE_TOKENS.BACKGROUND_FACTORY
		);
	}

	async loadBackground(type: BackgroundType): Promise<BackgroundSystem> {
		try {
			if (this.backgroundSystem) {
				this.backgroundSystem.cleanup();
			}

			this.currentBackground = type;
			this.backgroundSystem = this.backgroundFactory.createBackgroundSystem({
				type,
				initialQuality: this.quality
			});

			this.backgroundSystem.initialize(this.dimensions, this.quality);
			return this.backgroundSystem;
		} catch (error) {
			this.errorHandler.log({
				source: 'BackgroundService',
				message: `Failed to load background: ${type}`,
				severity: ErrorSeverity.ERROR,
				context: { error }
			});
			throw error;
		}
	}

	setQuality(quality: QualityLevel): void {
		this.quality = quality;
		if (this.backgroundSystem) {
			this.backgroundSystem.setQuality(quality);
		}
	}

	getAvailableBackgrounds(): BackgroundType[] {
		return this.availableBackgrounds.filter((type) =>
			this.backgroundFactory.isBackgroundSupported(type)
		);
	}

	updateDimensions(dimensions: Dimensions): void {
		const oldDimensions = this.dimensions;
		this.dimensions = dimensions;

		if (this.backgroundSystem && this.backgroundSystem.handleResize) {
			this.backgroundSystem.handleResize(oldDimensions, dimensions);
		}
	}

	getCurrentBackground(): BackgroundType {
		return this.currentBackground;
	}
}

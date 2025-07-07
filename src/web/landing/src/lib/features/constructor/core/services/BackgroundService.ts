import type {
	BackgroundSystem,
	BackgroundType,
	QualityLevel,
	AccessibilitySettings,
	Dimensions
} from '../components/Backgrounds/types/types.js';

export interface BackgroundService {
	loadBackground(type: BackgroundType): Promise<BackgroundSystem>;
	setQuality(quality: QualityLevel): void;
	getAvailableBackgrounds(): BackgroundType[];
	updateDimensions(dimensions: Dimensions): void;
	getCurrentBackground(): BackgroundType;
}

/**
 * Start Position Service - Implementation
 *
 * Provides start position management functionality for the construct workflow.
 * Based on the desktop StartPositionOrchestrator but simplified for web.
 */

import type { PictographData } from '$lib/types/PictographData';
import sequenceDataService from './SequenceDataService';

export interface BeatData {
	beat: number;
	pictograph_data: PictographData;
}

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
}

export type GridMode = 'diamond' | 'box';

export interface IStartPositionService {
	getAvailableStartPositions(propType: string, gridMode: GridMode): Promise<BeatData[]>;
	setStartPosition(startPosition: BeatData): Promise<void>;
	addStartPosition(pictographData: PictographData): Promise<void>;
	validateStartPosition(position: BeatData): ValidationResult;
	getDefaultStartPositions(gridMode: GridMode): Promise<PictographData[]>;
}

export class StartPositionService implements IStartPositionService {
	private readonly DEFAULT_START_POSITIONS = {
		diamond: ['alpha1_alpha1', 'beta5_beta5', 'gamma11_gamma11'],
		box: ['alpha2_alpha2', 'beta4_beta4', 'gamma12_gamma12']
	};

	constructor() {
		console.log('🎯 StartPositionService initialized');
	}

	async getAvailableStartPositions(propType: string, gridMode: GridMode): Promise<BeatData[]> {
		console.log(`📍 Getting available start positions for ${propType} in ${gridMode} mode`);

		try {
			const startPositionKeys = this.DEFAULT_START_POSITIONS[gridMode];

			const beatData: BeatData[] = startPositionKeys.map((key, index) => {
				const [startPos, endPos] = key.split('_');

				return {
					beat: 0,
					pictograph_data: this.createStartPositionPictograph(key, index, gridMode)
				};
			});

			console.log(`✅ Generated ${beatData.length} start positions`);
			return beatData;

		} catch (error) {
			console.error('❌ Error getting start positions:', error);
			return [];
		}
	}

	async setStartPosition(startPosition: BeatData): Promise<void> {
		console.log('🎯 Setting start position:', startPosition.pictograph_data?.letter);

		try {
			// Store in localStorage for persistence (similar to legacy implementation)
			if (typeof window !== 'undefined') {
				// Create a serializable version without circular references
				const serializableData = this.createSerializableStartPosition(startPosition);
				localStorage.setItem('start_position', JSON.stringify(serializableData));
			}

			console.log('✅ Start position set successfully');

		} catch (error) {
			console.error('❌ Error setting start position:', error);
			throw new Error(`Failed to set start position: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	async addStartPosition(pictographData: PictographData): Promise<void> {
		console.log('🎯 Adding start position:', pictographData?.letter);

		try {
			// Convert PictographData to BeatData format
			const beatData: BeatData = {
				beat: 0,
				pictograph_data: pictographData
			};

			// Use the existing setStartPosition method
			await this.setStartPosition(beatData);

			// Initialize sequence with the start position
			await this.initializeSequenceWithStartPosition(pictographData);

			console.log('✅ Start position added and sequence initialized successfully');

		} catch (error) {
			console.error('❌ Error adding start position:', error);
			throw new Error(`Failed to add start position: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	validateStartPosition(position: BeatData): ValidationResult {
		const errors: string[] = [];

		if (!position.pictograph_data) {
			errors.push('Start position must have pictograph data');
		}

		if (!position.pictograph_data?.redMotionData && !position.pictograph_data?.blueMotionData) {
			errors.push('Start position must have at least one motion');
		}

		// Validate motion types are static for start positions
		if (position.pictograph_data?.blueMotionData?.motionType !== 'static') {
			errors.push('Blue motion must be static for start positions');
		}

		if (position.pictograph_data?.redMotionData?.motionType !== 'static') {
			errors.push('Red motion must be static for start positions');
		}

		return {
			isValid: errors.length === 0,
			errors
		};
	}

	/**
	 * Create a serializable version of start position data without circular references
	 */
	private createSerializableStartPosition(startPosition: BeatData): any {
		if (!startPosition.pictograph_data) {
			return startPosition;
		}

		const pictographData = startPosition.pictograph_data;

		// Create a clean copy with only essential data, avoiding circular references
		const serializableData = {
			beat: startPosition.beat,
			pictograph_data: {
				letter: pictographData.letter,
				startPos: pictographData.startPos,
				endPos: pictographData.endPos,
				isStartPosition: pictographData.isStartPosition,
				// Extract only essential motion data without circular references
				redMotionData: this.extractMotionData(pictographData.redMotionData),
				blueMotionData: this.extractMotionData(pictographData.blueMotionData)
			}
		};

		return serializableData;
	}

	/**
	 * Extract essential motion data without circular references
	 */
	private extractMotionData(motionData: any): any {
		if (!motionData) return null;

		return {
			motionType: motionData.motionType,
			startOrientation: motionData.startOrientation,
			endOrientation: motionData.endOrientation,
			turns: motionData.turns,
			color: motionData.color
		};
	}

	async getDefaultStartPositions(gridMode: GridMode): Promise<PictographData[]> {
		console.log(`📍 Getting default start positions for ${gridMode} mode`);

		try {
			const startPositionKeys = this.DEFAULT_START_POSITIONS[gridMode];

			const pictographData: PictographData[] = startPositionKeys.map((key, index) =>
				this.createStartPositionPictograph(key, index, gridMode)
			);

			console.log(`✅ Generated ${pictographData.length} default start positions`);
			return pictographData;

		} catch (error) {
			console.error('❌ Error getting default start positions:', error);
			return [];
		}
	}

	private createStartPositionPictograph(key: string, index: number, gridMode: GridMode): PictographData {
		const [startPos, endPos] = key.split('_');

		// Determine letter based on position key
		let letter: string;
		if (key.includes('alpha')) letter = 'α';
		else if (key.includes('beta')) letter = 'β';
		else if (key.includes('gamma')) letter = 'γ';
		else letter = key;

		// Create base locations for the positions
		const locations = ['n', 's', 'e', 'w', 'ne', 'se', 'sw', 'nw'];
		const blueLocation = locations[index % locations.length];
		const redLocation = locations[(index + 4) % locations.length]; // Offset for variety

		return {
			letter,
			startPos: startPos as any,
			endPos: endPos as any,
			timing: null,
			direction: null,
			gridMode: gridMode,
			gridData: null,
			blueMotionData: {
				id: crypto.randomUUID(),
				color: 'blue',
				motionType: 'static',
				startLoc: blueLocation as any,
				endLoc: blueLocation as any,
				startOri: 'in',
				endOri: 'in',
				turns: 0,
				propRotDir: 'no_rot'
			},
			redMotionData: {
				id: crypto.randomUUID(),
				color: 'red',
				motionType: 'static',
				startLoc: redLocation as any,
				endLoc: redLocation as any,
				startOri: 'out',
				endOri: 'out',
				turns: 0,
				propRotDir: 'no_rot'
			},
			redPropData: null,
			bluePropData: null,
			redArrowData: null,
			blueArrowData: null,
			grid: gridMode
		};
	}

	/**
	 * Initialize sequence with start position as beat 0
	 */
	private async initializeSequenceWithStartPosition(pictographData: PictographData): Promise<void> {
		try {
			// Create a new sequence
			const sequence = sequenceDataService.createNewSequence('New Sequence');

			// Manually create the start position beat with number 0
			const startBeat = {
				id: `beat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				number: 0, // Start position should be beat 0
				pictographData,
				metadata: {
					letter: pictographData.letter || undefined,
					startPos: pictographData.startPos?.toString() || undefined,
					endPos: pictographData.endPos?.toString() || undefined,
					timing: pictographData.timing || undefined,
					direction: pictographData.direction || undefined
				}
			};

			// Add the beat directly to the sequence
			sequence.beats.push(startBeat);
			sequence.lastModified = new Date();

			// Set this as the current sequence
			sequenceDataService.setCurrentSequence(sequence);
			console.log('✅ Sequence initialized with start position as beat 0');

		} catch (error) {
			console.error('❌ Error initializing sequence:', error);
			throw error;
		}
	}
}

// Export singleton instance
const startPositionService = new StartPositionService();
export default startPositionService;

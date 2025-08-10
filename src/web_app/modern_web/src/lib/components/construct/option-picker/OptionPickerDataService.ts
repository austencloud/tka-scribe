/**
 * OptionPickerDataService - Minimal data loading
 *
 * Just the data loading functions that are actually used in OptionPicker.svelte
 */

import type { PictographData } from '$lib/domain/PictographData';
import { CsvDataService } from '$services/implementations/CsvDataService';
import { OptionDataService } from '$services/implementations/OptionDataService';

export interface DataLoadResult {
	success: boolean;
	options: PictographData[];
	error?: string;
}

export interface StartPositionData {
	endPos?: string;
	pictograph_data?: {
		motions?: {
			blue?: { endLocation?: string };
			red?: { endLocation?: string };
		};
	};
}

export class OptionPickerDataService {
	private _optionDataService: OptionDataService | null = null;
	private _csvDataService: CsvDataService | null = null;
	private _isInitialized: boolean = false;

	// Initialize services (from current OptionPicker.svelte)
	async initialize(): Promise<void> {
		if (this._isInitialized) {
			return;
		}

		try {
			console.log('🔧 Initializing OptionPickerDataService...');

			this._optionDataService = new OptionDataService();
			this._csvDataService = new CsvDataService();

			await this._optionDataService.initialize();

			this._isInitialized = true;
			console.log('✅ OptionPickerDataService initialized successfully');
		} catch (error) {
			console.error('❌ Error initializing OptionPickerDataService:', error);
			throw error;
		}
	}

	// Load options from start position (from current OptionPicker.svelte)
	async loadOptionsFromStartPosition(): Promise<DataLoadResult> {
		try {
			if (!this._isInitialized) {
				await this.initialize();
			}

			if (!this._optionDataService) {
				return {
					success: false,
					options: [],
					error: 'Option data service not available',
				};
			}

			console.log('🎯 Loading options from start position...');

			// Get start position from localStorage (like current implementation)
			const startPositionData = localStorage.getItem('start_position');
			if (!startPositionData) {
				return {
					success: false,
					options: [],
					error: 'No start position found in localStorage',
				};
			}

			const startPosition = JSON.parse(startPositionData) as StartPositionData;
			console.log('📍 Found start position in localStorage:', startPosition);

			// Extract end position (like current implementation)
			let endPosition: string | null = null;

			if (startPosition.endPos) {
				endPosition = startPosition.endPos;
			} else if (startPosition.pictograph_data?.motions?.blue?.endLocation) {
				endPosition = startPosition.pictograph_data.motions.blue.endLocation;
			} else if (startPosition.pictograph_data?.motions?.red?.endLocation) {
				endPosition = startPosition.pictograph_data.motions.red.endLocation;
			}

			if (!endPosition) {
				return {
					success: false,
					options: [],
					error: 'Could not extract end position from start position data',
				};
			}

			console.log(`🎯 Loading options for end position: ${endPosition}`);

			// Load options (like current implementation)
			const gridMode = 'diamond';
			const nextOptions = await this._optionDataService.getNextOptionsFromEndPosition(
				endPosition,
				gridMode,
				{} // No filtering - show all options like current app
			);

			console.log(`✅ Loaded ${nextOptions.length} real options from CSV data`);

			return {
				success: true,
				options: nextOptions,
			};
		} catch (error) {
			console.error('❌ Error loading options from start position:', error);
			return {
				success: false,
				options: [],
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	isInitialized(): boolean {
		return this._isInitialized;
	}

	cleanup(): void {
		this._isInitialized = false;
		this._optionDataService = null;
		this._csvDataService = null;
	}
}

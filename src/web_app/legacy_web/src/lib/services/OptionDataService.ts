import type { PictographData } from '$lib/types/PictographData';
import type { Letter } from '$lib/types/Letter';
import type { TKAPosition } from '$lib/types/TKAPosition';
import type { VTGTiming, VTGDir, GridMode } from '$lib/types/Types';

/**
 * Service for loading and managing option data from CSV files
 * This implements the same logic as the legacy desktop OptionGetter
 */
class OptionDataService {
	private csvData: { diamondData: string; boxData: string } | null = null;
	private parsedData: { diamond: any[]; box: any[] } | null = null;

	/**
	 * Initialize the service with CSV data
	 */
	initialize(csvData: { diamondData: string; boxData: string }) {
		this.csvData = csvData;
		this.parsedData = {
			diamond: this.parseCSV(csvData.diamondData),
			box: this.parseCSV(csvData.boxData)
		};
		console.log('✅ OptionDataService initialized with CSV data');
		console.log(`📊 Loaded ${this.parsedData.diamond.length} diamond options, ${this.parsedData.box.length} box options`);
	}

	/**
	 * Get available options based on the end position of the current sequence
	 * This implements the core logic from legacy desktop OptionGetter._load_all_next_option_dicts
	 */
	getNextOptions(endPosition: string, gridMode: string = 'diamond'): PictographData[] {
		if (!this.parsedData) {
			console.warn('⚠️ CSV data not initialized');
			return [];
		}

		try {
			// Get the appropriate dataset based on grid mode
			const dataset = gridMode === 'diamond' ? this.parsedData.diamond : this.parsedData.box;

			// Filter options where startPos matches the endPosition (positional continuity)
			const matchingOptions = dataset.filter(row => row.startPos === endPosition);

			// Convert to PictographData format and filter out null values
			const options = matchingOptions
				.map(row => this.convertRowToPictographData(row))
				.filter((option): option is PictographData => option !== null);

			console.log(`✅ Found ${options.length} options for end position: ${endPosition} in ${gridMode} mode`);
			return options;
		} catch (error) {
			console.error('❌ Error loading options:', error);
			return [];
		}
	}

	/**
	 * Parse CSV text into array of objects
	 */
	private parseCSV(csvText: string): any[] {
		const lines = csvText.trim().split('\n');
		if (lines.length < 2) return [];

		// Parse header
		const headers = lines[0].split(',').map(h => h.trim());
		const data: any[] = [];

		// Parse each data row
		for (let i = 1; i < lines.length; i++) {
			const values = lines[i].split(',').map(v => v.trim());
			const row: Record<string, string> = {};

			// Create row object
			headers.forEach((header, index) => {
				row[header] = values[index] || '';
			});

			data.push(row);
		}

		return data;
	}

	/**
	 * Convert CSV row to PictographData format
	 * This matches the data structure expected by the pictograph renderer
	 */
	private convertRowToPictographData(row: Record<string, string>): PictographData | null {
		try {
			// Create proper motion data with calculated arrow locations
			const redMotionData = this.createMotionData(row, 'red');
			const blueMotionData = this.createMotionData(row, 'blue');
			return {
				letter: (row.letter as Letter) || null,
				startPos: (row.startPos as TKAPosition) || null,
				endPos: (row.endPos as TKAPosition) || null,
				timing: (row.timing as VTGTiming) || null,
				direction: (row.direction as VTGDir) || null,
				gridMode: 'diamond' as GridMode,
				gridData: {
					allHandPointsStrict: {},
					allHandPointsNormal: {},
					allLayer2PointsStrict: {},
					allLayer2PointsNormal: {},
					allOuterPoints: {},
					centerPoint: { coordinates: { x: 0, y: 0 } }
				},
				redMotionData,
				blueMotionData,
				redPropData: null,
				bluePropData: null,
				redArrowData: null,
				blueArrowData: null,
				grid: 'diamond'
			};
		} catch (error) {
			console.error('❌ Error converting row to PictographData:', error, row);
			return null;
		}
	}

	/**
	 * Create proper motion data from CSV row
	 * Implements the same logic as desktop apps' _create_motion_data
	 */
	private createMotionData(row: Record<string, string>, color: 'red' | 'blue'): any {
		const motionType = row[`${color}MotionType`] || 'pro';
		const propRotDir = row[`${color}PropRotDir`] || 'cw';
		const startLoc = row[`${color}StartLoc`] || (color === 'blue' ? 'e' : 'n');
		const endLoc = row[`${color}EndLoc`] || (color === 'blue' ? 'w' : 's');

		// Calculate arrow location based on start and end locations
		// This implements the same logic as ShiftLocationCalculator
		const arrowLocation = this.calculateArrowLocation(startLoc, endLoc, motionType);

		// Debug logging
		console.log(`🔍 ${color} motion: ${startLoc} → ${endLoc} (${motionType}) = arrow at ${arrowLocation}`);

		// For motion visualization, we need to preserve the actual start and end locations
		// The arrow location is used for positioning, but motion data should show the actual movement
		const finalStartLoc = startLoc;  // Always use the actual start location
		const finalEndLoc = endLoc;      // Always use the actual end location

		console.log(`🎯 ${color} final locations: startLoc=${finalStartLoc}, endLoc=${finalEndLoc}, arrowAt=${arrowLocation}`);

		// Calculate orientations based on motion type and turns
		const { startOri, endOri } = this.calculateOrientations(motionType, 0); // 0 turns for now

		return {
			id: `${color}-${row.letter}-${row.startPos}-${row.endPos}`,
			color: color,
			motionType: motionType,
			startLoc: finalStartLoc, // Use calculated arrow location for shifts
			endLoc: finalEndLoc,     // Use calculated arrow location for shifts
			startOri: startOri,
			endOri: endOri,
			turns: 0, // Will be calculated based on motion type
			propRotDir: propRotDir,
			leadState: null,
			prefloatMotionType: null,
			prefloatPropRotDir: null,
			// Keep original locations for reference
			originalStartLoc: startLoc,
			originalEndLoc: endLoc,
			arrowLocation: arrowLocation
		};
	}

	/**
	 * Calculate arrow location based on start and end locations
	 * Implements the same logic as desktop ShiftLocationCalculator
	 */
	private calculateArrowLocation(startLoc: string, endLoc: string, motionType: string): string {
		// For static motions, arrow stays at start location
		if (motionType === 'static') {
			return startLoc;
		}

		// For shift motions (pro/anti), calculate intermediate location
		const directionPairs: Record<string, string> = {
			'n,e': 'ne', 'e,n': 'ne',
			'e,s': 'se', 's,e': 'se',
			's,w': 'sw', 'w,s': 'sw',
			'w,n': 'nw', 'n,w': 'nw',
			'ne,nw': 'n', 'nw,ne': 'n',
			'ne,se': 'e', 'se,ne': 'e',
			'sw,se': 's', 'se,sw': 's',
			'nw,sw': 'w', 'sw,nw': 'w'
		};

		const key = `${startLoc},${endLoc}`;
		return directionPairs[key] || startLoc; // Fallback to start location
	}

	/**
	 * Calculate start and end orientations based on motion type
	 * Implements basic orientation calculation logic
	 */
	private calculateOrientations(motionType: string, turns: number): { startOri: string; endOri: string } {
		// Basic orientation calculation - can be enhanced later
		let startOri = 'in';
		let endOri = 'out';

		// For static motions, both orientations are the same
		if (motionType === 'static') {
			startOri = 'in';
			endOri = 'in';
		}
		// For shift motions with even turns, orientations stay the same
		// For odd turns, orientations switch
		else if (turns % 2 === 1) {
			startOri = 'in';
			endOri = 'in'; // Switch for odd turns
		}

		return { startOri, endOri };
	}

	/**
	 * Get all available start positions for a given grid mode
	 */
	getAvailableStartPositions(gridMode: string = 'diamond'): string[] {
		if (!this.parsedData) return [];

		const dataset = gridMode === 'diamond' ? this.parsedData.diamond : this.parsedData.box;
		const startPositions = [...new Set(dataset.map(row => row.startPos))];
		return startPositions.sort();
	}

	/**
	 * Get all available end positions for a given grid mode
	 */
	getAvailableEndPositions(gridMode: string = 'diamond'): string[] {
		if (!this.parsedData) return [];

		const dataset = gridMode === 'diamond' ? this.parsedData.diamond : this.parsedData.box;
		const endPositions = [...new Set(dataset.map(row => row.endPos))];
		return endPositions.sort();
	}

	/**
	 * Get statistics about the loaded data
	 */
	getDataStats() {
		if (!this.parsedData) return null;

		return {
			diamond: {
				total: this.parsedData.diamond.length,
				letters: [...new Set(this.parsedData.diamond.map(row => row.letter))].length,
				startPositions: this.getAvailableStartPositions('diamond').length,
				endPositions: this.getAvailableEndPositions('diamond').length
			},
			box: {
				total: this.parsedData.box.length,
				letters: [...new Set(this.parsedData.box.map(row => row.letter))].length,
				startPositions: this.getAvailableStartPositions('box').length,
				endPositions: this.getAvailableEndPositions('box').length
			}
		};
	}
}

// Export singleton instance
const optionDataService = new OptionDataService();
export default optionDataService;

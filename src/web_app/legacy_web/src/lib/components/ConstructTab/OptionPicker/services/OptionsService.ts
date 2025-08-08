/**
 * Options Service for OptionPicker
 * 
 * Provides functionality for generating, filtering, sorting, and grouping pictograph options.
 */

import type { PictographData } from '$lib/types/PictographData';
import type { SortMethod, ReversalFilter } from '../config';

/**
 * Get next available options based on the current sequence
 */
export function getNextOptions(sequence: PictographData[]): PictographData[] {
	// For now, return a basic set of options
	// In a real implementation, this would generate options based on the sequence context
	if (!sequence || sequence.length === 0) {
		return generateStartingOptions();
	}
	
	return generateNextOptionsFromSequence(sequence);
}

/**
 * Generate starting options when no sequence exists
 */
function generateStartingOptions(): PictographData[] {
	// Return basic starting positions
	return [
		createBasicOption('A', 'alpha', 'alpha'),
		createBasicOption('B', 'alpha', 'beta'),
		createBasicOption('C', 'alpha', 'gamma'),
	];
}

/**
 * Generate next options based on existing sequence
 */
function generateNextOptionsFromSequence(sequence: PictographData[]): PictographData[] {
	const lastBeat = sequence[sequence.length - 1];
	if (!lastBeat) return generateStartingOptions();
	
	// Generate options that follow from the last beat
	const options: PictographData[] = [];
	
	// Add some basic continuation options
	const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
	const positions = ['alpha', 'beta', 'gamma'];
	
	for (const letter of letters) {
		for (const startPos of positions) {
			for (const endPos of positions) {
				options.push(createBasicOption(letter, startPos, endPos));
			}
		}
	}
	
	return options.slice(0, 20); // Limit to 20 options for now
}

/**
 * Create a basic option for testing
 */
function createBasicOption(letter: string, startPos: string, endPos: string): PictographData {
	return {
		letter,
		startPos: startPos as any,
		endPos: endPos as any,
		timing: null,
		direction: null,
		gridMode: 'diamond',
		gridData: null,
		blueMotionData: {
			id: crypto.randomUUID(),
			color: 'blue',
			motionType: 'pro',
			startLoc: 'n',
			endLoc: 's',
			startOri: 'in',
			endOri: 'out',
			turns: 1,
			propRotDir: 'clockwise'
		},
		redMotionData: {
			id: crypto.randomUUID(),
			color: 'red',
			motionType: 'anti',
			startLoc: 's',
			endLoc: 'n',
			startOri: 'out',
			endOri: 'in',
			turns: 1,
			propRotDir: 'counter_clockwise'
		},
		redPropData: null,
		bluePropData: null,
		redArrowData: null,
		blueArrowData: null,
		grid: 'diamond'
	};
}

/**
 * Determine reversal category for an option
 */
export function determineReversalCategory(
	sequence: PictographData[],
	option: PictographData
): ReversalFilter {
	// Simplified reversal detection
	if (!sequence || sequence.length === 0) {
		return 'continuous';
	}
	
	const lastBeat = sequence[sequence.length - 1];
	if (!lastBeat || !lastBeat.redMotionData || !lastBeat.blueMotionData) {
		return 'continuous';
	}
	
	if (!option.redMotionData || !option.blueMotionData) {
		return 'continuous';
	}
	
	// Check if rotation directions continue or reverse
	const redContinuous = lastBeat.redMotionData.propRotDir === option.redMotionData.propRotDir;
	const blueContinuous = lastBeat.blueMotionData.propRotDir === option.blueMotionData.propRotDir;
	
	if (redContinuous && blueContinuous) {
		return 'continuous';
	} else if (redContinuous || blueContinuous) {
		return 'one_reversal';
	} else {
		return 'two_reversals';
	}
}

/**
 * Determine group key for an option based on sort method
 */
export function determineGroupKey(
	option: PictographData,
	sortMethod: SortMethod,
	sequence: PictographData[]
): string {
	switch (sortMethod) {
		case 'type':
			return getLetterType(option.letter);
		case 'letter':
			return option.letter || 'Unknown';
		case 'reversal':
			return determineReversalCategory(sequence, option);
		case 'grid':
			return option.gridMode || 'diamond';
		default:
			return 'all';
	}
}

/**
 * Get letter type for grouping
 */
function getLetterType(letter: string | null): string {
	if (!letter) return 'Unknown';
	
	const type1Letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'];
	const type2Letters = ['W', 'X', 'Y', 'Z', 'Σ', 'Δ', 'θ', 'Ω'];
	const type3Letters = ['W-', 'X-', 'Y-', 'Z-', 'Σ-', 'Δ-', 'θ-', 'Ω-'];
	const type4Letters = ['Φ', 'Ψ', 'Λ'];
	const type5Letters = ['Φ-', 'Ψ-', 'Λ-'];
	const type6Letters = ['α', 'β', 'Γ'];
	
	if (type1Letters.includes(letter)) return 'Type 1';
	if (type2Letters.includes(letter)) return 'Type 2';
	if (type3Letters.includes(letter)) return 'Type 3';
	if (type4Letters.includes(letter)) return 'Type 4';
	if (type5Letters.includes(letter)) return 'Type 5';
	if (type6Letters.includes(letter)) return 'Type 6';
	
	return 'Unknown';
}

/**
 * Get sorted group keys based on sort method
 */
export function getSortedGroupKeys(keys: string[], sortMethod: SortMethod): string[] {
	switch (sortMethod) {
		case 'type':
			return keys.sort((a, b) => {
				const order = ['Type 1', 'Type 2', 'Type 3', 'Type 4', 'Type 5', 'Type 6', 'Unknown'];
				return order.indexOf(a) - order.indexOf(b);
			});
		case 'letter':
			return keys.sort();
		case 'reversal':
			return keys.sort((a, b) => {
				const order = ['continuous', 'one_reversal', 'two_reversals'];
				return order.indexOf(a) - order.indexOf(b);
			});
		case 'grid':
			return keys.sort();
		default:
			return keys.sort();
	}
}

/**
 * Get sorter function for options based on sort method
 */
export function getSorter(
	sortMethod: SortMethod,
	sequence: PictographData[]
): (a: PictographData, b: PictographData) => number {
	switch (sortMethod) {
		case 'type':
			return (a, b) => {
				const typeA = getLetterType(a.letter);
				const typeB = getLetterType(b.letter);
				return typeA.localeCompare(typeB);
			};
		case 'letter':
			return (a, b) => {
				const letterA = a.letter || '';
				const letterB = b.letter || '';
				return letterA.localeCompare(letterB);
			};
		case 'reversal':
			return (a, b) => {
				const reversalA = determineReversalCategory(sequence, a);
				const reversalB = determineReversalCategory(sequence, b);
				return reversalA.localeCompare(reversalB);
			};
		case 'grid':
			return (a, b) => {
				const gridA = a.gridMode || '';
				const gridB = b.gridMode || '';
				return gridA.localeCompare(gridB);
			};
		default:
			return () => 0;
	}
}

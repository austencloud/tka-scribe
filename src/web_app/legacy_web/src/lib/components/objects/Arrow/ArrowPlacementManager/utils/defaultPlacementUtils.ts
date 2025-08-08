// src/lib/components/PlacementManagers/ArrowPlacementManager/utils/defaultPlacementUtils.ts
import {
	PRO,
	ANTI,
	FLOAT,
	DASH,
	STATIC,
	DIAMOND,
	BOX,
	RADIAL,
	NONRADIAL,
	CLOCK,
	COUNTER,
	IN,
	OUT
} from '$lib/types/Constants';
import { LetterType } from '$lib/types/LetterType';
import { LetterUtils } from '$lib/utils/LetterUtils';
import type { ArrowData } from '$lib/components/objects/Arrow/ArrowData';
import type { MotionType } from '$lib/types/Types';
import type { ArrowPlacementConfig } from '../types';

// Import default placement data
import diamondProData from '$lib/data/arrow_placement/diamond/default/default_diamond_pro_placements.json';
import diamondAntiData from '$lib/data/arrow_placement/diamond/default/default_diamond_anti_placements.json';
import diamondFloatData from '$lib/data/arrow_placement/diamond/default/default_diamond_float_placements.json';
import diamondDashData from '$lib/data/arrow_placement/diamond/default/default_diamond_dash_placements.json';
import diamondStaticData from '$lib/data/arrow_placement/diamond/default/default_diamond_static_placements.json';
import boxProData from '$lib/data/arrow_placement/box/default/default_box_pro_placements.json';
import boxAntiData from '$lib/data/arrow_placement/box/default/default_box_anti_placements.json';
import boxFloatData from '$lib/data/arrow_placement/box/default/default_box_float_placements.json';
import boxDashData from '$lib/data/arrow_placement/box/default/default_box_dash_placements.json';
import boxStaticData from '$lib/data/arrow_placement/box/default/default_box_static_placements.json';
import type { PictographChecker } from '$lib/components/Pictograph/services/PictographChecker';
import { LetterConditions } from '$lib/components/Pictograph/constants/LetterConditions';
import type { PictographData } from '$lib/types/PictographData';

// Define type for the actual JSON structure
// This better matches what we get from the JSON files
interface TurnAdjustment {
	[turn: string]: [number, number];
}

interface PlacementData {
	[key: string]: TurnAdjustment;
}

// Consolidated default placement data with proper typing
const DEFAULT_PLACEMENTS: Record<string, Record<string, PlacementData>> = {
	diamond: {
		pro: diamondProData as any,
		anti: diamondAntiData as any,
		float: diamondFloatData as any,
		dash: diamondDashData as any,
		static: diamondStaticData as any
	},
	box: {
		pro: boxProData as any,
		anti: boxAntiData as any,
		float: boxFloatData as any,
		dash: boxDashData as any,
		static: boxStaticData as any
	}
};

/**
 * Gets the default adjustment values for an arrow
 */
export function getDefaultAdjustment(
	arrow: ArrowData,
	config: ArrowPlacementConfig
): [number, number] {
	const { pictographData, checker } = config;
	const motionType = arrow.motionType as string;
	const gridMode = (pictographData.gridMode || DIAMOND) as string;

	// Get default placements for this grid mode and motion type
	const defaultPlacements = DEFAULT_PLACEMENTS[gridMode]?.[motionType] || {};

	// Get the appropriate adjustment key
	const key = getAdjustmentKey(arrow, defaultPlacements, pictographData, checker);
	const turnsString = String(arrow.turns || 0);

	console.log(`🔍 Looking up adjustment: key="${key}", turns="${turnsString}"`);
	console.log(`   Available placements: ${JSON.stringify(Object.keys(defaultPlacements))}`);

	// Find the adjustment based on the key and turns
	if (key in defaultPlacements && turnsString in defaultPlacements[key]) {
		const adjustment = defaultPlacements[key][turnsString];
		console.log(`   ✅ Found adjustment for key "${key}": [${adjustment[0]}, ${adjustment[1]}]`);
		return adjustment;
	} else if (motionType in defaultPlacements && turnsString in defaultPlacements[motionType]) {
		const adjustment = defaultPlacements[motionType][turnsString];
		console.log(`   ✅ Found adjustment for motionType "${motionType}": [${adjustment[0]}, ${adjustment[1]}]`);
		return adjustment;
	}

	console.log(`   ❌ No adjustment found, returning [0, 0]`);
	return [0, 0];
}

/**
 * Generates the lookup key for default adjustments
 */
function getAdjustmentKey(
	arrow: ArrowData,
	defaultPlacements: PlacementData,
	pictographData: PictographData,
	checker: PictographChecker
): string {
	const motionType = arrow.motionType as string;
	const motionEndOri = arrow.endOri as string;

	console.log(`🔑 getAdjustmentKey: ${arrow.color} arrow, motionType: ${motionType}, endOri: ${motionEndOri}`);

	// Check for different orientation types
	const hasBetaProps = checker.checkLetterCondition(LetterConditions.BETA_ENDING);
	const hasAlphaProps = checker.checkLetterCondition(LetterConditions.ALPHA_ENDING);
	const hasGammaProps = checker.checkLetterCondition(LetterConditions.GAMMA_ENDING);
	const hasHybridOrientation = checker.endsWithLayer3();
	const hasRadialProps = checker.endsWithRadialOri();
	const hasNonRadialProps = checker.endsWithNonRadialOri();

	console.log(`   Orientation checks: alpha=${hasAlphaProps}, beta=${hasBetaProps}, gamma=${hasGammaProps}`);
	console.log(`   Layer checks: hybrid=${hasHybridOrientation}, radial=${hasRadialProps}, nonRadial=${hasNonRadialProps}`);
	console.log(`   Checker data:`, {
		redPropData: pictographData.redPropData,
		bluePropData: pictographData.bluePropData,
		letter: pictographData.letter
	});

	const keySuffix = '_to_';
	let motionEndOriKey = '';

	// Handle hybrid orientation
	if (hasHybridOrientation) {
		if (motionEndOri === IN || motionEndOri === OUT) {
			motionEndOriKey = `${RADIAL}_`;
		} else if (motionEndOri === CLOCK || motionEndOri === COUNTER) {
			motionEndOriKey = `${NONRADIAL}_`;
		}
	}

	// Handle letter-specific adjustments
	let letterSuffix = '';
	if (pictographData.letter) {
		const letterVal = pictographData.letter as string;
		const letter = LetterUtils.getLetter(letterVal);
		const letterType = LetterType.getLetterType(letter);

		if (letterType && (letterType === LetterType.Type3 || letterType === LetterType.Type5)) {
			const char = letterVal.slice(0, -1);
			letterSuffix = `_${char}_dash`;
		} else {
			letterSuffix = `_${letterVal}`;
		}
	}

	// Build the key middle part
	let keyMiddle = '';
	if (hasRadialProps) {
		keyMiddle = 'layer1';
	} else if (hasNonRadialProps) {
		keyMiddle = 'layer2';
	} else if (hasHybridOrientation) {
		keyMiddle = 'layer3';
	}
	console.log(`   Layer part: "${keyMiddle}"`);

	// Add prop type
	if (hasAlphaProps) {
		keyMiddle += '_alpha';
	} else if (hasBetaProps) {
		keyMiddle += '_beta';
	} else if (hasGammaProps) {
		keyMiddle += '_gamma';
	}
	console.log(`   After prop type: "${keyMiddle}"`);

	// Construct the final key
	let key = motionType;
	if (keyMiddle) {
		key += keySuffix + motionEndOriKey + keyMiddle;
	}
	const keyWithLetter = key + letterSuffix;

	// Debug: Show available keys and constructed keys
	const availableKeys = Object.keys(defaultPlacements);
	console.log(`   Available keys: ${JSON.stringify(availableKeys)}`);
	console.log(`   Constructed key: "${key}"`);
	console.log(`   Key with letter: "${keyWithLetter}"`);
	console.log(`   Motion type fallback: "${motionType}"`);

	// Return the most specific key available
	if (keyWithLetter in defaultPlacements) {
		console.log(`   ✅ Using keyWithLetter: "${keyWithLetter}"`);
		return keyWithLetter;
	} else if (key in defaultPlacements) {
		console.log(`   ✅ Using key: "${key}"`);
		return key;
	} else {
		console.log(`   ✅ Using motionType fallback: "${motionType}"`);
		return motionType;
	}
}

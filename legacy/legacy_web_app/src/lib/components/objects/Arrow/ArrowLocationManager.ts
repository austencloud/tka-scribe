// src/lib/components/objects/Arrow/ArrowLocationManager.ts
import type { Motion } from '../Motion/Motion';
import {
	NORTH,
	EAST,
	SOUTH,
	WEST,
	NORTHEAST,
	SOUTHEAST,
	SOUTHWEST,
	NORTHWEST,
	CLOCKWISE,
	COUNTER_CLOCKWISE,
	RED,
	BLUE,
	DIAMOND,
	BOX,
	ANTI,
	DASH,
	FLOAT,
	PRO,
	STATIC
} from '$lib/types/Constants';
import { Letter } from '$lib/types/Letter';
import { LetterType } from '$lib/types/LetterType';
import type { Loc, Color } from '$lib/types/Types';
import { LetterUtils } from '$lib/utils/LetterUtils';
import type { PictographService } from '$lib/components/Pictograph/PictographService';

export type LocationPairMap = {
	[key: string]: Loc;
};

export type DirectionalLocationMap = {
	[key in string]?: {
		[key in Loc]?: Loc;
	};
};

export type LetterLocationMap = {
	[key: string]: Loc;
};

export type GridLocationMap = {
	[startLoc: string]: {
		[shiftLoc: string]: Loc;
	};
};

export type LocationPair = Set<Loc>;
export type LocationPairsMap = Map<LocationPair, Loc>;

export const DEFAULT_ZERO_TURNS_DASH_LOCATION_MAP: LocationPairMap = {
	[`${NORTH}_${SOUTH}`]: EAST,
	[`${EAST}_${WEST}`]: SOUTH,
	[`${SOUTH}_${NORTH}`]: WEST,
	[`${WEST}_${EAST}`]: NORTH,
	[`${NORTHEAST}_${SOUTHWEST}`]: SOUTHEAST,
	[`${NORTHWEST}_${SOUTHEAST}`]: NORTHEAST,
	[`${SOUTHWEST}_${NORTHEAST}`]: NORTHWEST,
	[`${SOUTHEAST}_${NORTHWEST}`]: SOUTHWEST
};

export const DASH_LOCATION_NONZERO_TURNS_MAP: DirectionalLocationMap = {
	[CLOCKWISE]: {
		[NORTH]: EAST,
		[EAST]: SOUTH,
		[SOUTH]: WEST,
		[WEST]: NORTH,
		[NORTHEAST]: SOUTHEAST,
		[SOUTHEAST]: SOUTHWEST,
		[SOUTHWEST]: NORTHWEST,
		[NORTHWEST]: NORTHEAST
	},
	[COUNTER_CLOCKWISE]: {
		[NORTH]: WEST,
		[EAST]: NORTH,
		[SOUTH]: EAST,
		[WEST]: SOUTH,
		[NORTHEAST]: NORTHWEST,
		[SOUTHEAST]: NORTHEAST,
		[SOUTHWEST]: SOUTHEAST,
		[NORTHWEST]: SOUTHWEST
	}
};

export const PHI_DASH_PSI_DASH_LOCATION_MAP: LetterLocationMap = {
	[`${RED}_${NORTH}_${SOUTH}`]: EAST,
	[`${RED}_${EAST}_${WEST}`]: NORTH,
	[`${RED}_${SOUTH}_${NORTH}`]: EAST,
	[`${RED}_${WEST}_${EAST}`]: NORTH,
	[`${BLUE}_${NORTH}_${SOUTH}`]: WEST,
	[`${BLUE}_${EAST}_${WEST}`]: SOUTH,
	[`${BLUE}_${SOUTH}_${NORTH}`]: WEST,
	[`${BLUE}_${WEST}_${EAST}`]: SOUTH,
	[`${RED}_${NORTHWEST}_${SOUTHEAST}`]: NORTHEAST,
	[`${RED}_${NORTHEAST}_${SOUTHWEST}`]: SOUTHEAST,
	[`${RED}_${SOUTHWEST}_${NORTHEAST}`]: SOUTHEAST,
	[`${RED}_${SOUTHEAST}_${NORTHWEST}`]: NORTHEAST,
	[`${BLUE}_${NORTHWEST}_${SOUTHEAST}`]: SOUTHWEST,
	[`${BLUE}_${NORTHEAST}_${SOUTHWEST}`]: NORTHWEST,
	[`${BLUE}_${SOUTHWEST}_${NORTHEAST}`]: NORTHWEST,
	[`${BLUE}_${SOUTHEAST}_${NORTHWEST}`]: SOUTHWEST
};

export const LAMBDA_ZERO_TURNS_LOCATION_MAP: LetterLocationMap = {
	[`${NORTH}_${SOUTH}_${WEST}`]: EAST,
	[`${EAST}_${WEST}_${SOUTH}`]: NORTH,
	[`${NORTH}_${SOUTH}_${EAST}`]: WEST,
	[`${WEST}_${EAST}_${SOUTH}`]: NORTH,
	[`${SOUTH}_${NORTH}_${WEST}`]: EAST,
	[`${EAST}_${WEST}_${NORTH}`]: SOUTH,
	[`${SOUTH}_${NORTH}_${EAST}`]: WEST,
	[`${WEST}_${EAST}_${NORTH}`]: SOUTH,
	[`${NORTHEAST}_${SOUTHWEST}_${NORTHWEST}`]: SOUTHEAST,
	[`${NORTHWEST}_${SOUTHEAST}_${NORTHEAST}`]: SOUTHWEST,
	[`${SOUTHWEST}_${NORTHEAST}_${SOUTHEAST}`]: NORTHWEST,
	[`${SOUTHEAST}_${NORTHWEST}_${SOUTHWEST}`]: NORTHEAST,
	[`${NORTHEAST}_${SOUTHWEST}_${SOUTHEAST}`]: NORTHWEST,
	[`${NORTHWEST}_${SOUTHEAST}_${SOUTHWEST}`]: NORTHEAST,
	[`${SOUTHWEST}_${NORTHEAST}_${NORTHWEST}`]: SOUTHEAST,
	[`${SOUTHEAST}_${NORTHWEST}_${NORTHEAST}`]: SOUTHWEST
};

export const DIAMOND_DASH_LOCATION_MAP: GridLocationMap = {
	[NORTH]: {
		[NORTHWEST]: EAST,
		[NORTHEAST]: WEST,
		[SOUTHEAST]: WEST,
		[SOUTHWEST]: EAST
	},
	[EAST]: {
		[NORTHWEST]: SOUTH,
		[NORTHEAST]: SOUTH,
		[SOUTHEAST]: NORTH,
		[SOUTHWEST]: NORTH
	},
	[SOUTH]: {
		[NORTHWEST]: EAST,
		[NORTHEAST]: WEST,
		[SOUTHEAST]: WEST,
		[SOUTHWEST]: EAST
	},
	[WEST]: {
		[NORTHWEST]: SOUTH,
		[NORTHEAST]: SOUTH,
		[SOUTHEAST]: NORTH,
		[SOUTHWEST]: NORTH
	}
};

export const BOX_DASH_LOCATION_MAP: GridLocationMap = {
	[NORTHEAST]: {
		[NORTH]: SOUTHEAST,
		[EAST]: NORTHWEST,
		[SOUTH]: NORTHWEST,
		[WEST]: SOUTHEAST
	},
	[SOUTHEAST]: {
		[NORTH]: SOUTHWEST,
		[EAST]: SOUTHWEST,
		[SOUTH]: NORTHEAST,
		[WEST]: NORTHEAST
	},
	[SOUTHWEST]: {
		[NORTH]: SOUTHEAST,
		[EAST]: NORTHWEST,
		[SOUTH]: NORTHWEST,
		[WEST]: SOUTHEAST
	},
	[NORTHWEST]: {
		[NORTH]: SOUTHWEST,
		[EAST]: SOUTHWEST,
		[SOUTH]: NORTHEAST,
		[WEST]: NORTHEAST
	}
};

export const OPPOSITE_LOCATION_MAP: Record<string, string> = {
	[NORTH]: SOUTH,
	[SOUTH]: NORTH,
	[EAST]: WEST,
	[WEST]: EAST,
	[NORTHEAST]: SOUTHWEST,
	[SOUTHWEST]: NORTHEAST,
	[SOUTHEAST]: NORTHWEST,
	[NORTHWEST]: SOUTHEAST
};

// Class definition with dependency on PictographService
export default class ArrowLocationManager {
	constructor(private service: PictographService) {}

	getArrowLocation(
		motion: Motion,
		getOtherMotion?: (motion: Motion) => Motion | null,
		getShiftMotion?: () => Motion | null,
		letter?: Letter | null
	): Loc | null {
		return calculateArrowLocation(motion, getOtherMotion, getShiftMotion, letter);
	}
}

// Pure functional implementations
export function createDirectionPairsMap(): LocationPairsMap {
	const directionPairs: LocationPairsMap = new Map();

	directionPairs.set(new Set([NORTH, EAST]), NORTHEAST);
	directionPairs.set(new Set([EAST, SOUTH]), SOUTHEAST);
	directionPairs.set(new Set([SOUTH, WEST]), SOUTHWEST);
	directionPairs.set(new Set([WEST, NORTH]), NORTHWEST);

	directionPairs.set(new Set([NORTHEAST, NORTHWEST]), NORTH);
	directionPairs.set(new Set([NORTHEAST, SOUTHEAST]), EAST);
	directionPairs.set(new Set([SOUTHWEST, SOUTHEAST]), SOUTH);
	directionPairs.set(new Set([NORTHWEST, SOUTHWEST]), WEST);

	return directionPairs;
}

export function calculateArrowLocation(
	motion: Motion,
	getOtherMotion?: (motion: Motion) => Motion | null,
	getShiftMotion?: () => Motion | null,
	letter?: Letter | null
): Loc | null {
	const { motionType } = motion;

	switch (motionType) {
		case PRO:
		case ANTI:
		case FLOAT:
			return calculateShiftLocation(motion.startLoc, motion.endLoc);
		case DASH:
			return calculateDashLocation(motion, getOtherMotion, getShiftMotion, letter);
		case STATIC:
			return motion.startLoc;
		default:
			return null;
	}
}

export function calculateShiftLocation(startLoc: Loc, endLoc: Loc): Loc | null {
	const directionPairs = createDirectionPairsMap();

	for (const [locationPair, resultLoc] of directionPairs.entries()) {
		if (locationPair.has(startLoc) && locationPair.has(endLoc)) {
			return resultLoc;
		}
	}

	return null;
}

export function calculateDashLocation(
	motion: Motion,
	getOtherMotion?: (motion: Motion) => Motion | null,
	getShiftMotion?: () => Motion | null,
	letter?: Letter | null
): Loc | null {
	// Use the passed letter or default to null
	const currentLetter = letter ? LetterUtils.getLetter(letter) : null;
	const letterType = letter ? LetterType.getLetterType(letter) : null;

	if (letterType === LetterType.Type3 && motion.turns === 0 && getShiftMotion) {
		return calculateDashLocationBasedOnShift(motion, getShiftMotion, getOtherMotion);
	}

	if (currentLetter && [Letter.Φ_DASH, Letter.Ψ_DASH].includes(currentLetter) && getOtherMotion) {
		return calculatePhiDashPsiDashLocation(motion, getOtherMotion, currentLetter);
	}

	if (
		currentLetter &&
		[Letter.Λ, Letter.Λ_DASH].includes(currentLetter) &&
		motion.turns === 0 &&
		getOtherMotion
	) {
		return calculateLambdaZeroTurnsLocation(motion, getOtherMotion, currentLetter);
	}

	if (motion.turns === 0) {
		return calculateDefaultZeroTurnsDashLocation(motion.startLoc, motion.endLoc);
	}

	return calculateDashLocationNonZeroTurns(motion);
}

function calculatePhiDashPsiDashLocation(
	motion: Motion,
	getOtherMotion: (motion: Motion) => Motion | null,
	letter: Letter
): Loc | null {
	const otherMotion = getOtherMotion(motion);

	if (motion.turns === 0 && otherMotion && otherMotion.turns === 0) {
		const key = `${motion.color}_${motion.startLoc}_${motion.endLoc}`;
		return PHI_DASH_PSI_DASH_LOCATION_MAP[key] || null;
	}

	if (motion.turns === 0 && otherMotion) {
		const otherLoc = calculateDashLocationNonZeroTurns(otherMotion);
		return otherLoc ? getOppositeLocation(otherLoc) : null;
	}

	return calculateDashLocationNonZeroTurns(motion);
}

function calculateLambdaZeroTurnsLocation(
	motion: Motion,
	getOtherMotion: (motion: Motion) => Motion | null,
	letter: Letter
): Loc | null {
	const otherMotion = getOtherMotion(motion);
	const key = `${motion.startLoc}_${motion.endLoc}_${otherMotion?.endLoc || ''}`;
	return LAMBDA_ZERO_TURNS_LOCATION_MAP[key] || null;
}

export function getOppositeLocation(loc: Loc): Loc | null {
	return (OPPOSITE_LOCATION_MAP[loc] as Loc) || null;
}

function calculateDefaultZeroTurnsDashLocation(startLoc: Loc, endLoc: Loc): Loc | null {
	const key = `${startLoc}_${endLoc}`;
	return DEFAULT_ZERO_TURNS_DASH_LOCATION_MAP[key] || null;
}

function calculateDashLocationNonZeroTurns(motion: Motion): Loc | null {
	return DASH_LOCATION_NONZERO_TURNS_MAP[motion.propRotDir]?.[motion.startLoc] || null;
}

function calculateDashLocationBasedOnShift(
	motion: Motion,
	getShiftMotion: () => Motion | null,
	getOtherMotion?: (motion: Motion) => Motion | null
): Loc | null {
	const shiftMotion = getShiftMotion();

	// Get the dash motion by getting the other motion from shift
	const dashMotion = shiftMotion && getOtherMotion ? getOtherMotion(shiftMotion) : null;

	if (!shiftMotion || !dashMotion) {
		return null;
	}

	// Get shift location from the shift motion's start and end locations
	const shiftLocation = calculateShiftLocation(shiftMotion.startLoc, shiftMotion.endLoc);

	// Get the dash start location from the dash motion
	const dashStartLoc = dashMotion.startLoc;
	const gridMode = motion.gridMode;

	if (!shiftLocation || !dashStartLoc) {
		return null;
	}

	// Lookup in grid-specific maps
	if (gridMode === DIAMOND) {
		const result = DIAMOND_DASH_LOCATION_MAP[dashStartLoc]?.[shiftLocation];
		return result || null;
	} else if (gridMode === BOX) {
		const result = BOX_DASH_LOCATION_MAP[dashStartLoc]?.[shiftLocation];
		return result || null;
	}

	return null;
}

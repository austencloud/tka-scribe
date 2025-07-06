/**
 * Sequence Interpretation Configuration
 *
 * This file contains all the configuration for interpreting pictograph sequences,
 * including turn mappings, rotation directions, and motion type handling.
 *
 * Easy to edit and maintain - all sequence interpretation logic is centralized here.
 */

import type { PropRotDir, MotionType } from '../types/core.js';

// ============================================================================
// TURN TO DEGREE MAPPING
// ============================================================================

/**
 * Maps turn numbers to degrees of rotation
 * Easy to edit - just modify the values here to change turn interpretations
 */
export const TURN_TO_DEGREES: Record<number, number> = {
	0: 90, // 0 turns = 90 degrees (pro motion cancels center path rotation)
	0.5: 180, // Half turn
	1: 270, // Full turn
	1.5: 360, // One and a half turns
	2: 450, // Two turns
	2.5: 540, // Two and a half turns
	3: 630 // Three turns
	// Add more mappings as needed
};

export const PRO_ZERO_TURNS_DEGREES = 90;

// ============================================================================
// ROTATION DIRECTION MAPPING
// ============================================================================

/**
 * Direction multipliers for rotation calculations
 */
export const ROTATION_DIRECTION: Record<string, number> = {
	cw: 1, // Clockwise = positive rotation
	ccw: -1, // Counter-clockwise = negative rotation
	no_rot: 0 // No rotation
};

// ============================================================================
// MOTION TYPE CONFIGURATION
// ============================================================================

/**
 * Configuration for different motion types
 * Each motion type has specific behavior for how rotations are calculated
 */
export const MOTION_TYPE_CONFIG: Record<
	MotionType,
	{
		description: string;
		usesStaffRotation: boolean;
		usesCenterPathRotation: boolean;
		rotationBehavior: string;
	}
> = {
	pro: {
		description: 'Pro motion (isolation) - staff rotates independently of center path',
		usesStaffRotation: true,
		usesCenterPathRotation: false,
		rotationBehavior:
			'Staff rotation is independent. For 0 turns (float), staff rotates 90° in same direction as center path movement to cancel visual rotation.'
	},
	anti: {
		description: 'Antispin motion - staff rotation counters center path rotation',
		usesStaffRotation: true,
		usesCenterPathRotation: true,
		rotationBehavior:
			'Staff rotation is calculated relative to center path angle to maintain orientation relative to the grid.'
	},
	static: {
		description: 'Static motion - staff maintains orientation relative to grid',
		usesStaffRotation: false,
		usesCenterPathRotation: true,
		rotationBehavior:
			'Staff orientation is calculated to maintain fixed orientation relative to the grid as prop moves.'
	},
	dash: {
		description: 'Dash motion - staff rotates smoothly between orientations',
		usesStaffRotation: false,
		usesCenterPathRotation: true,
		rotationBehavior:
			'Staff smoothly interpolates between start and end orientations, adjusted for center path rotation.'
	},
	none: {
		description: 'No motion - staff remains in place',
		usesStaffRotation: false,
		usesCenterPathRotation: false,
		rotationBehavior: 'No movement or rotation.'
	}
};

// ============================================================================
// ORIENTATION TO ANGLE MAPPING
// ============================================================================

/**
 * Maps orientation strings to angles in radians
 * Easy to edit - modify these values to change orientation interpretations
 */
export const ORIENTATION_TO_ANGLE: Record<string, number> = {
	in: 0, // Pointing inward (toward center)
	out: Math.PI, // Pointing outward (away from center)
	n: -Math.PI / 2, // Pointing north (up)
	e: 0, // Pointing east (right)
	s: Math.PI / 2, // Pointing south (down)
	w: Math.PI, // Pointing west (left)
	ne: -Math.PI / 4, // Pointing northeast
	se: Math.PI / 4, // Pointing southeast
	sw: (3 * Math.PI) / 4, // Pointing southwest
	nw: (-3 * Math.PI) / 4 // Pointing northwest
};

// ============================================================================
// CALCULATION HELPERS
// ============================================================================

/**
 * Get degrees for a given number of turns
 */
export function getDegreesForTurns(turns: number | undefined): number {
	if (turns === undefined || turns === null) {return 0;}

	// Handle exact matches first
	if (TURN_TO_DEGREES[turns] !== undefined) {
		return TURN_TO_DEGREES[turns];
	}

	// For non-standard turn values, calculate proportionally
	// Assume 1 turn = 360 degrees
	return turns * 360;
}

/**
 * Get rotation direction multiplier
 */
export function getRotationMultiplier(direction: PropRotDir): number {
	if (!direction) {return 0;}
	return ROTATION_DIRECTION[direction] || 0;
}

/**
 * Get angle for orientation string
 */
export function getOrientationAngle(orientation: string | undefined): number {
	if (!orientation) {return 0;}
	return ORIENTATION_TO_ANGLE[orientation.toLowerCase()] || 0;
}

/**
 * Convert degrees to radians
 */
export function degreesToRadians(degrees: number): number {
	return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function radiansToDegrees(radians: number): number {
	return radians * (180 / Math.PI);
}

/**
 * Normalize angle to 0-2π range
 */
export function normalizeAngle(angle: number): number {
	const TWO_PI = 2 * Math.PI;
	while (angle < 0) {angle += TWO_PI;}
	while (angle >= TWO_PI) {angle -= TWO_PI;}
	return angle;
}

// ============================================================================
// SPECIAL CASE HANDLERS
// ============================================================================

/**
 * Handle the special case of pro motion with 0 turns (float)
 * This should rotate the staff 90 degrees in the same direction as center path rotation
 */
export function calculateProFloatRotation(_centerPathAngle: number, direction: PropRotDir): number {
	const baseRotation = degreesToRadians(PRO_ZERO_TURNS_DEGREES);
	const directionMultiplier = getRotationMultiplier(direction);

	// For pro motion, the staff rotation should be in the same direction as center path movement
	// to effectively cancel out the visual rotation
	return normalizeAngle(baseRotation * directionMultiplier);
}

/**
 * Validate motion configuration
 * Useful for debugging and ensuring configuration is correct
 */
export function validateMotionConfig(): { isValid: boolean; errors: string[] } {
	const errors: string[] = [];

	// Check that all motion types have configuration
	const requiredMotionTypes: MotionType[] = ['pro', 'anti', 'static', 'dash', 'none'];
	for (const motionType of requiredMotionTypes) {
		if (!MOTION_TYPE_CONFIG[motionType]) {
			errors.push(`Missing configuration for motion type: ${motionType}`);
		}
	}

	// Check that basic turn mappings exist
	if (TURN_TO_DEGREES[0] === undefined) {
		errors.push('Missing mapping for 0 turns');
	}
	if (TURN_TO_DEGREES[1] === undefined) {
		errors.push('Missing mapping for 1 turn');
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

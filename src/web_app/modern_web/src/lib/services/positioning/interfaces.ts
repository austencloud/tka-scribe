/**
 * Interface definitions for arrow positioning services.
 *
 * These interfaces define the contracts for the refactored positioning services
 * that follow TKA's clean architecture principles.
 *
 * Direct TypeScript mirror of reference/modern/core/interfaces/positioning_services.py
 */

import type { ArrowData, MotionData, PictographData } from '$lib/domain';
import type { Location } from '../interfaces';

// Basic types
export interface Point {
	x: number;
	y: number;
}

export interface ArrowPosition extends Point {
	rotation: number;
}

export interface IArrowLocationCalculator {
	/**
	 * Calculate the arrow location based on motion type and data.
	 *
	 * Args:
	 *     motion: Motion data containing type, start/end locations, rotation direction
	 *     pictograph_data: Optional pictograph data for DASH motion Type 3 detection
	 *
	 * Returns:
	 *     Location enum value representing the calculated arrow location
	 */
	calculateLocation(motion: MotionData, pictographData?: PictographData): Location;
}

export interface IArrowRotationCalculator {
	/**
	 * Calculate the arrow rotation angle based on motion type and location.
	 *
	 * Args:
	 *     motion: Motion data containing type and rotation direction
	 *     location: Calculated arrow location
	 *
	 * Returns:
	 *     Rotation angle in degrees (0-360)
	 */
	calculateRotation(motion: MotionData, location: Location): number;
}

export interface IArrowAdjustmentCalculator {
	/**
	 * Calculate position adjustment for arrow based on placement rules.
	 *
	 * Args:
	 *     motionData: Motion data containing type, rotation, and location info
	 *     letter: Letter for special placement lookup
	 *     location: Pre-calculated arrow location
	 *
	 * Returns:
	 *     Point representing the adjustment offset
	 */
	calculateAdjustment(motionData: MotionData, letter: string, location: Location): Point;
}

export interface IArrowCoordinateSystemService {
	/**
	 * Get initial position coordinates based on motion type and location.
	 *
	 * Args:
	 *     motion: Motion data to determine coordinate system (hand points vs layer2)
	 *     location: Arrow location
	 *
	 * Returns:
	 *     Point representing the initial position coordinates
	 */
	getInitialPosition(motion: MotionData, location: Location): Point;

	/**
	 * Get the center point of the scene coordinate system.
	 */
	getSceneCenter(): Point;
}

export interface IArrowPositioningOrchestrator {
	/**
	 * Calculate complete arrow position using the positioning pipeline.
	 *
	 * Args:
	 *     arrowData: Arrow data including color and visibility
	 *     pictographData: Pictograph context
	 *     motionData: Optional pre-extracted motion data
	 *
	 * Returns:
	 *     Tuple of [x, y, rotation_angle]
	 */
	calculateArrowPosition(
		arrowData: ArrowData,
		pictographData: PictographData,
		motionData?: MotionData
	): [number, number, number];

	/**
	 * Calculate positions for all arrows in the pictograph.
	 *
	 * Args:
	 *     pictographData: Pictograph containing all arrows
	 *
	 * Returns:
	 *     Updated pictograph data with calculated positions
	 */
	calculateAllArrowPositions(pictographData: PictographData): PictographData;

	/**
	 * Determine if arrow should be mirrored based on motion type.
	 *
	 * Args:
	 *     arrowData: Arrow data including motion type and rotation direction
	 *
	 * Returns:
	 *     True if arrow should be mirrored, False otherwise
	 */
	shouldMirrorArrow(arrowData: ArrowData): boolean;

	/**
	 * Apply mirror transformation to arrow graphics item.
	 */
	applyMirrorTransform(arrowItem: HTMLElement | SVGElement, shouldMirror: boolean): void;
}

// Supporting interfaces for services

export interface ISpecialPlacementService {
	getSpecialAdjustment(
		motionData: MotionData,
		pictographData: PictographData,
		arrowColor?: string
	): Point | null;
}

export interface IDefaultPlacementService {
	getDefaultAdjustment(motionData: MotionData, gridMode?: string, placementKey?: string): Point;
}

export interface IPlacementKeyGenerator {
	generatePlacementKey(
		motionData: MotionData,
		pictographData: PictographData,
		defaultPlacements: Record<string, unknown>,
		gridMode?: string
	): string;
}

export interface IAttributeKeyGenerator {
	getKeyFromArrow(arrowData: ArrowData, pictographData: PictographData): string;
}

export interface ISpecialPlacementOriKeyGenerator {
	generateOrientationKey(motionData: MotionData, pictographData: PictographData): string;
}

export interface ITurnsTupleKeyGenerator {
	generateTurnsTuple(pictographData: PictographData): number[];
}

import { GridMode, GridPosition } from "$shared/pictograph/grid/domain/enums/grid-enums";
import type { IGridPositionDeriver } from "$shared/pictograph/grid/services/contracts/IGridPositionDeriver";
/**
 * Sequence Transformation Service
 *
 * Pure transformation functions for sequences.
 * All functions return new sequences without mutating inputs.
 *
 * Based on legacy desktop app implementation with modern TypeScript patterns.
 */

import type { BeatData } from "../../domain/models/BeatData";
import type { SequenceData } from "$shared/foundation/domain/models/SequenceData";
import { updateSequenceData, createSequenceData } from "$shared/foundation/domain/models/SequenceData";
import type { IMotionQueryHandler } from "$shared/index";
import { createMotionData } from "$shared/pictograph/shared/domain/models/MotionData";
import type { StartPositionData } from "../../domain/models/StartPositionData";
import { isStartPosition } from "$create/shared/domain/type-guards/pictograph-type-guards";
import { isBeat } from "$create/shared";
import { Letter } from "$lib/shared/foundation/domain/models/Letter";
import { MotionType, MotionColor, RotationDirection } from "$shared/pictograph/shared/domain/enums/pictograph-enums";
import { TYPES } from "$shared/inversify/types";
import { resolve } from "$shared/inversify";
import { inject, injectable } from "inversify";
import { createBeatData } from "../../domain/factories/createBeatData";
import { createStartPositionData } from "../../domain/factories/createStartPositionData";
import type { ISequenceTransformationService } from "../contracts/ISequenceTransformationService";
import { LOCATION_MAP_EIGHTH_CW } from "$create/generate/circular/domain/constants/circular-position-maps";
import { VERTICAL_MIRROR_POSITION_MAP, VERTICAL_MIRROR_LOCATION_MAP, SWAPPED_POSITION_MAP } from "$create/generate/circular/domain/constants/strict-cap-position-maps";

@injectable()
export class SequenceTransformationService
  implements ISequenceTransformationService
{
  constructor(
    @inject(TYPES.IMotionQueryHandler)
    private readonly motionQueryHandler: IMotionQueryHandler
  ) {}
  /**
   * Clear all beats in a sequence (make them blank)
   */
  clearSequence(sequence: SequenceData): SequenceData {
    const clearedBeats = sequence.beats.map((beat) => ({
      ...beat,
      isBlank: true,
      pictographData: null,
      blueReversal: false,
      redReversal: false,
    }));

    return updateSequenceData(sequence, {
      beats: clearedBeats,
    });
  }

  /**
   * Duplicate a sequence with new IDs
   */
  duplicateSequence(sequence: SequenceData, newName?: string): SequenceData {
    return createSequenceData({
      ...sequence,
      id: crypto.randomUUID(),
      name: newName || `${sequence.name} (Copy)`,
      beats: sequence.beats.map((beat) => ({
        ...beat,
        id: crypto.randomUUID(),
      })),
    });
  }

  /**
   * Mirror sequence vertically
   * - Mirrors all positions using vertical mirror map
   * - Mirrors all locations (flips east/west)
   * - Reverses rotation directions (cw ↔ ccw)
   * - Grid mode stays the same
   */
  mirrorSequence(sequence: SequenceData): SequenceData {
    const mirroredBeats = sequence.beats.map((beat) => this.mirrorBeat(beat));

    // Also mirror the start position if it exists (both fields for compatibility)
    const mirroredStartPosition = sequence.startPosition
      ? this.mirrorPictograph(sequence.startPosition)
      : undefined;
    const mirroredStartingPositionBeat = sequence.startingPositionBeat
      ? this.mirrorPictograph(sequence.startingPositionBeat)
      : undefined;

    return updateSequenceData(sequence, {
      beats: mirroredBeats,
      ...(mirroredStartPosition && { startPosition: mirroredStartPosition }),
      ...(mirroredStartingPositionBeat && {
        startingPositionBeat: mirroredStartingPositionBeat,
      }),
    });
  }

  /**
   * Mirror pictograph data (works for both beats and start positions)
   */
  private mirrorPictograph(data: BeatData | StartPositionData): BeatData | StartPositionData {
    if (isBeat(data)) {
      return this.mirrorBeat(data);
    } else {
      return this.mirrorStartPosition(data);
    }
  }

  /**
   * Mirror a start position vertically
   */
  private mirrorStartPosition(startPos: StartPositionData): StartPositionData {
    // Mirror motions (same logic as mirrorBeat but without beat-specific fields)
    const mirroredMotions = { ...startPos.motions };

    // Mirror blue motion
    if (startPos.motions[MotionColor.BLUE]) {
      const blueMotion = startPos.motions[MotionColor.BLUE];
      mirroredMotions[MotionColor.BLUE] = {
        ...blueMotion,
        startLocation: VERTICAL_MIRROR_LOCATION_MAP[blueMotion.startLocation],
        endLocation: VERTICAL_MIRROR_LOCATION_MAP[blueMotion.endLocation],
        arrowLocation: VERTICAL_MIRROR_LOCATION_MAP[blueMotion.arrowLocation],
        rotationDirection: this.reverseRotationDirection(
          blueMotion.rotationDirection
        ),
      };
    }

    // Mirror red motion
    if (startPos.motions[MotionColor.RED]) {
      const redMotion = startPos.motions[MotionColor.RED];
      mirroredMotions[MotionColor.RED] = {
        ...redMotion,
        startLocation: VERTICAL_MIRROR_LOCATION_MAP[redMotion.startLocation],
        endLocation: VERTICAL_MIRROR_LOCATION_MAP[redMotion.endLocation],
        arrowLocation: VERTICAL_MIRROR_LOCATION_MAP[redMotion.arrowLocation],
        rotationDirection: this.reverseRotationDirection(
          redMotion.rotationDirection
        ),
      };
    }

    return createStartPositionData({
      ...startPos,
      motions: mirroredMotions,
      gridPosition: startPos.gridPosition
        ? VERTICAL_MIRROR_POSITION_MAP[startPos.gridPosition]
        : null,
    });
  }

  /**
   * Mirror a single beat vertically
   */
  private mirrorBeat(beat: BeatData): BeatData {
    if (beat.isBlank || !beat) {
      return beat;
    }

    // Mirror positions (handle undefined as null)
    const mirroredStartPosition = beat.startPosition
      ? VERTICAL_MIRROR_POSITION_MAP[beat.startPosition]
      : null;
    const mirroredEndPosition = beat.endPosition
      ? VERTICAL_MIRROR_POSITION_MAP[beat.endPosition]
      : null;

    // Mirror motions
    const mirroredMotions = { ...beat.motions };

    // Mirror blue motion
    if (beat.motions[MotionColor.BLUE]) {
      const blueMotion = beat.motions[MotionColor.BLUE];
      mirroredMotions[MotionColor.BLUE] = {
        ...blueMotion,
        startLocation: VERTICAL_MIRROR_LOCATION_MAP[blueMotion.startLocation],
        endLocation: VERTICAL_MIRROR_LOCATION_MAP[blueMotion.endLocation],
        arrowLocation: VERTICAL_MIRROR_LOCATION_MAP[blueMotion.arrowLocation],
        rotationDirection: this.reverseRotationDirection(
          blueMotion.rotationDirection
        ),
      };
    }

    // Mirror red motion
    if (beat.motions[MotionColor.RED]) {
      const redMotion = beat.motions[MotionColor.RED];
      mirroredMotions[MotionColor.RED] = {
        ...redMotion,
        startLocation: VERTICAL_MIRROR_LOCATION_MAP[redMotion.startLocation],
        endLocation: VERTICAL_MIRROR_LOCATION_MAP[redMotion.endLocation],
        arrowLocation: VERTICAL_MIRROR_LOCATION_MAP[redMotion.arrowLocation],
        rotationDirection: this.reverseRotationDirection(
          redMotion.rotationDirection
        ),
      };
    }

    return createBeatData({
      ...beat,
      startPosition: mirroredStartPosition,
      endPosition: mirroredEndPosition,
      motions: mirroredMotions,
    });
  }

  /**
   * Reverse rotation direction (cw ↔ ccw, others stay same)
   */
  private reverseRotationDirection(
    direction: RotationDirection
  ): RotationDirection {
    if (direction === RotationDirection.CLOCKWISE) {
      return RotationDirection.COUNTER_CLOCKWISE;
    } else if (direction === RotationDirection.COUNTER_CLOCKWISE) {
      return RotationDirection.CLOCKWISE;
    }
    return direction; // NO_ROTATION stays the same
  }

  /**
   * Swap colors (blue ↔ red)
   * - Swaps entire blue and red motion data
   * - Swaps blue and red reversal states
   * - Updates positions based on swapped locations
   */
  swapColors(sequence: SequenceData): SequenceData {
    const swappedBeats = sequence.beats.map((beat) => this.colorSwapBeat(beat));

    // Also swap colors for the start position if it exists (both fields for compatibility)
    const swappedStartPosition = sequence.startPosition
      ? this.colorSwapPictograph(sequence.startPosition)
      : undefined;
    const swappedStartingPositionBeat = sequence.startingPositionBeat
      ? this.colorSwapPictograph(sequence.startingPositionBeat)
      : undefined;

    return updateSequenceData(sequence, {
      beats: swappedBeats,
      ...(swappedStartPosition && { startPosition: swappedStartPosition }),
      ...(swappedStartingPositionBeat && {
        startingPositionBeat: swappedStartingPositionBeat,
      }),
    });
  }

  /**
   * Color swap a single beat
   */
  private colorSwapBeat(beat: BeatData): BeatData {
    if (beat.isBlank || !beat) {
      return beat;
    }

    // Swap positions using swap position map (handle undefined as null)
    const swappedStartPosition = beat.startPosition
      ? SWAPPED_POSITION_MAP[beat.startPosition]
      : null;
    const swappedEndPosition = beat.endPosition
      ? SWAPPED_POSITION_MAP[beat.endPosition]
      : null;

    // Swap the motions
    const swappedMotions = {
      [MotionColor.BLUE]: beat.motions[MotionColor.RED],
      [MotionColor.RED]: beat.motions[MotionColor.BLUE],
    };

    // Update the color property in each motion to match the new color
    if (swappedMotions[MotionColor.BLUE]) {
      swappedMotions[MotionColor.BLUE] = {
        ...swappedMotions[MotionColor.BLUE],
        color: MotionColor.BLUE,
      };
    }
    if (swappedMotions[MotionColor.RED]) {
      swappedMotions[MotionColor.RED] = {
        ...swappedMotions[MotionColor.RED],
        color: MotionColor.RED,
      };
    }

    return createBeatData({
      ...beat,
      startPosition: swappedStartPosition,
      endPosition: swappedEndPosition,
      motions: swappedMotions,
      blueReversal: beat.redReversal,
      redReversal: beat.blueReversal,
    });
  }

  /**
   * Color swap pictograph data (works for both beats and start positions)
   */
  private colorSwapPictograph(data: BeatData | StartPositionData): BeatData | StartPositionData {
    if (isBeat(data)) {
      return this.colorSwapBeat(data);
    } else {
      return this.colorSwapStartPosition(data);
    }
  }

  /**
   * Color swap a start position
   */
  private colorSwapStartPosition(startPos: StartPositionData): StartPositionData {
    // Swap the motions
    const swappedMotions = {
      [MotionColor.BLUE]: startPos.motions[MotionColor.RED],
      [MotionColor.RED]: startPos.motions[MotionColor.BLUE],
    };

    // Update the color property in each motion to match the new color
    if (swappedMotions[MotionColor.BLUE]) {
      swappedMotions[MotionColor.BLUE] = {
        ...swappedMotions[MotionColor.BLUE],
        color: MotionColor.BLUE,
      };
    }
    if (swappedMotions[MotionColor.RED]) {
      swappedMotions[MotionColor.RED] = {
        ...swappedMotions[MotionColor.RED],
        color: MotionColor.RED,
      };
    }

    return createStartPositionData({
      ...startPos,
      motions: swappedMotions,
      gridPosition: startPos.gridPosition
        ? SWAPPED_POSITION_MAP[startPos.gridPosition]
        : null,
    });
  }

  /**
   * Rotate pictograph data (works for both beats and start positions)
   */
  private rotatePictograph(data: BeatData | StartPositionData): BeatData | StartPositionData {
    if (isBeat(data)) {
      return this.rotateBeat(data);
    } else {
      return this.rotateStartPosition(data);
    }
  }

  /**
   * Rotate a start position 45° clockwise
   */
  private rotateStartPosition(startPos: StartPositionData): StartPositionData {
    // Determine new grid mode (toggle DIAMOND ↔ BOX)
    const currentGridMode =
      startPos.motions[MotionColor.BLUE]?.gridMode ?? GridMode.DIAMOND;
    const newGridMode =
      currentGridMode === GridMode.DIAMOND ? GridMode.BOX : GridMode.DIAMOND;

    // Rotate motions and locations
    const rotatedMotions = { ...startPos.motions };

    // Rotate blue motion locations
    if (startPos.motions[MotionColor.BLUE]) {
      const blueMotion = startPos.motions[MotionColor.BLUE];
      // Exclude old placement data - force regeneration with new grid mode
      const {
        arrowPlacementData,
        propPlacementData,
        ...motionWithoutPlacement
      } = blueMotion;
      rotatedMotions[MotionColor.BLUE] = createMotionData({
        ...motionWithoutPlacement,
        startLocation: LOCATION_MAP_EIGHTH_CW[blueMotion.startLocation],
        endLocation: LOCATION_MAP_EIGHTH_CW[blueMotion.endLocation],
        arrowLocation: LOCATION_MAP_EIGHTH_CW[blueMotion.arrowLocation],
        gridMode: newGridMode,
      });
    }

    // Rotate red motion locations
    if (startPos.motions[MotionColor.RED]) {
      const redMotion = startPos.motions[MotionColor.RED];
      // Exclude old placement data - force regeneration with new grid mode
      const {
        arrowPlacementData,
        propPlacementData,
        ...motionWithoutPlacement
      } = redMotion;
      rotatedMotions[MotionColor.RED] = createMotionData({
        ...motionWithoutPlacement,
        startLocation: LOCATION_MAP_EIGHTH_CW[redMotion.startLocation],
        endLocation: LOCATION_MAP_EIGHTH_CW[redMotion.endLocation],
        arrowLocation: LOCATION_MAP_EIGHTH_CW[redMotion.arrowLocation],
        gridMode: newGridMode,
      });
    }

    // Rotate gridPosition if it exists
    // Note: We use the same location map for positions as for locations
    // since they use the same naming (e.g., NORTH, NORTHEAST, etc.)
    const rotatedGridPosition = startPos.gridPosition
      ? ((LOCATION_MAP_EIGHTH_CW[
          startPos.gridPosition as unknown as keyof typeof LOCATION_MAP_EIGHTH_CW
        ] as unknown as GridPosition) ?? startPos.gridPosition)
      : null;

    return createStartPositionData({
      ...startPos,
      motions: rotatedMotions,
      gridPosition: rotatedGridPosition,
    });
  }

  /**
   * Rotate sequence 45° clockwise
   * - Rotates all locations by 45° (one step: N → NE → E → SE → S → SW → W → NW → N)
   * - Derives new positions from rotated locations
   * - Toggles grid mode (DIAMOND ↔ BOX)
   *
   * Based on legacy desktop app sequence_rotater.py implementation
   */
  rotateSequence(
    sequence: SequenceData,
    _rotationAmount: number
  ): SequenceData {
    const rotatedBeats = sequence.beats.map((beat) => this.rotateBeat(beat));

    // Also rotate the start position if it exists (both fields for compatibility)
    const rotatedStartPosition = sequence.startPosition
      ? this.rotatePictograph(sequence.startPosition)
      : undefined;
    const rotatedStartingPositionBeat = sequence.startingPositionBeat
      ? this.rotatePictograph(sequence.startingPositionBeat)
      : undefined;

    // Toggle grid mode (DIAMOND ↔ BOX)
    const newGridMode =
      sequence.gridMode === GridMode.DIAMOND ? GridMode.BOX : GridMode.DIAMOND;

    return updateSequenceData(sequence, {
      beats: rotatedBeats,
      ...(rotatedStartPosition && { startPosition: rotatedStartPosition }),
      ...(rotatedStartingPositionBeat && {
        startingPositionBeat: rotatedStartingPositionBeat,
      }),
      gridMode: newGridMode,
    });
  }

  /**
   * Rotate a single beat 45° clockwise
   * - Rotates each location by 45° (one position in cw order)
   * - Derives new positions from rotated blue/red location pairs
   * - Creates fresh motion data with new placement data
   * - Toggles grid mode for each motion
   */
  private rotateBeat(beat: BeatData): BeatData {
    if (beat.isBlank || !beat) {
      return beat;
    }

    // Get position deriver service
    const positionDeriver = resolve<IGridPositionDeriver>(
      TYPES.IGridPositionDeriver
    );

    // Determine new grid mode (toggle DIAMOND ↔ BOX)
    const currentGridMode =
      beat.motions[MotionColor.BLUE]!.gridMode ?? GridMode.DIAMOND;
    const newGridMode =
      currentGridMode === GridMode.DIAMOND ? GridMode.BOX : GridMode.DIAMOND;

    // Rotate motions and locations (keep orientations - they're relative)
    const rotatedMotions = { ...beat.motions };

    // Rotate blue motion locations
    // Use createMotionData to ensure fresh placement data with new grid mode
    if (beat.motions[MotionColor.BLUE]) {
      const blueMotion = beat.motions[MotionColor.BLUE];
      // Destructure to exclude old placement data - force regeneration
      const {
        arrowPlacementData,
        propPlacementData,
        ...motionWithoutPlacement
      } = blueMotion;
      rotatedMotions[MotionColor.BLUE] = createMotionData({
        ...motionWithoutPlacement,
        startLocation: LOCATION_MAP_EIGHTH_CW[blueMotion.startLocation],
        endLocation: LOCATION_MAP_EIGHTH_CW[blueMotion.endLocation],
        arrowLocation: LOCATION_MAP_EIGHTH_CW[blueMotion.arrowLocation],
        gridMode: newGridMode,
      });
    }

    // Rotate red motion locations
    // Use createMotionData to ensure fresh placement data with new grid mode
    if (beat.motions[MotionColor.RED]) {
      const redMotion = beat.motions[MotionColor.RED];
      // Destructure to exclude old placement data - force regeneration
      const {
        arrowPlacementData,
        propPlacementData,
        ...motionWithoutPlacement
      } = redMotion;
      rotatedMotions[MotionColor.RED] = createMotionData({
        ...motionWithoutPlacement,
        startLocation: LOCATION_MAP_EIGHTH_CW[redMotion.startLocation],
        endLocation: LOCATION_MAP_EIGHTH_CW[redMotion.endLocation],
        arrowLocation: LOCATION_MAP_EIGHTH_CW[redMotion.arrowLocation],
        gridMode: newGridMode,
      });
    }

    // Derive new positions from rotated locations
    const rotatedBlueMotion = rotatedMotions[MotionColor.BLUE];
    const rotatedRedMotion = rotatedMotions[MotionColor.RED];

    let rotatedStartPosition = beat.startPosition ?? null;
    let rotatedEndPosition = beat.endPosition ?? null;

    // Derive start position from rotated start locations
    if (rotatedBlueMotion && rotatedRedMotion) {
      rotatedStartPosition = positionDeriver.getGridPositionFromLocations(
        rotatedBlueMotion.startLocation,
        rotatedRedMotion.startLocation
      );
      rotatedEndPosition = positionDeriver.getGridPositionFromLocations(
        rotatedBlueMotion.endLocation,
        rotatedRedMotion.endLocation
      );
    }

    return createBeatData({
      ...beat,
      startPosition: rotatedStartPosition,
      endPosition: rotatedEndPosition,
      motions: rotatedMotions,
    });
  }

  /**
   * Reverse sequence (NOT just reverse beat order!)
   * - Creates new start position from final beat's end position/orientations
   * - Reverses beat order
   * - Each beat: swaps positions/locations/orientations, flips rotation direction
   * - Letter is looked up from dataset based on new motion configuration
   *
   * This is a complex transformation that requires pictograph dataset lookup.
   */
  async reverseSequence(sequence: SequenceData): Promise<SequenceData> {
    if (sequence.beats.length === 0) {
      return sequence;
    }

    // Step 1: Create new start position from final beat's end position
    const finalBeat = sequence.beats[sequence.beats.length - 1]!;
    const newStartPosition = this.createStartPositionFromBeatEnd(finalBeat);

    // Step 2: Reverse and transform each beat with letter lookup
    const reversedBeats: BeatData[] = [];
    const reversedBeatArray = [...sequence.beats].reverse();
    const gridMode = sequence.gridMode ?? GridMode.DIAMOND; // Default to DIAMOND if undefined

    for (let index = 0; index < reversedBeatArray.length; index++) {
      const beat = reversedBeatArray[index]!;
      const reversedBeat = await this.reverseBeat(beat, index + 1, gridMode);
      reversedBeats.push(reversedBeat);
    }

    return updateSequenceData(sequence, {
      beats: reversedBeats,
      startPosition: newStartPosition,
      startingPositionBeat: newStartPosition,
      name: `${sequence.name} (Reversed)`,
    });
  }

  /**
   * Create a new start position pictograph from a beat's end state
   */
  private createStartPositionFromBeatEnd(beat: BeatData): BeatData {
    const blueMotion = beat.motions[MotionColor.BLUE];
    const redMotion = beat.motions[MotionColor.RED];

    return createBeatData({
      id: `beat-${Date.now()}`,
      letter: Letter.ALPHA, // Use Greek alpha as placeholder - TODO: lookup from dataset
      startPosition: beat.endPosition ?? null,
      endPosition: beat.endPosition ?? null,
      beatNumber: 0,
      duration: 1000,
      blueReversal: false,
      redReversal: false,
      isBlank: false,
      motions: {
        [MotionColor.BLUE]: blueMotion
          ? {
              ...blueMotion,
              motionType: MotionType.STATIC,
              rotationDirection: RotationDirection.NO_ROTATION,
              startLocation: blueMotion.endLocation,
              endLocation: blueMotion.endLocation,
              arrowLocation: blueMotion.endLocation,
              startOrientation: blueMotion.endOrientation,
              endOrientation: blueMotion.endOrientation,
              turns: 0,
            }
          : undefined,
        [MotionColor.RED]: redMotion
          ? {
              ...redMotion,
              motionType: MotionType.STATIC,
              rotationDirection: RotationDirection.NO_ROTATION,
              startLocation: redMotion.endLocation,
              endLocation: redMotion.endLocation,
              arrowLocation: redMotion.endLocation,
              startOrientation: redMotion.endOrientation,
              endOrientation: redMotion.endOrientation,
              turns: 0,
            }
          : undefined,
      },
    });
  }

  /**
   * Reverse a single beat (for playing sequence backward)
   * - Swaps start/end positions
   * - Swaps start/end locations
   * - Swaps start/end orientations
   * - Flips rotation direction (CW ↔ CCW, noRotation stays same)
   * - Keeps motionType and turns the same
   * - Looks up correct letter from pictograph dataset based on new motion configuration
   */
  private async reverseBeat(
    beat: BeatData,
    newBeatNumber: number,
    gridMode: GridMode
  ): Promise<BeatData> {
    if (beat.isBlank || !beat) {
      return { ...beat, beatNumber: newBeatNumber };
    }

    // Swap positions
    const swappedStartPosition = beat.endPosition ?? null;
    const swappedEndPosition = beat.startPosition ?? null;

    // Reverse motions
    const reversedMotions = { ...beat.motions };

    // Reverse blue motion
    if (beat.motions[MotionColor.BLUE]) {
      const blueMotion = beat.motions[MotionColor.BLUE];
      reversedMotions[MotionColor.BLUE] = {
        ...blueMotion,
        startLocation: blueMotion.endLocation,
        endLocation: blueMotion.startLocation,
        startOrientation: blueMotion.endOrientation,
        endOrientation: blueMotion.startOrientation,
        rotationDirection: this.reverseRotationDirection(
          blueMotion.rotationDirection
        ),
        // motionType and turns stay the same
      };
    }

    // Reverse red motion
    if (beat.motions[MotionColor.RED]) {
      const redMotion = beat.motions[MotionColor.RED];
      reversedMotions[MotionColor.RED] = {
        ...redMotion,
        startLocation: redMotion.endLocation,
        endLocation: redMotion.startLocation,
        startOrientation: redMotion.endOrientation,
        endOrientation: redMotion.startOrientation,
        rotationDirection: this.reverseRotationDirection(
          redMotion.rotationDirection
        ),
        // motionType and turns stay the same
      };
    }

    // Look up the correct letter from the pictograph dataset
    let correctLetter: Letter | null = beat.letter ?? null; // Default to original letter as fallback
    if (reversedMotions[MotionColor.BLUE] && reversedMotions[MotionColor.RED]) {
      try {
        const foundLetter =
          await this.motionQueryHandler.findLetterByMotionConfiguration(
            reversedMotions[MotionColor.BLUE],
            reversedMotions[MotionColor.RED],
            gridMode
          );
        if (foundLetter) {
          correctLetter = foundLetter as Letter;
          console.log(
            `✅ Reverse: Found letter "${correctLetter}" for reversed beat (was "${beat.letter}")`
          );
        } else {
          console.warn(
            `⚠️ Reverse: No letter found for reversed beat, keeping original letter "${beat.letter}"`
          );
        }
      } catch (error) {
        console.error(
          `❌ Reverse: Error looking up letter for reversed beat:`,
          error
        );
      }
    }

    return createBeatData({
      ...beat,
      beatNumber: newBeatNumber,
      startPosition: swappedStartPosition,
      endPosition: swappedEndPosition,
      motions: reversedMotions,
      letter: correctLetter,
    });
  }
}

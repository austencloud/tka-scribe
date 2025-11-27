/**
 * Mirrored Swapped Inverted CAP Executor
 *
 * Executes the mirrored-swapped-inverted CAP (Circular Arrangement Pattern) by combining:
 * 1. MIRRORED: Mirror locations vertically (E↔W)
 * 2. SWAPPED: Blue does what Red did, Red does what Blue did
 * 3. INVERTED: Flip letters (A↔B), flip motion types (PRO↔ANTI)
 *
 * NOTE: While each transformation individually affects rotation, when all three are
 * combined together, the rotation direction is PRESERVED.
 *
 * This creates a sequence where:
 * - Colors are swapped (Blue performs Red's actions and vice versa)
 * - Letters are flipped (A ↔ B)
 * - Motion types are flipped (PRO ↔ ANTI)
 * - Locations are mirrored vertically across the north-south axis
 * - **Prop rotation directions stay THE SAME** (SWAP + INVERTED + MIRRORED preserve rotation)
 *
 * IMPORTANT: Slice size is ALWAYS halved (no quartering)
 * IMPORTANT: End position must RETURN TO START POSITION (inverted effect)
 */

import { inject, injectable } from "inversify";

import type { BeatData } from "$create/shared/workspace-panel";
import type { Letter } from "$shared";
import { MotionColor, type MotionData, MotionType, RotationDirection } from "$shared";
import { TYPES } from "$shared/inversify/types";
import type {
  GridLocation,
  GridPosition,
} from "$shared/pictograph/grid/domain/enums/grid-enums";

import type { IOrientationCalculationService } from "../../../shared/services/contracts";
import type { ICAPParameterProvider } from "../../../shared/services/contracts";
import {
  INVERTED_CAP_VALIDATION_SET,
  VERTICAL_MIRROR_LOCATION_MAP,
  VERTICAL_MIRROR_POSITION_MAP,
} from "../../domain/constants/strict-cap-position-maps";
import type { SliceSize } from "../../domain/models/circular-models";
import type { ICAPExecutor } from "../contracts/ICAPExecutor";

@injectable()
export class MirroredSwappedInvertedCAPExecutor implements ICAPExecutor {
  constructor(
    @inject(TYPES.IOrientationCalculationService)
    private orientationCalculationService: IOrientationCalculationService,
    @inject(TYPES.ICAPParameterProvider)
    private capParams: ICAPParameterProvider
  ) {}

  /**
   * Execute the mirrored-swapped-inverted CAP
   *
   * @param sequence - The partial sequence to complete (must include start position at index 0)
   * @param sliceSize - Ignored (mirrored-swapped-inverted CAP always uses halved)
   * @returns The complete circular sequence with all beats
   */
  executeCAP(sequence: BeatData[], _sliceSize: SliceSize): BeatData[] {
    // Validate the sequence
    this._validateSequence(sequence);

    // Remove start position (index 0) for processing
    const startPosition = sequence.shift();
    if (!startPosition) {
      throw new Error("Sequence must have a start position");
    }

    // Calculate how many beats to generate (always doubles for halved)
    const sequenceLength = sequence.length;
    const entriesToAdd = sequenceLength;

    // Generate the new beats
    const generatedBeats: BeatData[] = [];
    let lastBeat = sequence[sequence.length - 1]!;
    const nextBeatNumber = lastBeat.beatNumber + 1;

    // Skip first two beats in the loop (start from beat 2)
    for (let i = 2; i < sequenceLength + 2; i++) {
      const finalIntendedLength = sequenceLength + entriesToAdd;
      const nextBeat = this._createNewCAPEntry(
        sequence,
        lastBeat,
        nextBeatNumber + i - 2,
        finalIntendedLength
      );

      generatedBeats.push(nextBeat);
      sequence.push(nextBeat);
      lastBeat = nextBeat;
    }

    // Re-insert start position at the beginning
    sequence.unshift(startPosition);

    return sequence;
  }

  /**
   * Validate that the sequence can perform a mirrored-swapped-inverted CAP
   * Requirement: end_position must equal start_position (inverted returns to start)
   */
  private _validateSequence(sequence: BeatData[]): void {
    if (sequence.length < 2) {
      throw new Error(
        "Sequence must have at least 2 beats (start position + 1 beat)"
      );
    }

    const startPos = sequence[0]!.startPosition;
    const endPos = sequence[sequence.length - 1]!.endPosition;

    if (!startPos || !endPos) {
      throw new Error("Sequence beats must have valid start and end positions");
    }

    // Check if the (start, end) pair is valid for inverted (returns to same position)
    const key = `${startPos},${endPos}`;

    if (!INVERTED_CAP_VALIDATION_SET.has(key)) {
      throw new Error(
        `Invalid position pair for mirrored-swapped-inverted CAP: ${startPos} → ${endPos}. ` +
          `For a mirrored-swapped-inverted CAP, the end position must return to the start position (${startPos}).`
      );
    }
  }

  /**
   * Create a new CAP entry by transforming a previous beat with MIRROR + SWAP + INVERTED
   */
  private _createNewCAPEntry(
    sequence: BeatData[],
    previousBeat: BeatData,
    beatNumber: number,
    finalIntendedLength: number
  ): BeatData {
    // Get the corresponding beat from the first section using index mapping
    const previousMatchingBeat = this._getPreviousMatchingBeat(
      sequence,
      beatNumber,
      finalIntendedLength
    );

    // Get the inverted letter (INVERTED effect)
    if (!previousMatchingBeat.letter) {
      throw new Error("Previous matching beat must have a letter");
    }
    const invertedLetter =
      this.capParams.getInvertedLetter(
        previousMatchingBeat.letter as string
      ) as Letter;

    // Get the mirrored end position (MIRRORED effect)
    const mirroredEndPosition = this._getMirroredPosition(previousMatchingBeat);

    // Create the new beat with swapped, mirrored, and inverted attributes
    // KEY: Blue gets attributes from Red's matching beat (SWAP)
    //      Red gets attributes from Blue's matching beat (SWAP)
    //      Motion types are flipped (INVERTED)
    //      Letters are flipped (INVERTED)
    //      Locations and rotations are mirrored (MIRRORED)
    //      Rotation direction flipped once (3 flips total = odd = net flip)
    const newBeat: BeatData = {
      ...previousMatchingBeat,
      id: `beat-${beatNumber}`,
      beatNumber,
      letter: invertedLetter, // INVERTED: Flip letter
      startPosition: previousBeat.endPosition ?? null,
      endPosition: mirroredEndPosition, // MIRRORED: Flip position
      motions: {
        // SWAP: Blue does what Red did, with mirrored+inverted transformation
        [MotionColor.BLUE]: this._createMirroredSwappedInvertedMotion(
          MotionColor.BLUE,
          previousBeat,
          previousMatchingBeat,
          true // isSwapped = true (use opposite color's data)
        ),
        // SWAP: Red does what Blue did, with mirrored+inverted transformation
        [MotionColor.RED]: this._createMirroredSwappedInvertedMotion(
          MotionColor.RED,
          previousBeat,
          previousMatchingBeat,
          true // isSwapped = true (use opposite color's data)
        ),
      },
    };

    // Update orientations
    const beatWithStartOri =
      this.orientationCalculationService.updateStartOrientations(
        newBeat,
        previousBeat
      );
    const finalBeat =
      this.orientationCalculationService.updateEndOrientations(
        beatWithStartOri
      );

    return finalBeat;
  }

  /**
   * Get the previous matching beat using index mapping (halved pattern)
   */
  private _getPreviousMatchingBeat(
    sequence: BeatData[],
    beatNumber: number,
    finalLength: number
  ): BeatData {
    const indexMap = this._getIndexMap(finalLength);
    const matchingBeatNumber = indexMap[beatNumber];

    if (matchingBeatNumber === undefined) {
      throw new Error(`No index mapping found for beatNumber ${beatNumber}`);
    }

    // Convert 1-based beatNumber to 0-based array index
    const arrayIndex = matchingBeatNumber - 1;

    if (arrayIndex < 0 || arrayIndex >= sequence.length) {
      throw new Error(
        `Invalid index mapping: beatNumber ${beatNumber} → matchingBeatNumber ${matchingBeatNumber} → arrayIndex ${arrayIndex} (sequence length: ${sequence.length})`
      );
    }

    return sequence[arrayIndex]!;
  }

  /**
   * Generate index mapping for retrieving corresponding beats (halved pattern only)
   * Maps second half beats to first half beats
   */
  private _getIndexMap(length: number): Record<number, number> {
    const map: Record<number, number> = {};
    const halfLength = Math.floor(length / 2);

    // Map beats in second half to their corresponding beats in first half
    for (let i = halfLength + 1; i <= length; i++) {
      map[i] = i - halfLength;
    }

    return map;
  }

  /**
   * Get the vertical mirrored position
   */
  private _getMirroredPosition(
    previousMatchingBeat: BeatData
  ): GridPosition | null {
    const endPos = previousMatchingBeat.endPosition;

    if (!endPos) {
      throw new Error("Previous matching beat must have an end position");
    }

    const mirroredPosition = VERTICAL_MIRROR_POSITION_MAP[endPos];

    return mirroredPosition;
  }

  /**
   * Create mirrored-swapped-inverted motion data for the new beat
   * Combines color swapping with location mirroring, inverted motion types, and rotation flipping
   * **IMPORTANT**: Rotation direction is flipped (3 transformations = odd number of flips)
   */
  private _createMirroredSwappedInvertedMotion(
    color: MotionColor,
    previousBeat: BeatData,
    previousMatchingBeat: BeatData,
    isSwapped: boolean
  ): MotionData {
    const previousMotion = previousBeat.motions[color];

    // SWAP: Get the opposite color's motion data
    const oppositeColor =
      color === MotionColor.BLUE ? MotionColor.RED : MotionColor.BLUE;
    const matchingMotion = isSwapped
      ? previousMatchingBeat.motions[oppositeColor]
      : previousMatchingBeat.motions[color];

    if (!previousMotion || !matchingMotion) {
      throw new Error(`Missing motion data for ${color}`);
    }

    // Mirror the end location vertically (MIRRORED effect)
    const mirroredEndLocation = this._getMirroredLocation(
      matchingMotion.endLocation
    );

    // Flip the motion type (INVERTED effect)
    const invertedMotionType = this._getInvertedMotionType(
      matchingMotion.motionType
    );

    // Rotation direction stays the SAME for all motion types
    // SWAP + INVERTED + MIRRORED together preserve the rotation direction
    const finalPropRotDir = matchingMotion.rotationDirection;

    // Create mirrored-swapped-inverted motion
    const mirroredSwappedInvertedMotion = {
      ...matchingMotion,
      color, // IMPORTANT: Preserve the color (Blue stays Blue, Red stays Red)
      motionType: invertedMotionType, // INVERTED: Flip motion type
      startLocation: previousMotion.endLocation,
      endLocation: mirroredEndLocation, // MIRRORED: Flip location
      rotationDirection: finalPropRotDir, // Conditional: No flip for shifts, flip for dashes
      // Start orientation will be set by orientationCalculationService
      // End orientation will be calculated by orientationCalculationService
    };

    return mirroredSwappedInvertedMotion;
  }

  /**
   * Mirror a location vertically (flip east/west)
   */
  private _getMirroredLocation(location: GridLocation): GridLocation {
    const mirrored = VERTICAL_MIRROR_LOCATION_MAP[location];

    return mirrored;
  }

  /**
   * Get the inverted motion type (flip PRO ↔ ANTI)
   * STATIC and DASH stay the same
   */
  private _getInvertedMotionType(motionType: MotionType): MotionType {
    if (motionType === MotionType.PRO) {
      return MotionType.ANTI;
    } else if (motionType === MotionType.ANTI) {
      return MotionType.PRO;
    }

    // STATIC and DASH stay the same
    return motionType;
  }

}

/**
 * Mirrored Inverted CAP Executor - MIGRATED TO USE CAPParameterProvider
 *
 * This is an example of the migration from IInvertedLetterService to ICAPParameterProvider
 *
 * CHANGES:
 * 1. Line 28: Import changed from IInvertedLetterService to ICAPParameterProvider
 * 2. Line 41-42: Injection changed from IInvertedLetterService to ICAPParameterProvider
 * 3. Line 142: Variable name changed from complementaryLetterService to capParams
 * 4. Method call remains the same: getInvertedLetter()
 */

import type { BeatData } from "$create/shared/workspace-panel";
import type { Letter } from "$shared/foundation/domain/models/Letter";
import { MotionColor, MotionType } from "$shared/pictograph/shared/domain/enums/pictograph-enums";
import type { MotionData } from "$shared/pictograph/shared/domain/models/MotionData";
import { TYPES } from "$shared/inversify/types";
import type {
  GridLocation,
  GridPosition,
} from "$shared/pictograph/grid/domain/enums/grid-enums";
import { inject, injectable } from "inversify";
import type { IOrientationCalculationService } from "../../../shared/services/contracts";
// ✅ CHANGE 1: Import the new consolidated interface
import type { ICAPParameterProvider } from "../../../shared/services/contracts";
import {
  MIRRORED_INVERTED_VALIDATION_SET,
  VERTICAL_MIRROR_LOCATION_MAP,
  VERTICAL_MIRROR_POSITION_MAP,
} from "../../domain/constants/strict-cap-position-maps";
import type { SliceSize } from "../../domain/models/circular-models";

@injectable()
export class MirroredInvertedCAPExecutor {
  constructor(
    @inject(TYPES.IOrientationCalculationService)
    private orientationCalculationService: IOrientationCalculationService,
    // ✅ CHANGE 2: Inject ICAPParameterProvider instead of IInvertedLetterService
    @inject(TYPES.ICAPParameterProvider)
    private capParams: ICAPParameterProvider // ✅ Renamed for clarity
  ) {}

  /**
   * Execute the mirrored-complementary CAP
   */
  executeCAP(sequence: BeatData[], _sliceSize: SliceSize): BeatData[] {
    this._validateSequence(sequence);
    const startPosition = sequence.shift();
    if (!startPosition) {
      throw new Error("Sequence must have a start position");
    }

    const sequenceLength = sequence.length;
    const entriesToAdd = sequenceLength;
    const generatedBeats: BeatData[] = [];
    let lastBeat = sequence[sequence.length - 1]!;
    const nextBeatNumber = lastBeat.beatNumber + 1;

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

    sequence.unshift(startPosition);
    return sequence;
  }

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

    const key = `${startPos},${endPos}`;

    if (!MIRRORED_INVERTED_VALIDATION_SET.has(key)) {
      throw new Error(
        `Invalid position pair for mirrored-complementary CAP: ${startPos} → ${endPos}. ` +
          `For a mirrored-complementary CAP, the end position must be the vertical mirror of start position.`
      );
    }
  }

  private _createNewCAPEntry(
    sequence: BeatData[],
    previousBeat: BeatData,
    beatNumber: number,
    finalIntendedLength: number
  ): BeatData {
    const previousMatchingBeat = this._getPreviousMatchingBeat(
      sequence,
      beatNumber,
      finalIntendedLength
    );

    // ✅ CHANGE 3: Use capParams instead of complementaryLetterService
    // The method name stays the same!
    if (!previousMatchingBeat.letter) {
      throw new Error("Previous matching beat must have a letter");
    }
    const complementaryLetter =
      this.capParams.getInvertedLetter(
        previousMatchingBeat.letter as string
      ) as Letter;

    const mirroredEndPosition = this._getMirroredPosition(previousMatchingBeat);

    const newBeat: BeatData = {
      ...previousMatchingBeat,
      id: `beat-${beatNumber}`,
      beatNumber,
      letter: complementaryLetter,
      startPosition: previousBeat.endPosition ?? null,
      endPosition: mirroredEndPosition,
      motions: {
        [MotionColor.BLUE]: this._createMirroredInvertedMotion(
          MotionColor.BLUE,
          previousBeat,
          previousMatchingBeat
        ),
        [MotionColor.RED]: this._createMirroredInvertedMotion(
          MotionColor.RED,
          previousBeat,
          previousMatchingBeat
        ),
      },
    };

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

    const arrayIndex = matchingBeatNumber - 1;

    if (arrayIndex < 0 || arrayIndex >= sequence.length) {
      throw new Error(
        `Invalid index mapping: beatNumber ${beatNumber} → matchingBeatNumber ${matchingBeatNumber} → arrayIndex ${arrayIndex} (sequence length: ${sequence.length})`
      );
    }

    return sequence[arrayIndex]!;
  }

  private _getIndexMap(length: number): Record<number, number> {
    const map: Record<number, number> = {};
    const halfLength = Math.floor(length / 2);

    for (let i = halfLength + 1; i <= length; i++) {
      map[i] = i - halfLength;
    }

    return map;
  }

  private _getMirroredPosition(
    previousMatchingBeat: BeatData
  ): GridPosition | null {
    const endPos = previousMatchingBeat.endPosition;

    if (!endPos) {
      throw new Error("Previous matching beat must have an end position");
    }

    const mirroredPosition =
      VERTICAL_MIRROR_POSITION_MAP[endPos as GridPosition];

    return mirroredPosition;
  }

  private _createMirroredInvertedMotion(
    color: MotionColor,
    previousBeat: BeatData,
    previousMatchingBeat: BeatData
  ): MotionData {
    const previousMotion = previousBeat.motions[color];
    const matchingMotion = previousMatchingBeat.motions[color];

    if (!previousMotion || !matchingMotion) {
      throw new Error(`Missing motion data for ${color}`);
    }

    const mirroredEndLocation = this._getMirroredLocation(
      matchingMotion.endLocation as GridLocation
    );

    const complementaryMotionType = this._getInvertedMotionType(
      matchingMotion.motionType
    );

    const rotationDirection = matchingMotion.rotationDirection;

    const mirroredInvertedMotion = {
      ...matchingMotion,
      color,
      motionType: complementaryMotionType,
      startLocation: previousMotion.endLocation,
      endLocation: mirroredEndLocation,
      rotationDirection: rotationDirection,
    };

    return mirroredInvertedMotion;
  }

  private _getMirroredLocation(location: GridLocation): GridLocation {
    const mirrored = VERTICAL_MIRROR_LOCATION_MAP[location];
    return mirrored;
  }

  private _getInvertedMotionType(motionType: MotionType): MotionType {
    if (motionType === MotionType.PRO) {
      return MotionType.ANTI;
    } else if (motionType === MotionType.ANTI) {
      return MotionType.PRO;
    }

    return motionType;
  }
}

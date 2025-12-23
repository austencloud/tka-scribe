/**
 * CAP Detection Service Implementation
 *
 * Analyzes sequences to detect their Continuous Assembly Pattern (CAP) type.
 * This is the reverse of CAP generation - given a sequence, determine what
 * CAP type (if any) it follows.
 *
 * Algorithm: Component-based detection
 * 1. Check if sequence is circular (end matches start)
 * 2. Detect individual components (ROTATED, MIRRORED, SWAPPED, INVERTED)
 * 3. Map detected components to CAPType
 */

import { inject, injectable } from "inversify";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { BeatData } from "../../../../shared/domain/models/BeatData";
import { CAPType, SliceSize } from "../../domain/models/circular-models";
import { CAPComponent } from "../../../shared/domain/models/generate-models";
import type {
  ICAPDetectionService,
  CAPDetectionResult,
} from "../contracts/ICAPDetectionService";
import type { ISequenceLoopabilityChecker } from "$lib/features/compose/services/contracts/ISequenceLoopabilityChecker";
import type { ICAPTypeService } from "../../../shared/services/contracts/ICAPTypeService";
import { TYPES } from "$lib/shared/inversify/types";
import {
  HALVED_CAPS,
  QUARTERED_CAPS,
  QUARTER_POSITION_MAP_CW,
  QUARTER_POSITION_MAP_CCW,
  HALF_POSITION_MAP,
} from "../../domain/constants/circular-position-maps";
import {
  VERTICAL_MIRROR_POSITION_MAP,
  SWAPPED_POSITION_MAP,
  INVERTED_LETTER_MAP,
} from "../../domain/constants/strict-cap-position-maps";
import type { GridPosition } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import {
  MotionColor,
  MotionType,
} from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";

@injectable()
export class CAPDetectionService implements ICAPDetectionService {
  constructor(
    @inject(TYPES.ISequenceLoopabilityChecker)
    private loopabilityChecker: ISequenceLoopabilityChecker,
    @inject(TYPES.ICAPTypeService)
    private capTypeService: ICAPTypeService
  ) {}

  /**
   * Analyze a sequence and detect its CAP type
   */
  detectCAPType(sequence: SequenceData): CAPDetectionResult {
    // Step 1: Check basic circularity
    const isCircular = this.isCircular(sequence);

    if (!isCircular) {
      return {
        isCircular: false,
        capType: null,
        sliceSize: null,
        confidence: "accidental",
      };
    }

    const beats = sequence.beats;

    // Too short to be a CAP
    if (!beats || beats.length < 2) {
      return {
        isCircular: true,
        capType: null,
        sliceSize: null,
        confidence: "accidental",
      };
    }

    // Step 2: Determine slice size
    const sliceSize = this.determineSliceSize(beats);

    // Step 3: Detect individual components
    const detectedComponents = new Set<CAPComponent>();

    if (this.detectsRotation(beats, sliceSize)) {
      detectedComponents.add(CAPComponent.ROTATED);
    }
    if (this.detectsMirroring(beats)) {
      detectedComponents.add(CAPComponent.MIRRORED);
    }
    if (this.detectsSwapping(beats)) {
      detectedComponents.add(CAPComponent.SWAPPED);
    }
    if (this.detectsInversion(beats)) {
      detectedComponents.add(CAPComponent.INVERTED);
    }

    // Step 4: Map components to CAP type
    let capType: CAPType | null = null;
    let confidence: "strict" | "probable" | "accidental" = "accidental";

    if (detectedComponents.size > 0) {
      if (this.capTypeService.isImplemented(detectedComponents)) {
        capType = this.capTypeService.generateCAPType(detectedComponents);
        confidence = "strict";
      } else {
        // Has components but combination not implemented
        confidence = "probable";
      }
    }

    return {
      isCircular: true,
      capType,
      sliceSize: detectedComponents.has(CAPComponent.ROTATED)
        ? sliceSize
        : null,
      confidence,
    };
  }

  /**
   * Batch detect CAP types for multiple sequences
   */
  async batchDetect(sequences: SequenceData[]): Promise<CAPDetectionResult[]> {
    const results: CAPDetectionResult[] = [];
    const CHUNK_SIZE = 50;

    for (let i = 0; i < sequences.length; i += CHUNK_SIZE) {
      const chunk = sequences.slice(i, i + CHUNK_SIZE);
      const chunkResults = chunk.map((seq) => this.detectCAPType(seq));
      results.push(...chunkResults);

      // Yield to event loop between chunks
      if (i + CHUNK_SIZE < sequences.length) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    return results;
  }

  /**
   * Quick check if a sequence is circular
   */
  isCircular(sequence: SequenceData): boolean {
    return this.loopabilityChecker.isSeamlesslyLoopable(sequence);
  }

  /**
   * Determine slice size based on sequence length and position patterns
   *
   * Key insight: For quartered rotation, compare START positions of first beat
   * of each quarter. If q1→q2→q3→q4 follows 90° rotation, it's quartered.
   */
  private determineSliceSize(beats: readonly BeatData[]): SliceSize {
    const length = beats.length;

    // Check quartered FIRST (more specific)
    if (length >= 4 && length % 4 === 0) {
      if (this.detectsQuarteredRotation(beats)) {
        return SliceSize.QUARTERED;
      }
    }

    // Default to halved
    return SliceSize.HALVED;
  }

  /**
   * Detect quartered (90°) rotation by comparing START positions of each quarter
   */
  private detectsQuarteredRotation(beats: readonly BeatData[]): boolean {
    const length = beats.length;
    if (length < 4 || length % 4 !== 0) return false;

    const quarterLength = length / 4;

    // Get start positions of first beat of each quarter
    const q1Start = beats[0]?.startPosition;
    const q2Start = beats[quarterLength]?.startPosition;
    const q3Start = beats[quarterLength * 2]?.startPosition;
    const q4Start = beats[quarterLength * 3]?.startPosition;

    if (!q1Start || !q2Start || !q3Start || !q4Start) return false;

    // Check clockwise rotation: q1 → q2 → q3 → q4 follows QUARTER_CW
    const cwMatch =
      QUARTER_POSITION_MAP_CW[q1Start as GridPosition] === q2Start &&
      QUARTER_POSITION_MAP_CW[q2Start as GridPosition] === q3Start &&
      QUARTER_POSITION_MAP_CW[q3Start as GridPosition] === q4Start;

    // Check counter-clockwise rotation
    const ccwMatch =
      QUARTER_POSITION_MAP_CCW[q1Start as GridPosition] === q2Start &&
      QUARTER_POSITION_MAP_CCW[q2Start as GridPosition] === q3Start &&
      QUARTER_POSITION_MAP_CCW[q3Start as GridPosition] === q4Start;

    return cwMatch || ccwMatch;
  }

  /**
   * Detect if sequence follows rotation transformation
   *
   * For halved: Compare START position of first beat vs START position of half beat
   * For quartered: Already detected in determineSliceSize via detectsQuarteredRotation
   */
  private detectsRotation(
    beats: readonly BeatData[],
    sliceSize: SliceSize
  ): boolean {
    const length = beats.length;

    // Quartered rotation is detected via slice size determination
    if (sliceSize === SliceSize.QUARTERED) {
      return this.detectsQuarteredRotation(beats);
    }

    // Halved rotation: compare START positions of first beat of each half
    if (sliceSize === SliceSize.HALVED && length >= 2 && length % 2 === 0) {
      const halfLength = length / 2;
      const h1Start = beats[0]?.startPosition;
      const h2Start = beats[halfLength]?.startPosition;

      if (!h1Start || !h2Start) return false;

      // Check if h2 start is 180° rotated from h1 start
      return HALF_POSITION_MAP[h1Start as GridPosition] === h2Start;
    }

    return false;
  }

  /**
   * Detect if sequence follows mirroring transformation
   */
  private detectsMirroring(beats: readonly BeatData[]): boolean {
    const length = beats.length;
    if (length < 2 || length % 2 !== 0) return false;

    const halfLength = length / 2;

    // Check if position pattern matches vertical mirror
    for (let i = 0; i < halfLength; i++) {
      const firstBeat = beats[i];
      const secondBeat = beats[halfLength + i];

      if (!firstBeat?.endPosition || !secondBeat?.endPosition) continue;

      const expectedPosition =
        VERTICAL_MIRROR_POSITION_MAP[firstBeat.endPosition as GridPosition];

      if (secondBeat.endPosition !== expectedPosition) {
        return false;
      }
    }

    return true;
  }

  /**
   * Detect if sequence follows swapping transformation (blue/red exchange)
   *
   * Key insight: Only detect swap if hands have different motion types.
   * If both hands have the same motion type, swapping is meaningless
   * and would cause false positives (e.g., AKIΦ being detected as swapped).
   */
  private detectsSwapping(beats: readonly BeatData[]): boolean {
    const length = beats.length;
    if (length < 2 || length % 2 !== 0) return false;

    const halfLength = length / 2;
    let swapCount = 0;
    let checkCount = 0;
    let hasDifferentMotionTypes = false;

    for (let i = 0; i < Math.min(halfLength, 4); i++) {
      const firstBeat = beats[i];
      const secondBeat = beats[halfLength + i];

      const firstBlue = firstBeat?.motions?.[MotionColor.BLUE];
      const firstRed = firstBeat?.motions?.[MotionColor.RED];
      const secondBlue = secondBeat?.motions?.[MotionColor.BLUE];
      const secondRed = secondBeat?.motions?.[MotionColor.RED];

      if (firstBlue && firstRed && secondBlue && secondRed) {
        checkCount++;

        // Check if hands have different motion types (meaningful swap)
        if (firstBlue.motionType !== firstRed.motionType) {
          hasDifferentMotionTypes = true;
        }

        // Second blue should match first red, second red should match first blue
        if (
          secondBlue.motionType === firstRed.motionType &&
          secondRed.motionType === firstBlue.motionType
        ) {
          swapCount++;
        }
      }
    }

    // Only report swap if:
    // 1. Majority of beats show swap pattern
    // 2. Hands have different motion types (swap is meaningful)
    return (
      checkCount > 0 && swapCount >= checkCount * 0.75 && hasDifferentMotionTypes
    );
  }

  /**
   * Detect if sequence follows inversion transformation (complementary motion types)
   */
  private detectsInversion(beats: readonly BeatData[]): boolean {
    const length = beats.length;
    if (length < 2 || length % 2 !== 0) return false;

    const halfLength = length / 2;

    for (let i = 0; i < halfLength; i++) {
      const firstBeat = beats[i];
      const secondBeat = beats[halfLength + i];

      if (!firstBeat || !secondBeat) continue;

      // Check letter inversion if both have letters
      if (firstBeat.letter && secondBeat.letter) {
        const expectedLetter = INVERTED_LETTER_MAP[firstBeat.letter];
        if (expectedLetter && secondBeat.letter !== expectedLetter) {
          return false;
        }
      }

      // Check motion type inversion (PRO <-> ANTI)
      const firstBlue = firstBeat.motions?.[MotionColor.BLUE];
      const secondBlue = secondBeat.motions?.[MotionColor.BLUE];
      const firstRed = firstBeat.motions?.[MotionColor.RED];
      const secondRed = secondBeat.motions?.[MotionColor.RED];

      if (firstBlue && secondBlue) {
        if (
          !this.isMotionTypeInverted(
            firstBlue.motionType,
            secondBlue.motionType
          )
        ) {
          return false;
        }
      }

      if (firstRed && secondRed) {
        if (
          !this.isMotionTypeInverted(firstRed.motionType, secondRed.motionType)
        ) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check if two motion types are inverted pairs
   */
  private isMotionTypeInverted(type1: MotionType, type2: MotionType): boolean {
    // PRO and ANTI are inverted pairs
    if (type1 === MotionType.PRO && type2 === MotionType.ANTI) return true;
    if (type1 === MotionType.ANTI && type2 === MotionType.PRO) return true;

    // STATIC, FLOAT, DASH are self-inverted
    if (type1 === type2) {
      return [MotionType.STATIC, MotionType.FLOAT, MotionType.DASH].includes(
        type1
      );
    }

    return false;
  }
}

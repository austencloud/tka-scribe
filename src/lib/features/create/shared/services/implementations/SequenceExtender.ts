/**
 * Sequence Extender Implementation
 *
 * Detects when a sequence is in an extendable state and generates extension beats
 * using the LOOP (Linked Offset Operation Pattern) executor infrastructure.
 */

import { injectable, inject } from "inversify";
import { TYPES } from "$lib/shared/inversify/types";
import type { BeatData } from "../../domain/models/BeatData";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import {
  GridPosition,
  GridMode,
} from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";
import type {
  ISequenceExtender,
  ExtensionAnalysis,
  ExtensionOptions,
  ExtensionType,
  LOOPOption,
  CircularizationOption,
  OrientationAlignment,
} from "../contracts/ISequenceExtender";
import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
import type { ILOOPExecutorSelector } from "$lib/features/create/generate/circular/services/contracts/ILOOPExecutorSelector";
import type { IReversalDetector } from "../contracts/IReversalDetector";
import type { ILetterQueryHandler } from "$lib/shared/foundation/services/contracts/data/data-contracts";
import type { IBeatConverter } from "$lib/features/create/generate/shared/services/contracts/IBeatConverter";
import type { IOrientationCalculator } from "$lib/shared/pictograph/prop/services/contracts/IOrientationCalculator";
import { Letter } from "$lib/shared/foundation/domain/models/Letter";
import { recalculateAllOrientations } from "./sequence-transforms/orientation-propagation";
import {
  HALF_POSITION_MAP,
  QUARTER_POSITION_MAP_CW,
  QUARTER_POSITION_MAP_CCW,
  HALVED_LOOPS,
  QUARTERED_LOOPS,
} from "$lib/features/create/generate/circular/domain/constants/circular-position-maps";
import {
  MIRRORED_LOOP_VALIDATION_SET,
  SWAPPED_LOOP_VALIDATION_SET,
  INVERTED_LOOP_VALIDATION_SET,
  MIRRORED_SWAPPED_VALIDATION_SET,
  MIRRORED_INVERTED_VALIDATION_SET,
  ROTATED_SWAPPED_QUARTERED_VALIDATION_SET,
  ROTATED_SWAPPED_HALVED_VALIDATION_SET,
} from "$lib/features/create/generate/circular/domain/constants/strict-loop-position-maps";
import {
  LOOPType,
  LOOP_TYPE_LABELS,
  SliceSize,
} from "$lib/features/create/generate/circular/domain/models/circular-models";

/**
 * LOOP options with icons and descriptions for UI display
 * LOOP = Linked Offset Operation Pattern (TKA's algorithmic extension patterns)
 */
const LOOP_OPTION_CONFIG: Record<
  LOOPType,
  { icon: string; description: string }
> = {
  [LOOPType.STRICT_ROTATED]: {
    icon: "fa-rotate",
    description: "Rotates positions around the grid",
  },
  [LOOPType.STRICT_MIRRORED]: {
    icon: "fa-reflect-horizontal",
    description: "Mirrors positions vertically",
  },
  [LOOPType.STRICT_SWAPPED]: {
    icon: "fa-shuffle",
    description: "Swaps blue and red props",
  },
  [LOOPType.STRICT_INVERTED]: {
    icon: "fa-arrows-up-down",
    description: "Inverts motion directions",
  },
  [LOOPType.SWAPPED_INVERTED]: {
    icon: "fa-arrows-rotate",
    description: "Swaps colors with inverted motion",
  },
  [LOOPType.ROTATED_INVERTED]: {
    icon: "fa-rotate-left",
    description: "Rotates with inverted motion",
  },
  [LOOPType.MIRRORED_SWAPPED]: {
    icon: "fa-clone",
    description: "Mirrors with color swap",
  },
  [LOOPType.MIRRORED_INVERTED]: {
    icon: "fa-arrows-to-line",
    description: "Mirrors with inverted motion",
  },
  [LOOPType.ROTATED_SWAPPED]: {
    icon: "fa-recycle",
    description: "Rotates with color swap",
  },
  [LOOPType.MIRRORED_ROTATED]: {
    icon: "fa-repeat",
    description: "Combines mirroring and rotation",
  },
  [LOOPType.MIRRORED_INVERTED_ROTATED]: {
    icon: "fa-diagram-project",
    description: "Mirror, invert, and rotate",
  },
  [LOOPType.MIRRORED_ROTATED_INVERTED_SWAPPED]: {
    icon: "fa-circle-nodes",
    description: "All four transformations combined",
  },
  [LOOPType.REWOUND]: {
    icon: "fa-backward",
    description: "Appends reversed sequence to double length",
  },
};

@injectable()
export class SequenceExtender implements ISequenceExtender {
  constructor(
    @inject(TYPES.ILOOPExecutorSelector)
    private loopExecutorSelector: ILOOPExecutorSelector,
    @inject(TYPES.IReversalDetector)
    private reversalDetector: IReversalDetector,
    @inject(TYPES.ILetterQueryHandler)
    private letterQueryHandler: ILetterQueryHandler,
    @inject(TYPES.IBeatConverter)
    private beatConverter: IBeatConverter,
    @inject(TYPES.IOrientationCalculator)
    private orientationCalculator: IOrientationCalculator
  ) {}

  /**
   * Analyze a sequence to determine if it can be extended
   */
  analyzeSequence(sequence: SequenceData): ExtensionAnalysis {
    // Get start position from sequence
    const startPosition = this.getStartPosition(sequence);
    if (!startPosition) {
      return {
        canExtend: false,
        extensionType: "not_extendable",
        startPosition: null,
        currentEndPosition: null,
        availableLOOPOptions: [],
        unavailableLOOPOptions: [],
        description: "No start position defined",
      };
    }

    // Get current end position from the last beat
    const currentEndPosition = this.getCurrentEndPosition(sequence);
    if (!currentEndPosition) {
      return {
        canExtend: false,
        extensionType: "not_extendable",
        startPosition,
        currentEndPosition: null,
        availableLOOPOptions: [],
        unavailableLOOPOptions: [],
        description: "No beats in sequence",
      };
    }

    // Check position relationships
    const positionPair = `${startPosition},${currentEndPosition}`;
    const isHalvedValid = HALVED_LOOPS.has(positionPair);
    const isQuarteredValid = QUARTERED_LOOPS.has(positionPair);
    const isAlreadyComplete = currentEndPosition === startPosition;

    // Determine extension type
    let extensionType: ExtensionType = "not_extendable";
    let sliceSize = SliceSize.HALVED;

    if (isAlreadyComplete) {
      extensionType = "already_complete";
    } else if (isHalvedValid) {
      extensionType = "half_rotation";
    } else if (isQuarteredValid) {
      extensionType = "quarter_rotation";
      sliceSize = SliceSize.QUARTERED;
    }

    // Get LOOP options filtered by validity for this position pair
    const { available, unavailable } = this.getLOOPOptionsForPositionPair(
      startPosition,
      currentEndPosition,
      sliceSize
    );

    // Can extend if any LOOP options are available
    const canExtend = available.length > 0;

    if (!canExtend) {
      return {
        canExtend: false,
        extensionType: "not_extendable",
        startPosition,
        currentEndPosition,
        availableLOOPOptions: [],
        unavailableLOOPOptions: unavailable,
        description: "No extension patterns available for this position pair",
      };
    }

    let description = "";
    if (isAlreadyComplete) {
      description = `Sequence is complete - ${available.length} LOOP patterns available to extend`;
    } else if (isHalvedValid) {
      description = `${available.length} patterns available (180° rotation)`;
    } else if (isQuarteredValid) {
      description = `${available.length} patterns available (90° rotation)`;
    }

    return {
      canExtend: true,
      extensionType,
      startPosition,
      currentEndPosition,
      availableLOOPOptions: available,
      unavailableLOOPOptions: unavailable,
      description,
    };
  }

  /**
   * Get LOOP options filtered by validity for a position pair
   * LOOP = Linked Offset Operation Pattern
   */
  private getLOOPOptionsForPositionPair(
    startPosition: GridPosition,
    endPosition: GridPosition,
    sliceSize: SliceSize
  ): { available: LOOPOption[]; unavailable: LOOPOption[] } {
    const available: LOOPOption[] = [];
    const unavailable: LOOPOption[] = [];
    const positionPair = `${startPosition},${endPosition}`;

    // All supported LOOP types
    const supportedTypes = [
      LOOPType.STRICT_ROTATED,
      LOOPType.STRICT_MIRRORED,
      LOOPType.STRICT_SWAPPED,
      LOOPType.STRICT_INVERTED,
      LOOPType.SWAPPED_INVERTED,
      LOOPType.ROTATED_INVERTED,
      LOOPType.MIRRORED_SWAPPED,
      LOOPType.MIRRORED_INVERTED,
      LOOPType.ROTATED_SWAPPED,
      LOOPType.MIRRORED_ROTATED,
      LOOPType.MIRRORED_INVERTED_ROTATED,
      LOOPType.MIRRORED_ROTATED_INVERTED_SWAPPED,
      LOOPType.REWOUND,
    ];

    for (const loopType of supportedTypes) {
      if (!this.loopExecutorSelector.isSupported(loopType)) {
        continue;
      }

      const config = LOOP_OPTION_CONFIG[loopType];
      const option: LOOPOption = {
        loopType,
        name: LOOP_TYPE_LABELS[loopType],
        description: config.description,
        icon: config.icon,
      };

      // Check if this LOOP type is valid for the position pair
      if (this.isLOOPValidForPositionPair(loopType, positionPair, sliceSize)) {
        available.push(option);
      } else {
        unavailable.push(option);
      }
    }

    return { available, unavailable };
  }

  /**
   * Check if a LOOP type is valid for a given position pair
   * LOOP = Linked Offset Operation Pattern
   */
  private isLOOPValidForPositionPair(
    loopType: LOOPType,
    positionPair: string,
    sliceSize: SliceSize
  ): boolean {
    // Rotated LOOPs use rotation-based validation
    const rotationSet =
      sliceSize === SliceSize.QUARTERED ? QUARTERED_LOOPS : HALVED_LOOPS;

    // Rotated+Swapped LOOPs need composed validation (rotation THEN swap)
    const rotatedSwappedSet =
      sliceSize === SliceSize.QUARTERED
        ? ROTATED_SWAPPED_QUARTERED_VALIDATION_SET
        : ROTATED_SWAPPED_HALVED_VALIDATION_SET;

    switch (loopType) {
      // Pure rotation-based LOOPs (no swap component)
      case LOOPType.STRICT_ROTATED:
      case LOOPType.ROTATED_INVERTED:
        return rotationSet.has(positionPair);

      // Rotated + Swapped: end must be SWAPPED(ROTATED(start))
      case LOOPType.ROTATED_SWAPPED:
        return rotatedSwappedSet.has(positionPair);

      // Pure mirror-based LOOPs (no rotation component)
      case LOOPType.STRICT_MIRRORED:
      case LOOPType.MIRRORED_INVERTED:
        return MIRRORED_LOOP_VALIDATION_SET.has(positionPair);

      // Mirrored + Swapped (uses composed validation set)
      case LOOPType.MIRRORED_SWAPPED:
        return MIRRORED_SWAPPED_VALIDATION_SET.has(positionPair);

      // Compound LOOPs containing ROTATED - need BOTH mirror AND rotation validation
      case LOOPType.MIRRORED_ROTATED:
      case LOOPType.MIRRORED_INVERTED_ROTATED:
      case LOOPType.MIRRORED_ROTATED_INVERTED_SWAPPED:
        return (
          MIRRORED_LOOP_VALIDATION_SET.has(positionPair) &&
          rotationSet.has(positionPair)
        );

      // Swap-based LOOPs
      case LOOPType.STRICT_SWAPPED:
      case LOOPType.SWAPPED_INVERTED:
        return SWAPPED_LOOP_VALIDATION_SET.has(positionPair);

      // Invert-only LOOP (needs same start/end position)
      case LOOPType.STRICT_INVERTED:
        return INVERTED_LOOP_VALIDATION_SET.has(positionPair);

      // Rewound LOOP - always valid (works on any sequence regardless of positions)
      case LOOPType.REWOUND:
        return true;

      default:
        // Unknown LOOP type - assume not valid
        return false;
    }
  }

  /**
   * Get available LOOP options for a given slice size (legacy - kept for compatibility)
   */
  private getAvailableLOOPOptions(sliceSize: SliceSize): LOOPOption[] {
    const options: LOOPOption[] = [];

    // All supported LOOP types
    const supportedTypes = [
      LOOPType.STRICT_ROTATED,
      LOOPType.STRICT_MIRRORED,
      LOOPType.STRICT_SWAPPED,
      LOOPType.STRICT_INVERTED,
      LOOPType.SWAPPED_INVERTED,
      LOOPType.ROTATED_INVERTED,
      LOOPType.MIRRORED_SWAPPED,
      LOOPType.MIRRORED_INVERTED,
      LOOPType.ROTATED_SWAPPED,
      LOOPType.MIRRORED_ROTATED,
      LOOPType.MIRRORED_INVERTED_ROTATED,
      LOOPType.MIRRORED_ROTATED_INVERTED_SWAPPED,
      LOOPType.REWOUND,
    ];

    for (const loopType of supportedTypes) {
      if (this.loopExecutorSelector.isSupported(loopType)) {
        const config = LOOP_OPTION_CONFIG[loopType];
        options.push({
          loopType,
          name: LOOP_TYPE_LABELS[loopType],
          description: config.description,
          icon: config.icon,
        });
      }
    }

    return options;
  }

  /**
   * Generate beats to extend a sequence back to its starting position
   */
  async generateExtensionBeats(
    sequence: SequenceData,
    options: ExtensionOptions
  ): Promise<BeatData[]> {
    const analysis = this.analyzeSequence(sequence);

    if (!analysis.canExtend) {
      throw new Error(`Cannot extend: ${analysis.description}`);
    }

    const { loopType } = options;
    const sliceSize =
      analysis.extensionType === "quarter_rotation"
        ? SliceSize.QUARTERED
        : SliceSize.HALVED;

    // Get the executor for the selected LOOP type
    const executor = this.loopExecutorSelector.getExecutor(loopType);

    // Convert sequence to BeatData array for the executor
    const sequenceBeats = this.convertSequenceToBeats(sequence);

    if (sequenceBeats.length === 0) {
      throw new Error("No beats in sequence to extend");
    }

    // IMPORTANT: Save original length BEFORE executing, since executor modifies array in place
    const originalLength = sequenceBeats.length;

    // Execute the LOOP transformation (modifies sequenceBeats in place)
    const completedBeats = executor.executeLOOP(sequenceBeats, sliceSize);

    // Return only the new beats (after the original sequence)
    const newBeats = completedBeats.slice(originalLength);

    return newBeats;
  }

  /**
   * Extend a sequence by appending the generated extension beats
   */
  async extendSequence(
    sequence: SequenceData,
    options: ExtensionOptions
  ): Promise<SequenceData> {
    const extensionBeats = await this.generateExtensionBeats(sequence, options);

    if (extensionBeats.length === 0) {
      return sequence;
    }

    // Renumber the extension beats to continue from the existing sequence
    const existingBeatCount = sequence.beats?.length || 0;
    const renumberedBeats = extensionBeats.map((beat, index) => ({
      ...beat,
      beatNumber: existingBeatCount + index + 1,
    }));

    // Combine existing beats with extension beats
    const newBeats = [...(sequence.beats || []), ...renumberedBeats];

    const extendedSequence: SequenceData = {
      ...sequence,
      beats: newBeats,
      isCircular: true,
      loopType: options.loopType,
    };

    // Process reversals for the extended sequence
    // This detects rotation direction changes between consecutive beats
    return this.reversalDetector.processReversals(extendedSequence);
  }

  // ============ Private Helper Methods ============

  private getStartPosition(sequence: SequenceData): GridPosition | null {
    // Check for explicit start position data object
    if (sequence.startPosition) {
      const startPosData = sequence.startPosition as unknown as Record<
        string,
        unknown
      >;

      // Internal format: startPosition field
      if ("startPosition" in startPosData && startPosData.startPosition) {
        return startPosData.startPosition as GridPosition;
      }
      // External/JSON format: start field
      if ("start" in startPosData && startPosData.start) {
        return startPosData.start as GridPosition;
      }
      // gridPosition field (StartPositionData format)
      if ("gridPosition" in startPosData && startPosData.gridPosition) {
        return startPosData.gridPosition as GridPosition;
      }
    }

    // Check for startingPositionBeat (legacy field)
    const startBeat = sequence.startingPositionBeat as
      | Record<string, unknown>
      | undefined;
    if (startBeat) {
      if ("startPosition" in startBeat && startBeat.startPosition) {
        return startBeat.startPosition as GridPosition;
      }
      if ("start" in startBeat && startBeat.start) {
        return startBeat.start as GridPosition;
      }
    }

    // Check first beat (beat 0) if it's the start position
    const beats = sequence.beats || [];
    const firstBeat = beats.find(
      (b) =>
        b.beatNumber === 0 ||
        (b as unknown as Record<string, unknown>).beat === 0
    );
    if (firstBeat) {
      const beatData = firstBeat as unknown as Record<string, unknown>;
      if (beatData.startPosition) {
        return beatData.startPosition as GridPosition;
      }
      if (beatData.start) {
        return beatData.start as GridPosition;
      }
    }

    return null;
  }

  private getCurrentEndPosition(sequence: SequenceData): GridPosition | null {
    const beats = sequence.beats || [];
    if (beats.length === 0) return null;

    // Helper to get beat number from either format
    const getBeatNumber = (beat: Record<string, unknown>): number => {
      if (typeof beat.beatNumber === "number") return beat.beatNumber;
      if (typeof beat.beat === "number") return beat.beat;
      return 0;
    };

    // Helper to get end position from either format
    const getEndPosition = (beat: Record<string, unknown>): string | null => {
      if (beat.endPosition) return beat.endPosition as string;
      if (beat.end) return beat.end as string;
      return null;
    };

    // Find the last actual beat (not the start position beat 0)
    const beatsAsRecords = beats as unknown as Record<string, unknown>[];
    const sortedBeats = [...beatsAsRecords].sort(
      (a, b) => getBeatNumber(b) - getBeatNumber(a)
    );
    const lastBeat =
      sortedBeats.find((b) => getBeatNumber(b) > 0) || sortedBeats[0];

    if (lastBeat) {
      const endPos = getEndPosition(lastBeat);
      if (endPos) {
        return endPos as GridPosition;
      }
    }

    return null;
  }

  private canFindExtensionPath(
    fromPosition: GridPosition,
    toPosition: GridPosition
  ): boolean {
    // Check if positions are in the same group (alpha, beta, gamma)
    const fromGroup = this.getPositionGroup(fromPosition);
    const toGroup = this.getPositionGroup(toPosition);

    return fromGroup === toGroup && fromGroup !== null;
  }

  private getPositionGroup(
    position: GridPosition
  ): "alpha" | "beta" | "gamma" | null {
    const posStr = position.toLowerCase();
    if (posStr.startsWith("alpha")) return "alpha";
    if (posStr.startsWith("beta")) return "beta";
    if (posStr.startsWith("gamma")) return "gamma";
    return null;
  }

  /**
   * Extract the numeric part of a position (e.g., "alpha3" → 3)
   */
  private getPositionNumber(position: GridPosition): number | null {
    const match = position.match(/(\d+)$/);
    return match && match[1] ? parseInt(match[1], 10) : null;
  }

  /**
   * Calculate the rotation relationship between two positions in the same group.
   *
   * For alpha/beta (4 positions: 1, 3, 5, 7):
   * - Same number = exact (0°)
   * - Difference of 2 = quarter (90°)
   * - Difference of 4 = half (180°)
   *
   * For gamma (8 positions: 1, 3, 5, 7, 9, 11, 13, 15):
   * - Same number = exact (0°)
   * - Difference of 4 = quarter (90°)
   * - Difference of 8 = half (180°)
   */
  private getRotationRelation(
    startPosition: GridPosition,
    endPosition: GridPosition
  ): "exact" | "quarter" | "half" | null {
    const startGroup = this.getPositionGroup(startPosition);
    const endGroup = this.getPositionGroup(endPosition);

    // Must be in same group
    if (!startGroup || !endGroup || startGroup !== endGroup) {
      return null;
    }

    const startNum = this.getPositionNumber(startPosition);
    const endNum = this.getPositionNumber(endPosition);

    if (startNum === null || endNum === null) {
      return null;
    }

    // Same position = exact
    if (startNum === endNum) {
      return "exact";
    }

    // Calculate the difference (accounting for circular wraparound)
    const isGamma = startGroup === "gamma";
    const totalPositions = isGamma ? 16 : 8; // gamma has 8 positions (1-15 odd), alpha/beta have 4 (1-7 odd)
    const quarterStep = isGamma ? 4 : 2;     // 90° step
    const halfStep = isGamma ? 8 : 4;        // 180° step

    // Calculate absolute difference, accounting for wraparound
    let diff = Math.abs(endNum - startNum);
    if (diff > totalPositions / 2) {
      diff = totalPositions - diff;
    }

    if (diff === halfStep) {
      return "half";
    }
    if (diff === quarterStep || diff === quarterStep * 3) {
      return "quarter";
    }

    // Fallback - shouldn't happen for valid positions
    return "quarter";
  }

  /**
   * Get the starting orientations from a sequence's start position.
   * Returns null if start position data is not available.
   */
  private getStartOrientations(
    sequence: SequenceData
  ): { blueOri: string; redOri: string } | null {
    const startPosData = sequence.startPosition || sequence.startingPositionBeat;
    if (!startPosData) return null;

    // Extract orientations from motion data
    const motions = (startPosData as any).motions;
    if (!motions) {
      // Try legacy format with direct blue/red properties
      const blueData = (startPosData as any).blue;
      const redData = (startPosData as any).red;
      if (blueData?.endOri && redData?.endOri) {
        return {
          blueOri: blueData.endOri,
          redOri: redData.endOri,
        };
      }
      return null;
    }

    const blueMotion = motions.blue;
    const redMotion = motions.red;

    if (!blueMotion?.endOri || !redMotion?.endOri) {
      return null;
    }

    return {
      blueOri: blueMotion.endOri,
      redOri: redMotion.endOri,
    };
  }

  /**
   * Calculate how many steps an orientation needs to return to its original.
   * Orientations cycle: in → clock → out → counter → in (4 states)
   *
   * @param startOri Original orientation
   * @param endOri Final orientation after one sequence pass
   * @returns Number of passes needed: 1 (same), 2 (opposite), or 4 (quarter-step)
   */
  private calculateOrientationSteps(startOri: string, endOri: string): 1 | 2 | 4 {
    if (startOri === endOri) return 1;

    // Define the orientation cycle
    const cycle = ["in", "clock", "out", "counter"];
    const startIdx = cycle.indexOf(startOri);
    const endIdx = cycle.indexOf(endOri);

    // If either orientation isn't in the cycle, assume they match (conservative)
    if (startIdx === -1 || endIdx === -1) return 1;

    const diff = (endIdx - startIdx + 4) % 4;

    // diff === 0: same orientation (1 repetition)
    // diff === 2: opposite orientation (2 repetitions to flip back)
    // diff === 1 or 3: quarter-step (4 repetitions)
    if (diff === 0) return 1;
    if (diff === 2) return 2;
    return 4;
  }

  /**
   * Calculate orientation alignment between sequence start and a potential end position.
   * Used for "exact position" options to show how many repetitions are needed.
   *
   * @param sequence The current sequence
   * @param bridgePictograph The pictograph data for the bridge letter
   * @returns OrientationAlignment info or null if can't be calculated
   */
  private calculateOrientationAlignment(
    sequence: SequenceData,
    bridgePictograph: PictographData
  ): OrientationAlignment | null {
    // Get start orientations
    const startOris = this.getStartOrientations(sequence);
    if (!startOris) return null;

    // Get end orientations from bridge pictograph
    const blueMotion = bridgePictograph.motions?.blue;
    const redMotion = bridgePictograph.motions?.red;

    if (!blueMotion?.endOrientation || !redMotion?.endOrientation) return null;

    const blueEndOri = blueMotion.endOrientation;
    const redEndOri = redMotion.endOrientation;

    // Calculate steps needed for each prop
    const blueSteps = this.calculateOrientationSteps(startOris.blueOri, blueEndOri);
    const redSteps = this.calculateOrientationSteps(startOris.redOri, redEndOri);

    // Need LCM of both steps (if blue needs 2 and red needs 4, we need 4 total)
    const repetitionsNeeded = Math.max(blueSteps, redSteps) as 1 | 2 | 4;

    return {
      matches: blueEndOri === startOris.blueOri && redEndOri === startOris.redOri,
      blueEndOri,
      redEndOri,
      blueStartOri: startOris.blueOri,
      redStartOri: startOris.redOri,
      repetitionsNeeded,
    };
  }

  /**
   * Calculate the resulting sequence length after applying a LOOP.
   *
   * @param currentLength Current sequence length (number of beats)
   * @param rotationRelation The rotation relation (exact, half, quarter)
   * @param repetitionsNeeded For exact position, how many repetitions needed for orientation
   * @returns The final sequence length
   */
  private calculateResultingLength(
    currentLength: number,
    rotationRelation: "exact" | "half" | "quarter" | null,
    repetitionsNeeded: 1 | 2 | 4 = 1
  ): number {
    // Add 1 for the bridge letter itself
    const withBridge = currentLength + 1;

    switch (rotationRelation) {
      case "half":
        // 180° rotation = 2x sequence length
        return withBridge * 2;
      case "quarter":
        // 90° rotation = 4x sequence length
        return withBridge * 4;
      case "exact":
        // Exact position = multiply by repetitions needed for orientation alignment
        return withBridge * repetitionsNeeded;
      default:
        return withBridge;
    }
  }

  /**
   * Convert a SequenceData to BeatData array for LOOP executor
   * The LOOP executor expects: [startPosition (beat 0), beat 1, beat 2, ...]
   */
  private convertSequenceToBeats(sequence: SequenceData): BeatData[] {
    const beats = sequence.beats || [];
    const result: BeatData[] = [];

    // Check if beat 0 (start position) is already in beats array
    const beat0 = beats.find((b) => b.beatNumber === 0);

    if (beat0) {
      // Beat 0 exists in the array, just sort and return
      return [...beats]
        .filter((b) => b.beatNumber >= 0)
        .sort((a, b) => a.beatNumber - b.beatNumber);
    }

    // Beat 0 not in array - need to create it from startPosition/startingPositionBeat
    const startPosData =
      sequence.startPosition || sequence.startingPositionBeat;

    if (startPosData) {
      const startPos = this.getStartPosition(sequence);
      // Create a beat 0 entry from the start position data
      const startBeat: BeatData = {
        id: "start-position",
        beatNumber: 0,
        startPosition: startPos,
        endPosition: startPos, // Start position ends where it starts
        letter: null,
        motions: (startPosData as any).motions || {},
        duration: 1,
        blueReversal: false,
        redReversal: false,
        isBlank: false,
      };
      result.push(startBeat);
    }

    // Add all actual beats (beat 1+)
    const actualBeats = beats
      .filter((b) => b.beatNumber > 0)
      .sort((a, b) => a.beatNumber - b.beatNumber);

    result.push(...actualBeats);

    return result;
  }

  // ============ Bridge Letter Methods ============

  /**
   * Get circularization options for a sequence that isn't directly loopable.
   * Returns bridge letter options that would bring the sequence to a loopable position.
   */
  async getCircularizationOptions(
    sequence: SequenceData
  ): Promise<CircularizationOption[]> {
    const startPosition = this.getStartPosition(sequence);
    const endPosition = this.getCurrentEndPosition(sequence);

    if (!startPosition || !endPosition) {
      return [];
    }

    // Get position groups
    const startGroup = this.getPositionGroup(startPosition);
    const endGroup = this.getPositionGroup(endPosition);

    // If already in same group, no bridge needed (use regular extension)
    if (!startGroup || !endGroup || startGroup === endGroup) {
      return [];
    }

    const options: CircularizationOption[] = [];
    const gridMode = sequence.gridMode || GridMode.DIAMOND;

    // Get all pictographs
    const allPictographs =
      await this.letterQueryHandler.getAllPictographVariations(gridMode);

    // Find pictographs that:
    // 1. Start at the sequence's current end position
    // 2. End at a position in the start group
    const bridgeCandidates = allPictographs.filter((p) => {
      if (p.startPosition !== endPosition) return false;
      const pEndGroup = this.getPositionGroup(p.endPosition as GridPosition);
      return pEndGroup === startGroup;
    });

    if (bridgeCandidates.length === 0) {
      return [];
    }

    // Group candidates by letter and ending position to avoid duplicates
    // Store the pictograph data for visual display in the UI
    const uniqueBridges = new Map<
      string,
      { letter: Letter; endPosition: string; pictographData: PictographData }
    >();
    for (const variation of bridgeCandidates) {
      const key = `${variation.letter}|${variation.endPosition}`;
      if (!uniqueBridges.has(key)) {
        uniqueBridges.set(key, {
          letter: variation.letter as Letter,
          endPosition: variation.endPosition || "",
          pictographData: variation,
        });
      }
    }

    // For each unique bridge, analyze available LOOPs
    for (const [_, bridge] of uniqueBridges) {
      // Create temporary beat for the bridge letter
      const bridgeBeat: BeatData = {
        id: `bridge-${bridge.letter}`,
        beatNumber: (sequence.beats?.length || 0) + 1,
        startPosition: endPosition,
        endPosition: bridge.endPosition as GridPosition,
        letter: bridge.letter,
        motions: {},
        duration: 1,
        blueReversal: false,
        redReversal: false,
        isBlank: false,
      };

      // Create temporary sequence with bridge letter
      const tempSequence: SequenceData = {
        ...sequence,
        beats: [...(sequence.beats || []), bridgeBeat],
      };

      // Analyze available LOOPs (exclude REWOUND since it's always available)
      const analysis = this.analyzeSequence(tempSequence);
      const positionDependentLOOPs = analysis.availableLOOPOptions.filter(
        (opt) => opt.loopType !== LOOPType.REWOUND
      );

      if (positionDependentLOOPs.length > 0) {
        options.push({
          bridgeLetters: [bridge.letter],
          endPosition: bridge.endPosition,
          availableLOOPs: positionDependentLOOPs,
          description: `Add "${bridge.letter}" to end at ${bridge.endPosition}`,
          pictographData: bridge.pictographData,
        });
      }
    }

    return options;
  }

  /**
   * Get extension options that would bring the sequence to a loopable position.
   * Only returns pictographs that END in the same position GROUP as the sequence starts.
   * For example: if sequence starts at alpha3, only show letters that end in alpha1/3/5/7.
   * Used for pictograph-first UX.
   */
  async getAllExtensionOptions(
    sequence: SequenceData
  ): Promise<CircularizationOption[]> {
    const startPosition = this.getStartPosition(sequence);
    const endPosition = this.getCurrentEndPosition(sequence);

    if (!startPosition || !endPosition) {
      return [];
    }

    // Extract the position GROUP from start position (alpha, beta, gamma)
    const startGroup = this.getPositionGroup(startPosition);
    if (!startGroup) {
      return [];
    }

    const options: CircularizationOption[] = [];
    const gridMode = sequence.gridMode || GridMode.DIAMOND;

    // Get all pictographs
    const allPictographs =
      await this.letterQueryHandler.getAllPictographVariations(gridMode);

    // Find pictographs that:
    // 1. Start at the sequence's current end position
    // 2. End in the SAME position group as the sequence start (for loopability)
    const extensionCandidates = allPictographs.filter((p) => {
      if (p.startPosition !== endPosition) return false;
      // Check if end position is in the same group as start
      const endGroup = this.getPositionGroup(p.endPosition as GridPosition);
      return endGroup === startGroup;
    });

    if (extensionCandidates.length === 0) {
      return [];
    }

    // Group candidates by letter and ending position to avoid duplicates
    // Store the pictograph data for visual display in the UI
    const uniqueExtensions = new Map<
      string,
      { letter: Letter; endPosition: string; pictographData: PictographData }
    >();
    for (const variation of extensionCandidates) {
      const key = `${variation.letter}|${variation.endPosition}`;
      if (!uniqueExtensions.has(key)) {
        uniqueExtensions.set(key, {
          letter: variation.letter as Letter,
          endPosition: variation.endPosition || "",
          pictographData: variation,
        });
      }
    }

    // For each unique extension, analyze available LOOPs
    for (const [_, extension] of uniqueExtensions) {
      // Create temporary beat for the extension letter
      const extensionBeat: BeatData = {
        id: `ext-${extension.letter}`,
        beatNumber: (sequence.beats?.length || 0) + 1,
        startPosition: endPosition,
        endPosition: extension.endPosition as GridPosition,
        letter: extension.letter,
        motions: {},
        duration: 1,
        blueReversal: false,
        redReversal: false,
        isBlank: false,
      };

      // Create temporary sequence with extension letter
      const tempSequence: SequenceData = {
        ...sequence,
        beats: [...(sequence.beats || []), extensionBeat],
      };

      // Analyze available LOOPs for this extended sequence
      const analysis = this.analyzeSequence(tempSequence);

      // Include all LOOPs (REWOUND is universal, others require position alignment)
      const availableLOOPs = analysis.availableLOOPOptions;

      if (availableLOOPs.length > 0) {
        // Calculate rotation relationship between start and this extension's end
        const rotationRelation = this.getRotationRelation(
          startPosition,
          extension.endPosition as GridPosition
        );

        // Current sequence length (number of beats, not counting start position)
        const currentLength = sequence.beats?.length || 0;

        // For exact position matches, calculate orientation alignment
        let orientationAlignment: OrientationAlignment | undefined;
        let repetitionsNeeded: 1 | 2 | 4 = 1;

        if (rotationRelation === "exact") {
          orientationAlignment = this.calculateOrientationAlignment(
            sequence,
            extension.pictographData
          ) || undefined;
          repetitionsNeeded = orientationAlignment?.repetitionsNeeded || 1;
        }

        // Calculate resulting sequence length
        const resultingLength = this.calculateResultingLength(
          currentLength,
          rotationRelation,
          repetitionsNeeded
        );

        options.push({
          bridgeLetters: [extension.letter],
          endPosition: extension.endPosition,
          availableLOOPs: availableLOOPs,
          description: `Add "${extension.letter}" → ${extension.endPosition}`,
          pictographData: extension.pictographData,
          rotationRelation: rotationRelation || undefined,
          orientationAlignment,
          currentLength,
          resultingLength,
        });
      }
    }

    return options;
  }

  /**
   * Append just a bridge beat to a sequence (without applying LOOP).
   * Used when user selects a bridge pictograph and wants to see it in the sequence
   * before choosing which LOOP to apply.
   */
  async appendBridgeBeat(
    sequence: SequenceData,
    bridgeLetter: Letter
  ): Promise<SequenceData> {
    const endPosition = this.getCurrentEndPosition(sequence);
    if (!endPosition) {
      throw new Error("Cannot append bridge: no end position found");
    }

    const gridMode = sequence.gridMode || GridMode.DIAMOND;

    // Find a pictograph for the bridge letter that starts at current end position
    const allPictographs =
      await this.letterQueryHandler.getAllPictographVariations(gridMode);

    const bridgeVariations = allPictographs.filter(
      (p) =>
        p.letter === bridgeLetter && p.startPosition === endPosition
    );

    if (bridgeVariations.length === 0) {
      throw new Error(
        `No variation of "${bridgeLetter}" starts at position "${endPosition}"`
      );
    }

    // Pick a random variation for variety
    const randomIndex = Math.floor(Math.random() * bridgeVariations.length);
    const bridgeVariation = bridgeVariations[randomIndex];
    if (!bridgeVariation) {
      throw new Error("Failed to select bridge variation");
    }

    // Convert to beat and append
    const bridgeBeat = this.beatConverter.convertToBeat(
      bridgeVariation,
      (sequence.beats?.length || 0) + 1,
      gridMode
    );

    // Create sequence with bridge letter
    let extendedSequence: SequenceData = {
      ...sequence,
      beats: [...(sequence.beats || []), bridgeBeat],
    };

    // Recalculate orientations
    extendedSequence = recalculateAllOrientations(
      extendedSequence,
      this.orientationCalculator
    );

    return extendedSequence;
  }

  /**
   * Extend a sequence by first appending a bridge letter, then applying a LOOP.
   */
  async extendWithBridge(
    sequence: SequenceData,
    bridgeLetter: Letter,
    loopType: LOOPType
  ): Promise<SequenceData> {
    // Use appendBridgeBeat to add the bridge, then apply LOOP
    const sequenceWithBridge = await this.appendBridgeBeat(sequence, bridgeLetter);
    return this.extendSequence(sequenceWithBridge, { loopType });
  }
}

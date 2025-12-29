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
} from "../contracts/ISequenceExtender";
import type { ILOOPExecutorSelector } from "$lib/features/create/generate/circular/services/contracts/ILOOPExecutorSelector";
import type { IReversalDetector } from "../contracts/IReversalDetector";
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
    private reversalDetector: IReversalDetector
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
}

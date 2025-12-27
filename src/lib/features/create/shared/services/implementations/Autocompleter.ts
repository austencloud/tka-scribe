/**
 * Autocomplete Service Implementation
 *
 * Detects when a sequence is in a completable state and generates completion beats
 * using the existing CAP (Continuous Assembly Pattern) executor infrastructure.
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
  IAutocompleter,
  AutocompleteAnalysis,
  AutocompleteOptions,
  CompletionType,
  CAPOption,
} from "../contracts/IAutocompleter";
import type { ICAPExecutorSelector } from "$lib/features/create/generate/circular/services/contracts/ICAPExecutorSelector";
import {
  HALF_POSITION_MAP,
  QUARTER_POSITION_MAP_CW,
  QUARTER_POSITION_MAP_CCW,
  HALVED_CAPS,
  QUARTERED_CAPS,
} from "$lib/features/create/generate/circular/domain/constants/circular-position-maps";
import {
  MIRRORED_CAP_VALIDATION_SET,
  SWAPPED_CAP_VALIDATION_SET,
  INVERTED_CAP_VALIDATION_SET,
  MIRRORED_SWAPPED_VALIDATION_SET,
  MIRRORED_INVERTED_VALIDATION_SET,
} from "$lib/features/create/generate/circular/domain/constants/strict-cap-position-maps";
import {
  CAPType,
  CAP_TYPE_LABELS,
  SliceSize,
} from "$lib/features/create/generate/circular/domain/models/circular-models";

/**
 * CAP options with icons and descriptions for UI display
 */
const CAP_OPTION_CONFIG: Record<
  CAPType,
  { icon: string; description: string }
> = {
  [CAPType.STRICT_ROTATED]: {
    icon: "fa-rotate",
    description: "Rotates positions around the grid",
  },
  [CAPType.STRICT_MIRRORED]: {
    icon: "fa-reflect-horizontal",
    description: "Mirrors positions vertically",
  },
  [CAPType.STRICT_SWAPPED]: {
    icon: "fa-shuffle",
    description: "Swaps blue and red props",
  },
  [CAPType.STRICT_INVERTED]: {
    icon: "fa-arrows-up-down",
    description: "Inverts motion directions",
  },
  [CAPType.SWAPPED_INVERTED]: {
    icon: "fa-arrows-rotate",
    description: "Swaps colors with inverted motion",
  },
  [CAPType.ROTATED_INVERTED]: {
    icon: "fa-rotate-left",
    description: "Rotates with inverted motion",
  },
  [CAPType.MIRRORED_SWAPPED]: {
    icon: "fa-clone",
    description: "Mirrors with color swap",
  },
  [CAPType.MIRRORED_INVERTED]: {
    icon: "fa-arrows-to-line",
    description: "Mirrors with inverted motion",
  },
  [CAPType.ROTATED_SWAPPED]: {
    icon: "fa-recycle",
    description: "Rotates with color swap",
  },
  [CAPType.MIRRORED_ROTATED]: {
    icon: "fa-repeat",
    description: "Combines mirroring and rotation",
  },
  [CAPType.MIRRORED_INVERTED_ROTATED]: {
    icon: "fa-diagram-project",
    description: "Mirror, invert, and rotate",
  },
  [CAPType.MIRRORED_ROTATED_INVERTED_SWAPPED]: {
    icon: "fa-circle-nodes",
    description: "All four transformations combined",
  },
};

@injectable()
export class Autocompleter implements IAutocompleter {
  constructor(
    @inject(TYPES.ICAPExecutorSelector)
    private capExecutorSelector: ICAPExecutorSelector
  ) {}

  /**
   * Analyze a sequence to determine if it can be autocompleted
   */
  analyzeSequence(sequence: SequenceData): AutocompleteAnalysis {
    // Get start position from sequence
    const startPosition = this.getStartPosition(sequence);
    if (!startPosition) {
      return {
        canComplete: false,
        completionType: "not_completable",
        startPosition: null,
        currentEndPosition: null,
        availableCAPOptions: [],
        unavailableCAPOptions: [],
        description: "No start position defined",
      };
    }

    // Get current end position from the last beat
    const currentEndPosition = this.getCurrentEndPosition(sequence);
    if (!currentEndPosition) {
      return {
        canComplete: false,
        completionType: "not_completable",
        startPosition,
        currentEndPosition: null,
        availableCAPOptions: [],
        unavailableCAPOptions: [],
        description: "No beats in sequence",
      };
    }

    // Check position relationships
    const positionPair = `${startPosition},${currentEndPosition}`;
    const isHalvedValid = HALVED_CAPS.has(positionPair);
    const isQuarteredValid = QUARTERED_CAPS.has(positionPair);
    const isAlreadyComplete = currentEndPosition === startPosition;

    // Determine completion type
    let completionType: CompletionType = "not_completable";
    let sliceSize = SliceSize.HALVED;

    if (isAlreadyComplete) {
      completionType = "already_complete";
    } else if (isHalvedValid) {
      completionType = "half_rotation";
    } else if (isQuarteredValid) {
      completionType = "quarter_rotation";
      sliceSize = SliceSize.QUARTERED;
    }

    // Get CAP options filtered by validity for this position pair
    const { available, unavailable } = this.getCAPOptionsForPositionPair(
      startPosition,
      currentEndPosition,
      sliceSize
    );

    // Can complete if any CAP options are available
    const canComplete = available.length > 0;

    if (!canComplete) {
      return {
        canComplete: false,
        completionType: "not_completable",
        startPosition,
        currentEndPosition,
        availableCAPOptions: [],
        unavailableCAPOptions: unavailable,
        description: "No completion patterns available for this position pair",
      };
    }

    let description = "";
    if (isAlreadyComplete) {
      description = `Sequence is complete - ${available.length} CAP patterns available to extend`;
    } else if (isHalvedValid) {
      description = `${available.length} patterns available (180° rotation)`;
    } else if (isQuarteredValid) {
      description = `${available.length} patterns available (90° rotation)`;
    }

    return {
      canComplete: true,
      completionType,
      startPosition,
      currentEndPosition,
      availableCAPOptions: available,
      unavailableCAPOptions: unavailable,
      description,
    };
  }

  /**
   * Get CAP options filtered by validity for a position pair
   */
  private getCAPOptionsForPositionPair(
    startPosition: GridPosition,
    endPosition: GridPosition,
    sliceSize: SliceSize
  ): { available: CAPOption[]; unavailable: CAPOption[] } {
    const available: CAPOption[] = [];
    const unavailable: CAPOption[] = [];
    const positionPair = `${startPosition},${endPosition}`;

    // All supported CAP types
    const supportedTypes = [
      CAPType.STRICT_ROTATED,
      CAPType.STRICT_MIRRORED,
      CAPType.STRICT_SWAPPED,
      CAPType.STRICT_INVERTED,
      CAPType.SWAPPED_INVERTED,
      CAPType.ROTATED_INVERTED,
      CAPType.MIRRORED_SWAPPED,
      CAPType.MIRRORED_INVERTED,
      CAPType.ROTATED_SWAPPED,
      CAPType.MIRRORED_ROTATED,
      CAPType.MIRRORED_INVERTED_ROTATED,
      CAPType.MIRRORED_ROTATED_INVERTED_SWAPPED,
    ];

    for (const capType of supportedTypes) {
      if (!this.capExecutorSelector.isSupported(capType)) {
        continue;
      }

      const config = CAP_OPTION_CONFIG[capType];
      const option: CAPOption = {
        capType,
        name: CAP_TYPE_LABELS[capType],
        description: config.description,
        icon: config.icon,
      };

      // Check if this CAP type is valid for the position pair
      if (this.isCAPValidForPositionPair(capType, positionPair, sliceSize)) {
        available.push(option);
      } else {
        unavailable.push(option);
      }
    }

    return { available, unavailable };
  }

  /**
   * Check if a CAP type is valid for a given position pair
   */
  private isCAPValidForPositionPair(
    capType: CAPType,
    positionPair: string,
    sliceSize: SliceSize
  ): boolean {
    // Rotated CAPs use rotation-based validation
    const rotationSet =
      sliceSize === SliceSize.QUARTERED ? QUARTERED_CAPS : HALVED_CAPS;

    switch (capType) {
      // Rotation-based CAPs
      case CAPType.STRICT_ROTATED:
      case CAPType.ROTATED_INVERTED:
      case CAPType.ROTATED_SWAPPED:
        return rotationSet.has(positionPair);

      // Mirror-based CAPs
      case CAPType.STRICT_MIRRORED:
      case CAPType.MIRRORED_SWAPPED:
      case CAPType.MIRRORED_INVERTED:
      case CAPType.MIRRORED_ROTATED:
      case CAPType.MIRRORED_INVERTED_ROTATED:
      case CAPType.MIRRORED_ROTATED_INVERTED_SWAPPED:
        return MIRRORED_CAP_VALIDATION_SET.has(positionPair);

      // Swap-based CAPs
      case CAPType.STRICT_SWAPPED:
      case CAPType.SWAPPED_INVERTED:
        return SWAPPED_CAP_VALIDATION_SET.has(positionPair);

      // Invert-only CAP (needs same start/end position)
      case CAPType.STRICT_INVERTED:
        return INVERTED_CAP_VALIDATION_SET.has(positionPair);

      default:
        // Unknown CAP type - assume not valid
        return false;
    }
  }

  /**
   * Get available CAP options for a given slice size (legacy - kept for compatibility)
   */
  private getAvailableCAPOptions(sliceSize: SliceSize): CAPOption[] {
    const options: CAPOption[] = [];

    // All supported CAP types
    const supportedTypes = [
      CAPType.STRICT_ROTATED,
      CAPType.STRICT_MIRRORED,
      CAPType.STRICT_SWAPPED,
      CAPType.STRICT_INVERTED,
      CAPType.SWAPPED_INVERTED,
      CAPType.ROTATED_INVERTED,
      CAPType.MIRRORED_SWAPPED,
      CAPType.MIRRORED_INVERTED,
      CAPType.ROTATED_SWAPPED,
      CAPType.MIRRORED_ROTATED,
      CAPType.MIRRORED_INVERTED_ROTATED,
      CAPType.MIRRORED_ROTATED_INVERTED_SWAPPED,
    ];

    for (const capType of supportedTypes) {
      if (this.capExecutorSelector.isSupported(capType)) {
        const config = CAP_OPTION_CONFIG[capType];
        options.push({
          capType,
          name: CAP_TYPE_LABELS[capType],
          description: config.description,
          icon: config.icon,
        });
      }
    }

    return options;
  }

  /**
   * Generate beats to complete a sequence back to its starting position
   */
  async generateCompletionBeats(
    sequence: SequenceData,
    options: AutocompleteOptions
  ): Promise<BeatData[]> {
    const analysis = this.analyzeSequence(sequence);

    if (!analysis.canComplete) {
      throw new Error(`Cannot autocomplete: ${analysis.description}`);
    }

    const { capType } = options;
    const sliceSize =
      analysis.completionType === "quarter_rotation"
        ? SliceSize.QUARTERED
        : SliceSize.HALVED;

    console.log("[Autocomplete] Generating completion with CAP:", {
      capType,
      sliceSize,
      startPosition: analysis.startPosition,
      endPosition: analysis.currentEndPosition,
    });

    // Get the CAP executor for the selected type
    const executor = this.capExecutorSelector.getExecutor(capType);

    // Convert sequence to BeatData array for the executor
    const sequenceBeats = this.convertSequenceToBeats(sequence);

    if (sequenceBeats.length === 0) {
      throw new Error("No beats in sequence to complete");
    }

    // IMPORTANT: Save original length BEFORE executing, since executor modifies array in place
    const originalLength = sequenceBeats.length;

    // Execute the CAP transformation (modifies sequenceBeats in place)
    const completedBeats = executor.executeCAP(sequenceBeats, sliceSize);

    // Return only the new beats (after the original sequence)
    const newBeats = completedBeats.slice(originalLength);

    console.log(
      "[Autocomplete] Generated",
      newBeats.length,
      "completion beats (original:",
      originalLength,
      ", completed:",
      completedBeats.length,
      ")"
    );

    return newBeats;
  }

  /**
   * Complete a sequence by appending the generated completion beats
   */
  async autocompleteSequence(
    sequence: SequenceData,
    options: AutocompleteOptions
  ): Promise<SequenceData> {
    console.log(
      "[Autocomplete] Starting autocomplete for sequence:",
      sequence.name
    );
    const completionBeats = await this.generateCompletionBeats(
      sequence,
      options
    );
    console.log(
      "[Autocomplete] Generated completion beats:",
      completionBeats.length
    );

    if (completionBeats.length === 0) {
      console.log(
        "[Autocomplete] No completion beats generated - returning original sequence"
      );
      return sequence;
    }

    // Renumber the completion beats to continue from the existing sequence
    const existingBeatCount = sequence.beats?.length || 0;
    const renumberedBeats = completionBeats.map((beat, index) => ({
      ...beat,
      beatNumber: existingBeatCount + index + 1,
    }));

    // Combine existing beats with completion beats
    const newBeats = [...(sequence.beats || []), ...renumberedBeats];

    console.log(
      "[Autocomplete] Returning completed sequence with",
      newBeats.length,
      "beats (was",
      sequence.beats?.length || 0,
      ")"
    );

    return {
      ...sequence,
      beats: newBeats,
      isCircular: true,
      capType: options.capType,
    };
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

  private canFindCompletionPath(
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
   * Convert a SequenceData to BeatData array for CAP executor
   * The CAP executor expects: [startPosition (beat 0), beat 1, beat 2, ...]
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

    console.log("[Autocomplete] convertSequenceToBeats result:", {
      hasBeat0InSource: !!beat0,
      hasStartPosData: !!startPosData,
      resultLength: result.length,
      beatNumbers: result.map((b) => b.beatNumber),
    });

    return result;
  }
}

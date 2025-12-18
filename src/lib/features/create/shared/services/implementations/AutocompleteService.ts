/**
 * Autocomplete Service Implementation
 *
 * Detects when a sequence is in a completable state and generates completion beats
 * using the existing CAP (Circular Arrangement Pattern) executor infrastructure.
 */

import { injectable, inject } from "inversify";
import { TYPES } from "$lib/shared/inversify/types";
import type { BeatData } from "../../domain/models/BeatData";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import { GridPosition, GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";
import type {
  IAutocompleteService,
  AutocompleteAnalysis,
  AutocompleteOptions,
  CompletionType,
  CAPOption,
} from "../contracts/IAutocompleteService";
import type { ICAPExecutorSelector } from "$lib/features/create/generate/circular/services/contracts/ICAPExecutorSelector";
import {
  HALF_POSITION_MAP,
  QUARTER_POSITION_MAP_CW,
  QUARTER_POSITION_MAP_CCW,
  HALVED_CAPS,
  QUARTERED_CAPS,
} from "$lib/features/create/generate/circular/domain/constants/circular-position-maps";
import { CAPType, CAP_TYPE_LABELS, SliceSize } from "$lib/features/create/generate/circular/domain/models/circular-models";

/**
 * CAP options with icons and descriptions for UI display
 */
const CAP_OPTION_CONFIG: Record<CAPType, { icon: string; description: string }> = {
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
export class AutocompleteService implements IAutocompleteService {
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
        description: "No beats in sequence",
      };
    }

    // Check if already complete (end equals start)
    // Even when complete, CAPs can still be applied to extend the pattern
    if (currentEndPosition === startPosition) {
      const capOptions = this.getAvailableCAPOptions(SliceSize.HALVED);
      return {
        canComplete: true,
        completionType: "already_complete",
        startPosition,
        currentEndPosition,
        availableCAPOptions: capOptions,
        description: `Sequence is complete - ${capOptions.length} CAP patterns available to extend`,
      };
    }

    // Check for half rotation (180°)
    const positionPair = `${startPosition},${currentEndPosition}`;
    const isHalvedValid = HALVED_CAPS.has(positionPair);
    const isQuarteredValid = QUARTERED_CAPS.has(positionPair);

    if (isHalvedValid) {
      const capOptions = this.getAvailableCAPOptions(SliceSize.HALVED);
      return {
        canComplete: true,
        completionType: "half_rotation",
        startPosition,
        currentEndPosition,
        availableCAPOptions: capOptions,
        description: `Can complete with ${capOptions.length} CAP patterns (180° rotation)`,
      };
    }

    if (isQuarteredValid) {
      const capOptions = this.getAvailableCAPOptions(SliceSize.QUARTERED);
      return {
        canComplete: true,
        completionType: "quarter_rotation",
        startPosition,
        currentEndPosition,
        availableCAPOptions: capOptions,
        description: `Can complete with ${capOptions.length} CAP patterns (90° rotation)`,
      };
    }

    // Not a direct rotation - check if any completion path exists
    const canFindPath = this.canFindCompletionPath(
      currentEndPosition,
      startPosition
    );

    if (canFindPath) {
      // Default to halved options for indirect paths
      const capOptions = this.getAvailableCAPOptions(SliceSize.HALVED);
      return {
        canComplete: true,
        completionType: "half_rotation",
        startPosition,
        currentEndPosition,
        availableCAPOptions: capOptions,
        description: "Can complete via intermediate positions",
      };
    }

    return {
      canComplete: false,
      completionType: "not_completable",
      startPosition,
      currentEndPosition,
      availableCAPOptions: [],
      description: "No completion path found from current position",
    };
  }

  /**
   * Get available CAP options for a given slice size
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
    const sliceSize = analysis.completionType === "quarter_rotation"
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

    console.log("[Autocomplete] Generated", newBeats.length, "completion beats (original:", originalLength, ", completed:", completedBeats.length, ")");

    return newBeats;
  }

  /**
   * Complete a sequence by appending the generated completion beats
   */
  async autocompleteSequence(
    sequence: SequenceData,
    options: AutocompleteOptions
  ): Promise<SequenceData> {
    console.log("[Autocomplete] Starting autocomplete for sequence:", sequence.name);
    const completionBeats = await this.generateCompletionBeats(sequence, options);
    console.log("[Autocomplete] Generated completion beats:", completionBeats.length);

    if (completionBeats.length === 0) {
      console.log("[Autocomplete] No completion beats generated - returning original sequence");
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

    console.log("[Autocomplete] Returning completed sequence with", newBeats.length, "beats (was", sequence.beats?.length || 0, ")");

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
      const startPosData = sequence.startPosition;
      if ('startPosition' in startPosData && startPosData.startPosition) {
        return startPosData.startPosition as GridPosition;
      }
    }

    // Check for startingPositionBeat (legacy field)
    const startBeat = sequence.startingPositionBeat;
    if (startBeat && 'startPosition' in startBeat && startBeat.startPosition) {
      return startBeat.startPosition as GridPosition;
    }

    // Check first beat (beat 0) if it's the start position
    const beats = sequence.beats || [];
    const firstBeat = beats.find((b) => b.beatNumber === 0);
    if (firstBeat?.startPosition) {
      return firstBeat.startPosition as GridPosition;
    }

    return null;
  }

  private getCurrentEndPosition(sequence: SequenceData): GridPosition | null {
    const beats = sequence.beats || [];
    if (beats.length === 0) return null;

    // Find the last actual beat (not the start position beat 0)
    const sortedBeats = [...beats].sort((a, b) => b.beatNumber - a.beatNumber);
    const lastBeat = sortedBeats.find((b) => b.beatNumber > 0) || sortedBeats[0];

    if (lastBeat?.endPosition) {
      return lastBeat.endPosition as GridPosition;
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
    const startPosData = sequence.startPosition || sequence.startingPositionBeat;

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

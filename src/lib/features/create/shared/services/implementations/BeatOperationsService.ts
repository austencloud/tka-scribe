/**
 * Beat Operations Service Implementation
 *
 * Handles all beat manipulation business logic extracted from CreateModule.svelte.
 * Manages beat removal, batch editing, individual beat mutations, undo snapshots, and beat selection.
 *
 * Domain: Create module - Beat Manipulation for Sequence Construction
 * Achieves Single Responsibility Principle by centralizing beat operation logic.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { BeatData } from "../../domain/models/BeatData";
import type { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";
import { createComponentLogger } from "$lib/shared/utils/debug-logger";
import { resolve } from "$lib/shared/inversify/di";
import { TYPES } from "$lib/shared/inversify/types";
import { createMotionData, type MotionData } from "$lib/shared/pictograph/shared/domain/models/MotionData";
import { MotionColor } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
import { MotionType, RotationDirection } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
import { injectable, inject, optional } from "inversify";
import type { IBeatOperationsService } from "../contracts/IBeatOperationsService";
import type { IOrientationCalculator } from "$lib/shared/pictograph/prop/services/contracts/IOrientationCalculationService";
import type { ICreateModuleState, BatchEditChanges } from "../../types/create-module-types";
import type { IMotionQueryHandler } from "$lib/shared/foundation/services/contracts/data/data-contracts";
import type { IGridModeDeriver } from "$lib/shared/pictograph/grid/services/contracts/IGridModeDeriver";
import type { Letter } from "$lib/shared/foundation/domain/models/Letter";

const START_POSITION_BEAT_NUMBER = 0; // Beat 0 = start position, beats 1+ are in the sequence

@injectable()
export class BeatOperationsService implements IBeatOperationsService {
  private logger = createComponentLogger("BeatOperations");

  constructor(
    @inject(TYPES.IMotionQueryHandler)
    @optional()
    private motionQueryHandler: IMotionQueryHandler | null,
    @inject(TYPES.IGridModeDeriver)
    @optional()
    private gridModeDeriver: IGridModeDeriver | null
  ) {}

  removeBeat(beatIndex: number, CreateModuleState: ICreateModuleState): void {
    const selectedBeat = CreateModuleState.sequenceState.selectedBeatData;

    // Special case: Removing start position (beatNumber === 0) clears entire sequence
    if (selectedBeat && selectedBeat.beatNumber === 0) {
      this.logger.log("Removing start position - clearing entire sequence");

      CreateModuleState.pushUndoSnapshot("CLEAR_SEQUENCE", {
        description: "Clear sequence (removed start position)",
      });

      void CreateModuleState.sequenceState.clearSequenceCompletely();
      CreateModuleState.setActiveToolPanel("constructor");
      return;
    }

    // Calculate how many beats will be removed (beat at index + all subsequent)
    const currentSequence = CreateModuleState.sequenceState.currentSequence;
    const beatsToRemove = currentSequence
      ? currentSequence.beats.length - beatIndex
      : 0;

    this.logger.log(
      `Removing beat ${beatIndex} and ${beatsToRemove - 1} subsequent beats`
    );

    // Push undo snapshot before removal
    CreateModuleState.pushUndoSnapshot("REMOVE_BEATS", {
      beatIndex,
      beatsRemoved: beatsToRemove,
      description: `Remove beat ${beatIndex} and ${beatsToRemove - 1} subsequent beats`,
    });

    // Remove the beat and all subsequent beats with staggered animation
    CreateModuleState.sequenceState.removeBeatAndSubsequentWithAnimation(
      beatIndex,
      () => {
        // After animation completes, select appropriate beat
        if (beatIndex > 0) {
          // Select the previous beat (array index beatIndex-1 has beatNumber beatIndex)
          CreateModuleState.sequenceState.selectBeat(beatIndex);
        } else {
          // If removing beat 0 (first beat after start), select start position
          CreateModuleState.sequenceState.selectStartPositionForEditing();
        }
      }
    );
  }

  applyBatchChanges(changes: BatchEditChanges, CreateModuleState: ICreateModuleState): void {
    const selectedBeatNumbers =
      CreateModuleState.sequenceState.selectedBeatNumbers;
    if (selectedBeatNumbers.size === 0) {
      this.logger.warn("No beats selected for batch edit");
      return;
    }

    this.logger.log(
      `Applying batch changes to ${selectedBeatNumbers.size} beats`,
      changes
    );

    // Push undo snapshot before batch edit
    CreateModuleState.pushUndoSnapshot("BATCH_EDIT", {
      beatNumbers: Array.from(selectedBeatNumbers),
      changes,
      description: `Batch edit ${selectedBeatNumbers.size} beats`,
    });

    const currentSequence = CreateModuleState.sequenceState.currentSequence;
    if (!currentSequence) {
      this.logger.warn("No active sequence to apply batch changes");
      return;
    }

    const updatedBeats = currentSequence.beats.map((beat) => {
      if (!selectedBeatNumbers.has(beat.beatNumber)) return beat;

      const nextMotions =
        changes.motions && beat.motions
          ? { ...beat.motions, ...changes.motions }
          : beat.motions;

      return {
        ...beat,
        ...changes,
        motions: nextMotions,
      };
    });

    CreateModuleState.sequenceState.setCurrentSequence({
      ...currentSequence,
      beats: updatedBeats,
    });

    this.logger.success(
      `Applied batch changes to ${selectedBeatNumbers.size} beats`
    );
  }

  updateBeatOrientation(
    beatNumber: number,
    color: string,
    orientation: string,
    CreateModuleState: ICreateModuleState,
    _panelState: unknown
  ): void {
    // panelState parameter is not used but kept for interface compatibility
    console.log(`🎨 BeatOperationsService.updateBeatOrientation called:`, {
      beatNumber,
      color,
      orientation,
      hasCreateModuleState: !!CreateModuleState,
    });

    // Get beat data from LIVE sequence state, not the snapshot!
    let beatData: BeatData | null | undefined;
    if (beatNumber === START_POSITION_BEAT_NUMBER) {
      beatData = CreateModuleState.sequenceState
        .selectedStartPosition as unknown as BeatData | null;
    } else {
      const arrayIndex = beatNumber - 1;
      const sequence: SequenceData | null = CreateModuleState.sequenceState.currentSequence;
      beatData = sequence?.beats[arrayIndex];
    }

    console.log(`  Beat data from live state:`, beatData);

    if (!beatData?.motions) {
      this.logger.warn("Cannot update orientation - no beat data available");
      return;
    }

    // Get current motion data for the color
    const colorKey = color as MotionColor;
    const currentMotion: MotionData | undefined = beatData.motions[
      colorKey
    ];
    if (!currentMotion) {
      this.logger.warn(`No motion data for ${color}`);
      return;
    }

    // Recalculate endOrientation for this beat based on its turns/motion type
    const orientationCalculator = resolve<IOrientationCalculator>(
      TYPES.IOrientationCalculator
    );

    const tempMotionData = createMotionData({
      ...currentMotion,
      startOrientation: orientation as MotionData["startOrientation"], // Use the new orientation
    });

    const newEndOrientation = orientationCalculator.calculateEndOrientation(
      tempMotionData,
      colorKey
    );

    // Create updated beat data with new startOrientation and recalculated endOrientation
    const updatedBeatData: BeatData = {
      ...beatData,
      motions: {
        ...beatData.motions,
        [colorKey]: {
          ...currentMotion,
          startOrientation: orientation as MotionData["startOrientation"],
          endOrientation: newEndOrientation,
        },
      },
    };

    // Get current sequence and start position for propagation calculation
    const currentSequence: SequenceData | null = CreateModuleState.sequenceState.currentSequence;
    const startPosition: BeatData | null = CreateModuleState.sequenceState
      .selectedStartPosition as unknown as BeatData | null;

    if (!currentSequence) {
      this.logger.warn("Cannot update beat orientation - no current sequence");
      return;
    }

    // Build the updated sequence with the beat update + propagated orientations
    let updatedSequence = currentSequence;
    let updatedStartPosition = startPosition;

    if (beatNumber === START_POSITION_BEAT_NUMBER) {
      // Update start position
      updatedStartPosition = updatedBeatData as BeatData;
      this.logger.log(
        `Updated start position ${color} orientation to ${orientation}, endOrientation to ${newEndOrientation}`
      );

      // Calculate propagated beats through the sequence
      const propagatedBeats = this.calculatePropagatedBeats(
        beatNumber,
        color,
        currentSequence,
        updatedStartPosition
      );

      updatedSequence = {
        ...currentSequence,
        beats: propagatedBeats,
      };
    } else {
      // Update beat in sequence
      const arrayIndex = beatNumber - 1;
      const updatedBeats = [...currentSequence.beats];
      updatedBeats[arrayIndex] = updatedBeatData;

      this.logger.log(
        `Updated beat ${beatNumber} ${color} orientation to ${orientation}, endOrientation to ${newEndOrientation}`
      );

      // Calculate propagated beats through the sequence
      const propagatedBeats = this.calculatePropagatedBeats(
        beatNumber,
        color,
        { ...currentSequence, beats: updatedBeats },
        startPosition
      );

      updatedSequence = {
        ...currentSequence,
        beats: propagatedBeats,
      };
    }

    // Call setCurrentSequence ONCE with the fully updated sequence
    CreateModuleState.sequenceState.setCurrentSequence(updatedSequence);
  }

  /**
   * Calculate propagated beats without calling setCurrentSequence
   * Returns the updated beats array with all propagations applied
   * DOES NOT mutate state - caller must call setCurrentSequence
   */
  private calculatePropagatedBeats(
    startingBeatNumber: number,
    color: string,
    currentSequence: SequenceData,
    startPosition: BeatData | null
  ): BeatData[] {
    if (!currentSequence?.beats || currentSequence.beats.length === 0) {
      this.logger.log("No sequence beats to propagate through");
      return currentSequence.beats;
    }

    const orientationCalculator = resolve<IOrientationCalculator>(
      TYPES.IOrientationCalculator
    );

    // Get the starting beat's endOrientation
    let previousEndOrientation: MotionData["endOrientation"] | undefined;

    if (startingBeatNumber === START_POSITION_BEAT_NUMBER) {
      // Starting from beat 0 (start position)
      if (startPosition?.motions) {
        const motion: MotionData | undefined = startPosition.motions[
          color as MotionColor
        ];
        if (motion) {
          previousEndOrientation = motion.endOrientation;
        }
      }
    } else {
      // Starting from a regular beat
      const arrayIndex = startingBeatNumber - 1;
      const startingBeat: BeatData | undefined = currentSequence.beats[arrayIndex];
      if (startingBeat?.motions) {
        const motion: MotionData | undefined =
          startingBeat.motions[color as MotionColor];
        if (motion) {
          previousEndOrientation = motion.endOrientation;
        }
      }
    }

    if (!previousEndOrientation) {
      this.logger.warn(
        `Cannot propagate - no endOrientation found for beat ${startingBeatNumber} ${color}`
      );
      return currentSequence.beats;
    }

    // Propagate through subsequent beats
    const updatedBeats: BeatData[] = [...currentSequence.beats];
    const propagationStartIndex =
      startingBeatNumber === START_POSITION_BEAT_NUMBER
        ? 0
        : startingBeatNumber;

    this.logger.log(
      `🔄 Propagating ${color} orientations starting from beat ${startingBeatNumber} (endOrientation: ${previousEndOrientation})`
    );

    for (let i = propagationStartIndex; i < updatedBeats.length; i++) {
      const beat = updatedBeats[i];
      if (!beat) {
        continue;
      }
      // Runtime safety check - motions should always exist but validate to be safe
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!beat.motions) {
        this.logger.warn(
          `No motions data at beat ${i + 1}, stopping propagation`
        );
        break;
      }
      const beatMotion: MotionData | undefined =
        beat.motions[color as MotionColor];

      if (!beatMotion) {
        this.logger.warn(
          `No motion data for ${color} at beat ${i + 1}, stopping propagation`
        );
        break;
      }

      // Recalculate this beat's endOrientation
      const tempMotionData = createMotionData({
        ...beatMotion,
        startOrientation: previousEndOrientation,
      });

      const newEndOrientation = orientationCalculator.calculateEndOrientation(
        tempMotionData,
        color as MotionColor
      );

      // Update this beat's startOrientation and endOrientation
      const updatedMotion: MotionData = {
        ...beatMotion,
        startOrientation: previousEndOrientation,
        endOrientation: newEndOrientation,
      };

      // Update the beat
      updatedBeats[i] = {
        ...beat,
        motions: {
          ...beat.motions,
          [color]: updatedMotion,
        },
      };

      this.logger.log(
        `  ✓ Beat ${i + 1}: startOri=${previousEndOrientation} → endOri=${newEndOrientation}`
      );

      // This beat's endOrientation becomes the next beat's startOrientation
      previousEndOrientation = newEndOrientation;
    }

    this.logger.success(
      `✅ Calculated propagation for ${color} orientations through ${updatedBeats.length - propagationStartIndex} beats`
    );

    return updatedBeats;
  }

  updateBeatTurns(
    beatNumber: number,
    color: string,
    turnAmount: number | "fl",
    CreateModuleState: ICreateModuleState,
    _panelState: unknown
  ): void {
    // panelState parameter is not used but kept for interface compatibility
    // Get beat data from LIVE sequence state, not the snapshot!
    let beatData: BeatData | null | undefined;
    if (beatNumber === START_POSITION_BEAT_NUMBER) {
      beatData = CreateModuleState.sequenceState
        .selectedStartPosition as unknown as BeatData | null;
    } else {
      const arrayIndex = beatNumber - 1;
      const sequence: SequenceData | null = CreateModuleState.sequenceState.currentSequence;
      beatData = sequence?.beats[arrayIndex];
    }

    if (!beatData?.motions) {
      this.logger.warn("Cannot update turns - no beat data available");
      return;
    }

    // Get current motion data for the color
    const currentMotion: MotionData | undefined =
      beatData.motions[color as MotionColor];
    if (!currentMotion) {
      this.logger.warn(`No motion data for ${color}`);
      return;
    }

    const currentTurns = currentMotion.turns;

    // Detect float conversion scenarios
    const isConvertingToFloat = currentTurns !== "fl" && turnAmount === "fl";
    const isConvertingFromFloat = currentTurns === "fl" && turnAmount !== "fl";

    // Initialize updated motion properties
    let updatedMotionType = currentMotion.motionType;
    let updatedRotationDirection = currentMotion.rotationDirection;
    let updatedPrefloatMotionType = currentMotion.prefloatMotionType;
    let updatedPrefloatRotationDirection =
      currentMotion.prefloatRotationDirection;

    // Handle float conversion
    if (isConvertingToFloat) {
      // Store current motion state before converting to float
      updatedPrefloatMotionType = currentMotion.motionType;
      updatedPrefloatRotationDirection = currentMotion.rotationDirection;
      updatedMotionType = MotionType.FLOAT;
      updatedRotationDirection = RotationDirection.NO_ROTATION;
      this.logger.log(
        `Converting to float: storing prefloat state (motionType=${updatedPrefloatMotionType}, rotationDirection=${updatedPrefloatRotationDirection})`
      );
    } else if (isConvertingFromFloat) {
      // Restore motion state from prefloat data
      if (currentMotion.prefloatMotionType) {
        updatedMotionType = currentMotion.prefloatMotionType;
      }
      if (currentMotion.prefloatRotationDirection) {
        updatedRotationDirection = currentMotion.prefloatRotationDirection;
      }
      this.logger.log(
        `Converting from float: restoring motion state (motionType=${updatedMotionType}, rotationDirection=${updatedRotationDirection})`
      );
    } else {
      // CRITICAL: Auto-assign rotation direction for DASH/STATIC motions (legacy behavior)
      // This matches legacy json_turns_updater.py lines 43-47 and 67-70
      const isDashOrStatic =
        updatedMotionType === MotionType.DASH || updatedMotionType === MotionType.STATIC;

      if (isDashOrStatic) {
        if (
          typeof turnAmount === "number" &&
          turnAmount > 0 &&
          currentMotion.rotationDirection === RotationDirection.NO_ROTATION
        ) {
          // Auto-assign CLOCKWISE when applying non-zero turns to dash/static with no rotation
          updatedRotationDirection = RotationDirection.CLOCKWISE;
          this.logger.log(
            `Auto-assigned CLOCKWISE rotation to ${updatedMotionType} motion with ${turnAmount} turns`
          );
        } else if (turnAmount === 0) {
          // Reset to NO_ROTATION when turns are set to 0
          updatedRotationDirection = RotationDirection.NO_ROTATION;
        }
      }
    }

    // Recalculate endOrientation based on new turn amount and updated rotation direction
    const orientationCalculator = resolve<IOrientationCalculator>(
      TYPES.IOrientationCalculator
    );
    const tempMotionData = createMotionData({
      ...currentMotion,
      turns: turnAmount, // Use new turn value for calculation
      rotationDirection: updatedRotationDirection, // Use updated rotation direction
      motionType: updatedMotionType, // Use updated motion type
    });
    const newEndOrientation = orientationCalculator.calculateEndOrientation(
      tempMotionData,
      color as MotionColor
    );

    // Create updated beat data with new turn amount, rotation direction, motion type, AND recalculated endOrientation
    const updatedBeatData = {
      ...beatData,
      motions: {
        ...beatData.motions,
        [color]: {
          ...currentMotion,
          turns: turnAmount,
          motionType: updatedMotionType,
          rotationDirection: updatedRotationDirection,
          prefloatMotionType: updatedPrefloatMotionType,
          prefloatRotationDirection: updatedPrefloatRotationDirection,
          endOrientation: newEndOrientation, // Update endOrientation so prop rotates correctly
        },
      },
    };

    // Get current sequence and start position for propagation calculation
    const currentSequence: SequenceData | null = CreateModuleState.sequenceState.currentSequence;
    const startPosition: BeatData | null = CreateModuleState.sequenceState
      .selectedStartPosition as unknown as BeatData | null;

    if (!currentSequence) {
      this.logger.warn("Cannot update beat - no current sequence");
      return;
    }

    // Build the updated sequence with the beat update + propagated orientations
    let updatedSequence = currentSequence;
    let updatedStartPosition = startPosition;

    if (beatNumber === START_POSITION_BEAT_NUMBER) {
      // Update start position
      updatedStartPosition = updatedBeatData as BeatData;
      this.logger.log(
        `Updated start position ${color} turns to ${turnAmount} (rotationDirection: ${updatedRotationDirection}, endOrientation: ${newEndOrientation})`
      );

      // Calculate propagated beats through the sequence
      const propagatedBeats = this.calculatePropagatedBeats(
        beatNumber,
        color,
        currentSequence,
        updatedStartPosition
      );

      updatedSequence = {
        ...currentSequence,
        beats: propagatedBeats,
      };
    } else {
      // Update beat in sequence
      const arrayIndex = beatNumber - 1;
      const updatedBeats = [...currentSequence.beats];
      updatedBeats[arrayIndex] = updatedBeatData;

      this.logger.log(
        `Updated beat ${beatNumber} ${color} turns to ${turnAmount} (rotationDirection: ${updatedRotationDirection}, endOrientation: ${newEndOrientation})`
      );

      // Calculate propagated beats through the sequence
      const propagatedBeats = this.calculatePropagatedBeats(
        beatNumber,
        color,
        { ...currentSequence, beats: updatedBeats },
        startPosition
      );

      updatedSequence = {
        ...currentSequence,
        beats: propagatedBeats,
      };
    }

    // Call setCurrentSequence ONCE with the fully updated sequence
    console.log(`[updateBeatTurns] Calling setCurrentSequence with fully updated sequence`);
    CreateModuleState.sequenceState.setCurrentSequence(updatedSequence);
    console.log(`[updateBeatTurns] setCurrentSequence completed`);
  }

  updateBeatPropType(
    beatNumber: number,
    color: string,
    propType: PropType,
    CreateModuleState: ICreateModuleState,
    _panelState: unknown
  ): void {
    // panelState parameter is not used but kept for interface compatibility
    console.log(`🎨 BeatOperationsService.updateBeatPropType called:`, {
      beatNumber,
      color,
      propType,
      hasCreateModuleState: !!CreateModuleState,
    });

    // Get beat data from LIVE sequence state
    let beatData: BeatData | null | undefined;
    if (beatNumber === START_POSITION_BEAT_NUMBER) {
      beatData = CreateModuleState.sequenceState
        .selectedStartPosition as unknown as BeatData | null;
    } else {
      const arrayIndex = beatNumber - 1;
      const sequence: SequenceData | null = CreateModuleState.sequenceState.currentSequence;
      beatData = sequence?.beats[arrayIndex];
    }

    if (!beatData?.motions) {
      this.logger.warn("Cannot update prop type - no beat data available");
      return;
    }

    // Get current motion data for the color
    const currentMotion: MotionData | undefined =
      beatData.motions[color as MotionColor];
    if (!currentMotion) {
      this.logger.warn(`No motion data for ${color}`);
      return;
    }

    // Create updated motion with new propType
    const updatedMotion = {
      ...currentMotion,
      propType: propType,
    };

    // Create updated beat data
    const updatedBeatData = {
      ...beatData,
      motions: {
        ...beatData.motions,
        [color]: updatedMotion,
      },
    };

    // Update the appropriate state
    if (beatNumber === START_POSITION_BEAT_NUMBER) {
      CreateModuleState.sequenceState.setStartPosition(updatedBeatData);
      this.logger.log(
        `Updated start position ${color} prop type to ${propType}`
      );
    } else {
      const arrayIndex = beatNumber - 1;
      CreateModuleState.sequenceState.updateBeat(arrayIndex, updatedBeatData);
      this.logger.log(
        `Updated beat ${beatNumber} ${color} prop type to ${propType}`
      );
    }
  }

  /**
   * Bulk update prop type for all motions of a specific color in the sequence
   * Updates both the start position and all beats
   */
  bulkUpdatePropType(
    color: string,
    propType: PropType,
    CreateModuleState: ICreateModuleState
  ): void {
    console.log(`🎨 BeatOperationsService.bulkUpdatePropType called:`, {
      color,
      propType,
    });

    // Update start position
    const startPosition = CreateModuleState.sequenceState.selectedStartPosition;
    if (startPosition?.motions) {
      const currentMotion = startPosition.motions[color as MotionColor];
      if (currentMotion) {
        const updatedMotion = {
          ...currentMotion,
          propType: propType,
        };
        const updatedStartPosition = {
          ...startPosition,
          motions: {
            ...startPosition.motions,
            [color]: updatedMotion,
          },
        } as BeatData; // Type cast - start position is actually a PictographData but service expects BeatData
        CreateModuleState.sequenceState.setStartPosition(updatedStartPosition);
        this.logger.log(`Updated start position ${color} prop type to ${propType}`);
      }
    }

    // Update all beats in the sequence
    const sequence = CreateModuleState.sequenceState.currentSequence;
    if (sequence?.beats) {
      const updatedBeats = sequence.beats.map((beat: BeatData) => {
        if (!beat.motions) return beat;

        const currentMotion = beat.motions[color as MotionColor];
        if (!currentMotion) return beat;

        const updatedMotion = {
          ...currentMotion,
          propType: propType,
        };

        return {
          ...beat,
          motions: {
            ...beat.motions,
            [color]: updatedMotion,
          },
        };
      });

      const updatedSequence = {
        ...sequence,
        beats: updatedBeats,
      };

      CreateModuleState.sequenceState.setCurrentSequence(updatedSequence);
      this.logger.log(
        `Updated ${updatedBeats.length} beats: ${color} prop type to ${propType}`
      );
    }
  }

  /**
   * Update rotation direction for a specific prop color in a beat
   *
   * CRITICAL BEHAVIOR (matches legacy PropRotDirLogicHandler):
   * 1. Rotation direction can be changed when turns >= 0 (including 0)
   * 2. Rotation direction CANNOT be changed when turns = "fl" (float)
   * 3. When rotation direction changes, motion type FLIPS: PRO ↔ ANTI
   * 4. This flip can change the pictograph's letter
   */
  updateRotationDirection(
    beatNumber: number,
    color: string,
    rotationDirection: string,
    CreateModuleState: ICreateModuleState,
    _panelState: unknown
  ): void {
    this.logger.log(`🔄 BeatOperationsService.updateRotationDirection called:`, {
      beatNumber,
      color,
      rotationDirection,
    });

    // Get beat data from LIVE sequence state
    let beatData: BeatData | null | undefined;
    if (beatNumber === START_POSITION_BEAT_NUMBER) {
      beatData = CreateModuleState.sequenceState
        .selectedStartPosition as unknown as BeatData | null;
    } else {
      const arrayIndex = beatNumber - 1;
      const sequence: SequenceData | null = CreateModuleState.sequenceState.currentSequence;
      beatData = sequence?.beats[arrayIndex];
    }

    if (!beatData?.motions) {
      this.logger.warn("Cannot update rotation direction - no beat data available");
      return;
    }

    // Get current motion data for the color
    const colorKey = color as MotionColor;
    const currentMotion: MotionData | undefined = beatData.motions[colorKey];
    if (!currentMotion) {
      this.logger.warn(`No motion data for ${color}`);
      return;
    }

    // Block rotation direction change for float turns (they don't have rotation)
    const currentTurns = currentMotion.turns;
    if (currentTurns === "fl") {
      this.logger.warn(`Cannot set rotation direction - float motions don't support rotation`);
      return;
    }

    // Map string rotation direction to enum
    const newRotationDirection = rotationDirection === "cw" || rotationDirection === "CLOCKWISE"
      ? RotationDirection.CLOCKWISE
      : RotationDirection.COUNTER_CLOCKWISE;

    // Skip if already at this rotation direction
    if (currentMotion.rotationDirection === newRotationDirection) {
      this.logger.log(`Already at ${newRotationDirection}, no change needed`);
      return;
    }

    // CRITICAL: Flip motion type when rotation direction changes (legacy behavior)
    // PRO ↔ ANTI flip is what causes the pictograph's letter to potentially change
    let newMotionType = currentMotion.motionType;
    if (currentMotion.motionType === MotionType.PRO) {
      newMotionType = MotionType.ANTI;
      this.logger.log(`Flipping motion type: PRO → ANTI`);
    } else if (currentMotion.motionType === MotionType.ANTI) {
      newMotionType = MotionType.PRO;
      this.logger.log(`Flipping motion type: ANTI → PRO`);
    }
    // Note: DASH, STATIC, FLOAT don't flip

    // Recalculate endOrientation based on new rotation direction and motion type
    const orientationCalculator = resolve<IOrientationCalculator>(
      TYPES.IOrientationCalculator
    );
    const tempMotionData = createMotionData({
      ...currentMotion,
      rotationDirection: newRotationDirection,
      motionType: newMotionType,
    });
    const newEndOrientation = orientationCalculator.calculateEndOrientation(
      tempMotionData,
      colorKey
    );

    // Create updated beat data with new rotation direction, motion type, and endOrientation
    const updatedBeatData = {
      ...beatData,
      motions: {
        ...beatData.motions,
        [color]: {
          ...currentMotion,
          rotationDirection: newRotationDirection,
          motionType: newMotionType,
          endOrientation: newEndOrientation,
        },
      },
    };

    // Apply update based on beat number
    if (beatNumber === START_POSITION_BEAT_NUMBER) {
      CreateModuleState.sequenceState.setStartPosition(updatedBeatData);
      this.logger.log(
        `Updated start position ${color}: rotation=${newRotationDirection}, motionType=${newMotionType}, endOri=${newEndOrientation}`
      );

      // Propagate orientation changes through the entire sequence
      this.propagateOrientationsThroughSequence(
        beatNumber,
        color,
        CreateModuleState
      );
    } else {
      const arrayIndex = beatNumber - 1;
      CreateModuleState.sequenceState.updateBeat(arrayIndex, updatedBeatData);
      this.logger.log(
        `Updated beat ${beatNumber} ${color}: rotation=${newRotationDirection}, motionType=${newMotionType}, endOri=${newEndOrientation}`
      );

      // Propagate orientation changes through the subsequent beats
      this.propagateOrientationsThroughSequence(
        beatNumber,
        color,
        CreateModuleState
      );
    }

    // CRITICAL: Recalculate letter after motion type change
    // The PRO ↔ ANTI flip may change the pictograph's letter
    void this.recalculateLetterForBeat(beatNumber, CreateModuleState);
  }

  /**
   * Recalculate the letter for a beat based on its current motion configuration
   * This is called after changes that may affect the letter (e.g., rotation direction change)
   */
  private async recalculateLetterForBeat(
    beatNumber: number,
    CreateModuleState: ICreateModuleState
  ): Promise<void> {
    console.log(`📝 recalculateLetterForBeat called for beat ${beatNumber}`);
    console.log(`  motionQueryHandler available: ${!!this.motionQueryHandler}`);
    console.log(`  gridModeDeriver available: ${!!this.gridModeDeriver}`);

    if (!this.motionQueryHandler || !this.gridModeDeriver) {
      console.warn(
        "⚠️ Cannot recalculate letter - MotionQueryHandler or GridModeDeriver not available"
      );
      return;
    }

    // Get the beat data (re-fetch from state since it was just updated)
    let beatData: BeatData | null | undefined;
    if (beatNumber === START_POSITION_BEAT_NUMBER) {
      beatData = CreateModuleState.sequenceState
        .selectedStartPosition as unknown as BeatData | null;
    } else {
      const arrayIndex = beatNumber - 1;
      const sequence: SequenceData | null = CreateModuleState.sequenceState.currentSequence;
      beatData = sequence?.beats[arrayIndex];
    }

    if (!beatData) {
      console.warn("⚠️ Cannot recalculate letter - beat data not found");
      return;
    }

    const blueMotion = beatData.motions?.[MotionColor.BLUE];
    const redMotion = beatData.motions?.[MotionColor.RED];

    if (!blueMotion || !redMotion) {
      console.warn("⚠️ Cannot recalculate letter - incomplete motion data");
      return;
    }

    try {
      // Derive grid mode from the motions
      const gridMode = this.gridModeDeriver.deriveGridMode(blueMotion, redMotion);
      console.log(`  gridMode: ${gridMode}`);

      // Look up the correct letter for this motion configuration
      console.log(`  Looking up letter for:`, {
        blueMotionType: blueMotion.motionType,
        redMotionType: redMotion.motionType,
        blueRotation: blueMotion.rotationDirection,
        redRotation: redMotion.rotationDirection,
      });
      const newLetter = await this.motionQueryHandler.findLetterByMotionConfiguration(
        blueMotion,
        redMotion,
        gridMode
      ) as Letter | null;

      console.log(`  Found letter: ${newLetter}, current letter: ${beatData.letter}`);

      if (newLetter) {
        // Only update if letter changed
        if (newLetter !== beatData.letter) {
          console.log(
            `📝 Letter changed: "${beatData.letter}" → "${newLetter}" for beat ${beatNumber}`
          );

          // Create updated beat data with new letter
          const updatedBeatData: BeatData = {
            ...beatData,
            letter: newLetter,
            beatNumber: beatData.beatNumber ?? beatNumber,
          };

          // Apply update based on beat number
          if (beatNumber === START_POSITION_BEAT_NUMBER) {
            CreateModuleState.sequenceState.setStartPosition(updatedBeatData);
          } else {
            const arrayIndex = beatNumber - 1;
            CreateModuleState.sequenceState.updateBeat(arrayIndex, updatedBeatData);
          }

          // Update the sequence word after letter change
          this.updateSequenceWord(CreateModuleState);
        } else {
          this.logger.log(`Letter unchanged: "${beatData.letter}" for beat ${beatNumber}`);
        }
      } else {
        this.logger.warn(
          `Could not find letter for beat ${beatNumber} motion configuration (gridMode: ${gridMode})`
        );
      }
    } catch (error) {
      this.logger.error(`Failed to recalculate letter for beat ${beatNumber}:`, error);
    }
  }

  /**
   * Update the sequence word based on current beat letters
   */
  private updateSequenceWord(CreateModuleState: ICreateModuleState): void {
    const sequence = CreateModuleState.sequenceState.currentSequence;
    if (!sequence?.beats) return;

    // Build word from beat letters
    const word = sequence.beats
      .map((beat) => beat.letter ?? "")
      .join("")
      .toUpperCase();

    // Update sequence with new word
    const updatedSequence: SequenceData = {
      ...sequence,
      word,
    };

    CreateModuleState.sequenceState.setCurrentSequence(updatedSequence);
    this.logger.log(`Updated sequence word: "${word}"`);
  }
}

/**
 * Beat Operations Service Implementation
 *
 * Handles all beat manipulation business logic extracted from CreateModule.svelte.
 * Manages beat removal, batch editing, individual beat mutations, undo snapshots, and beat selection.
 *
 * Domain: Create module - Beat Manipulation for Sequence Construction
 * Achieves Single Responsibility Principle by centralizing beat operation logic.
 */

import type { MotionColor, BeatData, SequenceData, MotionData } from "$shared";
import {
  createComponentLogger,
  resolve,
  TYPES,
  createMotionData,
  MotionType,
  RotationDirection,
} from "$shared";
import { injectable } from "inversify";
import type { IBeatOperationsService } from "../contracts/IBeatOperationsService";
import type { IOrientationCalculator } from "$shared/pictograph/prop/services/contracts/IOrientationCalculationService";
import type {
  ICreateModuleState,
  BatchEditChanges,
} from "../../types/create-module-types";

const START_POSITION_BEAT_NUMBER = 0; // Beat 0 = start position, beats 1+ are in the sequence

@injectable()
export class BeatOperationsService implements IBeatOperationsService {
  private logger = createComponentLogger("BeatOperations");

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

  applyBatchChanges(
    changes: BatchEditChanges,
    CreateModuleState: ICreateModuleState
  ): void {
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

    // Apply changes via sequence state
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    CreateModuleState.sequenceState.applyBatchChanges(changes);

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
    console.log(`🎨 BeatOperationsService.updateBeatOrientation called:`, {
      beatNumber,
      color,
      orientation,
      hasCreateModuleState: !!CreateModuleState,
    });

    // Get beat data from LIVE sequence state, not the snapshot!
    let beatData: BeatData | null | undefined;
    if (beatNumber === START_POSITION_BEAT_NUMBER) {
      beatData = CreateModuleState.sequenceState.selectedStartPosition;
    } else {
      const arrayIndex = beatNumber - 1;
      const sequence: SequenceData | null =
        CreateModuleState.sequenceState.currentSequence;
      beatData = sequence?.beats[arrayIndex];
    }

    console.log(`  Beat data from live state:`, beatData);

    if (!beatData?.motions) {
      this.logger.warn("Cannot update orientation - no beat data available");
      return;
    }

    // Get current motion data for the color
    const currentMotion: MotionData | undefined = beatData.motions[color] as
      | MotionData
      | undefined;
    if (!currentMotion) {
      this.logger.warn(`No motion data for ${color}`);
      return;
    }

    // Recalculate endOrientation for this beat based on its turns/motion type
    const orientationCalculator = resolve<IOrientationCalculator>(
      TYPES.IOrientationCalculationService
    );

    const tempMotionData = createMotionData({
      ...currentMotion,
      startOrientation: orientation, // Use the new orientation
    });

    const newEndOrientation = orientationCalculator.calculateEndOrientation(
      tempMotionData,
      color as MotionColor
    );

    // Create updated beat data with new startOrientation and recalculated endOrientation
    const updatedBeatData: BeatData = {
      ...beatData,
      motions: {
        ...beatData.motions,
        [color]: {
          ...currentMotion,
          startOrientation: orientation,
          endOrientation: newEndOrientation,
        },
      },
    };

    // Apply update based on beat number
    if (beatNumber === START_POSITION_BEAT_NUMBER) {
      CreateModuleState.sequenceState.setStartPosition(updatedBeatData);
      this.logger.log(
        `Updated start position ${color} orientation to ${orientation}, endOrientation to ${newEndOrientation}`
      );

      // Propagate orientation changes through the entire sequence
      this.propagateOrientationsThroughSequence(
        beatNumber,
        color,
        CreateModuleState
      );
    } else {
      const arrayIndex = beatNumber - 1; // Beat numbers 1, 2, 3... map to array indices 0, 1, 2...
      CreateModuleState.sequenceState.updateBeat(arrayIndex, updatedBeatData);
      this.logger.log(
        `Updated beat ${beatNumber} ${color} orientation to ${orientation}, endOrientation to ${newEndOrientation}`
      );

      // Propagate orientation changes through the subsequent beats
      this.propagateOrientationsThroughSequence(
        beatNumber,
        color,
        CreateModuleState
      );
    }
  }

  /**
   * Propagates orientation changes through the entire sequence
   * Each beat's startOrientation becomes the previous beat's endOrientation
   * Each beat's endOrientation is recalculated based on its motion properties
   */
  private propagateOrientationsThroughSequence(
    startingBeatNumber: number,
    color: string,
    CreateModuleState: ICreateModuleState
  ): void {
    const currentSequence: SequenceData | null =
      CreateModuleState.sequenceState.currentSequence;
    const startPosition: BeatData | null =
      CreateModuleState.sequenceState.selectedStartPosition;

    if (!currentSequence?.beats || currentSequence.beats.length === 0) {
      this.logger.log("No sequence beats to propagate through");
      return;
    }

    const orientationCalculator = resolve<IOrientationCalculator>(
      TYPES.IOrientationCalculationService
    );

    // Get the starting beat's endOrientation
    let previousEndOrientation: string | undefined;

    if (startingBeatNumber === START_POSITION_BEAT_NUMBER) {
      // Starting from beat 0 (start position)
      if (startPosition?.motions) {
        const motion: MotionData | undefined = startPosition.motions[color] as
          | MotionData
          | undefined;
        if (motion) {
          previousEndOrientation = motion.endOrientation;
        }
      }
    } else {
      // Starting from a regular beat
      const arrayIndex = startingBeatNumber - 1;
      const startingBeat: BeatData | undefined =
        currentSequence.beats[arrayIndex];
      if (startingBeat?.motions) {
        const motion: MotionData | undefined = startingBeat.motions[color] as
          | MotionData
          | undefined;
        if (motion) {
          previousEndOrientation = motion.endOrientation;
        }
      }
    }

    if (!previousEndOrientation) {
      this.logger.warn(
        `Cannot propagate - no endOrientation found for beat ${startingBeatNumber} ${color}`
      );
      return;
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
      const beat: BeatData = updatedBeats[i];
      // Runtime safety check - motions should always exist but validate to be safe
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!beat.motions) {
        this.logger.warn(
          `No motions data at beat ${i + 1}, stopping propagation`
        );
        break;
      }
      const beatMotion: MotionData | undefined = beat.motions[color] as
        | MotionData
        | undefined;

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

    // Update the sequence with all propagated beats
    const updatedSequence: SequenceData = {
      ...currentSequence,
      beats: updatedBeats,
    };

    CreateModuleState.sequenceState.setCurrentSequence(updatedSequence);
    this.logger.success(
      `✅ Propagated ${color} orientations through ${updatedBeats.length - propagationStartIndex} beats`
    );
  }

  updateBeatTurns(
    beatNumber: number,
    color: string,
    turnAmount: number | "fl",
    CreateModuleState: ICreateModuleState,
    _panelState: unknown
  ): void {
    // Get beat data from LIVE sequence state, not the snapshot!
    let beatData: BeatData | null | undefined;
    if (beatNumber === START_POSITION_BEAT_NUMBER) {
      beatData = CreateModuleState.sequenceState.selectedStartPosition;
    } else {
      const arrayIndex = beatNumber - 1;
      const sequence: SequenceData | null =
        CreateModuleState.sequenceState.currentSequence;
      beatData = sequence?.beats[arrayIndex];
    }

    if (!beatData?.motions) {
      this.logger.warn("Cannot update turns - no beat data available");
      return;
    }

    // Get current motion data for the color
    const currentMotion: MotionData | undefined = beatData.motions[color] as
      | MotionData
      | undefined;
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
        updatedMotionType === MotionType.DASH ||
        updatedMotionType === MotionType.STATIC;

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
      TYPES.IOrientationCalculationService
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

    // Apply update based on beat number
    if (beatNumber === START_POSITION_BEAT_NUMBER) {
      CreateModuleState.sequenceState.setStartPosition(updatedBeatData);
      this.logger.log(
        `Updated start position ${color} turns to ${turnAmount} (rotationDirection: ${updatedRotationDirection}, endOrientation: ${newEndOrientation})`
      );

      // Propagate orientation changes through the entire sequence
      this.propagateOrientationsThroughSequence(
        beatNumber,
        color,
        CreateModuleState
      );
    } else {
      const arrayIndex = beatNumber - 1; // Beat numbers 1, 2, 3... map to array indices 0, 1, 2...
      CreateModuleState.sequenceState.updateBeat(arrayIndex, updatedBeatData);
      this.logger.log(
        `Updated beat ${beatNumber} ${color} turns to ${turnAmount} (rotationDirection: ${updatedRotationDirection}, endOrientation: ${newEndOrientation})`
      );

      // Propagate orientation changes through the subsequent beats
      this.propagateOrientationsThroughSequence(
        beatNumber,
        color,
        CreateModuleState
      );
    }
  }
}

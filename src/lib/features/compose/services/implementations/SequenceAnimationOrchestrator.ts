/**
 * Sequence Animation Orchestrator
 *
 * Lightweight coordinator that orchestrates focused services.
 * Single responsibility: Coordinate animation services and manage sequence lifecycle.
 */

import type { BeatData } from "../../../create/shared/domain/models/BeatData";
import type { Letter } from "$lib/shared/foundation/domain/models/Letter";
import type { PropState, PropStates } from "../../shared/domain/types/PropState";
import type { SequenceData, SequenceMetadata } from "$lib/shared/foundation/domain/models/SequenceData";
import { getSettings } from "$lib/shared/application/state/app-state.svelte";
import { TYPES } from "$lib/shared/inversify/types";
import { inject, injectable } from "inversify";
import type { IAnimationStateManager } from "../contracts/IAnimationStateManager";
import type { IBeatCalculator } from "../contracts/IBeatCalculator";
import type { IPropInterpolator } from "../contracts/IPropInterpolator";
import type { ISequenceAnimationOrchestrator } from "../contracts/ISequenceAnimationOrchestrator";

/**
 * Lightweight Animation Orchestrator
 * Coordinates focused services instead of doing everything itself
 */
@injectable()
export class SequenceAnimationOrchestrator
  implements ISequenceAnimationOrchestrator
{
  private beats: readonly BeatData[] = [];
  private totalBeats = 0;
  private hasMotionData = false;
  private missingMotionLogged = new Set<number>();
  private metadata: SequenceMetadata = { word: "", author: "", totalBeats: 0 };
  private initialized = false;
  private currentBeatIndex = 0;
  private currentBeatProgress = 0; // Sub-beat progress (0.0 to 1.0)

  constructor(
    @inject(TYPES.IAnimationStateService)
    private readonly animationStateService: IAnimationStateManager,
    @inject(TYPES.IBeatCalculationService)
    private readonly beatCalculationService: IBeatCalculator,
    @inject(TYPES.IPropInterpolationService)
    private readonly propInterpolationService: IPropInterpolator
  ) {}

  /**
   * Initialize with domain sequence data (PURE DOMAIN!)
   * Data arrives already normalized from SequenceService
   */
  initializeWithDomainData(sequenceData: SequenceData): boolean {
    try {
      const beats = (sequenceData.beats ?? [])
        .filter((beat): beat is BeatData => !!beat)
        .map((beat, index) => ({
          ...beat,
          beatNumber:
            typeof beat.beatNumber === "number" ? beat.beatNumber : index + 1,
          motions: beat.motions ?? { blue: undefined, red: undefined },
        }));

      if (beats.length === 0) {
        throw new Error("No beats found in sequence data");
      }

      // Validate beats using focused service
      if (!this.beatCalculationService.validateBeats(beats)) {
        throw new Error("Invalid beat data structure");
      }

      this.missingMotionLogged.clear();
      this.hasMotionData = beats.some(
        (beat) => beat?.motions?.blue && beat?.motions?.red
      );

      // Extract metadata from domain data
      // Get per-color prop types from settings
      const settings = getSettings();

      this.metadata = {
        word: sequenceData.word || sequenceData.name || "",
        author: (sequenceData.metadata["author"] as string) || "",
        totalBeats: beats.length,
        propType: sequenceData.propType, // Legacy fallback
        bluePropType: settings.bluePropType || settings.propType || sequenceData.propType,
        redPropType: settings.redPropType || settings.propType || sequenceData.propType,
        gridMode: sequenceData.gridMode,
      };

      // Store domain beats directly - NO CONVERSION!
      this.beats = beats;
      this.totalBeats = this.metadata.totalBeats;

      this.initializePropStates();
      this.initialized = true;

      return true;
    } catch (error) {
      console.error(
        "SequenceAnimationOrchestrator: Failed to initialize:",
        error
      );
      return false;
    }
  }

  /**
   * Calculate animation state for given beat using focused services
   */
  calculateState(currentBeat: number): void {
    if (this.beats.length === 0 || this.totalBeats === 0) {
      console.warn("SequenceAnimationOrchestrator: No sequence data available");
      return;
    }

    // Use focused service for beat calculations
    const beatState = this.beatCalculationService.calculateBeatState(
      currentBeat,
      this.beats,
      this.totalBeats
    );

    if (!beatState.isValid) {
      console.error("SequenceAnimationOrchestrator: Invalid beat state");
      return;
    }

    // Store current beat index and progress for trail rendering
    this.currentBeatIndex = beatState.currentBeatIndex;
    this.currentBeatProgress = beatState.beatProgress;

    // Skip beats without motion data (common in legacy/shared URLs) and log once
    const beatMotions = beatState.currentBeatData?.motions;
    const hasBeatMotions = beatMotions?.blue && beatMotions?.red;
    if (!hasBeatMotions) {
      const key = beatState.currentBeatData?.beatNumber ?? beatState.currentBeatIndex;
      if (!this.missingMotionLogged.has(key)) {
        this.missingMotionLogged.add(key);
        console.warn(
          "SequenceAnimationOrchestrator: Skipping beat without motion data",
          {
            beatNumber: beatState.currentBeatData?.beatNumber,
            beatIndex: beatState.currentBeatIndex,
          }
        );
      }
      return;
    }

    // Use focused service for interpolation
    const interpolationResult =
      this.propInterpolationService.interpolatePropAngles(
        beatState.currentBeatData,
        beatState.beatProgress
      );

    if (!interpolationResult.isValid) {
      console.warn(
        "SequenceAnimationOrchestrator: Skipping beat without motion data",
        {
          beatNumber: beatState.currentBeatData?.beatNumber,
          beatIndex: beatState.currentBeatIndex,
        }
      );
      return;
    }

    // Use focused service to update prop states
    this.animationStateService.updatePropStates(interpolationResult);
  }

  /**
   * Get current prop states
   */
  getPropStates(): PropStates {
    return this.animationStateService.getPropStates();
  }

  /**
   * Get blue prop state
   */
  getBluePropState(): PropState {
    return this.animationStateService.getBluePropState();
  }

  /**
   * Get red prop state
   */
  getRedPropState(): PropState {
    return this.animationStateService.getRedPropState();
  }

  /**
   * Get current beat progress (0.0 to 1.0 within current beat)
   */
  getBeatProgress(): number {
    return this.currentBeatProgress;
  }

  /**
   * Get sequence metadata
   */
  getMetadata(): SequenceMetadata {
    return { ...this.metadata };
  }

  private findFirstBeatWithMotion(): BeatData | null {
    return (
      this.beats.find(
        (beat) => beat?.motions?.blue && beat?.motions?.red
      ) ?? null
    );
  }

  /**
   * Initialize prop states using focused services
   */
  private initializePropStates(): void {
    if (!this.beats || this.beats.length === 0) {
      console.warn(
        "SequenceAnimationOrchestrator: No beats available, using fallback"
      );
      this.animationStateService.resetPropStates();
      return;
    }

    // Use first beat that has motion data for initial state
    const firstBeatWithMotion = this.findFirstBeatWithMotion();

    if (!firstBeatWithMotion) {
      console.warn(
        "SequenceAnimationOrchestrator: No beats with motion data, resetting prop states"
      );
      this.animationStateService.resetPropStates();
      return;
    }

    const initialAngles =
      this.propInterpolationService.calculateInitialAngles(
        firstBeatWithMotion
      );

    if (initialAngles.isValid) {
      this.animationStateService.setPropStates(
        {
          centerPathAngle: initialAngles.blueAngles.centerPathAngle,
          staffRotationAngle: initialAngles.blueAngles.staffRotationAngle,
          // x,y are optional - only set for dash motions
        },
        {
          centerPathAngle: initialAngles.redAngles.centerPathAngle,
          staffRotationAngle: initialAngles.redAngles.staffRotationAngle,
          // x,y are optional - only set for dash motions
        }
      );
    } else {
      console.warn(
        "SequenceAnimationOrchestrator: Failed to calculate initial angles"
      );
      this.animationStateService.resetPropStates();
    }
  }

  /**
   * Get current prop states
   */
  getCurrentPropStates(): PropStates {
    return this.animationStateService.getPropStates();
  }

  /**
   * Get the letter for the current beat
   */
  getCurrentLetter(): Letter | null {
    if (!this.initialized || this.beats.length === 0) {
      return null;
    }

    // Clamp beat index to valid range
    const beatIndex = Math.max(
      0,
      Math.min(this.currentBeatIndex, this.beats.length - 1)
    );
    const currentBeat = this.beats[beatIndex];

    return currentBeat?.letter || null;
  }

  /**
   * Check if orchestrator is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Dispose of resources and reset state
   */
  dispose(): void {
    this.beats = [];
    this.totalBeats = 0;
    this.metadata = { word: "", author: "", totalBeats: 0 };
    this.initialized = false;
    this.currentBeatIndex = 0;
    this.animationStateService.resetPropStates();
  }
}

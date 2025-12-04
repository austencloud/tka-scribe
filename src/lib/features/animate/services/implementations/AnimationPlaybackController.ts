/**
 * Animation Playback Controller Implementation
 *
 * Orchestrates animation playback by coordinating:
 * - Animation engine (state calculations)
 * - Loop service (timing and frames)
 * - Panel state (UI updates)
 */

import { inject, injectable } from "inversify";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import { TYPES } from "$lib/shared/inversify/types";
import type { PropState } from "../../shared/domain/types/PropState";
import type { AnimationPanelState } from "../../state/animation-panel-state.svelte";
import type { IAnimationLoopService } from "../contracts/IAnimationLoopService";
import type { IAnimationPlaybackController } from "../contracts/IAnimationPlaybackController";
import type { ISequenceAnimationOrchestrator } from "../contracts/ISequenceAnimationOrchestrator";
import type { ISequenceLoopabilityChecker } from "../contracts/ISequenceLoopabilityChecker";

@injectable()
export class AnimationPlaybackController
  implements IAnimationPlaybackController
{
  private state: AnimationPanelState | null = null;
  private sequenceData: SequenceData | null = null;
  private isSeamlesslyLoopable: boolean = false;

  // Animation-to-beat state
  private animationTarget: number | null = null;
  private animationStartBeat: number = 0;
  private animationStartTime: number = 0;
  private animationDuration: number = 300; // ms
  private useLinearAnimation: boolean = false;

  constructor(
    @inject(TYPES.ISequenceAnimationOrchestrator)
    private readonly animationEngine: ISequenceAnimationOrchestrator,
    @inject(TYPES.IAnimationLoopService)
    private readonly loopService: IAnimationLoopService,
    @inject(TYPES.ISequenceLoopabilityChecker)
    private readonly loopabilityChecker: ISequenceLoopabilityChecker
  ) {}

  initialize(sequenceData: SequenceData, state: AnimationPanelState): boolean {
    this.state = state;
    this.sequenceData = sequenceData;

    // Check if sequence is seamlessly loopable
    this.isSeamlesslyLoopable =
      this.loopabilityChecker.isSeamlesslyLoopable(sequenceData);

    // Initialize animation engine with sequence data
    const success = this.animationEngine.initializeWithDomainData(sequenceData);
    if (!success) {
      return false;
    }

    // Get metadata from engine
    const metadata = this.animationEngine.getMetadata();
    state.setTotalBeats(metadata.totalBeats);
    state.setSequenceMetadata(metadata.word, metadata.author);

    // Set the sequence data on the state (critical for playback to work!)
    state.setSequenceData(sequenceData);

    // Reset playback state
    state.setCurrentBeat(0);
    state.setIsPlaying(false);

    // Update prop states from initial initialization
    this.updatePropStatesFromEngine();

    return true;
  }

  togglePlayback(): void {
    if (!this.state) return;

    if (this.state.isPlaying) {
      // Pause
      this.loopService.stop();
      this.state.setIsPlaying(false);
    } else {
      // Play
      this.state.setIsPlaying(true);
      this.loopService.start(
        (deltaTime) => this.onAnimationUpdate(deltaTime),
        this.state.speed
      );
    }
  }

  stop(): void {
    if (!this.state) return;

    // Stop animation loop
    this.loopService.stop();
    this.state.setIsPlaying(false);

    // Reset to start
    this.state.setCurrentBeat(0);

    // Re-initialize engine if we have sequence data
    if (this.sequenceData) {
      this.animationEngine.initializeWithDomainData(this.sequenceData);
    }

    // Update prop states
    this.updatePropStatesFromEngine();
  }

  jumpToBeat(beat: number): void {
    if (!this.state) return;

    // Stop any current playback/animation
    this.loopService.stop();
    this.state.setIsPlaying(false);
    this.animationTarget = null;

    // Clamp beat to valid range
    const clampedBeat = Math.max(0, Math.min(beat, this.state.totalBeats));
    this.state.setCurrentBeat(clampedBeat);

    // Calculate state for this beat
    this.animationEngine.calculateState(clampedBeat);
    this.updatePropStatesFromEngine();
  }

  animateToBeat(beat: number, duration: number = 300, linear: boolean = false): void {
    if (!this.state) {
      return;
    }

    // Clamp target beat to valid range
    const clampedBeat = Math.max(0, Math.min(beat, this.state.totalBeats));

    // If already animating to this target, don't restart
    if (this.animationTarget === clampedBeat) {
      return;
    }

    // If already at target, just update state
    if (Math.abs(this.state.currentBeat - clampedBeat) < 0.01) {
      this.animationEngine.calculateState(clampedBeat);
      this.updatePropStatesFromEngine();
      return;
    }

    // Stop any current playback/animation
    this.loopService.stop();
    this.state.setIsPlaying(false);

    // Set up animation parameters
    this.animationTarget = clampedBeat;
    this.animationStartBeat = this.state.currentBeat;
    this.animationStartTime = performance.now();
    this.animationDuration = duration;
    this.useLinearAnimation = linear;

    // Start the animation loop with a custom callback
    this.loopService.start(
      () => this.onAnimateToBeatUpdate(),
      1.0 // Speed doesn't matter for time-based animation
    );
  }

  private onAnimateToBeatUpdate(): void {
    if (!this.state || this.animationTarget === null) {
      this.loopService.stop();
      return;
    }

    const elapsed = performance.now() - this.animationStartTime;
    const progress = Math.min(elapsed / this.animationDuration, 1.0);

    // Use linear interpolation for continuous playback, ease-out for manual selection
    const interpolatedProgress = this.useLinearAnimation
      ? progress
      : 1 - Math.pow(1 - progress, 3); // Ease-out cubic

    // Interpolate from start to target beat
    const currentBeat =
      this.animationStartBeat +
      (this.animationTarget - this.animationStartBeat) * interpolatedProgress;

    this.state.setCurrentBeat(currentBeat);
    this.animationEngine.calculateState(currentBeat);
    this.updatePropStatesFromEngine();

    // Check if animation is complete
    if (progress >= 1.0) {
      const finalBeat = this.animationTarget;
      this.loopService.stop();
      this.animationTarget = null;
      // Ensure we're exactly at the target
      this.state.setCurrentBeat(finalBeat);
      this.animationEngine.calculateState(finalBeat);
      this.updatePropStatesFromEngine();
    }
  }

  nextBeat(): void {
    if (!this.state) return;

    const nextBeat = this.state.currentBeat + 1;
    if (nextBeat < this.state.totalBeats) {
      this.jumpToBeat(nextBeat);
    }
  }

  previousBeat(): void {
    if (!this.state) return;

    const prevBeat = this.state.currentBeat - 1;
    if (prevBeat >= 0) {
      this.jumpToBeat(prevBeat);
    }
  }

  setSpeed(speed: number): void {
    if (!this.state) return;

    this.state.setSpeed(speed);

    // Update loop service if currently playing
    if (this.state.isPlaying) {
      this.loopService.setSpeed(speed);
    }
  }

  getCurrentPropStates(): { blue: PropState; red: PropState } {
    return this.animationEngine.getCurrentPropStates();
  }

  dispose(): void {
    this.loopService.stop();
    this.state = null;
    this.sequenceData = null;
  }

  private onAnimationUpdate(deltaTime: number): void {
    if (!this.state) return;

    // Calculate beat delta based on deltaTime (milliseconds)
    // NOTE: deltaTime is already adjusted by speed in AnimationLoopService
    // Assuming 60 BPM as default (1 beat per second)
    const DEFAULT_BPM = 60;
    const beatsPerSecond = DEFAULT_BPM / 60; // = 1.0
    const beatDelta = (deltaTime / 1000) * beatsPerSecond;
    const newBeat = this.state.currentBeat + beatDelta;

    // Determine animation end beat based on whether sequence is seamlessly loopable
    // If seamlessly loopable, end at totalBeats (skip the start position beat)
    // Otherwise, add 1 beat buffer to show start position again
    const animationEndBeat = this.isSeamlesslyLoopable
      ? this.state.totalBeats
      : this.state.totalBeats + 1;

    if (newBeat > animationEndBeat) {
      if (this.state.shouldLoop) {
        // Loop back to start
        this.state.setCurrentBeat(0);

        // Re-initialize engine if needed
        if (this.sequenceData) {
          this.animationEngine.initializeWithDomainData(this.sequenceData);
        }
      } else {
        // Stop at end
        this.state.setCurrentBeat(this.state.totalBeats);
        this.loopService.stop();
        this.state.setIsPlaying(false);
      }
    } else {
      this.state.setCurrentBeat(newBeat);
    }

    // Calculate state for current beat
    this.animationEngine.calculateState(this.state.currentBeat);

    // Update prop states
    this.updatePropStatesFromEngine();
  }

  private updatePropStatesFromEngine(): void {
    if (!this.state) return;

    const states = this.animationEngine.getCurrentPropStates();

    this.state.setPropStates(states.blue, states.red);
  }
}

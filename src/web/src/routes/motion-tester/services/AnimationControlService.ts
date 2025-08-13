import { StandalonePortedEngine, type PropState } from "$lib/animator";
import type { MotionTestParams } from "./MotionParameterService";

export interface AnimationState {
  isPlaying: boolean;
  progress: number;
  currentBeat: number;
}

export interface PropVisibility {
  blue: boolean;
  red: boolean;
}

export interface PropStates {
  blue?: PropState;
  red?: PropState;
}

export class AnimationControlService {
  private animationEngine: StandalonePortedEngine;
  private animationFrameId: number | null = null;

  constructor() {
    this.animationEngine = new StandalonePortedEngine();
  }

  // Initialize the animation engine with motion data
  async initializeEngine(blueParams: MotionTestParams, redParams: MotionTestParams): Promise<boolean> {
    try {
      const sequence = this.createDualPropTestSequence(blueParams, redParams);
      await this.animationEngine.initialize(sequence);
      return true;
    } catch (error) {
      console.error("Failed to initialize animation engine:", error);
      return false;
    }
  }

  // Create a test sequence with dual prop motion
  private createDualPropTestSequence(blueParams: MotionTestParams, redParams: MotionTestParams) {
    return {
      metadata: {
        title: "Motion Tester",
        description: "Testing individual motions",
        difficulty: "beginner",
        beats_per_minute: 120,
        total_beats: 1,
      },
      steps: [
        // Beat 1: Motion step
        {
          beat: 1,
          letter: "TEST",
          letter_type: "motion",
          blue_attributes: this.convertToAttributes(blueParams),
          red_attributes: this.convertToAttributes(redParams),
        },
      ],
    };
  }

  private convertToAttributes(params: MotionTestParams) {
    return {
      start_loc: params.startLoc,
      end_loc: params.endLoc,
      start_ori: params.startOri,
      end_ori: params.endOri,
      motion_type: params.motionType,
      prop_rot_dir: params.propRotDir,
      turns: params.turns,
    };
  }

  // Get current prop states
  getCurrentPropStates(): PropStates {
    const states = this.animationEngine.getCurrentPropStates();
    return {
      blue: states?.blue,
      red: states?.red,
    };
  }

  // Set animation progress (0-1)
  setProgress(progress: number): void {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    this.animationEngine.setProgress(clampedProgress);
  }

  // Get current animation progress
  getProgress(): number {
    return this.animationEngine.getProgress() || 0;
  }

  // Start animation playback
  startAnimation(): void {
    if (this.animationFrameId) {
      this.stopAnimation();
    }

    const animate = () => {
      const currentProgress = this.getProgress();
      if (currentProgress < 1) {
        this.setProgress(currentProgress + 0.01); // Increment by 1%
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.animationFrameId = null;
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  // Stop animation playback
  stopAnimation(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // Reset animation to beginning
  resetAnimation(): void {
    this.stopAnimation();
    this.setProgress(0);
  }

  // Check if animation is playing
  isPlaying(): boolean {
    return this.animationFrameId !== null;
  }

  // Get current beat based on progress
  getCurrentBeat(): number {
    return this.getProgress(); // For single beat motion, progress = beat
  }

  // Set prop visibility
  setPropVisibility(prop: 'blue' | 'red', visible: boolean): void {
    this.animationEngine.setPropVisibility(prop, visible);
  }

  // Get prop visibility
  getPropVisibility(prop: 'blue' | 'red'): boolean {
    return this.animationEngine.getPropVisibility(prop);
  }

  // Check if engine is initialized
  isEngineInitialized(): boolean {
    return this.animationEngine.isInitialized();
  }

  // Get total beats
  getTotalBeats(): number {
    return 1; // Single beat for motion testing
  }

  // Cleanup resources
  dispose(): void {
    this.stopAnimation();
    // Additional cleanup if needed
  }
}

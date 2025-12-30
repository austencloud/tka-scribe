/**
 * LightsOffProvider - DI wrapper for reactive Lights Off state
 *
 * Wraps the AnimationVisibilityStateManager singleton to provide:
 * 1. Clean DI interface for dependency injection
 * 2. Proper subscription pattern (vs polling)
 * 3. Type-safe access to Lights Off state
 */

import { injectable } from "inversify";
import type { ILightsOffProvider } from "../contracts/ILightsOffProvider";
import { getAnimationVisibilityManager } from "../../state/animation-visibility-state.svelte";

@injectable()
export class LightsOffProvider implements ILightsOffProvider {
  private manager = getAnimationVisibilityManager();
  private subscribers = new Map<(lightsOff: boolean) => void, () => void>();

  isLightsOff(): boolean {
    return this.manager.isLightsOff();
  }

  subscribe(callback: (lightsOff: boolean) => void): () => void {
    // Create an observer that calls our callback with current value
    const observer = () => {
      callback(this.manager.isLightsOff());
    };

    // Register with the manager
    this.manager.registerObserver(observer);

    // Store for cleanup
    this.subscribers.set(callback, () => {
      this.manager.unregisterObserver(observer);
    });

    // Immediately call with current value
    callback(this.manager.isLightsOff());

    // Return unsubscribe function
    return () => {
      const unsubscribe = this.subscribers.get(callback);
      if (unsubscribe) {
        unsubscribe();
        this.subscribers.delete(callback);
      }
    };
  }

  setLightsOff(value: boolean): void {
    this.manager.setLightsOff(value);
  }
}

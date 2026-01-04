/**
 * ILightsOffProvider - Contract for reactive Dark Mode state access
 *
 * Provides a clean DI interface to the global Dark Mode setting.
 * Components can subscribe to changes instead of polling.
 */

export interface ILightsOffProvider {
  /**
   * Get the current Dark Mode state
   */
  isLightsOff(): boolean;

  /**
   * Subscribe to Dark Mode state changes
   * Returns an unsubscribe function
   */
  subscribe(callback: (lightsOff: boolean) => void): () => void;

  /**
   * Set the Dark Mode state
   */
  setLightsOff(value: boolean): void;
}

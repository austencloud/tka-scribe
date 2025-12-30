/**
 * ILightsOffProvider - Contract for reactive Lights Off state access
 *
 * Provides a clean DI interface to the global Lights Off setting.
 * Components can subscribe to changes instead of polling.
 */

export interface ILightsOffProvider {
  /**
   * Get the current Lights Off state
   */
  isLightsOff(): boolean;

  /**
   * Subscribe to Lights Off state changes
   * Returns an unsubscribe function
   */
  subscribe(callback: (lightsOff: boolean) => void): () => void;

  /**
   * Set the Lights Off state
   */
  setLightsOff(value: boolean): void;
}

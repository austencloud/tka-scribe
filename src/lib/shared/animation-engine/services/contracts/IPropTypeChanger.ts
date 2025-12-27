/**
 * Prop Type Change Service Interface
 *
 * Watches for prop type changes from settings and triggers texture reloading.
 */

import type { ISettingsState } from "$lib/shared/settings/services/contracts/ISettingsState";

/**
 * Current prop types
 */
export interface PropTypeState {
  bluePropType: string;
  redPropType: string;
  legacyPropType: string;
}

/**
 * Callback for prop type state changes
 */
export type PropTypeStateCallback = (state: PropTypeState) => void;

/**
 * Callback for triggering texture reload
 */
export type TextureReloadCallback = () => void;

/**
 * Service for handling prop type changes
 */
export interface IPropTypeChangeService {
  /**
   * Set callback for state changes
   */
  setStateCallback(callback: PropTypeStateCallback): void;

  /**
   * Set callback for texture reload trigger
   */
  setTextureReloadCallback(callback: TextureReloadCallback): void;

  /**
   * Check for prop type changes from settings
   * @param settingsService The settings service to read from
   */
  checkForChanges(settingsService: ISettingsState | null): void;

  /**
   * Get current state
   */
  getState(): PropTypeState;

  /**
   * Clean up resources
   */
  dispose(): void;
}

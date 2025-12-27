/**
 * Trail Settings Sync Service Interface
 *
 * Manages synchronization of trail settings between external sources,
 * local state, and the trail capture service.
 */

import type { TrailSettings } from "../../domain/types/TrailTypes";
import type { ITrailCaptureService } from "$lib/features/compose/services/contracts/ITrailCaptureService";

/**
 * Callback for triggering re-renders
 */
export type RenderTriggerCallback = () => void;

/**
 * Callback for updating local trail settings
 */
export type TrailSettingsUpdateCallback = (settings: TrailSettings) => void;

/**
 * Service for syncing trail settings
 */
export interface ITrailSettingsSynchronizer {
  /**
   * Initialize the service with dependencies
   */
  initialize(
    trailCaptureService: ITrailCaptureService | null,
    renderTrigger: RenderTriggerCallback
  ): void;

  /**
   * Set callback for local settings updates
   */
  setSettingsUpdateCallback(callback: TrailSettingsUpdateCallback): void;

  /**
   * Handle trail settings change - updates service, saves to localStorage if needed
   * @param settings Current trail settings
   * @param hasExternalSettings Whether settings come from external source
   */
  handleSettingsChange(
    settings: TrailSettings,
    hasExternalSettings: boolean
  ): void;

  /**
   * Handle external settings sync - updates local settings from external source
   * @param externalSettings External settings to sync (undefined if not provided)
   */
  handleExternalSettingsSync(externalSettings: TrailSettings | undefined): void;

  /**
   * Clean up resources
   */
  dispose(): void;
}

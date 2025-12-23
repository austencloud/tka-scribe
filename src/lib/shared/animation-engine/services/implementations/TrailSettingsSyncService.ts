/**
 * Trail Settings Sync Service Implementation
 *
 * Manages synchronization of trail settings between external sources,
 * local state, and the trail capture service.
 */

import type { TrailSettings, TrailMode } from "../../domain/types/TrailTypes";
import { TrailMode as TrailModeEnum } from "../../domain/types/TrailTypes";
import type { ITrailCaptureService } from "$lib/features/compose/services/contracts/ITrailCaptureService";
import { saveTrailSettings } from "$lib/features/compose/utils/animation-panel-persistence";
import type {
  ITrailSettingsSyncService,
  RenderTriggerCallback,
  TrailSettingsUpdateCallback,
} from "../contracts/ITrailSettingsSyncService";

export class TrailSettingsSyncService implements ITrailSettingsSyncService {
  private trailCaptureService: ITrailCaptureService | null = null;
  private renderTrigger: RenderTriggerCallback | null = null;
  private settingsUpdateCallback: TrailSettingsUpdateCallback | null = null;

  initialize(
    trailCaptureService: ITrailCaptureService | null,
    renderTrigger: RenderTriggerCallback
  ): void {
    this.trailCaptureService = trailCaptureService;
    this.renderTrigger = renderTrigger;
  }

  setSettingsUpdateCallback(callback: TrailSettingsUpdateCallback): void {
    this.settingsUpdateCallback = callback;
  }

  handleSettingsChange(
    settings: TrailSettings,
    hasExternalSettings: boolean
  ): void {
    // Update service with new settings (if available)
    if (this.trailCaptureService) {
      this.trailCaptureService.updateSettings(settings);

      if (!settings.enabled || settings.mode === TrailModeEnum.OFF) {
        this.trailCaptureService.clearTrails();
      }
    }

    // Only save to localStorage if NOT using external settings
    if (!hasExternalSettings) {
      saveTrailSettings(settings);
    }

    this.renderTrigger?.();
  }

  handleExternalSettingsSync(
    externalSettings: TrailSettings | undefined
  ): void {
    if (externalSettings !== undefined) {
      console.log("🎬 TrailSettingsSyncService received external settings:", {
        mode: externalSettings.mode,
        enabled: externalSettings.enabled,
        lineWidth: externalSettings.lineWidth,
        maxOpacity: externalSettings.maxOpacity,
      });
      this.settingsUpdateCallback?.({ ...externalSettings });
    }
  }

  dispose(): void {
    this.trailCaptureService = null;
    this.renderTrigger = null;
    this.settingsUpdateCallback = null;
  }
}

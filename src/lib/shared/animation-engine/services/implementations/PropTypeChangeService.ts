/**
 * Prop Type Change Service Implementation
 *
 * Watches for prop type changes from settings and triggers texture reloading.
 */

import type { ISettingsState } from "$lib/shared/settings/services/contracts/ISettingsState";
import type {
  IPropTypeChangeService,
  PropTypeState,
  PropTypeStateCallback,
  TextureReloadCallback,
} from "../contracts/IPropTypeChangeService";

export class PropTypeChangeService implements IPropTypeChangeService {
  private state: PropTypeState = {
    bluePropType: "staff",
    redPropType: "staff",
    legacyPropType: "staff",
  };

  private stateCallback: PropTypeStateCallback | null = null;
  private textureReloadCallback: TextureReloadCallback | null = null;

  setStateCallback(callback: PropTypeStateCallback): void {
    this.stateCallback = callback;
  }

  setTextureReloadCallback(callback: TextureReloadCallback): void {
    this.textureReloadCallback = callback;
  }

  checkForChanges(settingsService: ISettingsState | null): void {
    if (!settingsService) return;

    const settings = settingsService.currentSettings;
    const newBluePropType =
      settings.bluePropType || settings.propType || "staff";
    const newRedPropType = settings.redPropType || settings.propType || "staff";

    if (
      newBluePropType !== this.state.bluePropType ||
      newRedPropType !== this.state.redPropType
    ) {
      this.state = {
        bluePropType: newBluePropType,
        redPropType: newRedPropType,
        legacyPropType: newBluePropType, // Legacy compatibility
      };

      this.stateCallback?.(this.state);
      this.textureReloadCallback?.();
    }
  }

  getState(): PropTypeState {
    return { ...this.state };
  }

  dispose(): void {
    this.stateCallback = null;
    this.textureReloadCallback = null;
  }
}

/**
 * Settings Service Interface
 *
 * Interface for managing application settings and user preferences.
 * Handles loading, saving, and updating application configuration.
 */

import type { AppSettings } from "$shared";

export interface ISettingsState {
  currentSettings: AppSettings;
  settings: AppSettings;
  updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): void;
  updateSettings(settings: Partial<AppSettings>): void;
  loadSettings(): void;
  clearStoredSettings(): void;
  debugSettings(): void;
  resetToDefaults(): void;
}

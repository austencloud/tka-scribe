/**
 * Settings Service
 *
 * Manages application settings with persistence to localStorage and Firebase.
 * - localStorage: Always used for offline support and fast initial load
 * - Firebase: Used when authenticated for cross-device sync
 *
 * Sync strategy:
 * - On save: Write to localStorage immediately, then to Firebase (if authenticated)
 * - On login: Merge Firebase settings with local (Firebase wins for conflicts)
 * - On logout: Keep local settings (allows offline use)
 */

import { browser } from "$app/environment";
import type { ISettingsService } from "$shared";
import { injectable } from "inversify";
import { BackgroundType, updateBodyBackground } from "../../background";
import { GridMode } from "../../pictograph";
import { ThemeService } from "../../theme";
import type { AppSettings } from "../domain";
import { tryResolve } from "$shared/inversify/container";
import { TYPES } from "$shared/inversify/types";
import type { IActivityLogService } from "$shared/analytics";
import type { ISettingsPersistenceService } from "../services/contracts/ISettingsPersistenceService";
import { authStore } from "$shared/auth/stores/authStore.svelte";

const SETTINGS_STORAGE_KEY = "tka-modern-web-settings";

const DEFAULT_SETTINGS: AppSettings = {
  gridMode: GridMode.DIAMOND,
  backgroundType: BackgroundType.NIGHT_SKY,
  backgroundQuality: "medium",
  backgroundEnabled: true,
  hapticFeedback: true,
  reducedMotion: false,
  catDogMode: false, // Default: both hands use the same prop
} as AppSettings;

// Initialize with loaded settings immediately (non-reactive)
const initialSettings = (() => {
  if (!browser) return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(stored);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
})();

// Create reactive settings state with loaded settings
const settingsState = $state<AppSettings>(initialSettings);

@injectable()
class SettingsState implements ISettingsService {
  private firebasePersistence: ISettingsPersistenceService | null = null;
  private unsubscribeFirebaseSync: (() => void) | null = null;
  private syncInitialized = false;

  constructor() {
    // Settings are already loaded from localStorage in the reactive state
    // Firebase sync will be initialized when user authenticates
  }

  /**
   * Initialize Firebase sync for authenticated users
   * This should be called after the DI container is ready
   */
  async initializeFirebaseSync(): Promise<void> {
    if (this.syncInitialized) return;
    this.syncInitialized = true;

    // Try to get the Firebase persistence service
    try {
      this.firebasePersistence = tryResolve<ISettingsPersistenceService>(
        TYPES.ISettingsPersistenceService
      );
    } catch {
      console.warn(
        "⚠️ [SettingsState] Firebase persistence service not available"
      );
      return;
    }

    // If user is authenticated, sync settings from Firebase
    if (authStore.isAuthenticated && this.firebasePersistence) {
      await this.syncFromFirebase();

      // Subscribe to real-time updates from other devices
      if (this.firebasePersistence.onSettingsChange) {
        this.unsubscribeFirebaseSync = this.firebasePersistence.onSettingsChange(
          (remoteSettings) => {
            // Apply remote settings (merge with local)
            this.applyRemoteSettings(remoteSettings);
          }
        );
      }
    }
  }

  /**
   * Sync settings from Firebase (called on login)
   */
  async syncFromFirebase(): Promise<void> {
    if (!this.firebasePersistence || !authStore.isAuthenticated) return;

    try {
      const firebaseSettings = await this.firebasePersistence.loadSettings();
      if (firebaseSettings) {
        // Merge Firebase settings with local (Firebase wins for conflicts)
        this.applyRemoteSettings(firebaseSettings);
        console.log("✅ [SettingsState] Synced settings from Firebase");
      } else {
        // No Firebase settings - push local settings to Firebase
        await this.firebasePersistence.saveSettings(settingsState);
        console.log("✅ [SettingsState] Pushed local settings to Firebase");
      }
    } catch (error) {
      console.error("❌ [SettingsState] Failed to sync from Firebase:", error);
    }
  }

  /**
   * Apply remote settings without triggering a save back to Firebase
   */
  private applyRemoteSettings(remoteSettings: AppSettings): void {
    // Merge with defaults and current local settings
    const merged = { ...DEFAULT_SETTINGS, ...settingsState, ...remoteSettings };

    // Apply to state
    for (const key in merged) {
      if (Object.prototype.hasOwnProperty.call(merged, key)) {
        settingsState[key as keyof AppSettings] = merged[
          key as keyof AppSettings
        ] as never;
      }
    }

    // Update background if changed
    if (remoteSettings.backgroundType) {
      updateBodyBackground(remoteSettings.backgroundType);
      ThemeService.updateTheme(remoteSettings.backgroundType);
    }

    // Save to localStorage for offline access
    this.saveSettingsToStorage(settingsState);
  }

  /**
   * Clean up Firebase sync subscription
   */
  cleanup(): void {
    if (this.unsubscribeFirebaseSync) {
      this.unsubscribeFirebaseSync();
      this.unsubscribeFirebaseSync = null;
    }
  }

  // ============================================================================
  // GETTERS
  // ============================================================================

  get settings() {
    return settingsState;
  }

  get currentSettings() {
    return settingsState;
  }

  // ============================================================================
  // ACTIONS
  // ============================================================================

  async updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<void> {
    const previousValue = settingsState[key];

    // CRITICAL: Direct assignment for Svelte 5 reactivity
    settingsState[key] = value;

    // Update body background immediately if background type changed
    if (key === "backgroundType") {
      updateBodyBackground(value as BackgroundType);
      ThemeService.updateTheme(value as string);
    }

    this.saveSettings();

    // Log settings change for analytics (non-blocking)
    try {
      const activityService = tryResolve<IActivityLogService>(TYPES.IActivityLogService);
      if (activityService) {
        void activityService.logSettingChange(key, String(previousValue), String(value));
      }
    } catch {
      // Silently fail - activity logging is non-critical
    }
  }

  async updateSettings(newSettings: Partial<AppSettings>): Promise<void> {
    // CRITICAL: In Svelte 5, we need to update individual properties to trigger reactivity
    // Object.assign doesn't trigger Svelte 5 runes reactivity
    for (const key in newSettings) {
      if (Object.prototype.hasOwnProperty.call(newSettings, key)) {
        settingsState[key as keyof AppSettings] = newSettings[
          key as keyof AppSettings
        ] as never;
      }
    }

    // Update body background immediately if background type changed
    if (newSettings.backgroundType) {
      updateBodyBackground(newSettings.backgroundType);
      ThemeService.updateTheme(newSettings.backgroundType);
    }

    this.saveSettings();
  }

  async loadSettings(): Promise<void> {
    const loadedSettings = this.loadSettingsFromStorage();
    Object.assign(settingsState, loadedSettings);
  }

  saveSettings(): void {
    // Always save to localStorage first (offline support)
    this.saveSettingsToStorage(settingsState);

    // If authenticated, also save to Firebase (non-blocking)
    if (authStore.isAuthenticated && this.firebasePersistence) {
      void this.firebasePersistence.saveSettings(settingsState).catch((error) => {
        console.error("❌ [SettingsState] Failed to save to Firebase:", error);
      });
    }
  }

  clearStoredSettings(): void {
    if (!browser) return;

    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      Object.assign(settingsState, DEFAULT_SETTINGS);

      // Also clear from Firebase if authenticated
      if (authStore.isAuthenticated && this.firebasePersistence) {
        void this.firebasePersistence.clearSettings().catch((error) => {
          console.error("❌ [SettingsState] Failed to clear Firebase settings:", error);
        });
      }
    } catch (error) {
      console.error("Failed to clear stored settings:", error);
    }
  }

  async resetToDefaults(): Promise<void> {
    Object.assign(settingsState, DEFAULT_SETTINGS);
    this.saveSettings();
  }

  debugSettings(): void {
    if (!browser) return;

    try {
      console.log("🔍 Debug Settings:", {
        stored: localStorage.getItem(SETTINGS_STORAGE_KEY),
        parsed: JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || "{}"),
        current: settingsState,
      });
    } catch (error) {
      console.error("Error debugging settings:", error);
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private loadSettingsFromStorage(): AppSettings {
    if (!browser) return DEFAULT_SETTINGS;

    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!stored) {
        return DEFAULT_SETTINGS;
      }

      const parsed = JSON.parse(stored);
      const merged = { ...DEFAULT_SETTINGS, ...parsed };

      // Ensure developer mode is enabled for all tabs visibility
      if (
        merged.developerMode === false ||
        merged.developerMode === undefined
      ) {
        merged.developerMode = true;
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
      }

      return merged;
    } catch (error) {
      console.warn("Failed to load settings from localStorage:", error);
      return DEFAULT_SETTINGS;
    }
  }

  private saveSettingsToStorage(settings: AppSettings): void {
    if (!browser) return;

    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  }
}

// Export the class for DI container
export { SettingsState };

// Singleton instance
export const settingsService = new SettingsState();

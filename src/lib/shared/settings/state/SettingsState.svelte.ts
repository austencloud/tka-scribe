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
import { injectable } from "inversify";
import { BackgroundType } from "../../background/shared/domain/enums/background-enums";
import { updateBodyBackground, type CustomBackgroundOptions } from "../../background/shared/background-preloader";
import { ThemeService } from "../../theme/services/ThemeService";
import { GridMode } from "../../pictograph/grid/domain/enums/grid-enums";
import { PropType } from "../../pictograph/prop/domain/enums/PropType";
import type { AppSettings } from "../domain/AppSettings";
import { tryResolve } from "../../inversify/di";
import { TYPES } from "../../inversify/types";
import type { ISettingsPersistenceService } from "../services/contracts/ISettingsPersistenceService";
import { authState } from "../../auth/state/authState.svelte";
import type { ISettingsState } from "../services/contracts/ISettingsState";
import type { IActivityLogService } from "../../analytics/services/contracts/IActivityLogService";
import { createComponentLogger } from "$lib/shared/utils/debug-logger";
import { recordBackgroundChange } from "./background-popularity-state.svelte";

const debug = createComponentLogger("SettingsState");

const SETTINGS_STORAGE_KEY = "tka-modern-web-settings";
const OFFLINE_QUEUE_KEY = "tka-settings-offline-queue";

const DEFAULT_SETTINGS: AppSettings = {
  gridMode: GridMode.DIAMOND,
  // Use solidColor (black) as default to avoid flash while localStorage loads
  backgroundType: BackgroundType.SOLID_COLOR,
  backgroundQuality: "medium",
  backgroundEnabled: true,
  backgroundColor: "#000000", // Black background for solidColor
  hapticFeedback: true,
  reducedMotion: false,
  catDogMode: false, // Default: both hands use the same prop
  bluePropType: PropType.STAFF, // Default prop type for blue
  redPropType: PropType.STAFF, // Default prop type for red
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

/**
 * Get custom background options from settings for crossfade transition
 */
function getCustomBackgroundOptions(settings: Partial<AppSettings>): CustomBackgroundOptions {
  return {
    color: settings.backgroundColor,
    colors: settings.gradientColors,
    direction: settings.gradientDirection,
  };
}

@injectable()
class SettingsState implements ISettingsState {
  private firebasePersistence: ISettingsPersistenceService | null = null;
  private unsubscribeFirebaseSync: (() => void) | null = null;
  private syncInitialized = false;
  private isSavingToFirebase = false; // Prevent re-entrant saves
  private pendingFirebaseSave: Promise<void> | null = null;
  private onlineHandler: (() => void) | null = null;

  constructor() {
    // Settings are already loaded from localStorage in the reactive state
    // Firebase sync will be initialized when user authenticates
    // Process any offline queue on startup
    if (browser) {
      this.processOfflineQueue();
      
      // Listen for online events to process queued changes
      this.onlineHandler = () => {
        console.log("🌐 [SettingsState] Back online, processing offline queue...");
        this.processOfflineQueue();
      };
      window.addEventListener("online", this.onlineHandler);
    }
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

    // Process any queued offline changes first
    await this.processOfflineQueue();

    // If user is authenticated, sync settings from Firebase
    if (authState.isAuthenticated && this.firebasePersistence) {
      await this.syncFromFirebase();

      // Subscribe to real-time updates from other devices
      if (this.firebasePersistence.onSettingsChange) {
        this.unsubscribeFirebaseSync = this.firebasePersistence.onSettingsChange(
          (remoteSettings) => {
            // Only apply remote settings if we're not in the middle of saving
            // This prevents our own saves from being re-applied
            if (!this.isSavingToFirebase) {
              this.applyRemoteSettings(remoteSettings);
            }
          }
        );
      }
    }
  }

  /**
   * Sync settings from Firebase (called on login)
   * Uses timestamp-based conflict resolution: local wins if newer
   */
  async syncFromFirebase(): Promise<void> {
    if (!this.firebasePersistence || !authState.isAuthenticated) return;

    try {
      const firebaseSettings = await this.firebasePersistence.loadSettings();
      const localTimestamp = settingsState._localTimestamp || 0;
      
      if (firebaseSettings) {
        // Check if we have pending local changes that are newer
        if (localTimestamp > 0) {
          // We have local changes with a timestamp - push them to Firebase
          // This ensures local changes made while offline are not lost
          debug.success("Local settings are newer, pushing to Firebase");
          await this.firebasePersistence.saveSettings(this.getSettingsForPersistence());
        } else {
          // No local timestamp means fresh load - accept Firebase settings
          this.applyRemoteSettings(firebaseSettings);
          debug.success("Applied settings from Firebase");
        }
      } else {
        // No Firebase settings - push local settings to Firebase
        await this.firebasePersistence.saveSettings(this.getSettingsForPersistence());
        debug.success("Pushed local settings to Firebase");
      }
    } catch (error) {
      console.error("❌ [SettingsState] Failed to sync from Firebase:", error);
    }
  }

  /**
   * Get settings without internal metadata fields for persistence
   */
  private getSettingsForPersistence(): AppSettings {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _localTimestamp, ...settings } = settingsState;
    return settings as AppSettings;
  }

  /**
   * Apply remote settings without triggering a save back to Firebase
   * Only applies settings that weren't modified locally more recently
   */
  private applyRemoteSettings(remoteSettings: AppSettings): void {
    // Merge with defaults first, then layer remote settings
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _localTimestamp: _remoteTs, ...remoteWithoutMeta } = remoteSettings;
    const merged = { ...DEFAULT_SETTINGS, ...remoteWithoutMeta };

    // Apply to state (preserve local timestamp)
    const currentTimestamp = settingsState._localTimestamp;
    for (const key in merged) {
      if (Object.prototype.hasOwnProperty.call(merged, key) && key !== '_localTimestamp') {
        settingsState[key as keyof AppSettings] = merged[
          key as keyof AppSettings
        ] as never;
      }
    }
    // Clear local timestamp since we just synced from remote
    settingsState._localTimestamp = undefined;

    // Update background if changed
    if (remoteSettings.backgroundType) {
      updateBodyBackground(remoteSettings.backgroundType, getCustomBackgroundOptions(remoteSettings));
      ThemeService.updateTheme(remoteSettings.backgroundType);
    }

    // Save to localStorage for offline access
    this.saveSettingsToStorage(settingsState);
  }

  /**
   * Clean up Firebase sync subscription and event listeners
   */
  cleanup(): void {
    if (this.unsubscribeFirebaseSync) {
      this.unsubscribeFirebaseSync();
      this.unsubscribeFirebaseSync = null;
    }
    
    // Remove online event listener
    if (browser && this.onlineHandler) {
      window.removeEventListener("online", this.onlineHandler);
      this.onlineHandler = null;
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
    
    // Skip if value hasn't changed
    if (previousValue === value) {
      return;
    }

    // CRITICAL: Direct assignment for Svelte 5 reactivity
    settingsState[key] = value;
    
    // Track when this change was made locally
    settingsState._localTimestamp = Date.now();

    // Update body background immediately if background type changed
    if (key === "backgroundType") {
      updateBodyBackground(value as BackgroundType, getCustomBackgroundOptions(settingsState));
      ThemeService.updateTheme(value as string);

      // Track background popularity (non-blocking)
      void recordBackgroundChange(
        previousValue as string | undefined,
        value as string
      );
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
    // Track if background type actually changed
    const oldBackgroundType = settingsState.backgroundType;
    const newBackgroundType = newSettings.backgroundType;
    const backgroundTypeChanged = newBackgroundType && newBackgroundType !== oldBackgroundType;
    
    // CRITICAL: In Svelte 5, we need to update individual properties to trigger reactivity
    // Object.assign doesn't trigger Svelte 5 runes reactivity
    for (const key in newSettings) {
      if (Object.prototype.hasOwnProperty.call(newSettings, key)) {
        settingsState[key as keyof AppSettings] = newSettings[
          key as keyof AppSettings
        ] as never;
      }
    }
    
    // Track when these changes were made locally
    settingsState._localTimestamp = Date.now();

    // Update body background immediately ONLY if background type actually changed
    if (backgroundTypeChanged) {
      updateBodyBackground(newBackgroundType, getCustomBackgroundOptions(newSettings));
      ThemeService.updateTheme(newBackgroundType);

      // Track background popularity (non-blocking)
      void recordBackgroundChange(
        oldBackgroundType as string | undefined,
        newBackgroundType as string
      );
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

    // If authenticated, also save to Firebase with offline queue support
    if (authState.isAuthenticated && this.firebasePersistence) {
      this.saveToFirebaseWithRetry();
    }
  }

  /**
   * Save to Firebase with retry and offline queue support
   */
  private saveToFirebaseWithRetry(): void {
    if (!this.firebasePersistence) return;

    // Mark that we're saving to prevent real-time listener from re-applying our own changes
    this.isSavingToFirebase = true;

    const settingsToSave = this.getSettingsForPersistence();
    
    this.pendingFirebaseSave = this.firebasePersistence.saveSettings(settingsToSave)
      .then(() => {
        // Successfully saved - clear local timestamp since Firebase is now in sync
        settingsState._localTimestamp = undefined;
        this.saveSettingsToStorage(settingsState);
        // Clear offline queue since save succeeded
        this.clearOfflineQueue();
        console.log("✅ [SettingsState] Settings saved to Firebase");
      })
      .catch((error) => {
        console.error("❌ [SettingsState] Failed to save to Firebase:", error);
        // Queue for later if offline
        this.queueOfflineChange(settingsToSave);
      })
      .finally(() => {
        this.isSavingToFirebase = false;
        this.pendingFirebaseSave = null;
      });
  }

  /**
   * Queue settings for later sync when back online
   */
  private queueOfflineChange(settings: AppSettings): void {
    if (!browser) return;
    
    try {
      const queueEntry = {
        settings,
        timestamp: Date.now()
      };
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queueEntry));
      console.log("📦 [SettingsState] Queued settings for offline sync");
    } catch (error) {
      console.error("Failed to queue offline change:", error);
    }
  }

  /**
   * Process any queued offline changes
   */
  private async processOfflineQueue(): Promise<void> {
    if (!browser) return;
    
    try {
      const queuedData = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!queuedData) return;

      const queueEntry = JSON.parse(queuedData);
      if (!queueEntry?.settings) return;

      // If we have Firebase persistence and are online, sync the queued changes
      if (this.firebasePersistence && authState.isAuthenticated) {
        console.log("📤 [SettingsState] Processing offline queue...");
        await this.firebasePersistence.saveSettings(queueEntry.settings);
        this.clearOfflineQueue();
        console.log("✅ [SettingsState] Offline queue processed");
      }
    } catch (error) {
      console.error("Failed to process offline queue:", error);
    }
  }

  /**
   * Clear the offline queue
   */
  private clearOfflineQueue(): void {
    if (!browser) return;
    
    try {
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
    } catch (error) {
      console.error("Failed to clear offline queue:", error);
    }
  }

  clearStoredSettings(): void {
    if (!browser) return;

    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      Object.assign(settingsState, DEFAULT_SETTINGS);

      // Also clear from Firebase if authenticated
      if (authState.isAuthenticated && this.firebasePersistence) {
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

      // Clean up any _localTimestamp that was incorrectly saved to localStorage
      // This metadata field should only exist in memory, never persisted
      if ('_localTimestamp' in merged) {
        delete merged._localTimestamp;
      }

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
      // Filter out _localTimestamp - it's only for in-memory conflict resolution
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _localTimestamp, ...settingsToSave } = settings;
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsToSave));
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  }
}

// Export the class for DI container
export { SettingsState };

// Singleton instance
export const settingsService = new SettingsState();

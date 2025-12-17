/**
 * Share State Management
 *
 * Reactive state for the share interface using Svelte 5 runes.
 */

import type { SequenceData } from "../../foundation/domain/models/SequenceData";
import type { ShareOptions } from '../domain/models/ShareOptions';
import { SHARE_PRESETS, DEFAULT_SHARE_OPTIONS } from '../domain/models/ShareOptions';
import type { IShareService } from '../services/contracts/IShareService';
import { tryResolve, TYPES } from '../../inversify/di';
import type { IActivityLogService } from "../../analytics/services/contracts/IActivityLogService";
import { createPersistenceHelper } from '../../state/utils/persistent-state';
import { getUser } from '../../auth/state/authState.svelte';
import { settingsService } from '../../settings/state/SettingsState.svelte';
import { PropType } from '../../pictograph/prop/domain/enums/PropType';

// Persisted content options (the toggleable chips in the share panel)
interface PersistedShareOptions {
  addWord: boolean;
  addBeatNumbers: boolean;
  addDifficultyLevel: boolean;
  includeStartPosition: boolean;
  addUserInfo: boolean;
}

const DEFAULT_PERSISTED_OPTIONS: PersistedShareOptions = {
  addWord: DEFAULT_SHARE_OPTIONS.addWord,
  addBeatNumbers: DEFAULT_SHARE_OPTIONS.addBeatNumbers,
  addDifficultyLevel: DEFAULT_SHARE_OPTIONS.addDifficultyLevel,
  includeStartPosition: DEFAULT_SHARE_OPTIONS.includeStartPosition,
  addUserInfo: DEFAULT_SHARE_OPTIONS.addUserInfo,
};

const shareOptionsPersistence = createPersistenceHelper({
  key: 'tka_share_prefs',
  defaultValue: DEFAULT_PERSISTED_OPTIONS,
});

export interface ShareState {
  // Current options
  readonly options: ShareOptions;
  readonly selectedPreset: string;

  // Preview state
  readonly previewUrl: string | null;
  readonly isGeneratingPreview: boolean;
  readonly previewError: string | null;

  // Download state
  readonly isDownloading: boolean;
  readonly downloadError: string | null;
  readonly lastDownloadedFile: string | null;

  // Actions
  updateOptions: (newOptions: Partial<ShareOptions>) => void;
  selectPreset: (presetName: string) => void;
  generatePreview: (sequence: SequenceData, forceRegenerate?: boolean) => Promise<void>;
  downloadImage: (sequence: SequenceData, filename?: string) => Promise<void>;
  resetErrors: () => void;

  // Cache access - for instant preview switching
  tryLoadFromCache: (sequence: SequenceData) => boolean;
  clearCache: () => void;
}

export function createShareState(shareService: IShareService): ShareState {
  // Load persisted content options
  const persistedOptions = shareOptionsPersistence.load();

  // Reactive state using Svelte 5 runes
  const socialPreset = SHARE_PRESETS["social"];
  if (!socialPreset) {
    throw new Error("Social preset not found in SHARE_PRESETS");
  }

  // Get the authenticated user's display name (fallback to empty string)
  const user = getUser();
  const userName = user?.displayName || "";

  // Merge persisted content options with the base preset and user info
  let options = $state<ShareOptions>({
    ...socialPreset.options,
    ...persistedOptions,
    userName,
  });
  let selectedPreset = $state<string>("custom"); // Start as custom since we loaded persisted options

  let previewUrl = $state<string | null>(null);
  let isGeneratingPreview = $state<boolean>(false);
  let previewError = $state<string | null>(null);

  let isDownloading = $state<boolean>(false);
  let downloadError = $state<string | null>(null);
  let lastDownloadedFile = $state<string | null>(null);

  // Preview cache for instant retrieval on repeated views
  const previewCache = new Map<string, string>();

  /**
   * Get current prop types from settings (with fallback to default)
   */
  function getCurrentPropTypes(): { blue: string; red: string } {
    const settings = settingsService.settings;
    const defaultPropType = PropType.STAFF;

    // Get bluePropType, falling back to propType (legacy), then default
    const bluePropType = settings.bluePropType || settings.propType || defaultPropType;

    // Get redPropType, falling back to propType (legacy), then default
    const redPropType = settings.redPropType || settings.propType || defaultPropType;

    console.log('🎯 [ShareState] getCurrentPropTypes():', {
      bluePropType,
      redPropType,
      settingsBlueProp: settings.bluePropType,
      settingsRedProp: settings.redPropType,
      settingsLegacyProp: settings.propType
    });

    return {
      blue: bluePropType,
      red: redPropType
    };
  }

  /**
   * Generate cache key from sequence ID and relevant options
   * IMPORTANT: All toggle options AND prop types must be included to avoid stale cache
   * Include prop types so changing props in settings invalidates the cache
   */
  function getCacheKey(sequenceId: string, opts: ShareOptions): string {
    const propTypes = getCurrentPropTypes();
    const key = `${sequenceId}-${opts.format}-${opts.addWord}-${opts.addBeatNumbers}-${opts.includeStartPosition}-${opts.addDifficultyLevel}-${opts.addUserInfo}-${propTypes.blue}-${propTypes.red}`;
    console.log('🔑 [ShareState] getCacheKey():', {
      sequenceId,
      propTypes,
      fullKey: key
    });
    return key;
  }

  return {
    // Getters
    get options() {
      return options;
    },
    get selectedPreset() {
      return selectedPreset;
    },
    get previewUrl() {
      return previewUrl;
    },
    get isGeneratingPreview() {
      return isGeneratingPreview;
    },
    get previewError() {
      return previewError;
    },
    get isDownloading() {
      return isDownloading;
    },
    get downloadError() {
      return downloadError;
    },
    get lastDownloadedFile() {
      return lastDownloadedFile;
    },

    // Actions
    updateOptions: (newOptions: Partial<ShareOptions>) => {
      options = { ...options, ...newOptions };
      selectedPreset = "custom"; // Mark as custom when manually changed
      previewError = null; // Clear preview error when options change
      // Note: We don't clear the cache here - it will simply miss on the next generatePreview call
      // This allows switching between presets without losing cached previews

      // Persist the content options (the toggleable chips)
      shareOptionsPersistence.save({
        addWord: options.addWord,
        addBeatNumbers: options.addBeatNumbers,
        addDifficultyLevel: options.addDifficultyLevel,
        includeStartPosition: options.includeStartPosition,
        addUserInfo: options.addUserInfo,
      });
    },

    selectPreset: (presetName: string) => {
      const preset = SHARE_PRESETS[presetName];
      if (preset) {
        // Preserve the user's display name when switching presets
        const currentUser = getUser();
        const currentUserName = currentUser?.displayName || "";
        options = { ...preset.options, userName: currentUserName };
        selectedPreset = presetName;
        previewError = null;

        // Persist the content options (the toggleable chips)
        shareOptionsPersistence.save({
          addWord: options.addWord,
          addBeatNumbers: options.addBeatNumbers,
          addDifficultyLevel: options.addDifficultyLevel,
          includeStartPosition: options.includeStartPosition,
          addUserInfo: options.addUserInfo,
        });
      }
    },

    generatePreview: async (sequence: SequenceData, forceRegenerate = false) => {
      if (!sequence) return;

      // Check cache first (unless forcing regeneration)
      if (!forceRegenerate) {
        const cacheKey = getCacheKey(sequence.id, options);
        const cachedPreview = previewCache.get(cacheKey);

        if (cachedPreview) {
          previewUrl = cachedPreview;
          previewError = null;
          return; // Return immediately with cached preview
        }
      }

      isGeneratingPreview = true;
      previewError = null;

      try {
        // Validate options first
        const validation = shareService.validateOptions(options);
        if (!validation.valid) {
          throw new Error(`Invalid options: ${validation.errors.join(", ")}`);
        }

        // CRITICAL FIX: Override sequence prop types with current settings
        // The sequence may have been generated with different prop types,
        // but we want the preview to always match the current settings
        const currentPropTypes = getCurrentPropTypes();

        // Helper to update motions prop types
        const updateMotionsPropTypes = (data: any) => {
          if (!data?.motions) return data;
          return {
            ...data,
            motions: {
              ...data.motions,
              blue: data.motions.blue ? {
                ...data.motions.blue,
                propType: currentPropTypes.blue
              } : data.motions.blue,
              red: data.motions.red ? {
                ...data.motions.red,
                propType: currentPropTypes.red
              } : data.motions.red,
            }
          };
        };

        const sequenceWithCurrentProps = {
          ...sequence,
          // Update all beats
          beats: sequence.beats?.map(beat => updateMotionsPropTypes(beat)) || [],
          // Update BOTH start position fields (primary and legacy)
          ...(sequence.startPosition && {
            startPosition: updateMotionsPropTypes(sequence.startPosition)
          }),
          ...(sequence.startingPositionBeat && {
            startingPositionBeat: updateMotionsPropTypes(sequence.startingPositionBeat)
          })
        };

        console.log('🎨 [ShareState] Generating preview with overridden prop types:', {
          originalPropTypes: sequence.beats?.[0]?.motions ? {
            blue: sequence.beats[0].motions.blue?.propType,
            red: sequence.beats[0].motions.red?.propType
          } : null,
          overriddenPropTypes: currentPropTypes
        });

        // Generate preview with the prop-type-overridden sequence
        const newPreviewUrl = await shareService.generatePreview(
          sequenceWithCurrentProps,
          options,
          forceRegenerate
        );

        // Cache the preview for future use
        const cacheKey = getCacheKey(sequence.id, options);
        previewCache.set(cacheKey, newPreviewUrl);

        // Clean up old preview URL (but not if it's cached)
        if (
          previewUrl &&
          !Array.from(previewCache.values()).includes(previewUrl)
        ) {
          URL.revokeObjectURL(previewUrl);
        }

        previewUrl = newPreviewUrl;
      } catch (error) {
        previewError =
          error instanceof Error ? error.message : "Failed to generate preview";
        console.error("Preview generation failed:", error);
      } finally {
        isGeneratingPreview = false;
      }
    },

    downloadImage: async (sequence: SequenceData, filename?: string) => {
      if (!sequence) return;

      isDownloading = true;
      downloadError = null;

      try {
        // Validate options first
        const validation = shareService.validateOptions(options);
        if (!validation.valid) {
          throw new Error(`Invalid options: ${validation.errors.join(", ")}`);
        }

        // CRITICAL FIX: Override sequence prop types with current settings (same as preview)
        const currentPropTypes = getCurrentPropTypes();

        // Helper to update motions prop types (same as in generatePreview)
        const updateMotionsPropTypes = (data: any) => {
          if (!data?.motions) return data;
          return {
            ...data,
            motions: {
              ...data.motions,
              blue: data.motions.blue ? {
                ...data.motions.blue,
                propType: currentPropTypes.blue
              } : data.motions.blue,
              red: data.motions.red ? {
                ...data.motions.red,
                propType: currentPropTypes.red
              } : data.motions.red,
            }
          };
        };

        const sequenceWithCurrentProps = {
          ...sequence,
          // Update all beats
          beats: sequence.beats?.map(beat => updateMotionsPropTypes(beat)) || [],
          // Update BOTH start position fields (primary and legacy)
          ...(sequence.startPosition && {
            startPosition: updateMotionsPropTypes(sequence.startPosition)
          }),
          ...(sequence.startingPositionBeat && {
            startingPositionBeat: updateMotionsPropTypes(sequence.startingPositionBeat)
          })
        };

        // Download image with the prop-type-overridden sequence
        await shareService.downloadImage(sequenceWithCurrentProps, options, filename);

        // Track successful download
        lastDownloadedFile =
          filename || shareService.generateFilename(sequence, options);

        // Log share/download action for analytics (non-blocking)
        try {
          const activityService = tryResolve<IActivityLogService>(TYPES.IActivityLogService);
          if (activityService) {
            void activityService.logShareAction("sequence_export", {
              sequenceId: sequence.id,
              format: options.format,
              sequenceWord: sequence.word,
            });
          }
        } catch {
          // Silently fail - activity logging is non-critical
        }
      } catch (error) {
        downloadError =
          error instanceof Error ? error.message : "Failed to download image";
        console.error("Download failed:", error);
      } finally {
        isDownloading = false;
      }
    },

    resetErrors: () => {
      previewError = null;
      downloadError = null;
    },

    // Synchronous cache check - returns true if cache hit and preview was updated
    tryLoadFromCache: (sequence: SequenceData): boolean => {
      if (!sequence) return false;

      const cacheKey = getCacheKey(sequence.id, options);
      const cachedPreview = previewCache.get(cacheKey);

      console.log('💾 [ShareState] tryLoadFromCache():', {
        sequenceId: sequence.id,
        sequenceWord: sequence.word,
        cacheKey,
        cacheHit: !!cachedPreview,
        cacheSize: previewCache.size,
        allCacheKeys: Array.from(previewCache.keys())
      });

      if (cachedPreview) {
        previewUrl = cachedPreview;
        previewError = null;
        console.log('✅ [ShareState] Cache HIT - using cached preview');
        return true; // Cache hit - preview updated instantly
      }

      console.log('❌ [ShareState] Cache MISS - need to generate');
      return false; // Cache miss - caller should generate
    },

    // Clear the preview cache (useful for debugging or forcing regeneration)
    clearCache: () => {
      console.log('🗑️ [ShareState] Clearing preview cache');
      previewCache.clear();
      previewUrl = null;
    },
  };
}

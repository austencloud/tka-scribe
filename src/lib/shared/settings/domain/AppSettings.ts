/**
 * Application Settings Domain Model
 *
 * Defines the structure for application-wide settings and configuration.
 * This is a domain type that represents the user's preferences and app state.
 */

import type { PropType } from "../../pictograph/prop/domain/enums/PropType";
import type { GridMode } from "../../pictograph/grid/domain/enums/grid-enums";
import type { BackgroundType } from "../../background/shared/domain/enums/background-enums";

export interface AppSettings {
  // Metadata for sync tracking (not persisted to Firebase)
  _localTimestamp?: number;
  
  gridMode: GridMode;
  userName?: string;
  propType?: PropType; // Legacy - kept for backward compatibility
  bluePropType?: PropType; // Per-color prop type for blue motions
  redPropType?: PropType; // Per-color prop type for red motions
  catDogMode?: boolean; // Whether CatDog Mode is enabled in prop type settings
  backupFrequency?: string;
  enableFades?: boolean;
  growSequence?: boolean;
  numBeats?: number;
  beatLayout?: string;

  // Background settings
  backgroundCategory?: "animated" | "simple";
  backgroundType?: BackgroundType;
  backgroundQuality?: "high" | "medium" | "low" | "minimal";
  backgroundEnabled?: boolean;

  // Simple background settings
  backgroundColor?: string; // For solid color backgrounds
  gradientColors?: string[]; // For gradient backgrounds (2-4 colors)
  gradientDirection?: number; // Gradient angle in degrees (0-360)

  // Accessibility & User Experience settings
  hapticFeedback?: boolean;
  reducedMotion?: boolean;

  // Keyboard shortcut settings
  singleKeyShortcuts?: boolean;
  showShortcutHints?: boolean;

  // Word Card Settings
  WordCard?: {
    defaultColumnCount?: number;
    defaultLayoutMode?: "grid" | "list" | "printable";
    enableTransparency?: boolean;
    cacheEnabled?: boolean;
    cacheSizeLimit?: number;
    exportQuality?: "low" | "medium" | "high";
    exportFormat?: "PNG" | "JPG" | "WebP";
    defaultPaperSize?: "A4" | "Letter" | "Legal" | "Tabloid";
  };
}

/**
 * Accessibility Settings
 * Subset of AppSettings focused on accessibility features
 */
export interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  visibleParticleSize?: number;
}

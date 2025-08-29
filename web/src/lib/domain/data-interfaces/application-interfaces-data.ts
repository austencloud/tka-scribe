/**
 * Application Service Interfaces
 *
 * Interfaces for application-level services including settings, initialization,
 * and configuration management.
 */
// BackgroundType is not exported from domain index, so import directly
// ============================================================================
// SHARED UTILITY SERVICES
// ============================================================================
/**
 * Service for centralized enum mapping utilities
 */
import type { PropState } from "$lib/components/tabs/browse-tab/animator/types/PropState";
import { BackgroundType } from "$lib/domain/background/BackgroundTypes";
import type { BeatData } from "$lib/domain/build/workbench/BeatData";
import type { GridMode } from "$lib/domain/core";

// ============================================================================
// DATA CONTRACTS (Domain Models)
// ============================================================================

export interface AppSettings {
  theme: "light" | "dark";
  gridMode: GridMode;
  showBeatNumbers: boolean;
  autoSave: boolean;
  exportQuality: "low" | "medium" | "high";
  workbenchColumns: number;
  userName?: string;
  propType?: string;
  backupFrequency?: string;
  enableFades?: boolean;
  animationsEnabled?: boolean; // Simple animation control
  growSequence?: boolean;
  numBeats?: number;
  beatLayout?: string;
  // Background settings
  backgroundType?: BackgroundType;
  backgroundQuality?: "high" | "medium" | "low" | "minimal";
  backgroundEnabled?: boolean;
  visibility?: {
    TKA?: boolean;
    Reversals?: boolean;
    Positions?: boolean;
    Elemental?: boolean;
    VTG?: boolean;
    nonRadialPoints?: boolean;
  };
  imageExport?: {
    includeStartPosition?: boolean;
    addReversalSymbols?: boolean;
    addBeatNumbers?: boolean;
    addDifficultyLevel?: boolean;
    addWord?: boolean;
    addInfo?: boolean;
    addUserInfo?: boolean;
  };
  // Sequence Card Settings
  sequenceCard?: {
    defaultColumnCount?: number;
    defaultLayoutMode?: "grid" | "list" | "printable";
    enableTransparency?: boolean;
    cacheEnabled?: boolean;
    cacheSizeLimit?: number;
    exportQuality?: "low" | "medium" | "high";
    exportFormat?: "PNG" | "JPG" | "WebP";
    defaultPaperSize?: "A4" | "Letter" | "Legal" | "Tabloid";
  };
  // Developer Settings
  developerMode?: boolean;
}

export interface SequenceMetadata {
  word: string;
  author: string;
  totalBeats: number;
}

export interface PropStates {
  blue: PropState;
  red: PropState;
}

export interface InterpolationResult {
  blueAngles: {
    centerPathAngle: number;
    staffRotationAngle: number;
  };
  redAngles: {
    centerPathAngle: number;
    staffRotationAngle: number;
  };
  isValid: boolean;
}

export interface BeatCalculationResult {
  currentBeatIndex: number;
  beatProgress: number;
  currentBeatData: BeatData;
  isValid: boolean;
}

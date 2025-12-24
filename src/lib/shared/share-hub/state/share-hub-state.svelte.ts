/**
 * Share Hub State Management - Unified Panel Architecture
 *
 * Manages state for the unified Share Hub panel with Single Media | Composite toggle.
 * All state is reactive using Svelte 5 runes ($state, $derived).
 *
 * State Structure:
 * - mode: 'single' | 'composite' (top-level toggle)
 * - selectedFormat: format selected in Single Media mode
 * - compositeLayout: configuration for Composite mode (orientation + pieces)
 * - settingsPanel: open/closed state + context (which format's settings?)
 * - format-specific settings: animation, static, performance configurations
 *
 * Domain: Share Hub - Unified State Management
 */

import type { ShareMode } from '../domain/models/ShareMode';
import type { MediaFormat } from '../domain/models/MediaFormat';
import type { CompositeLayout } from '../domain/models/CompositeLayout';
import { DEFAULT_COMPOSITE_LAYOUT } from '../domain/models/CompositeLayout';

/** Settings for animation export */
export interface AnimationSettings {
  fps: number;
  loopCount: number;
  showOverlays: boolean;
  preset: string | null;
}

/** Settings for static image export */
export interface StaticSettings {
  width: number;
  height: number;
  quality: number; // 0-100
  background: 'transparent' | 'white' | 'black';
}

/** Settings for performance video */
export interface PerformanceSettings {
  mode: 'record' | 'upload';
  cameraId: string | null;
  uploadedFile: File | null;
}

/** Context for which format's settings are open */
export interface SettingsContext {
  format: MediaFormat;
  pieceIndex?: 1 | 2; // For Composite mode: which piece?
}

/** Complete Share Hub state */
export interface ShareHubState {
  // Core mode
  mode: ShareMode;

  // Single Media state
  selectedFormat: MediaFormat;

  // Composite state
  compositeLayout: CompositeLayout;

  // Settings panel state
  settingsPanelOpen: boolean;
  settingsContext: SettingsContext | null;

  // Format-specific settings
  animationSettings: AnimationSettings;
  staticSettings: StaticSettings;
  performanceSettings: PerformanceSettings;
}

/** Default animation settings */
const DEFAULT_ANIMATION_SETTINGS: AnimationSettings = {
  fps: 30,
  loopCount: 1,
  showOverlays: true,
  preset: null,
};

/** Default static settings */
const DEFAULT_STATIC_SETTINGS: StaticSettings = {
  width: 1920,
  height: 1080,
  quality: 90,
  background: 'transparent',
};

/** Default performance settings */
const DEFAULT_PERFORMANCE_SETTINGS: PerformanceSettings = {
  mode: 'record',
  cameraId: null,
  uploadedFile: null,
};

import { getContext, setContext } from 'svelte';

const SHARE_HUB_STATE_KEY = Symbol('ShareHubState');

/**
 * Creates and sets the unified Share Hub state in context.
 * Call this in the parent component (ShareHubPanel).
 */
export function createShareHubState() {
  let state = $state<ShareHubState>({
    mode: 'single',
    selectedFormat: 'animation',
    compositeLayout: { ...DEFAULT_COMPOSITE_LAYOUT },
    settingsPanelOpen: false,
    settingsContext: null,
    animationSettings: { ...DEFAULT_ANIMATION_SETTINGS },
    staticSettings: { ...DEFAULT_STATIC_SETTINGS },
    performanceSettings: { ...DEFAULT_PERFORMANCE_SETTINGS },
  });

  setContext(SHARE_HUB_STATE_KEY, state);
  return state;
}

/**
 * Retrieves the Share Hub state from context.
 * Call this in child components.
 */
export function getShareHubState(): ShareHubState {
  return getContext(SHARE_HUB_STATE_KEY);
}

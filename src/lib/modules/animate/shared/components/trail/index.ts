/**
 * Trail Components
 *
 * Trail settings, presets, and visibility controls.
 */

export { default as AdvancedSettingsDrawer } from './AdvancedSettingsDrawer.svelte';
export { default as MotionVisibilityButtons } from './MotionVisibilityButtons.svelte';
export { default as QuickTogglesRow } from './QuickTogglesRow.svelte';
export { default as TrailPresetPanel } from './TrailPresetPanel.svelte';
export { default as TrailPresetPicker } from './TrailPresetPicker.svelte';
export { default as TrailSettingsPanel } from './TrailSettingsPanel.svelte';
export { default as VisibilityChip } from './VisibilityChip.svelte';

// Trail presets utilities
export {
  TRAIL_PRESETS,
  getPresetById,
  detectActivePreset,
  isModifiedFromPreset,
  applyPreset,
  type TrailPreset,
  type TrailPresetId
} from './TrailPresets';

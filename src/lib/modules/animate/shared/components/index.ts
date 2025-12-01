/**
 * Animator Components
 *
 * Internal components for the animate module.
 * For shared components (AnimationPanel, ShareAnimationViewer, etc.),
 * import from '$lib/shared/animate/components' instead.
 */

// Internal components (used within animate module)
export { default as AnimationPanelHeader } from "./AnimationPanelHeader.svelte";
export { default as AnimationCanvas } from "./AnimationCanvas.svelte";
export { default as AnimationControlsPanel } from "./AnimationControlsPanel.svelte";
export { default as AnimationControls } from "./AnimationControls.svelte";
export { default as TrailSettingsPanel } from "./TrailSettingsPanel.svelte";
export { default as MotionVisibilityButtons } from "./MotionVisibilityButtons.svelte";
export { default as ExpandToggleButton } from "./ExpandToggleButton.svelte";
export { default as ModernStepper } from "./ModernStepper.svelte";
export { default as ToggleSwitch } from "./ToggleSwitch.svelte";
export { default as SwipeAdjuster } from "./SwipeAdjuster.svelte";
export { default as AnimationVideoPlayer } from "./AnimationVideoPlayer.svelte";
export { default as PreRenderProgressBadge } from "./PreRenderProgressBadge.svelte";
export { default as PlayPauseButton } from "./PlayPauseButton.svelte";
export { default as ModernSlider } from "./ModernSlider.svelte";

// Modern controls (formerly v2)
export { default as AnimationControlsModern } from "./AnimationControlsModern.svelte";
export { default as BpmControl } from "./BpmControl.svelte";
export { default as FloatingControlBar } from "./FloatingControlBar.svelte";
export { default as QuickTogglesRow } from "./QuickTogglesRow.svelte";
export { default as TrailPresetPanel } from "./TrailPresetPanel.svelte";
export { default as TrailPresetPicker } from "./TrailPresetPicker.svelte";
export { default as VisibilityChip } from "./VisibilityChip.svelte";
export { default as AdvancedSettingsDrawer } from "./AdvancedSettingsDrawer.svelte";

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

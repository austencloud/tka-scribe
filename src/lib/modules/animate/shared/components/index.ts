/**
 * Animator Components
 *
 * Internal components for the animate module.
 * For shared components (AnimationPanel, ShareAnimationViewer, etc.),
 * import from '$lib/shared/animate/components' instead.
 *
 * Organized into subfolders:
 * - animation/  - Core animation display and control components
 * - controls/   - Playback control buttons
 * - inputs/     - Form inputs, steppers, sliders, toggles
 * - trail/      - Trail settings, presets, visibility controls
 * - video-player/ - Video generation and playback
 */

// Animation components
export {
  AnimationCanvas,
  AnimationControls,
  AnimationControlsModern,
  AnimationControlsPanel,
  AnimationPanelHeader,
  AnimationVideoPlayer,
  PreRenderProgressBadge,
} from './animation';

// Control buttons
export {
  BpmControl,
  ChangeButton,
  ControlButton,
  ExportButton,
  FloatingControlBar,
  LoopButton,
  PlayPauseButton,
  StopButton,
} from './controls';

// Input components
export {
  ExpandToggleButton,
  ModernSlider,
  ModernStepper,
  SwipeAdjuster,
  ToggleSwitch,
} from './inputs';

// Trail components and utilities
export {
  AdvancedSettingsDrawer,
  MotionVisibilityButtons,
  QuickTogglesRow,
  TrailPresetPanel,
  TrailPresetPicker,
  TrailSettingsPanel,
  VisibilityChip,
  TRAIL_PRESETS,
  getPresetById,
  detectActivePreset,
  isModifiedFromPreset,
  applyPreset,
  type TrailPreset,
  type TrailPresetId,
} from './trail';

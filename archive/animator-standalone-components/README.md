# Standalone Animator Components

This directory contains components for the **standalone animator feature** - a separate, full-featured animation tool that is not currently integrated into the Build module.

## Current Status

These components are **NOT currently used** in the main TKA application. The Build module's Animate tab uses only:

- `AnimationPanel.svelte` (parent directory)
- `AnimatorCanvas.svelte` (parent directory)

## Purpose

The standalone animator was designed as a comprehensive animation tool with features like:

- Beat-by-beat sequence construction
- Motion parameter editing (location, orientation, turns, motion type)
- Grid visualization and management
- Playback controls with speed adjustment
- Keyboard shortcuts
- Pro/Anti motion selection
- Orientation modals

## Components in This Directory

### Main Components

- **AnimatorTab.svelte** - Main container for standalone animator
- **AnimatorTabBar.svelte** - Tab navigation for animator modes

### Animation Controls

- **AnimationControls.svelte** - Full playback control panel
- **AnimationPlaybackControls.svelte** - Play/pause/speed controls
- **AnimationProgressSlider.svelte** - Timeline scrubber
- **AnimationStates.svelte** - Animation state visualization
- **AnimationStatusIndicator.svelte** - Status display

### Beat Construction

- **BeatSelector.svelte** - Beat selection interface
- **GridLocationPicker.svelte** - Grid position picker
- **GridManager.svelte** - Grid visualization and management
- **MotionTypeButtons.svelte** - Pro/Anti/Float/Dash/Static selection
- **OrientationButton.svelte** - Orientation selection button
- **OrientationModal.svelte** - Orientation selection modal
- **ProAntiSelectionModal.svelte** - Pro/Anti motion modal
- **StyledTurnsControl.svelte** - Turn count adjustment

### Visualization

- **AnimatedPictographDisplay.svelte** - Animated pictograph display
- **AnimatedSection.svelte** - Animated section container
- **StaticSection.svelte** - Static section container
- **PictographVisualizationPanel.svelte** - Pictograph visualization
- **PropPanel.svelte** - Prop state panel

### Utilities

- **KeyboardShortcutHandler.svelte** - Keyboard shortcut management
- **SequenceInfo.svelte** - Sequence information display
- **SimpleGridToggle.svelte** - Grid visibility toggle
- **AnimationPanelHeader.svelte** - Panel header component

## Future Integration

These components may be integrated into the main application in the future as part of:

1. A standalone animator module/route
2. Enhanced animation editing features in the Build module
3. A separate animation construction tool

## Usage

To use these components in future development:

```typescript
import AnimatorTab from "$animator/components/standalone/AnimatorTab.svelte";
import GridManager from "$animator/components/standalone/GridManager.svelte";
// etc.
```

## Maintenance

These components are preserved for future use and should be:

- Kept in sync with any major architectural changes
- Updated if core animation services change
- Tested before integration into the main application

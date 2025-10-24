# Archived Animator Components

**Archive Date:** January 2025  
**Reason:** Components not currently used in the Build module's Animate tab

## What's Here

This directory contains 24+ Svelte components that were part of a **standalone animator feature** that is not currently integrated into the main TKA application.

## Why Archived

The Build module's Animate tab only uses two components from the animator module:

- `AnimationPanel.svelte` (still in animator/components/)
- `AnimatorCanvas.svelte` (still in animator/components/)

All other animator components were moved here to:

1. **Declutter** the animator module - make it clear what's actually being used
2. **Preserve** the code for potential future reference
3. **Allow filtering** - you can review these later and extract useful patterns/code

## Components in This Archive

### Main Components

- AnimatorTab.svelte
- AnimatorTabBar.svelte

### Animation Controls

- AnimationControls.svelte
- AnimationPlaybackControls.svelte
- AnimationProgressSlider.svelte
- AnimationStates.svelte
- AnimationStatusIndicator.svelte
- AnimationPanelHeader.svelte

### Beat Construction

- BeatSelector.svelte
- GridLocationPicker.svelte
- GridManager.svelte
- MotionTypeButtons.svelte
- OrientationButton.svelte
- OrientationModal.svelte
- ProAntiSelectionModal.svelte
- StyledTurnsControl.svelte

### Visualization

- AnimatedPictographDisplay.svelte
- AnimatedSection.svelte
- StaticSection.svelte
- PictographVisualizationPanel.svelte
- PropPanel.svelte

### Utilities

- KeyboardShortcutHandler.svelte
- SequenceInfo.svelte
- SimpleGridToggle.svelte

## Future Use

These components may be useful for:

- Reference when building similar features
- Extracting specific UI patterns or logic
- Potential future standalone animator module
- Understanding previous implementation approaches

## Maintenance

⚠️ **These components are NOT maintained** - they may become outdated as the codebase evolves.

If you decide to use any of these components in the future:

1. Review for compatibility with current architecture
2. Update to use current services/state patterns
3. Test thoroughly before integration
4. Consider whether the pattern/approach still makes sense

## Deletion

Feel free to delete this entire archive if you determine these components won't be needed for reference.

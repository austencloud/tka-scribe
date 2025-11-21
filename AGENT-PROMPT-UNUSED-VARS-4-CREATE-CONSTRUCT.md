# Agent Task: Fix Unused Variables - Group 4 (Create/Construct Module)

## Your Assignment

Fix all unused variable errors in the **create/construct** module including option-picker and start-position-picker.

## Files to Fix (22 files, ~49 errors)

### Option Picker Components

1. `src/lib/modules/create/construct/option-picker/components/OptionFilterPanel.svelte` - Line 28: isContinuousOnly
2. `src/lib/modules/create/construct/option-picker/components/OptionViewer.svelte` - Lines 27, 51, 60: IOptionTransitionCoordinator, option, value
3. `src/lib/modules/create/construct/option-picker/components/OptionViewer456Group.svelte` - Lines 26, 35, 59, 169, 227: \_node (x2), pictograph, error, gap
4. `src/lib/modules/create/construct/option-picker/components/OptionViewerGridLayout.svelte` - Line 28: pictograph
5. `src/lib/modules/create/construct/option-picker/components/OptionViewerSection.svelte` - Lines 17, 39, 283: LETTER_TYPE_COLORS, pictograph, blueReversal, redReversal
6. `src/lib/modules/create/construct/option-picker/components/OptionViewerSwipeLayout.svelte` - Lines 32-33: pictograph, sectionIndex

### Option Viewer Subcomponents

7. `src/lib/modules/create/construct/option-picker/option-viewer/components/OptionFilterPanel.svelte` - Line 28: isContinuousOnly
8. `src/lib/modules/create/construct/option-picker/option-viewer/components/OptionViewer.svelte` - Lines 50, 59: option, value
9. `src/lib/modules/create/construct/option-picker/option-viewer/components/OptionViewer456Group.svelte` - Lines 26, 35, 59, 169, 224, 225: \_node (x2), pictograph, error, \_targetPictographSize, \_gridGap
10. `src/lib/modules/create/construct/option-picker/option-viewer/components/OptionViewerGridLayout.svelte` - Line 28: pictograph
11. `src/lib/modules/create/construct/option-picker/option-viewer/components/OptionViewerSection.svelte` - Lines 33, 277: pictograph, blueReversal, redReversal
12. `src/lib/modules/create/construct/option-picker/option-viewer/components/OptionViewerSwipeLayout.svelte` - Lines 32-33: pictograph, sectionIndex

### Shared Components

13. `src/lib/modules/create/construct/shared/components/ConstructPickerHeader.svelte` - Lines 39-40: isAdvanced, gridMode
14. `src/lib/modules/create/construct/shared/components/GridModeToggle.svelte` - Line 15: gridMode
15. `src/lib/modules/create/construct/shared/components/GuidedHeaderButtons.svelte` - Line 22: gridMode

### Start Position Picker Components

16. `src/lib/modules/create/construct/start-position-picker/components/AdvancedStartPositionPicker.svelte` - Line 20: pictograph
17. `src/lib/modules/create/construct/start-position-picker/components/PictographGrid.svelte` - Lines 19, 40: pictograph, \_pictographId
18. `src/lib/modules/create/construct/start-position-picker/components/PositionGroupGrid.svelte` - Lines 25, 27, 28: id, pictograph, id
19. `src/lib/modules/create/construct/start-position-picker/components/SimpleAdvancedToggle.svelte` - Line 11: isAdvanced
20. `src/lib/modules/create/construct/start-position-picker/components/StartPositionPicker.svelte` - Line 43: isAnimating

## Instructions

Read AGENT-PROMPT-UNUSED-VARS.md for the fixing guidelines, then:

1. Fix ALL unused variable errors in these files
2. Pay special attention to:
   - Variables prefixed with \_ that are "assigned but never used" - add eslint-disable comment
   - Catch block error parameters - prefix with \_
   - Destructured props that aren't used - remove them

## When Done

Report back with:

- ✅ Number of files fixed
- ✅ Number of errors resolved
- ❌ Any issues encountered

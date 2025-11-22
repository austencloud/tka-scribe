# Agent Task: Fix Unused Variables - Group 3 (Create/Assemble Module)

## Your Assignment

Fix all unused variable errors in the **create/assemble** module and submodules.

## Files to Fix (17 files, ~33 errors)

1. `src/lib/modules/create/assemble/components/AssemblerOrchestrator.svelte` - Lines 37-41: sequence, sequence, text, gridMode, startPosition
2. `src/lib/modules/create/assemble/components/AssemblerTab.svelte` - Lines 18-21: sequence, sequence, text, startPosition
3. `src/lib/modules/create/assemble/components/AssemblyOptionButton.svelte` - Line 21: option
4. `src/lib/modules/create/assemble/components/AssemblyOptionGrid.svelte` - Lines 24, 25: option, option, index
5. `src/lib/modules/create/assemble/components/AssemblyOptionPicker.svelte` - Line 26: option
6. `src/lib/modules/create/assemble/components/GridPositionButton.svelte` - Line 14: position
7. `src/lib/modules/create/assemble/components/HandPathGrid.svelte` - Line 24: position
8. `src/lib/modules/create/assemble/components/HandPathOrchestrator.svelte` - Lines 40-43: sequence, sequence, text, startPosition
9. `src/lib/modules/create/assemble/components/PositionButton.svelte` - Lines 15: pictograph, location
10. `src/lib/modules/create/assemble/components/PositionGrid.svelte` - Lines 21-22: pictograph, location
11. `src/lib/modules/create/assemble/components/RotationSelector.svelte` - Line 11: rotation
12. `src/lib/modules/create/assemble/components/SinglePropStartPositionPicker.svelte` - Lines 38-41: position, location, gridMode
13. `src/lib/modules/create/assemble/handpath-builder/components/HandpathBuilder.svelte` - Line 25: motions
14. `src/lib/modules/create/assemble/handpath-builder/components/PathControlPanel.svelte` - Line 19: direction
15. `src/lib/modules/create/assemble/handpath-builder/components/TouchableGrid.svelte` - Line 23: start, end

## Instructions

Read AGENT-PROMPT-UNUSED-VARS.md for the fixing guidelines, then:

1. Fix ALL unused variable errors in these files
2. Follow the rules:
   - Truly unused: Remove completely
   - Required parameter not used: Prefix with underscore
   - Unused destructured properties: Remove them entirely

## When Done

Report back with:

- ✅ Number of files fixed
- ✅ Number of errors resolved
- ❌ Any issues encountered

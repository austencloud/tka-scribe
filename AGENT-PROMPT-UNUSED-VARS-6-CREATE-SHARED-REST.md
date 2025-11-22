# Agent Task: Fix Unused Variables - Group 6 (Create/Shared, Create/Record, Explore, Learn, Shared, Routes)

## Your Assignment

Fix all unused variable errors in the **create/shared**, **create/record**, **explore**, **learn**, **shared**, and **routes** modules.

## Files to Fix (~40+ files, ~280+ errors)

### Create/Record Module

1. `src/lib/modules/create/record/components/CameraSettingsDialog.svelte` - Line 30: deviceId
2. `src/lib/modules/create/record/components/RecordControls.svelte` - Lines 26, 28: bpm, enabled
3. `src/lib/modules/create/record/components/RecordPanel.svelte` - Lines 21, 60: beatIndex, \_beatIndex
4. `src/lib/modules/create/record/components/VideoFeedPanel.svelte` - Lines 15, 18: \_error, error

### Create/Shared Module

5. `src/lib/modules/create/shared/components/ConstructTabContent.svelte` - Lines 31, 41: option, value
6. `src/lib/modules/create/shared/components/CreateModule.svelte` - Lines 61-62: canAccessEditAndExport, word
7. `src/lib/modules/create/shared/components/CreateModuleHeader.svelte` - Line 23: tab
8. `src/lib/modules/create/shared/components/CreatePanelDrawer.svelte` - Lines 26-27, 45: focusTrap, lockScroll, event
9. `src/lib/modules/create/shared/components/CreationToolPanelSlot.svelte` - Lines 78, 83-84: onPracticeBeatIndexChange, option, index
10. `src/lib/modules/create/shared/components/CreationWorkspaceArea.svelte` - Lines 26, 37, 46, 53: onPlayAnimation, isMobilePortrait, activeTab, \_sequence
11. `src/lib/modules/create/shared/components/PathBuilderTabContent.svelte` - Line 11: motions
12. `src/lib/modules/create/shared/components/StandardWorkspaceLayout.svelte` - Line 87: option
13. `src/lib/modules/create/shared/components/coordinators/AnimationCoordinator.svelte` - Line 40: animationCanvas
14. `src/lib/modules/create/shared/components/coordinators/EditCoordinator.svelte` - Line 22: shouldUseSideBySideLayout
15. `src/lib/modules/create/shared/components/coordinators/ShareCoordinator.svelte` - Line 43: options
16. `src/lib/modules/create/shared/services/implementations/CreateModuleEventService.ts` - Line 66: error
17. `src/lib/modules/create/shared/services/implementations/SequenceTransformationService.ts` - Lines 312-313, 331-332: arrowPlacementData (x2), propPlacementData (x2)
18. `src/lib/modules/create/shared/state/managers/PWAEngagementManager.svelte.ts` - Line 53: error
19. `src/lib/modules/create/shared/workspace-panel/components/CreationMethodSelector.svelte` - Line 29: method
20. `src/lib/modules/create/shared/workspace-panel/components/MethodCard.svelte` - Line 28: event
21. `src/lib/modules/create/shared/workspace-panel/hand-path/HandPathWorkspace.svelte` - Line 25: start, end
22. `src/lib/modules/create/shared/workspace-panel/sequence-display/components/BeatCell.svelte` - Line 168: \_event
23. `src/lib/modules/create/shared/workspace-panel/sequence-display/components/BeatGrid.svelte` - Lines 43, 45, 55: beatNumber (x3)
24. `src/lib/modules/create/shared/workspace-panel/sequence-display/components/SequenceDisplay.svelte` - Lines 24, 26, 32: beatNumber (x3)
25. `src/lib/modules/create/shared/workspace-panel/shared/components/buttons/ConstructGenerateToggle.svelte` - Line 26: tab

### Explore Module (Read from unused-vars-list.txt for complete list)

### Learn Module (Read from unused-vars-list.txt for complete list)

### Shared Module (Read from unused-vars-list.txt for complete list)

### Routes Module (Read from unused-vars-list.txt for complete list)

## CRITICAL INSTRUCTION

The list above is incomplete. You MUST:

1. Read the file `unused-vars-list.txt` to get the COMPLETE list of all remaining files
2. Look for all files starting with:
   - `src/lib/modules/explore/`
   - `src/lib/modules/learn/`
   - `src/lib/shared/`
   - `src/routes/`
3. Fix ALL errors in ALL these files

## Instructions

Read AGENT-PROMPT-UNUSED-VARS.md for the fixing guidelines, then:

1. Read `unused-vars-list.txt` to get the complete list
2. Fix ALL unused variable errors in ALL remaining files
3. Pay special attention to:
   - Variables starting with \_ - add eslint-disable comment if "assigned but never used"
   - Catch block errors - prefix with \_
   - Props that aren't used - remove completely

## When Done

Report back with:

- ✅ Number of files fixed
- ✅ Number of errors resolved
- ❌ Any issues encountered

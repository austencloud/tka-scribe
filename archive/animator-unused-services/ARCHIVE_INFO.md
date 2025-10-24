# Animator Unused Services Archive

**Date**: 2025-10-19
**Reason**: These services are bound in the InversifyJS container but never actually injected or used anywhere in the codebase.

## Archived Services

### 1. AnimationController.ts (AnimationControlService)

- **Purpose**: Alternative animation controller implementation
- **Why Unused**: AnimationPlaybackController is the active implementation
- **Bound As**: TYPES.IAnimationControlService
- **Never Injected**: No @inject(TYPES.IAnimationControlService) found in codebase
- **Lines**: 233 lines

### 2. MotionParameterManager.ts (MotionParameterService)

- **Purpose**: Motion parameter calculations and conversions
- **Why Unused**: May have been for standalone animator feature
- **Bound As**: TYPES.IMotionParameterService
- **Never Injected**: No @inject(TYPES.IMotionParameterService) found in codebase
- **Lines**: 194 lines

### 3. LetterIdentifier.ts (MotionLetterIdentificationService)

- **Purpose**: Reverse-lookup TKA letters from motion parameters
- **Why Unused**: Standalone animator feature not used in current implementation
- **Bound As**: TYPES.IMotionLetterIdentificationService
- **Never Injected**: No @inject(TYPES.IMotionLetterIdentificationService) found in codebase
- **Lines**: 375 lines

### 4. OverlayRenderer.ts

- **Purpose**: Renders overlay elements (letter glyphs, metadata)
- **Why Unused**: Overlay rendering not used in current animator
- **Bound As**: TYPES.IOverlayRenderer
- **Never Injected**: No @inject(TYPES.IOverlayRenderer) found in codebase
- **Note**: Depends on SvgConfig which is also unused
- **Lines**: 134 lines

### 5. SvgUtilityService.ts

- **Purpose**: Basic SVG creation and utility functions
- **Why Unused**: May have been for pictograph rendering, not animation
- **Bound As**: TYPES.ISvgUtilityService
- **Never Injected**: No @inject(TYPES.ISvgUtilityService) found in codebase
- **Lines**: 83 lines

## Services That ARE Used (Not Archived)

- **CanvasRenderer**: Used directly in AnimatorCanvas.svelte (line 134)
- **SVGGenerator**: Used directly in AnimatorCanvas.svelte (lines 68, 73, 78)
- **SvgConfig**: Injected into OverlayRenderer (but OverlayRenderer itself is unused, so SvgConfig is also archived)

## Total Lines Archived

1,019 lines of unused code removed from active codebase.

## Recovery Instructions

If you need to restore these services:

1. Copy the service file back to `src/lib/modules/build/animate/services/implementations/`
2. Add the export back to `src/lib/modules/build/animate/services/implementations/index.ts`
3. Add the binding back to `src/lib/shared/inversify/modules/animator.module.ts`
4. Add the type symbol back to `src/lib/shared/inversify/types.ts` (if removed)

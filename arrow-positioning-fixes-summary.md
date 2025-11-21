# Arrow Positioning & Placement Services - TypeScript Fixes

## Summary

Fixed all `@typescript-eslint/no-unnecessary-condition` warnings in arrow positioning and placement services by removing unnecessary null/undefined checks for required MotionData properties.

## Files Fixed (12 files, ~33 warnings removed)

### Positioning Calculation Services

1. **ArrowAdjustmentCalculator.ts** (4 warnings)
   - Removed unnecessary `!motionData` check (motionData is required parameter)
   - Removed `motionData.gridMode ||` fallback (gridMode is required property)
   - Removed `motionData.turns || 0` fallback (turns is required property)
   - Removed `keys || []` and `defaultPlacements || []` checks (arrays are always defined)

2. **ArrowRotationCalculator.ts** (2 warnings)
   - Removed `!motion` check in validateMotionData
   - Removed `!motion.rotationDirection` check (rotationDirection is required property)

3. **DashLocationCalculator.ts** (1 warning)
   - Changed `!motion || motion.motionType` to `motion.motionType` check
   - Changed `motion?.startLocation ?? GridLocation.NORTH` to `motion.startLocation`

4. **ShiftLocationCalculator.ts** (2 warnings)
   - Removed `!startLocation || !endLocation` check (both are required properties)
   - Simplified location lookup with nullish coalescing operator

5. **StaticLocationCalculator.ts** (2 warnings)
   - Removed entire locationMap logic (identity mapping was unnecessary)
   - Simplified to direct return: `return motion.startLocation`

### Placement Services

6. **ArrowPlacementService.ts** (3 warnings)
   - Consolidated cascading null checks into optional chaining
   - Removed unnecessary `!gridPlacements`, `!motionPlacements`, `!placementData` checks
   - Simplified `getAvailablePlacementKeys` with nullish coalescing

7. **LetterClassificationService.ts** (2 warnings)
   - Removed `|| ""` fallbacks for `startOrientation` (required property)
   - Removed try-catch wrapper (no longer needed without string fallbacks)

8. **SpecialPlacementService.ts** (4 warnings)
   - Removed `!motionData` checks (motionData is required parameter)
   - Changed `!letterData || Object.keys(letterData).length === 0` to `Object.keys(letterData ?? {}).length === 0`

9. **TurnsTupleGeneratorService.ts** (1 warning)
   - Removed `|| "norotation"` fallbacks for rotation direction properties (required properties)

### Orchestration Services

10. **ArrowGridCoordinateService.ts** (2 warnings)
    - Removed `motion.gridMode || GridMode.DIAMOND` fallback
    - Removed `motionType || ""` checks
    - Simplified coordinate lookup methods with nullish coalescing

11. **ArrowLifecycleManager.ts** (3 warnings)
    - Removed `!motionData.arrowPlacementData` check (arrowPlacementData is required property)
    - Removed redundant check in shouldMirrorArrow

12. **ArrowPositioningOrchestrator.ts** (5 warnings)
    - Removed `!motion` check and redundant variable assignment
    - Removed `!arrowData || !motionData` check (arrowPlacementData is required)
    - Removed `!motionType || !propRotDir` checks (both are required properties)
    - Simplified motion data access patterns

## Key Insights

All MotionData properties are **readonly and required** (no `?` optional markers):

- `motionType: MotionType`
- `rotationDirection: RotationDirection`
- `startLocation: GridLocation`
- `endLocation: GridLocation`
- `turns: number | "fl"`
- `startOrientation: Orientation`
- `endOrientation: Orientation`
- `gridMode: GridMode`
- `arrowPlacementData: ArrowPlacementData`
- `propPlacementData: PropPlacementData`
- `color: MotionColor`
- `propType: PropType`
- `arrowLocation: GridLocation`

Only `prefloatMotionType` and `prefloatRotationDirection` are optional.

## Testing

All files pass TypeScript strict null checks with zero `@typescript-eslint/no-unnecessary-condition` warnings.

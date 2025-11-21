# Agent 5: Fix Arrow Positioning & Placement Warnings

## Your Task
Fix all `@typescript-eslint/no-unnecessary-condition` warnings in **arrow positioning and placement services**.

## Files to Fix (in this order)

1. `src/lib/shared/pictograph/arrow/positioning/calculation/services/implementations/ArrowAdjustmentCalculator.ts` (4 warnings)
2. `src/lib/shared/pictograph/arrow/positioning/calculation/services/implementations/ArrowRotationCalculator.ts` (2 warnings)
3. `src/lib/shared/pictograph/arrow/positioning/calculation/services/implementations/DashLocationCalculator.ts` (1 warning)
4. `src/lib/shared/pictograph/arrow/positioning/calculation/services/implementations/ShiftLocationCalculator.ts` (2 warnings)
5. `src/lib/shared/pictograph/arrow/positioning/calculation/services/implementations/StaticLocationCalculator.ts` (2 warnings)
6. `src/lib/shared/pictograph/arrow/positioning/placement/services/implementations/ArrowPlacementService.ts` (3 warnings)
7. `src/lib/shared/pictograph/arrow/positioning/placement/services/implementations/LetterClassificationService.ts` (2 warnings)
8. `src/lib/shared/pictograph/arrow/positioning/placement/services/implementations/SpecialPlacementService.ts` (4 warnings)
9. `src/lib/shared/pictograph/arrow/positioning/placement/services/implementations/TurnsTupleGeneratorService.ts` (1 warning - both sides literal)
10. `src/lib/shared/pictograph/arrow/orchestration/services/implementations/ArrowGridCoordinateService.ts` (2 warnings)
11. `src/lib/shared/pictograph/arrow/orchestration/services/implementations/ArrowLifecycleManager.ts` (3 warnings)
12. `src/lib/shared/pictograph/arrow/orchestration/services/implementations/ArrowPositioningOrchestrator.ts` (5 warnings)

## Common Patterns to Fix

### Pattern 1: Always falsy on required parameters
```typescript
// BEFORE
function calculatePosition(arrowData: ArrowData) {
  if (!arrowData) return null;  // arrowData is required, never null
}

// AFTER - Either remove check or change type
function calculatePosition(arrowData: ArrowData | null) {
  if (!arrowData) return null;
}
// OR just remove the check if it's truly always provided
```

### Pattern 2: Unnecessary ?? on required properties
```typescript
// BEFORE
const orientation = motionData.startOrientation ?? "clockwise";  // startOrientation is required

// AFTER
const orientation = motionData.startOrientation;
```

### Pattern 3: Always truthy checks
```typescript
// BEFORE
if (arrowData.motionType) {  // motionType is required, always truthy
  processMotion(arrowData.motionType);
}

// AFTER
processMotion(arrowData.motionType);
```

### Pattern 4: Both sides literal values
```typescript
// BEFORE
if (condition) {
  return defaultValue;
} else {
  return defaultValue;  // Same value!
}

// AFTER
return defaultValue;
```

## Instructions

1. These are complex arrow calculation services - read carefully
2. Many warnings are about MotionData properties that are required but being checked
3. Check the MotionData interface to confirm which properties are required
4. After every 5-6 files, verify progress
5. Expected: ~31 warnings fixed

## Key Interface to Reference
```typescript
interface MotionData {
  motionType: string;  // Required
  startOrientation: Orientation;  // Required
  endOrientation: Orientation;  // Required
  color: Color;  // Required
  // etc - most properties are required, not optional
}
```

## Report Back
- Warnings fixed
- Current count
- Any legitimate null checks that needed type updates

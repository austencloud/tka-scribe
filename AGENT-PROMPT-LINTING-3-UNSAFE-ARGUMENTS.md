# Agent 3: Fix no-unsafe-argument Warnings (19 warnings)

## Your Mission

Fix all `no-unsafe-argument` warnings where `any` typed values are being passed to properly typed parameters.

## Warning Locations

### AngleCalculator.ts (2 warnings)

- Line 47: `any` passed to `normalizeAnglePositive(number)`
- Line 55: `any` passed to `normalizeAnglePositive(number)`
- **Issue**: `LOCATION_ANGLES[loc]` lookup returns `any`
- **Fix**: Add proper typing to `LOCATION_ANGLES` constant or type guard

### PixiTextureLoader.ts (7 warnings)

- Lines 47-49: Multiple `any` arguments for blue arrow texture
- Lines 52-54: Multiple `any` arguments for red arrow texture
- Line 90: `any` string argument
- **Issue**: Object property access returning `any`
- **Fix**: Add proper types to the texture loading data structures

### MotionCalculator.ts (1 warning)

- Line 26: `any` passed to number parameter
- **Fix**: Add proper type to the motion calculation

### GenerationOrchestrationService.ts (8 warnings)

- Lines 166, 171, 176, 195, 197, 205, 210: Various CAPType and SliceSize arguments
- **Issue**: Type narrowing not working properly
- **Fix**: Add proper type guards or assertions

### CreateModuleInitializationService.ts (2 warnings)

- Lines 157, 159: `BeatData[]` and `BeatData` marked as unsafe
- **Fix**: Verify types are properly defined and imported

## How to Fix

1. **Add proper types to data structures** - Most common fix
2. **Add type guards** - When you need to validate at runtime
3. **Use type assertions** - Only when you're certain of the type
4. **Fix the source types** - Best solution when possible

## Instructions

1. For each file, identify what's causing the `any` type
2. Add proper TypeScript types to eliminate the `any`
3. Avoid using `as any` casts - fix the root cause
4. Verify changes with `npm run check` to ensure type safety

## Success Criteria

All 19 warnings resolved with proper type safety (no `any` escapes).

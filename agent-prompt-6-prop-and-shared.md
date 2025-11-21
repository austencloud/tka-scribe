# Agent 6: Fix Prop Services & Shared Pictograph Warnings

## Your Task

Fix all `@typescript-eslint/no-unnecessary-condition` warnings in **prop services and shared pictograph utilities**.

## Files to Fix (in this order)

1. `src/lib/shared/pictograph/prop/services/implementations/BetaPropDirectionCalculator.ts` (3 warnings)
2. `src/lib/shared/pictograph/prop/services/implementations/DefaultPropPositioner.ts` (1 warning)
3. `src/lib/shared/pictograph/prop/services/implementations/DirectionUtils.ts` (1 warning - unnecessary ??)
4. `src/lib/shared/pictograph/prop/services/implementations/LetterGHHandler.ts` (1 warning - unnecessary ??)
5. `src/lib/shared/pictograph/prop/services/implementations/LetterIHandler.ts` (1 warning - unnecessary ??)
6. `src/lib/shared/pictograph/prop/services/implementations/PropRotAngleManager.ts` (2 warnings - unnecessary ??)
7. `src/lib/shared/pictograph/prop/services/implementations/PropSvgLoader.ts` (2 warnings)
8. `src/lib/shared/pictograph/prop/services/implementations/StaticDashMotionHandler.ts` (2 warnings - unnecessary ??)
9. `src/lib/shared/pictograph/prop/state/PropState.svelte.ts` (1 warning)
10. `src/lib/shared/pictograph/shared/services/implementations/DataTransformer.ts` (2 warnings)
11. `src/lib/shared/pictograph/shared/state/pictograph-state.svelte.ts` (1 warning)
12. `src/lib/shared/pictograph/shared/state/sub-states/PictographPropState.svelte.ts` (1 warning)
13. `src/lib/shared/pictograph/shared/state/visibility-state.svelte.ts` (2 warnings - unnecessary ??)
14. `src/lib/shared/pictograph/shared/utils/letter-border-utils.ts` (1 warning)
15. `src/lib/shared/pictograph/shared/utils/pictograph-rendering-utils.ts` (4 warnings)
16. `src/lib/shared/pictograph/shared/utils/png-parser.ts` (1 warning)
17. `src/lib/shared/pictograph/shared/utils/universal-metadata-extractor.ts` (2 warnings)
18. `src/lib/shared/pictograph/tka-glyph/services/implementations/LetterQueryHandler.ts` (3 warnings)
19. `src/lib/shared/pictograph/grid/services/implementations/GridPositionDeriver.ts` (1 warning)

## Common Patterns to Fix

### Pattern 1: Unnecessary ?? operators (very common in these files)

```typescript
// BEFORE
const angle = this.getBaseAngle(motion) ?? 0; // getBaseAngle never returns null/undefined

// AFTER
const angle = this.getBaseAngle(motion);
```

### Pattern 2: Always truthy on required properties

```typescript
// BEFORE
if (propData.propType) {
  // propType is required
  handleProp(propData.propType);
}

// AFTER
handleProp(propData.propType);
```

### Pattern 3: Always falsy checks

```typescript
// BEFORE
if (!propState) return; // propState is guaranteed to exist

// AFTER - Remove or fix type
```

### Pattern 4: Check methods that can't return null

```typescript
// BEFORE
const result = parser.parse(data);
if (result) {
  // parser.parse always returns a value
  use(result);
}

// AFTER
const result = parser.parse(data);
use(result);
```

## Instructions

1. Many warnings here are unnecessary `??` operators
2. Check return types of methods being called
3. If a `??` is being used, verify the left side can actually be null/undefined
4. For state files, check initialization to understand guaranteed values
5. After every 7-8 files, check: `npx eslint . --ext .ts,.svelte 2>&1 | grep -c "no-unnecessary-condition"`
6. Expected: ~31 warnings fixed

## Special Note

The prop positioning system has many calculations. If a fallback seems necessary:

- Check if the function signature promises a non-null return
- If yes: remove the `??`
- If the fallback is legitimately needed: update the return type to include `| null | undefined`

## Report Back

- Warnings fixed
- Count remaining
- Any cases where ?? was actually needed (type signatures updated)

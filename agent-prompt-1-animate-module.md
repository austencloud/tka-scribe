# Agent 1: Fix Animate Module Warnings

## Your Task

Fix all `@typescript-eslint/no-unnecessary-condition` warnings in the **animate module** files.

## Files to Fix (in this order)

1. `src/lib/modules/animate/services/implementations/GifExportOrchestrator.ts` (3 warnings)
2. `src/lib/modules/animate/services/implementations/SequenceAnimationOrchestrator.ts` (2 warnings)
3. `src/lib/modules/animate/services/implementations/SequenceLoopabilityChecker.ts` (1 warning)
4. `src/lib/modules/animate/services/implementations/SequenceNormalizationService.ts` (3 warnings)
5. `src/lib/modules/animate/services/implementations/pixi/PixiApplicationManager.ts` (3 warnings)
6. `src/lib/modules/animate/utils/sequence-loader.ts` (2 warnings)

## Common Patterns to Fix

### Pattern 1: Always falsy/truthy conditionals

```typescript
// BEFORE
if (this.shouldCancel) {  // TypeScript knows this is always false
  throw new Error("Export cancelled");
}

// AFTER - Fix the type or remove the check
// Option A: If the check is needed, the property type is wrong
private shouldCancel: boolean = false;  // Make sure type allows it to be true

// Option B: If it's truly never true, remove the check entirely
```

### Pattern 2: Unnecessary ?? or || operators

```typescript
// BEFORE
const fps = options.fps ?? GIF_EXPORT_FPS; // TypeScript knows fps is never null/undefined

// AFTER
const fps = options.fps; // Remove the fallback
```

### Pattern 3: Required properties being checked

```typescript
// BEFORE
if (!sequence.startingPositionBeat) return; // startingPositionBeat is required

// AFTER
// Just use it directly, it's guaranteed to exist
const beat = sequence.startingPositionBeat;
```

## Instructions

1. For each file, run: `npx eslint [filepath] 2>&1 | grep "no-unnecessary-condition"`
2. Read the file around each warning line
3. Identify the pattern and apply the fix
4. Use the Edit tool to make changes
5. After fixing all files, verify: `npx eslint . --ext .ts,.svelte 2>&1 | grep "no-unnecessary-condition" | grep "modules/animate" | wc -l`

## Expected Result

All warnings in animate module files should be 0.

## Report Back

- Number of warnings fixed
- Any challenging cases you encountered
- Current total warning count: `npx eslint . --ext .ts,.svelte 2>&1 | grep -c "no-unnecessary-condition"`

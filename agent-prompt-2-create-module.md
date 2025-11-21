# Agent 2: Fix Create Module Warnings (Part 1 - Services)

## Your Task
Fix all `@typescript-eslint/no-unnecessary-condition` warnings in **create module service files**.

## Files to Fix (in this order)

1. `src/lib/modules/create/shared/services/implementations/ReversalDetectionService.ts` (6 warnings)
2. `src/lib/modules/create/shared/services/implementations/SequenceAnalysisService.ts` (3 warnings)
3. `src/lib/modules/create/shared/services/implementations/SequenceDomainService.ts` (2 warnings)
4. `src/lib/modules/create/shared/services/implementations/SequenceIndexService.ts` (3 warnings)
5. `src/lib/modules/create/shared/services/implementations/SequenceTransformationService.ts` (5 warnings)
6. `src/lib/modules/create/shared/services/implementations/ConstructCoordinator.ts` (1 warning)
7. `src/lib/modules/create/shared/services/implementations/CreateModuleInitializationService.ts` (1 warning)
8. `src/lib/modules/create/edit/services/TurnControlService.ts` (2 warnings - types have no overlap)
9. `src/lib/modules/create/generate/shared/services/implementations/CAPTypeService.ts` (1 warning)
10. `src/lib/modules/create/generate/shared/services/implementations/TurnManagementService.ts` (3 warnings)
11. `src/lib/modules/create/shared/workspace-panel/sequence-toolkit/services/implementations/SequenceTransformService.ts` (1 warning)

## Common Patterns to Fix

### Pattern 1: "Types have no overlap"
```typescript
// BEFORE
getTurnValue(turns: number | "fl" | undefined): string {
  if (turns === undefined || turns === null) return "0";  // null not in type!
}

// AFTER - Remove the null check
getTurnValue(turns: number | "fl" | undefined): string {
  if (turns === undefined) return "0";
}
```

### Pattern 2: Always falsy checks
```typescript
// BEFORE
if (!sequence) return;  // sequence is required type, never null

// AFTER - Either remove or fix the type
// Option A: Remove the check
// Option B: Change type to: sequence: Sequence | null | undefined
```

### Pattern 3: Unnecessary ?? operators
```typescript
// BEFORE
const value = beat.duration ?? 1;  // duration is required, never null/undefined

// AFTER
const value = beat.duration;
```

### Pattern 4: Both sides literal values
```typescript
// BEFORE
if (index === 0) {
  return true;
} else if (index === 0) {  // TypeScript knows this can't happen!
  // ...
}

// AFTER - Simplify the logic
if (index === 0) {
  return true;
}
// Rest of logic here
```

## Instructions

1. Work through files in order
2. For each warning, read context and identify the pattern
3. Apply the appropriate fix
4. After every 5 files, check progress: `npx eslint . --ext .ts,.svelte 2>&1 | grep -c "no-unnecessary-condition"`
5. Verify at end: Should have fixed approximately 28 warnings

## Report Back
- Number of warnings fixed
- Current total count remaining
- Any complex cases that need review

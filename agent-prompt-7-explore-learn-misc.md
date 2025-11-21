# Agent 7: Fix Explore, Learn, and Other Module Warnings

## Your Task
Fix all `@typescript-eslint/no-unnecessary-condition` warnings in **explore, learn, word-card, and other modules**.

## Files to Fix (in this order)

### Explore Module
1. `src/lib/modules/explore/gallery/display/services/implementations/ExploreLoader.ts` (5 warnings)
2. `src/lib/modules/explore/gallery/display/services/implementations/ExploreMetadataExtractor.ts` (4 warnings)
3. `src/lib/modules/explore/gallery/display/services/implementations/SequenceDifficultyCalculator.ts` (2 warnings)

### Learn Module
4. `src/lib/modules/learn/codex/services/implementations/CodexLetterMappingRepo.ts` (2 warnings)
5. `src/lib/modules/learn/quiz/services/implementations/AnswerCheckerService.ts` (5 warnings)
6. `src/lib/modules/learn/quiz/services/implementations/QuizConfigurator.ts` (1 warning)

### Word Card Module
7. `src/lib/modules/word-card/services/implementations/PrintablePageLayoutService.ts` (1 warning)
8. `src/lib/modules/word-card/services/implementations/WordCardExportIntegrationService.ts` (2 warnings)
9. `src/lib/modules/word-card/state/word-card-state-factory.svelte.ts` (2 warnings)
10. `src/lib/modules/word-card/state/word-card-state.svelte.ts` (2 warnings)

### Write Module
11. `src/lib/modules/write/services/implementations/MusicPlayerService.ts` (1 warning)

## Common Patterns to Fix

### Pattern 1: Always truthy in loader/extractor services
```typescript
// BEFORE
if (metadata.difficulty) {  // difficulty is required
  processDifficulty(metadata.difficulty);
}

// AFTER
processDifficulty(metadata.difficulty);
```

### Pattern 2: Always falsy checks in validators
```typescript
// BEFORE
if (!answer) return false;  // answer is required parameter

// AFTER - Either remove or fix type
// If check is needed: function check(answer: string | null)
// If not needed: remove the check
```

### Pattern 3: Unnecessary ?? for loaders
```typescript
// BEFORE
const count = loadedData.count ?? 0;  // count is required

// AFTER
const count = loadedData.count;
```

### Pattern 4: Always truthy in state initialization
```typescript
// BEFORE
if (initialState) {  // initialState is always provided
  setState(initialState);
}

// AFTER
setState(initialState);
```

## Instructions

1. Work through files by module
2. Explore module: Focus on data loading and metadata extraction
3. Learn module: Focus on quiz validation logic
4. Word card: Focus on state initialization
5. After each module, check progress
6. Expected: ~27 warnings fixed

## Key Points
- ExploreLoader.ts has 5 warnings - likely around metadata checks
- AnswerCheckerService.ts has 5 warnings - validation logic
- Most word-card warnings are in state files

## Report Back
- Warnings fixed per module
- Total remaining
- Any interesting patterns found

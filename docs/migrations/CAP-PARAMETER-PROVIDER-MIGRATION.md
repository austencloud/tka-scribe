# CAPParameterProvider Migration Guide

## Overview

We've consolidated 4 small CAP-related services into one cohesive `CAPParameterProvider`:

**Consolidated Services:**
- ✅ `ComplementaryLetterService` (22 lines)
- ✅ `RotationDirectionService` (45 lines)
- ✅ `TurnIntensityLevelService` (46 lines)
- ✅ `TurnIntensityManagerService` (97 lines)

**New Service:**
- `CAPParameterProvider` (~300 lines)

---

## Quick Migration Examples

### Example 1: ComplementaryLetterService

**❌ OLD CODE:**
```typescript
import type { IComplementaryLetterService } from "../contracts";

@injectable()
export class MirroredComplementaryCAPExecutor {
  constructor(
    @inject(TYPES.IComplementaryLetterService)
    private invertedLetterService: IComplementaryLetterService
  ) {}

  execute(letter: string): string {
    const inverted = this.invertedLetterService.getInvertedLetter(letter);
    // ...
  }
}
```

**✅ NEW CODE:**
```typescript
import type { ICAPParameterProvider } from "../contracts";

@injectable()
export class MirroredComplementaryCAPExecutor {
  constructor(
    @inject(TYPES.ICAPParameterProvider)
    private capParams: ICAPParameterProvider
  ) {}

  execute(letter: string): string {
    const inverted = this.capParams.getInvertedLetter(letter);
    // ...
  }
}
```

**Changes:**
1. Replace `IComplementaryLetterService` → `ICAPParameterProvider`
2. Replace `TYPES.IComplementaryLetterService` → `TYPES.ICAPParameterProvider`
3. Rename variable `invertedLetterService` → `capParams` (or any name you prefer)
4. Method name stays the same: `getInvertedLetter()`

---

### Example 2: RotationDirectionService

**❌ OLD CODE:**
```typescript
import type { IRotationDirectionService } from "../contracts";

@injectable()
export class GenerationOrchestrationService {
  constructor(
    @inject(TYPES.IRotationDirectionService)
    private readonly rotationDirectionService: IRotationDirectionService
  ) {}

  generateSequence(options: GenerationOptions) {
    const directions = this.rotationDirectionService.determineRotationDirections(
      options.propContinuity
    );
    // ...
  }
}
```

**✅ NEW CODE:**
```typescript
import type { ICAPParameterProvider } from "../contracts";

@injectable()
export class GenerationOrchestrationService {
  constructor(
    @inject(TYPES.ICAPParameterProvider)
    private readonly capParams: ICAPParameterProvider
  ) {}

  generateSequence(options: GenerationOptions) {
    const directions = this.capParams.determineRotationDirections(
      options.propContinuity
    );
    // ...
  }
}
```

**Changes:**
1. Replace `IRotationDirectionService` → `ICAPParameterProvider`
2. Replace `TYPES.IRotationDirectionService` → `TYPES.ICAPParameterProvider`
3. Rename variable `rotationDirectionService` → `capParams`
4. Method name stays the same: `determineRotationDirections()`

---

### Example 3: TurnIntensityManagerService (Special Case)

This service is special - it's instantiated directly with `new` because it needs runtime parameters.

**❌ OLD CODE:**
```typescript
// Dynamic instantiation with parameters
const { TurnIntensityManagerService } = await import(
  "../shared/services/implementations/TurnIntensityManagerService"
);

const turnManager = new TurnIntensityManagerService(
  wordLength,
  level,
  maxTurnIntensity
);

const allocation = turnManager.allocateTurnsForBlueAndRed();
```

**✅ NEW CODE:**
```typescript
// Use injected CAPParameterProvider instead
@injectable()
export class PartialSequenceGenerator {
  constructor(
    @inject(TYPES.ICAPParameterProvider)
    private capParams: ICAPParameterProvider
  ) {}

  generateSequence(wordLength: number, level: number, maxIntensity: number) {
    // Pass parameters directly to the method
    const allocation = this.capParams.allocateTurns(
      wordLength,
      level,
      maxIntensity
    );
    // ...
  }
}
```

**Changes:**
1. Stop using `new TurnIntensityManagerService(...)`
2. Inject `ICAPParameterProvider` instead
3. Call `capParams.allocateTurns(wordLength, level, maxIntensity)`
4. The method signature is the same, just pass parameters directly

---

### Example 4: TurnIntensityLevelService (UI)

**❌ OLD CODE:**
```typescript
// For UI display of allowed turn values
@injectable()
export class GeneratePanel {
  constructor(
    @inject(TYPES.ITurnIntensityManagerService)
    private turnIntensityService: ITurnIntensityManagerService
  ) {}

  getAllowedTurns(level: DifficultyLevel): number[] {
    return this.turnIntensityService.getAllowedValuesForLevel(level);
  }
}
```

**✅ NEW CODE:**
```typescript
@injectable()
export class GeneratePanel {
  constructor(
    @inject(TYPES.ICAPParameterProvider)
    private capParams: ICAPParameterProvider
  ) {}

  getAllowedTurns(level: DifficultyLevel): number[] {
    return this.capParams.getAllowedTurnsForLevel(level);
  }
}
```

**Changes:**
1. Replace `TYPES.ITurnIntensityManagerService` → `TYPES.ICAPParameterProvider`
2. Rename variable `turnIntensityService` → `capParams`
3. Method name stays the same: `getAllowedTurnsForLevel()`

---

## API Reference

### CAPParameterProvider Methods

```typescript
interface ICAPParameterProvider {
  // From ComplementaryLetterService
  getInvertedLetter(letter: string): string;

  // From RotationDirectionService
  determineRotationDirections(propContinuity?: PropContinuity): RotationDirections;

  // From TurnIntensityLevelService
  getAllowedTurnsForLevel(level: DifficultyLevel): number[];

  // From TurnIntensityManagerService
  allocateTurns(
    wordLength: number,
    level: number,
    maxTurnIntensity: number
  ): TurnAllocation;
}
```

---

## Files That Need Updates

Run this command to find all files that need migration:

```bash
grep -r "IComplementaryLetterService\|IRotationDirectionService\|ITurnIntensityManagerService" src/lib/modules/create/generate --include="*.ts" | grep -v "export interface" | grep -v ".old.ts"
```

**Expected files to update:**
1. `MirroredComplementaryCAPExecutor.ts`
2. `MirroredSwappedComplementaryCAPExecutor.ts`
3. `RotatedComplementaryCAPExecutor.ts`
4. `GenerationOrchestrationService.ts`
5. `PartialSequenceGenerator.ts`
6. `TurnAllocator.ts` (if it exists)
7. Any UI components using turn intensity

---

## Testing Checklist

After migration, test:

- [ ] CAP sequence generation works (all 13 types)
- [ ] Complementary letter transformations work
- [ ] Rotation direction assignment works
- [ ] Turn intensity UI controls show correct values
- [ ] Turn allocation during generation works
- [ ] No DI container errors on startup
- [ ] Hot Module Reload (HMR) still works

---

## Rollback Plan

If something breaks, the old services are still bound in the container:

```typescript
// These still work during migration:
resolve(TYPES.IComplementaryLetterService)
resolve(TYPES.IRotationDirectionService)
resolve(TYPES.ITurnIntensityManagerService)
```

You can gradually migrate files one at a time.

---

## Benefits After Migration

- ✅ **-3 services** (287 → 284)
- ✅ **One cohesive service** instead of 4 scattered ones
- ✅ **300 lines** (sweet spot for readability)
- ✅ **Related functionality grouped together**
- ✅ **Easier to find CAP parameter logic**
- ✅ **Less DI container overhead**

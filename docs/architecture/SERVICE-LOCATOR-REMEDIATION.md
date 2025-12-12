# Service Locator Anti-Pattern Remediation Plan

## Executive Summary

The TKA-STUDIO codebase uses InversifyJS for dependency injection but has inadvertently implemented the **Service Locator anti-pattern**, which defeats the entire purpose of having a DI system. This document explains the problem, why it matters, and provides a phased remediation plan.

---

## Part 1: Understanding Dependency Injection

### What is Dependency Injection?

Dependency Injection (DI) is a design pattern where a class receives its dependencies from the outside rather than creating them itself.

**Without DI (bad):**

```typescript
class OrderService {
  private emailService: EmailService;
  
  constructor() {
    this.emailService = new EmailService(); // Creates its own dependency
  }
}
```

**With DI (good):**

```typescript
class OrderService {
  constructor(private emailService: EmailService) {} // Receives dependency
}
```

### The Three Benefits of DI

1. **Visible Dependencies**: Looking at a constructor tells you exactly what a class needs
2. **Compile-Time Safety**: Missing dependencies cause errors at compile/startup time, not runtime
3. **Testability**: You can easily substitute mock/fake implementations for testing

---

## Part 2: What is the Service Locator Anti-Pattern?

The Service Locator pattern is when code requests dependencies from a central registry at runtime, rather than receiving them through the constructor.

**Service Locator (anti-pattern):**

```typescript
class OrderService {
  private emailService: EmailService | null = null;
  
  async doWork() {
    // Fetches dependency when needed, hidden from callers
    this.emailService = resolve(TYPES.IEmailService);
    this.emailService.send(...);
  }
}
```

### Why Service Locator Defeats DI's Purpose

| DI Benefit | How Service Locator Defeats It |
|------------|-------------------------------|
| **Visible Dependencies** | Dependencies are hidden inside method bodies. You can't see what a class needs by looking at its constructor. |
| **Compile-Time Safety** | Errors only occur at runtime when `resolve()` is called. If a service isn't bound, you won't know until the app crashes. |
| **Testability** | Tests must set up the entire DI container or mock the global `resolve()` function. You can't just pass in a mock through the constructor. |

---

## Part 3: Current State in TKA-STUDIO

### The Mega-Registry Problem

**File:** `src/lib/shared/inversify/types.ts`
- **558 lines** containing ~280 Symbol definitions
- Every feature in the app imports from this one file
- No module boundaries - everything depends on everything

### The resolve() Proliferation

A grep search for `resolve(TYPES.` found **50+ occurrences** scattered throughout:
- Service implementations
- Svelte components
- Lifecycle initializers

### Example: CreateModuleInitializationService

**File:** `src/lib/features/create/shared/services/implementations/CreateModuleInitializationService.ts`

```typescript
@injectable()
export class CreateModuleInitializationService implements ICreateModuleInitializationService {
  // 12+ nullable fields - a code smell
  private sequenceService: ISequenceService | null = null;
  private beatMutationService: IBeatMutationService | null = null;
  private pictographService: IPictographService | null = null;
  private arrowSelectionService: IArrowSelectionService | null = null;
  private beatSelectionService: IBeatSelectionService | null = null;
  private beatOperationsService: IBeatOperationsService | null = null;
  // ... 6 more nullable fields

  async initialize(): Promise<CreateModuleServices> {
    // All dependencies fetched at runtime, hidden from constructor
    this.sequenceService = resolve(TYPES.ISequenceService);
    this.beatMutationService = resolve(TYPES.IBeatMutationService);
    this.pictographService = resolve(TYPES.IPictographService);
    this.arrowSelectionService = resolve(TYPES.IArrowSelectionService);
    this.beatSelectionService = resolve(TYPES.IBeatSelectionService);
    this.beatOperationsService = resolve(TYPES.IBeatOperationsService);
    // ... more resolve() calls

    return {
      sequenceService: this.sequenceService!,  // Bang assertions everywhere
      beatMutationService: this.beatMutationService!,
      // ...
    };
  }
}
```

**Problems with this code:**

1. **Hidden dependencies**: Constructor is empty, but class needs 12+ services
2. **Nullable fields with `!` assertions**: The `!` operator tells TypeScript "trust me, this won't be null" - but it might be
3. **Runtime failures**: If any service isn't bound, the app crashes when `initialize()` runs
4. **Untestable**: To test this class, you'd need to set up the entire container

### What Correct DI Looks Like

**File:** `src/lib/features/create/generate/circular/services/implementations/PartialSequenceGenerator.ts`

```typescript
@injectable()
export class PartialSequenceGenerator implements IPartialSequenceGenerator {
  constructor(
    @inject(TYPES.ICAPGeneratorFactory) private generatorFactory: ICAPGeneratorFactory,
    @inject(TYPES.IBeatFactory) private beatFactory: IBeatFactory,
    @inject(TYPES.ILoggingService) private loggingService: ILoggingService
  ) {}
  // No resolve() calls needed - dependencies injected via constructor
}
```

**Benefits:**

1. All dependencies visible in constructor
2. No nullable fields, no `!` assertions
3. If a dependency is missing, app fails at startup with clear error
4. Easy to test - just pass mocks to constructor

### The Duplicate Initializer Problem

Three separate classes do similar initialization work:

1. `CreateModuleInitializationService.ts` - 300 lines
2. `CreateModuleInitializer.ts` - 263 lines  
3. `ServiceInitializer.ts` - Unknown

This violates DRY (Don't Repeat Yourself) and creates confusion about which is canonical.

### UI Components Calling resolve()

Svelte components are directly calling `resolve()`:

```typescript
// Inside a .svelte file
const service = resolve(TYPES.ISomeService);
```

This couples UI components directly to the DI container. Components should receive services through Svelte's context system instead.

---

## Part 4: Why This Matters

### Hidden Bugs

With Service Locator, you can have code that:
- Compiles successfully
- Passes type checking
- Runs fine in development
- **Crashes in production** when a specific code path calls `resolve()` for an unbound service

### Testing Nightmares

To unit test a service that uses `resolve()`:

```typescript
// You can't do this:
const service = new CreateModuleInitializationService(mockSequenceService, mockBeatService);

// You have to do this:
beforeEach(() => {
  container.unbindAll();
  container.bind(TYPES.ISequenceService).toConstantValue(mockSequenceService);
  container.bind(TYPES.IBeatMutationService).toConstantValue(mockBeatService);
  // ... bind ALL 12+ dependencies
});
```

### Maintenance Burden

When you see a class with an empty constructor and 12 nullable private fields, you have no idea:
- What this class actually needs
- Whether those fields are ever null
- What order the initialization must happen in

---

## Part 5: Remediation Plan

### Phase 1: Dependency Graph Investigation

**Goal:** Understand the actual dependency relationships before changing anything.

**Actions:**
1. List all `resolve(TYPES.*)` call sites
2. For each call site, document:
   - Which class contains the call
   - Which service is being resolved
   - When during the lifecycle this happens
3. Identify circular dependencies (if any)
4. Create a dependency graph visualization

**Output:** A map of all dependencies that need to be converted to constructor injection.

### Phase 2: Convert to Constructor Injection (HIGHEST PRIORITY)

**Goal:** Eliminate Service Locator pattern in service classes.

**Before:**

```typescript
@injectable()
export class CreateModuleInitializationService {
  private sequenceService: ISequenceService | null = null;
  
  async initialize() {
    this.sequenceService = resolve(TYPES.ISequenceService);
    return { sequenceService: this.sequenceService! };
  }
}
```

**After:**

```typescript
@injectable()
export class CreateModuleInitializationService {
  constructor(
    @inject(TYPES.ISequenceService) private sequenceService: ISequenceService,
    @inject(TYPES.IBeatMutationService) private beatMutationService: IBeatMutationService,
    // ... all dependencies listed here
  ) {}

  async initialize(): Promise<CreateModuleServices> {
    // No resolve() calls - dependencies already available
    return {
      sequenceService: this.sequenceService,
      beatMutationService: this.beatMutationService,
    };
  }
}
```

**Key Changes:**
- All dependencies in constructor with `@inject()` decorators
- No nullable fields
- No `!` assertions
- No `resolve()` calls

### Phase 3: Split types.ts into Feature Modules

**Goal:** Break the 558-line mega-registry into feature-scoped files.

**Current Structure:**

```
src/lib/shared/inversify/types.ts  // 558 lines, ALL symbols
```

**Target Structure:**

```
src/lib/features/create/inversify/create.types.ts
src/lib/features/compose/inversify/compose.types.ts
src/lib/features/discover/inversify/discover.types.ts
src/lib/shared/inversify/types.ts  // Only truly shared symbols
```

**Example create.types.ts:**

```typescript
export const CREATE_TYPES = {
  ISequenceService: Symbol.for('ISequenceService'),
  IBeatMutationService: Symbol.for('IBeatMutationService'),
  IBeatSelectionService: Symbol.for('IBeatSelectionService'),
  // Only symbols used by the Create feature
};
```

### Phase 4: Create Feature-Scoped Container Modules

**Goal:** Each feature registers only its own bindings.

**Current:** One massive container configuration.

**Target:**

```typescript
// src/lib/features/create/inversify/create.module.ts
export const createModule = new ContainerModule((bind) => {
  bind(CREATE_TYPES.ISequenceService).to(SequenceService).inSingletonScope();
  bind(CREATE_TYPES.IBeatMutationService).to(BeatMutationService).inSingletonScope();
  // Only Create feature bindings
});
```

**Container composition:**

```typescript
// src/lib/shared/inversify/container.ts
const container = new Container();
container.load(sharedModule);

// Feature modules loaded on-demand
export async function loadCreateFeature() {
  const { createModule } = await import('../../features/create/inversify/create.module');
  container.load(createModule);
}
```

### Phase 5: Fix Inverted Dependencies

**Goal:** Shared code should never import from feature code.

**Current Problem:**

```typescript
// In src/lib/shared/pictograph/...
import { SomeType } from '../../features/create/...';  // BAD: shared imports from feature
```

**Solution:**

1. Move truly shared types to `src/lib/shared/`
2. Feature-specific code stays in features
3. If shared code needs feature functionality, use interfaces/abstractions

### Phase 6: Eliminate UI-Level resolve() Calls

**Goal:** Svelte components receive services through context, not `resolve()`.

**Current (bad):**

```svelte
<script>
  import { resolve, TYPES } from '$lib/shared/inversify/di';
  const service = resolve(TYPES.ISomeService);
</script>
```

**Target (good):**

```svelte
<!-- Parent component (e.g., layout or page) -->
<script>
  import { setContext } from 'svelte';
  import { resolve, TYPES } from '$lib/shared/inversify/di';
  
  // Resolve once at the top level
  setContext('sequenceService', resolve(TYPES.ISequenceService));
</script>

<!-- Child component -->
<script>
  import { getContext } from 'svelte';
  const sequenceService = getContext('sequenceService');
</script>
```

### Phase 7: Consolidate Duplicate Initializers

**Goal:** One initializer class per feature, not three.

**Actions:**
1. Compare `CreateModuleInitializationService`, `CreateModuleInitializer`, and `ServiceInitializer`
2. Identify the canonical one (probably the most complete)
3. Migrate any unique functionality to the canonical one
4. Delete the duplicates
5. Update all imports

---

## Part 6: Success Criteria

After remediation, the codebase should exhibit:

1. **Zero `resolve()` calls in service class methods** - All dependencies injected via constructor
2. **All service dependencies visible in constructors** - No hidden dependencies
3. **No nullable service fields with `!` assertions** - Proper initialization
4. **Feature modules are self-contained** - Each feature owns its types and bindings
5. **Shared code has no feature imports** - Clean dependency direction
6. **UI components use Svelte context** - Not direct `resolve()` calls
7. **One initializer per feature** - No duplicates

---

## Part 7: Priority Order

1. **Phase 2** - Convert to constructor injection (biggest impact, fixes the core problem)
2. **Phase 7** - Consolidate initializers (reduces confusion, smaller scope)
3. **Phase 6** - Fix UI resolve() calls (improves component testability)
4. **Phase 5** - Fix inverted dependencies (improves module boundaries)
5. **Phase 3** - Split types.ts (reduces coupling)
6. **Phase 4** - Feature-scoped modules (enables lazy loading)

Phase 1 (investigation) should happen before Phase 2 to understand the scope.

---

## Appendix: Key Files to Examine

| File | Purpose | Lines |
|------|---------|-------|
| `src/lib/shared/inversify/types.ts` | Central symbol registry | 558 |
| `src/lib/shared/inversify/di.ts` | resolve() function | ~250 |
| `src/lib/shared/inversify/container.ts` | Container configuration | ~400 |
| `src/lib/features/create/shared/services/implementations/CreateModuleInitializationService.ts` | Main offender | 300 |
| `src/lib/features/create/shared/lifecycle/CreateModuleInitializer.ts` | Duplicate initializer | 263 |
| `src/lib/features/create/shared/services/ServiceInitializer.ts` | Another duplicate | Unknown |
| `src/lib/features/create/generate/circular/services/implementations/PartialSequenceGenerator.ts` | Good example of proper DI | ~100 |

---

## Appendix: Quick Reference

### Bad Pattern (Service Locator)

```typescript
@injectable()
class MyService {
  private dep: IDependency | null = null;
  
  doWork() {
    this.dep = resolve(TYPES.IDependency);  // BAD
    this.dep!.something();  // BAD: bang assertion
  }
}
```

### Good Pattern (Constructor Injection)

```typescript
@injectable()
class MyService {
  constructor(
    @inject(TYPES.IDependency) private dep: IDependency
  ) {}
  
  doWork() {
    this.dep.something();  // GOOD: always available, no assertion needed
  }
}
```

---

## Questions for Implementation

1. Are there any circular dependencies that would prevent constructor injection?
2. Which of the three initializer classes is considered canonical?
3. Are there any services that genuinely need lazy/optional resolution?
4. What is the testing strategy - will we add unit tests as we refactor?

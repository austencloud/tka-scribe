# Pictograph Domain-Aligned Architecture

**After refactoring - Domain-aligned organization**

## Directory Structure

```
src/lib/shared/pictograph/
├── arrow/
│   ├── state/                           ← NEW: Arrow state in arrow domain
│   │   ├── PictographArrowState.svelte.ts
│   │   └── index.ts
│   ├── orchestration/
│   │   ├── services/
│   │   └── domain/
│   ├── positioning/
│   │   ├── calculation/
│   │   ├── placement/
│   │   └── key-generation/
│   └── rendering/
│
├── prop/
│   ├── state/                           ← NEW: Prop state in prop domain
│   │   ├── PictographPropState.svelte.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── contracts/
│   │   │   └── IPropTypeConfigurationService.ts  ← NEW
│   │   └── implementations/
│   │       └── PropTypeConfigurationService.ts   ← NEW
│   └── domain/
│
├── grid/
│   └── services/
│
└── shared/
    ├── state/
    │   ├── PictographDataState.svelte.ts        ← Cross-cutting concern
    │   ├── PictographLoadingState.svelte.ts     ← Cross-cutting concern
    │   ├── pictograph-state.svelte.ts           ← Composition only (280 lines)
    │   └── pictograph-state.old.svelte.ts       ← Backup (469 lines)
    ├── services/
    ├── components/
    └── domain/
```

## Why This Structure?

### Domain Boundaries

- **Arrow concerns** live in `arrow/` folder
- **Prop concerns** live in `prop/` folder
- **Shared concerns** (data, loading) live in `shared/`
- **Composition** happens at the shared level

### Benefits

#### 1. Clear Domain Ownership

```typescript
// Want to modify arrow logic? Look in arrow/state/
arrow / state / PictographArrowState.svelte.ts;

// Want to modify prop logic? Look in prop/state/
prop / state / PictographPropState.svelte.ts;

// Want to modify prop type mapping? Look in prop/services/
prop / services / implementations / PropTypeConfigurationService.ts;
```

#### 2. Locality of Behavior

Related code lives together:

- Arrow positioning logic → `arrow/positioning/`
- Arrow state → `arrow/state/`
- Arrow orchestration → `arrow/orchestration/`

#### 3. Prevents Cross-Domain Coupling

- Arrow state can't directly depend on prop state (different folders)
- Prop state can't directly depend on arrow state (different folders)
- Forces you to think about boundaries

#### 4. Easier Navigation

```
Looking for arrow positioning?
→ arrow/state/PictographArrowState.svelte.ts

Looking for prop rendering?
→ prop/state/PictographPropState.svelte.ts

Looking for shared data transformation?
→ shared/state/PictographDataState.svelte.ts
```

## Import Patterns

### From Outside Pictograph Module

```typescript
// Import the main factory (unchanged API)
import { createPictographState } from "$shared/pictograph/shared/state/pictograph-state.svelte";
```

### Within Pictograph Module

```typescript
// Composition uses domain-aligned imports
import { createPictographArrowState } from "../../arrow/state";
import { createPictographPropState } from "../../prop/state";
import { createPictographDataState } from "./PictographDataState.svelte";
import { createPictographLoadingState } from "./PictographLoadingState.svelte";
```

## Composition Pattern

```typescript
// pictograph-state.svelte.ts (280 lines)
// Just composition - no business logic!

export function createPictographState(initialData) {
  // 1. Resolve services
  // 2. Create domain-specific sub-states
  const arrowState = createPictographArrowState(arrowLifecycleManager); // From arrow/
  const propState = createPictographPropState(propLoader, propPlacer); // From prop/
  const dataState = createPictographDataState(dataService); // From shared/
  const loadingState = createPictographLoadingState(requirements); // From shared/

  // 3. Return composed interface
  return {
    // Delegate to sub-states
    get arrowPositions() {
      return arrowState?.arrowPositions ?? {};
    },
    get propPositions() {
      return propState?.propPositions ?? {};
    },
    get effectivePictographData() {
      return dataState?.effectivePictographData ?? null;
    },
    // ... etc
  };
}
```

## Comparison to Old Structure

### Before (Sub-States Folder)

```
shared/state/
├── sub-states/                          ❌ Generic folder
│   ├── PictographArrowState.svelte.ts  ❌ Domain unclear
│   ├── PictographPropState.svelte.ts   ❌ Domain unclear
│   ├── PictographDataState.svelte.ts
│   └── PictographLoadingState.svelte.ts
└── pictograph-state.svelte.ts
```

### After (Domain-Aligned)

```
arrow/state/
└── PictographArrowState.svelte.ts      ✅ Clearly arrow domain

prop/state/
└── PictographPropState.svelte.ts       ✅ Clearly prop domain

shared/state/
├── PictographDataState.svelte.ts       ✅ Clearly shared concern
├── PictographLoadingState.svelte.ts    ✅ Clearly shared concern
└── pictograph-state.svelte.ts          ✅ Composition
```

## Future Extensions

### Adding Grid State (if needed)

```
grid/
├── state/                               ← Add state here
│   └── PictographGridState.svelte.ts
└── services/
```

Then import in composition:

```typescript
import { createPictographGridState } from "../../grid/state";
const gridState = createPictographGridState(gridService);
```

### Adding Letter/Glyph State (if needed)

```
tka-glyph/
├── state/                               ← Add state here
│   └── PictographLetterState.svelte.ts
└── services/
```

## Rules

1. **State belongs to its domain** - Arrow state in `arrow/`, prop state in `prop/`
2. **Shared concerns stay shared** - Data transformation and loading are truly cross-cutting
3. **Composition happens at shared level** - `pictograph-state.svelte.ts` imports from domains
4. **No cross-domain dependencies** - Arrow state can't import from `prop/`, and vice versa
5. **Services stay with their domain** - `PropTypeConfigurationService` lives in `prop/services/`

---

**Pattern:** Domain-Driven Design meets Clean Architecture
**Result:** Clear boundaries, easy navigation, enforced separation

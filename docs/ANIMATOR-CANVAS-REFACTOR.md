# AnimatorCanvas Refactoring: From Monolith to Primitives

## Overview

Refactored AnimatorCanvas from a 731-line monolith into clean, composable primitives following 2025 best practices for WebGL + reactive framework integration.

## Research-Backed Patterns Applied

### PixiJS v8 Best Practices
- **Extension-based modularity**: Each coordinator is an independent module ([Source](https://pixijs.com/8.x/guides/concepts/architecture))
- **Texture preloading**: Load textures upfront, never modify after creation ([Source](https://pixijs.com/8.x/guides/migrations/v8))
- **Render optimization**: Only update when things change

### Reactive + WebGL Integration
- **Component isolation**: Separate WebGL logic from UI logic ([Source](https://simonharris.co/using-react-with-canvas-webgl-and-custom-renderers/))
- **Two-ref pattern**: Canvas DOM ref + engine instance ref ([Source](https://dev.to/jacklehamster/webgl-canvas-in-react-45m5))
- **PubSub for decoupling**: Services communicate via callbacks, not direct coupling ([Source](https://frontendmasters.com/blog/vanilla-javascript-reactivity/))

### Svelte 5 Runes
- **$effect for canvas sync**: Use $effect to sync reactive state to imperative WebGL API ([Source](https://svelte.dev/blog/runes))
- **Functions over $derived**: For complex computations, use pure functions ([Source](https://blog.logrocket.com/exploring-runes-svelte-5/))
- **Universal reactivity**: .svelte.ts files for cross-component state ([Source](https://svelte.dev/docs/svelte/what-are-runes))

---

## Architecture

### Before: Single Monolith (731 lines)
- 15+ $effect blocks mixing concerns
- Service initialization + state management + rendering all in one file
- Hard to test, debug, or reason about
- "Hallucinating through bugs" due to complexity

### After: Composable Primitives (3 layers)

```
┌─────────────────────────────────────────────────────────┐
│                  AnimatorCanvas.v2.svelte               │
│               (480 lines - orchestration)               │
│                                                         │
│  • Receives props                                      │
│  • Coordinates services + coordinators                 │
│  • Syncs state via $effects                           │
│  • Delegates complex operations                       │
└─────────────────────────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    Texture      │ │ Precomputation  │ │     Render      │
│  Coordinator    │ │  Coordinator    │ │  Coordinator    │
│                 │ │                 │ │                 │
│ • Prop textures │ │ • Path cache    │ │ • Render loop   │
│ • Glyph textures│ │ • Frame precomp │ │ • Trigger logic │
│ • Grid textures │ │ • State updates │ │ • Frame params  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ FrameParams.ts  │ │ BeatNumber.ts   │ │PropDimensions.ts│
│                 │ │                 │ │                 │
│ • Pure function │ │ • Pure function │ │ • Pure function │
│ • No side fx    │ │ • No side fx    │ │ • No side fx    │
│ • Testable      │ │ • Testable      │ │ • Testable      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## Phase 1: Pure Utilities (Testable Primitives)

### CanvasFrameParams.ts
**Purpose**: Build render frame parameters from inputs

```typescript
import { buildFrameParams } from "../utils/CanvasFrameParams";

const params = buildFrameParams({
  beatData,
  currentBeat,
  trailSettings,
  gridVisible,
  gridMode,
  letter,
  blueProp,
  redProp,
  // ... other inputs
  visibility: visibilityState,
});
```

**Benefits**:
- Pure function: same inputs = same outputs
- No side effects - trivial to test
- No dependencies on component lifecycle
- Can be used anywhere (components, tests, workers)

### BeatNumberCalculator.ts
**Purpose**: Calculate beat numbers from sequence data

```typescript
import { calculateBeatNumber, getBeatLabel } from "../utils/BeatNumberCalculator";

const beatNumber = calculateBeatNumber(sequenceData, beatData); // 0, 1, 2, ...
const label = getBeatLabel(beatNumber); // "Start", "Beat 1", "Beat 2", ...
```

**Benefits**:
- Separates beat number logic from component
- Easy to test edge cases (start position, missing data, etc.)
- Reusable across different components

### PropDimensionsExtractor.ts
**Purpose**: Extract prop metadata from sequence data

```typescript
import { extractBluePropType, isBilateralSequence } from "../utils/PropDimensionsExtractor";

const bluePropType = extractBluePropType(sequenceData); // "staff" | "fan" | ...
const isBilateral = isBilateralSequence(sequenceData); // true/false
```

**Benefits**:
- Clear extraction logic (first beat motion → sequence propType → null)
- Bilateral detection in one place
- No side effects - just data in, data out

---

## Phase 2: Service Coordinators (Lifecycle Management)

### AnimatorTextureCoordinator.svelte.ts
**Purpose**: Coordinate all texture loading operations

**Responsibilities**:
- Prop texture loading
- Glyph texture loading (with fade transitions)
- Grid texture loading
- Callbacks when loading completes

**Usage**:
```typescript
const textureCoordinator = new AnimatorTextureCoordinator();
textureCoordinator.initialize(pixiRenderer, svgGenerator, trailCaptureService);
textureCoordinator.setCallbacks({
  onPropDimensionsLoaded: (blue, red) => { /* update state */ },
  onLoadComplete: () => { /* trigger render */ },
});

await textureCoordinator.loadPropTextures("staff", "staff");
await textureCoordinator.loadGridTexture("diamond", pixiRenderer, canvasSize);
```

**Why separate?**
- Texture loading is independent of rendering
- Different lifecycle (load once vs render many times)
- Clear responsibility boundary
- Easier to test loading logic in isolation

### AnimatorPrecomputationCoordinator.svelte.ts
**Purpose**: Coordinate animation path caching and frame pre-rendering

**Responsibilities**:
- Path cache management
- Frame pre-renderer setup
- Pre-render progress tracking
- Cache clearing when sequence changes

**Usage**:
```typescript
const precomputationCoordinator = new AnimatorPrecomputationCoordinator();
precomputationCoordinator.initialize(orchestrator, trailCaptureService, pixiRenderer, ...);
precomputationCoordinator.setCallbacks({
  onStateChange: (state) => { /* update local state */ },
});

precomputationCoordinator.clearCaches(); // When sequence changes
```

**Why separate?**
- Precomputation is a performance optimization, not core rendering
- Complex state machine (precomputing, pre-rendering, ready)
- Can be disabled/enabled without affecting render loop
- Clear separation of concerns

### AnimatorRenderCoordinator.svelte.ts
**Purpose**: Coordinate the animation render loop

**Responsibilities**:
- Render loop initialization
- Trigger renders with frame params
- Stop render loop on cleanup

**Usage**:
```typescript
const renderCoordinator = new AnimatorRenderCoordinator();
renderCoordinator.initialize(pixiRenderer, trailCaptureService, pathCache, canvasSize);

// Trigger render with on-demand frame params
renderCoordinator.triggerRender(() => buildFrameParams({ ... }));

renderCoordinator.stop(); // Cleanup
```

**Why separate?**
- Render loop is independent of state management
- Clean separation: state → frame params → render
- Easy to test render triggers without full canvas setup
- Clear lifecycle (initialize → trigger → stop)

---

## Phase 3: Slim AnimatorCanvas (Orchestration)

**New size**: 480 lines (down from 731 - 34% reduction)

**Responsibilities** (what remains):
1. Receive props from parent
2. Initialize coordinators
3. Sync reactive state to coordinators via $effects
4. Delegate complex operations to coordinators
5. Provide frame params via pure utility

**What was removed**:
- ❌ Service initialization logic → AnimatorCanvasInitializer
- ❌ Texture loading logic → AnimatorTextureCoordinator
- ❌ Precomputation logic → AnimatorPrecomputationCoordinator
- ❌ Render loop logic → AnimatorRenderCoordinator
- ❌ Frame param construction → buildFrameParams()
- ❌ Beat number calculation → calculateBeatNumber()
- ❌ Prop type extraction → extractBluePropType/extractRedPropType

**Key improvements**:
```typescript
// BEFORE: Complex logic inline
const beatNumber = $derived.by(() => {
  if (!sequenceData || !beatData) return 0;
  const beatIndex = sequenceData.beats?.findIndex((b) => b === beatData);
  if (beatIndex !== undefined && beatIndex >= 0) return beatIndex + 1;
  return 0;
});

// AFTER: Pure utility
const beatNumber = $derived(calculateBeatNumber(sequenceData, beatData));
```

```typescript
// BEFORE: Inline service initialization
function initializePropTextureService() {
  if (!pixiRenderer || !svgGenerator) return;
  propTextureService = new PropTextureService();
  propTextureService.initialize(pixiRenderer, svgGenerator);
  propTextureService.setTrailCaptureService(trailCaptureService);
  propTextureService.setDimensionsLoadedCallback((blue, red) => {
    bluePropDimensions = blue;
    redPropDimensions = red;
  });
  propTextureService.setLoadCompleteCallback(() => {
    renderLoopService?.triggerRender(getFrameParams);
  });
}

// AFTER: Coordinator handles it
textureCoordinator = new AnimatorTextureCoordinator();
textureCoordinator.initialize(pixiRenderer, svgGenerator, trailCaptureService);
textureCoordinator.setCallbacks({
  onPropDimensionsLoaded: (blue, red) => {
    bluePropDimensions = blue;
    redPropDimensions = red;
  },
  onLoadComplete: () => {
    renderCoordinator?.triggerRender(getFrameParams);
  },
});
```

---

## Migration Guide

### Step 1: Test the refactored version

Replace `AnimatorCanvas.svelte` with `AnimatorCanvas.v2.svelte` in one test location:

```typescript
// Before
import AnimatorCanvas from "$lib/shared/animation-engine/components/AnimatorCanvas.svelte";

// After
import AnimatorCanvas from "$lib/shared/animation-engine/components/AnimatorCanvas.v2.svelte";
```

### Step 2: Test all animator canvas instances

Locations to test:
- Timeline preview
- Sequence browser
- Create module workspace
- Compose module preview

### Step 3: Verify functionality

Test:
- ✅ Props render correctly
- ✅ Grid visibility toggles work
- ✅ Trails appear and update
- ✅ Glyph transitions work
- ✅ Resize operations work
- ✅ Sequence changes clear caches
- ✅ Prop type changes reload textures

### Step 4: Replace original

Once verified:
```bash
mv src/lib/shared/animation-engine/components/AnimatorCanvas.svelte src/lib/shared/animation-engine/components/AnimatorCanvas.old.svelte
mv src/lib/shared/animation-engine/components/AnimatorCanvas.v2.svelte src/lib/shared/animation-engine/components/AnimatorCanvas.svelte
```

---

## Testing Strategy

### Pure Utilities (Phase 1)
Easy to test - just unit tests:

```typescript
import { calculateBeatNumber } from "../utils/BeatNumberCalculator";

describe("calculateBeatNumber", () => {
  it("returns 0 for start position", () => {
    expect(calculateBeatNumber(sequenceData, null)).toBe(0);
  });

  it("returns 1-indexed beat number", () => {
    const beatData = sequenceData.beats[0];
    expect(calculateBeatNumber(sequenceData, beatData)).toBe(1);
  });
});
```

### Coordinators (Phase 2)
Mock dependencies, test lifecycle:

```typescript
import { AnimatorTextureCoordinator } from "../coordinators/AnimatorTextureCoordinator.svelte";

describe("AnimatorTextureCoordinator", () => {
  it("calls onLoadComplete after prop textures load", async () => {
    const coordinator = new AnimatorTextureCoordinator();
    const mockCallback = vi.fn();

    coordinator.initialize(mockPixiRenderer, mockSvgGenerator, null);
    coordinator.setCallbacks({ onLoadComplete: mockCallback });

    await coordinator.loadPropTextures("staff", "staff");

    expect(mockCallback).toHaveBeenCalled();
  });
});
```

### AnimatorCanvas (Phase 3)
Integration tests - verify coordination:

```typescript
import { render } from "@testing-library/svelte";
import AnimatorCanvas from "./AnimatorCanvas.v2.svelte";

it("renders props when initialized", () => {
  const { container } = render(AnimatorCanvas, {
    props: { blueProp, redProp, ... }
  });

  // Verify canvas exists
  const canvas = container.querySelector("canvas");
  expect(canvas).toBeTruthy();
});
```

---

## Benefits

### Developer Experience
- **Easier debugging**: Each coordinator can be inspected independently
- **Clear responsibility**: "Where is texture loading?" → AnimatorTextureCoordinator
- **Testable**: Pure functions are trivial to test
- **Readable**: 480 lines vs 731 lines in main canvas

### AI-Assisted Development
- **Smaller context windows**: Can focus on one coordinator at a time
- **Less hallucination**: Clear boundaries prevent AI from guessing at complex interactions
- **Better refactoring**: AI can work on one primitive without breaking others
- **Faster iteration**: Changes to texture loading don't require understanding render loop

### Performance
- **No regression**: Same services, just better organized
- **Easier optimization**: Can optimize coordinators independently
- **Clear profiling**: "Texture loading slow?" → Focus on AnimatorTextureCoordinator

### Maintainability
- **Single responsibility**: Each file has one clear job
- **Easy to extend**: Add new coordinators without touching existing ones
- **Clear lifecycle**: Initialize → use → cleanup
- **Better git diffs**: Changes are localized to relevant files

---

## Architecture Decisions

### Why .svelte.ts for coordinators?
Enables Svelte 5 universal reactivity - can use runes outside components.

### Why not $derived for complex values?
Research showed functions are more flexible and require less mental overhead ([Source](https://blog.logrocket.com/exploring-runes-svelte-5/#key-architecture-considerations)).

### Why separate texture/precomputation/render?
Different lifecycles:
- **Textures**: Load once when prop type changes
- **Precomputation**: Compute once when sequence changes
- **Render**: Happens every frame or on-demand

Combining them creates coupling and makes testing harder.

### Why pure utilities?
Pure functions are:
- Trivial to test (no mocks needed)
- Reusable anywhere (components, workers, tests)
- Easy to reason about (same inputs = same outputs)
- AI-friendly (no side effects to track)

---

## Future Enhancements

### Potential Extractions
- **AnimatorStateSync.svelte.ts**: Consolidate all visibility/glyph/cache sync services
- **AnimatorInitializer.svelte.ts**: Further slim down initialization logic
- **AnimatorEffects.svelte.ts**: Extract $effect blocks into declarative service

### Performance Optimizations
- **Offscreen Canvas**: Move rendering to worker thread
- **Texture Atlas**: Combine textures to reduce GPU state changes
- **Lazy Loading**: Only initialize coordinators when needed

### Testing Improvements
- **Visual regression tests**: Snapshot canvases before/after renders
- **Performance benchmarks**: Track render time per coordinator
- **Integration tests**: Test full animator canvas lifecycle

---

## References

**PixiJS v8**:
- [PixiJS v8 Architecture](https://pixijs.com/8.x/guides/concepts/architecture)
- [v8 Migration Guide](https://pixijs.com/8.x/guides/migrations/v8)

**Reactive + WebGL**:
- [React + Canvas Patterns](https://simonharris.co/using-react-with-canvas-webgl-and-custom-renderers/)
- [WebGL in React](https://dev.to/jacklehamster/webgl-canvas-in-react-45m5)
- [Vanilla JS Reactivity](https://frontendmasters.com/blog/vanilla-javascript-reactivity/)

**Svelte 5 Runes**:
- [Introducing Runes](https://svelte.dev/blog/runes)
- [What are runes?](https://svelte.dev/docs/svelte/what-are-runes)
- [Exploring Runes in Svelte 5](https://blog.logrocket.com/exploring-runes-svelte-5/)

---

**Last updated**: 2025-12-19

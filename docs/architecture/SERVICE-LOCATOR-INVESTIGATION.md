# Service Locator Investigation Results

**Date:** 2025-12-12
**Phase:** 1 - Dependency Graph Investigation

---

## Executive Summary

| Metric                                   | Count    |
| ---------------------------------------- | -------- |
| Proper constructor injection (`@inject`) | **261**  |
| Service locator calls (`resolve()`)      | **43**   |
| Symbols in types.ts                      | **~280** |
| Lines in types.ts                        | **557**  |
| Duplicate initializer classes            | **3**    |

**Good news:** The majority (86%) of dependency resolution uses proper constructor injection. The service locator anti-pattern is concentrated in specific areas.

---

## Service Locator Call Sites (43 total)

### 1. Create Module Initializers (34 calls) - PRIORITY FIX

**Three duplicate classes doing the same thing:**

| File                                   | resolve() calls | Status                        |
| -------------------------------------- | --------------- | ----------------------------- |
| `CreateModuleInitializationService.ts` | 17              | Injectable, most complete     |
| `CreateModuleInitializer.ts`           | 9               | Plain class, better structure |
| `ServiceInitializer.ts`                | 8               | Static methods only           |

**Recommendation:** Consolidate into one class using constructor injection.

### 2. BackgroundFactory.ts (12 calls)

```typescript
// All 12 calls in BackgroundFactory.createDeepOcean():
await resolve(TYPES.IBubblePhysics);
await resolve(TYPES.IParticleSystem);
await resolve(TYPES.ILightRayCalculator);
await resolve(TYPES.IFishAnimator);
await resolve(TYPES.IJellyfishAnimator);
await resolve(TYPES.IGradientRenderer);
await resolve(TYPES.ILightRayRenderer);
await resolve(TYPES.IBubbleRenderer);
await resolve(TYPES.IParticleRenderer);
await resolve(TYPES.IFishRenderer);
await resolve(TYPES.IJellyfishRenderer);
```

**Analysis:** This is lazy loading for a heavy feature (Deep Ocean background). May be intentional to avoid loading 11 services at startup.

**Recommendation:** Convert to constructor injection OR create a `DeepOceanServiceBundle` that injects all 12 and is itself lazily resolved.

### 3. Svelte Components (10 calls)

| Component                         | Services Resolved                                                             |
| --------------------------------- | ----------------------------------------------------------------------------- |
| `MainApplication.svelte`          | IApplicationInitializer, ISettingsState, IDeviceDetector, ISheetRouterService |
| `InviteCollaboratorsSheet.svelte` | IUserService, ICollaborativeVideoService, IHapticFeedbackService              |
| `QuizTab.svelte`                  | ICodexService, IQuizRepoManager                                               |
| `PendingInviteCard.svelte`        | ICollaborativeVideoService, IHapticFeedbackService                            |
| `UserVideoLibraryView.svelte`     | ICollaborativeVideoService                                                    |
| `PendingInvitesList.svelte`       | ICollaborativeVideoService                                                    |
| `WordCardTab.svelte`              | IDiscoverLoader                                                               |
| `TrainSetup.svelte`               | IDiscoverLoader                                                               |
| `CAPSelectionPanel.svelte`        | ICAPTypeService                                                               |
| `TunnelRenderer.svelte`           | ISettingsState                                                                |

**Recommendation:** Move to Svelte context pattern - resolve at root, provide via `setContext()`.

### 4. State Files (3 calls)

| File                             | Services                              |
| -------------------------------- | ------------------------------------- |
| `services.svelte.ts`             | ISettingsState                        |
| `start-position-state.svelte.ts` | IStartPositionService, ISettingsState |

### 5. Other Services (2 calls)

| File                       | Services                      |
| -------------------------- | ----------------------------- |
| `AnimatorServiceLoader.ts` | ISVGGenerator, ISettingsState |

---

## Circular Dependency Analysis

**Finding:** No obvious circular dependencies detected.

The service locator pattern appears to have been used to:

1. Avoid dealing with InversifyJS initialization order
2. Enable lazy loading of heavy services
3. Simplify Svelte component service access

**ISettingsState** is notable: resolved 5+ times via `resolve()` but **never** via `@inject()`. This suggests it may need to be available before the DI container is fully initialized.

---

## Recommended Fix Priority

### Phase 2A: Consolidate Initializers (Highest Impact)

- Merge 3 initializer classes into one
- Convert to constructor injection
- Eliminates 34 resolve() calls

### Phase 2B: Fix BackgroundFactory

- Create `DeepOceanServiceBundle` with all 12 dependencies
- Inject bundle via constructor
- Eliminates 12 resolve() calls

### Phase 2C: Svelte Component Pattern

- Create service context provider at MainApplication level
- Components use `getContext()` instead of `resolve()`
- Document the pattern for consistency

### Phase 2D: ISettingsState Special Case

- Investigate why it's never constructor-injected
- May need to remain a resolve() for initialization order
- Document as intentional exception if so

---

## Files to Modify

| Phase | File                                   | Action               |
| ----- | -------------------------------------- | -------------------- |
| 2A    | `CreateModuleInitializationService.ts` | Keep & refactor      |
| 2A    | `CreateModuleInitializer.ts`           | Delete after merge   |
| 2A    | `ServiceInitializer.ts`                | Delete after merge   |
| 2B    | `BackgroundFactory.ts`                 | Refactor to bundle   |
| 2C    | `MainApplication.svelte`               | Add context provider |
| 2C    | 10 Svelte components                   | Use getContext()     |

---

## Progress Log

### Phase 2C Analysis (2025-12-12) - UI-Level resolve() Calls

**Finding:** Many UI-level resolve() calls are **acceptable patterns** for Svelte 5.

**Acceptable patterns (documented as intentional):**

1. **App Root Resolution** (MainApplication.svelte)
   - Resolving services at the composition root is the DI best practice
   - 4 calls: IApplicationInitializer, ISettingsState, IDeviceDetector, ISheetRouterService

2. **Feature Module Roots** (video-collaboration components)
   - Resolve in onMount() for feature-scoped services
   - Services used only within that feature subtree
   - 7 calls spread across InviteCollaboratorsSheet, PendingInviteCard, etc.

3. **Lazy State Factories** (start-position-state.svelte.ts)
   - Memoized lazy resolution to avoid Svelte 5 effect_orphan errors
   - Services cached after first resolution
   - Pattern: `if (!service) { service = resolve(...); } return service;`

4. **Lazy Module Loading** (AnimatorServiceLoader, BackgroundFactory)
   - Services only available after dynamic module import
   - Cannot use constructor injection (services don't exist yet)

**Anti-pattern (should be fixed):**

- Services resolved inside `@injectable()` class methods (FIXED in Phase 2A)

**Conclusion:** Remaining 34 resolve() calls are acceptable lazy loading / composition root patterns.

---

### Phase 2D Complete (2025-12-12) - Inverted Dependencies

**Fixed:**

- Moved `TrailTypes.ts` from `features/compose` to `shared/animation-engine/domain/types/`
- Updated 8 shared files to import from new canonical location
- Added re-export in original location for backward compatibility

**Remaining (48 inverted imports, categorized):**

1. **Acceptable UI Composition** (~15 imports)
   - MainApplication.svelte, AnimationShareDrawer.svelte, ImageShareDrawer.svelte
   - App shell and shared drawers importing feature UI components
   - This is normal - containers compose feature content

2. **Service Contract Dependencies** (~20 imports)
   - animation-engine services importing IPixiAnimationRenderer, ITrailCaptureService, etc.
   - Would require moving entire service interfaces to shared
   - Large scope, deferred for future architecture review

3. **State Dependencies** (~13 imports)
   - Shared coordinators importing feature state factories
   - Similar scope to service contracts

**Conclusion:** TrailTypes was the key fix. Remaining dependencies are structural and acceptable for now.

---

### Phase 2E Analysis (2025-12-12) - types.ts Split

**Analysis:**

- `types.ts` is 557 lines with ~280 symbols
- Already well-organized with category comments (Core, Foundation, Application, Auth, Mobile, Navigation, etc.)
- Splitting would require updating 100+ imports throughout codebase

**Decision: DEFERRED**

Reasons:

1. File is maintainable as-is (well-commented categories)
2. Single export (`TYPES` object) - no structural issues
3. Splitting provides organizational benefit but no functional improvement
4. High effort/risk vs low reward
5. InversifyJS pattern works fine with single symbol registry

**Recommendation:** Keep as-is unless types.ts grows past 1000 lines or becomes unmaintainable.

---

### Phase 2A Complete (2025-12-12)

**Results:**

- `resolve()` calls: 43 → 34 (21% reduction)
- Eliminated 3 initializer classes → 1 (consolidated)
- `CreateModuleInitializationService` now uses 17 `@inject()` parameters

**Files changed:**

- `CreateModuleInitializationService.ts` - refactored to constructor injection
- `ServiceInitializer.ts` - DELETED (duplicate)
- `CreateModuleInitializer.ts` - DELETED (unused)
- `types/create-module-services.ts` - NEW (extracted type)

---

## Success Metrics

After full remediation:

- [x] 1 initializer class instead of 3
- [x] CreateModuleInitializationService uses constructor injection
- [ ] `resolve()` calls reduced from 43 to <10 (currently at 34)
- [ ] All `@injectable()` services use constructor injection
- [ ] Documented exceptions for legitimate lazy resolution

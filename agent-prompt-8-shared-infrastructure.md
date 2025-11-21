# Agent 8: Fix Shared Infrastructure & Services Warnings

## Your Task

Fix all `@typescript-eslint/no-unnecessary-condition` warnings in **shared infrastructure, auth, background, and render services**.

## Files to Fix (in this order)

### Application & Auth

1. `src/lib/shared/application/state/services.svelte.ts` (4 warnings - always falsy)
2. `src/lib/shared/application/state/ui/module-state.ts` (1 warning)
3. `src/lib/shared/application/state/app-state-factory.svelte.ts` (1 warning)
4. `src/lib/shared/application/state/auto-sync-state.svelte.ts` (3 warnings - types no overlap)
5. `src/lib/shared/application/services/implementations/DataTransformationService.ts` (1 warning - types no overlap)
6. `src/lib/shared/application/services/implementations/HapticFeedbackService.ts` (1 warning)
7. `src/lib/shared/application/services/implementations/ResourceTracker.ts` (3 warnings)
8. `src/lib/shared/auth/services/implementations/AuthService.ts` (2 warnings)
9. `src/lib/shared/auth/stores/authStore.svelte.ts` (3 warnings)

### Background Systems

10. `src/lib/shared/background/aurora/services/AuroraBackgroundSystem.ts` (1 warning - unnecessary ??)
11. `src/lib/shared/background/aurora/services/AuroraBorealisBackgroundSystem.ts` (1 warning - types no overlap)
12. `src/lib/shared/background/deep-ocean/services/DeepOceanBackgroundSystem.ts` (1 warning - both sides literal)
13. `src/lib/shared/background/deep-ocean/services/implementations/FishSpriteManager.ts` (1 warning)
14. `src/lib/shared/background/night-sky/services/ConstellationSystem.ts` (3 warnings)
15. `src/lib/shared/background/shared/services/implementations/PerformanceTracker.ts` (1 warning)
16. `src/lib/shared/background/shared/services/implementations/ShootingStarSystem.ts` (2 warnings)
17. `src/lib/shared/background/snowfall/services/SnowflakeSystem.ts` (1 warning)

### Render & Other Services

18. `src/lib/shared/render/services/implementations/CanvasManagementService.ts` (3 warnings)
19. `src/lib/shared/render/services/implementations/DimensionCalculationService.ts` (1 warning)
20. `src/lib/shared/render/services/implementations/ImageCompositionService.ts` (1 warning)
21. `src/lib/shared/render/services/implementations/ImageFormatConverterService.ts` (3 warnings)
22. `src/lib/shared/render/services/implementations/SVGToCanvasConverterService.ts` (1 warning)
23. `src/lib/shared/device/services/implementations/DeviceDetector.ts` (2 warnings)
24. `src/lib/shared/mobile/services/implementations/MobileFullscreenService.ts` (2 warnings)
25. `src/lib/shared/mobile/services/implementations/PlatformDetectionService.ts` (1 warning - both sides literal)

## Common Patterns to Fix

### Pattern 1: Types have no overlap (auto-sync-state.svelte.ts)

```typescript
// BEFORE
if (status === "invalid-value") {
  // status type doesn't include this
  // ...
}

// AFTER - Remove impossible checks
```

### Pattern 2: Always falsy service initialization

```typescript
// BEFORE
if (!service.initialized) return; // service is always initialized

// AFTER - Remove check or fix initialization flow
```

### Pattern 3: Canvas/context checks

```typescript
// BEFORE
const ctx = canvas.getContext("2d");
if (!ctx) return; // getContext("2d") always returns a value

// AFTER
const ctx = canvas.getContext("2d")!; // Non-null assertion
// OR just use it directly if TS knows it's not null
```

### Pattern 4: Both sides literal

```typescript
// BEFORE
const value = flag ? 100 : 100; // Both sides same!

// AFTER
const value = 100;
```

## Instructions

1. Work through by category (app/auth, background, render, device)
2. For background systems, many warnings are in animation/particle logic
3. For render services, focus on canvas and context null checks
4. After each category, verify progress
5. Expected: ~43 warnings fixed

## Special Notes

- Canvas getContext("2d") can technically return null, but in practice doesn't for 2d
- If a null check seems necessary for canvas, use non-null assertion or optional chaining based on context
- Background systems have requestAnimationFrame callbacks - check timing assumptions

## Report Back

- Warnings fixed by category
- Current total
- Any render/canvas patterns that needed special handling

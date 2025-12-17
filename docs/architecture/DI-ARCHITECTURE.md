# Dependency Injection Architecture

> **For future maintainers and AI agents**: This document explains why TKA Scribe uses InversifyJS with a global container pattern, and why this is an intentional architectural decision rather than technical debt.

## TL;DR

The DI system uses a global container with `resolve(TYPES.X)` calls. This looks like the "Service Locator anti-pattern" but is actually the **only viable DI pattern for Svelte 5 components**. Constructor injection is impossible because Svelte creates component instances, not your code.

## The Svelte 5 Constraint

### Why Constructor Injection Doesn't Work

In traditional OOP frameworks (Angular, Spring, NestJS), you write:

```typescript
class MyComponent {
  constructor(private authService: IAuthService) {} // Framework injects this
}
```

In Svelte 5, components are **not classes you instantiate**:

```svelte
<!-- You don't call new MyComponent(authService) -->
<MyComponent />
```

The Svelte compiler transforms your `.svelte` files into runtime code. You have no constructor to inject into.

### Available Options for Svelte

| Approach | How it works | Trade-offs |
|----------|--------------|------------|
| `resolve(TYPES.X)` | Global service locator | Works everywhere, survives HMR, supports interfaces |
| `getContext()` | Component-tree scoped | Only works within component tree, requires provider setup |
| Props | Pass services as props | Doesn't scale, verbose, couples parent to child needs |
| Module singletons | `export const service = new X()` | No interface abstraction, hard to test, no lazy loading |

**We chose `resolve(TYPES.X)` because:**
1. Services need to be shared across unrelated component trees
2. HMR (Hot Module Replacement) requires container persistence
3. Interface-based programming enables testing and substitution
4. Lazy module loading requires dynamic resolution

## What Inversify Actually Provides

### Service-to-Service: Real Constructor Injection

For services depending on other services, Inversify provides **proper constructor injection**:

```typescript
@injectable()
export class AnimationPlaybackController implements IAnimationPlaybackController {
  constructor(
    @inject(TYPES.IAnimationStateService) private stateService: IAnimationStateService,
    @inject(TYPES.IBeatCalculationService) private beatCalc: IBeatCalculationService
  ) {}
}
```

This is textbook dependency injection. Dependencies are:
- Declared explicitly in the constructor
- Injected by the container at instantiation
- Easily mockable in tests

### Component Boundary: Service Locator (Unavoidable)

At the boundary where Svelte components need services:

```svelte
<script lang="ts">
  import { resolve, TYPES } from '$shared/inversify';

  const animationService = resolve(TYPES.IAnimationPlaybackController);
</script>
```

This is where the "service locator" pattern appears. **This is not a bug - it's the only option** given Svelte's component model.

## Why the Token Registry is Large

The `types.ts` file (now split into `types/*.types.ts`) contains ~200 service identifiers. This reflects:

1. **Feature richness**: Animation, rendering, generation, training, etc.
2. **Single Responsibility Principle**: Small, focused services
3. **Interface segregation**: Contracts separated from implementations

The alternative would be god-classes or tight coupling. A large token registry is the **correct outcome** of following SOLID principles in a feature-rich application.

## HMR Support

The global container on `globalThis` exists specifically for Vite's Hot Module Replacement:

```typescript
// di.ts
declare global {
  var __TKA_CONTAINER__: InversifyContainer | undefined;
}
```

Without this, every code change would:
1. Destroy the container
2. Lose all instantiated services
3. Break the running application

## File Organization

Types are split by domain for maintainability:

```
src/lib/shared/inversify/
├── di.ts                 # Resolution functions (resolve, tryResolve)
├── container.ts          # Container setup and module loading
├── types.ts              # Re-exports from types/ (backward compat)
└── types/
    ├── index.ts          # Aggregates all types into TYPES
    ├── core.types.ts     # Sequence, persistence, settings
    ├── auth.types.ts     # Authentication
    ├── ui.types.ts       # Navigation, mobile, keyboard
    ├── create.types.ts   # Sequence creation
    ├── rendering.types.ts # SVG, grid rendering
    ├── arrow.types.ts    # Arrow positioning
    ├── animation.types.ts # Animation playback
    └── ...               # Other domains
```

### Import Patterns

```typescript
// Preferred: Domain-specific import (clearer intent)
import { AnimationTypes } from '$shared/inversify/types';
const controller = resolve(AnimationTypes.IAnimationPlaybackController);

// Also valid: Unified import (backward compatible)
import { TYPES } from '$shared/inversify/types';
const controller = resolve(TYPES.IAnimationPlaybackController);
```

## Testing

Services can be tested by:

1. **Creating a test container** with mock bindings
2. **Using `tryResolve()`** for optional dependencies
3. **Injecting mocks** via container rebinding

```typescript
// Test setup
const testContainer = new Container();
testContainer.bind(TYPES.IAuthService).toConstantValue(mockAuthService);
```

## Common Misconceptions

### "This is the Service Locator anti-pattern"

Partially true, but unavoidable in Svelte. The anti-pattern critique assumes you have an alternative (constructor injection). In Svelte components, you don't.

### "The token registry is a god-object"

It's a registry, not a god-object. It doesn't contain behavior - just symbols for looking up services. The actual services are small and focused.

### "Dependencies are hidden"

At the component level, yes. At the service level, no - constructor parameters are explicit. This is the best possible outcome given Svelte's constraints.

### "Everything depends on everything"

The TYPES object is importable everywhere, but services only resolve what they need. Circular dependencies would fail at container setup, not silently.

## Conclusion

This architecture is not legacy debt to be refactored away. It's a deliberate adaptation of enterprise DI patterns to Svelte 5's component model. The global container exists because:

1. Svelte components can't use constructor injection
2. HMR requires state persistence across reloads
3. Interface-based design requires a resolution mechanism

Future refactoring should focus on **service granularity and module boundaries**, not eliminating the DI pattern itself.

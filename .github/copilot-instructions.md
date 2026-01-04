# GitHub Copilot Instructions - TKA Scribe

> Movement notation software for creating visual "pictographs" showing dance/flow art sequences. Think musical notation for physical movement - props, grid positions, arrows, timing, orientations.

## Core Architecture

### Technology Stack

- **SvelteKit 2.0** with **Svelte 5** (runes: `$state`, `$derived`, `$effect`)
- **TypeScript 5.0** with strict mode
- **InversifyJS 7.9** for dependency injection
- **Firebase** for auth, persistence, and cloud storage
- **Vite 6.0** for build tooling
- **Netlify** for deployment

### Project Structure

```
src/lib/
├── features/           # Feature modules (create, learn, library, etc.)
│   └── [feature]/
│       ├── components/ # UI components
│       ├── services/   # Business logic (implementations + contracts)
│       ├── state/      # Svelte 5 runes state
│       └── domain/     # Types, models, enums
├── shared/            # Cross-cutting infrastructure
│   ├── inversify/     # DI container & modules
│   ├── pictograph/    # Core rendering engine
│   ├── auth/          # Authentication
│   └── utils/         # Helpers
└── routes/            # SvelteKit pages
```

### Dependency Injection (InversifyJS)

**Critical Pattern:** Services are resolved via DI container, NOT imported directly.

```typescript
// ✅ CORRECT - Use DI
import { resolve, TYPES } from "$lib/shared/inversify/di";

const myService = resolve<IMyService>(TYPES.IMyService);

// ❌ WRONG - Don't import services directly
import { MyService } from "./services/MyService";
```

**Container Architecture:**

- **3-tier loading:** Core (Tier 1) → Shared (Tier 2) → Features (Tier 3, on-demand)
- **HMR-aware:** Container rebuilds on hot reload
- **Lazy loading:** Heavy libraries (PixiJS) loaded when needed
- **Module registration:** Each feature has a `*.module.ts` file that binds services

**When adding new services:**

1. Create interface in `contracts/IMyService.ts`
2. Create implementation in `implementations/MyService.ts` with `@injectable()` decorator
3. Add binding in appropriate `*.module.ts`: `bind(TYPES.IMyService).to(MyService)`
4. Add symbol to `types.ts`: `IMyService: Symbol.for('IMyService')`

## Svelte 5 Patterns

### State Management with Runes

**DO NOT use legacy Svelte stores.** Use runes exclusively:

```typescript
// ✅ CORRECT - Svelte 5 runes
let count = $state(0);
let doubled = $derived(count * 2);
let { prop1, prop2 } = $props<Props>();

$effect(() => {
  console.log(`Count changed: ${count}`);
});

// ❌ WRONG - Legacy stores
import { writable, derived } from "svelte/store";
const count = writable(0);
```

**State Factory Pattern:**

```typescript
// State files end in .svelte.ts
export function createMyState() {
  let data = $state<MyData>({ ... });
  let computed = $derived(transform(data));

  return {
    get data() { return data; },
    get computed() { return computed; },
    updateData(newData: MyData) { data = newData; }
  };
}
```

**Context Pattern for Shared State:**

```typescript
// Use context, not stores
import { getContext, setContext } from "svelte";

const key = Symbol("myState");
export const getMyState = () => getContext<MyState>(key);
export const setMyState = (state: MyState) => setContext(key, state);
```

## Environment & Release Management

### Context-Aware Development

#### When User is in VSCode (Default Mode)

- **Assume**: Development environment
- **All modules accessible** - don't add production checks in components
- **Help freely**: Build features without worrying about visibility

#### When User Types `/release`

- **Trigger**: Release workflow
- **Action**: Run `node scripts/release-to-production.js`
- **Purpose**: Update production module visibility in `netlify.toml`
- **Outcome**: Create PR or push to main

### Two-Layer Access Control

1. **Environment Layer** (netlify.toml): Production vs Development visibility
2. **Role Layer** (FeatureFlagService): User/Tester/Admin permissions

**Access Formula:** `Visible = Environment allows AND Role permits`

**Development Mode (default):**

```typescript
// ✅ Good - let system handle visibility
const canAccess = featureFlagService.canAccessModule("learn");

// ❌ Avoid - don't add manual checks
if (import.meta.env.PROD && module === "learn") return false;
```

**Commands to recognize:**

- `/release` - Start production release workflow
- `/fb` - Run feedback workflow
- `/check-env` - Display current environment status
- `/dev` - Switch to development mode
- `/prod` - Switch to production mode (for testing)

### Release Workflow Triggers

Recognize these as release intent:

- `/release`
- "push to production"
- "release to users"
- "make this live"
- "deploy to prod"
- "push to main" (ask for confirmation first)

### Smart Defaults

When user asks for help:

- **Default assumption**: Building features (dev mode)
- **Default environment**: Development (all features visible)
- **Default branch**: Development branch (not main)
- **Default action**: Help code (don't restrict)

### Behavior Rules

1. **Default to development mode** unless explicitly told otherwise
2. **Ask before production changes** (netlify.toml edits, main branch pushes)
3. **Use release script** for production visibility changes
4. **Don't add manual checks** - use FeatureFlagService
5. **Help freely** when developing
6. **Guide carefully** when releasing

### Context Clues

**User is developing when:**

- Editing files in VSCode
- On feature/develop branch
- Implementing new functionality
- Fixing bugs
- No mention of "release" or "production"

**User is releasing when:**

- Says "release", "deploy prod", "push live"
- Types `/release`
- On main branch asking to push
- Talking about making features public

### Error Prevention

**Never:**

- Add manual environment checks in component code
- Edit netlify.toml without explicit release intent
- Restrict features in development mode
- Assume production mode by default

**Always:**

- Use FeatureFlagService for access checks
- Ask before production changes
- Suggest testing on preview first
- Follow release workflow for visibility changes

## CSS & Styling

### 3-Layer CSS Variable Hierarchy

**Layer 1: Static Layout Tokens (`--settings-*`)**

- Defined in `settings-tokens.css`
- Spacing, radius, typography, transitions
- Never change with background

**Layer 2: Dynamic Theme Variables (`--theme-*`)**

- Injected by `background-theme-calculator.ts` based on luminance
- Adapt to light/dark backgrounds automatically
- Use for surfaces, text, borders, accents, shadows
- Variables: `--theme-panel-bg`, `--theme-card-bg`, `--theme-accent`, `--theme-text`, etc.

**Layer 3: Semantic Colors (`--semantic-*`, `--prop-*`)**

- Constant colors that never change
- Status: `--semantic-error`, `--semantic-success`, `--semantic-warning`, `--semantic-info`
- Domain-specific: `--prop-blue`, `--prop-red`

**Pattern for new components:**

```css
.card {
  background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
  border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  color: var(--theme-text, #ffffff);
}
.error {
  color: var(--semantic-error);
}
```

**Legacy note:** `--*-current` variables still used in 30+ components, migration ongoing.

### Styling Patterns

- **Component-scoped** `<style>` blocks (no global styles in components)
- **Container queries** for responsive design: `cqw`, `cqh` units
- **Mobile-first** with progressive enhancement
- **Hardware-accelerated animations**: Use `transform` and `opacity` (GPU-friendly)

## File Organization & Composition

### 2025 AI-Assisted Development Philosophy

- **Single responsibility per file** - each file does one thing well
- **Composition over consolidation** - build features by composing services
- **Don't warn about "too many files"** - AI navigation makes file count a non-issue
- **Extract when there are multiple responsibilities** - not to hit arbitrary line counts
- **Service-based architecture** - logic lives in services, components orchestrate

**Why this matters:**

- Smaller files = smaller context windows = faster/cheaper AI assistance
- Cleaner git diffs, easier reviews
- Each file fully readable in one screen
- Easier to test, modify, and reason about

**What's NOT a good split:**

- Re-export files that just forward imports
- Wrapper components with no logic
- Splitting cohesive logic just to reduce line count
- Utility functions that belong together

## Testing Strategy

### Test Structure

```
tests/
├── unit/              # Fast isolated tests (Vitest)
├── integration/       # Service integration tests
├── e2e/              # End-to-end tests (Playwright)
└── performance/      # Performance benchmarks
```

### Key Commands

```bash
npm run test           # Unit + integration tests
npm run test:e2e       # Playwright E2E tests
npm run check          # TypeScript checking
npm run flows          # Critical user flow tests
```

### Testing Patterns

- **Unit tests**: Test services in isolation with mocked dependencies
- **E2E tests**: Test critical user journeys (construct → generate → share)
- **No E2E for implementation details** - test user behavior, not internals
- **Mock browser APIs** in unit tests (see `tests/setup/vitest-setup.ts`)

## Development Workflows

### Common Commands

```bash
npm run dev           # Start dev server (all features visible)
npm run dev:clean     # Clean cache and restart (after deleting files)
npm run build         # Production build
npm run check         # Type check all files
npm run lint:fix      # Fix linting issues
npm run validate      # Lint + check + test
```

### HMR (Hot Module Replacement)

- **Vite handles HMR** - fast updates without full reload
- **Container rebuilds on HMR** - InversifyJS container is HMR-aware
- **If HMR breaks**: Use `npm run dev:clean` to clear cache
- **After deleting files**: Always run `dev:clean` to prevent stale imports

### Mobile Development

```bash
npm run dev:mobile    # Set up ADB reverse proxy for mobile testing
```

- Mobile connects via IP, requires CORS headers for fonts (handled by Vite plugin)
- Test on actual devices, not just browser DevTools

## Feedback & Release Workflows

### Feedback Workflow (`/fb`)

- **5 statuses**: `new → in-progress → in-review → completed → archived`
- **Kanban phase**: Active development (new/in-progress/in-review)
- **Staging phase**: Ready for next release (completed)
- **Release phase**: Shipped and versioned (archived)

**CRITICAL:** Display feedback verbatim before any analysis

- Show: ID, type, priority, user, timestamp, module/tab, description, notes, subtasks
- Then provide assessment and recommendations

**What goes in release notes:**

- ✅ User-facing features, bug fixes, UX improvements
- ❌ Dev tooling, admin features, internal refactoring, architecture changes
- **Test:** "Would a flow artist who doesn't code care about this?"

### Release Workflow

```bash
node scripts/release.js -p      # Preview next release
node scripts/release-to-production.js  # Execute release
```

**Integration Points:**

- **VSCode Tasks**: "🚀 Release to Production" task launches release workflow
- **Git Hooks**: Auto environment switching
- **Firebase Admin**: Version management
- **Netlify**: Auto-deployment with preview URLs for every PR

**Testing Before Release:**

```bash
# Local development - all features visible
npm run dev

# Production simulation - test what users see
node scripts/switch-environment.js prod
npm run dev
```

### Example Interactions

**User:** "Add a new feature to Learn module"  
**Agent:** _Helps implement feature, assumes dev environment_

**User:** "This is ready for users"  
**Agent:** "Great! Let's release this to production. I'll guide you through the release workflow..."

**User:** `/release`  
**Agent:** _Immediately runs release script_

**User:** "git push origin main"  
**Agent:** "⚠️ Pushing to main will deploy to production. Are you ready to release these changes to users?"

## Key Files & Conventions

### Import Patterns

```typescript
// ✅ Use path aliases
import { MyService } from "$lib/services/MyService";
import { goto } from "$app/navigation";

// ❌ Avoid relative paths
import { MyService } from "../../../services/MyService";
```

### File Naming

- Components: `PascalCase.svelte`
- Services: `PascalCase.ts`
- State: `kebab-case.svelte.ts` (runes files)
- Types: `PascalCase.ts` or `kebab-case.ts`
- Tests: `*.test.ts` (unit), `*.spec.ts` (E2E)

### Service Naming Convention (CRITICAL)

**Never use the word "Service" in service names.** Use descriptive, verb-based names instead.

This is a core architectural decision. The word "Service" is redundant - everything in the `services/` folder is already a service. Using action-oriented names makes the codebase more readable and intention-revealing.

**Naming patterns:**

| If the service does...  | Name it...      | Example                                   |
| ----------------------- | --------------- | ----------------------------------------- |
| Detection/checking      | `*Detector`     | `LOOPDetector`, `ReversalDetector`        |
| Management/coordination | `*Manager`      | `TurnManager`, `CollectionManager`        |
| Configuration           | `*Configurator` | `CardConfigurator`                        |
| Orchestration           | `*Orchestrator` | `GenerationOrchestrator`                  |
| Persistence/storage     | `*Persister`    | `SequencePersister`, `FilterPersister`    |
| Loading data            | `*Loader`       | `SequenceLoader`, `OptionLoader`          |
| Filtering               | `*Filter`       | `OptionFilter`, `DiscoverFilter`          |
| Sorting                 | `*Sorter`       | `OptionSorter`, `DiscoverSorter`          |
| Validation              | `*Validator`    | `SequenceValidator`                       |
| Transformation          | `*Transformer`  | `SequenceTransformer`                     |
| Analysis                | `*Analyzer`     | `SequenceAnalyzer`, `PositionAnalyzer`    |
| Calculation             | `*Calculator`   | `SequenceStatsCalculator`                 |
| Export/conversion       | `*Exporter`     | `SequenceExporter`, `CocoExporter`        |
| Import                  | `*Importer`     | `SequenceImporter`                        |
| Indexing                | `*Indexer`      | `SequenceIndexer`                         |
| Repository/CRUD         | `*Repository`   | `LibraryRepository`, `FeedbackRepository` |
| Playing media           | `*Player`       | `MusicPlayer`                             |
| Recording               | `*Recorder`     | `PerformanceRecorder`                     |
| Tracking                | `*Tracker`      | `SessionTracker`, `ActivityTracker`       |
| Handling events         | `*Handler`      | `DeepLinkSequenceHandler`                 |
| Notifying               | `*Notifier`     | `AdminNotifier`                           |
| Caching                 | `*Cache`        | `DiscoverCache`, `SequenceCache`          |

**Examples:**

```typescript
// ✅ CORRECT - Descriptive, action-oriented names
class LOOPDetector implements ILOOPDetector {}
class SequencePersister implements ISequencePersister {}
class TurnManager implements ITurnManager {}
class OptionFilter implements IOptionFilter {}

// ❌ WRONG - Redundant "Service" suffix
class LOOPDetectionService implements ILOOPDetectionService {}
class SequencePersistenceService implements ISequencePersistenceService {}
class TurnManagementService implements ITurnManagementService {}
class OptionFilterService implements IOptionFilterService {}
```

**Interface naming:** Interfaces follow the same pattern with `I` prefix:

- `ISequencePersister` (not `ISequencePersistenceService`)
- `ILOOPDetector` (not `ILOOPDetectionService`)

**When creating new services:**

1. Think: "What does this service DO?"
2. Name it after that action: Detector, Manager, Loader, etc.
3. Never append "Service" - it adds no information

### Critical Files

- `src/lib/shared/inversify/container.ts` - DI container initialization
- `src/lib/shared/inversify/types.ts` - Service symbols
- `netlify.toml` - Deployment config (production module visibility)
- `vite.config.ts` - Build configuration
- `svelte.config.js` - SvelteKit configuration

## Error Handling

### `/check` Command Behavior

When running type checks:

1. Analyze errors to determine strategy:
   - **<10 simple errors**: Fix immediately in single session
   - **10-50 errors**: Launch parallel subagents for file groups
   - **>50 or cascading errors**: Generate scoped prompts for separate sessions
2. **Present analysis first** - show error summary, strategy, rationale
3. **Get confirmation** before proceeding with fixes
4. **Look for root causes** - don't just count errors, understand cascading issues

## Project-Specific Context

- **Primary developer**: Austen Cloud (austencloud@gmail.com)
- **Purpose**: Movement notation for flow artists (not dancers, not general choreography)
- **User base**: Flow artists creating prop sequences (staff, poi, fans, etc.)
- **Domain**: "Pictographs" are the visual diagrams showing movement sequences
- **Firebase** is the backend - auth, Firestore, storage
- **Netlify** handles deployment - preview URLs for every PR

**When in doubt, assume development mode and help the user build!**

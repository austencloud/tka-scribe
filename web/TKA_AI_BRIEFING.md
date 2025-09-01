# TKA (The Kinetic Constructor) - AI Assistant Development Briefing

> **🎯 Purpose**: Kinetic movement notation software - creates visual "pictographs" showing dance/flow art sequences  
> **👤 Developer**: Austen Cloud (tkaflowarts@gmail.com)  
> **🤖 AI Role**: Development partner for SvelteKit + TypeScript web app with **Svelte 5 runes + InversifyJS architecture**

---

## ⚡ **PROJECT OVERVIEW**

**What TKA Does**: Digital "sheet music" for dancers - visual diagrams showing movement sequences with props (fans, poi), arrows (direction), timing, and grid positions.

**Primary Target**: `C:\TKA\web\` - SvelteKit/TypeScript web application

**🏗️ ARCHITECTURE PRINCIPLES:**
- **Perfect Layer Separation** - Services/State/Components completely isolated
- **Svelte 5 runes** - All reactive state uses $state, $derived, $props, $effect
- **InversifyJS** - Professional dependency injection with decorators and symbols
- **Pure Services** - Zero UI concerns, completely testable business logic
- **Pure State** - Only runes and service orchestration, no business logic
- **Pure Components** - Only presentation and user interaction

---

## 🗂️ **PROJECT STRUCTURE**

```
C:\TKA\
├── desktop/                  # Python desktop application (reference)
└── web/                      # Main SvelteKit web application
    ├── src/
    │   ├── lib/
    │   │   ├── components/       # UI Components
    │   │   │   ├── core/         # Core reusable components
    │   │   │   ├── features/     # Feature-specific components
    │   │   │   ├── pictograph/   # Visual movement diagrams
    │   │   │   ├── navigation/   # App navigation
    │   │   │   ├── layout/       # Layout components
    │   │   │   ├── tabs/         # Tab system components
    │   │   │   ├── ui/           # Base UI elements
    │   │   │   └── views/        # Page view components
    │   │   ├── services/         # Business logic layer
    │   │   │   ├── implementations/  # Service classes
    │   │   │   ├── contracts/        # Service interfaces (NOT interfaces/)
    │   │   │   ├── inversify/        # InversifyJS DI setup
    │   │   │   │   ├── bootstrap.ts  # Container initialization (MINIMAL - mostly TODOs)
    │   │   │   │   ├── container.ts  # Service bindings (MASSIVE - 400+ lines)
    │   │   │   │   └── types.ts      # DI type symbols (MASSIVE - 180+ lines)
    │   │   │   └── bootstrap.ts      # DOES NOT EXIST - No legacy system
    │   │   ├── state/            # Reactive state (runes-based)
    │   │   │   ├── services/     # State service layer
    │   │   │   └── *.svelte.ts   # Rune-based state files
    │   │   ├── domain/           # Data models (TypeScript)
    │   │   ├── repositories/     # Data access layer
    │   │   ├── utils/            # Helper functions
    │   │   └── types/            # Type definitions
    │   ├── routes/               # SvelteKit pages
    │   │   ├── browse/           # Browse sequences
    │   │   ├── constructor/      # Sequence builder
    │   │   ├── learn/            # Learning content
    │   │   └── features/         # Feature pages
    │   └── types/                # Global types
    ├── package.json
    └── svelte.config.js
```

---

## 🏗️ **ENTERPRISE ARCHITECTURE (CURRENT REALITY)**

### **Service Layer (Pure Business Logic)**
- **ZERO Svelte dependencies** - Pure TypeScript classes
- **ZERO runes** - No reactive concerns whatsoever
- All business rules, validation, calculations, data transformation
- Located in `services/implementations/`
- Fully testable in isolation with `@injectable()` decorators
- **Interfaces defined in `services/contracts/`** (NOT interfaces/)

### **State Layer (Pure Reactive Management)**
- **ONLY runes** - $state, $derived, $effect, $props exclusively
- **ZERO business logic** - Pure reactive wrappers around service calls
- Manages UI concerns: loading, error states, component state
- Located in `state/` directory with `.svelte.ts` files
- **TWO PATTERNS**: Factory functions AND service class singletons

### **Component Layer (Pure Presentation)**
- **ONLY UI concerns** - Presentation and user interaction
- **ZERO business logic** - No direct service calls
- **ZERO complex state management** - Consumes state layer
- Svelte components in `components/`
- Event handling and rendering only

### **InversifyJS Layer (Dependency Injection)**
- Professional IoC container with decorators  
- Located in `services/inversify/`
- Service type symbols defined in `types.ts` (MASSIVE 180+ lines)
- **Services bound directly in `container.ts`** (MASSIVE 400+ lines with all services)
- Container initialization in `bootstrap.ts` (MINIMAL - mostly TODOs)
- **Direct resolve() imports** - Components import resolve() directly from container

### **Domain Layer (Data Models)**
- TypeScript interfaces and types in `domain/`
- Define the core data structures
- Used by all layers but owned by none

---

## 🔧 **DEVELOPMENT PATTERNS (ACTUAL)**

### **For Service Resolution (CURRENT REALITY):**
```typescript
// Components resolve services directly - NO context pattern
import { resolve, TYPES } from '$lib/services/inversify/container';

// Direct resolution in components
const sequenceService = resolve(TYPES.ISequenceService) as ISequenceService;
const buildTabService = resolve(TYPES.IBuildTabService) as IBuildTabService;
```

### **For InversifyJS Service Development:**
```typescript
// services/contracts/IFeatureService.ts
export interface IFeatureService {
  processData(input: InputData): Promise<OutputData>;
}

// services/implementations/FeatureService.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '../inversify/types';

@injectable()
export class FeatureService implements IFeatureService {
  constructor(
    @inject(TYPES.IValidationService) private validationService: IValidationService,
    @inject(TYPES.ICalculationService) private calculationService: ICalculationService
  ) {}
  
  async processData(input: InputData): Promise<OutputData> {
    // Pure business logic - no runes or Svelte
    const validated = this.validationService.validate(input);
    return this.calculationService.process(validated);
  }
}

// services/inversify/types.ts
export const TYPES = {
  IFeatureService: Symbol.for('IFeatureService'),
  // ... other symbols
};

// services/inversify/container.ts
container.bind<IFeatureService>(TYPES.IFeatureService).to(FeatureService);
```

### **For State Management (TWO ACTUAL PATTERNS):**

**Pattern 1: Factory Functions (Component State)**
```typescript
// state/feature-state.svelte.ts
export function createFeatureState(service: IFeatureService) {
  let data = $state<FeatureData>(initialData);
  let loading = $state<boolean>(false);
  let error = $state<string | null>(null);
  
  // Derived values using $derived
  const processedData = $derived(() => {
    return service.transform(data);
  });
  
  async function updateData(newData: FeatureData) {
    loading = true;
    data = await service.processData(newData);
    loading = false;
  }
  
  return {
    get data() { return data; },
    get loading() { return loading; },
    get processedData() { return processedData; },
    updateData
  };
}
```

**Pattern 2: Service Classes (Global State)**
```typescript
// state/services/FeatureStateService.svelte.ts
class FeatureStateService {
  #data = $state<FeatureData>(initialData);
  #loading = $state<boolean>(false);
  
  get data() { return this.#data; }
  get loading() { return this.#loading; }
  
  async updateData(newData: FeatureData) {
    this.#loading = true;
    this.#data = newData;
    this.#loading = false;
  }
}

export const featureStateService = new FeatureStateService();
```

### **For Component Development:**
```svelte
<script lang="ts">
  import { resolve, TYPES } from '$lib/services/inversify/container';
  
  // Services - resolved directly (no context pattern)
  const featureService = resolve(TYPES.IFeatureService) as IFeatureService;
  
  // Component props
  let { initialData } = $props();
  
  // Create component state
  const featureState = createFeatureState(featureService);
</script>
```

---

## 🎯 **TECHNOLOGY STACK**

### **Core Technologies:**
- **Framework**: SvelteKit ^2.0.0 with Svelte ^5.0.0
- **Language**: TypeScript ^5.0.0
- **State**: Svelte 5 runes ($state, $derived, $effect)
- **DI Container**: InversifyJS ^7.9.0 with reflect-metadata
- **Build**: Vite ^6.0.0
- **Deployment**: Netlify

### **Key Dependencies:**
- `inversify: ^7.9.0` - Professional IoC container
- `reflect-metadata: ^0.2.2` - Required for InversifyJS decorators
- `lucide-svelte: ^0.539.0` - Icon library
- `lodash: ^4.17.21` - Utility functions
- `fabric: ^6.7.1` - Canvas manipulation
- `zod: ^3.25.76` - Schema validation

### **Project Aliases:**
```typescript
$lib: "./src/lib"
$components: "./src/lib/components"
$domain: "./src/lib/domain"
$services: "./src/lib/services"
$stores: "./src/lib/stores"
$utils: "./src/lib/utils"
```

---

## 🚨 **DEVELOPMENT RULES**

### **Required Patterns:**
- Use Svelte 5 runes for all reactivity
- Use InversifyJS for dependency injection with `@injectable()` and `@inject()`
- Separate business logic into service classes with interfaces
- Register all services with type symbols in the DI container
- Keep components focused on presentation
- Use TypeScript for strong typing

### **Forbidden Patterns:**
- No legacy DI system (there is none - it doesn't exist)
- No Svelte stores (use runes instead)
- No business logic in components
- No runes in service classes
- No mixed concerns between layers
- No direct service instantiation (use DI container)

### **Architecture Validation:**
- Can business logic be tested without UI? (Should be yes)
- Is component state purely reactive? (Should be yes)
- Are services pure TypeScript with proper DI? (Should be yes)
- Does InversifyJS container resolve cleanly? (Should be yes)
- Are service interfaces properly defined? (Should be yes)

---

## 📁 **COMMON TASKS**

### **Find Code:**
- **Business logic**: `services/implementations/`
- **Service interfaces**: `services/contracts/` (NOT interfaces/)
- **DI configuration**: `services/inversify/`
- **Reactive state**: `state/*.svelte.ts`
- **UI components**: `components/`
- **Pages**: `routes/`

### **Add New Service:**
1. Create interface in `services/contracts/`
2. Implement with `@injectable()` in `services/implementations/`
3. Add type symbol to `services/inversify/types.ts`
4. **Bind directly in `services/inversify/container.ts`**
5. Components import resolve() directly and resolve services

### **Reference Desktop Behavior:**
- Check `desktop/` directory for Python reference implementation
- Use for understanding business logic and requirements

---

## 🔍 **CURRENT MIGRATION STATUS**

**✅ Completed:**
- InversifyJS setup with container, types, and service bindings
- **MASSIVE service ecosystem** - 400+ lines of bindings in container.ts
- **Direct resolve() pattern** - Components import resolve directly
- Runes-based state management (both factory and singleton patterns)
- Component structure with service resolution

**🚧 Architecture Patterns:**
- **Two distinct state patterns**: Factory functions AND service class singletons
- **$derived usage** for computed values (not function-based)
- **Direct service resolution** (not context-based injection)

**📋 Migration Notes:**
- **All services bound directly** in container.ts (no dynamic loading)
- **No legacy DI system** - it never existed
- **Contracts directory** (not interfaces/) contains service interfaces
- **Bootstrap.ts is minimal** - just TODOs, real work is in container.ts

---

*This briefing reflects the actual current state of the TKA codebase as verified by the context engine.*

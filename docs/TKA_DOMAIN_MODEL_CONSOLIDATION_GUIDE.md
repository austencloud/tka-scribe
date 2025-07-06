# **TKA DOMAIN MODEL CONSOLIDATION - COMPLETE IMPLEMENTATION GUIDE**

## **📋 EXECUTIVE SUMMARY**

**Objective**: Consolidate domain models across TKA monorepo into shared packages, eliminating type inconsistencies and creating single source of truth.

**Scope**: Create `packages/domain/` with shared TypeScript types, update web landing page, skip v1-legacy (will be deprecated).

**Timeline**: 4-6 hours total implementation
**Risk Level**: LOW (incremental, reversible changes)
**Value**: EXTREMELY HIGH (eliminates type translation bugs, reduces maintenance)

---

## **🏗️ FINAL ARCHITECTURE**

```
TKA/
├── packages/
│   └── domain/                           # NEW: Shared domain models
│       ├── package.json                  # @tka/domain package
│       ├── tsconfig.json                 # TypeScript config
│       ├── src/ phone
│       │   ├── models/
│       │   │   ├── core.ts              # Enums: MotionType, Location, Orientation
│       │   │   ├── pictograph.ts        # PictographData, ArrowData, PropData
│       │   │   ├── sequence.ts          # BeatData, SequenceData
│       │   │   ├── positioning.ts       # GridPosition, TKAPosition
│       │   │   └── index.ts             # Barrel exports
│       │   ├── utils/
│       │   │   ├── letter.ts            # Letter utilities
│       │   │   ├── validation.ts        # Domain validation
│       │   │   └── index.ts             # Barrel exports
│       │   └── index.ts                 # Main barrel export
│       └── README.md                    # Package documentation
├── src/
│   ├── desktop/modern/src/              # REFERENCE: Source of truth
│   │   └── domain/models/               # Convert these to TypeScript
│   └── web/
│       ├── landing/                     # UPDATE: Replace types, update imports
│       │   └── src/lib/constructor/types/  # REPLACE with @tka/domain imports
│       └── v1-legacy/                   # SKIP: Will be deprecated
└── package.json                        # UPDATE: Add workspace config
```

---

### **PHASE 2: UPDATE WEB LANDING PAGE (1-2 hours)**

#### **2.1 Update Landing Page Package.json**

**Add to `src/web/landing/package.json`:**

```json
{
  "dependencies": {
    "@tka/domain": "workspace:*"
  }
}
```

**Install dependencies:**

```bash
cd src/web/landing
npm install
```

#### **2.2 Replace Type Files (Incremental - 10 files max per commit)**

**FILES TO REPLACE (in order of priority):**

1. **Core Types (Commit 1):**

   - `src/web/landing/src/lib/constructor/types/MotionData.ts` → DELETE
   - `src/web/landing/src/lib/constructor/types/Letter.ts` → DELETE
   - `src/web/landing/src/lib/constructor/types/Constants.ts` → UPDATE imports

2. **Pictograph Types (Commit 2):**

   - `src/web/landing/src/lib/constructor/types/PictographData.ts` → DELETE
   - `src/web/landing/src/lib/constructor/types/TKAPosition.ts` → DELETE

3. **Sequence Types (Commit 3):**
   - `src/web/landing/src/lib/constructor/types/Beat.ts` → DELETE
   - Update any files importing these types

#### **2.3 Update Import Statements**

**SEARCH AND REPLACE PATTERNS:**

```bash
# Find all files importing old types
grep -r "from.*types/MotionData" src/web/landing/src/
grep -r "from.*types/PictographData" src/web/landing/src/
grep -r "from.*types/Letter" src/web/landing/src/

# Replace with new imports
# OLD: import { MotionData } from '$lib/constructor/types/MotionData.js';
# NEW: import { MotionData } from '@tka/domain';
```

**KEY FILES TO UPDATE:**

1. **Stores:**

   - `src/web/landing/src/lib/constructor/stores/pictograph/pictographStore.ts`
   - `src/web/landing/src/lib/constructor/stores/sequence/selectionStore.ts`

2. **Services:**

   - `src/web/landing/src/lib/constructor/services/StartPositionService.ts`
   - `src/web/landing/src/lib/constructor/services/SequenceDataService.ts`

3. **Components:**
   - `src/web/landing/src/lib/constructor/components/Pictograph/Pictograph.svelte`
   - `src/web/landing/src/lib/constructor/components/ConstructTab/StartPosPicker/StartPosPicker.svelte`

#### **2.4 Update TypeScript Config**

**Update `src/web/landing/tsconfig.json`:**

```json
{
  "compilerOptions": {
    "paths": {
      "@tka/domain": ["../../../packages/domain/src/index.ts"],
      "@tka/domain/*": ["../../../packages/domain/src/*"]
    }
  }
}
```

#### **2.5 Validation After Each Commit**

```bash
cd src/web/landing
npm run type-check  # Must pass
npm run build       # Must succeed
npm run dev         # Must start without errors

# Test the StartPosPicker still works
# Navigate to /constructor and verify start position selection
```

---

### **PHASE 3: UPDATE DESKTOP REFERENCES (30 minutes)**

#### **3.1 Create TypeScript Stubs for Python (Optional)**

**Create `packages/domain/python-stubs/`:**

```python
# Auto-generated from TypeScript definitions
from enum import Enum
from typing import Dict, Any, Optional
from dataclasses import dataclass

class MotionType(Enum):
    STATIC = "static"
    PRO = "pro"
    ANTI = "anti"
    # ... etc

@dataclass(frozen=True)
class MotionData:
    id: str
    motion_type: MotionType
    # ... etc
```

#### **3.2 Update Desktop Imports (Optional)**

**IF NEEDED:** Update desktop imports to reference shared types, but this is optional since desktop Python types are already well-established.

## **🔍 TROUBLESHOOTING GUIDE**

### **Common Issues & Solutions**

#### **Issue: TypeScript Compilation Errors**

**Location**: `packages/domain/`
**Solution**: Check enum values match exactly between Python and TypeScript
**Reference**: `src/desktop/modern/src/domain/models/core_models.py` lines 15-45

#### **Issue: Import Resolution Failures**

**Location**: `src/web/landing/`
**Solution**: Check tsconfig.json paths configuration
**Reference**: SvelteKit documentation on path aliases

#### **Issue: Runtime Errors in StartPosPicker**

**Location**: `src/web/landing/src/lib/constructor/components/ConstructTab/StartPosPicker/`
**Solution**: Verify PictographData interface matches expected structure
**Reference**: Current working v1-legacy implementation

#### **Issue: CSV Data Loading Failures**

**Location**: `src/web/landing/src/routes/+layout.server.ts`
**Solution**: Check CSV parsing logic matches new type definitions
**Reference**: `src/web/v1-legacy/src/lib/stores/pictograph/pictographStore.ts` lines 50-100

### **Key Reference Files**

1. **Domain Model Source of Truth:**

   - `src/desktop/modern/src/domain/models/core_models.py`
   - `src/desktop/modern/src/domain/models/pictograph_models.py`

2. **Current Working Web Implementation:**

   - `src/web/v1-legacy/src/lib/components/ConstructTab/StartPosPicker/StartPosPicker.svelte`
   - `src/web/v1-legacy/src/lib/stores/pictograph/pictographStore.ts`

3. **Type Mapping Reference:**
   - `src/web/landing/src/lib/constructor/types/MotionData.ts`
   - `src/web/landing/src/lib/constructor/types/PictographData.ts`

---

## **✅ SUCCESS CRITERIA**

### **Phase 1 Complete When:**

- [ ] `packages/domain/` builds without errors
- [ ] All TypeScript types compile
- [ ] Package can be imported by test applications
- [ ] Enum values match Python source exactly

### **Phase 2 Complete When:**

- [ ] Web landing page builds without errors
- [ ] StartPosPicker component works correctly
- [ ] CSV data loading functions properly
- [ ] No runtime errors in browser console

### **Phase 3 Complete When:**

- [ ] Desktop application still functions normally
- [ ] All tests pass
- [ ] No import errors in Python code

### **Overall Success When:**

- [ ] Single source of truth for domain types established
- [ ] Type consistency across web and desktop
- [ ] No functionality regressions
- [ ] Reduced maintenance burden achieved

---

## **🚀 EXECUTION CHECKLIST**

### **Pre-Implementation:**

- [ ] Create feature branch: `git checkout -b feature/shared-domain-models`
- [ ] Backup current state: `git commit -m "Backup before domain consolidation"`
- [ ] Review all reference files listed above

### **Phase 1 Execution:**

- [ ] Create packages/domain/ structure
- [ ] Convert Python models to TypeScript
- [ ] Set up build system
- [ ] Create validation tests
- [ ] Verify package builds successfully

### **Phase 2 Execution:**

- [ ] Update landing page package.json
- [ ] Replace type files incrementally (max 10 files per commit)
- [ ] Update import statements
- [ ] Test after each commit
- [ ] Verify StartPosPicker functionality

### **Phase 3 Execution:**

- [ ] Create Python stubs if needed
- [ ] Update desktop references if required
- [ ] Run full test suite

### **Post-Implementation:**

- [ ] Update documentation
- [ ] Create migration guide for future developers
- [ ] Clean up old type files
- [ ] Merge feature branch

---

## **📚 ADDITIONAL RESOURCES**

### **Documentation to Reference:**

- TKA AI Assistance docs: `docs/ai-assistance/`
- Desktop domain models: `src/desktop/modern/src/domain/models/`
- Web type definitions: `src/web/landing/src/lib/constructor/types/`
- Working v1-legacy implementation: `src/web/v1-legacy/src/lib/`

### **Tools Needed:**

- TypeScript compiler
- Node.js/npm
- Git for version control
- Text editor with TypeScript support

### **Validation Commands:**

```bash
# Build shared domain
cd packages/domain && npm run build

# Test web landing
cd src/web/landing && npm run type-check && npm run build

# Test desktop (if updated)
cd src/desktop && python -m pytest tests/
```

---

**This document provides complete implementation guidance for consolidating TKA domain models. Follow phases sequentially, validate after each step, and refer to specified files for implementation details.**

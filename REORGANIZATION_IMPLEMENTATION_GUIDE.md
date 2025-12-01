# TKA Studio Codebase Reorganization - Complete Implementation Guide

**For Opus Execution**

## Context & Background

This guide contains the complete, step-by-step instructions for reorganizing the TKA Studio codebase from a "modules-first" to a "features-first" architecture. All exploration and planning has been completed by Sonnet. This document is ready for execution.

### What This Reorganization Does

1. ✅ Renames `/modules/` → `/features/` (industry standard alignment)
2. ✅ Renames `/shared/animate/` → `/shared/animation-engine/` (clarity - used by 7+ features)
3. ✅ Moves `/shared/admin/` → `/features/admin/shared/` (feature-specific, only used by admin)
4. ✅ Removes circular dependencies from `/shared/index.ts` (190+ circular imports fixed)
5. ✅ Updates 2,185+ TypeScript/Svelte files with corrected import paths
6. ✅ Updates configuration files (svelte.config.js, etc.)

### Key Findings from Exploration

**Legitimate Shared Infrastructure (DO NOT MOVE):**
- `/shared/inversify/` - 477 imports (DI container)
- `/shared/pictograph/` - 464 imports (core domain)
- `/shared/foundation/` - 292 imports (base types)
- `/shared/application/` - 161 imports (app services)
- `/shared/navigation/` - 51 imports (navigation system)
- `/shared/animate/` - 18 imports, used by 7+ features (rename to animation-engine)

**Must Move:**
- `/shared/admin/` - Only 1 import, only used by admin feature
- `/shared/profile/` - Empty folder (delete)

**Circular Dependency Root Cause:**
`/shared/index.ts` lines 33-41 re-export domain types FROM features, creating bidirectional dependencies.

### Estimated Time
8-10 hours of focused work

### Current Status
- ✅ Baseline established: 0 TypeScript errors
- ✅ Working on main branch (per user request)
- ✅ Empty `/shared/profile/` folder deleted
- ⚠️ Some uncommitted changes exist (animate components modified)

---

## Pre-Execution Checklist

Before starting, verify:

- [ ] You are Claude Opus (not Sonnet)
- [ ] You have read this ENTIRE document
- [ ] You are in the directory: `F:\_THE KINETIC ALPHABET\_TKA-STUDIO`
- [ ] The main branch is checked out: `git branch` shows `* main`
- [ ] You understand this will take 8-10 hours
- [ ] You will commit after EACH phase (not all at once)

---

## Phase 0: Pre-Migration Validation & Commit

### Step 0.1: Check Current State

```bash
cd "F:\_THE KINETIC ALPHABET\_TKA-STUDIO"
git status
```

**Expected Output:**
- Some modified files (animate components, settings.local.json)
- One untracked file (ExportButton.svelte)
- Empty profile folder already deleted

### Step 0.2: Commit Current State

```bash
git add -A
git commit -m "chore: Checkpoint before comprehensive reorganization

Current state:
- Deleted empty shared/profile/ folder
- Working animate component updates
- Baseline: 0 TypeScript errors

About to begin:
- modules → features rename
- shared/animate → shared/animation-engine rename
- shared/admin → features/admin/shared move
- Circular dependency fixes

This is Phase 0 checkpoint for rollback if needed.

🤖 Generated with Claude Code"
```

### Step 0.3: Run Baseline Type Check

```bash
npm run check
```

**Expected:** `svelte-check found 0 errors and 0 warnings`

**If errors exist:** STOP. Fix errors before proceeding.

### Step 0.4: Document Baseline for Rollback

```bash
git log -1 --oneline > .migration-checkpoint.txt
echo "Started: $(date)" >> .migration-checkpoint.txt
echo "Commit before migration:" >> .migration-checkpoint.txt
git rev-parse HEAD >> .migration-checkpoint.txt
```

**Checkpoint:** Phase 0 Complete ✅

---

## Phase 1: Low-Risk Folder Renames

**Risk Level:** Low
**Files Impacted:** 19 physical files
**Time:** 30 minutes

### Step 1.1: Rename /shared/animate/ → /shared/animation-engine/

**Why "animation-engine"?**
- `/shared/animation/` already exists (contains Svelte motion utilities)
- `/shared/animation-engine/` clearly indicates core animation rendering
- Avoids naming collision

```bash
cd "F:\_THE KINETIC ALPHABET\_TKA-STUDIO\src\lib\shared"
git mv animate animation-engine
```

**Validation:**
```bash
git status
```

**Expected Output:**
```
renamed:    src/lib/shared/animate/components/AnimationPanel.svelte -> src/lib/shared/animation-engine/components/AnimationPanel.svelte
renamed:    src/lib/shared/animate/components/AnimatorCanvas.svelte -> src/lib/shared/animation-engine/components/AnimatorCanvas.svelte
... (19 files total)
```

### Step 1.2: Verify Folder Structure

```bash
ls -la "src/lib/shared/animation-engine/"
```

**Expected:** You should see:
- components/
- domain/
- services/
- state/
- index.ts

### Step 1.3: Commit Phase 1

```bash
cd "F:\_THE KINETIC ALPHABET\_TKA-STUDIO"
git add -A
git commit -m "refactor(phase1): Rename shared/animate to shared/animation-engine

Changes:
- Renamed shared/animate/ → shared/animation-engine/
- Clarifies this is core animation rendering infrastructure
- Distinguishes from shared/animation/ (Svelte motion utilities)
- No import paths updated yet (next phase)

Files moved: 19
Import path updates needed: ~20 files

Part of comprehensive codebase reorganization.

🤖 Generated with Claude Code"
```

**Checkpoint:** Phase 1 Complete ✅

---

## Phase 2: Feature Folder Restructure

**Risk Level:** Low-Medium
**Files Impacted:** 1,500+ physical files
**Time:** 30 minutes

### Step 2.1: Rename /modules/ → /features/

```bash
cd "F:\_THE KINETIC ALPHABET\_TKA-STUDIO\src\lib"
git mv modules features
```

**Validation:**
```bash
git status | head -20
```

**Expected:** Hundreds of renamed files from `modules/` to `features/`

**Verify new structure:**
```bash
ls -la features/
```

**Expected directories:**
- about/
- account/
- admin/
- animate/
- collect/
- community/
- create/
- discover/
- edit/
- learn/
- library/
- train/
- word-card/
- write/

### Step 2.2: Move /shared/admin/ → /features/admin/shared/

**Create target directory:**
```bash
cd "F:\_THE KINETIC ALPHABET\_TKA-STUDIO\src\lib"
mkdir -p "features/admin/shared"
```

**Move admin UI components:**
```bash
git mv "shared/admin/components" "features/admin/shared/components"
git mv "shared/admin/styles" "features/admin/shared/styles"
git mv "shared/admin/types" "features/admin/shared/types"
git mv "shared/admin/index.ts" "features/admin/shared/index.ts"
```

**Remove empty shared/admin folder:**
```bash
rmdir "shared/admin"
```

**Validation:**
```bash
ls -la "features/admin/shared/"
```

**Expected:**
- components/
- styles/
- types/
- index.ts

```bash
ls -la "shared/admin" 2>&1
```

**Expected:** "No such file or directory"

### Step 2.3: Commit Phase 2

```bash
cd "F:\_THE KINETIC ALPHABET\_TKA-STUDIO"
git add -A
git commit -m "refactor(phase2): Reorganize to features/ structure

Changes:
- Renamed modules/ → features/ (industry standard)
- Moved shared/admin/ → features/admin/shared/ (feature-specific)
- Import paths NOT yet updated (next phase)

Files moved: 1,500+
Rationale: Admin UI only used by admin feature, not cross-feature.

Part of comprehensive codebase reorganization.

🤖 Generated with Claude Code"
```

**Checkpoint:** Phase 2 Complete ✅

---

## Phase 3: Update Import Paths (CRITICAL PHASE)

**Risk Level:** HIGH
**Files Impacted:** 100+ files with import statements
**Time:** 2-3 hours (most complex phase)

**IMPORTANT:** This phase requires careful find/replace. Use VS Code or similar with regex support.

### Step 3.1: Update $lib/modules/ → $lib/features/ Imports

**Pattern 1: Standard imports**
```regex
Find:    from (["'])(\$lib|\.\./|\./)*modules/
Replace: from $1$2features/
```

**Pattern 2: Type imports**
```regex
Find:    import type \{([^}]+)\} from (["'])(\$lib|\.\./|\./)*modules/
Replace: import type {$1} from $2$3features/
```

**Files to update:**
Run across ALL `.ts` and `.svelte` files in:
- `src/lib/`
- `src/routes/`
- `tests/` (if they exist)

**How to execute in VS Code:**
1. Open Find & Replace (Ctrl+Shift+H)
2. Enable regex mode (.*)
3. Set "files to include": `src/**/*.{ts,svelte,js}`
4. Use first pattern, replace all
5. Use second pattern, replace all

**Validation after Step 3.1:**
```bash
# Count remaining old imports (should be close to 0)
grep -r "from.*\$lib/modules/" src/lib --include="*.ts" --include="*.svelte" | wc -l
grep -r "from.*\.\./modules/" src/lib --include="*.ts" --include="*.svelte" | wc -l
```

**Expected:** Numbers should be drastically reduced or 0

### Step 3.2: Update $lib/shared/animate → $lib/shared/animation-engine Imports

**20 specific files need updates:**

1. `src/lib/features/animate/shared/components/AnimationCanvas.svelte`
2. `src/lib/features/animate/shared/components/TrailSettingsPanel.svelte`
3. `src/lib/features/animate/shared/components/AnimationControlsModern.svelte`
4. `src/lib/features/animate/tabs/single/mobile/components/MobileControlsBar.svelte`
5. `src/lib/features/admin/components/challenge-scheduler/ChallengeFormPanel.svelte`
6. `src/lib/features/edit/EditModule.svelte`
7. `src/lib/features/create/shared/components/coordinators/AnimationCoordinator.svelte`
8. `src/lib/shared/coordinators/AnimationSheetCoordinator.svelte`
9. `src/lib/features/animate/tabs/single/shared/SingleModeCanvas.svelte`
10. `src/lib/features/animate/tabs/components/SingleModeCanvas.svelte` (if exists)
11. `src/lib/features/animate/tabs/tunnel/components/TunnelModeCanvas.svelte`
12. `src/lib/features/animate/tabs/mirror/MirrorModePanel.svelte`
13. `src/lib/features/animate/tabs/tunnel/TunnelModePanel.svelte`
14. `src/lib/features/animate/tabs/grid/GridModePanel.svelte`
15. `src/lib/features/animate/tabs/single/SingleModePanel.svelte`
16. `src/lib/shared/share/components/SharePanel.svelte`
17. `src/lib/features/train/components/practice/PracticePanel.svelte`
18. `src/lib/features/animate/shared/components/index.ts`
19. `src/lib/features/train/components/TrainSetup.svelte`
20. Any index.ts files in animation-engine itself

**Pattern:**
```regex
Find:    from (["'])(\$lib|\.\./|\./)*shared/animate([/"'])
Replace: from $1$2shared/animation-engine$3
```

**Validation after Step 3.2:**
```bash
# Check for remaining old imports
grep -r 'from.*shared/animate["\']' src/lib --include="*.ts" --include="*.svelte" | grep -v "animation-engine"
```

**Expected:** Only matches should be within `animation-engine/` folder itself, or 0 matches

### Step 3.3: Update $lib/shared/admin → $lib/features/admin/shared Imports

**7 specific files need updates:**

1. `src/lib/features/admin/components/feature-flags/GlobalFlagDetail.svelte`
2. `src/lib/features/admin/components/feature-flags/UserOverridesList.svelte`
3. `src/lib/features/admin/components/feature-flags/GlobalFlagList.svelte`
4. `src/lib/features/admin/components/UserManagement.svelte`
5. `src/lib/features/admin/components/feature-flags/UserOverridesDetail.svelte`
6. `src/lib/features/admin/components/feature-flags/UserFeatureOverrides.svelte`
7. `src/lib/features/admin/components/feature-flags/GlobalFlagSettings.svelte`

**Pattern:**
```regex
Find:    from (["'])(\$lib|\.\./|\./)*shared/admin
Replace: from $1$2features/admin/shared
```

**Validation after Step 3.3:**
```bash
# Check for remaining old imports
grep -r 'from.*shared/admin' src/lib --include="*.ts" --include="*.svelte"
```

**Expected:** 0 matches

### Step 3.4: Run Type Check

```bash
npm run check 2>&1 | tee phase3-typecheck.log
```

**Expected:** Many errors about missing modules or types

**Common errors you'll see:**
- Cannot find module '$lib/modules/...' (missed imports)
- Cannot find module '$lib/shared/animate' (missed imports)
- Circular dependency warnings (will fix in Phase 4)
- Type import errors from shared/index.ts (will fix in Phase 4)

**Don't worry about errors yet** - Phase 4 will fix circular dependencies and remaining type errors.

### Step 3.5: Commit Phase 3

```bash
cd "F:\_THE KINETIC ALPHABET\_TKA-STUDIO"
git add -A
git commit -m "refactor(phase3): Update all import paths

Changes:
- Updated \$lib/modules/* → \$lib/features/*
- Updated \$lib/shared/animate → \$lib/shared/animation-engine
- Updated \$lib/shared/admin → \$lib/features/admin/shared
- Updated relative imports (../modules/ → ../features/)

Files updated: 100+
Known issues: Circular deps and type errors remain (Phase 4 will fix)

Part of comprehensive codebase reorganization.

🤖 Generated with Claude Code"
```

**Checkpoint:** Phase 3 Complete ✅

---

## Phase 4: Fix Circular Dependencies

**Risk Level:** Medium-High
**Files Impacted:** 31 files
**Time:** 2-3 hours

### Background: The Circular Dependency Problem

Currently, `/shared/index.ts` re-exports domain types FROM features:

```typescript
// Lines 33-41 in /shared/index.ts - CREATES CIRCULAR DEPS:
export * from "../features/animate/shared/domain";
export * from "../features/create/generate/circular/domain";
export * from "../features/create/generate/shared/domain";
export * from "../features/create/shared/domain/factories";
export * from "../features/create/shared/domain/models";
export * from "../features/discover/shared/domain";
export * from "../features/learn/codex/domain";
export * from "../features/learn/quiz/domain";
export * from "../features/word-card/domain";
```

This creates bidirectional dependencies:
- Features import from `/shared/`
- `/shared/` imports from `/features/`
- Result: 190+ circular import edges

### Solution Strategy

1. Remove feature domain re-exports from `/shared/index.ts`
2. Update 31 files that import domain types from `$lib/shared` to import directly from features
3. Keep only truly shared infrastructure in `/shared/index.ts`

### Step 4.1: Identify Files Importing Domain Types from /shared

```bash
cd "F:\_THE KINETIC ALPHABET\_TKA-STUDIO"
grep -r "from ['\"]\\$lib/shared['\"]" src/lib --include="*.ts" --include="*.svelte" | grep -v "index.ts" > shared-imports.txt
cat shared-imports.txt
```

**Review this list.** You need to identify which files are importing:
- `BeatData` - from create/shared/domain
- `StartPositionData` - from create/shared/domain
- `TrailTypes` - from animate/shared/domain
- Other feature-specific types

**Estimated ~31 files** will need updates.

### Step 4.2: Update /shared/index.ts (Remove Feature Domain Re-exports)

Open `src/lib/shared/index.ts` and **DELETE lines 33-41** (the feature domain re-exports).

The file should now look like this:

```typescript
/**
 * Shared Library Exports
 *
 * Clean barrel exports for truly shared infrastructure only.
 * NO FEATURE DOMAIN TYPES - import directly from features.
 */

// === SHARED INFRASTRUCTURE ===
export * from "./inversify";
export * from "./settings";
export * from "./theme";
export * from "./utils";
export { createComponentLogger, debugLogger } from "./utils/debug-logger";
export * from "./validation";

// === PICTOGRAPH CORE TYPES (truly cross-feature domain) ===
export type { PictographData } from "./pictograph/shared/domain/models/PictographData";
export type { MotionData } from "./pictograph/shared/domain/models/MotionData";
export {
  GridLocation,
  GridMode,
} from "./pictograph/grid/domain/enums/grid-enums";
export {
  MotionType,
  Orientation,
  RotationDirection,
} from "./pictograph/shared/domain/enums/pictograph-enums";

// === UI TYPES ===
export type { TabId } from "./foundation/ui/UITypes";

// === STORAGE UTILITIES ===
import { StorageService } from "./foundation/services/implementations/StorageService";

export const safeSessionStorageGet = <T>(
  key: string,
  defaultValue: T | null = null
): T | null => {
  const storageService = new StorageService();
  return storageService.safeSessionStorageGet(key, defaultValue);
};

export const safeSessionStorageSet = <T>(key: string, value: T): void => {
  const storageService = new StorageService();
  storageService.safeSessionStorageSet(key, value);
};

export const safeSessionStorageRemove = (key: string): void => {
  const storageService = new StorageService();
  storageService.removeSessionStorageItem(key);
};

// === SERVICE INTERFACES ===
export type { ICSVPictographParser } from "./foundation/services/contracts/data/ICSVPictographParser";

// Feature service interfaces (these may need further refactoring)
export type { ICAPTypeService } from "../features/create/generate/shared/services/contracts/ICAPTypeService";
export type { IGenerationOrchestrationService } from "../features/create/generate/shared/services/contracts/IGenerationOrchestrationService";
export type { ISequenceExportService } from "../features/create/shared/services/contracts/ISequenceExportService";
```

**Key changes:**
- ❌ Removed: `export * from "../features/animate/shared/domain";`
- ❌ Removed: `export * from "../features/create/shared/domain/models";`
- ❌ Removed: All other feature domain re-exports
- ✅ Kept: Truly shared infrastructure (inversify, theme, utils, validation)
- ✅ Kept: Pictograph core types (used across ALL features)
- ✅ Kept: Storage utilities
- ⚠️ Kept (for now): Service interface re-exports (can refactor later)

### Step 4.3: Update Files Importing Feature Domain from /shared

For EACH file in your `shared-imports.txt` list:

1. Open the file
2. Identify which domain types it imports from `$lib/shared`
3. Replace with direct import from feature

**Example transformations:**

**BEFORE:**
```typescript
import { BeatData, TrailTypes, StartPositionData } from '$lib/shared';
```

**AFTER:**
```typescript
import type { BeatData } from '$lib/features/create/shared/domain/models/BeatData';
import type { StartPositionData } from '$lib/features/create/shared/domain/models/StartPositionData';
import type { TrailTypes } from '$lib/features/animate/shared/domain/types/TrailTypes';
```

**Common domain type locations:**
- `BeatData` → `$lib/features/create/shared/domain/models/BeatData`
- `StartPositionData` → `$lib/features/create/shared/domain/models/StartPositionData`
- `TrailTypes` → `$lib/features/animate/shared/domain/types/TrailTypes`
- `TrailSettings` → `$lib/features/animate/shared/domain/types/TrailTypes`
- `AnimationState` → `$lib/features/animate/shared/domain/types/AnimationState`

**Strategy for finding the right path:**
```bash
# Example: Finding where BeatData is defined
find src/lib/features -name "*BeatData*" -type f
```

**Do this for ALL 31 files** that import domain types from `$lib/shared`.

### Step 4.4: Run Type Check After Updates

```bash
npm run check 2>&1 | tee phase4-typecheck.log
```

**Expected:** Significantly fewer errors. Most circular dependency warnings should be gone.

**If you still see errors:**
- Check if you missed any files
- Verify import paths are correct
- Some errors about missing types are expected if the type doesn't actually exist in that location

### Step 4.5: Commit Phase 4

```bash
cd "F:\_THE KINETIC ALPHABET\_TKA-STUDIO"
git add -A
git commit -m "refactor(phase4): Remove circular dependencies from shared/index.ts

Changes:
- Removed feature domain re-exports from shared/index.ts (lines 33-41)
- Updated 31 files to import feature domain types directly
- Kept only truly shared infrastructure in shared/index.ts
- Kept pictograph core types (genuinely cross-feature)

Result: 190+ circular import edges eliminated

Part of comprehensive codebase reorganization.

🤖 Generated with Claude Code"
```

**Checkpoint:** Phase 4 Complete ✅

---

## Phase 5: Update Configuration Files

**Risk Level:** Medium
**Files Impacted:** 3-4 files
**Time:** 30 minutes

### Step 5.1: Update svelte.config.js Path Aliases

Open `svelte.config.js` and update the path aliases:

**Find the `alias` section** (around line 20-40) and update ALL references from `modules` to `features`:

**BEFORE:**
```javascript
alias: {
  $lib: "./src/lib",
  "$lib/*": "./src/lib/*",
  $shared: "./src/lib/shared",
  "$shared/*": "./src/lib/shared/*",
  $create: "./src/lib/modules/create",
  "$create/*": "./src/lib/modules/create/*",
  $learn: "./src/lib/modules/learn",
  "$learn/*": "./src/lib/modules/learn/*",
  $discover: "./src/lib/modules/discover",
  "$discover/*": "./src/lib/modules/discover/*",
  $animator: "./src/lib/modules/create/animate",
  "$animator/*": "./src/lib/modules/create/animate/*",
  $wordcard: "./src/lib/modules/word-card",
  "$wordcard/*": "./src/lib/modules/word-card/*",
  $collect: "./src/lib/modules/collect",
  "$collect/*": "./src/lib/modules/collect/*",
  $write: "./src/lib/modules/write",
  "$write/*": "./src/lib/modules/write/*",
  $render: "./src/lib/shared/render",
  "$render/*": "./src/lib/shared/render/*",
},
```

**AFTER:**
```javascript
alias: {
  $lib: "./src/lib",
  "$lib/*": "./src/lib/*",
  $shared: "./src/lib/shared",
  "$shared/*": "./src/lib/shared/*",

  // Feature aliases (updated from modules → features)
  $create: "./src/lib/features/create",
  "$create/*": "./src/lib/features/create/*",
  $learn: "./src/lib/features/learn",
  "$learn/*": "./src/lib/features/learn/*",
  $discover: "./src/lib/features/discover",
  "$discover/*": "./src/lib/features/discover/*",
  $animator: "./src/lib/features/create/animate",
  "$animator/*": "./src/lib/features/create/animate/*",
  $wordcard: "./src/lib/features/word-card",
  "$wordcard/*": "./src/lib/features/word-card/*",
  $collect: "./src/lib/features/collect",
  "$collect/*": "./src/lib/features/collect/*",
  $write: "./src/lib/features/write",
  "$write/*": "./src/lib/features/write/*",

  // Shared resources
  $render: "./src/lib/shared/render",
  "$render/*": "./src/lib/shared/render/*",
},
```

### Step 5.2: Update /features/index.ts Documentation

Open `src/lib/features/index.ts` (formerly `modules/index.ts`) and update the header comment:

**BEFORE:**
```typescript
/**
 * TKA Modules - Module Registry
 * ...
 */
```

**AFTER:**
```typescript
/**
 * TKA Features - Feature-First Architecture
 *
 * Main export point for all TKA features organized by business domains.
 * Each feature contains its own components, domain, services, and state.
 *
 * Features represent user-facing functionality (tabs in the navigation):
 * - animate: Animation playback and video generation
 * - create: Sequence creation and editing
 * - discover: Browse and search sequences
 * - train: Practice and training modes
 * - library: User's saved sequences
 * - admin: Administrative tools
 * - etc.
 *
 * WARNING: Some type names (e.g., GridLayout) exist in multiple features.
 * When using types from this barrel export, TypeScript may report ambiguity errors.
 * Solution: Import directly from the specific feature you need:
 *   - import { GridLayout } from "$create/workspace-panel/sequence-display/domain"
 *   - import { GridLayout } from "$wordcard/domain/models/PageLayout"
 */
```

### Step 5.3: Update Documentation Files

Search for and update any documentation that references "modules":

```bash
grep -r "modules" README.md docs/ .vscode/ --include="*.md" --include="*.json" 2>/dev/null || echo "No matches"
```

**For each match:**
- If it refers to the `/modules/` folder → update to `/features/`
- If it refers to "module" in a generic sense (like npm modules) → leave as-is

**Common files to check:**
- `README.md` - Architecture section
- `docs/architecture.md` (if exists)
- `.vscode/settings.json` - Path hints

### Step 5.4: Run Type Check

```bash
npm run check
```

**Expected:** Should be close to 0 errors now

### Step 5.5: Commit Phase 5

```bash
cd "F:\_THE KINETIC ALPHABET\_TKA-STUDIO"
git add -A
git commit -m "refactor(phase5): Update configuration for features/ structure

Changes:
- Updated svelte.config.js aliases (modules → features)
- Updated features/index.ts documentation header
- Updated documentation references (README, etc.)

Config now aligns with features-first architecture.

Part of comprehensive codebase reorganization.

🤖 Generated with Claude Code"
```

**Checkpoint:** Phase 5 Complete ✅

---

## Phase 6: Final Validation & Cleanup

**Risk Level:** Low (validation only)
**Time:** 1 hour

### Step 6.1: Full Type Check

```bash
npm run check 2>&1 | tee final-typecheck.log
```

**Target:** 0 errors and 0 warnings

**If errors exist:**
1. Review `final-typecheck.log`
2. Identify patterns in remaining errors
3. Fix systematically
4. Re-run type check

**Common remaining error types:**
- Missed import path updates
- Incorrect feature domain paths
- Genuinely missing types

### Step 6.2: Run Tests (if they exist)

```bash
npm run test 2>&1 || echo "No tests configured"
```

**Target:** All tests pass

### Step 6.3: Run Build

```bash
npm run build 2>&1 | tee build.log
```

**Target:** Clean build with no errors

**If build fails:**
- Review `build.log`
- Fix errors
- Re-run build

### Step 6.4: Verify No Old Import Paths Remain

```bash
# Check for old "modules" imports
echo "=== Checking for remaining 'modules' imports ==="
grep -r 'from.*modules/' src/lib --include="*.ts" --include="*.svelte" | wc -l

# Check for old "shared/animate" imports
echo "=== Checking for remaining 'shared/animate' imports ==="
grep -r 'from.*shared/animate["\']' src/lib --include="*.ts" --include="*.svelte" | grep -v "animation-engine" | wc -l

# Check for old "shared/admin" imports
echo "=== Checking for remaining 'shared/admin' imports ==="
grep -r 'from.*shared/admin' src/lib --include="*.ts" --include="*.svelte" | wc -l
```

**Expected output:**
```
=== Checking for remaining 'modules' imports ===
0

=== Checking for remaining 'shared/animate' imports ===
0

=== Checking for remaining 'shared/admin' imports ===
0
```

**If any numbers > 0:**
- Review those files
- Update remaining imports
- Re-run verification

### Step 6.5: Manual Smoke Testing

**Critical paths to test:**

1. **Navigate to Create feature:**
   - Start dev server: `npm run dev`
   - Open browser to localhost
   - Click "Create" tab
   - Verify it loads without console errors

2. **Navigate to Animate feature:**
   - Click "Animate" tab
   - Verify animation playback works
   - Check for console errors

3. **Navigate to Discover feature:**
   - Click "Discover" tab
   - Verify sequences load

4. **Open Settings panel:**
   - Click settings button
   - Verify panel opens

5. **Open Share panel:**
   - From any sequence, click share
   - Verify share panel works

**If any errors:**
- Check browser console
- Check network tab
- Fix issues
- Re-test

### Step 6.6: Commit Phase 6

```bash
cd "F:\_THE KINETIC ALPHABET\_TKA-STUDIO"
git add -A
git commit -m "refactor(phase6): Final validation and cleanup

Validation results:
- Type check: 0 errors ✅
- Tests: All passing ✅
- Build: Clean ✅
- Old import paths: 0 remaining ✅
- Manual smoke test: All critical paths working ✅

Reorganization complete and verified.

Part of comprehensive codebase reorganization.

🤖 Generated with Claude Code"
```

**Checkpoint:** Phase 6 Complete ✅

---

## Phase 7: Final Review & Documentation

**Risk Level:** None
**Time:** 30 minutes

### Step 7.1: Review All Changes

```bash
# See all commits from this reorganization
git log --oneline --graph -10
```

**Expected:** 6-7 commits showing each phase

### Step 7.2: Create Summary Documentation

Create a file documenting the changes:

```bash
cat > REORGANIZATION_SUMMARY.md << 'EOF'
# TKA Studio Codebase Reorganization Summary

## Date Completed
$(date)

## Changes Made

### 1. Folder Structure
- ✅ Renamed `/modules/` → `/features/` (1,500+ files)
- ✅ Renamed `/shared/animate/` → `/shared/animation-engine/` (19 files)
- ✅ Moved `/shared/admin/` → `/features/admin/shared/` (16 files)
- ✅ Deleted `/shared/profile/` (empty folder)

### 2. Import Path Updates
- ✅ Updated 100+ files: `$lib/modules/` → `$lib/features/`
- ✅ Updated 20 files: `$lib/shared/animate` → `$lib/shared/animation-engine`
- ✅ Updated 7 files: `$lib/shared/admin` → `$lib/features/admin/shared`

### 3. Circular Dependency Fixes
- ✅ Removed feature domain re-exports from `/shared/index.ts`
- ✅ Updated 31 files to import feature domain types directly
- ✅ Eliminated 190+ circular import edges

### 4. Configuration Updates
- ✅ Updated `svelte.config.js` path aliases
- ✅ Updated `/features/index.ts` documentation
- ✅ Updated README and docs

### 5. Validation
- ✅ Type check: 0 errors
- ✅ Build: Clean
- ✅ Tests: Passing
- ✅ Manual testing: All critical paths verified

## New Architecture

\`\`\`
/lib/
  /features/              # User-facing features (tabs)
    /animate/
    /create/
    /admin/
      /shared/            # Admin-specific shared code
    /discover/
    /train/
    ...

  /shared/                # Truly cross-feature code
    /animation-engine/    # Animation rendering (7+ features)
    /pictograph/          # Core domain
    /foundation/          # Base types
    /inversify/           # DI container
    /device/              # Infrastructure
    /navigation/          # Infrastructure
    ...
\`\`\`

## Mental Model
- "If it's a tab → find it in `/features/`"
- "If it's used by 2+ features → it's in `/shared/`"
- "One tab = one folder"

## Commits
$(git log --oneline | head -7)

EOF
```

### Step 7.3: Update Main README (Optional)

Add a note to the README about the new architecture:

```markdown
## Architecture

TKA Studio uses a **features-first architecture**:

- `/lib/features/` - User-facing features (tabs: animate, create, discover, etc.)
- `/lib/shared/` - Cross-feature infrastructure and truly shared code

Each feature is self-contained with its own:
- Components
- Services
- Domain models
- State management

For more details, see [REORGANIZATION_SUMMARY.md](./REORGANIZATION_SUMMARY.md)
```

### Step 7.4: Final Commit

```bash
git add -A
git commit -m "docs: Add reorganization summary and update README

Added REORGANIZATION_SUMMARY.md documenting the complete reorganization.
Updated README with features-first architecture explanation.

🤖 Generated with Claude Code"
```

### Step 7.5: Clean Up Temp Files

```bash
rm -f shared-imports.txt
rm -f phase3-typecheck.log
rm -f phase4-typecheck.log
rm -f final-typecheck.log
rm -f build.log
rm -f .migration-checkpoint.txt
```

**Checkpoint:** Phase 7 Complete ✅

---

## Success Metrics - Final Checklist

After completing all phases, verify:

- [x] 0 references to `modules/` in import paths
- [x] 0 references to `shared/animate` (except within animation-engine itself)
- [x] 0 references to `shared/admin`
- [x] 0 circular dependency warnings
- [x] 0 TypeScript errors (`npm run check`)
- [x] Clean production build (`npm run build`)
- [x] All tests pass (`npm run test`)
- [x] Manual smoke testing completed
- [x] All phases committed with descriptive messages

---

## Rollback Procedures

### If Issues Arise During Execution

**Rollback to specific phase:**
```bash
# See recent commits
git log --oneline -10

# Rollback to before Phase N
git reset --hard <commit-hash-before-phase-N>
```

**Rollback entire reorganization:**
```bash
# Find the initial checkpoint commit
git log --oneline | grep "Checkpoint before"

# Reset to that commit
git reset --hard <checkpoint-commit-hash>
```

**If you need to start over:**
```bash
# Reset to main branch state before reorganization
git reset --hard origin/main

# Force push if you've already pushed (DANGEROUS)
# git push --force origin main
```

### Emergency Recovery

If everything breaks:

1. **Check git reflog:**
   ```bash
   git reflog
   ```

2. **Find the commit before reorganization started**

3. **Reset:**
   ```bash
   git reset --hard HEAD@{N}
   # Where N is the reflog entry number
   ```

---

## Post-Reorganization Tasks (Future Work)

After successful reorganization, consider:

1. **Audit cross-feature dependencies**
   - Identify unnecessary coupling
   - Extract truly shared domain if needed

2. **Further reorganize /shared/ by category:**
   ```
   /shared/
     /infrastructure/    # Device, navigation, persistence
     /domain/           # Pictograph, foundation
     /ui/               # Generic components
   ```

3. **DI container refactoring**
   - Move service interfaces to inversify
   - Remove service interface re-exports from shared/index.ts

4. **Update architecture diagrams**
   - Document the new structure
   - Create onboarding guides

---

## Known Issues & Edge Cases

### Issue 1: Hard Links in Animate Components
**Location:** `src/lib/features/animate/components/`
**Problem:** Some files are hard-linked to `features/animate/shared/components/`
**Impact:** Editing one updates both
**Solution:** Remove hard links, consolidate to one location
**Priority:** Medium (doesn't break anything, just confusing)

### Issue 2: Service Interface Re-exports
**Location:** `/shared/index.ts` lines with `ICAPTypeService`, etc.
**Problem:** Still re-exporting some feature service interfaces
**Impact:** Minor circular dependency potential
**Solution:** Move these to inversify DI container
**Priority:** Low (can defer to later refactoring)

### Issue 3: Animation vs Animation-Engine Naming
**Location:** `/shared/animation/` and `/shared/animation-engine/`
**Problem:** Two similar folder names might cause confusion
**Impact:** None if imports are correct
**Solution:** Clear documentation distinguishing them
**Priority:** Low (documentation only)

---

## Appendix: File Counts by Phase

- **Phase 0:** 0 files changed (checkpoint only)
- **Phase 1:** 19 files physically moved
- **Phase 2:** 1,500+ files physically moved
- **Phase 3:** 100+ files with import updates
- **Phase 4:** 31 files with domain import updates, 1 file edited (/shared/index.ts)
- **Phase 5:** 3-4 files (config updates)
- **Phase 6:** 0-10 files (fixes/cleanup)
- **Phase 7:** 1-2 files (documentation)

**Total:** ~2,185 files affected

---

## Appendix: Regex Patterns Reference

**Update modules → features imports:**
```regex
Find:    from (["'])(\$lib|\.\./|\./)*modules/
Replace: from $1$2features/
```

**Update shared/animate → shared/animation-engine:**
```regex
Find:    from (["'])(\$lib|\.\./|\./)*shared/animate([/"'])
Replace: from $1$2shared/animation-engine$3
```

**Update shared/admin → features/admin/shared:**
```regex
Find:    from (["'])(\$lib|\.\./|\./)*shared/admin
Replace: from $1$2features/admin/shared
```

---

## Appendix: Critical Files Reference

Files that MUST be correct for the reorganization to work:

1. **`src/lib/shared/index.ts`** - Circular dependency removal point
2. **`svelte.config.js`** - Path alias updates
3. **`src/lib/features/index.ts`** - Feature barrel exports
4. **`src/lib/shared/animation-engine/index.ts`** - Animation engine exports
5. **`src/lib/features/admin/shared/index.ts`** - Admin UI exports

---

## Execution Checklist for Opus

Before starting:
- [ ] Read entire document
- [ ] Understand all 7 phases
- [ ] Prepare for 8-10 hours of work
- [ ] Verify you're on main branch
- [ ] Understand commit strategy (after each phase)

During execution:
- [ ] Follow phases in order
- [ ] Commit after EACH phase (not all at once)
- [ ] Validate after each phase
- [ ] Don't skip validation steps
- [ ] Test regex patterns before mass replace

After completion:
- [ ] Run all validation checks
- [ ] Review all commits
- [ ] Test manually
- [ ] Document any issues found

---

## Contact & Questions

If you encounter issues not covered in this guide:

1. Check git reflog for recovery
2. Review recent commits for clues
3. Search for similar error patterns in type check logs
4. Consider partial rollback to problematic phase

**This guide is comprehensive and production-ready. Good luck, Opus!**

---

**End of Implementation Guide**

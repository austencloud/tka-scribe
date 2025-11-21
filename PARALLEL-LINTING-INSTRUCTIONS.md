# Parallel Linting Fix Instructions

You currently have **2,672 linting issues** (1,012 errors, 1,660 warnings).

I've created **6 separate agent prompts** to tackle these issues in parallel. Each agent will focus on a specific category of errors.

## How to Run Agents in Parallel

### Quick Start - Run All 6 Agents at Once

Send this to Claude Code:

```
Run these 6 agents in parallel:

1. Read AGENT-PROMPT-IMPORT-SORTING.md and fix all import sorting issues
2. Read AGENT-PROMPT-UNUSED-VARS.md and fix all unused variable errors
3. Read AGENT-PROMPT-TYPESCRIPT-SAFETY.md and fix all TypeScript type safety issues
4. Read AGENT-PROMPT-ACCESSIBILITY.md and fix all accessibility issues
5. Read AGENT-PROMPT-ERROR-HANDLING.md and fix all error handling issues
6. Read AGENT-PROMPT-NULLISH-AND-CONDITIONS.md and fix nullish coalescing and unnecessary condition warnings
```

### Alternative - Run in Two Batches

If running all 6 at once is too much, split into two batches:

**Batch 1 (Quick wins - mostly auto-fixable):**

```
Run these 3 agents in parallel:

1. Read AGENT-PROMPT-IMPORT-SORTING.md and fix all import sorting issues
2. Read AGENT-PROMPT-UNUSED-VARS.md and fix all unused variable errors
3. Read AGENT-PROMPT-NULLISH-AND-CONDITIONS.md and fix nullish coalescing warnings
```

**Batch 2 (Requires more thought):**

```
Run these 3 agents in parallel:

1. Read AGENT-PROMPT-TYPESCRIPT-SAFETY.md and fix all TypeScript type safety issues
2. Read AGENT-PROMPT-ACCESSIBILITY.md and fix all accessibility issues
3. Read AGENT-PROMPT-ERROR-HANDLING.md and fix all error handling issues
```

### Cleanup Pass (After main batches)

After the main agents complete, there may be miscellaneous issues left. Run:

```
Read AGENT-PROMPT-MISCELLANEOUS.md and fix all remaining miscellaneous linting issues
```

## Agent Task Breakdown

### Agent 1: Import Sorting (FAST - mostly auto-fix)

- **File**: `AGENT-PROMPT-IMPORT-SORTING.md`
- **Issues**: ~686 auto-fixable import sort warnings
- **Estimated time**: 5-10 minutes
- **Strategy**: Run `npm run lint:fix` first, then handle edge cases

### Agent 2: Unused Variables (MEDIUM)

- **File**: `AGENT-PROMPT-UNUSED-VARS.md`
- **Issues**: ~100-200 unused variable errors
- **Estimated time**: 15-30 minutes
- **Strategy**: Remove truly unused vars, prefix used-but-not-referenced with `_`

### Agent 3: TypeScript Safety (SLOW - complex)

- **File**: `AGENT-PROMPT-TYPESCRIPT-SAFETY.md`
- **Issues**: ~800-1000 unsafe any/type errors
- **Estimated time**: 45-90 minutes
- **Strategy**: Add proper types, use type guards, avoid `any`

### Agent 4: Accessibility (MEDIUM)

- **File**: `AGENT-PROMPT-ACCESSIBILITY.md`
- **Issues**: ~50-100 a11y warnings
- **Estimated time**: 20-40 minutes
- **Strategy**: Fix `{@html}` XSS risks, add keyboard handlers, use semantic HTML

### Agent 5: Error Handling (MEDIUM)

- **File**: `AGENT-PROMPT-ERROR-HANDLING.md`
- **Issues**: ~100-150 error handling issues
- **Estimated time**: 20-30 minutes
- **Strategy**: Throw Error objects, handle rejections properly, fix empty catches

### Agent 6: Nullish & Conditions (FAST-MEDIUM)

- **File**: `AGENT-PROMPT-NULLISH-AND-CONDITIONS.md`
- **Issues**: ~200-300 prefer-nullish-coalescing warnings
- **Estimated time**: 15-25 minutes
- **Strategy**: Replace `||` with `??`, remove unnecessary conditions

### Agent 7: Miscellaneous (cleanup)

- **File**: `AGENT-PROMPT-MISCELLANEOUS.md`
- **Issues**: Whatever's left (no-undef, no-empty, etc.)
- **Estimated time**: 10-20 minutes
- **Strategy**: Handle various remaining issues

## Progress Tracking

After each batch completes, run:

```
npm run lint
```

To see how many issues remain and which categories still need work.

## Success Criteria

Your goal is to get to:

```
✓ All matched files use Prettier code style!
✓ 0 problems (0 errors, 0 warnings)
```

## Tips for Success

1. **Let agents work independently** - each prompt is designed to avoid conflicts
2. **Import sorting first** - this is quick and gets auto-fixed
3. **TypeScript safety takes longest** - be patient with this one
4. **Review a11y fixes** - these affect user experience, worth double-checking
5. **Run lint between batches** - helps track progress and catch any new issues

## If Agents Conflict

If two agents try to modify the same file:

1. Let them both complete
2. Run `npm run lint` to see if there are conflicts
3. Manually resolve any merge conflicts
4. Re-run lint to verify

## Emergency Stop

If something goes wrong, you can always:

1. Check git status: `git status`
2. See changes: `git diff`
3. Revert if needed: `git checkout .`

---

Good luck! You've got this! 🚀

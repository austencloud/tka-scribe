# Parallel Linting Fix Coordination

## Current Status
- **Total warnings**: 159
- **Target**: 0 warnings

## Parallel Agent Strategy

We're splitting the work into 4 independent agents that can run simultaneously:

### Agent 1: Simple Fixes (69 warnings)
**File**: `AGENT-PROMPT-LINTING-1-SIMPLE-FIXES.md`
**Estimated time**: 15-20 minutes
**Types**: prefer-nullish-coalescing, consistent-type-imports, prefer-optional-chain, no-unnecessary-type-assertion

These are mechanical replacements with low risk of conflicts.

### Agent 2: Unnecessary Conditions (67 warnings)
**File**: `AGENT-PROMPT-LINTING-2-UNNECESSARY-CONDITIONS.md`
**Estimated time**: 30-40 minutes
**Types**: no-unnecessary-condition

Requires careful analysis but files are well-distributed across the codebase.

### Agent 3: Unsafe Arguments (19 warnings)
**File**: `AGENT-PROMPT-LINTING-3-UNSAFE-ARGUMENTS.md`
**Estimated time**: 15-20 minutes
**Types**: no-unsafe-argument

Focused on adding proper types to eliminate `any`.

### Agent 4: Edge Cases (3 warnings)
**File**: `AGENT-PROMPT-LINTING-4-EDGE-CASES.md`
**Estimated time**: 5-10 minutes
**Types**: await-thenable, no-unsafe-call, no-unsafe-member-access

Quick targeted fixes for remaining issues.

## Execution Plan

### Option A: Spawn All Agents in Parallel
```bash
# In Claude Code, spawn 4 agents simultaneously:
- Agent 1: AGENT-PROMPT-LINTING-1-SIMPLE-FIXES.md
- Agent 2: AGENT-PROMPT-LINTING-2-UNNECESSARY-CONDITIONS.md
- Agent 3: AGENT-PROMPT-LINTING-3-UNSAFE-ARGUMENTS.md
- Agent 4: AGENT-PROMPT-LINTING-4-EDGE-CASES.md
```

### Option B: Staged Execution
1. **Stage 1**: Agents 1 & 4 (simple + edge cases) - Low risk
2. **Stage 2**: Agents 2 & 3 (conditions + types) - After stage 1 completes

## File Conflict Risk

**LOW** - The agents are working on different:
- Rule types (different linting issues)
- Mostly different files
- Different code patterns

Minimal overlap expected.

## Success Validation

After all agents complete:
```bash
# Run full lint check
npm run lint

# Should show 0 warnings
# Verify no errors were introduced
npm run check
```

## Merge Order
If conflicts occur, merge in this order:
1. Agent 1 (Simple fixes - safest)
2. Agent 4 (Edge cases)
3. Agent 3 (Type fixes)
4. Agent 2 (Conditions - most complex)

## Estimated Total Time
- **Parallel**: 30-40 minutes (longest agent)
- **Sequential**: 65-90 minutes (sum of all)

**Time saved**: ~40-50 minutes by parallelizing

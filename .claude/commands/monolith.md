Run monolith detection to identify files with multiple responsibilities.

First, run the detection script:
```bash
node scripts/find-monoliths.cjs
```

Show the results summary to the user, then **automatically read the top candidate file** and provide a full analysis:

1. **Read the file** - Don't ask permission, just read it
2. **Identify responsibilities** - List each distinct thing the file does
3. **Propose decomposition** - Suggest specific services to extract with names following CLAUDE.md conventions (no "Service" suffix)
4. **Estimate complexity** - Simple (1 session), Medium (2-3 extractions), Complex (major refactor)

Present your analysis and recommendations, then ask if the user wants to proceed with decomposition.

## Decomposition Philosophy

The goal is **AI parseability and single responsibility**, not hitting specific line counts.

**Signs a file needs decomposition:**
- Multiple unrelated `$effect` blocks
- Many private functions doing different things
- Mixed concerns (data fetching + UI logic + state management)
- Hard to describe what the file does in one sentence

**The pattern:**
1. **Identify responsibilities** - what does this file actually do?
2. **Group by domain** - related responsibilities become one service
3. **Extract contracts** - `services/contracts/I{ServiceName}.ts`
4. **Implement services** - `services/implementations/{ServiceName}.ts`
5. **Wire via inversify** - register in the appropriate DI module
6. **Slim the original** - it becomes an orchestrator that composes services

## What NOT to do:
- Create utility files (use services)
- Create barrel exports (import directly)
- Split just to reduce line count
- Create wrappers with no logic

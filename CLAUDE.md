# Claude Code Guidelines for TKA-Studio

> **Meta-instruction**: This file is a living document. Claude should actively help build it out based on patterns observed in conversations. When the user expresses a general policy, preference, or recurring frustration, Claude should ask: *"Would you like me to add this to CLAUDE.md so future sessions follow this pattern?"*

---

## File Size & Composition Philosophy

This project follows a **2025+ AI-assisted development approach**:

- **Prefer small, single-responsibility files** (20-80 lines typical, but not a hard rule)
- **Composition over consolidation** - build features by composing small primitives
- **Don't warn about "too many files"** - AI navigation makes file count a non-issue
- **Each component should do ONE thing completely**
- **Extract aggressively** - if a component has multiple responsibilities, split it

### Why this matters for AI-assisted development:
- Smaller files = smaller context windows = faster, cheaper, more accurate AI assistance
- Git diffs are cleaner and easier to review
- Each file is fully readable in one screen
- Easier to test, modify, and reason about in isolation
- When user says "fix X", AI can read one focused file instead of hunting through 500 lines

### What's NOT a good split:
- Re-export files that just forward imports
- Wrapper components that add no logic
- Splitting cohesive logic across files just to reduce line count
- Utility functions that belong together (e.g., string utils can live in one file)

---

## Technical Stack & Patterns

### Svelte 5
- Use **runes** (`$state`, `$derived`, `$effect`) not legacy reactive syntax
- Use `$props()` with TypeScript interfaces
- Prefer `$derived` over `$effect` when computing values

### State Management
- Use **context + runes** for shared state, not stores
- Services resolved via inversify DI container
- Settings persisted to Firebase with optimistic local updates

### Styling
- Component-scoped `<style>` blocks
- CSS custom properties for design tokens
- Container queries (`cqw`, `cqh`) for component-relative sizing
- Mobile-first with progressive enhancement

---

## Conversation Patterns

### /fb command behavior
- When running `/fb`, **always display the feedback item verbatim first** before any analysis
- This allows the user to read the original feedback before Claude begins working on it
- **After implementing feedback**, provide clear testing instructions:
  - Summarize what was changed
  - List specific steps to verify the fix works
  - Include what to look for (expected behavior)
  - This helps when user has multiple feedback windows open

### Feedback & Release Workflow
- Full workflow documentation: `docs/FEEDBACK-WORKFLOW.md`
- Quick reference:
  - **5 statuses**: `new → in-progress → in-review → completed → archived`
  - **Kanban phase** (new → in-progress → in-review): Active development
  - **Staging phase** (completed): Items ready for next release
  - **Release phase** (archived + fixedInVersion): Released and versioned
- Key commands:
  - `/fb` - Claim and work on feedback
  - `node scripts/release.js -p` - Preview next release
  - `/release` - Ship completed items as a version
- Remember: `completed` means "ready to ship", not "shipped" (that's `archived`)

### What Goes in Release Notes (Critical!)
**Release notes are historical markers for shipped features/fixes** - things Austen would want to remember a week or month later.

**✅ Include (mark as user-facing):**
- User-visible features (new UI, new workflows, new capabilities)
- Bug fixes users would notice (crashes, incorrect behavior, broken features)
- UX improvements (performance, polish, usability)
- Anything you'd be proud to tell users about

**❌ Mark as internal-only** (`node fetch-feedback.js <id> internal-only true`):
- Housekeeping (script organization, file cleanup, folder restructuring)
- Dev tooling (HMR fixes, build optimizations, test improvements)
- Internal refactoring that users never see
- Admin-only features (feedback Kanban UI, internal tools)
- Technical debt cleanup
- **Rule of thumb:** If it belongs in a git commit but not a changelog, mark it internal-only

**When marking feedback completed:**
- Always ask yourself: "Would Austen want to see this in release notes a month from now?"
- If no → mark it `internal-only true` before moving to `completed`
- This keeps release notes clean and actually useful

### When Claude should proactively ask about updating this file:
- User expresses frustration about Claude repeatedly doing something wrong
- User states a general principle ("I always want...", "Never do...", "My preference is...")
- User corrects Claude on an architectural decision
- A pattern emerges across multiple requests

### Memory sync
- CLAUDE.md is the source of truth;

---

## Project-Specific Notes

*(To be filled in as patterns emerge)*

- TKA-Studio is a Svelte 5 + TypeScript application
- Uses inversify for dependency injection
- Firebase for persistence and auth
- Focus on animation and interactive pictograph rendering

---

*Last updated: 2025-12-03*

## Context Management
When context usage exceeds 20%, proactively suggest running /compact before continuing with new tasks.
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
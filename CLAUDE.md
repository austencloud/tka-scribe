# Claude Code Guidelines for TKA Scribe

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

### CSS Variable Hierarchy (3 Layers)
See `src/lib/shared/settings/utils/background-theme-calculator.ts` for implementation.

**Layer 1: Static Layout Tokens (`--settings-*`)**
- Defined in `settings-tokens.css`
- Spacing, radius, typography, transitions
- Do NOT change with background

**Layer 2: Dynamic Theme Variables (`--theme-*`)**
- Injected by background-theme-calculator based on luminance
- Adapt to light/dark backgrounds
- Use for: surfaces, text, borders, accents, shadows
- Variables: `--theme-panel-bg`, `--theme-card-bg`, `--theme-accent`, `--theme-text`, etc.

**Layer 3: Semantic Colors (`--semantic-*`, `--prop-*`)**
- Constant colors that never change with background
- Status: `--semantic-error`, `--semantic-success`, `--semantic-warning`, `--semantic-info`
- Domain-specific: `--prop-blue`, `--prop-red`

**Pattern for new components:**
```css
.card {
  background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
  border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  color: var(--theme-text, #ffffff);
}
.error { color: var(--semantic-error); }
```

**Legacy (`--*-current`)**: Still used by 30+ components. Migration ongoing.

### Typography System (Accessibility-First)
Defined in `src/app.css`. Two-tier minimum font size system:

**Tier 1: Essential Text (14px / 0.875rem minimum)**
- Use `var(--font-size-min)` or `var(--font-size-sm)`
- For: body text, form labels, buttons, links, error messages
- Any text users MUST read to understand/use the interface

**Tier 2: Supplementary Text (12px / 0.75rem minimum)**
- Use `var(--font-size-compact)` or `var(--font-size-xs)`
- For: navigation labels under icons, badges, timestamps, metadata
- Captions where context is already clear from surrounding UI

**Rules:**
- NEVER go below 12px for any user-visible text
- Icons can be smaller (10-12px) as they're not text
- Always use semantic tokens, not raw pixel values
- Include fallback: `var(--font-size-compact, 12px)`

**Pattern for new components:**
```css
.body-text { font-size: var(--font-size-min, 14px); }
.badge { font-size: var(--font-size-compact, 12px); }
.nav-label { font-size: var(--font-size-compact, 12px); }
```

---

## Conversation Patterns

### /check command behavior
- Analyzes TypeScript errors and determines optimal fix strategy
- **Three strategies based on error count and complexity:**
  - **Single session** (<10 simple errors): Fix all errors immediately
  - **Multiple subagents** (10-50 errors): Launch parallel Task agents for different file groups
  - **Multiple Claude Code instances** (>50 errors or complex cascades): Generate scoped prompts for separate sessions
- **Always assess root causes** - don't just count errors, understand cascading type issues
- **Present analysis before acting** - show error summary, recommended strategy, and rationale
- **Get confirmation** before proceeding with fixes

### /fb command behavior

**CRITICAL FIRST STEP: Display feedback verbatim before ANY analysis**

When running `/fb`, you MUST start your response with the raw feedback details in this exact format:

```
## Claimed Feedback: [Title or "Untitled"]

**ID:** [document-id]
**Type:** [bug/feature/enhancement]
**Priority:** [low/medium/high]
**User:** [username]
**Created:** [timestamp]
**Module/Tab:** [module] / [tab]

---

**Description:**
[Full feedback text exactly as provided]

---

**Previous Notes:** [if any]

**Subtasks:** [if any]

---
```

**Then and only then** proceed with your assessment, interpretation, and recommendations.

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
**Release notes are for FLOW ARTISTS, not developers.** Think like a user who creates choreography, doesn't code, and just wants to know what's better for them.

**✅ Include (mark as user-facing):**
- Features flow artists will use (new UI, new creative tools, new capabilities)
- Bug fixes that impact choreography workflow (crashes, broken features, incorrect animations)
- UX improvements they'll notice (performance, smoother interactions, easier workflows)
- **User perspective test:** Would a flow artist care about this?

**❌ Mark as internal-only** (`node fetch-feedback.js <id> internal-only true`):
- Developer workflow tooling (release scripts, feedback systems, build tools)
- Admin-only features (analytics, feedback Kanban, internal dashboards)
- Documentation for developers (workflow docs, architecture notes)
- Housekeeping (file organization, script cleanup, dev dependencies)
- Internal refactoring that doesn't change user experience
- **Rule of thumb:** If it's not visible or useful to a flow artist, mark it internal-only

**When writing release changelogs:**
- **Audience:** Flow artists who want to create better choreography
- **Skip:** Anything developer-focused or admin-only
- **Language:** Plain English, not technical jargon
- **Version bumps:** Only bump minor (0.x.0) when there are substantial user-facing improvements
- Always ask: "Would a flow artist who doesn't code care about this?"

### When Claude should proactively ask about updating this file:
- User expresses frustration about Claude repeatedly doing something wrong
- User states a general principle ("I always want...", "Never do...", "My preference is...")
- User corrects Claude on an architectural decision
- A pattern emerges across multiple requests

### Memory sync
- CLAUDE.md is the source of truth;

---

## Project-Specific Notes

- TKA Scribe is a Svelte 5 + TypeScript application
- Uses inversify for dependency injection
- Firebase for persistence and auth
- Focus on animation and interactive pictograph rendering

### User Identity
- **Primary developer**: Austen Cloud (austencloud@gmail.com)
- When submitting feedback via scripts, default to `--user austen`

### /done command behavior (auto-create workflow)
When `/done` is called and there's no matching feedback item for the work just completed:
1. **Auto-create** a feedback item under Austen's profile (`--user austen`)
2. **Auto-complete** it immediately with appropriate admin notes
3. **Mark internal-only** if it's infrastructure/developer work (not user-facing)
4. **Do NOT ask** for confirmation - just do it automatically
5. Report what was created so the user knows it's tracked

---

*Last updated: 2025-12-15*

## Context Management
When context usage exceeds 20%, proactively suggest running /compact before continuing with new tasks.
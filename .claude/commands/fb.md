---
description: Auto-claim and work on the next feedback item in the queue
allowed-tools: Bash, Read, Edit, Write, Glob, Grep, Task, mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot, mcp__playwright__browser_click, mcp__playwright__browser_resize, mcp__playwright__browser_take_screenshot, mcp__playwright__browser_close, mcp__playwright__browser_wait_for
---

# Feedback Queue Command

**Arguments:** `$ARGUMENTS`

Supports optional priority filter:
- `/fb` - claim next item (highest priority first)
- `/fb low` - claim next LOW priority item (quick wins)
- `/fb medium` - claim next MEDIUM priority item
- `/fb high` - claim next HIGH priority item

## TKA Domain Context

Users may use vague or incorrect terminology. Here's the actual structure:

**Modules** (main nav items):
- `create` - Build sequences (tabs: assembler, constructor, generator)
- `discover` - Browse sequences (tabs: gallery, collections, creators)
- `compose` - Animate sequences (tabs: arrange, browse)
- `learn` - Educational content (tabs: concepts, play, codex)
- `train` - Practice with camera (tabs: practice, challenges, progress)
- `settings` - App preferences (tabs: profile, props, background, visibility, misc)
- `feedback` - Feedback system (tabs: submit, my-feedback, manage)
- `dashboard` - Home/launcher

**Common user confusions:**
- "main screen" / "home" → likely `discover` gallery or `dashboard`
- "my sequences" / "saved" → `discover/gallery` with "My Library" scope toggle
- "practice mode" / "camera thing" → `train`
- "generator" / "random" → `create/generator` tab
- "builder" / "manual" → `create/constructor` tab
- "settings tabs missing" → check if bottom nav shows for settings module
- "can't see X" → could be visibility settings or UI bug

## Workflow

Run `node fetch-feedback.js $ARGUMENTS` to auto-claim the next unclaimed feedback item.

The script will:
1. Find the oldest feedback with status "new"
2. Mark it as "in-progress" with a timestamp (so other agents skip it)
3. Output the full details for you to work on

If another agent runs `/fb` at the same time, they'll get a different item - no collisions!

---

## Model Triage System (Token Optimization)

After claiming feedback, **assess complexity** before implementation to route to the most cost-effective model.

### Step 1: Complexity Assessment

Evaluate the feedback against these criteria:

#### TRIVIAL → Delegate to Haiku (1/10th token cost)
**Indicators:**
- Keywords: "tiny", "small", "quick", "just", "simple", "swap", "change"
- Icon or text changes
- CSS tweaks (colors, spacing, sizing, overflow fixes)
- Validation caps or simple constraints
- Single-file changes where pattern already exists
- Applying an existing pattern to a new location
- String/label updates

**Examples:**
- "Change the icon for X to Y"
- "The text spills over" (CSS overflow)
- "Cap the value at 3"
- "Add version number text"
- "Apply the same styling as X to Y"

#### MEDIUM → Delegate to Sonnet (1/3rd token cost)
**Indicators:**
- Clear bug with specific reproduction steps
- Feature scoped to 1-3 files
- "When X happens, do Y" patterns
- Component state fixes
- Adding a button/control with straightforward behavior
- Form field additions
- Event handler fixes

**Examples:**
- "When I click X, nothing happens"
- "The panel doesn't close when..."
- "Add a clear button to the form"
- "Filter not persisting correctly"

#### COMPLEX → Handle directly with Opus
**Indicators:**
- Keywords: "Dashboard", "System", "Architecture", "Authentication"
- Multi-module coordination
- Security/auth features
- Ambiguous requirements ("I've been thinking...")
- New infrastructure or patterns
- Performance optimization requiring profiling
- Features touching 4+ files
- Policy/UX decisions needed

**Examples:**
- "Add Two-Factor Authentication"
- "Admin monitoring dashboard"
- "Rethink how X works"
- "Session-based autosave system"

### Step 2: Route to Appropriate Model

After assessing complexity:

#### For TRIVIAL tasks:
```
Use the Task tool with:
- subagent_type: "general-purpose"
- model: "haiku"
- prompt: Include ALL context the agent needs:
  1. Full feedback details (ID, description, module/tab)
  2. The file(s) to modify (be specific)
  3. What change to make
  4. How to verify it worked
  5. Command to mark complete when done
```

#### For MEDIUM tasks:
```
Use the Task tool with:
- subagent_type: "general-purpose"
- model: "sonnet"
- prompt: Include ALL context:
  1. Full feedback details
  2. Likely files involved
  3. Expected behavior vs current behavior
  4. Implementation approach
  5. Testing steps
  6. Command to mark complete when done
```

#### For COMPLEX tasks:
Handle directly as Opus - no delegation. Follow the standard workflow below.

### Step 3: Review Delegated Results

When a Haiku/Sonnet agent completes:
1. Briefly review the changes made
2. Verify the approach is sound
3. If good: confirm to user, offer to mark complete
4. If issues: fix them yourself or re-delegate with corrections

---

## Standard Workflow (for Opus-handled or post-delegation)

### After claiming, follow this process

1. **Immediately assign a short title:**
   - Read the feedback content and generate a concise title (2-5 words max)
   - The title should capture the essence at a glance (e.g., "Mobile nav overlap", "Slow gallery load", "Missing undo button")
   - Update Firebase immediately:
     ```
     node fetch-feedback.js <document-id> title "Your short title"
     ```
   - Do this BEFORE any other analysis

2. **Assess the feedback honestly:**
   - Is this a good idea? Mediocre? Or is the user confused?
   - Consider: Does it improve UX? Is it feature creep? Does the user misunderstand the product?
   - If from Austen: likely well-considered, but still evaluate critically
   - If from others: may be based on confusion, edge cases, or unrealistic expectations
   - Give a direct recommendation: implement, modify approach, decline, or cannot reproduce

3. **Interpret what they mean:**
   - What is the user actually describing?
   - Map vague terms to actual modules/tabs/components
   - Don't blindly trust the "Module/Tab" field - users often submit from a different screen

4. **Assess complexity and decide on model routing** (see Triage System above)

5. **For TRIVIAL/MEDIUM: Delegate to appropriate model**
   - Spawn Task agent with haiku or sonnet
   - Provide complete context in the prompt
   - Wait for results and review

6. **For COMPLEX or after delegation: Get confirmation before implementing**
   - State your assessment and interpretation
   - Ask if Austen wants to proceed

7. **Implement or investigate** (only after approval for complex items)
   - For bugs: try to reproduce first, fix if confirmed
   - For features: implement if approved
   - For unclear issues: investigate and report findings

8. **Move to review and add resolution notes:**
   After implementation, move to `in-review` with brief admin notes:
   ```
   node fetch-feedback.js <document-id> in-review "Fixed card height overflow in Kanban board"
   ```

   **Admin notes (internal reference - only visible to admins):**
   - Brief summary of what was fixed (1 line, ~5-10 words)
   - Focus on WHAT was addressed, not HOW
   - Example: "Fixed card height overflow" not "Updated MyFeedbackCard.svelte:88-92 to set min-height: 120px"
   - NO file paths, line numbers, or testing steps
   - Think: "What would I search for later to find this fix?"
   - **Visibility:** Only shown to admin users - never visible to regular users
   - **Always required** for all feedback

   **Resolution notes (user-facing - visible to everyone):**
   - **Only needed for user-facing features** (things regular users interact with)
   - Skip resolution notes for admin-only features (Manage Feedback Kanban, admin dashboards, internal tools, etc.)
   - Explain what was changed from the user's perspective in plain English
   - Clear and concise (1-3 sentences)
   - Focus on the outcome and user benefit
   - Help users understand how their feedback was addressed
   - Avoid technical jargon (no "localStorage", "state management", "persistence", etc.)
   - Write for flow artists, not developers
   - **Visibility:** Shown to all users who submitted the feedback

   **When to add resolution notes:**
   ```bash
   # User-facing feature (needs resolution notes)
   node fetch-feedback.js <id> in-review "Fixed gallery card overflow"
   node fetch-feedback.js <id> resolution "Sequence cards in the gallery now display correctly without being cut off."

   # Admin-only feature (skip resolution notes)
   node fetch-feedback.js <id> in-review "Fixed Kanban column drag-drop"
   # No resolution command needed - admin notes are sufficient
   ```

   **Where technical details go:**
   - File paths, line numbers → Commit messages
   - Testing steps, reproduction steps → PR descriptions or issue comments
   - Implementation approach → Code comments or architecture docs

9. **CRITICAL: Offer to mark as completed (don't do it automatically):**
   After moving to `in-review` and adding resolution notes, END your response by offering to mark as completed.

   **Examples:**
   - "Should I mark this feedback as completed?"
   - "Ready to mark as complete?"
   - "Would you like me to mark this as completed?"

   **DO NOT** automatically mark as completed. Wait for user confirmation.
   This gives the user a chance to test first and verify it actually works.

10. **When user confirms the fix works:**
    Only after the user confirms, mark as completed:
    ```
    node fetch-feedback.js <document-id> completed "Verified working"
    ```

    **Workflow context:**
    - `completed` items are staged for the next release
    - They stay visible in the "completed" column until `/release` is run
    - When `/release` runs, they're archived and tagged with the version number
    - This lets you batch multiple fixes into one release

### Complex feedback with subtasks
When you claim feedback that's too large to implement directly (requires multiple prerequisites, infrastructure changes, or multi-sprint work):

1. **Break it down into subtasks** instead of deferring:
   ```
   node fetch-feedback.js <id> subtask add "Short title" "What needs to be done"
   ```

2. **Specify dependencies** if subtasks must be done in order:
   ```
   node fetch-feedback.js <id> subtask add "Step 2" "Description" 1
   node fetch-feedback.js <id> subtask add "Step 3" "Description" 1 2
   ```
   (The numbers at the end are IDs of subtasks this depends on)

3. **Update subtask status** as you work:
   ```
   node fetch-feedback.js <id> subtask 1 in-progress
   node fetch-feedback.js <id> subtask 1 completed
   ```

4. **View subtasks**:
   ```
   node fetch-feedback.js <id> subtask list
   ```

The feedback stays in the queue. When agents claim it, they see the subtasks and can work on the next available one (pending with all dependencies completed).

### Archiving without releasing
When feedback won't be implemented, move directly to `archived` with a clear reason:

```bash
# Item declined (not a good fit for the product)
node fetch-feedback.js <id> archived "Declined: Out of scope for v1 vision"

# Won't fix (working as intended)
node fetch-feedback.js <id> archived "Won't fix: This is expected behavior"

# Duplicate of another item
node fetch-feedback.js <id> archived "Duplicate of #xyz123abc"

# Cannot reproduce
node fetch-feedback.js <id> archived "Cannot reproduce: Needs more details"
```

**Important:** Archived items bypass the release process. They don't get a `fixedInVersion` tag and won't appear in What's New. Use this for items that are closed but not shipped.

### Deferring to a future date
**NEW:** Instead of archiving permanently, defer items with automatic reactivation:

```bash
# Defer until specific date (YYYY-MM-DD format)
node fetch-feedback.js <id> defer "2026-03-15" "Revisit after Q1 roadmap finalized"
node fetch-feedback.js <id> defer "2026-06-01" "Wait for Svelte 6 release"
node fetch-feedback.js <id> defer "2026-01-15" "Low priority, defer 6 weeks"
```

**How it works:**
1. Item moves to `archived` status with `deferredUntil` timestamp
2. Daily cron job (GitHub Actions) runs `scripts/reactivate-deferred.js`
3. When date arrives, item automatically moves back to `new` status
4. You can manually trigger: `node scripts/reactivate-deferred.js`

**Preview deferred items:**
```bash
node scripts/reactivate-deferred.js --dry-run
```

Shows what will reactivate without making changes.

**Why use defer instead of archive:**
- Items resurface automatically - you don't forget about them
- Clear timeline expectations ("revisit in 3 months")
- Keeps backlog clean while preserving valid feedback
- Don't defer things you'll never do - use `archived` for permanent closure

### Other commands
- `node fetch-feedback.js list` - See queue status
- `node fetch-feedback.js <id>` - View a specific item by document ID
- `node fetch-feedback.js <id> title "short title"` - Update title
- `node fetch-feedback.js <id> resolution "notes"` - Add resolution notes (user-facing summary)
- `node fetch-feedback.js <id> <status> "notes"` - Update status
- `node fetch-feedback.js delete <id>` - Delete a feedback item
- `node scripts/release.js --show-last` - View what shipped in last release

### Stale claims
If a feedback item has been "in-progress" for over 2 hours, it's considered stale and will be auto-reclaimed by the next agent that runs `/fb`.

### Status values (4 columns matching Kanban board)
- `new` - Unclaimed, ready to be picked up
- `in-progress` - Being worked on
- `in-review` - Done, waiting for tester confirmation
- `archived` - Closed (use adminNotes to explain: fixed, declined, deferred, etc.)

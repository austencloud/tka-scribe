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

### After claiming, follow this process:

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

4. **Get confirmation before implementing** - state your assessment and interpretation, ask if Austen wants to proceed

5. **Implement or investigate** (only after approval)
   - For bugs: try to reproduce first, fix if confirmed
   - For features: implement if approved
   - For unclear issues: investigate and report findings

6. **Move to review and add resolution notes:**
   After implementation, move to `in-review` with brief admin notes, then add user-facing resolution notes:
   ```
   node fetch-feedback.js <document-id> in-review "Fixed card height overflow in Kanban board"
   node fetch-feedback.js <document-id> resolution "Adjusted the minimum height of feedback cards so all content is visible without being cut off."
   ```

   **Admin notes (internal reference):**
   - Brief summary of what was fixed (1 line, ~5-10 words)
   - Focus on WHAT was addressed, not HOW
   - Example: "Fixed card height overflow" not "Updated MyFeedbackCard.svelte:88-92 to set min-height: 120px"
   - NO file paths, line numbers, or testing steps
   - Think: "What would I search for later to find this fix?"

   **Resolution notes (visible to users):**
   - Explain what was changed from the user's perspective
   - Clear and concise (1-3 sentences)
   - Focus on the outcome and user benefit
   - Help users understand how their feedback was addressed
   - Example: "Adjusted the minimum height of feedback cards so all content is visible without being cut off."

   **Where technical details go:**
   - File paths, line numbers → Commit messages
   - Testing steps, reproduction steps → PR descriptions or issue comments
   - Implementation approach → Code comments or architecture docs

7. **CRITICAL: Offer to mark as completed (don't do it automatically):**
   After moving to `in-review` and adding resolution notes, END your response by offering to mark as completed.

   **Examples:**
   - "Should I mark this feedback as completed?"
   - "Ready to mark as complete?"
   - "Would you like me to mark this as completed?"

   **DO NOT** automatically mark as completed. Wait for user confirmation.
   This gives the user a chance to test first and verify it actually works.

8. **When user confirms the fix works:**
   Only after the user confirms, mark as completed:
   ```
   node fetch-feedback.js <document-id> completed "Verified working"
   ```

   **Workflow context:**
   - `completed` items are staged for the next release
   - They stay visible in the "completed" column until `/release` is run
   - When `/release` runs, they're archived and tagged with the version number
   - This lets you batch multiple fixes into one release

### Complex feedback with subtasks:
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

### Archiving without releasing:
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

### Deferring to a future date:
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
- ✅ Items resurface automatically - you don't forget about them
- ✅ Clear timeline expectations ("revisit in 3 months")
- ✅ Keeps backlog clean while preserving valid feedback
- ❌ Don't defer things you'll never do - use `archived` for permanent closure

### Other commands:
- `node fetch-feedback.js list` - See queue status
- `node fetch-feedback.js <id>` - View a specific item by document ID
- `node fetch-feedback.js <id> title "short title"` - Update title
- `node fetch-feedback.js <id> resolution "notes"` - Add resolution notes (user-facing summary)
- `node fetch-feedback.js <id> <status> "notes"` - Update status
- `node fetch-feedback.js delete <id>` - Delete a feedback item
- `node scripts/release.js --show-last` - View what shipped in last release

### Stale claims:
If a feedback item has been "in-progress" for over 2 hours, it's considered stale and will be auto-reclaimed by the next agent that runs `/fb`.

### Status values (4 columns matching Kanban board):
- `new` - Unclaimed, ready to be picked up
- `in-progress` - Being worked on
- `in-review` - Done, waiting for tester confirmation
- `archived` - Closed (use adminNotes to explain: fixed, declined, deferred, etc.)

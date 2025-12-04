---
description: Auto-claim and work on the next feedback item in the queue
allowed-tools: Bash, Read, Edit, Write, Glob, Grep, Task, mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot, mcp__playwright__browser_click, mcp__playwright__browser_resize, mcp__playwright__browser_take_screenshot, mcp__playwright__browser_close, mcp__playwright__browser_wait_for
---

# Feedback Queue Command

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

Run `node fetch-feedback.js` to auto-claim the next unclaimed feedback item.

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

6. **Verify the fix before resolving:**
   - **For UI bugs:** Use Playwright to test on relevant viewport sizes (mobile: 375x667, tablet: 768x1024, desktop: 1280x800)
   - **For functionality bugs:** Run the app and verify the fix works
   - **For features:** Demonstrate the feature is working
   - **If you can't test confidently:** Ask the user to confirm before resolving
   - **NEVER resolve based on "this should work"** - verify or get confirmation

7. **Move to review after verification:**
   The claimed feedback output will show the document ID. Move it to in-review:
   ```
   node fetch-feedback.js <document-id> in-review "Your implementation notes here"
   ```
   The tester will then confirm if it works. Once confirmed, move to archived.

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

### Other commands:
- `node fetch-feedback.js list` - See queue status
- `node fetch-feedback.js <id>` - View a specific item by document ID
- `node fetch-feedback.js <id> title "short title"` - Update title
- `node fetch-feedback.js <id> <status> "notes"` - Update status
- `node fetch-feedback.js delete <id>` - Delete a feedback item

### Stale claims:
If a feedback item has been "in-progress" for over 2 hours, it's considered stale and will be auto-reclaimed by the next agent that runs `/fb`.

### Status values (4 columns matching Kanban board):
- `new` - Unclaimed, ready to be picked up
- `in-progress` - Being worked on
- `in-review` - Done, waiting for tester confirmation
- `archived` - Closed (use adminNotes to explain: fixed, declined, deferred, etc.)

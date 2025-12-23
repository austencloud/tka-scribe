---
description: Mark the current feedback item as completed
allowed-tools: Bash
---

# Done Command

Mark the current feedback item as `completed` after you've reviewed and approved the work.

## Usage

When you've reviewed a feedback item and verified it works correctly, use this command to move it to the completed column.

The command expects the document ID and admin notes:

```bash
/done <document-id> "Brief summary of what was changed"
```

**Example:**

```bash
/done abc123xyz "Fixed card height overflow in Kanban board"
```

**Note:** The document ID is shown when the agent runs `/fb`. Copy it from the agent's output.

## What happens

1. Moves the feedback item from any status → `completed`
2. Updates `adminNotes` with your summary
3. The item is now staged for the next release

## Admin notes guidelines

- **Brief summary** of what was fixed (1 line, ~5-10 words)
- Focus on **WHAT** was addressed, not HOW
- Example: "Fixed card height overflow" ✅
- NOT: "Updated MyFeedbackCard.svelte:88-92 to set min-height: 120px" ❌
- NO file paths, line numbers, or testing steps
- Think: "What would I search for later to find this fix?"

## Workflow context

- `completed` items are staged for the next release
- They stay visible in the "completed" column until `/release` is run
- When `/release` runs, they're archived and tagged with the version number
- This lets you batch multiple fixes into one release

## Full workflow

1. Agent runs `/fb` → claims item, moves to `in-progress`
2. Agent implements fix → moves to `in-review`, adds resolution notes
3. **You review and test** → run `/done` → moves to `completed`
4. Later, run `/release` → batches all completed items into a versioned release

## Implementation

The command will extract the document ID and admin notes from the command arguments and run:

```bash
node scripts/fetch-feedback.js.js <document-id> completed "admin notes"
```

This marks the item as completed and ready for the next release.

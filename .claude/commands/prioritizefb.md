---
description: Auto-prioritize all unprioritized feedback items based on type and keywords
allowed-tools: Bash
---

# Auto-Prioritize Feedback

Run `node fetch-feedback.js prioritize` to automatically assign priorities to all feedback items that don't have one.

## How it works

The script analyzes each unprioritized "new" feedback item and assigns a priority based on:

### Type-based defaults:
- **bug** → starts as HIGH (bugs need attention)
- **feature** → starts as MEDIUM
- **enhancement** → starts as MEDIUM
- **general** → starts as LOW

### Keyword detection:

**HIGH priority keywords** (urgency/severity):
- crash, broken, error, bug, fail, can't, cannot, doesn't work
- won't, stuck, freeze, hang, data loss, security, blocking
- urgent, critical, severe, major, unusable, impossible

**LOW priority keywords** (polish/nice-to-have):
- could, maybe, minor, small, cosmetic, polish, nice to have
- nitpick, suggestion, idea, would be nice, eventually, someday
- tweak, slightly, little

## Commands

```bash
# Preview what would be assigned (no changes)
node fetch-feedback.js prioritize --dry-run

# Apply priorities to all unprioritized items
node fetch-feedback.js prioritize
```

## Output

The command will show:
- Each item with its assigned priority (color-coded)
- Summary of how many items got each priority level
- Whether changes were applied or it was a dry run

## When to use

- After a batch of new feedback comes in
- When you want to triage the queue quickly
- Before running `/fb` to ensure the most important items come first

## Notes

- Only affects items with status "new" and no existing priority
- Won't change priorities you've already manually set
- Run `--dry-run` first to preview before applying

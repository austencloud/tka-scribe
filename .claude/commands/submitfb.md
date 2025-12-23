---
description: Submit feedback to the TKA feedback system
---

You are helping the user submit feedback to the TKA Scribe feedback tracking system.

## Task

1. **Extract feedback details from the current conversation context:**
   - **Title**: A concise summary (max 80 chars) of the feedback
   - **Description**: Detailed description of the feedback, feature request, or bug
   - **Type**: Determine if this is a `bug`, `feature`, or `general` feedback
   - **Priority**: Assess priority level: `low`, `medium`, `high`, or `critical`
   - **Module**: If mentioned, use the module name; otherwise use `system`
   - **Tab**: If mentioned, use the tab name; otherwise use `general`
   - **Subtasks**: If this is a complex feature, break it down into subtasks

2. **Show the user what you're about to submit** in a clear format:

   ```
   📋 Feedback to Submit:

   Title: [title]
   Type: [type]
   Priority: [priority]
   Module: [module] / [tab]

   Description:
   [description]

   Subtasks: (if any)
   1. [subtask 1]
   2. [subtask 2]
   ```

3. **Ask for confirmation** before submitting.

4. **Submit the feedback** using the `submit-feedback.js` script:
   - For simple feedback (no subtasks):

     ```bash
     node scripts/submit-feedback.js "Title" "Description" --type [type] --priority [priority] --module [module] --tab [tab]
     ```

   - For complex feedback (with subtasks):
     ```bash
     node scripts/submit-feedback.js "Title" "Description" --type feature --priority [priority] --subtasks '[{"id":"1","title":"Subtask 1","description":"Details","status":"pending","dependsOn":[]},{"id":"2","title":"Subtask 2","description":"Details","status":"pending","dependsOn":[]}]'
     ```

5. **Report the result** to the user with the feedback ID and link.

## Guidelines

- **Title**: Should be clear and concise (like a GitHub issue title)
- **Description**: Should include enough context for someone else to understand
- **Subtasks**:
  - Each subtask needs: `id`, `title`, `description`, `status` (always "pending"), `dependsOn` (array of IDs)
  - Use sequential numeric IDs: "1", "2", "3", etc.
  - Only create subtasks if the feature is genuinely complex (3+ separate tasks)
- **Type inference**:
  - `bug`: Something is broken or not working as expected
  - `feature`: New functionality, enhancement, or improvement
  - `general`: Questions, discussions, documentation
- **Priority inference**:
  - `critical`: App-breaking bugs, security issues
  - `high`: Major features, important bugs affecting many users
  - `medium`: Standard features, minor bugs (default for most features)
  - `low`: Nice-to-haves, polish, minor improvements

## Example Usage

**Simple feature:**

```
User: "We should add keyboard shortcuts for the animation panel"

Claude:
📋 Feedback to Submit:

Title: Add keyboard shortcuts for animation panel
Type: feature
Priority: medium
Module: create / animation

Description:
Add keyboard shortcuts to control animation playback without clicking buttons.
Suggested shortcuts:
- Space: Play/Pause
- Arrow Left/Right: Previous/Next beat
- S: Change speed

Confirm submission? (yes/no)
```

**Complex feature with subtasks:**

```
User: "Let's build the video recording system we discussed"

Claude:
📋 Feedback to Submit:

Title: Video Recording System (VideoRecordDrawer)
Type: feature
Priority: high
Module: create / main

Description:
Implement video recording system with two contexts:
1. VideoRecordDrawer - Personal progress recording
2. Train module auto-record - Background recording with quality-based prompts

Subtasks:
1. Create VideoRecordDrawer component
2. Implement personal progress recording
3. Add background recording to Train module
4. Build accuracy-based save prompts
5. Create video version history system

Confirm submission? (yes/no)
```

## Important Notes

- Always show the user what you're submitting BEFORE you submit it
- If the user's request is ambiguous, ask clarifying questions first
- Keep titles concise but descriptive
- Make descriptions actionable - include enough detail for implementation
- When creating subtasks, think about logical dependencies (use `dependsOn` field)

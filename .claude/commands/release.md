---
description: Create a new release version with git tagging and feedback archival
allowed-tools: Bash, Read, Edit, AskUserQuestion
---

# Release Command

Automate the release process by analyzing completed feedback, generating version numbers, creating git tags, and archiving completed feedback.

## Workflow

### Step 1: Check Completed Feedback

Run the release script in preview mode:

```bash
node scripts/release.js --dry-run
```

This will:

- Query Firestore for items with status "completed"
- If no completed feedback: fallback to git commit history since last tag
- Calculate feedback summary (bugs, features, general) OR parse commits
- Suggest version number based on feedback types or commit types
- Generate changelog preview from feedback or commits
- Check git status

The script automatically handles two modes:

**Feedback Mode** (preferred):

- Uses completed feedback items from Firestore
- Archives feedback and creates version record
- Shows feedback count and breakdown

**Git History Mode** (fallback):

- Parses commits since last tag (or all commits if no tags)
- Uses conventional commit format to categorize changes
- Skips Firestore operations
- Shows commit count

### Step 2: Rewrite Changelog for Users

**CRITICAL**: The raw feedback titles are developer notes, NOT user-facing release notes. Before showing the preview, you MUST rewrite them.

**Audience**: Flow artists who create choreography. They don't code, don't know what "persistence" or "endpoints" mean, and just want to know what's better for them.

**Rewriting Rules**:

1. **Remove developer jargon**: No "persistence", "endpoints", "state", "components", "services"
2. **Focus on user benefit**: What can they DO now? What problem is fixed?
3. **Be specific and concrete**: "Videos now save properly" not "Fixed video persistence"
4. **Keep it short**: 5-10 words per entry
5. **Use active voice**: "You can now..." or "Fixed..."
6. **Group related items**: Combine small related fixes into one clear entry

**Transform Examples**:
| Raw Feedback Title | User-Friendly Version |
|-------------------|----------------------|
| "Fixed i thought we had implemented persistence for the feedback..." | "Your feedback drafts now save automatically" |
| "Added when extending a module in the desktop navigation sidebar..." | "Sidebar sections now expand smoothly" |
| "Fixed generator endpoint mismatch" | "Sequence generation works reliably now" |
| "Added video collaboration (Instagram-style)" | "Share videos with collaborators" |
| "Fixed toggle cards don't register taps with slight finger movement" | "Buttons respond better to taps" |

**After rewriting**, present the polished changelog to the user for review before proceeding.

### Step 3: Show Preview to User

Display the output from the dry-run, which includes:

- Source indicator (feedback mode or git history mode)
- Completed feedback count and breakdown OR commit count
- Current version vs. suggested new version
- **YOUR REWRITTEN changelog preview** (categorized by fixed/added/improved)
- Git status warnings (if uncommitted changes exist)

### Step 4: Get User Confirmation

Use AskUserQuestion to confirm the release:

**Question:** "Ready to release v{VERSION}?"

**Header:** "Release"

**Options:**

1. **"Yes, release now"**
   - Description: "Update package.json, create git commit & tag, GitHub release, archive feedback"

2. **"Change version number"**
   - Description: "Manually specify a different version (e.g., for major releases)"

3. **"Edit changelog"**
   - Description: "Revise the release notes before publishing"

4. **"Cancel"**
   - Description: "Abort the release process"

### Step 5: Handle User Response

#### If "Yes, release now":

**IMPORTANT**: You must pass your rewritten changelog entries to the release script. Create a temporary JSON file with your polished entries:

```bash
# Write your rewritten changelog to a temp file
cat > .release-changelog.json << 'EOF'
[
  { "category": "fixed", "text": "Your polished fix description" },
  { "category": "added", "text": "Your polished feature description" },
  { "category": "improved", "text": "Your polished improvement description" }
]
EOF

# Execute release with the custom changelog
node scripts/release.js --confirm --changelog .release-changelog.json
```

This will:

- Update package.json version field
- Create git commit with changelog
- Create annotated git tag
- Create GitHub release with **YOUR REWRITTEN** changelog
- Archive completed feedback in Firestore (feedback mode only)
- Create version record in Firestore with **YOUR REWRITTEN** changelog entries
- **Create a "What's New" announcement** that pops up for all users

Then proceed to Step 6.

**Note:** The announcement summarizes key features and links to Settings → What's New for full details. Use `--skip-announcement` if you don't want to notify users.

#### If "Edit changelog":

Let the user provide corrections, then update your rewritten changelog and return to Step 4.

#### If "Change version number":

Ask for manual version input, then execute with:

```bash
node scripts/release.js --version {USER_VERSION} --confirm
```

Validate the version format (semver) before proceeding.

#### If "Cancel":

Exit gracefully with message: "Release cancelled. No changes made."

### Step 5: Ask About Pushing to Remote

After successful release, use AskUserQuestion again:

**Question:** "Release v{VERSION} created successfully! Push to remote?"

**Header:** "Push"

**Options:**

1. **"Yes, push tags and commits"**
   - Description: "Push the release commit and tag to origin"

2. **"No, I'll push manually"**
   - Description: "Keep changes local for now"

#### If "Yes, push tags and commits":

```bash
git push && git push --tags
```

Show output and confirm success.

#### If "No, I'll push manually":

Show reminder:

```
✓ Release v{VERSION} committed locally.
  To push later: git push && git push --tags
```

## Version Bumping Rules

The release script automatically suggests a version based on changelog content:

**Feedback Mode:**

- **Minor bump** (0.1.0 → 0.2.0): At least one `feature` type feedback item
- **Patch bump** (0.1.0 → 0.1.1): Only `bug` or `general` type feedback items

**Git History Mode:**

- **Minor bump** (0.1.0 → 0.2.0): At least one `feat:` commit
- **Patch bump** (0.1.0 → 0.1.1): Only `fix:`, `refactor:`, `style:`, or `chore:` commits

**Both Modes:**

- **Manual override**: User can specify any semver version with `--version` flag

## Important Notes

- NEVER run with `--confirm` without user approval via AskUserQuestion
- ALWAYS run `--dry-run` first to preview
- ALWAYS show the full output to the user before confirming
- NEVER push without explicit user confirmation
- If git status is dirty, the script will warn - ask user if they want to continue
- The release script handles all Firestore operations (archives feedback, creates version record)

## Error Handling

The release script will exit with error if:

- No completed feedback AND no commits since last tag → explain options
- Version format invalid → show semver examples
- Firestore operation fails (feedback mode only) → error message with details
- Git operation fails → error message with details

If any step fails after confirmation:

- Git operations are atomic (commit + tag together)
- If Firestore fails after git operations (feedback mode), user must manually clean up
- Show clear error message with recovery steps

## Example Sessions

### Example 1: Feedback Mode (Preferred)

```
User: /release

Claude: I'll help you create a new release. Let me check the completed feedback...

[Runs: node scripts/release.js --dry-run]

📦 Starting release process...

🔍 Checking completed feedback...
✓ Found 8 completed items
  (5 bugs, 3 features)

📌 Current version: 0.1.0
📌 New version: 0.2.0
   (minor bump due to features)

📋 Changelog Preview:

  🐛 Fixed:
     - Fixed mobile nav overlap
     - Fixed slow gallery load
     - Fixed settings persistence
     - Fixed drag on mobile
     - Fixed animation lag

  ✨ Added:
     - Added favorites functionality
     - Added bulk export
     - Added keyboard shortcuts

Claude: [Uses AskUserQuestion]
Ready to release v0.2.0?

User: [Selects "Yes, release now"]

Claude: Executing release...

[Runs: node scripts/release.js --confirm]

✓ Updating package.json...
✓ Archiving feedback in Firestore...
✓ Creating git commit and tag...

🎉 Release v0.2.0 complete!

Claude: [Uses AskUserQuestion]
Release v0.2.0 created successfully! Push to remote?

User: [Selects "Yes, push tags and commits"]

Claude: Pushing to remote...

[Runs: git push && git push --tags]

✓ Pushed commits and tags to origin

All done! Release v0.2.0 is live.
```

### Example 2: Git History Mode (Fallback)

```
User: /release

Claude: I'll help you create a new release. Let me check the completed feedback...

[Runs: node scripts/release.js --dry-run]

📦 Starting release process...

🔍 Checking completed feedback...
⚠️  No completed feedback found.
📝 Using git commit history instead...

✓ Found 19 commits since last release

📌 Current version: 0.1.0-beta
📌 New version: 0.2.0
   (minor bump due to features)

📋 Changelog Preview:

  🐛 Fixed:
     - Improve renderer and coordinator components
     - Fixed drag on mobile

  ✨ Added:
     - Add view transitions and improve coordinators
     - Enhance navigation coordinator and bottom nav
     - Add deep analysis models
     - Add AI-powered feedback analysis system

  🔧 Improved:
     - Simplify cards and add OptionsCard
     - Simplify SettingsModule and improve tab components
     - Extract reusable UI components to shared library
     - Modularize practice UI with animated grid overlay

Claude: [Uses AskUserQuestion]
Ready to release v0.2.0?

User: [Selects "Yes, release now"]

Claude: Executing release...

[Runs: node scripts/release.js --confirm]

✓ Updating package.json...
⏭️  Skipping Firestore operations (git history mode)
✓ Creating git commit and tag...

🎉 Release v0.2.0 complete!

Claude: [Uses AskUserQuestion]
Release v0.2.0 created successfully! Push to remote?

User: [Selects "Yes, push tags and commits"]

Claude: Pushing to remote...

[Runs: git push && git push --tags]

✓ Pushed commits and tags to origin

All done! Release v0.2.0 is live.
```

## Backfilling GitHub Releases

If you have existing git tags without GitHub releases, use the backfill script:

```bash
node scripts/temp/backfill-github-releases.js
```

This will:

- Check all git tags in the repository
- Compare against existing GitHub releases
- For each tag without a release:
  - Pull changelog from Firestore version record (if available)
  - Fallback to git tag message if no version record exists
  - Create a formatted GitHub release

The script is idempotent - safe to run multiple times.

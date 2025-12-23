# TKA Scribe - Claude Code Rules

## Environment Detection & Context

When working in this codebase, automatically detect the development context:

### Auto-Detection Rules

1. **If user is in VSCode workspace** → Assume DEVELOPMENT mode
   - All modules should be visible
   - Use development environment settings
   - Enable debug tools

2. **If user mentions `/release`** → Switch to RELEASE mode
   - Run: `node scripts/release-to-production.js`
   - Guide through production release workflow
   - Update netlify.toml with module visibility changes

3. **If user asks to "push", "deploy", or "merge to main"** → Check release status
   - Ask: "Are you ready to release these changes to production?"
   - If yes, run `/release` workflow
   - If no, confirm it's for development/preview

### Environment Commands

When user needs environment management:

- `/check-env` → Run: `node scripts/check-environment.js`
- `/dev` → Run: `node scripts/switch-environment.js dev`
- `/prod` → Run: `node scripts/switch-environment.js prod`
- `/release` → Run: `node scripts/release-to-production.js`
- `/fb` → Run: `node scripts/feedback-workflow.js` (Claude Code feedback flow)

### Git Hook Awareness

Git hooks automatically manage environment:

- `post-checkout`: Auto-updates .env.local when switching branches
- `pre-commit`: Warns when committing to production branches

### Module Visibility System

This project uses **two-layer access control**:

1. **Environment Layer**: Production vs Development
   - Production: Only released modules visible
   - Development: All modules visible
   - Configured in `netlify.toml`

2. **Role Layer**: User permissions
   - User, Tester, Admin roles
   - Configured in `FeatureFlagService.svelte.ts`

### When User is Developing

**Default assumptions:**

- Working in development mode
- All features should be accessible
- `.env.local` should have development settings
- No need to worry about production visibility

**What to do:**

- Help implement features freely
- Don't restrict module access
- Use full development environment

### When User Wants to Release

**Trigger words:** `/release`, "push to production", "release to users", "make this live"

**What to do:**

1. Run: `node scripts/release-to-production.js`
2. Guide through:
   - Current production status
   - Which modules to enable/disable
   - Commit message
   - PR creation or direct push
3. Remind about:
   - Testing on preview first
   - Verifying production after deploy

### File Operations

**When creating/editing code:**

- Assume development mode
- Don't add production-specific restrictions in code
- Let environment system handle visibility

**When editing netlify.toml:**

- Only do this during `/release` workflow
- Update `[context.production.environment]` section
- Ask for confirmation before changing

### Quick Reference

```bash
# Check current environment
node scripts/check-environment.js

# Switch to dev (all features)
node scripts/switch-environment.js dev

# Switch to prod simulation (released features only)
node scripts/switch-environment.js prod

# Release to production
node scripts/release-to-production.js
```

### Context Awareness

**VSCode Workspace Indicators:**

- If files are being edited → Development mode
- If .env.local exists → Check its contents
- If on `main` branch → Extra caution, might be release mode
- If on feature/dev branch → Definitely development mode

**User Intent Indicators:**

- "Let's build..." → Development
- "I want to add..." → Development
- "Can you help me..." → Development
- "Push this live" → Release
- "Release to users" → Release
- "Make this public" → Release

### Error Prevention

**Never:**

- Suggest editing production code to hide features
- Add environment checks in component code (use FeatureFlagService)
- Modify netlify.toml without explicit release intent
- Assume production mode when developing

**Always:**

- Ask for confirmation before production changes
- Run preview tests before suggesting release
- Use the proper release workflow
- Maintain separation of dev and prod configs

### Documentation References

- Full workflow: `docs/PRODUCTION-RELEASE-WORKFLOW.md`
- Quick reference: `docs/RELEASE-QUICK-REFERENCE.md`
- Migration guide: `docs/MIGRATION-RELEASE-WORKFLOW.md`
- System summary: `docs/RELEASE-SYSTEM-SUMMARY.md`

### Example Interactions

**User:** "Help me add a new feature to the Learn module"
**Claude:** _Assumes development mode, helps freely_

**User:** "This is ready to go live"
**Claude:** "Great! Let's release this to production. I'll run the release workflow..."
_Executes: `node scripts/release-to-production.js`_

**User:** "Push to main"
**Claude:** "Are you ready to release these changes to production? This will make them visible to all users. If yes, I'll start the release workflow."

**User:** "/release"
**Claude:** _Immediately runs: `node scripts/release-to-production.js`_

### Smart Defaults

- **Default environment**: Development (all features visible)
- **Default branch assumption**: Development branch (unless explicitly on main)
- **Default user intent**: Building/testing (not releasing)
- **Default action**: Help develop (not restrict)

### Integration with Existing Tools

The release system integrates with:

- Firebase Admin (for version management)
- Git (for commits and tags)
- Netlify (for deployments)
- VSCode Tasks (for quick commands)
- GitHub CLI (for PR creation)

Use these tools appropriately during release workflow.

# Automated Release Workflow - AI Assistant Guide

## Overview

The TKA Studio release system now has **full AI assistant integration**. Claude, GitHub Copilot, and Cursor all understand when you're developing vs releasing, and will guide you through the appropriate workflow automatically.

## How It Works

### Automatic Context Detection

AI assistants automatically detect your intent:

**Development Mode** (default):
- ✅ You're editing code in VSCode
- ✅ You're on a feature/develop branch
- ✅ You're asking to "build" or "add" something
- ✅ No mention of "release" or "production"

**Result**: All modules visible, full development environment, help you build freely

**Release Mode** (explicit):
- ⚠️ You type `/release`
- ⚠️ You say "push to production"
- ⚠️ You want to "release to users"
- ⚠️ You're ready to "make this live"

**Result**: Launches release workflow, updates production config, creates PR

## The `/release` Command

### How to Use

Just type `/release` in your conversation with any AI assistant:

```
You: /release
AI: Starting production release workflow...
    Let me guide you through enabling/disabling modules in production.
```

## The `/fb` Command

### Claude Code Feedback Flow

Type `/fb` to run your Claude Code feedback workflow:

```
You: /fb
AI: Starting feedback release flow...
    Collecting completed feedback from Firestore...
```

This runs `scripts/release.js --preview` which:
1. Collects completed feedback items
2. Generates changelog from feedback
3. Shows preview for review
4. Waits for confirmation to release

The AI will:
1. Run `node scripts/release-to-production.js`
2. Show current production status
3. Ask which modules to enable/disable
4. Update `netlify.toml`
5. Create commit
6. Optionally create PR or push to main

### Other Trigger Phrases

The AI recognizes these as release intent:
- "push to production"
- "release to users"
- "make this live"
- "deploy to prod"
- "ready for public release"

## NPM Commands

You can also run commands directly:

```bash
# Release to production (interactive)
npm run release:prod

# Check current environment
npm run env:check

# Switch to development mode
npm run env:dev

# Switch to production simulation
npm run env:prod
```

## VSCode Tasks

Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) → "Tasks: Run Task":

- **🚀 Release to Production** - Interactive release workflow
- **🔍 Check Current Environment** - See current branch and env settings
- **🔄 Switch to Development Mode** - Enable all features locally
- **📦 Switch to Production Mode** - Simulate production locally

## Git Hooks (Automatic)

Git hooks automatically manage your environment:

### post-checkout Hook

When you switch branches:
- Switches to `main/release` → Copies `.env.production` to `.env.local`
- Switches to other branches → Copies `.env.development` to `.env.local`

```bash
# This happens automatically:
git checkout main
# → .env.local now has production settings

git checkout develop
# → .env.local now has development settings
```

### pre-commit Hook

When you commit:
- Warns if you're on `main` or `release` branch
- Reminds you that commits here are production changes

## AI Assistant Integration

### Claude (via .claude/rules.md)

Claude understands:
- When you're developing (default)
- When you want to release (`/release`)
- How to guide you through production releases
- Not to add production restrictions in your code

### GitHub Copilot (via .github/copilot-instructions.md)

Copilot knows:
- Development mode is default
- `/release` triggers release workflow
- Ask before making production changes
- Use FeatureFlagService, not manual checks

### Cursor (via .cursorrules)

Cursor recognizes:
- Auto-context detection
- Smart command shortcuts
- Development vs release intent
- Two-layer access system

## Example Workflows

### Scenario 1: Building a New Feature

```
You: Help me add a new feature to the Learn module

AI: Sure! I'll help you build that. Since we're in development mode,
    all modules are accessible. Let's start by...
    
    [Helps you implement without restrictions]
```

### Scenario 2: Ready to Release

```
You: This feature is ready for users. /release

AI: Great! Let's release to production. I'm running the release workflow...

    📦 Current Production Status:
    ✅ Released - Dashboard
    ✅ Released - Create
    ✅ Released - Discover
    ✅ Released - Feedback
    ❌ Not Released - Learn

    Do you want to change module visibility? (y/n):
```

### Scenario 3: Checking Environment

```
You: /check-env

AI: Let me check your current environment...

    🔍 Current Environment Status
    📍 Git Branch: develop
    ✅ DEVELOPMENT branch
    
    🔧 .env.local: development
    
    📦 Module Visibility:
    Create: ✅
    Learn: ✅
    Library: ✅
    
    ✅ Development mode - All features enabled
```

### Scenario 4: Accidental Production Push

```
You: Let's push this to main

AI: ⚠️ WARNING: Pushing to main will deploy to production.
    Are you ready to release these changes to users?
    
    If yes, I recommend using the /release command to properly
    update module visibility first.
```

## File Structure

### Configuration Files

```
.claude/
  rules.md                  # Claude-specific instructions
.cursorrules                # Cursor-specific rules
.github/
  copilot-instructions.md   # GitHub Copilot instructions
.husky/
  pre-commit                # Git hook - commit warnings
  post-checkout             # Git hook - auto environment switch
scripts/
  release-to-production.js  # Interactive release script
  check-environment.js      # Environment status checker
  switch-environment.js     # Manual environment switcher
.vscode/
  tasks.json               # VSCode tasks for quick commands
```

### Environment Files

```
.env.production           # Production defaults (committed)
.env.development          # Development defaults (committed)
.env.local                # Your local env (gitignored, auto-managed)
netlify.toml              # Deployment config with module visibility
```

## How AI Assistants Learn

### They Know About:

1. **Two-Layer Access Control**
   - Environment layer (production vs dev)
   - Role layer (user/tester/admin)

2. **Module Release Status**
   - Which modules are released
   - Which are still in development

3. **The Release Process**
   - When to ask for confirmation
   - How to update netlify.toml
   - Creating PRs vs direct push

4. **Development Workflow**
   - Don't restrict features in code
   - Use FeatureFlagService properly
   - Test on previews before releasing

### They Don't Do (Automatically):

- Edit netlify.toml without your explicit approval
- Push to main without confirmation
- Add environment checks in component code
- Assume production mode when developing

## Best Practices

### For Daily Development

1. **Just work normally** - AI assumes dev mode
2. **All features accessible** - No restrictions
3. **Git hooks handle environment** - Automatic

### For Releasing

1. **Type `/release`** when ready
2. **Follow the prompts** - Interactive workflow
3. **Test on preview first** - Before production
4. **Verify after deploy** - Check live site

### For Testing Production Settings

1. **Switch to prod mode**: `npm run env:prod`
2. **Test locally**: See what users see
3. **Switch back**: `npm run env:dev`

## Troubleshooting

### AI Not Recognizing Commands

Make sure you're using supported AI assistants:
- Claude (via `.claude/rules.md`)
- GitHub Copilot (via `.github/copilot-instructions.md`)
- Cursor (via `.cursorrules`)

### Git Hooks Not Working

Install husky:
```bash
npm install
# Husky hooks install automatically via postinstall
```

Or manually:
```bash
npx husky install
```

### Environment Not Switching

Manually switch:
```bash
npm run env:dev    # Development
npm run env:prod   # Production simulation
```

### AI Still Adding Production Checks

Remind the AI:
```
"Remember, I'm in development mode. Don't add production restrictions.
Let the FeatureFlagService handle visibility."
```

## Quick Command Reference

### AI Commands

```
/release       Start production release workflow
/fb            Run Claude Code feedback workflow
/check-env     Check current environment
/dev           Switch to development mode
/prod          Switch to production simulation mode
```

### NPM Scripts

```bash
npm run release:prod    # Release to production
npm run env:check       # Check environment
npm run env:dev         # Development mode
npm run env:prod        # Production mode (simulation)
```

### VSCode Tasks

```
Ctrl+Shift+P → "Tasks: Run Task"
- 🚀 Release to Production
- 🔍 Check Current Environment
- 🔄 Switch to Development Mode
- 📦 Switch to Production Mode
```

### Git

```bash
git checkout develop    # Auto-switches to dev environment
git checkout main       # Auto-switches to prod environment
```

## Success Indicators

You'll know the system is working when:

✅ AI helps you develop without asking about production
✅ AI recognizes `/release` and guides you through it
✅ Git hooks switch environment when you change branches
✅ VSCode tasks work from Command Palette
✅ Production only shows released features
✅ Development shows all features

## Getting Help

1. **Check environment**: `npm run env:check`
2. **Read full docs**: `docs/PRODUCTION-RELEASE-WORKFLOW.md`
3. **Quick reference**: `docs/RELEASE-QUICK-REFERENCE.md`
4. **Ask AI**: They're trained on this workflow!

## Remember

The goal is **zero mental overhead**:
- Develop freely without thinking about production
- Type `/release` when ready to go live
- Everything else is automatic

**Just code. The AI and tooling handle the rest.**

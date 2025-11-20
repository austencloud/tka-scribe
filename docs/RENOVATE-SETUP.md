# Renovate Setup Guide

## Overview

This project uses [Renovate](https://github.com/renovatebot/renovate) for automated dependency management. Renovate automatically creates pull requests when dependencies need updating, keeping your project secure and up-to-date.

## Features

Our Renovate configuration (`renovate.json`) includes:

✅ **Auto-merge patch and minor updates** - Low-risk updates merge automatically
✅ **Manual review for major updates** - Breaking changes require human approval
✅ **Grouped updates** - Related packages update together (Svelte, Vite, Firebase, etc.)
✅ **Security priority** - Vulnerability patches get immediate attention
✅ **Smart scheduling** - Updates run during off-hours to avoid disruption
✅ **Semantic commits** - Follows conventional commit format

## Setup Instructions

### Option 1: GitHub App (Recommended)

1. Visit https://github.com/apps/renovate
2. Click "Install" or "Configure"
3. Select your repository (`_TKA-STUDIO`)
4. Grant the necessary permissions
5. Renovate will automatically detect the `renovate.json` config and start working

### Option 2: Self-Hosted

If you prefer to run Renovate yourself:

```bash
npm install -g renovate
renovate --token YOUR_GITHUB_TOKEN
```

## Configuration Highlights

### Update Groups

- **Svelte ecosystem**: svelte, @sveltejs/\* packages
- **Vite ecosystem**: vite, @vitejs/\* packages
- **Firebase**: firebase packages
- **TypeScript**: typescript, @types/_, @typescript-eslint/_ packages
- **Testing**: vitest, playwright, testing-library packages
- **Linting**: eslint, prettier packages

### Auto-Merge Rules

- ✅ Patch updates (1.0.0 → 1.0.1) - Auto-merge
- ✅ Minor updates (1.0.0 → 1.1.0) - Auto-merge
- ❌ Major updates (1.0.0 → 2.0.0) - Manual review required

### Schedule

Updates run during these times to minimize disruption:

- Weekdays: 10 PM - 5 AM (America/New_York)
- Weekends: Any time

## Labels

Renovate adds helpful labels to PRs:

- `dependencies` - All dependency updates
- `renovate` - All Renovate PRs
- `auto-merge` - Will auto-merge if tests pass
- `patch-update` - Patch version update
- `minor-update` - Minor version update
- `major-update` - Major version update (requires review)
- `security` - Security vulnerability fix
- Package-specific labels: `svelte`, `vite`, `firebase`, `typescript`, `testing`, `linting`

## Monitoring

Once enabled, you can:

1. View the Renovate dashboard in your GitHub repository
2. Check the Dependency Graph under Insights > Dependency graph
3. Review Security alerts under Security > Dependabot alerts
4. See all open Renovate PRs with the `renovate` label

## Customization

To modify the configuration:

1. Edit `renovate.json`
2. Commit and push changes
3. Renovate will pick up the new config on its next run
4. Test changes at https://renovatebot.com/configuration-validator

## Benefits

- 🔒 **Security**: Automatically applies security patches
- ⏰ **Time-saving**: No manual dependency checking needed
- 📦 **Up-to-date**: Stay current with latest package versions
- 🧪 **Safe**: Auto-merge only for low-risk updates
- 📊 **Organized**: Grouped updates reduce PR noise
- 🤖 **Automated**: Set it and forget it

## Current Score Impact

Adding Renovate: **+2 points** → Dependency Audit Score: 95/100

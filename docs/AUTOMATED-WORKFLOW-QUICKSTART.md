# Automated Release Workflow - Quick Start

## 🎯 For New Developers

### First Time Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd tka-studio
npm install

# 2. Run setup script
npm run release:setup

# 3. Start developing
npm run dev
```

That's it! You're ready to develop with all features enabled.

## 🚀 Daily Workflow

### Developing (Default)

Just work normally in VSCode:
- All modules are visible
- Full development environment
- No restrictions

**Your AI assistant** (Claude/Copilot/Cursor) knows you're developing and will help freely.

### Releasing (Explicit)

When you're ready to release a feature to production, just type:

```
/release
```

in your conversation with any AI assistant. They'll guide you through:
1. Showing current production status
2. Asking which modules to enable/disable
3. Updating netlify.toml
4. Creating commit and PR
5. Deploying to production

## 💡 Key Commands

### For AI Assistants
```
/release       # Start release workflow
/fb            # Run feedback workflow (Claude Code)
/check-env     # Check current environment
/dev           # Switch to development mode
/prod          # Switch to production mode
```

### For Terminal
```bash
npm run release:prod  # Release to production
npm run feedback:flow # Run feedback workflow
npm run env:check     # Check environment
npm run env:dev       # Development mode
npm run env:prod      # Production simulation
```

### For VSCode
Press `Ctrl+Shift+P` (or `Cmd+Shift+P`), then:
- "🚀 Release to Production"
- "💬 Feedback Release Flow"
- "🔍 Check Current Environment"
- "🔄 Switch to Development Mode"
- "📦 Switch to Production Mode"

## 🤖 AI Integration

All major AI assistants understand the workflow:

- **Claude** (`.claude/rules.md`)
- **GitHub Copilot** (`.github/copilot-instructions.md`)
- **Cursor** (`.cursorrules`)

They automatically:
- ✅ Detect when you're developing vs releasing
- ✅ Help build features without restrictions
- ✅ Guide you through releases when you type `/release`
- ✅ Ask before making production changes

## 📚 Documentation

- **Quick Start**: This file
- **Full Guide**: `docs/PRODUCTION-RELEASE-WORKFLOW.md`
- **Quick Reference**: `docs/RELEASE-QUICK-REFERENCE.md`
- **AI Workflow**: `docs/AI-ASSISTED-WORKFLOW.md`
- **Migration Guide**: `docs/MIGRATION-RELEASE-WORKFLOW.md`

## 🎯 Remember

- **Develop freely** - No thinking about production
- **Type `/release`** - When ready to go live
- **Everything else** - Automatic

The AI and tooling handle the complexity. You just code.

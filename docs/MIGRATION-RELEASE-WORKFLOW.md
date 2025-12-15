# Migration Guide: Release Workflow Implementation

## What Changed?

TKA Scribe now has a proper production release workflow with environment-based feature visibility.

### Before
- All features visible to all users (controlled only by role)
- Admin had to manually hide features
- No distinction between "in development" and "publicly released"

### After
- Production shows only released features
- Development/preview shows all features
- Clean separation of production and development environments
- Proper release process through git branches

## For Developers

### Local Development Setup

1. **Update your local environment:**

   Create `.env.local` (this file is gitignored):
   ```bash
   # .env.local
   PUBLIC_ENVIRONMENT=development
   PUBLIC_ENABLE_CREATE_MODULE=true
   PUBLIC_ENABLE_DISCOVER_MODULE=true
   PUBLIC_ENABLE_FEEDBACK_MODULE=true
   PUBLIC_ENABLE_LEARN_MODULE=true
   PUBLIC_ENABLE_LIBRARY_MODULE=true
   PUBLIC_ENABLE_COMPOSE_MODULE=true
   PUBLIC_ENABLE_TRAIN_MODULE=true
   PUBLIC_ENABLE_ML_TRAINING_MODULE=true
   PUBLIC_ENABLE_ADMIN_MODULE=true
   PUBLIC_ENABLE_DEBUG_TOOLS=true
   PUBLIC_ENABLE_ROLE_OVERRIDE=true
   PUBLIC_ENABLE_ANALYTICS=true
   ```

   Or copy from the example:
   ```bash
   cp .env.development .env.local
   ```

2. **No code changes needed in your features!**
   - The system automatically checks environment flags
   - Your existing role-based checks still work
   - Everything is backwards compatible

### Testing Your Changes

1. **Local testing** (as before):
   ```bash
   npm run dev
   ```
   All modules will be visible.

2. **Test production settings locally** (new):
   ```bash
   # Temporarily edit .env.local
   PUBLIC_ENVIRONMENT=production
   PUBLIC_ENABLE_LEARN_MODULE=false
   # ... other production flags
   
   npm run dev
   ```
   Now you'll see what production users see.

3. **Deploy preview** (automatic):
   - Push to any branch → get preview URL
   - All features enabled on previews
   - Share URL with testers

### Creating PRs

**No change to your workflow!**
- Create feature branches as before
- Push → get preview URL
- Review and test on preview
- Merge when ready

**To release to production:**
- Create PR to `main` (or `release` if using that strategy)
- If enabling a new module, include netlify.toml update in the PR

## For Netlify Configuration

### First-Time Setup (Do Once)

1. **Configure production branch in Netlify:**
   - Netlify UI → Site settings → Build & deploy → Continuous deployment
   - Production branch: `main` (or create `release` branch)

2. **Enable branch deploys:**
   - Deploy contexts: Enable "Deploy Previews" for all branches
   - This gives each PR a unique preview URL

3. **Verify environment variables:**
   - Netlify UI → Site settings → Environment variables
   - Should see `PUBLIC_ENABLE_*` variables from netlify.toml
   - These are automatically set per deploy context

### No Netlify UI Changes Needed!

All configuration is in `netlify.toml` (in git). Changes deploy automatically.

## For Testers

### Nothing Changes for You!

- Same login process
- Same permissions
- Preview URLs work the same way

### What's Different:

- **Production** (`https://tka.studio`): Only see released features
- **Preview** (`deploy-preview-*.netlify.app`): See all features

If you're testing unreleased features, always use preview URLs.

## For Admins

### Module Visibility

Admins still see all modules even in production. This is by design - admins bypass environment restrictions.

### Managing Releases

1. **To release a feature:**
   ```toml
   # Edit netlify.toml
   [context.production.environment]
     PUBLIC_ENABLE_LEARN_MODULE = "true"  # Change this
   ```

2. **Create PR to main with this change**

3. **Merge → deploys automatically**

### Role Override Still Works

In development environments, you can still use role override to test as different user types.

## Breaking Changes

### None! 🎉

This is a **non-breaking** addition. All existing functionality works as before.

### New Files:
- `src/lib/shared/environment/environment-features.ts` (new helper functions)
- `.env.production` (production defaults)
- `.env.development` (development defaults)
- `docs/PRODUCTION-RELEASE-WORKFLOW.md` (documentation)
- `docs/RELEASE-QUICK-REFERENCE.md` (quick guide)

### Modified Files:
- `netlify.toml` (added environment variables)
- `src/lib/shared/auth/services/FeatureFlagService.svelte.ts` (added environment check)
- `src/types/global.d.ts` (added new env var types)
- `config/.env.example` (added new variables)

### No Changes Needed In:
- Your feature components
- Existing feature flags
- Role-based access control
- Authentication system

## FAQ

**Q: Do I need to update my feature code?**
- A: No! Everything is backwards compatible.

**Q: Will my local dev environment break?**
- A: No. Just create `.env.local` with development settings (see above).

**Q: What about existing deployed previews?**
- A: They'll keep working. Next deploy will pick up new settings.

**Q: Can I opt out of this?**
- A: Technically yes (set all flags to `"true"` in production), but defeats the purpose.

**Q: What if I want a module visible in production for testing?**
- A: Either:
  1. Set flag to `"true"` in production (releases to everyone)
  2. Test on a preview deployment (recommended)
  3. Use your admin account (admins see all modules)

**Q: How do I know what's released vs in development?**
- A: Check `netlify.toml` → `[context.production]`
- Or see the quick reference: `docs/RELEASE-QUICK-REFERENCE.md`

**Q: Does this affect mobile PWA installs?**
- A: PWA installs use the production URL, so they see only released features.

**Q: Can users upgrade to see unreleased features?**
- A: Not directly. Admin can manually set user role, but environment flags still apply (unless they're admin).

**Q: What about Firebase rules and backend?**
- A: No changes needed. This only affects frontend visibility.

## Testing the Migration

### Step 1: Verify Local Development

```bash
# 1. Create .env.local
cp .env.development .env.local

# 2. Start dev server
npm run dev

# 3. Check all modules are visible
# Open browser → Should see all modules in navigation
```

### Step 2: Verify Production Simulation

```bash
# 1. Edit .env.local
# Set PUBLIC_ENVIRONMENT=production
# Set module flags to match production (most false)

# 2. Restart dev server
npm run dev

# 3. Check only released modules are visible
# Should see: Dashboard, Create, Discover, Feedback
# Should NOT see: Learn, Library, Compose, Train, ML Training
```

### Step 3: Verify Role Override Still Works

```bash
# In development mode (.env.local)
# With PUBLIC_ENABLE_ROLE_OVERRIDE=true

# 1. Open debug tools
# 2. Try different role overrides
# 3. Confirm modules appear/disappear based on role
```

### Step 4: Test Deploy Preview

```bash
# 1. Create a test branch
git checkout -b test/verify-release-workflow

# 2. Make a small change (add comment)
# 3. Push to GitHub
git push origin test/verify-release-workflow

# 4. Create PR
# 5. Wait for Netlify preview
# 6. Check preview URL → all modules should be visible
```

## Rollback Plan (If Needed)

If something breaks:

```bash
# 1. Revert the main commits
git revert <commit-hash-1> <commit-hash-2> ...

# 2. Push to main
git push origin main

# 3. Netlify will redeploy without the changes

# Specific files to revert if needed:
# - netlify.toml (remove [context] sections, keep original)
# - FeatureFlagService.svelte.ts (remove environment import and check)
# - global.d.ts (remove PUBLIC_* env var types)
```

## Support

- **Full Documentation**: `docs/PRODUCTION-RELEASE-WORKFLOW.md`
- **Quick Reference**: `docs/RELEASE-QUICK-REFERENCE.md`
- **Example Config**: `config/.env.example`
- **Code**: `src/lib/shared/environment/environment-features.ts`

## Next Steps

1. ✅ Review this guide
2. ✅ Set up `.env.local` for development
3. ✅ Test locally (both dev and production modes)
4. ✅ Verify preview deploys work
5. ✅ Plan your first production release
6. ✅ Update team on new workflow

## Conclusion

This migration is **low-risk** and **backwards compatible**. Your existing workflow continues to work, with the added benefit of proper production release control.

The system automatically handles the complexity - you just set flags in netlify.toml when ready to release features.

**Key Point**: Nothing breaks if you do nothing. The system defaults to showing all features in development, maintaining current behavior.

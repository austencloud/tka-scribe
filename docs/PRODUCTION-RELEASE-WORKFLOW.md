# Production Release Workflow

## Overview

TKA Scribe now has a proper release workflow that separates production (public releases) from development (testing and active development). This ensures users only see features you've explicitly released, while developers and testers can access everything.

## The Two-Track System

### 1. **Production Branch** (`main`)
- **What it is**: The stable, public-facing version
- **Who sees it**: All users at https://tka.studio
- **What's enabled**: Only modules marked as "released"
  - ✅ Dashboard
  - ✅ Create (Constructor & Generator tabs)
  - ✅ Discover (Gallery, Creators, Collections)
  - ✅ Feedback
  - ❌ Learn (admin only)
  - ❌ Library (admin only)
  - ❌ Compose (admin only)
  - ❌ Train (admin only)
  - ❌ ML Training (admin only)

### 2. **Development Branch** (`develop` or any other branch)
- **What it is**: Preview environment for testing
- **Who sees it**: Developers, testers, and anyone with the preview URL
- **What's enabled**: All features, including unreleased ones
- **URL**: Unique Netlify deploy preview URL (e.g., `deploy-preview-123--tka-studio.netlify.app`)

## How It Works

### Environment-Based Visibility

The system uses **two layers of access control**:

1. **Environment Layer** (NEW): Controls what's visible in production vs development
2. **Role Layer** (existing): Controls what users can access based on their role (user/tester/admin)

```
User Access = Environment Visibility AND Role Permission
```

#### Example Scenarios:

**Scenario 1: Regular user on production**
- Environment: Only Create, Discover, Feedback visible
- Role: User (basic access)
- Result: Can access Create, Discover, Feedback

**Scenario 2: Tester on production**
- Environment: Only Create, Discover, Feedback visible
- Role: Tester (enhanced access)
- Result: Can access Create, Discover, Feedback (same as regular user)

**Scenario 3: Admin on production**
- Environment: Only Create, Discover, Feedback visible
- Role: Admin (full access)
- Result: Can access all modules (environment restrictions don't apply to admins)

**Scenario 4: Tester on development**
- Environment: All modules visible
- Role: Tester
- Result: Can access all modules they have permission for

## Netlify Configuration

The deployment configuration is in `netlify.toml`:

```toml
# Production (main branch) - Public release
[context.production]
  PUBLIC_ENABLE_CREATE_MODULE = "true"
  PUBLIC_ENABLE_DISCOVER_MODULE = "true"
  PUBLIC_ENABLE_FEEDBACK_MODULE = "true"
  PUBLIC_ENABLE_LEARN_MODULE = "false"    # Hidden
  PUBLIC_ENABLE_LIBRARY_MODULE = "false"  # Hidden
  # ... etc

# Development (develop branch) - Full preview
[context.develop]
  PUBLIC_ENABLE_CREATE_MODULE = "true"
  PUBLIC_ENABLE_DISCOVER_MODULE = "true"
  PUBLIC_ENABLE_LEARN_MODULE = "true"     # Visible
  PUBLIC_ENABLE_LIBRARY_MODULE = "true"   # Visible
  # ... etc
```

## Release Workflow

### When You Want to Release a New Feature:

1. **Develop on `develop` branch** (or feature branches)
   - All modules are visible for testing
   - Test thoroughly with testers

2. **Enable the module in production** (when ready)
   - Edit `netlify.toml` → `[context.production]`
   - Change the module flag to `"true"`
   - Example: `PUBLIC_ENABLE_LEARN_MODULE = "true"`

3. **Merge to `main`**
   - Your PR to `main` should include the netlify.toml change
   - Netlify will deploy with the new module enabled

4. **Announce the release**
   - Users will now see the new module on https://tka.studio

### Quick Release Checklist:
- [ ] Feature tested on `develop` preview
- [ ] Testers have approved the feature
- [ ] Update `netlify.toml` production context
- [ ] Merge to `main`
- [ ] Verify production deployment
- [ ] Announce to users

## Local Development

For local development, create a `.env.local` file (not committed to git):

```bash
# .env.local (use for local testing)
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
```

This enables all features locally for development.

## Environment Files

- `.env.production` - Production defaults (committed)
- `.env.development` - Development defaults (committed)
- `.env.local` - Your local overrides (not committed, gitignored)
- `config/.env.example` - Template for new developers

## Branch Strategy

### Recommended Setup:

```
main (production)
  ↑
  PR with release changes
  ↑
develop (development/preview)
  ↑
  PRs from feature branches
  ↑
feature/* (individual features)
```

### Or Simpler:

```
main (production)
  ↑
  PRs from feature branches
  ↑
feature/* (individual features)
```

Every PR gets a deploy preview with full feature access.

## Testing Before Release

### For Testers:
1. Share the deploy preview URL from your PR
2. Testers can access all features on the preview
3. Collect feedback before merging to main

### For Admins:
- Can override role in development to test as different user types
- `PUBLIC_ENABLE_ROLE_OVERRIDE=true` enables debug tools

## Private Alpha/Beta Testing

### Option A: Invite-Only via Netlify Identity
- Configure Netlify Identity to "Invite only" mode
- Only users you invite can create accounts
- Works on both production and preview deployments

### Option B: Password-Protected Dev Site
- Add site password in Netlify settings
- Visitors must enter password to access any preview
- Good for truly private testing

### Option C: Role-Based (Current System)
- Testers sign in and get "tester" role
- Access controlled by role permissions
- Production and dev have different visibility

## Code Implementation

### Checking Module Visibility:

```typescript
import { featureFlagService } from '$lib/shared/auth/services/FeatureFlagService.svelte';

// Checks both environment AND role
const canAccessLearn = featureFlagService.canAccessModule('learn');
```

### The Check Flow:

```typescript
canAccessModule('learn')
  → isModuleEnabledInEnvironment('learn')  // Environment check
    → Checks PUBLIC_ENABLE_LEARN_MODULE
  → checkFeatureAccess('module:learn')     // Role check
    → Checks user role vs minimum required role
```

## Advantages of This Approach

1. **Clean Release Process**: Production only changes when you explicitly merge and enable features
2. **Continuous Testing**: Developers and testers can work with all features without affecting users
3. **No Accidental Releases**: Features hidden in production until you're ready
4. **Preview URLs**: Every PR gets its own testable URL
5. **Rollback-Friendly**: Revert a PR to roll back a release
6. **Version Control**: Release state is tracked in git (netlify.toml)

## Common Tasks

### Add a New Module:
1. Create the module code
2. Add to `MODULE_DEFINITIONS`
3. Add environment flag to netlify.toml (set `"false"` in production initially)
4. Add to `.env.production`, `.env.development`
5. Test on develop preview
6. When ready: Change flag to `"true"` in production context

### Temporarily Disable a Released Module:
1. Edit `netlify.toml` → `[context.production]`
2. Change module flag to `"false"`
3. Deploy to main
4. Module hidden from users (but still in code)

### Check What's Released:
Look at `netlify.toml` → `[context.production]` → flags set to `"true"`

## Troubleshooting

**Module not showing in production but visible in dev?**
- Check `netlify.toml` → `[context.production]` → module flag should be `"true"`

**Module showing for some users but not others?**
- Check their role (user/tester/admin)
- Environment visibility + role = final access

**Need to test production config locally?**
- Set `PUBLIC_ENVIRONMENT=production` in `.env.local`
- Or create `.env.production.local` for production overrides

**Deploy preview not showing new features?**
- Verify `[context.deploy-preview]` has features enabled
- Check Netlify build logs for environment variables

## Next Steps

1. **Decide on branch strategy**: Do you want a permanent `develop` branch or work directly with `main` + feature branches?
2. **Configure Netlify production branch**: Set to `main` (or create `release` branch)
3. **Set up branch deploys**: Enable deploy previews for all branches
4. **Invite testers**: Add them to Netlify Identity or share preview URLs
5. **Plan first release**: What features are ready to go public?

## Questions?

- **Q: Can admins see unreleased features in production?**
  - A: Yes! Admins bypass environment restrictions and see all modules.

- **Q: What about the existing admin tab hiding?**
  - A: That still works! This adds another layer for environment-based hiding.

- **Q: How do I test what users see?**
  - A: Use role override in development, or create a test account with "user" role.

- **Q: Can I have multiple production environments?**
  - A: Yes! Use custom contexts in netlify.toml (e.g., `staging` branch with partial features enabled).

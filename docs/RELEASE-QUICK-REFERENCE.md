# Release Workflow - Quick Reference

## 🚀 Deploying a New Feature to Production

```bash
# 1. Feature is ready on develop/feature branch
git checkout develop
# ... test feature thoroughly on preview URL

# 2. Update netlify.toml to enable in production
# Edit: [context.production] → Set module flag to "true"

# 3. Create PR to main
git checkout -b release/enable-learn-module
# ... edit netlify.toml
git commit -m "Release: Enable Learn module in production"
git push origin release/enable-learn-module
# Create PR to main

# 4. Merge PR → Netlify auto-deploys to production
# ✅ Feature is now live!
```

## 📋 Quick Commands

### View Current Production Config
```bash
cat netlify.toml | grep -A 20 "\[context.production\]"
```

### View Current Development Config
```bash
cat netlify.toml | grep -A 20 "\[context.develop\]"
```

### Test Production Settings Locally
```bash
# Create .env.local with production settings
echo "PUBLIC_ENVIRONMENT=production" > .env.local
echo "PUBLIC_ENABLE_LEARN_MODULE=false" >> .env.local
# ... add other production flags
npm run dev
```

## 🎯 What's Released? (Current Production)

Check `netlify.toml` → `[context.production]`:

| Module | Status | Notes |
|--------|--------|-------|
| Dashboard | ✅ Released | Always visible |
| Create | ✅ Released | Constructor & Generator tabs |
| Discover | ✅ Released | Gallery, Creators, Collections |
| Feedback | ✅ Released | Submit & view own feedback |
| Learn | ❌ Not Released | Admin only |
| Library | ❌ Not Released | Admin only |
| Compose | ❌ Not Released | Admin only |
| Train | ❌ Not Released | Admin only |
| ML Training | ❌ Not Released | Admin only |

## 🔐 Access Control Matrix

| User Type | Production | Development |
|-----------|-----------|-------------|
| **Guest** | Create, Discover | Create, Discover, Learn, Library, etc. |
| **User (signed in)** | Create, Discover, Feedback | All modules |
| **Tester** | Create, Discover, Feedback | All modules |
| **Admin** | All modules (bypass env restrictions) | All modules |

## 🌐 Deployment URLs

- **Production**: `https://tka.studio` (main branch)
- **Develop Preview**: `https://develop--tka-studio.netlify.app`
- **PR Previews**: `https://deploy-preview-[PR#]--tka-studio.netlify.app`
- **Branch Previews**: `https://[branch-name]--tka-studio.netlify.app`

## 📝 Common Tasks

### Enable Module in Production
```toml
# netlify.toml
[context.production.environment]
  PUBLIC_ENABLE_LEARN_MODULE = "true"  # Change false → true
```

### Disable Module in Production
```toml
# netlify.toml
[context.production.environment]
  PUBLIC_ENABLE_LEARN_MODULE = "false"  # Change true → false
```

### Add New Module Flags
```toml
# netlify.toml - Add to all contexts
[context.production.environment]
  PUBLIC_ENABLE_NEW_MODULE = "false"

[context.develop.environment]
  PUBLIC_ENABLE_NEW_MODULE = "true"

[context.deploy-preview.environment]
  PUBLIC_ENABLE_NEW_MODULE = "true"
```

## 🐛 Debugging

### Module Not Showing Up?

1. **Check environment flag** (netlify.toml)
   ```
   PUBLIC_ENABLE_[MODULE]_MODULE = "true" ?
   ```

2. **Check user role** (Firestore)
   ```
   User role >= module minimum role ?
   ```

3. **Check browser console**
   ```javascript
   console.log(import.meta.env.PUBLIC_ENVIRONMENT)
   console.log(import.meta.env.PUBLIC_ENABLE_LEARN_MODULE)
   ```

4. **Clear browser cache**
   - Cached builds might have old settings

### Wrong Features Showing?

1. **Check which environment you're on**
   - Look at URL (tka.studio vs deploy-preview)
   
2. **Verify environment variables in Netlify**
   - Netlify UI → Site settings → Environment variables
   
3. **Check build logs**
   - Netlify UI → Deploys → [Latest] → Deploy log

## 📊 Release Checklist

Before enabling in production:

- [ ] Feature tested on develop/preview
- [ ] Testers have approved
- [ ] No critical bugs
- [ ] Documentation updated (if needed)
- [ ] Analytics events added (if needed)
- [ ] Error handling tested
- [ ] Mobile responsive
- [ ] Accessibility checked
- [ ] Update netlify.toml
- [ ] Create release PR
- [ ] Get PR approval
- [ ] Merge to main
- [ ] Verify production deployment
- [ ] Test on live site
- [ ] Announce to users

## 🚨 Emergency Rollback

If something goes wrong after release:

```bash
# Option 1: Disable feature flag (fast)
# Edit netlify.toml → set module to "false"
# Commit and push to main

# Option 2: Revert merge commit (full rollback)
git revert -m 1 <merge-commit-hash>
git push origin main

# Option 3: Redeploy previous version (Netlify UI)
# Deploys → Find last working deploy → "Publish deploy"
```

## 💡 Pro Tips

1. **Always test on preview first** - Every PR gets a preview URL
2. **Use feature branches** - Keep main clean and stable  
3. **Small, frequent releases** - Easier to test and rollback
4. **Monitor after release** - Watch analytics and error logs
5. **Communicate releases** - Keep users and testers informed
6. **Document changes** - Update CHANGELOG or release notes

## 🔗 Related Files

- `docs/PRODUCTION-RELEASE-WORKFLOW.md` - Full documentation
- `netlify.toml` - Deployment configuration
- `.env.production` - Production defaults
- `.env.development` - Development defaults
- `config/.env.example` - Template for new devs
- `src/lib/shared/environment/environment-features.ts` - Environment checks
- `src/lib/shared/auth/services/FeatureFlagService.svelte.ts` - Access control

## 📞 Need Help?

1. Check full docs: `docs/PRODUCTION-RELEASE-WORKFLOW.md`
2. Review Netlify build logs
3. Test locally with production settings
4. Ask in team chat/review PR comments

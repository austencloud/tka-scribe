# ESLint 9 Migration Plan

## Overview

This document outlines the migration path from ESLint 8.57.1 to ESLint 9.x. ESLint 9 introduces significant breaking changes with the new "flat config" format, but provides improved performance, better TypeScript support, and cleaner configuration.

## Current Status

**Current Version**: ESLint 8.57.1
**Target Version**: ESLint 9.39.1+
**Estimated Effort**: 2-4 hours
**Risk Level**: Medium (breaking changes, but well-documented)

## Why Upgrade?

### Benefits

✅ **Flat Config Format** - Simpler, more intuitive configuration
✅ **Better Performance** - Faster linting, especially on large codebases
✅ **Improved TypeScript** - Better type checking integration
✅ **Simpler Plugin System** - Easier to understand and maintain
✅ **Native ESM Support** - Better module resolution
✅ **Removed Deprecated APIs** - Cleaner codebase

### Breaking Changes

⚠️ **New Config Format** - `.eslintrc.*` → `eslint.config.js`
⚠️ **Plugin System Changes** - Different import/usage pattern
⚠️ **Parser Changes** - Some parsers need updates
⚠️ **Removed Rules** - Some deprecated rules removed
⚠️ **Node.js Requirement** - Requires Node.js 18.18.0+

## Migration Steps

### Phase 1: Preparation (30 min)

#### 1.1 Verify Node.js Version

```bash
node --version
# Should be >= 18.18.0
```

Current project requires: `>=20.0.0` ✅

#### 1.2 Backup Current Config

```bash
git checkout -b eslint-9-migration
cp .eslintrc.cjs .eslintrc.cjs.backup
```

#### 1.3 Review Current ESLint Config

Current configuration uses:

- `@typescript-eslint/eslint-plugin` (6.21.0)
- `@typescript-eslint/parser` (6.21.0)
- `eslint-config-prettier` (8.10.2)
- `eslint-plugin-svelte` (2.46.1)
- `eslint-plugin-no-relative-import-paths` (1.6.1)

### Phase 2: Update Dependencies (15 min)

#### 2.1 Update Core ESLint

```bash
npm install --save-dev eslint@^9.39.1
```

#### 2.2 Update TypeScript ESLint

```bash
npm install --save-dev \
  @typescript-eslint/eslint-plugin@^8.18.2 \
  @typescript-eslint/parser@^8.18.2 \
  typescript-eslint@^8.18.2
```

#### 2.3 Update Plugins

```bash
npm install --save-dev \
  eslint-plugin-svelte@^2.46.1 \
  eslint-config-prettier@^9.1.0
```

### Phase 3: Create Flat Config (60 min)

#### 3.1 Install Config Migration Tool

```bash
npx @eslint/migrate-config .eslintrc.cjs
```

This generates an initial `eslint.config.mjs` file.

#### 3.2 Create Manual Flat Config

Create `eslint.config.mjs`:

```javascript
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import svelte from "eslint-plugin-svelte";
import prettier from "eslint-config-prettier";
import noRelativeImportPaths from "eslint-plugin-no-relative-import-paths";
import globals from "globals";

export default tseslint.config(
  // Base recommended configs
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...svelte.configs["flat/recommended"],
  prettier,
  ...svelte.configs["flat/prettier"],

  // Global settings
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
      parserOptions: {
        project: "./tsconfig.json",
        extraFileExtensions: [".svelte"],
      },
    },
  },

  // TypeScript files
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "no-relative-import-paths": noRelativeImportPaths,
    },
    rules: {
      // Your TypeScript rules here
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "no-relative-import-paths/no-relative-import-paths": [
        "warn",
        { allowSameFolder: true, rootDir: "src", prefix: "$lib" },
      ],
    },
  },

  // Svelte files
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: svelte.parser,
      parserOptions: {
        parser: tseslint.parser,
        project: "./tsconfig.json",
        extraFileExtensions: [".svelte"],
      },
    },
    plugins: {
      svelte,
    },
    rules: {
      // Your Svelte rules here
    },
  },

  // Ignore patterns
  {
    ignores: [
      "**/node_modules/**",
      "**/.svelte-kit/**",
      "**/build/**",
      "**/dist/**",
      "**/.netlify/**",
      "**/coverage/**",
      "**/storybook-static/**",
    ],
  }
);
```

### Phase 4: Update Scripts (10 min)

#### 4.1 Update package.json

No changes needed - ESLint 9 uses the same CLI:

```json
{
  "scripts": {
    "lint": "prettier --check . && eslint .",
    "lint:fix": "prettier --write . && eslint . --fix"
  }
}
```

#### 4.2 Update .eslintignore

**IMPORTANT**: ESLint 9 flat config uses `ignores` in the config file.
You can delete `.eslintignore` after migrating patterns to `eslint.config.mjs`.

### Phase 5: Testing (30 min)

#### 5.1 Run Linter

```bash
npm run lint
```

Fix any errors that appear.

#### 5.2 Test Auto-Fix

```bash
npm run lint:fix
```

Verify no unexpected changes.

#### 5.3 Run Full Validation

```bash
npm run validate
```

This runs lint + type-check + tests.

#### 5.4 Test on Sample Files

```bash
# Test TypeScript linting
npx eslint src/lib/shared/**/*.ts

# Test Svelte linting
npx eslint src/lib/modules/**/*.svelte

# Test specific file
npx eslint src/lib/shared/foundation/ui/SidePanel.svelte
```

### Phase 6: CI/CD Updates (15 min)

#### 6.1 Update GitHub Actions

No changes typically needed - same `npm run lint` command.

#### 6.2 Update Pre-commit Hooks

If using pre-commit hooks, verify they still work:

```bash
git add .
git commit -m "test commit"
```

### Phase 7: Cleanup (10 min)

#### 7.1 Remove Old Config

```bash
rm .eslintrc.cjs
rm .eslintignore  # If all patterns moved to eslint.config.mjs
```

#### 7.2 Update Documentation

Update any docs that reference ESLint config.

## Rollback Plan

If migration fails:

```bash
# Revert changes
git reset --hard origin/main

# Or go back to backup
mv .eslintrc.cjs.backup .eslintrc.cjs

# Reinstall old versions
npm install --save-dev \
  eslint@^8.57.1 \
  @typescript-eslint/eslint-plugin@^6.21.0 \
  @typescript-eslint/parser@^6.21.0
```

## Common Issues & Solutions

### Issue 1: "Cannot find module 'typescript-eslint'"

**Solution**: Install the new `typescript-eslint` package:

```bash
npm install --save-dev typescript-eslint
```

### Issue 2: Plugins not loading

**Solution**: Update plugin imports in flat config:

```javascript
// Old (.eslintrc.cjs)
plugins: ['@typescript-eslint']

// New (eslint.config.mjs)
import tseslint from 'typescript-eslint';
plugins: {
  '@typescript-eslint': tseslint.plugin,
}
```

### Issue 3: Parser errors with .svelte files

**Solution**: Ensure proper parser configuration:

```javascript
{
  files: ['**/*.svelte'],
  languageOptions: {
    parser: svelte.parser,
    parserOptions: {
      parser: tseslint.parser,
      extraFileExtensions: ['.svelte'],
    },
  },
}
```

### Issue 4: TypeScript project reference errors

**Solution**: Verify `parserOptions.project` path:

```javascript
parserOptions: {
  project: './tsconfig.json',  // Correct path from root
}
```

## Resources

- [ESLint 9 Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
- [Flat Config Documentation](https://eslint.org/docs/latest/use/configure/configuration-files)
- [TypeScript ESLint v8 Migration](https://typescript-eslint.io/blog/announcing-typescript-eslint-v8/)
- [Svelte ESLint Plugin Flat Config](https://sveltejs.github.io/eslint-plugin-svelte/user-guide/#usage)
- [Config Migration Tool](https://github.com/eslint/migrate-config)

## Timeline

| Phase               | Duration        | Dependencies     |
| ------------------- | --------------- | ---------------- |
| Preparation         | 30 min          | -                |
| Update Dependencies | 15 min          | Node.js 18.18.0+ |
| Create Flat Config  | 60 min          | Migration tool   |
| Update Scripts      | 10 min          | New config       |
| Testing             | 30 min          | All above        |
| CI/CD Updates       | 15 min          | Testing complete |
| Cleanup             | 10 min          | All above        |
| **Total**           | **2.5-3 hours** | -                |

## Success Criteria

✅ All linting passes: `npm run lint`
✅ Auto-fix works: `npm run lint:fix`
✅ Build succeeds: `npm run build`
✅ Tests pass: `npm test`
✅ TypeScript checking: `npm run check`
✅ CI/CD pipelines pass
✅ No new warnings/errors introduced
✅ Team members can lint locally

## Post-Migration

After successful migration:

1. **Update team** - Notify team of config changes
2. **Document** - Add notes to CONTRIBUTING.md
3. **Monitor** - Watch for issues in next few commits
4. **Optimize** - Fine-tune rules based on team feedback
5. **Renovate** - Configure Renovate to keep ESLint updated

## Score Impact

Completing ESLint 9 migration: **+2 points** → Dependency Audit Score: 98/100

## Notes

- ESLint 9 is the future - ESLint 8 will reach EOL eventually
- Flat config is simpler once you learn it
- Better performance on large codebases like this one
- Some plugins may not support flat config yet - check compatibility first
- The migration tool helps, but manual review is recommended

## When to Migrate

**Recommended timing:**

- ✅ After completing other dependency updates
- ✅ Before major feature work
- ✅ During a sprint with lighter workload
- ❌ Not right before a release
- ❌ Not during critical bug fixes

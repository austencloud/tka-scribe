# Agent Task: Fix All Unused Variables

## Objective

Fix all `no-unused-vars` and `@typescript-eslint/no-unused-vars` errors in the codebase.

## Instructions

1. Run `npm run lint` to see all current linting errors
2. Focus ONLY on errors with rule IDs:
   - `no-unused-vars`
   - `@typescript-eslint/no-unused-vars`

3. For each unused variable error:
   - If the variable is truly unused: **Remove it completely**
   - If it's a parameter that must exist but isn't used: Prefix with underscore (e.g., `error` → `_error`)
   - If it's in a destructuring pattern and not needed: Use rest syntax to exclude it

4. **IMPORTANT**: Do NOT fix any other types of errors. Only fix unused variable errors.

5. After fixing, run `npm run lint` again to verify your fixes didn't introduce new errors.

## Examples

### Example 1: Unused catch parameter

```typescript
// BEFORE
} catch (error) {
  console.log("Failed");
}

// AFTER
} catch (_error) {
  console.log("Failed");
}
```

### Example 2: Truly unused variable

```typescript
// BEFORE
const navigationState = useNavigationState();
const theme = useTheme();
// only theme is used below

// AFTER
const theme = useTheme();
// removed navigationState completely
```

### Example 3: Unused destructured property

```typescript
// BEFORE
const { field, value, ...rest } = props;
// field and value are never used

// AFTER
const { ...rest } = props;
```

## Success Criteria

- All `no-unused-vars` errors are resolved
- No new errors were introduced
- Code still functions correctly

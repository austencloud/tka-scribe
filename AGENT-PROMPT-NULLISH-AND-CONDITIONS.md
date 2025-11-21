# Agent Task: Fix Nullish Coalescing and Unnecessary Conditions

## Objective

Fix all linting issues related to:

- `@typescript-eslint/prefer-nullish-coalescing`
- `@typescript-eslint/no-unnecessary-condition`

## Instructions

1. Run `npm run lint` to see all current errors
2. Focus ONLY on the errors listed above
3. Apply the appropriate fix for each error type

## Fix 1: Prefer Nullish Coalescing Operator (`??`)

### Understanding the Difference

- `||` is falsy-based: treats `0`, `""`, `false`, `null`, `undefined` as falsy
- `??` is nullish-based: only treats `null` and `undefined` as nullish

### Common Fixes

```typescript
// BEFORE - Using || (can cause bugs)
const port = config.port || 3000; // Bug: if port is 0, uses 3000!
const name = user.name || "Anonymous"; // Bug: if name is "", uses "Anonymous"!

// AFTER - Using ?? (correct behavior)
const port = config.port ?? 3000; // Only uses 3000 if port is null/undefined
const name = user.name ?? "Anonymous"; // Only uses "Anonymous" if name is null/undefined
```

### Assignment Form

```typescript
// BEFORE
value = value || defaultValue;

// AFTER
value ??= defaultValue;
// Equivalent to: value = value ?? defaultValue
```

### When NOT to use `??`

```typescript
// Keep || when you WANT to treat falsy values as "use default"
const shouldEnable = config.enabled || false; // OK if "" should mean false
const count = input.count || 0; // OK if "" should mean 0

// But if you only want null/undefined to trigger default:
const shouldEnable = config.enabled ?? false;
const count = input.count ?? 0;
```

## Fix 2: Remove Unnecessary Conditions

### Type 1: Conditions that are always true/false

```typescript
// BEFORE
const value: string = "hello";
if (value !== undefined) {
  // Always true! value is typed as string, never undefined
  doSomething(value);
}

// AFTER
const value: string = "hello";
doSomething(value);
```

### Type 2: Redundant null checks

```typescript
// BEFORE
function process(value: string) {
  // value is non-nullable
  if (value === null) {
    // Unnecessary! value can't be null
    return;
  }
  return value.toUpperCase();
}

// AFTER
function process(value: string) {
  return value.toUpperCase();
}
```

### Type 3: Conditions on optional properties (False Positive)

```typescript
// If you get this error but the check IS necessary, the type might be wrong
interface User {
  name: string; // Not optional
  email?: string; // Optional
}

// This is CORRECT - email can be undefined
if (user.email !== undefined) {
  sendEmail(user.email);
}

// If ESLint complains it's unnecessary, check if the type is accurate
// The property might need to be marked as optional with `?`
```

## When to Keep Conditions

Sometimes ESLint may flag a condition as unnecessary when it's actually needed:

1. **Union types with complex control flow**
2. **Type narrowing across function boundaries**
3. **Runtime validation** of data from external sources

If you're certain the condition is needed, you can:

```typescript
// Add a comment explaining why
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (value !== null) {
  // Runtime data may not match type
  process(value);
}
```

## Best Practices

1. **Use `??` for null/undefined checks** - it's more precise than `||`
2. **Trust your types** - if TypeScript says a condition is unnecessary, it probably is
3. **Fix the type definition** if a necessary check is flagged as unnecessary
4. **Use `??=` for default assignment** - it's cleaner and more efficient

## Success Criteria

- All `prefer-nullish-coalescing` warnings are resolved
- All `no-unnecessary-condition` warnings are resolved
- Code logic is preserved (no behavior changes)
- Types are accurate and reflect runtime reality
- No new errors were introduced

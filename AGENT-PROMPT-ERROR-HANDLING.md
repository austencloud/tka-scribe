# Agent Task: Fix Error Handling Issues

## Objective

Fix all error handling related linting issues including:

- `@typescript-eslint/only-throw-error`
- `@typescript-eslint/prefer-promise-reject-errors`
- `no-empty` (empty catch blocks)

## Instructions

1. Run `npm run lint` to see all current errors
2. Focus ONLY on error handling errors listed above
3. Apply the appropriate fix for each error type

## Common Error Handling Fixes

### Fix 1: Only Throw Error Objects

```typescript
// BEFORE
throw "Something went wrong";
throw { message: "Error occurred" };
throw 404;

// AFTER
throw new Error("Something went wrong");
throw new Error("Error occurred");
throw new Error("Not found (404)");
```

### Fix 2: Proper Error Classes

```typescript
// BEFORE
if (!user) {
  throw "User not found";
}

// AFTER - Option 1: Use built-in Error
if (!user) {
  throw new Error("User not found");
}

// AFTER - Option 2: Custom error class (preferred for domain errors)
class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User not found: ${userId}`);
    this.name = "UserNotFoundError";
  }
}

if (!user) {
  throw new UserNotFoundError(userId);
}
```

### Fix 3: Promise Rejection Errors

```typescript
// BEFORE
return Promise.reject("Failed to load");
reject({ error: "Failed" });

// AFTER
return Promise.reject(new Error("Failed to load"));
reject(new Error("Failed"));
```

### Fix 4: Empty Catch Blocks

```typescript
// BEFORE
try {
  riskyOperation();
} catch (e) {
  // empty - BAD!
}

// AFTER - Option 1: At minimum, log the error
try {
  riskyOperation();
} catch (error) {
  console.error("Failed to perform risky operation:", error);
}

// AFTER - Option 2: If you truly want to ignore (rare)
try {
  riskyOperation();
} catch (_error) {
  // Intentionally ignoring errors from optional operation
}
```

### Fix 5: Proper Error Typing in Catch

```typescript
// BEFORE
try {
  await fetchData();
} catch (err: any) {
  console.log(err.message);
}

// AFTER
try {
  await fetchData();
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error("An unknown error occurred:", error);
  }
}
```

## Best Practices

1. **Always throw Error objects** - they provide stack traces
2. **Never leave catch blocks empty** - at minimum log the error
3. **Type your errors properly** - use `unknown` in catch, then type guard
4. **Create custom error classes** for domain-specific errors
5. **Include context in error messages** - help with debugging

## Error Message Guidelines

- Be specific about what failed
- Include relevant context (IDs, names, etc.)
- Don't expose sensitive data in error messages
- Use consistent error message format

## Success Criteria

- All error handling errors are resolved
- All thrown values are Error objects
- No empty catch blocks (unless documented)
- Error handling is consistent across the codebase
- No new errors were introduced

# Agent Task: Fix TypeScript Type Safety Issues

## Objective

Fix all unsafe TypeScript type issues including:

- `@typescript-eslint/no-unsafe-assignment`
- `@typescript-eslint/no-unsafe-member-access`
- `@typescript-eslint/no-unsafe-argument`
- `@typescript-eslint/no-unsafe-call`
- `@typescript-eslint/no-explicit-any`

## Instructions

1. Run `npm run lint` to see all current errors
2. Focus ONLY on the unsafe TypeScript errors listed above
3. For each error, apply the appropriate fix strategy below

## Fix Strategies

### Strategy 1: Add Proper Type Annotations

```typescript
// BEFORE
const data: any = await response.json();
doSomething(data.user);

// AFTER
interface ResponseData {
  user: User;
}
const data: ResponseData = await response.json();
doSomething(data.user);
```

### Strategy 2: Use Type Guards

```typescript
// BEFORE
function process(value: unknown) {
  return value.toString(); // unsafe member access
}

// AFTER
function process(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  return String(value);
}
```

### Strategy 3: Use Type Assertions (when you're certain)

```typescript
// BEFORE
const element: any = document.querySelector(".my-class");

// AFTER
const element = document.querySelector(".my-class") as HTMLElement;
// Or better:
const element = document.querySelector(".my-class");
if (element instanceof HTMLElement) {
  // use element safely here
}
```

### Strategy 4: Replace `any` with `unknown` + Type Guards

```typescript
// BEFORE
function handle(event: any) {
  console.log(event.target.value);
}

// AFTER
function handle(event: unknown) {
  if (event && typeof event === "object" && "target" in event) {
    const target = event.target;
    if (target && typeof target === "object" && "value" in target) {
      console.log(target.value);
    }
  }
}
```

### Strategy 5: For Window/Global Objects

```typescript
// BEFORE
(window as any).__MY_GLOBAL__ = value;

// AFTER
declare global {
  interface Window {
    __MY_GLOBAL__?: MyType;
  }
}
window.__MY_GLOBAL__ = value;
```

## **IMPORTANT**

- Avoid using `any` type - use `unknown` instead and add type guards
- Avoid using `as any` casts - they defeat TypeScript's purpose
- If you must use `any`, add a comment explaining why it's necessary
- Don't just suppress errors with `// eslint-disable` - actually fix the types

## Success Criteria

- All unsafe TypeScript errors are resolved
- Types are properly defined
- Code is more type-safe
- No new errors were introduced

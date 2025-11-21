# Agent Task: Fix Accessibility (a11y) Issues

## Objective

Fix all accessibility-related linting errors and warnings including:

- `svelte/no-at-html-tags`
- `a11y_no_noninteractive_tabindex`
- `svelte/valid-compile` (a11y-related)
- Any other a11y warnings

## Instructions

1. Run `npm run lint` to see all current errors
2. Focus ONLY on accessibility (a11y) errors
3. Apply the appropriate fix for each type of a11y issue

## Common A11y Fixes

### Fix 1: `{@html}` Tags (XSS Risk)

```svelte
<!-- AFTER - Option 1: Sanitize the HTML -->
<script>
  import DOMPurify from "dompurify";
  const safeContent = DOMPurify.sanitize(unsafeContent);
</script>

<!-- BEFORE -->
<div>{@html unsafeContent}</div>
<div>{@html safeContent}</div>

<!-- AFTER - Option 2: If content is trusted/static, add comment -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div>{@html trustedStaticContent}</div>
```

### Fix 2: Non-interactive Elements with tabIndex

```svelte
<!-- BEFORE -->
<div tabindex="0" on:click={handleClick}>Click me</div>

<!-- AFTER - Option 1: Use a button -->
<button on:click={handleClick}> Click me </button>

<!-- AFTER - Option 2: Add role if div is necessary -->
<div
  role="button"
  tabindex="0"
  on:click={handleClick}
  on:keypress={handleKeyPress}
>
  Click me
</div>
```

### Fix 3: Missing Interactive Handlers

If you add `tabindex` to make something focusable, you must also:

1. Add appropriate ARIA role
2. Add keyboard event handlers (Enter/Space)

```svelte
<script>
  function handleClick() {
    /* ... */
  }
  function handleKeyPress(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  }
</script>

<div
  role="button"
  tabindex="0"
  on:click={handleClick}
  on:keypress={handleKeyPress}
>
  Interactive element
</div>
```

### Fix 4: Custom Element Props

```svelte
<!-- BEFORE -->
<script>
  let props = $props();
</script>

<!-- AFTER - Explicitly destructure props for custom elements -->
<script>
  let { prop1, prop2, ...rest } = $props();
</script>
```

## Guidelines

- **Prefer semantic HTML**: Use `<button>` instead of `<div role="button">`
- **Always add keyboard support**: If it's clickable, it should work with Enter/Space
- **Sanitize user-generated content**: Never use `{@html}` with unsanitized user input
- **Document exceptions**: If you must ignore an a11y rule, add a comment explaining why

## Success Criteria

- All a11y errors and warnings are resolved
- Interactive elements are keyboard-accessible
- No XSS vulnerabilities from `{@html}`
- No new errors were introduced

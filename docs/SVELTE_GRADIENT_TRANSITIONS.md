# Svelte 5 Gradient Transitions - The Right Way

## The Problem with Generic CSS Approaches

Most CSS gradient transition tutorials use the `::before` pseudo-element technique like this:

```css
.element {
  background: var(--color);
}

.element::before {
  background: var(--color); /* ⚠️ BROKEN IN SVELTE! */
  opacity: 0;
  transition: opacity 0.8s;
}

.element.transitioning::before {
  opacity: 1;
}
```

**Why this FAILS in Svelte:**

When Svelte updates a reactive CSS variable (`--color`), it updates **BOTH** the main background AND the `::before` background **simultaneously**. So when you fade in the `::before`, you're revealing the SAME gradient, not creating a crossfade!

```
Initial:     background: gradient-A    ::before: gradient-A (hidden)
Color changes: ⚡ INSTANT UPDATE ⚡
After update:  background: gradient-B    ::before: gradient-B (still hidden)
Fade in:       Shows gradient-B         Fades in gradient-B
Result:        NO CROSSFADE! Both are already gradient-B!
```

## The Svelte 5 Solution: Separate CSS Variables

Use **TWO** CSS variables - one for current color, one for previous color:

### Implementation

```svelte
<script lang="ts">
  const { color = "#3b82f6" } = $props<{ color?: string }>();

  let cardElement: HTMLDivElement | null = $state(null);
  let previousColor = $state(color);

  onMount(() => {
    previousColor = color; // Initialize on mount
  });

  $effect(() => {
    if (color !== previousColor && cardElement) {
      // Trigger transition
      cardElement.classList.add('transitioning');

      // Reset after transition completes
      setTimeout(() => {
        cardElement?.classList.remove('transitioning');
        previousColor = color; // ✅ Update AFTER transition
      }, 800);
    }
  });
</script>

<div
  bind:this={cardElement}
  class="card"
  style="--current-color: {color}; --prev-color: {previousColor};"
>
  Content here
</div>

<style>
  .card {
    position: relative;
    background: var(--current-color); /* NEW gradient shows here */
    transition: box-shadow 0.3s; /* Don't transition background! */
  }

  .card::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--prev-color, var(--current-color)); /* OLD gradient */
    opacity: 1; /* Start VISIBLE */
    z-index: -1;
    transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  :global(.card.transitioning)::before {
    opacity: 0; /* Fade OUT old gradient to reveal new */
  }
</style>
```

## How It Works - Step by Step

### Initial State
```
--current-color: gradient-A
--prev-color: gradient-A

.card { background: gradient-A }  ← visible
.card::before {
  background: gradient-A;  ← visible (opacity: 1)
  z-index: -1              ← behind content
}
```
Everything looks like gradient-A (both layers match).

### Color Changes (Svelte prop update)
```
--current-color: gradient-B  ← ✅ Updates instantly
--prev-color: gradient-A     ← ✅ STAYS old value

.card { background: gradient-B }      ← hidden under ::before
.card::before {
  background: gradient-A;     ← still old gradient
  opacity: 1                  ← still visible
}
```
User still sees gradient-A because `::before` is on top.

### Add "transitioning" Class
```
.card::before { opacity: 1 → 0 } ← CSS transition starts
```
Over 0.8 seconds, `::before` fades out, revealing gradient-B underneath.

**Visual effect:** Smooth crossfade from gradient-A to gradient-B!

### After Transition (setTimeout completes)
```
Remove "transitioning" class
Update previousColor = color  ← Now both match again

--current-color: gradient-B
--prev-color: gradient-B

.card { background: gradient-B }
.card::before {
  background: gradient-B;  ← updated via CSS variable
  opacity: 1               ← back to default
}
```
Reset and ready for next color change.

## Critical Svelte-Specific Details

### 1. Update Previous Color AFTER Transition

```typescript
// ❌ WRONG - Updates too early
$effect(() => {
  previousColor = color; // Breaks immediately
  cardElement.classList.add('transitioning');
});

// ✅ CORRECT - Updates after crossfade
$effect(() => {
  if (color !== previousColor && cardElement) {
    cardElement.classList.add('transitioning');
    setTimeout(() => {
      previousColor = color; // Update AFTER transition
    }, 800);
  }
});
```

### 2. Initialize Previous Color on Mount

```typescript
let previousColor = $state(color); // Declare with initial value

onMount(() => {
  previousColor = color; // Ensure it's set before any $effects run
});
```

Without this, first render might flash or glitch.

### 3. Use :global() for Dynamic Classes

```css
/* ❌ WRONG - Svelte scoping breaks this */
.card.transitioning::before {
  opacity: 0;
}

/* ✅ CORRECT - :global() for dynamically added classes */
:global(.card.transitioning)::before {
  opacity: 0;
}
```

Svelte's CSS scoping doesn't track classes added via JavaScript, so you need `:global()`.

### 4. Fallback for First Render

```css
.card::before {
  background: var(--prev-color, var(--current-color));
}
```

The `, var(--current-color)` fallback handles the first render when `--prev-color` might not be set.

## Why This Works in Svelte 5

1. **$state reactivity** - `previousColor` is a separate reactive value that doesn't auto-update with `color`
2. **Manual updates** - We control WHEN `previousColor` updates via `setTimeout`
3. **CSS variable isolation** - `--current-color` and `--prev-color` are independent
4. **$effect timing** - Svelte 5 effects run after DOM updates, perfect for class manipulation

## Performance Characteristics

- **GPU-accelerated** - Opacity transitions use GPU, not CPU
- **No layout thrashing** - No reflows or repaints except opacity
- **Minimal JavaScript** - Just class toggling and state updates
- **Fine-grained reactivity** - Svelte 5 signals track exact dependencies

## Browser Support

- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ No polyfills needed
- ⚠️ Requires CSS custom properties (IE11 not supported)

## Alternative: Svelte Transition Directive

For simpler cases, you can use Svelte's built-in transitions:

```svelte
<script>
  import { fade, crossfade } from 'svelte/transition';
  const [send, receive] = crossfade({});
</script>

{#key color}
  <div in:receive={{key: color}} out:send={{key: color}} style="background: {color}">
    Content
  </div>
{/key}
```

But this **recreates the DOM element**, which is expensive for complex components.

## Alternative: CSS Houdini @property

For modern browsers only (Chrome/Edge 85+):

```css
@property --color-start {
  syntax: '<color>';
  initial-value: transparent;
  inherits: false;
}

@property --color-end {
  syntax: '<color>';
  initial-value: transparent;
  inherits: false;
}

.card {
  background: linear-gradient(var(--color-start), var(--color-end));
  transition: --color-start 0.8s, --color-end 0.8s;
}
```

```svelte
<div class="card" style="--color-start: {startColor}; --color-end: {endColor}">
```

This actually animates the colors smoothly but **doesn't work in Firefox or Safari** (as of Oct 2025).

## Debugging Checklist

If your gradient transitions aren't working:

1. ✅ Check console logs - You should see "🎨 Gradient crossfade..." messages
2. ✅ Inspect DevTools - Verify `::before` element exists
3. ✅ Check CSS variables - `--current-color` and `--prev-color` should be different during transition
4. ✅ Watch opacity - `::before` opacity should go 1 → 0 over 0.8s
5. ✅ Verify :global() - Class selector must use `:global()` wrapper
6. ✅ Check timing - setTimeout duration should match CSS transition
7. ✅ Test z-index - `::before` should be `z-index: -1` to stay behind content

## Common Mistakes

### Mistake #1: Using Same Variable for Both

```css
/* ❌ BROKEN */
.card { background: var(--color); }
.card::before { background: var(--color); } /* Same variable! */
```

Both update instantly = no crossfade.

### Mistake #2: Updating Previous Too Early

```typescript
// ❌ BROKEN
$effect(() => {
  previousColor = color; // Updates before transition!
  setTimeout(() => {
    cardElement?.classList.add('transitioning');
  }, 0);
});
```

By the time transition starts, both colors are the same.

### Mistake #3: Wrong Opacity Direction

```css
/* ❌ CONFUSING */
.card::before { opacity: 0; } /* Start hidden */
:global(.card.transitioning)::before { opacity: 1; } /* Fade in */
```

This fades in the OLD gradient on top of the NEW one. Backwards!

### Mistake #4: Forgetting :global()

```css
/* ❌ DOESN'T WORK */
.card.transitioning::before { opacity: 0; }
```

Svelte scoping breaks dynamically added classes.

## Conclusion

The key to gradient transitions in Svelte 5:

1. **Separate CSS variables** for current and previous values
2. **Update previous AFTER** the transition completes
3. **Fade OUT the ::before** to reveal new background
4. **Use :global()** for dynamically added classes

This pattern works beautifully with Svelte's reactivity system and provides smooth, GPU-accelerated gradient crossfades with minimal overhead.

## See Also

- [CSS_GRADIENT_ANIMATION_EXPLAINED.md](./CSS_GRADIENT_ANIMATION_EXPLAINED.md) - General CSS gradient approaches
- [Svelte 5 Runes Documentation](https://svelte.dev/docs/svelte/$state)
- [Svelte Transition API](https://svelte.dev/docs/svelte/svelte-transition)

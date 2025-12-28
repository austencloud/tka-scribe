# Unified Panel Background System

## Problem

Panels across the app had inconsistent backgrounds:
- Some used glassmorphism blur effects (`backdrop-filter: blur(24px)`)
- Some used solid dark backgrounds
- Some used complex gradients with color mixing
- Some used semi-transparent colors
- No consistent pattern

## Solution: Use Theme Variables

All panels should use the CSS variable system established by `background-theme-calculator.ts`.

### Panel Background Hierarchy

**1. Main Panels (full-screen content areas)**
```css
background: var(--theme-panel-bg, rgba(18, 18, 28, 0.98));
```
- Example: ShareHub, Settings Module, Feedback Module
- Solid, adapts to background luminance
- No blur

**2. Cards/Sub-panels (nested content)**
```css
background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
```
- Example: FeedbackForm, Option cards, Settings cards
- Subtle, slightly lighter than panel background
- No blur

**3. Hover States**
```css
border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.15));
```
- Consistent hover feedback across all panels

### Override Drawer Glassmorphism

For drawers that should NOT have blur (most of them), override the defaults:

```css
:global(.your-drawer-class) {
  --sheet-bg: var(--theme-panel-bg, rgba(18, 18, 28, 0.98));
  --sheet-filter: none; /* Disable blur */
}
```

### When to Use Blur (Rarely)

Glassmorphism blur should ONLY be used for:
- Modal backdrops (dim the content behind)
- Special overlay effects where transparency is intentional

**Do NOT use blur for:**
- Content panels (feedback, settings, share hub)
- Drawers with substantive content
- Forms or interactive surfaces

## Benefits

1. **Consistency** - All panels look and feel the same
2. **Performance** - No expensive blur calculations
3. **Accessibility** - Better contrast, easier to read
4. **Maintainability** - One system, defined in one place
5. **Theme-aware** - Automatically adapts to background changes

## Migration Checklist

When updating a panel:
- [ ] Remove `backdrop-filter` and `-webkit-backdrop-filter` unless absolutely necessary
- [ ] Replace custom background colors with `var(--theme-panel-bg)` or `var(--theme-card-bg)`
- [ ] Replace custom border colors with `var(--theme-stroke)`
- [ ] Test against different backgrounds to ensure good contrast
- [ ] Verify hover states use `var(--theme-stroke-strong)`

## Examples

### ✅ Good - ShareHub Panel
```css
.share-hub-panel {
  background: var(--theme-panel-bg, rgba(20, 20, 20, 0.98));
}
```

### ✅ Good - Feedback Form (after fix)
```css
.feedback-form {
  background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
  border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
}
```

### ✅ Good - Quick Feedback Drawer (after fix)
```css
:global(.quick-feedback-drawer) {
  --sheet-bg: var(--theme-panel-bg, rgba(18, 18, 28, 0.98));
  --sheet-filter: none;
}
```

### ❌ Bad - Old Feedback Form
```css
.feedback-form {
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--active-type-color) 6%, rgba(22, 22, 32, 0.95)),
    color-mix(in srgb, var(--active-type-color) 3%, rgba(18, 18, 28, 0.98))
  );
}
```

### ❌ Bad - Drawer with blur by default
```css
.drawer-content {
  backdrop-filter: blur(24px); /* Too expensive, poor UX */
}
```

## Related Files

- `src/lib/shared/settings/utils/background-theme-calculator.ts` - Theme variable generator
- `src/lib/shared/settings/design-tokens/settings-tokens.css` - Static tokens
- `src/lib/shared/foundation/ui/drawer/Drawer.css` - Drawer defaults
- `CLAUDE.md` - CSS Variable Hierarchy section

# HMR Improvements

## Summary

Your HMR configuration is **well-designed**, but Svelte 5's HMR has known limitations with certain code changes. This document explains what happened and the improvements made.

## The Issue

You experienced an HMR failure when refactoring `EditSlidePanel.svelte` with these changes:
1. **Removed event handlers** (`ontouchstart`, `ontouchmove`, `ontouchend`)
2. **Removed import** (`createEditSlidePanelState`)
3. **Removed binding** (`bind:this={panelState.panelElement}`)
4. **Structural changes** (removed gesture handling wrapper div)

These are **known HMR edge cases** in Svelte 5 where HMR can silently fail.

## Root Cause: Svelte 5 HMR Limitations

Svelte 5's HMR struggles with:
- ❌ Event handler changes (adding/removing DOM event listeners)
- ❌ Import changes (removing imports breaks module graph)
- ❌ Binding changes (two-way bindings are stateful)
- ❌ Major template restructuring (DOM structure changes)

Your config correctly **only forces full reload** for critical state files. Regular components should use HMR, but edge cases like yours slip through.

## Improvements Made

### 1. Enhanced Logging (`vite.config.ts`)
```typescript
// Now logs ALL HMR updates in dev mode
if (isDev) {
  console.log(`[⚡ HMR] ${fileName}`);
}
```

**Benefit**: You can see when HMR fires in the console. If you don't see a log after saving, HMR failed silently.

### 2. HMR Helper Utility (`src/lib/shared/dev/hmr-helper.ts`)

Added development utilities:
- **`Ctrl+Shift+R`** - Quick keyboard shortcut for hard reload
- **`window.__TKA_RELOAD()`** - Console command for reload
- Only loaded in dev mode (zero production overhead)

**Usage**:
```javascript
// In browser console when HMR seems broken:
window.__TKA_RELOAD()

// Or just press: Ctrl+Shift+R
```

### 3. Updated Documentation (`DEV-NOTES.md`)

Added section on HMR limitations and quick fixes:
- Known edge cases that break HMR
- Quick reload shortcuts
- When to use `npm run dev:turbo`

### 4. Automatic Setup (`src/routes/+layout.svelte`)

HMR helpers now auto-load on dev server start. You'll see:
```
[HMR Helper] Dev utilities loaded:
  - window.__TKA_RELOAD() - Force full reload
  - Ctrl+Shift+R - Hard reload shortcut
```

## When to Manual Reload

**Quick reload needed** (`Ctrl+Shift+R`):
- Event handler changes (onclick, ontouchstart, etc.)
- Import additions/removals
- Binding changes (bind:this, bind:value)
- Major template restructuring

**Full restart needed** (`npm run dev:turbo`):
- Vite cache corruption
- Dependency updates
- Build configuration changes

## Why Not Auto-Detect and Force Reload?

**Considered but rejected** because:
1. **Performance**: Reading file contents on every change adds latency
2. **False positives**: Would trigger too many unnecessary reloads
3. **Complexity**: Pattern matching is fragile and hard to maintain
4. **Better DX**: Teaching users when to reload is clearer than magic

The **keyboard shortcut** approach is:
- ✅ Fast (instant reload)
- ✅ User-controlled (no surprise reloads)
- ✅ Simple (just one key combo to remember)
- ✅ Discoverable (logged on dev server start)

## Technical Details

### Your Current Force-Reload Patterns
Only these trigger automatic full reload:
- `**/app-state**`
- `**/navigation-state**`
- `**/ui-state**`
- `**/BackgroundCanvas**`

**This is correct** - these are critical global state files that MUST reload.

### Svelte 5 HMR Behavior
- ✅ **Works great**: CSS, props, derived state, component logic
- ⚠️ **Edge cases**: Event handlers, imports, bindings, template structure
- ❌ **Always fails**: Top-level state mutations (hence your force-reload list)

## Recommendation

**Your approach is optimal**. The improvements give you:
1. Visibility into when HMR fires
2. Quick recovery when it doesn't
3. Documentation of known issues

**No further config changes needed**. Just remember `Ctrl+Shift+R` when things look weird!

---

*Last updated: 2025-01-XX*

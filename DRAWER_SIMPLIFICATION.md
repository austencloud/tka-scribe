# Drawer Component Simplification

## Problem
The drawer had become overly complex with:
- Complex scrollable parent detection
- Multiple touch/mouse handlers
- Complicated state management
- Conditional logic trying to be too smart about when to prevent default
- Touch action and overscroll behavior applied incorrectly

This led to unreliable behavior where swipe-to-dismiss would work once, then fail on subsequent attempts.

## Solution - Standard Web Best Practices

Based on web research (Chrome developers blog, MDN, CSS-Tricks), the standard approach is:

### 1. **Body-level Pull-to-Refresh Prevention**
```css
body {
  overscroll-behavior-y: contain;
}
```
Applied via JavaScript when drawer opens, removed when it closes.

### 2. **Simple Touch Handlers**
- Track only `startY`, `currentY`, and `startTime`
- No complex parent detection
- No conditional logic about scrollable elements
- Just: start → move → end

### 3. **Passive: False for preventDefault**
Added via `$effect` to allow `preventDefault()` in `touchmove`:
```javascript
drawerElement.addEventListener('touchmove', handleMove, { passive: false });
```

### 4. **Container Scroll Containment**
```css
.drawer-inner {
  overflow-y: auto;
  overscroll-behavior-y: contain;
}
```
Prevents scroll chaining from content to drawer to body.

## What Was Removed
- ❌ `findScrollableParent()` function
- ❌ Complex conditional logic in `handleTouchMove`
- ❌ Mouse drag handlers (not needed for mobile pull-to-refresh)
- ❌ Multiple placement support in touch handlers (simplified to bottom only)
- ❌ `touch-action` CSS (let browser handle it)
- ❌ Complex state reset logic

## What Remains
- ✅ Simple touch tracking
- ✅ Drag offset calculation
- ✅ Dismiss threshold (100px or fast swipe)
- ✅ Visual feedback during drag
- ✅ All CSS animations intact

## Result
~150 lines of complex touch handling → ~50 lines of simple, reliable code

The drawer now:
1. Prevents pull-to-refresh consistently
2. Works every time, not just once
3. Allows content scrolling normally
4. Dismisses with swipe down from anywhere
5. Is maintainable and understandable

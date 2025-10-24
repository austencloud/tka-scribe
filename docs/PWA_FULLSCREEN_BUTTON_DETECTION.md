# PWA Fullscreen Button Detection

## Overview

The fullscreen button is now automatically hidden when the app is running as a Progressive Web App (PWA), since PWAs already run in fullscreen/standalone mode by default.

## Implementation

### Detection Method

The app uses the `IMobileFullscreenService.isPWA()` method which checks:

1. **`window.matchMedia("(display-mode: standalone)").matches`** - Standard PWA detection
2. **`window.navigator.standalone === true`** - iOS Safari PWA detection
3. **`document.referrer.includes("android-app://")`** - Android TWA (Trusted Web Activity) detection

### Component Changes

**File**: `src/lib/shared/components/FullscreenButton.svelte`

The component now:
1. Resolves `IMobileFullscreenService` on mount
2. Checks `isPWA()` status
3. Only renders the button when:
   - Fullscreen API is supported **AND**
   - NOT running as a PWA

```typescript
// Service resolution
fullscreenService = resolve<IMobileFullscreenService>(
  TYPES.IMobileFullscreenService
);

// PWA detection
isPWA = fullscreenService.isPWA();
```

```svelte
<!-- Conditional rendering -->
{#if isSupported && !isPWA}
  <button class="fullscreen-button">
    <!-- Button content -->
  </button>
{/if}
```

## User Experience

### In Browser Mode (Mobile)
- ✅ Fullscreen button is **visible**
- User can manually enter/exit fullscreen
- Useful for getting rid of browser chrome (address bar, tabs, etc.)

### In PWA Mode (Installed)
- ✅ Fullscreen button is **hidden**
- App already runs in fullscreen/standalone mode
- No browser UI visible
- No need for manual fullscreen control

## Testing

### Test in Browser
1. Open the app in a mobile browser (Chrome, Safari, Firefox)
2. **Expected**: Fullscreen button appears in the UI
3. Tap it to enter fullscreen mode

### Test as PWA
1. Install the app via "Add to Home Screen"
2. Launch from home screen icon
3. **Expected**: Fullscreen button does NOT appear
4. App runs in full standalone mode automatically

### Console Verification

You can check PWA status in the browser console:

```javascript
// Check display mode
window.matchMedia("(display-mode: standalone)").matches
// Returns: true (PWA) or false (browser)

// Check iOS standalone
window.navigator.standalone
// Returns: true (iOS PWA) or undefined (browser)
```

## Related Services

- **`IMobileFullscreenService`** - Handles PWA detection and fullscreen API
- **`MobileFullscreenService`** - Implementation with comprehensive detection logic
- **`FullscreenHint`** - Already uses `isPWA()` to avoid showing hints in PWA mode

## Benefits

1. **Cleaner UI**: No unnecessary button in PWA mode
2. **Better UX**: Reduces visual clutter when fullscreen is automatic
3. **Smart Detection**: Works across iOS, Android, and desktop PWAs
4. **Consistent**: Aligns with other PWA-aware components like `FullscreenHint`

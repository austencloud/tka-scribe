# Desktop Navigation Sidebar Integration Guide

This guide explains how to integrate the new desktop navigation sidebar into MainInterface.svelte.

## Files Created

1. `src/lib/shared/navigation/components/DesktopNavigationSidebar.svelte` - The sidebar component
2. `src/lib/shared/layout/desktop-sidebar-state.svelte.ts` - State management
3. `src/lib/shared/navigation/services/desktop-sidebar-visibility.svelte.ts` - Visibility logic

## Integration Steps for MainInterface.svelte

### Step 1: Add Imports

After line 40 (after `import ModuleSwitcher...`), add:

```typescript
  import DesktopNavigationSidebar from "./navigation/components/DesktopNavigationSidebar.svelte";
  import { desktopSidebarState } from "./layout/desktop-sidebar-state.svelte";
  import { resolve, TYPES, type IDeviceDetector, type IViewportService } from "$shared";
  import { useDesktopSidebarVisibility } from "./navigation/services/desktop-sidebar-visibility.svelte";
```

### Step 2: Add State Management

After the `const moduleDefinitions = $derived(getModuleDefinitions());` line (around line 34), add:

```typescript
  // Desktop sidebar visibility management
  let desktopSidebarVisibility: ReturnType<typeof useDesktopSidebarVisibility> | null = null;
  const showDesktopSidebar = $derived(desktopSidebarState.isVisible);
```

### Step 3: Initialize Desktop Sidebar in onMount

Inside the `onMount` function (after line 93), add before the existing code:

```typescript
    // Initialize desktop sidebar visibility
    try {
      const deviceDetector = resolve<IDeviceDetector>(TYPES.IDeviceDetector);
      const viewportService = resolve<IViewportService>(TYPES.IViewportService);
      desktopSidebarVisibility = useDesktopSidebarVisibility(deviceDetector, viewportService);
    } catch (error) {
      console.warn("MainInterface: Failed to initialize desktop sidebar visibility", error);
    }
```

And update the return statement to cleanup:

```typescript
    return () => {
      desktopSidebarVisibility?.cleanup();
    };
```

### Step 4: Update CSS Variables

In the main div (line 107-112), update the style attribute to include sidebar width:

```svelte
<div
  class="main-interface"
  class:nav-landscape={layoutState.isPrimaryNavLandscape}
  class:has-desktop-sidebar={showDesktopSidebar}
  class:about-active={isAboutActive}
  style="--top-bar-height: {layoutState.topBarHeight}px; --primary-nav-height: {layoutState.primaryNavHeight}px; --desktop-sidebar-width: {desktopSidebarState.width}px;"
>
```

### Step 5: Add Desktop Sidebar Component

After the `ModuleSwitcher` component (after line 119), add:

```svelte
  <!-- Desktop Navigation Sidebar (only on desktop in side-by-side layout) -->
  {#if showDesktopSidebar}
    <DesktopNavigationSidebar
      currentModule={currentModule()}
      currentSection={currentSection()}
      modules={moduleDefinitions}
      onModuleChange={handleModuleChange}
      onSectionChange={handleSectionChange}
    />
  {/if}
```

### Step 6: Update CSS Styles

Add these CSS rules to the `<style>` section:

```css
  /* Desktop sidebar support */
  .main-interface.has-desktop-sidebar {
    padding-left: var(--desktop-sidebar-width, 280px);
  }

  .main-interface.has-desktop-sidebar .content-area {
    padding-left: 0;
  }

  /* Hide mobile/landscape navigation when desktop sidebar is visible */
  .main-interface.has-desktop-sidebar :global(.primary-navigation) {
    display: none;
  }

  /* Top bar offset when desktop sidebar is visible */
  .main-interface.has-desktop-sidebar :global(.top-bar) {
    left: var(--desktop-sidebar-width, 280px);
    width: calc(100% - var(--desktop-sidebar-width, 280px));
  }
```

## Testing

After integration, test the following scenarios:

1. **Desktop (width ≥ 1280px)**: Sidebar should be visible, mobile nav hidden
2. **Tablet (width < 1280px)**: Sidebar hidden, normal navigation visible
3. **Mobile**: Sidebar hidden, mobile navigation works normally
4. **Module switching**: Sidebar should expand/collapse modules correctly
5. **Tab switching**: Active states should update properly

## Features

- **2026 Modern Design**: Glassmorphism, smooth animations
- **Hierarchical Navigation**: Shows all modules and their tabs
- **Collapsible Sections**: Click modules to expand/collapse tabs
- **Active State Indicators**: Clear visual feedback
- **Responsive**: Only shows when appropriate (desktop + sufficient width)
- **Accessible**: Keyboard navigation, ARIA labels, focus states

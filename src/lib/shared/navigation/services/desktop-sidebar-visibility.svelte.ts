/**
 * Desktop Sidebar Visibility Service
 * Determines when the desktop navigation sidebar should be visible
 */

import type { IDeviceDetector } from "../../device/services/contracts/IDeviceDetector";
import type { IViewportService } from "../../device/services/contracts/IViewportService";
import {
  desktopSidebarState,
  updateDesktopSidebarVisibility,
} from "../../layout/desktop-sidebar-state.svelte";

/**
 * Hook to manage desktop sidebar visibility based on device and viewport
 */
export function useDesktopSidebarVisibility(
  deviceDetector: IDeviceDetector,
  viewportService: IViewportService
) {
  // Subscribe to viewport changes
  const unsubscribe = viewportService.onViewportChange(() => {
    updateVisibility();
  });

  // Initial update
  updateVisibility();

  function updateVisibility() {
    const isDesktop = deviceDetector.isDesktop();
    const viewportWidth = viewportService.width;

    // Check if we're in a module that uses side-by-side layout
    // For now, we'll use viewport width as a proxy
    // In the Create module, this would be determined by CreateModuleLayoutService
    const isSideBySideLayout = viewportWidth >= 1024;

    updateDesktopSidebarVisibility(
      isDesktop,
      viewportWidth,
      isSideBySideLayout
    );
  }

  return {
    get isVisible() {
      return desktopSidebarState.isVisible;
    },
    cleanup: unsubscribe,
  };
}

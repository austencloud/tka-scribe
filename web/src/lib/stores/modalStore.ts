// Modal Store Factory using Svelte 5 Runes
// Converts singleton class pattern to factory function for component-scoped state

import { browser } from "$app/environment";

export interface ResourceModalData {
  title: string;
  subtitle: string;
  creator: string;
  category: string;
  level: string;
  description: string;
  keywords: string;
  url: string;
  resourceName: string;
  tableOfContents: Array<{ id: string; label: string }>;
  relatedResources: Array<{
    name: string;
    url: string;
    description: string;
    type: "internal" | "external";
  }>;
  heroGradient: string;
  creatorColor: string;
}

// ============================================================================
// MODAL STATE INTERFACE
// ============================================================================

export interface ModalState {
  isOpen: boolean;
  resourceName: string | null;
  modalData: ResourceModalData | null;
}

// ============================================================================
// FACTORY FUNCTION (for use in .svelte files)
// ============================================================================

export function createModalManager(_initialState?: Partial<ModalState>) {
  // This will be called from within .svelte files where $state is available
  // The actual state creation happens in the component context

  return function createModalManagerWithState() {
    // This function should be called from within a .svelte file
    throw new Error(
      "createModalManager must be used within a .svelte file context. Use createModalState instead."
    );
  };
}

// ============================================================================
// MODAL ACTIONS (Pure functions)
// ============================================================================

export function openModal(resourceName: string) {
  if (browser) {
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    // Add to browser history for back button support
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("modal", resourceName);
    window.history.pushState(
      { modal: resourceName },
      "",
      currentUrl.toString()
    );
  }
}

export function closeModal() {
  if (browser) {
    // Restore body scroll
    document.body.style.overflow = "";

    // Handle browser history
    const currentUrl = new URL(window.location.href);
    if (currentUrl.searchParams.has("modal")) {
      currentUrl.searchParams.delete("modal");
      window.history.replaceState({}, "", currentUrl.toString());
    }
  }
}

// ============================================================================
// BROWSER EVENT HANDLERS
// ============================================================================

export function initializeModalEventHandlers(
  isOpen: () => boolean,
  onClose: () => void
) {
  if (browser) {
    // Handle browser back button
    window.addEventListener("popstate", (event) => {
      if (isOpen() && !event.state?.modal) {
        onClose();
      }
    });

    // Handle escape key
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) {
        onClose();
      }
    });
  }
}

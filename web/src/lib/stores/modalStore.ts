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
// FACTORY FUNCTION
// ============================================================================

export function createModalManager() {
  const state = $state({
    isOpen: false,
    resourceName: null as string | null,
    modalData: null as ResourceModalData | null,
  });

  function openModal(resourceName: string) {
    state.resourceName = resourceName;
    state.isOpen = true;

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

  function closeModal() {
    state.isOpen = false;
    state.resourceName = null;
    state.modalData = null;

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

  function setModalData(data: ResourceModalData) {
    state.modalData = data;
  }

  // Initialize browser event listeners
  function initialize() {
    if (browser) {
      // Handle browser back button
      window.addEventListener("popstate", (event) => {
        if (state.isOpen && !event.state?.modal) {
          closeModal();
        }
      });

      // Handle escape key
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && state.isOpen) {
          closeModal();
        }
      });
    }
  }

  return {
    // State access (reactive)
    get isOpen() {
      return state.isOpen;
    },
    get resourceName() {
      return state.resourceName;
    },
    get modalData() {
      return state.modalData;
    },

    // Actions
    openModal,
    closeModal,
    setModalData,
    initialize,
  };
}

// Export singleton for backward compatibility
// TODO: Replace with factory function usage in components
export const modalManager = createModalManager();

// Initialize browser features
if (browser) {
  modalManager.initialize();
}

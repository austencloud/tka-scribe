/**
 * Profile Settings State Management
 *
 * Centralized state for the profile settings feature.
 * Handles form state, UI state, and viewport adaptivity.
 */

import { authStore } from "$shared/auth";

// ============================================================================
// FORM STATE
// ============================================================================

export const personalInfoState = $state({
  displayName: "",
  email: "",
});

export const passwordState = $state({
  current: "",
  new: "",
  confirm: "",
});

// ============================================================================
// UI STATE
// ============================================================================

export const uiState = $state({
  activeTab: "personal" as "personal" | "account",
  saving: false,
  uploadingPhoto: false,
  showPasswordSection: false,
  showDeleteConfirmation: false,
});

// ============================================================================
// VIEWPORT ADAPTIVE STATE
// ============================================================================

export const viewportState = $state({
  contentContainer: null as HTMLDivElement | null,
  availableHeight: 0,
});

// Export functions that return derived values (Svelte 5 requirement)
export function isCompactMode() {
  return (
    viewportState.availableHeight > 0 && viewportState.availableHeight < 600
  );
}

export function isVeryCompactMode() {
  return (
    viewportState.availableHeight > 0 && viewportState.availableHeight < 500
  );
}

// ============================================================================
// DERIVED STATE
// ============================================================================

// Export function that returns derived value (Svelte 5 requirement)
export function hasPasswordProvider() {
  if (!authStore.user?.providerData) return false;
  return authStore.user.providerData.some(
    (provider) => provider.providerId === "password"
  );
}

// ============================================================================
// STATE SYNCHRONIZATION
// ============================================================================

/**
 * Sync form state with auth store when user changes
 */
export function syncWithAuthStore() {
  if (authStore.user) {
    personalInfoState.displayName = authStore.user.displayName || "";
    personalInfoState.email = authStore.user.email || "";
  }
}

/**
 * Reset password form state
 */
export function resetPasswordForm() {
  passwordState.current = "";
  passwordState.new = "";
  passwordState.confirm = "";
}

/**
 * Reset all UI state
 */
export function resetUIState() {
  uiState.saving = false;
  uiState.uploadingPhoto = false;
  uiState.showPasswordSection = false;
  uiState.showDeleteConfirmation = false;
}

/**
 * Setup viewport tracking with ResizeObserver
 * Returns a cleanup function that should be called when done
 */
export function setupViewportTracking(): (() => void) | null {
  if (!viewportState.contentContainer) return null;

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      viewportState.availableHeight = entry.contentRect.height;
    }
  });

  resizeObserver.observe(viewportState.contentContainer);

  return () => {
    resizeObserver.disconnect();
  };
}

/**
 * Dashboard State Wrapper
 * Manages all reactive state for the dashboard
 * Supports preview mode for admin user viewing
 */

import { loadFeatureModule } from "$lib/shared/inversify/di";
import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
import { authState } from "$lib/shared/auth/state/authState.svelte";
import { featureFlagService } from "$lib/shared/auth/services/FeatureFlagService.svelte";
import { libraryState } from "$lib/features/library/state/library-state.svelte";
import { userPreviewState } from "$lib/shared/debug/state/user-preview-state.svelte";
import { MODULE_GRADIENTS } from "../domain/models/dashboard-config";

interface DashboardState {
  challengeDrawerOpen: boolean;
  signInToastMessage: string;
  showSignInToast: boolean;
  signInToastTimeout: ReturnType<typeof setTimeout> | null;
  isVisible: boolean;
}

function createDashboardState() {
  const state: DashboardState = $state({
    challengeDrawerOpen: false,
    signInToastMessage: "",
    showSignInToast: false,
    signInToastTimeout: null,
    isVisible: false,
  });

  // Derived values
  const isAuthenticated = $derived(authState.isAuthenticated);
  const user = $derived(authState.user);
  const isPreviewActive = $derived(userPreviewState.isActive);
  const previewProfile = $derived(userPreviewState.data.profile);

  // Use preview data when active, otherwise use actual data
  const effectiveDisplayName = $derived(
    isPreviewActive && previewProfile
      ? previewProfile.displayName
      : (user?.displayName ?? null)
  );

  const sequenceCount = $derived(
    isPreviewActive
      ? userPreviewState.data.sequences.length
      : libraryState.sequences.length
  );
  const favoriteCount = $derived(
    isPreviewActive
      ? 0 // Preview doesn't track favorites yet
      : libraryState.sequences.filter((s) => s.isFavorite).length
  );

  const greeting = $derived.by(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  });

  const welcomeMessage = $derived.by(() => {
    // When previewing another user, show their name
    if (isPreviewActive && previewProfile) {
      const firstName = (
        previewProfile.displayName ||
        previewProfile.email ||
        "User"
      ).split(" ")[0];
      return `Viewing as ${firstName}`;
    }
    // Normal authenticated user
    if (isAuthenticated && effectiveDisplayName) {
      const firstName = effectiveDisplayName.split(" ")[0];
      return `${greeting}, ${firstName}`;
    }
    return "Welcome to TKA Scribe";
  });

  const moduleCards = $derived.by(() =>
    navigationState.moduleDefinitions
      .filter((m) => {
        // Only show main modules (exclude dashboard and settings)
        if (!m.isMain || m.id === "dashboard") return false;

        // Filter out modules the user cannot access
        const canAccess = featureFlagService.canAccessModule(m.id);
        return canAccess;
      })
      .map((m) => ({
        ...m,
        gradient: MODULE_GRADIENTS[m.id] || MODULE_GRADIENTS["learn"],
        isLocked: false,
      }))
  );

  // Effects
  $effect(() => {
    const userId = authState.effectiveUserId;
    if (userId) {
      loadFeatureModule("library")
        .then(() => {
          libraryState.loadSequences();
        })
        .catch((error) => {
          console.error("[Dashboard] Failed to load library module:", error);
        });
    }
  });

  // Methods
  function showSignInRequiredToast(moduleName: string) {
    if (state.signInToastTimeout) {
      clearTimeout(state.signInToastTimeout);
    }

    state.signInToastMessage = `Sign in to unlock ${moduleName}`;
    state.showSignInToast = true;

    state.signInToastTimeout = setTimeout(() => {
      state.showSignInToast = false;
    }, 3000);
  }

  function clearToast() {
    if (state.signInToastTimeout) {
      clearTimeout(state.signInToastTimeout);
    }
  }

  return {
    get challengeDrawerOpen() {
      return state.challengeDrawerOpen;
    },
    set challengeDrawerOpen(value: boolean) {
      state.challengeDrawerOpen = value;
    },

    get signInToastMessage() {
      return state.signInToastMessage;
    },

    get showSignInToast() {
      return state.showSignInToast;
    },

    get isVisible() {
      return state.isVisible;
    },
    set isVisible(value: boolean) {
      state.isVisible = value;
    },

    isAuthenticated,
    user,
    sequenceCount,
    favoriteCount,
    greeting,
    welcomeMessage,
    moduleCards,
    isPreviewActive,
    previewProfile,

    showSignInRequiredToast,
    clearToast,
  };
}

export function createDashboard() {
  return createDashboardState();
}

/**
 * Dashboard State Wrapper
 * Manages all reactive state for the dashboard
 */

import { loadFeatureModule } from "$lib/shared/inversify/di";
import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
import { authStore } from "$lib/shared/auth/stores/authStore.svelte";
import { featureFlagService } from "$lib/shared/auth/services/FeatureFlagService.svelte";
import { libraryState } from "$lib/features/library/state/library-state.svelte";
import { MODULE_GRADIENTS } from "../domain/models/dashboard-config";

interface DashboardState {
  challengeDrawerOpen: boolean;
  supportDrawerOpen: boolean;
  signInToastMessage: string;
  showSignInToast: boolean;
  signInToastTimeout: ReturnType<typeof setTimeout> | null;
  isVisible: boolean;
}

function createDashboardState() {
  let state: DashboardState = $state({
    challengeDrawerOpen: false,
    supportDrawerOpen: false,
    signInToastMessage: "",
    showSignInToast: false,
    signInToastTimeout: null,
    isVisible: false,
  });

  // Derived values
  const isAuthenticated = $derived(authStore.isAuthenticated);
  const user = $derived(authStore.user);
  const sequenceCount = $derived(libraryState.sequences.length);
  const favoriteCount = $derived(
    libraryState.sequences.filter((s) => s.isFavorite).length
  );

  const greeting = $derived.by(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  });

  const welcomeMessage = $derived.by(() => {
    if (isAuthenticated && user?.displayName) {
      const firstName = user.displayName.split(" ")[0];
      return `${greeting}, ${firstName}`;
    }
    return "Welcome to TKA Studio";
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
    const userId = authStore.effectiveUserId;
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

    get supportDrawerOpen() {
      return state.supportDrawerOpen;
    },
    set supportDrawerOpen(value: boolean) {
      state.supportDrawerOpen = value;
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

    showSignInRequiredToast,
    clearToast,
  };
}

export function createDashboard() {
  return createDashboardState();
}

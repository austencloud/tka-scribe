<script lang="ts">
  /**
   * Dashboard - 2026 Bento Box Design
   * Composition-based widget dashboard with modular state management
   * Supports preview mode for admin user viewing
   */

  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import type { IDeviceDetector } from "$lib/shared/device/services/contracts/IDeviceDetector";
  import type { ResponsiveSettings } from "$lib/shared/device/domain/models/device-models";
  import { handleModuleChange } from "$lib/shared/navigation-coordinator/navigation-coordinator.svelte";
  import type { ModuleId } from "$lib/shared/navigation/domain/types";
  import { userPreviewState } from "$lib/shared/debug/state/user-preview-state.svelte";
  import { authState } from "$lib/shared/auth/state/authState.svelte";

  // Components
  import DashboardHeader from "./DashboardHeader.svelte";
  import DashboardSignInToast from "./DashboardSignInToast.svelte";
  import TodayChallengeWidget from "./widgets/TodayChallengeWidget.svelte";
  import CommunityFeedWidget from "./widgets/CommunityFeedWidget.svelte";
  import NotificationsWidget from "./widgets/NotificationsWidget.svelte";
  import { createDashboard } from "../state/dashboard-state.svelte";

  // Services
  let deviceDetector: IDeviceDetector | null = null;
  let responsiveSettings = $state<ResponsiveSettings | null>(null);
  let hapticService: IHapticFeedbackService | undefined;

  // State
  const dashboardState = createDashboard();

  // Preview-aware derived values (directly in component for proper reactivity)
  const isPreviewActive = $derived(userPreviewState.isActive);
  const previewProfile = $derived(userPreviewState.data.profile);

  const greeting = $derived.by(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  });

  const effectiveWelcomeMessage = $derived.by(() => {
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
    if (authState.isAuthenticated && authState.user?.displayName) {
      const firstName = authState.user.displayName.split(" ")[0];
      return `${greeting}, ${firstName}`;
    }
    return "Welcome to TKA Scribe";
  });

  // Derived
  const isMobile = $derived(
    responsiveSettings?.isMobile || responsiveSettings?.isTablet || false
  );

  onMount(() => {
    let cleanup: (() => void) | undefined;
    try {
      deviceDetector = resolve<IDeviceDetector>(TYPES.IDeviceDetector);
      hapticService = resolve<IHapticFeedbackService>(
        TYPES.IHapticFeedbackService
      );
      responsiveSettings = deviceDetector.getResponsiveSettings();

      cleanup = deviceDetector.onCapabilitiesChanged(() => {
        responsiveSettings = deviceDetector!.getResponsiveSettings();
      });
    } catch (error) {
      console.warn("Dashboard: Failed to resolve DeviceDetector", error);
    }

    setTimeout(() => {
      dashboardState.isVisible = true;
    }, 30);

    return () => {
      cleanup?.();
      dashboardState.clearToast();
    };
  });

  async function openSettings() {
    hapticService?.trigger("selection");
    await handleModuleChange("settings" as ModuleId);
  }
</script>

<div class="dashboard" class:visible={dashboardState.isVisible}>
  <DashboardHeader
    welcomeMessage={effectiveWelcomeMessage}
    isVisible={dashboardState.isVisible}
  />

  <!-- COMMUNITY HUB - Challenge, Community Feed, Notifications -->
  <div class="community-grid" class:mobile={isMobile}>
    <!-- Today's Challenge -->
    {#if dashboardState.isVisible}
      <section
        class="widget-challenge"
        transition:fly={{
          y: 12,
          duration: 200,
          delay: 200,
          easing: cubicOut,
        }}
      >
        <TodayChallengeWidget />
      </section>
    {/if}

    <!-- Community Feed - Recent sequences from others -->
    {#if dashboardState.isVisible}
      <section
        class="widget-community"
        transition:fly={{
          y: 12,
          duration: 200,
          delay: 300,
          easing: cubicOut,
        }}
      >
        <CommunityFeedWidget />
      </section>
    {/if}

    <!-- Notifications Preview -->
    {#if dashboardState.isVisible}
      <section
        class="widget-notifications"
        transition:fly={{
          y: 12,
          duration: 200,
          delay: 400,
          easing: cubicOut,
        }}
      >
        <NotificationsWidget />
      </section>
    {/if}
  </div>

  <DashboardSignInToast
    message={dashboardState.signInToastMessage}
    visible={dashboardState.showSignInToast}
  />
</div>

<style>
  /* ========================================
     VIEW TRANSITIONS - Zoom from card effect
     ======================================== */

  /* Old page (dashboard) zooms out and fades */
  /* Exclude settings portal transitions - they have their own animations in view-transitions.css */
  :global(:root:not(.settings-portal-enter):not(.settings-portal-exit)::view-transition-old(root)) {
    animation: 350ms cubic-bezier(0.4, 0, 0.2, 1) both zoom-out-fade;
    transform-origin: var(--transition-origin-x, 50%)
      var(--transition-origin-y, 50%);
  }

  /* New page (module) zooms in from card position */
  /* Exclude settings portal transitions - they have their own animations in view-transitions.css */
  :global(:root:not(.settings-portal-enter):not(.settings-portal-exit)::view-transition-new(root)) {
    animation: 350ms cubic-bezier(0.4, 0, 0.2, 1) both zoom-in-reveal;
    transform-origin: var(--transition-origin-x, 50%)
      var(--transition-origin-y, 50%);
  }

  /* Dashboard zooms IN and fades (we're diving through it) */
  @keyframes zoom-out-fade {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(1.3);
    }
  }

  /* Module starts slightly small, grows to full (we're arriving) */
  @keyframes zoom-in-reveal {
    from {
      opacity: 0;
      transform: scale(0.85);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* ========================================
     BACK TRANSITION - Pull out effect (Home button)
     ======================================== */

  /* When going back to dashboard, reverse the effect */
  :global(.back-transition)::view-transition-old(root) {
    animation: 350ms cubic-bezier(0.4, 0, 0.2, 1) both pull-out-old;
  }

  :global(.back-transition)::view-transition-new(root) {
    animation: 350ms cubic-bezier(0.4, 0, 0.2, 1) both pull-out-new;
  }

  /* Module shrinks as we pull back from it */
  @keyframes pull-out-old {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.85);
    }
  }

  /* Dashboard zooms down from large to normal (we're pulling back to see it) */
  @keyframes pull-out-new {
    from {
      opacity: 0;
      transform: scale(1.3);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* ========================================
     2026 DASHBOARD - Community Hub
     Scrollable, engagement-focused layout
     ======================================== */

  .dashboard {
    box-sizing: border-box;
    width: 100%;
    max-width: 1200px;
    height: 100%;
    padding: 24px;
    padding-bottom: 40px;
    margin: 0 auto;
    overflow-x: hidden;
    overflow-y: auto;
    opacity: 0;
    transition: opacity 300ms ease;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .dashboard.visible {
    opacity: 1;
  }

  /* ========================================
     COMMUNITY GRID - Widgets layout
     ======================================== */

  .community-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: auto auto;
    gap: 20px;
    width: 100%;
    min-width: 0;
  }

  /* Challenge spans full width on first row */
  .widget-challenge {
    grid-column: 1 / -1;
    min-width: 0;
  }

  /* Community and Notifications side by side */
  .widget-community,
  .widget-notifications {
    min-height: 280px;
    min-width: 0;
  }

  .community-grid.mobile {
    grid-template-columns: 1fr;
  }

  .community-grid.mobile .widget-challenge,
  .community-grid.mobile .widget-community,
  .community-grid.mobile .widget-notifications {
    grid-column: 1;
  }

  /* ========================================
     RESPONSIVE BREAKPOINTS
     ======================================== */

  @media (max-width: 768px) {
    .dashboard {
      padding: 16px;
      padding-bottom: 32px;
      gap: 20px;
    }

    .community-grid {
      gap: 16px;
    }
  }

  @media (max-width: 480px) {
    .dashboard {
      padding: 12px;
      padding-bottom: 24px;
      gap: 16px;
    }

    .community-grid {
      gap: 12px;
    }

    .widget-community,
    .widget-notifications {
      min-height: 240px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .dashboard {
      transition: none;
    }

    /* Disable view transition animations for reduced motion */
    :global(::view-transition-group(*)),
    :global(::view-transition-old(*)),
    :global(::view-transition-new(*)) {
      animation: none !important;
    }
  }
</style>

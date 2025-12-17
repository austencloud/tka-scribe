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
  import DashboardMobileDrawers from "./DashboardMobileDrawers.svelte";
  import DashboardSignInToast from "./DashboardSignInToast.svelte";
  import TodayChallengeWidget from "./widgets/TodayChallengeWidget.svelte";
  import SupportWidget from "./widgets/SupportWidget.svelte";
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

  function openChallengeDrawer() {
    hapticService?.trigger("selection");
    dashboardState.challengeDrawerOpen = true;
  }

  function openSupportDrawer() {
    hapticService?.trigger("selection");
    dashboardState.supportDrawerOpen = true;
  }
</script>

<div class="dashboard" class:visible={dashboardState.isVisible}>
  <DashboardHeader
    welcomeMessage={effectiveWelcomeMessage}
    isVisible={dashboardState.isVisible}
  />

  <!-- SECONDARY CONTENT - Challenge, Support -->
  <div class="secondary-grid" class:mobile={isMobile}>
    <!-- Challenge Card -->
    {#if dashboardState.isVisible}
      <section
        class="bento-challenge"
        transition:fly={{
          y: 12,
          duration: 200,
          delay: 300,
          easing: cubicOut,
        }}
      >
        {#if isMobile}
          <button class="teaser-card" onclick={openChallengeDrawer}>
            <div class="teaser-icon challenge">
              <i class="fas fa-bolt"></i>
            </div>
            <div class="teaser-content">
              <span class="teaser-title">Today's Challenge</span>
              <span class="teaser-subtitle">Tap to view</span>
            </div>
            <i class="fas fa-chevron-right teaser-arrow"></i>
          </button>
        {:else}
          <TodayChallengeWidget />
        {/if}
      </section>
    {/if}

    <!-- Support Card -->
    {#if dashboardState.isVisible}
      <section
        class="bento-support"
        transition:fly={{
          y: 12,
          duration: 200,
          delay: 350,
          easing: cubicOut,
        }}
      >
        {#if isMobile}
          <button class="teaser-card" onclick={openSupportDrawer}>
            <div class="teaser-icon support">
              <i class="fas fa-heart"></i>
            </div>
            <div class="teaser-content">
              <span class="teaser-title">Support TKA</span>
              <span class="teaser-subtitle">Help keep this free</span>
            </div>
            <i class="fas fa-chevron-right teaser-arrow"></i>
          </button>
        {:else}
          <SupportWidget />
        {/if}
      </section>
    {/if}
  </div>

  <DashboardMobileDrawers
    challengeDrawerOpen={dashboardState.challengeDrawerOpen}
    supportDrawerOpen={dashboardState.supportDrawerOpen}
    onChallengeDrawerChange={(open: boolean) =>
      (dashboardState.challengeDrawerOpen = open)}
    onSupportDrawerChange={(open: boolean) =>
      (dashboardState.supportDrawerOpen = open)}
  />

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
     2026 DASHBOARD - Modules First
     Clean, focused navigation hub
     ======================================== */

  .dashboard {
    width: 100%;
    height: 100%;
    padding: 24px;
    overflow-y: auto;
    opacity: 0;
    transition: opacity 300ms ease;
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 1200px;
    margin: 0 auto;

    /* Hide scrollbar but keep functionality */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
  }

  .dashboard::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }

  .dashboard.visible {
    opacity: 1;
  }

  /* ========================================
     SECONDARY GRID - Profile, Challenge, Support, Settings
     ======================================== */

  .secondary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-top: 8px;
  }

  .secondary-grid.mobile {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  /* ========================================
     CHALLENGE & SUPPORT CARDS
     ======================================== */

  .bento-challenge,
  .bento-support {
    min-height: auto;
  }

  /* Teaser Card Style (Mobile) */
  .teaser-card {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    min-height: 72px;
    padding: 16px 20px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 18px;
    cursor: pointer;
    transition: background var(--duration-fast, 150ms) var(--ease-out);
    text-align: left;
  }

  .teaser-card:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
  }

  .teaser-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    border-radius: 14px;
    font-size: 20px;
    flex-shrink: 0;
  }

  .teaser-icon.challenge {
    background: color-mix(
      in srgb,
      var(--semantic-warning, #f59e0b) 15%,
      transparent
    );
    color: var(--semantic-warning, #f59e0b);
  }

  .teaser-icon.support {
    background: color-mix(
      in srgb,
      var(--theme-accent-strong, #8b5cf6) 15%,
      transparent
    );
    color: var(--theme-accent-strong, #8b5cf6);
  }

  .teaser-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .teaser-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .teaser-subtitle {
    font-size: 0.875rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .teaser-arrow {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.3));
    font-size: 14px;
  }

  /* ========================================
     RESPONSIVE BREAKPOINTS
     ======================================== */

  @media (max-width: 1024px) {
    .secondary-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 768px) {
    .dashboard {
      padding: 16px;
      gap: 20px;
    }

    .secondary-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 480px) {
    .dashboard {
      padding: 12px;
      gap: 16px;
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

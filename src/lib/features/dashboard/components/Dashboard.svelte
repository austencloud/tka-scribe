<script lang="ts">
  /**
   * Dashboard - 2026 Bento Box Design
   * Composition-based widget dashboard with modular state management
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

  // Components
  import DashboardHeader from "./DashboardHeader.svelte";
  import DashboardGrid from "./DashboardGrid.svelte";
  import DashboardMobileDrawers from "./DashboardMobileDrawers.svelte";
  import DashboardSignInToast from "./DashboardSignInToast.svelte";
  import TodayChallengeWidget from "./widgets/TodayChallengeWidget.svelte";
  import SupportWidget from "./widgets/SupportWidget.svelte";
  import NotificationCenterWidget from "./widgets/NotificationCenterWidget.svelte";
  import { createDashboard } from "../state/dashboard-state.svelte";

  // Services
  let deviceDetector: IDeviceDetector | null = null;
  let responsiveSettings = $state<ResponsiveSettings | null>(null);
  let hapticService: IHapticFeedbackService | undefined;

  // State
  const dashboardState = createDashboard();

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

  function navigateToModule(
    moduleId: string,
    event: MouseEvent,
    isLocked: boolean = false,
    moduleLabel: string = ""
  ) {
    hapticService?.trigger("selection");

    if (isLocked) {
      dashboardState.showSignInRequiredToast(moduleLabel);
      openSettings();
      return;
    }

    const card = event.currentTarget as HTMLElement;
    const doc = document as any;

    if (typeof doc.startViewTransition === "function") {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      document.documentElement.style.setProperty(
        "--transition-origin-x",
        `${centerX}px`
      );
      document.documentElement.style.setProperty(
        "--transition-origin-y",
        `${centerY}px`
      );

      card.style.transform = "scale(1.05)";
      card.style.zIndex = "100";

      const transition = doc.startViewTransition(async () => {
        await handleModuleChange(moduleId as any);
      });

      transition.finished.finally(() => {
        document.documentElement.style.removeProperty("--transition-origin-x");
        document.documentElement.style.removeProperty("--transition-origin-y");
      });
    } else {
      handleModuleChange(moduleId as any);
    }
  }

  function navigateToLibrary() {
    hapticService?.trigger("selection");
    handleModuleChange("discover", "library");
  }

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
    welcomeMessage={dashboardState.welcomeMessage}
    isVisible={dashboardState.isVisible}
  />

  <DashboardGrid
    moduleCards={dashboardState.moduleCards}
    isVisible={dashboardState.isVisible}
    onModuleClick={navigateToModule}
  />

  <!-- SECONDARY CONTENT - Challenge, Support, Notifications -->
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

    <!-- Notification Center Card -->
    {#if dashboardState.isVisible}
      <section
        class="bento-notifications"
        transition:fly={{
          y: 12,
          duration: 200,
          delay: 375,
          easing: cubicOut,
        }}
      >
        <NotificationCenterWidget />
      </section>
    {/if}
  </div>

  <DashboardMobileDrawers
    challengeDrawerOpen={dashboardState.challengeDrawerOpen}
    supportDrawerOpen={dashboardState.supportDrawerOpen}
    onChallengeDrawerChange={(open: boolean) => (dashboardState.challengeDrawerOpen = open)}
    onSupportDrawerChange={(open: boolean) => (dashboardState.supportDrawerOpen = open)}
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
  :global(::view-transition-old(root)) {
    animation: 350ms cubic-bezier(0.4, 0, 0.2, 1) both zoom-out-fade;
    transform-origin: var(--transition-origin-x, 50%)
      var(--transition-origin-y, 50%);
  }

  /* New page (module) zooms in from card position */
  :global(::view-transition-new(root)) {
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
     PROFILE CARD
     ======================================== */

  .bento-profile {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    background: rgba(99, 102, 241, 0.08);
    border: 1px solid rgba(99, 102, 241, 0.15);
    border-radius: 20px;
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .profile-avatar {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    overflow: hidden;
    background: rgba(99, 102, 241, 0.2);
    flex-shrink: 0;
  }

  .profile-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #6366f1;
  }

  .profile-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .profile-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .profile-email {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .guest-sign-in-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 52px;
    padding: 0 14px;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    border: none;
    border-radius: 10px;
    color: white;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition:
      filter var(--duration-fast, 150ms) var(--ease-out),
      transform var(--duration-fast, 150ms) var(--ease-out);
    white-space: nowrap;
  }

  .guest-sign-in-cta:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  .guest-sign-in-cta:active {
    transform: scale(0.98);
  }

  .guest-sign-in-cta:focus {
    outline: 2px solid rgba(99, 102, 241, 0.5);
    outline-offset: 2px;
  }

  .guest-sign-in-cta i:first-child {
    font-size: 14px;
  }

  .guest-sign-in-cta i:last-child {
    font-size: 12px;
    opacity: 0.7;
    margin-left: auto;
  }

  .profile-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 80px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    cursor: pointer;
    transition:
      background var(--duration-fast, 150ms) var(--ease-out),
      border-color var(--duration-fast, 150ms) var(--ease-out);
  }

  .stat-card:hover {
    background: rgba(99, 102, 241, 0.12);
    border-color: rgba(99, 102, 241, 0.25);
  }

  .stat-card.favorites:hover {
    background: rgba(245, 158, 11, 0.12);
    border-color: rgba(245, 158, 11, 0.25);
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
  }

  .stat-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 4px;
  }

  .library-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 52px;
    padding: 14px 20px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: none;
    border-radius: 14px;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition:
      filter var(--duration-fast, 150ms) var(--ease-out),
      transform var(--duration-fast, 150ms) var(--ease-out);
    margin-top: auto;
  }

  .library-btn:hover {
    filter: brightness(1.1);
    transform: translateY(var(--hover-lift-sm, -1px));
  }

  .library-btn i:last-child {
    margin-left: auto;
    font-size: 14px;
  }

  /* ========================================
     CHALLENGE & SUPPORT CARDS
     ======================================== */

  .bento-challenge,
  .bento-support,
  .bento-notifications {
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
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    cursor: pointer;
    transition: background var(--duration-fast, 150ms) var(--ease-out);
    text-align: left;
  }

  .teaser-card:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .teaser-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 14px;
    font-size: 20px;
    flex-shrink: 0;
  }

  .teaser-icon.challenge {
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
  }

  .teaser-icon.support {
    background: rgba(236, 72, 153, 0.15);
    color: #ec4899;
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
    color: rgba(255, 255, 255, 0.95);
  }

  .teaser-subtitle {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .teaser-arrow {
    color: rgba(255, 255, 255, 0.3);
    font-size: 14px;
  }

  /* Drawer Body */
  .drawer-body {
    padding: 20px;
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

    .bento-profile {
      padding: 16px;
      border-radius: 16px;
    }
  }

  @media (max-width: 480px) {
    .dashboard {
      padding: 12px;
      gap: 16px;
    }

    .profile-stats {
      gap: 10px;
    }

    .stat-card {
      min-height: 70px;
      padding: 12px;
    }

    .stat-value {
      font-size: 1.25rem;
    }

    .library-btn {
      min-height: 52px;
      padding: 12px 16px;
      font-size: 0.875rem;
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

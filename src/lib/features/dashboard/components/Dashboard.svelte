<script lang="ts">
  /**
   * Dashboard - 2026 Bento Box Design
   * Full-width grid layout with rich colored module cards
   * Accessibility-first: 50px min touch targets, proper contrast
   */

  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";

  // 2026 Unified Transition Constants (align with app.css tokens)
  const DURATION = { normal: 200, emphasis: 280 };
  const STAGGER = { normal: 50 };
  const SLIDE = { sm: 8, md: 12 };
  import { handleModuleChange } from "$lib/shared/navigation-coordinator/navigation-coordinator.svelte";
  import type { ModuleId } from "$lib/shared/navigation/domain/types";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte";
  import { featureFlagService } from "$lib/shared/auth/services/FeatureFlagService.svelte";
  import { resolve, loadFeatureModule } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import type { IDeviceDetector } from "$lib/shared/device/services/contracts/IDeviceDetector";
  import type { ResponsiveSettings } from "$lib/shared/device/domain/models/device-models";
  import { libraryState } from "$lib/features/library/state/library-state.svelte";

  // Widgets
  import TodayChallengeWidget from "./widgets/TodayChallengeWidget.svelte";
  import SupportWidget from "./widgets/SupportWidget.svelte";
  import NotificationCenterWidget from "./widgets/NotificationCenterWidget.svelte";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";

  let isVisible = $state(false);

  // Device detection
  let deviceDetector: IDeviceDetector | null = null;
  let responsiveSettings = $state<ResponsiveSettings | null>(null);
  const isMobile = $derived(
    responsiveSettings?.isMobile || responsiveSettings?.isTablet || false
  );

  // Mobile drawer states
  let challengeDrawerOpen = $state(false);
  let supportDrawerOpen = $state(false);

  // Sign-in required toast state
  let signInToastMessage = $state("");
  let showSignInToast = $state(false);
  let signInToastTimeout: ReturnType<typeof setTimeout> | null = null;

  // Haptic feedback
  let hapticService: IHapticFeedbackService | undefined;

  // Auth state
  const isAuthenticated = $derived(authStore.isAuthenticated);
  const user = $derived(authStore.user);
  const sequenceCount = $derived(libraryState.sequences.length);
  const favoriteCount = $derived(
    libraryState.sequences.filter((s) => s.isFavorite).length
  );

  // Personalized greeting
  const greeting = $derived(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  });

  const welcomeMessage = $derived(() => {
    if (isAuthenticated && user?.displayName) {
      const firstName = user.displayName.split(" ")[0];
      return `${greeting()}, ${firstName}`;
    }
    return "Welcome to TKA Studio";
  });

  // Module cards with rich colors and access status
  const moduleCards = $derived(
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
        gradient: getModuleGradient(m.id),
        isLocked: false, // All visible modules are accessible
      }))
  );

  function getModuleGradient(id: string): string {
    const gradients: Record<string, string> = {
      create: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      discover: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      learn: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      animate: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
      train: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      feedback: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      admin: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", // Gold gradient for admin
      "ml-training": "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", // Purple for ML
      settings: "linear-gradient(135deg, #64748b 0%, #475569 100%)", // Slate gradient for settings
    };
    return gradients[id] || "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)";
  }

  // Load library data when auth state changes
  $effect(() => {
    const userId = authStore.effectiveUserId;
    if (userId) {
      // Ensure library module is loaded before accessing libraryState
      loadFeatureModule("library")
        .then(() => {
          libraryState.loadSequences();
        })
        .catch((error) => {
          console.error("[Dashboard] Failed to load library module:", error);
        });
    }
  });

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
      isVisible = true;
    }, 30);

    return () => {
      cleanup?.();
      if (signInToastTimeout) {
        clearTimeout(signInToastTimeout);
      }
    };
  });

  function showSignInRequiredToast(moduleName: string) {
    // Clear any existing timeout
    if (signInToastTimeout) {
      clearTimeout(signInToastTimeout);
    }

    signInToastMessage = `Sign in to unlock ${moduleName}`;
    showSignInToast = true;

    signInToastTimeout = setTimeout(() => {
      showSignInToast = false;
    }, 3000);
  }

  function navigateToModule(
    moduleId: string,
    event: MouseEvent,
    isLocked: boolean = false,
    moduleLabel: string = ""
  ) {
    hapticService?.trigger("selection");

    // If module is locked, show toast and redirect to settings
    if (isLocked) {
      showSignInRequiredToast(moduleLabel);
      openSettings();
      return;
    }

    const card = event.currentTarget as HTMLElement;
    const doc = document as any;

    if (typeof doc.startViewTransition === "function") {
      // Get card position for custom animation origin
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Set CSS custom properties for animation origin
      document.documentElement.style.setProperty(
        "--transition-origin-x",
        `${centerX}px`
      );
      document.documentElement.style.setProperty(
        "--transition-origin-y",
        `${centerY}px`
      );

      // Add a quick scale-up on the card for visual feedback
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
    challengeDrawerOpen = true;
  }

  function openSupportDrawer() {
    hapticService?.trigger("selection");
    supportDrawerOpen = true;
  }
</script>

<div class="dashboard" class:visible={isVisible}>
  <!-- Welcome Header (compact) -->
  {#if isVisible}
    <header
      class="welcome-header"
      transition:fly={{
        y: -SLIDE.sm,
        duration: DURATION.normal,
        easing: cubicOut,
      }}
    >
      <h1>{welcomeMessage()}</h1>
      <p>Where would you like to go?</p>
    </header>
  {/if}

  <!-- MODULE GRID - THE MAIN ATTRACTION -->
  {#if isVisible}
    <section
      class="modules-section"
      transition:fly={{
        y: SLIDE.md,
        duration: DURATION.normal,
        delay: STAGGER.normal,
        easing: cubicOut,
      }}
    >
      <div class="modules-grid">
        {#each moduleCards as module, i (module.id)}
          <button
            class="module-card"
            class:locked={module.isLocked}
            style="--module-gradient: {module.gradient}; --module-color: {module.color}"
            onclick={(e) =>
              navigateToModule(module.id, e, module.isLocked, module.label)}
            transition:fly={{
              y: SLIDE.md,
              duration: DURATION.normal,
              delay: 100 + i * STAGGER.normal,
              easing: cubicOut,
            }}
          >
            {#if module.isLocked}
              <div class="lock-badge" aria-label="Sign in required">
                <i class="fas fa-lock"></i>
              </div>
            {/if}
            <div class="module-icon">
              {@html module.icon}
            </div>
            <div class="module-text">
              <span class="module-label">{module.label}</span>
              <span class="module-desc">{module.description}</span>
            </div>
          </button>
        {/each}
      </div>
    </section>
  {/if}

  <!-- SECONDARY CONTENT - Profile, Challenge, Support -->
  <div class="secondary-grid" class:mobile={isMobile}>
    <!-- Profile Card -->
    {#if isVisible}
      <section
        class="bento-profile"
        transition:fly={{
          y: SLIDE.md,
          duration: DURATION.normal,
          delay: 250,
          easing: cubicOut,
        }}
      >
        <div class="profile-header">
          <div class="profile-avatar">
            {#if isAuthenticated && user?.photoURL}
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                crossorigin="anonymous"
                referrerpolicy="no-referrer"
              />
            {:else}
              <div class="avatar-placeholder">
                <i class="fas fa-user"></i>
              </div>
            {/if}
          </div>
          <div class="profile-info">
            {#if isAuthenticated && user}
              <span class="profile-name"
                >{user.displayName || "Flow Artist"}</span
              >
              <span class="profile-email">{user.email}</span>
            {:else}
              <button class="guest-sign-in-cta" onclick={openSettings}>
                <i class="fas fa-sign-in-alt"></i>
                <span>Sign in to sync your data</span>
                <i class="fas fa-chevron-right"></i>
              </button>
            {/if}
          </div>
        </div>

        <div class="profile-stats">
          <button class="stat-card" onclick={navigateToLibrary}>
            <span class="stat-value">{sequenceCount}</span>
            <span class="stat-label">Sequences</span>
          </button>
          <button class="stat-card favorites" onclick={navigateToLibrary}>
            <span class="stat-value">{favoriteCount}</span>
            <span class="stat-label">Favorites</span>
          </button>
        </div>

        <button class="library-btn" onclick={navigateToLibrary}>
          <i class="fas fa-book"></i>
          <span>Open Library</span>
          <i class="fas fa-arrow-right"></i>
        </button>
      </section>
    {/if}

    <!-- Challenge Card -->
    {#if isVisible}
      <section
        class="bento-challenge"
        transition:fly={{
          y: SLIDE.md,
          duration: DURATION.normal,
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
    {#if isVisible}
      <section
        class="bento-support"
        transition:fly={{
          y: SLIDE.md,
          duration: DURATION.normal,
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
    {#if isVisible && isAuthenticated}
      <section
        class="bento-notifications"
        transition:fly={{
          y: SLIDE.md,
          duration: DURATION.normal,
          delay: 375,
          easing: cubicOut,
        }}
      >
        <NotificationCenterWidget />
      </section>
    {/if}

  </div>

  <!-- Mobile Drawers -->
  <Drawer
    bind:isOpen={challengeDrawerOpen}
    placement="bottom"
    ariaLabel="Today's Challenge"
  >
    <div class="drawer-body">
      <TodayChallengeWidget />
    </div>
  </Drawer>

  <Drawer
    bind:isOpen={supportDrawerOpen}
    placement="bottom"
    ariaLabel="Support TKA"
  >
    <div class="drawer-body">
      <SupportWidget />
    </div>
  </Drawer>

  <!-- Sign-in Required Toast -->
  {#if showSignInToast}
    <div class="sign-in-toast" role="alert" aria-live="assertive">
      <i class="fas fa-lock"></i>
      <span>{signInToastMessage}</span>
    </div>
  {/if}
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
     WELCOME HEADER - Compact greeting
     ======================================== */

  .welcome-header {
    text-align: center;
    padding: 16px 0 8px;
  }

  .welcome-header h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: -0.02em;
  }

  .welcome-header p {
    margin: 6px 0 0;
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.5);
  }

  /* ========================================
     MODULES SECTION - THE MAIN ATTRACTION
     Smart grid that adapts to screen size
     ======================================== */

  .modules-section {
    width: 100%;
  }

  /* Smart grid: 9 modules in clean 3x3 layout
     Responsive: 2 columns (mobile) → 3 columns (tablet+) */
  .modules-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    width: 100%;
  }

  /* Medium screens: 3 columns (good for 6, 9 modules) */
  @media (min-width: 640px) {
    .modules-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
    }
  }

  /* Large screens: 3 columns - perfect 3x3 for 9 modules
     Parent dashboard container caps at 1200px, so cards max ~370px wide */
  @media (min-width: 900px) {
    .modules-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
  }

  /* ========================================
     MODULE CARDS - RICH COLORED
     ======================================== */

  .module-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    min-height: 140px;
    padding: 20px;
    background: var(--module-gradient);
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition:
      transform var(--duration-fast, 150ms)
        var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)),
      box-shadow var(--duration-fast, 150ms)
        var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1));
    text-align: left;
    position: relative;
    overflow: hidden;
  }

  .module-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.15) 0%,
      transparent 50%
    );
    pointer-events: none;
  }

  /* 2026 refined hover - subtle lift with scale */
  .module-card:hover {
    transform: translateY(var(--hover-lift-md, -2px))
      scale(var(--hover-scale-sm, 1.01));
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  }

  /* Active press - subtle feedback */
  .module-card:active {
    transform: scale(var(--active-scale, 0.98));
    transition-duration: 50ms;
  }

  .module-card:focus {
    outline: 3px solid white;
    outline-offset: 2px;
  }

  .module-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 14px;
    font-size: 24px;
    color: white;
  }

  .module-icon :global(i) {
    color: white !important;
    -webkit-text-fill-color: white !important;
  }

  .module-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .module-label {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
  }

  .module-desc {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.85);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ========================================
     LOCKED MODULE CARD STATE
     ======================================== */

  .module-card.locked {
    opacity: 0.7;
  }

  .module-card.locked::after {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.15);
    border-radius: inherit;
    pointer-events: none;
  }

  .lock-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 8px;
    z-index: 2;
  }

  .lock-badge i {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.9);
  }

  /* ========================================
     SIGN-IN REQUIRED TOAST
     ======================================== */

  .sign-in-toast {
    position: fixed;
    bottom: calc(env(safe-area-inset-bottom, 0px) + 80px);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 20px;
    background: rgba(99, 102, 241, 0.95);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-radius: 14px;
    color: white;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    font-size: 15px;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: -0.24px;
    box-shadow:
      0 8px 24px rgba(99, 102, 241, 0.35),
      0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    animation: toast-enter 0.4s cubic-bezier(0.36, 0.66, 0.04, 1);
  }

  .sign-in-toast i {
    font-size: 14px;
    opacity: 0.9;
  }

  @keyframes toast-enter {
    0% {
      opacity: 0;
      transform: translateX(-50%) translateY(20px) scale(0.95);
    }
    100% {
      opacity: 1;
      transform: translateX(-50%) translateY(0) scale(1);
    }
  }

  /* Desktop positioning for toast */
  @media (min-width: 769px) {
    .sign-in-toast {
      bottom: 32px;
    }
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

    /* 4 cards in 2x2 grid - no spanning needed */
  }

  @media (max-width: 768px) {
    .dashboard {
      padding: 16px;
      gap: 20px;
    }

    .welcome-header h1 {
      font-size: 1.5rem;
    }

    .secondary-grid {
      grid-template-columns: 1fr;
    }

    .module-card {
      min-height: 120px;
      padding: 16px;
      border-radius: 16px;
    }

    .module-icon {
      width: 44px;
      height: 44px;
      font-size: 20px;
      border-radius: 12px;
    }

    .module-label {
      font-size: 1.125rem;
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

    .welcome-header {
      padding: 12px 0 4px;
    }

    .welcome-header h1 {
      font-size: 1.25rem;
    }

    .welcome-header p {
      font-size: 0.875rem;
    }

    .modules-grid {
      gap: 12px;
    }

    .module-card {
      min-height: 100px;
      padding: 14px;
      gap: 10px;
    }

    .module-icon {
      width: 40px;
      height: 40px;
      font-size: 18px;
      border-radius: 10px;
    }

    .module-label {
      font-size: 1rem;
    }

    .module-desc {
      font-size: 0.75rem;
      -webkit-line-clamp: 1;
      line-clamp: 1;
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

    .module-card {
      transition: none;
    }

    .module-card:hover {
      transform: none;
    }

    .sign-in-toast {
      animation: none;
    }

    /* Disable view transition animations for reduced motion */
    :global(::view-transition-group(*)),
    :global(::view-transition-old(*)),
    :global(::view-transition-new(*)) {
      animation: none !important;
    }
  }
</style>

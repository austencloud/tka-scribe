<script lang="ts">
  /**
   * Dashboard - 2026 Bento Box Design
   * Full-width grid layout with rich colored module cards
   * Accessibility-first: 48px min touch targets, proper contrast
   */

  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { handleModuleChange } from "$lib/shared/navigation-coordinator/navigation-coordinator.svelte";
  import { showSettingsDialog } from "$lib/shared/application/state/ui/ui-state.svelte";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IDeviceDetector } from "$lib/shared/device/services/contracts/IDeviceDetector";
  import type { ResponsiveSettings } from "$lib/shared/device/domain/models/device-models";
  import { libraryState } from "$lib/features/library/state/library-state.svelte";

  // Widgets
  import TodayChallengeWidget from "./widgets/TodayChallengeWidget.svelte";
  import SupportWidget from "./widgets/SupportWidget.svelte";
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

  // Module cards with rich colors
  const moduleCards = $derived(
    navigationState.moduleDefinitions
      .filter(
        (m) =>
          m.isMain &&
          m.id !== "dashboard" &&
          m.id !== "admin"
      )
      .map((m) => ({
        ...m,
        gradient: getModuleGradient(m.id),
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
    };
    return gradients[id] || "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)";
  }

  onMount(() => {
    let cleanup: (() => void) | undefined;
    try {
      deviceDetector = resolve<IDeviceDetector>(TYPES.IDeviceDetector);
      responsiveSettings = deviceDetector.getResponsiveSettings();

      cleanup = deviceDetector.onCapabilitiesChanged(() => {
        responsiveSettings = deviceDetector!.getResponsiveSettings();
      });
    } catch (error) {
      console.warn("Dashboard: Failed to resolve DeviceDetector", error);
    }

    // Load library data if authenticated
    if (authStore.effectiveUserId) {
      libraryState.loadSequences();
    }

    setTimeout(() => {
      isVisible = true;
    }, 30);

    return () => {
      cleanup?.();
    };
  });

  function navigateToModule(moduleId: string, event: MouseEvent) {
    const card = (event.currentTarget as HTMLElement);

    // Check if View Transitions API is available
    const doc = document as any;

    if (typeof doc.startViewTransition === 'function') {
      console.log('🎬 View Transitions API available, starting transition...');

      // Set view-transition-name on the clicked card
      card.style.viewTransitionName = 'module-hero';

      const transition = doc.startViewTransition(async () => {
        // Remove the name from card before DOM update
        card.style.viewTransitionName = '';
        // Navigate to the module
        await handleModuleChange(moduleId as any);
      });

      transition.finished.then(() => {
        console.log('✅ View transition completed');
      }).catch((err: any) => {
        console.error('❌ View transition failed:', err);
      });
    } else {
      console.log('⚠️ View Transitions API not available, using fallback');
      handleModuleChange(moduleId as any);
    }
  }

  function navigateToLibrary() {
    handleModuleChange("discover", "library");
  }

  function openSettings() {
    showSettingsDialog(isMobile ? "mobile" : "desktop");
  }
</script>

<div class="dashboard" class:visible={isVisible}>
  <!-- Welcome Header (compact) -->
  {#if isVisible}
    <header class="welcome-header" transition:fly={{ y: -12, duration: 300 }}>
      <h1>{welcomeMessage()}</h1>
      <p>Where would you like to go?</p>
    </header>
  {/if}

  <!-- MODULE GRID - THE MAIN ATTRACTION -->
  {#if isVisible}
    <section class="modules-section" transition:fly={{ y: 12, duration: 300, delay: 50 }}>
      <div class="modules-grid">
        {#each moduleCards as module, i (module.id)}
          <button
            class="module-card"
            style="--module-gradient: {module.gradient}; --module-color: {module.color}"
            onclick={(e) => navigateToModule(module.id, e)}
            transition:fly={{ y: 12, duration: 300, delay: 100 + i * 40 }}
          >
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
      <section class="bento-profile" transition:fly={{ y: 12, duration: 300, delay: 300 }}>
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
              <span class="profile-name">{user.displayName || "Flow Artist"}</span>
              <span class="profile-email">{user.email}</span>
            {:else}
              <span class="profile-name">Guest</span>
              <span class="profile-email">Sign in to sync</span>
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
      <section class="bento-challenge" transition:fly={{ y: 12, duration: 300, delay: 350 }}>
        {#if isMobile}
          <button class="teaser-card" onclick={() => (challengeDrawerOpen = true)}>
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
      <section class="bento-support" transition:fly={{ y: 12, duration: 300, delay: 400 }}>
        {#if isMobile}
          <button class="teaser-card" onclick={() => (supportDrawerOpen = true)}>
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

    <!-- Settings Card -->
    {#if isVisible}
      <section class="bento-settings" transition:fly={{ y: 12, duration: 300, delay: 450 }}>
        <button class="settings-card" onclick={openSettings}>
          <div class="settings-icon">
            <i class="fas fa-cog"></i>
          </div>
          <div class="settings-content">
            <span class="settings-title">Settings</span>
            <span class="settings-subtitle">Customize your experience</span>
          </div>
          <i class="fas fa-chevron-right settings-arrow"></i>
        </button>
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
</div>


<style>
  /* ========================================
     VIEW TRANSITIONS - Native shared element animation
     ======================================== */

  /* The module card that morphs into the module content */
  @keyframes module-hero-scale-up {
    from {
      transform: scale(1);
      border-radius: 20px;
    }
    to {
      transform: scale(1);
      border-radius: 0;
    }
  }

  /* Animate the old state (card) growing */
  :global(::view-transition-old(module-hero)) {
    animation: 400ms cubic-bezier(0.4, 0, 0.2, 1) both module-hero-out;
  }

  /* Animate the new state (module) appearing */
  :global(::view-transition-new(module-hero)) {
    animation: 400ms cubic-bezier(0.4, 0, 0.2, 1) both module-hero-in;
  }

  @keyframes module-hero-out {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(1.1);
    }
  }

  @keyframes module-hero-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Make the transition group expand to fill viewport */
  :global(::view-transition-group(module-hero)) {
    animation-duration: 400ms;
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Default page transition (everything else) */
  :global(::view-transition-old(root)),
  :global(::view-transition-new(root)) {
    animation-duration: 300ms;
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
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

  /* Smart grid: balanced columns that avoid orphan cards
     For 6 modules: 2×3, 3×2, or 6×1 layouts only */
  .modules-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    width: 100%;
  }

  /* Medium screens: 3 columns (3×2 for 6 modules) */
  @media (min-width: 640px) {
    .modules-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
    }
  }

  /* Large screens: keep 3 columns but larger cards */
  @media (min-width: 900px) {
    .modules-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
  }

  /* Very wide screens: 6 columns (single row) */
  @media (min-width: 1400px) {
    .modules-grid {
      grid-template-columns: repeat(6, 1fr);
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
    transition: all 200ms ease;
    text-align: left;
    position: relative;
    overflow: hidden;
  }

  .module-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
    pointer-events: none;
  }

  .module-card:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
  }

  .module-card:active {
    transform: scale(0.98);
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
     SECONDARY GRID - Profile, Challenge, Support, Settings
     ======================================== */

  .secondary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
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
    width: 56px;
    height: 56px;
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
    transition: all 150ms ease;
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
    transition: all 150ms ease;
    margin-top: auto;
  }

  .library-btn:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  .library-btn i:last-child {
    margin-left: auto;
    font-size: 14px;
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
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    cursor: pointer;
    transition: all 150ms ease;
    text-align: left;
  }

  .teaser-card:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .teaser-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
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

  /* ========================================
     SETTINGS CARD
     ======================================== */

  .bento-settings {
    min-height: auto;
  }

  .settings-card {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    height: 100%;
    min-height: 72px;
    padding: 16px 20px;
    background: rgba(107, 114, 128, 0.1);
    border: 1px solid rgba(107, 114, 128, 0.2);
    border-radius: 18px;
    cursor: pointer;
    transition: all 150ms ease;
    text-align: left;
  }

  .settings-card:hover {
    background: rgba(107, 114, 128, 0.18);
    border-color: rgba(107, 114, 128, 0.3);
  }

  .settings-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(107, 114, 128, 0.2);
    border-radius: 14px;
    font-size: 20px;
    color: #9ca3af;
    flex-shrink: 0;
    transition: transform 300ms ease;
  }

  .settings-card:hover .settings-icon {
    transform: rotate(45deg);
  }

  .settings-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .settings-title {
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .settings-subtitle {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .settings-arrow {
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
      min-height: 48px;
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

    /* Disable view transition animations for reduced motion */
    :global(::view-transition-group(*)),
    :global(::view-transition-old(*)),
    :global(::view-transition-new(*)) {
      animation: none !important;
    }
  }
</style>

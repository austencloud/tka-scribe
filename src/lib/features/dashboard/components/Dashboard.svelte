<script lang="ts">
  /**
   * Dashboard - 2026 Bento Box Design
   * Full-width grid layout with rich colored module cards
   * Accessibility-first: 48px min touch targets, proper contrast
   */

  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
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
          m.id !== "admin" &&
          m.id !== "account"
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

  function navigateToModule(moduleId: string) {
    navigationState.setCurrentModule(moduleId as any);
  }

  function navigateToLibrary() {
    navigationState.setCurrentModule("discover", "library");
  }
</script>

<div class="dashboard" class:visible={isVisible}>
  <!-- BENTO GRID LAYOUT -->
  <div class="bento-grid" class:mobile={isMobile}>
    <!-- Hero Welcome -->
    {#if isVisible}
      <section class="bento-hero" transition:fly={{ y: 12, duration: 300 }}>
        <div class="hero-content">
          <h1>{welcomeMessage()}</h1>
          <p>Your flow arts choreography toolbox</p>
        </div>
        <div class="hero-decoration">
          <i class="fas fa-shapes"></i>
        </div>
      </section>
    {/if}

    <!-- Profile Card -->
    {#if isVisible}
      <section class="bento-profile" transition:fly={{ y: 12, duration: 300, delay: 50 }}>
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
      <section class="bento-challenge" transition:fly={{ y: 12, duration: 300, delay: 100 }}>
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
      <section class="bento-support" transition:fly={{ y: 12, duration: 300, delay: 150 }}>
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

    <!-- Module Cards Section -->
    {#if isVisible}
      <section class="bento-modules" transition:fly={{ y: 12, duration: 300, delay: 200 }}>
        <h2 class="modules-title">Explore</h2>
        <div class="modules-grid">
          {#each moduleCards as module, i (module.id)}
            <button
              class="module-card"
              style="--module-gradient: {module.gradient}; --module-color: {module.color}"
              onclick={() => navigateToModule(module.id)}
              transition:fly={{ y: 12, duration: 300, delay: 250 + i * 40 }}
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
     2026 BENTO BOX DASHBOARD
     Full-width, rich colors, 48px touch targets
     ======================================== */

  .dashboard {
    width: 100%;
    height: 100%;
    padding: 24px;
    overflow-y: auto;
    opacity: 0;
    transition: opacity 300ms ease;
  }

  .dashboard.visible {
    opacity: 1;
  }

  /* ========================================
     BENTO GRID - Desktop
     ======================================== */

  .bento-grid {
    display: grid;
    grid-template-columns: 320px 1fr 1fr;
    grid-template-rows: auto auto 1fr;
    grid-template-areas:
      "hero hero hero"
      "profile challenge support"
      "profile modules modules";
    gap: 20px;
    max-width: 1400px;
    margin: 0 auto;
    min-height: calc(100vh - 48px);
  }

  /* ========================================
     HERO SECTION
     ======================================== */

  .bento-hero {
    grid-area: hero;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32px 40px;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 24px;
    position: relative;
    overflow: hidden;
  }

  .hero-content h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: -0.02em;
  }

  .hero-content p {
    margin: 8px 0 0;
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .hero-decoration {
    font-size: 48px;
    color: rgba(16, 185, 129, 0.3);
  }

  /* ========================================
     PROFILE CARD
     ======================================== */

  .bento-profile {
    grid-area: profile;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 24px;
    background: rgba(99, 102, 241, 0.08);
    border: 1px solid rgba(99, 102, 241, 0.15);
    border-radius: 24px;
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

  .bento-challenge {
    grid-area: challenge;
  }

  .bento-support {
    grid-area: support;
  }

  .bento-challenge,
  .bento-support {
    min-height: 180px;
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
     MODULE CARDS - RICH COLORED
     ======================================== */

  .bento-modules {
    grid-area: modules;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .modules-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
  }

  .modules-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    flex: 1;
  }

  .module-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    min-height: 120px;
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
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }

  .module-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  }

  .module-card:focus {
    outline: 3px solid white;
    outline-offset: 2px;
  }

  .module-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 14px;
    font-size: 22px;
    color: white;
  }

  .module-icon :global(i) {
    color: white;
  }

  .module-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .module-label {
    font-size: 1.125rem;
    font-weight: 700;
    color: white;
  }

  .module-desc {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.3;
  }

  /* ========================================
     MOBILE LAYOUT
     ======================================== */

  .bento-grid.mobile {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    grid-template-areas:
      "hero"
      "profile"
      "challenge"
      "support"
      "modules";
    gap: 16px;
    min-height: auto;
  }

  .bento-grid.mobile .bento-hero {
    padding: 24px;
  }

  .bento-grid.mobile .hero-content h1 {
    font-size: 1.5rem;
  }

  .bento-grid.mobile .hero-decoration {
    display: none;
  }

  .bento-grid.mobile .bento-profile {
    padding: 20px;
  }

  .bento-grid.mobile .profile-avatar {
    width: 48px;
    height: 48px;
    border-radius: 12px;
  }

  .bento-grid.mobile .bento-challenge,
  .bento-grid.mobile .bento-support {
    min-height: auto;
  }

  .bento-grid.mobile .modules-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .bento-grid.mobile .module-card {
    min-height: 100px;
    padding: 16px;
  }

  .bento-grid.mobile .module-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .bento-grid.mobile .module-label {
    font-size: 1rem;
  }

  .bento-grid.mobile .module-desc {
    font-size: 0.75rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Drawer Body */
  .drawer-body {
    padding: 20px;
  }

  /* ========================================
     RESPONSIVE BREAKPOINTS
     ======================================== */

  @media (max-width: 1200px) {
    .bento-grid {
      grid-template-columns: 280px 1fr 1fr;
    }
  }

  @media (max-width: 1024px) {
    .bento-grid {
      grid-template-columns: 1fr 1fr;
      grid-template-areas:
        "hero hero"
        "profile challenge"
        "profile support"
        "modules modules";
    }

    .modules-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 768px) {
    .dashboard {
      padding: 16px;
    }

    .bento-grid {
      grid-template-columns: 1fr;
      grid-template-areas:
        "hero"
        "profile"
        "challenge"
        "support"
        "modules";
      gap: 16px;
    }

    .modules-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .bento-hero {
      padding: 24px;
      border-radius: 20px;
    }

    .hero-content h1 {
      font-size: 1.5rem;
    }

    .hero-decoration {
      display: none;
    }

    .bento-profile {
      padding: 20px;
      border-radius: 20px;
    }

    .module-card {
      min-height: 100px;
      padding: 16px;
      border-radius: 16px;
    }

    .module-icon {
      width: 40px;
      height: 40px;
      font-size: 18px;
      border-radius: 12px;
    }

    .module-label {
      font-size: 1rem;
    }

    .module-desc {
      font-size: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    .dashboard {
      padding: 12px;
    }

    .bento-hero {
      padding: 20px;
    }

    .hero-content h1 {
      font-size: 1.25rem;
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

    .modules-grid {
      gap: 10px;
    }

    .module-card {
      min-height: 90px;
      padding: 14px;
      gap: 10px;
    }

    .module-icon {
      width: 36px;
      height: 36px;
      font-size: 16px;
      border-radius: 10px;
    }

    .module-label {
      font-size: 0.875rem;
    }

    .module-desc {
      display: none;
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
  }
</style>

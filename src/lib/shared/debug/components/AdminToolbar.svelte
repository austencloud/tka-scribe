<!--
  AdminToolbar - Admin debug tools orchestrator

  Desktop: Top bar with F9 toggle
  Mobile: Bottom sheet triggered by long-press on nav

  Features:
  - Quick access user chips
  - User search for previewing
  - Tab intro reset
  - First-run wizard preview
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { featureFlagService } from "$lib/shared/auth/services/FeatureFlagService.svelte";
  import {
    userPreviewState,
    loadUserPreview,
    clearUserPreview,
  } from "$lib/shared/debug/state/user-preview-state.svelte";
  import { adminToolbarState } from "$lib/shared/debug/state/admin-toolbar-state.svelte";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { getTabIntroContent } from "$lib/shared/onboarding/config/tab-intro-content";
  import { firstRunState } from "$lib/shared/onboarding/state/first-run-state.svelte.ts";
  import type { UserRole } from "$lib/shared/auth/domain/models/UserRole";
  import { container } from "$lib/shared/inversify/container";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IQuickAccessPersister, QuickAccessUser } from "../services/contracts/IQuickAccessPersister";
  import AdminToolbarDesktop from "./AdminToolbarDesktop.svelte";
  import AdminToolbarMobile from "./AdminToolbarMobile.svelte";

  // Responsive breakpoint
  const MOBILE_BREAKPOINT = 768;
  let windowWidth = $state(typeof window !== "undefined" ? window.innerWidth : 1024);
  const isMobile = $derived(windowWidth < MOBILE_BREAKPOINT);

  $effect(() => {
    if (typeof window === "undefined") return;

    // Update immediately in case we're in DevTools mobile simulation
    windowWidth = window.innerWidth;

    const handleResize = () => {
      windowWidth = window.innerWidth;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  // Quick Access Service (resolved lazily since admin module loads async)
  let quickAccessPersister: IQuickAccessPersister | null = $state(null);

  // State
  let quickAccessUsers = $state<QuickAccessUser[]>([]);
  let introResetMessage = $state<string | null>(null);

  // Derived - Admin check
  const actualRole = $derived(featureFlagService.userRole);
  const isAdmin = $derived(actualRole === "admin");
  const isOpen = $derived(adminToolbarState.isOpen);
  const isSearchOpen = $derived(adminToolbarState.isSearchOpen);

  // Derived - Preview state
  const isUserPreview = $derived(userPreviewState.isActive);
  const previewProfile = $derived(userPreviewState.data.profile);

  // Show toolbar if F9 is toggled OR user is being previewed
  const showToolbar = $derived(isAdmin && (isOpen || isUserPreview));

  // Tab Intro
  const currentModule = $derived(navigationState.currentModule);
  const currentTab = $derived(navigationState.activeTab);
  const currentIntro = $derived(
    currentModule && currentTab
      ? getTabIntroContent(currentModule, currentTab)
      : null
  );

  const canResetIntro = $derived(() => {
    if (!currentModule || !currentTab || !currentIntro) return false;
    if (typeof localStorage === "undefined") return false;
    const key = `tabIntroSeen:${currentModule}:${currentTab}`;
    return localStorage.getItem(key) === "true";
  });

  // Check if current preview user is in quick access
  const isCurrentUserInQuickAccess = $derived(
    previewProfile && quickAccessPersister ? quickAccessPersister.has(previewProfile.uid) : false
  );

  // Quick Access Functions
  function addToQuickAccess() {
    if (!previewProfile || !quickAccessPersister) return;
    const newUser: QuickAccessUser = {
      uid: previewProfile.uid,
      displayName: previewProfile.displayName || previewProfile.email || "Unknown",
      email: previewProfile.email || "",
      photoURL: previewProfile.photoURL,
    };
    quickAccessUsers = quickAccessPersister.add(newUser);
  }

  function removeFromQuickAccess(uid: string) {
    if (!quickAccessPersister) return;
    quickAccessUsers = quickAccessPersister.remove(uid);
  }

  async function selectUser(user: { uid: string; displayName: string; email: string }) {
    await loadUserPreview(user.uid, true);
    const previewedRole = userPreviewState.data.profile?.role as UserRole | undefined;
    if (previewedRole) {
      featureFlagService.setDebugRoleOverride(previewedRole);
    }
    adminToolbarState.closeSearch();
  }

  function handleClearPreview() {
    clearUserPreview();
    featureFlagService.clearDebugRoleOverride();
  }

  function resetTabIntro() {
    if (!currentModule || !currentTab || !currentIntro) return;
    const key = `tabIntroSeen:${currentModule}:${currentTab}`;
    localStorage.removeItem(key);
    introResetMessage = `Reset "${currentIntro.title}"`;
    setTimeout(() => {
      introResetMessage = null;
    }, 2000);
  }

  function previewFirstRunWizard() {
    firstRunState.forceShow();
    introResetMessage = "First-run wizard opened";
    setTimeout(() => {
      introResetMessage = null;
    }, 2000);
  }

  function handleClose() {
    adminToolbarState.close();
  }

  function handleToggleSearch() {
    adminToolbarState.toggleSearch();
  }

  onMount(() => {
    // Resolve the service after mount (admin module loads async in Tier 2)
    const tryResolve = () => {
      try {
        quickAccessPersister = container.get<IQuickAccessPersister>(TYPES.IQuickAccessPersister);
        quickAccessUsers = quickAccessPersister.load();
        return true;
      } catch {
        return false;
      }
    };

    // Try immediately, then retry after a short delay if not available
    if (!tryResolve()) {
      // Retry after Tier 2 modules should be loaded
      setTimeout(() => {
        tryResolve();
      }, 500);
    }
  });
</script>

{#if showToolbar}
  {#if isMobile}
    <AdminToolbarMobile
      {quickAccessUsers}
      {previewProfile}
      {isUserPreview}
      {isSearchOpen}
      isLoading={userPreviewState.isLoading}
      {introResetMessage}
      canResetIntro={canResetIntro()}
      {isCurrentUserInQuickAccess}
      onSelectUser={selectUser}
      onRemoveFromQuickAccess={removeFromQuickAccess}
      onAddToQuickAccess={addToQuickAccess}
      onClearPreview={handleClearPreview}
      onToggleSearch={handleToggleSearch}
      onResetTabIntro={resetTabIntro}
      onPreviewFirstRun={previewFirstRunWizard}
      onClose={handleClose}
    />
  {:else}
    <AdminToolbarDesktop
      {quickAccessUsers}
      {previewProfile}
      {isUserPreview}
      {isSearchOpen}
      isLoading={userPreviewState.isLoading}
      {introResetMessage}
      canResetIntro={canResetIntro()}
      currentIntroTitle={currentIntro?.title || null}
      {isCurrentUserInQuickAccess}
      onSelectUser={selectUser}
      onRemoveFromQuickAccess={removeFromQuickAccess}
      onAddToQuickAccess={addToQuickAccess}
      onClearPreview={handleClearPreview}
      onToggleSearch={handleToggleSearch}
      onResetTabIntro={resetTabIntro}
      onPreviewFirstRun={previewFirstRunWizard}
      onClose={handleClose}
    />
  {/if}
{/if}

<!-- Persistent Impersonation Banner - Shows when previewing a user, even when panel is closed -->
{#if isAdmin && isUserPreview && previewProfile && !isOpen}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="impersonation-banner"
    class:mobile={isMobile}
    onclick={() => adminToolbarState.open()}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') adminToolbarState.open(); }}
    role="button"
    tabindex="0"
    transition:slide={{ duration: 150 }}
  >
    <i class="fas fa-eye" aria-hidden="true"></i>
    <span class="banner-text">Viewing as: {previewProfile.displayName || previewProfile.email}</span>
    <button
      type="button"
      class="banner-exit"
      onclick={(e) => { e.stopPropagation(); handleClearPreview(); }}
      aria-label="Exit preview"
    >
      <i class="fas fa-times" aria-hidden="true"></i>
    </button>
  </div>
{/if}

<style>
  /* Persistent Impersonation Banner - Shows when previewing a user with admin panel closed */
  .impersonation-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9990;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 32px;
    padding: 0 16px;
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.9) 0%, rgba(99, 102, 241, 0.9) 100%);
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    font-size: var(--font-size-compact);
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .impersonation-banner:hover {
    background: linear-gradient(90deg, rgba(59, 130, 246, 1) 0%, rgba(99, 102, 241, 1) 100%);
  }

  .impersonation-banner i:first-child {
    font-size: var(--font-size-sm);
    opacity: 0.9;
  }

  .banner-text {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .banner-exit {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    margin-left: 8px;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    color: white;
    font-size: var(--font-size-xs);
    cursor: pointer;
    transition: all 0.15s;
  }

  .banner-exit:hover {
    background: rgba(239, 68, 68, 0.8);
  }

  /* Mobile: Position at bottom, above bottom nav */
  .impersonation-banner.mobile {
    top: auto;
    bottom: calc(56px + env(safe-area-inset-bottom, 0px));
    border-bottom: none;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.3);
  }
</style>

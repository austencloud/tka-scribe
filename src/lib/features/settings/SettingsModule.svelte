<!--
  SettingsModule.svelte - Settings as a proper module

  Layout: Single scrollable page with section headers (iOS Settings style)
  No tabs - just one continuous page with clear sections

  Sections: Profile, Props, Appearance, Display, Advanced
  Accessed via gear icon in sidebar footer (not in main module list)
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import {
    getSettings,
    updateSettings,
  } from "$lib/shared/application/state/app-state.svelte";
  import { areServicesInitialized } from "$lib/shared/application/state/services.svelte";
  import IOSSkeletonLoader from "$lib/shared/settings/components/IOSSkeletonLoader.svelte";
  import Toast from "$lib/shared/settings/components/Toast.svelte";

  // Import all tab components directly
  import ProfileTab from "$lib/shared/settings/components/tabs/ProfileTab.svelte";
  import PropTypeTab from "$lib/shared/settings/components/tabs/PropTypeTab.svelte";
  import BackgroundTab from "$lib/shared/settings/components/tabs/background/BackgroundTab.svelte";
  import VisibilityTab from "$lib/shared/settings/components/tabs/VisibilityTab.svelte";
  import AccessibilityTab from "$lib/shared/settings/components/tabs/AccessibilityTab.svelte";
  import AISettingsTab from "$lib/shared/settings/components/tabs/AISettingsTab.svelte";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte";

  // Services
  let hapticService: IHapticFeedbackService | null = $state(null);

  // Reactive settings - derives from getSettings() to maintain reactivity
  let settings = $derived(getSettings());

  // Toast notification state
  let showToast = $state(false);
  let toastMessage = $state("Settings saved");

  // Check if settings are loaded AND services are initialized
  const isSettingsLoaded = $derived(
    settings &&
      typeof settings === "object" &&
      Object.keys(settings).length > 0 &&
      areServicesInitialized()
  );

  onMount(() => {
    // Resolve services
    (async () => {
      hapticService = await resolve<IHapticFeedbackService>(
        TYPES.IHapticFeedbackService
      );
    })();
  });

  // Adapter for settings updates with instant save
  async function handleSettingUpdate(event: { key: string; value: unknown }) {
    // Create updated settings object with the change
    const updatedSettings = { ...settings, [event.key]: event.value };

    // Apply changes immediately - this will trigger reactivity
    await updateSettings(updatedSettings);

    // Show success toast
    showToast = true;
    toastMessage = "Settings saved";

    // Reset toast after it displays
    setTimeout(() => {
      showToast = false;
    }, 100);
  }

  // Section configuration
  const sections = [
    { id: "profile", label: "Profile", icon: "fa-user" },
    { id: "props", label: "Props", icon: "fa-tags" },
    { id: "appearance", label: "Appearance", icon: "fa-palette" },
    { id: "display", label: "Display", icon: "fa-eye" },
    { id: "advanced", label: "Advanced", icon: "fa-sliders-h" },
  ];

  const navSections = $derived([
    ...sections,
    ...(authStore.isAdmin
      ? [{ id: "ai-analysis", label: "AI Analysis", icon: "fa-robot" }]
      : []),
  ]);

  let scrollContainer = $state<HTMLElement | null>(null);
  let activeSection = $state<string>(sections[0]?.id ?? "profile");
  let sectionRefs = $state<Record<string, HTMLElement | null>>({});
  let searchTerm = $state("");

  function registerSection(id: string) {
    return (node: HTMLElement) => {
      sectionRefs = { ...sectionRefs, [id]: node };

      return {
        destroy() {
          sectionRefs = { ...sectionRefs, [id]: null };
        },
      };
    };
  }

  function scrollToSection(id: string) {
    const target = sectionRefs[id];
    if (!target || !scrollContainer) return;

    const offset = 18;
    const top = target.offsetTop - offset;

    scrollContainer.scrollTo({
      top,
      behavior: "smooth",
    });

    activeSection = id;
  }

  function handleSearchSubmit(event: Event) {
    event.preventDefault();
    if (!searchTerm) return;

    const match = navSections.find((section) =>
      section.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (match) {
      scrollToSection(match.id);
    }
  }

  $effect(() => {
    if (!scrollContainer) return;

    const nodes = Object.values(sectionRefs).filter(
      (node): node is HTMLElement => Boolean(node)
    );

    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top ||
              b.intersectionRatio - a.intersectionRatio
          );

        if (visible[0]) {
          activeSection = visible[0].target.id;
        }
      },
      {
        root: scrollContainer,
        threshold: [0.2, 0.45, 0.65],
        rootMargin: "-6% 0px -32% 0px",
      }
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  });
</script>

<div class="settings-module">
  {#if !isSettingsLoaded}
    <div class="loading-state">
      <IOSSkeletonLoader variant="toggle" count={8} />
    </div>
  {:else}
    <div class="settings-scaffold">
      <main class="settings-content" bind:this={scrollContainer}>
        <div class="settings-topbar">
          <div>
            <p class="eyebrow">Control Center</p>
            <div class="topbar-title">
              <h1>Settings</h1>
              <span class="pill">2026 navigation</span>
            </div>
            <p class="subtitle">
              Jump to any surface instantly, keep essentials in reach, and skip
              the endless scroll.
            </p>
          </div>
          <form class="topbar-search" on:submit={handleSearchSubmit}>
            <div class="search-field">
              <i class="fas fa-magnifying-glass" aria-hidden="true"></i>
              <input
                type="search"
                name="settings-search"
                placeholder="Search or jump (e.g. Appearance, AI, Audio)"
                bind:value={searchTerm}
                autocomplete="off"
              />
              <button type="submit">Jump</button>
            </div>
            <div class="quick-links" aria-label="Common destinations">
              <button
                type="button"
                on:click={() => scrollToSection("appearance")}
              >
                <i class="fas fa-wand-magic-sparkles" aria-hidden="true"></i>
                Theme
              </button>
              <button type="button" on:click={() => scrollToSection("display")}>
                <i class="fas fa-eye" aria-hidden="true"></i>
                Display
              </button>
              <button type="button" on:click={() => scrollToSection("advanced")}>
                <i class="fas fa-sliders-h" aria-hidden="true"></i>
                Advanced
              </button>
            </div>
          </form>
        </div>

        <div class="chip-nav" aria-label="Settings sections">
          {#each navSections as section}
            <button
              type="button"
              class:active={activeSection === section.id}
              on:click={() => scrollToSection(section.id)}
            >
              <i class={`fas ${section.icon}`} aria-hidden="true"></i>
              <span>{section.label}</span>
            </button>
          {/each}
        </div>

        <!-- Profile Section -->
        <section
          class="settings-section"
          id="profile"
          use:registerSection={"profile"}
          data-section="profile"
        >
          <header class="section-header">
            <i class="fas fa-user"></i>
            <h2>Profile</h2>
          </header>
          <div class="section-content">
            <ProfileTab
              currentSettings={settings}
              onSettingUpdate={handleSettingUpdate}
            />
          </div>
        </section>

        <!-- Props Section -->
        <section
          class="settings-section"
          id="props"
          use:registerSection={"props"}
          data-section="props"
        >
          <header class="section-header">
            <i class="fas fa-tags"></i>
            <h2>Props</h2>
          </header>
          <div class="section-content">
            <PropTypeTab {settings} onUpdate={handleSettingUpdate} />
          </div>
        </section>

        <!-- Appearance Section -->
        <section
          class="settings-section"
          id="appearance"
          use:registerSection={"appearance"}
          data-section="appearance"
        >
          <header class="section-header">
            <i class="fas fa-palette"></i>
            <h2>Appearance</h2>
          </header>
          <div class="section-content">
            <BackgroundTab {settings} onUpdate={handleSettingUpdate} />
          </div>
        </section>

        <!-- Display Section -->
        <section
          class="settings-section"
          id="display"
          use:registerSection={"display"}
          data-section="display"
        >
          <header class="section-header">
            <i class="fas fa-eye"></i>
            <h2>Display</h2>
          </header>
          <div class="section-content">
            <VisibilityTab
              currentSettings={settings}
              onSettingUpdate={handleSettingUpdate}
            />
          </div>
        </section>

        <!-- Advanced Section -->
        <section
          class="settings-section"
          id="advanced"
          use:registerSection={"advanced"}
          data-section="advanced"
        >
          <header class="section-header">
            <i class="fas fa-sliders-h"></i>
            <h2>Advanced</h2>
          </header>
          <div class="section-content">
            <AccessibilityTab
              currentSettings={settings}
              onSettingUpdate={handleSettingUpdate}
            />
          </div>
        </section>

        <!-- AI Analysis Section (Admin Only) -->
        {#if authStore.isAdmin}
          <section
            class="settings-section"
            id="ai-analysis"
            use:registerSection={"ai-analysis"}
            data-section="ai-analysis"
          >
            <header class="section-header">
              <i class="fas fa-robot"></i>
              <h2>AI Analysis</h2>
              <span class="admin-badge">Admin</span>
            </header>
            <div class="section-content">
              <AISettingsTab onSettingUpdate={handleSettingUpdate} />
            </div>
          </section>
        {/if}
      </main>

      <aside class="settings-rail" aria-label="Settings map">
        <div class="rail-header">
          <p class="eyebrow">Jump rail</p>
          <p class="rail-subtitle">Scroll-aware, keyboard focusable, instant jumps.</p>
        </div>
        <div class="rail-items">
          {#each navSections as section}
            <button
              type="button"
              class:active={activeSection === section.id}
              on:click={() => scrollToSection(section.id)}
            >
              <span class="rail-indicator" aria-hidden="true"></span>
              <div class="rail-label">
                <i class={`fas ${section.icon}`} aria-hidden="true"></i>
                <span>{section.label}</span>
              </div>
              <span class="rail-action">Jump</span>
            </button>
          {/each}
        </div>
      </aside>
    </div>
  {/if}

  <!-- Toast Notification -->
  <Toast show={showToast} message={toastMessage} />
</div>

<style>
  .settings-module {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: transparent;
    color: var(--foreground, #ffffff);
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  /* Single scrollable content area */
  .settings-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
    padding: clamp(16px, 3vw, 32px);
    padding-bottom: calc(
      clamp(16px, 3vw, 32px) + 80px
    ); /* Extra padding for bottom nav */
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  }

  .settings-content::-webkit-scrollbar {
    width: 6px;
  }

  .settings-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .settings-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  /* Section styling */
  .settings-section {
    max-width: 800px;
    margin: 0 auto 48px;
  }

  .settings-section:last-child {
    margin-bottom: 0;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 0;
    margin-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: sticky;
    top: 0;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(12px);
    z-index: 10;
  }

  .section-header i {
    font-size: 20px;
    color: rgba(99, 102, 241, 0.9);
    width: 28px;
    text-align: center;
  }

  .section-header h2 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: -0.02em;
  }

  .admin-badge {
    padding: 4px 10px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    color: #ef4444;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* .section-content - tab components handle their own padding/spacing */

  .loading-state {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: clamp(16px, 3vw, 32px);
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .settings-content {
      padding: 16px;
      padding-bottom: calc(
        16px + 100px
      ); /* More space for bottom nav on mobile */
    }

    .settings-section {
      margin-bottom: 32px;
    }

    .section-header {
      padding: 12px 0;
      margin-bottom: 12px;
    }

    .section-header i {
      font-size: 18px;
      width: 24px;
    }

    .section-header h2 {
      font-size: 16px;
    }
  }

  /* Small mobile */
  @media (max-width: 480px) {
    .settings-content {
      padding: 12px;
      padding-bottom: calc(12px + 100px);
    }

    .settings-section {
      margin-bottom: 24px;
    }

    .section-header {
      gap: 8px;
      padding: 10px 0;
      margin-bottom: 10px;
    }

    .section-header i {
      font-size: 16px;
      width: 20px;
    }

    .section-header h2 {
      font-size: 15px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .settings-content {
      scroll-behavior: auto;
    }
  }
</style>

<!--
  Responsive Test Harness

  Desktop on top, mobile portrait + landscape below.
  Each viewport is an independent app instance via iframes.
  Preferences persist to localStorage.
-->
<script lang="ts">
  import { onMount } from "svelte";

  const STORAGE_KEY = "responsive-test-prefs";

  // Viewport configurations
  type ViewportConfig = {
    name: string;
    width: number;
    height: number;
  };

  const mobileViewports: ViewportConfig[] = [
    { name: "iPhone SE", width: 375, height: 667 },
    { name: "iPhone 14", width: 390, height: 844 },
    { name: "iPhone 14 Pro Max", width: 430, height: 932 },
    { name: "Pixel 7", width: 412, height: 915 },
    { name: "Galaxy S21", width: 360, height: 800 },
  ];

  const desktopViewports: ViewportConfig[] = [
    { name: "Laptop", width: 1366, height: 768 },
    { name: "Desktop HD", width: 1920, height: 1080 },
    { name: "Tablet", width: 1024, height: 768 },
    { name: "Small Laptop", width: 1280, height: 720 },
  ];

  // State with defaults
  let selectedMobileIndex = $state(0);
  let selectedDesktopIndex = $state(0);
  let desktopScale = $state(0.5);
  let mobileScale = $state(0.55);
  let showDesktop = $state(true);
  let showPortrait = $state(true);
  let showLandscape = $state(true);
  let sidebarCollapsed = $state(false);

  // Iframe refs for refresh
  let desktopIframe = $state<HTMLIFrameElement | null>(null);
  let portraitIframe = $state<HTMLIFrameElement | null>(null);
  let landscapeIframe = $state<HTMLIFrameElement | null>(null);

  const mobileVp = $derived(mobileViewports[selectedMobileIndex]!);
  const desktopVp = $derived(desktopViewports[selectedDesktopIndex]!);

  // Landscape is just swapped dimensions
  const landscapeVp = $derived({
    name: mobileVp.name + " (Landscape)",
    width: mobileVp.height,
    height: mobileVp.width,
  });

  // Get base URL for iframes
  let baseUrl = $state("");

  // Load preferences from localStorage
  onMount(() => {
    baseUrl = window.location.origin;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const prefs = JSON.parse(saved);
        if (typeof prefs.selectedMobileIndex === "number") selectedMobileIndex = prefs.selectedMobileIndex;
        if (typeof prefs.selectedDesktopIndex === "number") selectedDesktopIndex = prefs.selectedDesktopIndex;
        if (typeof prefs.desktopScale === "number") desktopScale = prefs.desktopScale;
        if (typeof prefs.mobileScale === "number") mobileScale = prefs.mobileScale;
        if (typeof prefs.showDesktop === "boolean") showDesktop = prefs.showDesktop;
        if (typeof prefs.showPortrait === "boolean") showPortrait = prefs.showPortrait;
        if (typeof prefs.showLandscape === "boolean") showLandscape = prefs.showLandscape;
        if (typeof prefs.sidebarCollapsed === "boolean") sidebarCollapsed = prefs.sidebarCollapsed;
      }
    } catch (e) {
      console.warn("Failed to load preferences:", e);
    }
  });

  // Save preferences when they change
  $effect(() => {
    if (!baseUrl) return; // Don't save until mounted

    const prefs = {
      selectedMobileIndex,
      selectedDesktopIndex,
      desktopScale,
      mobileScale,
      showDesktop,
      showPortrait,
      showLandscape,
      sidebarCollapsed,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      // Ignore storage errors
    }
  });

  function refreshAll() {
    if (desktopIframe) desktopIframe.src = desktopIframe.src;
    if (portraitIframe) portraitIframe.src = portraitIframe.src;
    if (landscapeIframe) landscapeIframe.src = landscapeIframe.src;
  }

  function refreshDesktop() {
    if (desktopIframe) desktopIframe.src = desktopIframe.src;
  }

  function refreshMobile() {
    if (portraitIframe) portraitIframe.src = portraitIframe.src;
    if (landscapeIframe) landscapeIframe.src = landscapeIframe.src;
  }

  function toggleSidebar() {
    sidebarCollapsed = !sidebarCollapsed;
  }
</script>

<div class="harness" class:sidebar-collapsed={sidebarCollapsed}>
  <!-- Sidebar Toggle (visible when collapsed) -->
  <button
    class="sidebar-toggle"
    class:collapsed={sidebarCollapsed}
    onclick={toggleSidebar}
    aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
  >
    <i class="fas fa-{sidebarCollapsed ? 'chevron-right' : 'chevron-left'}"></i>
  </button>

  <!-- Sidebar Controls -->
  <aside class="sidebar" class:collapsed={sidebarCollapsed}>
    <div class="header">
      <h1>Responsive Test</h1>
      <button class="collapse-btn" onclick={toggleSidebar} aria-label="Collapse sidebar">
        <i class="fas fa-chevron-left"></i>
      </button>
    </div>

    <!-- Visibility Toggles -->
    <div class="control">
      <h3>Show Viewports</h3>
      <div class="toggles">
        <label class="toggle">
          <input type="checkbox" bind:checked={showDesktop} />
          <span>Desktop</span>
        </label>
        <label class="toggle">
          <input type="checkbox" bind:checked={showPortrait} />
          <span>Portrait</span>
        </label>
        <label class="toggle">
          <input type="checkbox" bind:checked={showLandscape} />
          <span>Landscape</span>
        </label>
      </div>
    </div>

    <!-- Desktop Scale -->
    {#if showDesktop}
      <div class="control">
        <label>
          Desktop: {(desktopScale * 100).toFixed(0)}%
          <input type="range" min="0.25" max="0.7" step="0.05" bind:value={desktopScale} />
        </label>
      </div>
    {/if}

    <!-- Mobile Scale -->
    {#if showPortrait || showLandscape}
      <div class="control">
        <label>
          Mobile: {(mobileScale * 100).toFixed(0)}%
          <input type="range" min="0.35" max="0.8" step="0.05" bind:value={mobileScale} />
        </label>
      </div>
    {/if}

    <!-- Desktop Size -->
    {#if showDesktop}
      <div class="control">
        <h3>Desktop Size</h3>
        <div class="device-list">
          {#each desktopViewports as vp, i}
            <button
              class="device-btn"
              class:active={selectedDesktopIndex === i}
              onclick={() => selectedDesktopIndex = i}
            >
              <span>{vp.name}</span>
              <span class="dims">{vp.width}×{vp.height}</span>
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Mobile Device -->
    {#if showPortrait || showLandscape}
      <div class="control">
        <h3>Mobile Device</h3>
        <div class="device-list">
          {#each mobileViewports as vp, i}
            <button
              class="device-btn"
              class:active={selectedMobileIndex === i}
              onclick={() => selectedMobileIndex = i}
            >
              <span>{vp.name}</span>
              <span class="dims">{vp.width}×{vp.height}</span>
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Refresh Controls -->
    <div class="control">
      <h3>Actions</h3>
      <div class="actions">
        <button class="action-btn primary" onclick={refreshAll}>
          <i class="fas fa-sync"></i> Refresh All
        </button>
        {#if showDesktop}
          <button class="action-btn" onclick={refreshDesktop}>
            <i class="fas fa-desktop"></i> Desktop
          </button>
        {/if}
        {#if showPortrait || showLandscape}
          <button class="action-btn" onclick={refreshMobile}>
            <i class="fas fa-mobile-alt"></i> Mobile
          </button>
        {/if}
      </div>
    </div>

    <div class="status">
      <i class="fas fa-save"></i>
      Preferences auto-saved
    </div>
  </aside>

  <!-- Preview Area -->
  <main class="preview">
    {#if baseUrl}
      <!-- Desktop Row -->
      {#if showDesktop}
        <section class="desktop-section">
          <div class="section-header">
            <i class="fas fa-desktop"></i>
            <span>Desktop</span>
            <span class="device-name">{desktopVp.name}</span>
            <span class="dims">{desktopVp.width}×{desktopVp.height}</span>
          </div>
          <div
            class="frame desktop"
            style="
              width: {desktopVp.width * desktopScale}px;
              height: {desktopVp.height * desktopScale}px;
            "
          >
            <iframe
              bind:this={desktopIframe}
              src={baseUrl}
              title="Desktop Preview"
              style="
                width: {desktopVp.width}px;
                height: {desktopVp.height}px;
                transform: scale({desktopScale});
                transform-origin: top left;
              "
            ></iframe>
          </div>
        </section>
      {/if}

      <!-- Mobile Row -->
      {#if showPortrait || showLandscape}
        <section class="mobile-section">
          <!-- Portrait -->
          {#if showPortrait}
            <div class="mobile-frame-wrapper">
              <div class="section-header portrait">
                <i class="fas fa-mobile-alt"></i>
                <span>Portrait</span>
                <span class="device-name">{mobileVp.name}</span>
                <span class="dims">{mobileVp.width}×{mobileVp.height}</span>
              </div>
              <div
                class="frame mobile portrait"
                style="
                  width: {mobileVp.width * mobileScale}px;
                  height: {mobileVp.height * mobileScale}px;
                "
              >
                <iframe
                  bind:this={portraitIframe}
                  src={baseUrl}
                  title="Mobile Portrait Preview"
                  style="
                    width: {mobileVp.width}px;
                    height: {mobileVp.height}px;
                    transform: scale({mobileScale});
                    transform-origin: top left;
                  "
                ></iframe>
              </div>
            </div>
          {/if}

          <!-- Landscape -->
          {#if showLandscape}
            <div class="mobile-frame-wrapper">
              <div class="section-header landscape">
                <i class="fas fa-mobile-alt fa-rotate-90"></i>
                <span>Landscape</span>
                <span class="device-name">{mobileVp.name}</span>
                <span class="dims">{landscapeVp.width}×{landscapeVp.height}</span>
              </div>
              <div
                class="frame mobile landscape"
                style="
                  width: {landscapeVp.width * mobileScale}px;
                  height: {landscapeVp.height * mobileScale}px;
                "
              >
                <iframe
                  bind:this={landscapeIframe}
                  src={baseUrl}
                  title="Mobile Landscape Preview"
                  style="
                    width: {landscapeVp.width}px;
                    height: {landscapeVp.height}px;
                    transform: scale({mobileScale});
                    transform-origin: top left;
                  "
                ></iframe>
              </div>
            </div>
          {/if}
        </section>
      {/if}
    {/if}
  </main>
</div>

<style>
  .harness {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 260px 1fr;
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
    color: white;
    transition: grid-template-columns 0.3s ease;
  }

  .harness.sidebar-collapsed {
    grid-template-columns: 0 1fr;
  }

  /* Sidebar Toggle Button */
  .sidebar-toggle {
    position: fixed;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 100;
    width: 24px;
    height: 48px;
    background: rgba(139, 92, 246, 0.9);
    border: none;
    border-radius: 0 8px 8px 0;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease, left 0.3s ease;
  }

  .sidebar-toggle.collapsed {
    opacity: 1;
    pointer-events: auto;
  }

  .sidebar-toggle:hover {
    background: rgba(139, 92, 246, 1);
  }

  .sidebar {
    background: rgba(0, 0, 0, 0.4);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1.25rem;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }

  .sidebar.collapsed {
    transform: translateX(-100%);
    opacity: 0;
    pointer-events: none;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header h1 {
    margin: 0;
    font-size: 1.2rem;
    background: linear-gradient(135deg, #06b6d4, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .collapse-btn {
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }

  .collapse-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  .control h3 {
    margin: 0 0 0.5rem;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.5);
  }

  .control label {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
  }

  input[type="range"] {
    width: 100%;
    accent-color: #8b5cf6;
  }

  .toggles {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .toggle {
    flex-direction: row !important;
    align-items: center;
    gap: 0.4rem !important;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .toggle input {
    accent-color: #8b5cf6;
  }

  .device-list {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .device-btn {
    display: flex;
    justify-content: space-between;
    padding: 0.45rem 0.6rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 5px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .device-btn:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .device-btn.active {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.5);
    color: white;
  }

  .dims {
    font-size: 0.65rem;
    opacity: 0.5;
    font-family: monospace;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 0.6rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .action-btn.primary {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.4);
    color: #c4b5fd;
  }

  .action-btn.primary:hover {
    background: rgba(139, 92, 246, 0.3);
  }

  .status {
    margin-top: auto;
    padding: 0.6rem;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 6px;
    font-size: 0.7rem;
    color: #86efac;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .status i { color: #22c55e; }

  /* Preview Area */
  .preview {
    padding: 1.5rem;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Section Headers */
  .section-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: #60a5fa;
  }

  .section-header.portrait { color: #f472b6; }
  .section-header.landscape { color: #a78bfa; }

  .section-header .device-name {
    color: rgba(255, 255, 255, 0.7);
    font-weight: 400;
  }

  .section-header .dims {
    margin-left: auto;
  }

  /* Desktop Section */
  .desktop-section {
    display: flex;
    flex-direction: column;
  }

  /* Mobile Section */
  .mobile-section {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .mobile-frame-wrapper {
    display: flex;
    flex-direction: column;
  }

  /* Frames */
  .frame {
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    overflow: hidden;
    background: #0a0a0a;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    position: relative;
  }

  .frame.desktop {
    border-color: rgba(59, 130, 246, 0.4);
  }

  .frame.mobile {
    border-radius: 20px;
  }

  .frame.mobile.portrait {
    border-color: rgba(236, 72, 153, 0.4);
  }

  .frame.mobile.landscape {
    border-color: rgba(167, 139, 250, 0.4);
    border-radius: 16px;
  }

  .frame iframe {
    border: none;
    display: block;
    background: white;
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .mobile-section {
      flex-direction: column;
    }
  }

  @media (max-width: 800px) {
    .harness {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
    }

    .harness.sidebar-collapsed {
      grid-template-columns: 1fr;
    }

    .sidebar {
      border-right: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      max-height: 35vh;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .sidebar.collapsed {
      transform: translateY(-100%);
      max-height: 0;
      padding: 0;
      border: none;
    }

    .sidebar-toggle {
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 48px;
      height: 24px;
      border-radius: 0 0 8px 8px;
    }

    .sidebar-toggle.collapsed i {
      transform: rotate(90deg);
    }

    .header {
      width: 100%;
    }

    .control {
      min-width: 140px;
    }

    .status {
      width: 100%;
      margin-top: 0;
    }

    .collapse-btn {
      display: none;
    }
  }
</style>

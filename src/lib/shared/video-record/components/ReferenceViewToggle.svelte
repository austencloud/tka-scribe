<!--
  ReferenceViewToggle.svelte

  Adaptive control for reference view selection:
  - Desktop: Simple toggle (Show Animation: ON/OFF)
  - Mobile: Segmented control (Grid | Animation)
-->
<script lang="ts">
  import type { ReferenceViewType } from "../state/video-record-settings.svelte";

  let {
    isMobile = false,
    currentView = "animation",
    onChange = () => {},
  }: {
    isMobile?: boolean;
    currentView?: ReferenceViewType;
    onChange?: (view: ReferenceViewType) => void;
  } = $props();

  function handleDesktopToggle() {
    const newView: ReferenceViewType = currentView === "none" ? "animation" : "none";
    onChange(newView);
  }

  function handleMobileSelect(view: "grid" | "animation") {
    onChange(view);
  }
</script>

{#if isMobile}
  <!-- Mobile: Segmented Control (Grid | Animation) -->
  <div class="segmented-control">
    <button
      class="segment"
      class:active={currentView === "grid"}
      onclick={() => handleMobileSelect("grid")}
    >
      <span class="icon">📐</span>
      <span class="label">Grid</span>
    </button>
    <button
      class="segment"
      class:active={currentView === "animation"}
      onclick={() => handleMobileSelect("animation")}
    >
      <span class="icon">🎬</span>
      <span class="label">Animation</span>
    </button>
  </div>
{:else}
  <!-- Desktop: Simple Toggle -->
  <button
    class="desktop-toggle"
    class:active={currentView === "animation"}
    onclick={handleDesktopToggle}
  >
    <span class="icon">{currentView === "animation" ? "✓" : ""}</span>
    <span class="label">Show Animation</span>
  </button>
{/if}

<style>
  /* Mobile: Segmented Control */
  .segmented-control {
    display: flex;
    gap: 0;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .segment {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 16px;
    background: transparent;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    font-weight: 500;
  }

  .segment:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.8);
  }

  .segment.active {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }

  .segment .icon {
    font-size: 16px;
  }

  .segment .label {
    font-size: 14px;
  }

  /* Desktop: Simple Toggle */
  .desktop-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    font-weight: 500;
  }

  .desktop-toggle:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.8);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .desktop-toggle.active {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border-color: transparent;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }

  .desktop-toggle .icon {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
  }

  .desktop-toggle .label {
    font-size: 14px;
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .segment {
      padding: 8px 12px;
    }

    .segment .label {
      font-size: 13px;
    }
  }
</style>

<!--
Gallery Layout - 3-Button Navigation System

Provides responsive layout with clean 3-button interface:
- View Presets (All, Favorites, Easy, etc.)
- Sort & Jump (Sort method + Quick navigation)
- Advanced Filters
- Auto-hides on scroll
- Center panel for content (full width)
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  // ✅ PURE RUNES: Props using modern Svelte 5 runes
  const {
    viewPresetsDropdown,
    sortAndJumpDropdown,
    advancedFilterButton,
    centerPanel,
    isUIVisible = true,
    hideTopSection = false,
  } = $props<{
    viewPresetsDropdown: Snippet;
    sortAndJumpDropdown: Snippet;
    advancedFilterButton: Snippet;
    centerPanel: Snippet;
    isUIVisible?: boolean;
    hideTopSection?: boolean;
  }>();
</script>

<div class="gallery-layout">
  <!-- Top Section: 3-Button Navigation Bar (auto-hides on scroll, hidden when desktop sidebar is visible) -->
  {#if !hideTopSection}
    <div class="top-section" class:hidden={!isUIVisible}>
      <div class="controls-row">
        <div class="button-group">
          <!-- 1. View Presets Dropdown -->
          <div class="control-button">
            {@render viewPresetsDropdown()}
          </div>

          <!-- 2. Sort & Jump Dropdown -->
          <div class="control-button">
            {@render sortAndJumpDropdown()}
          </div>

          <!-- 3. Advanced Filter Button -->
          <div class="control-button">
            {@render advancedFilterButton()}
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Main Content Area (Full Width) -->
  <div class="explore-content">
    <!-- Center Panel: Content -->
    <div class="center-panel">
      {@render centerPanel()}
    </div>
  </div>
</div>

<style>
  .gallery-layout {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    overflow: hidden;
    background: transparent;
    color: white;
  }

  /* Top Section - Single compact row (auto-hide together) */
  .top-section {
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    max-height: 200px;
    overflow: visible; /* Allow dropdown to show */
    opacity: 1;
    transition:
      opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      padding 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      margin 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .top-section.hidden {
    opacity: 0;
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
    margin-bottom: 0;
    border-bottom-width: 0;
    pointer-events: none; /* Prevent interaction when hidden */
  }

  /* Controls Row - 3-Button Layout */
  .controls-row {
    display: flex;
    align-items: center;
    padding: 14px 16px;
  }

  .button-group {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .control-button {
    flex-shrink: 0;
  }

  /* Main Content Area - Full width content */
  .explore-content {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  /* Center Panel - Content area (full width) */
  .center-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
    background: rgba(255, 255, 255, 0.01);
  }

  /* Mobile-first responsive design */
  @media (max-width: 480px) {
    .gallery-layout {
      height: 100vh;
      height: 100dvh;
    }

    .top-section {
      max-height: 180px;
    }

    .controls-row {
      padding: 12px;
      gap: 10px;
    }

    .center-panel {
      padding: 0;
    }
  }

  /* Tablet responsive design */
  @media (min-width: 481px) and (max-width: 768px) {
    .controls-row {
      padding: 14px;
    }
  }
</style>

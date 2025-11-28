<!--
  ModuleList - Module switching UI component (2026 Premium Compact Grid)

  Displays a compact 2-column grid of available modules for quick selection.
  Optimized for mobile viewports - all modules visible without scrolling.

  Features:
  - Compact 2-column grid layout - fits all modules in viewport
  - Module-specific gradient colors extracted from icon HTML
  - Premium glassmorphic card design with layered backgrounds
  - Icon-focused design with labels (no descriptions for compactness)
  - Active state with subtle glow border
  - Touch-optimized tap targets
-->
<script lang="ts">
  import type { ModuleDefinition, ModuleId } from "../domain/types";
import type { IHapticFeedbackService } from "../../application/services/contracts/IHapticFeedbackService";
import { resolve } from "../../inversify";
import { TYPES } from "../../inversify/types";
  import { onMount } from "svelte";
  import { preloadFeatureModule } from "../../inversify/container";

  let {
    currentModule,
    modules = [],
    onModuleSelect,
  } = $props<{
    currentModule: ModuleId;
    modules: ModuleDefinition[];
    onModuleSelect?: (moduleId: ModuleId) => void;
  }>();

  let hapticService: IHapticFeedbackService;

  // Track drag state to prevent clicks during swipe gestures
  let dragState = $state<{
    isDragging: boolean;
    startY: number;
    startTime: number;
  }>({
    isDragging: false,
    startY: 0,
    startTime: 0,
  });

  // Track hover timers for preloading (2025 standard: 50ms delay)
  let hoverTimers = new Map<ModuleId, number>();

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Filter to main modules and dev modules
  const mainModules = $derived(
    modules.filter((m: ModuleDefinition) => m.isMain)
  );
  const devModules = $derived(
    modules.filter((m: ModuleDefinition) => !m.isMain)
  );

  /**
   * 🎨 Extract primary color from module icon HTML
   * Parses gradient/color values from icon SVG or inline styles
   * Falls back to purple gradient if no color found
   */
  function extractModuleColor(iconHtml: string): string {
    // Try to find gradient color in SVG or inline styles
    const gradientMatch = iconHtml.match(/stop-color[:\s=]["']?([#\w]+)/);
    if (gradientMatch?.[1]) return gradientMatch[1];

    const colorMatch = iconHtml.match(/color[:\s=]["']?([#\w]+)/);
    if (colorMatch?.[1]) return colorMatch[1];

    // Default fallback gradient color
    return "#667eea";
  }

  function handlePointerDown(event: PointerEvent | MouseEvent) {
    dragState.isDragging = false;
    dragState.startY = event.clientY;
    dragState.startTime = Date.now();
  }

  function handlePointerMove(event: PointerEvent | MouseEvent) {
    const deltaY = Math.abs(event.clientY - dragState.startY);
    // If moved more than 10px vertically, consider it a drag
    if (deltaY > 10) {
      dragState.isDragging = true;
    }
  }

  function handleModuleClick(
    moduleId: ModuleId,
    event: PointerEvent | MouseEvent,
    isDisabled: boolean = false
  ) {
    // Don't trigger click for disabled modules
    if (isDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // If user was dragging, don't trigger the click
    if (dragState.isDragging) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // If the pointer was down for more than 300ms and moved, likely a drag
    const duration = Date.now() - dragState.startTime;
    const deltaY = Math.abs(event.clientY - dragState.startY);
    if (duration > 300 && deltaY > 5) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    hapticService?.trigger("selection");
    onModuleSelect?.(moduleId);
  }

  /**
   * ⚡ PERFORMANCE: Hover-based preloading (2025 best practice)
   * Preload module DI services after 50ms hover (user intent detection)
   * By the time user clicks, module is already loaded = instant navigation
   */
  function handleModuleHoverStart(moduleId: ModuleId) {
    // Don't preload if already active
    if (moduleId === currentModule) {
      return;
    }

    // Clear any existing timer
    const existingTimer = hoverTimers.get(moduleId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Start 50ms timer before preloading (industry standard)
    const timer = setTimeout(() => {
      try {
        preloadFeatureModule(moduleId);
      } catch (error) {
        // Silently ignore modules without DI dependencies (e.g., about page)
        console.debug(`Module ${moduleId} has no DI dependencies to preload`);
      }
      hoverTimers.delete(moduleId);
    }, 50) as unknown as number;

    hoverTimers.set(moduleId, timer);
  }

  /**
   * Cancel preload if user moves away before 50ms
   */
  function handleModuleHoverEnd(moduleId: ModuleId) {
    const timer = hoverTimers.get(moduleId);
    if (timer) {
      clearTimeout(timer);
      hoverTimers.delete(moduleId);
    }
  }
</script>

<!-- Main Modules Section - Compact 2-Column Grid -->
<section class="module-section">
  <h3 class="section-title">Modules</h3>
  <div class="module-grid">
    {#each mainModules as module}
      {@const moduleColor = extractModuleColor(module.icon)}
      {@const isActive = currentModule === module.id}
      {@const isDisabled = module.disabled ?? false}

      <button
        class="module-cell"
        class:active={isActive}
        class:disabled={isDisabled}
        onpointerdown={handlePointerDown}
        onpointermove={handlePointerMove}
        onclick={(e) => handleModuleClick(module.id, e, isDisabled)}
        onmouseenter={() => !isDisabled && handleModuleHoverStart(module.id)}
        onmouseleave={() => !isDisabled && handleModuleHoverEnd(module.id)}
        style="--module-color: {moduleColor};"
        aria-disabled={isDisabled}
        disabled={isDisabled}
      >
        <!-- Premium layered background -->
        <div class="cell-background"></div>
        <div class="cell-glow"></div>

        <!-- Content layer -->
        <div class="cell-content">
          <span class="cell-icon">{@html module.icon}</span>
          <span class="cell-label">{module.label}</span>

          <!-- Disabled badge or active indicator -->
          {#if isDisabled && module.disabledMessage}
            <div class="cell-badge">{module.disabledMessage}</div>
          {/if}
        </div>
      </button>
    {/each}
  </div>
</section>

<!-- Developer/Admin Modules Section -->
{#if devModules.length > 0}
  <section class="module-section dev-section">
    <h3 class="section-title">Developer</h3>
    <div class="module-grid dev-grid">
      {#each devModules as module}
        {@const moduleColor = extractModuleColor(module.icon)}
        {@const isActive = currentModule === module.id}
        {@const isDisabled = module.disabled ?? false}

        <button
          class="module-cell"
          class:active={isActive}
          class:disabled={isDisabled}
          onpointerdown={handlePointerDown}
          onpointermove={handlePointerMove}
          onclick={(e) => handleModuleClick(module.id, e, isDisabled)}
          onmouseenter={() => !isDisabled && handleModuleHoverStart(module.id)}
          onmouseleave={() => !isDisabled && handleModuleHoverEnd(module.id)}
          style="--module-color: {moduleColor};"
          aria-disabled={isDisabled}
          disabled={isDisabled}
        >
          <!-- Premium layered background -->
          <div class="cell-background"></div>
          <div class="cell-glow"></div>

          <!-- Content layer -->
          <div class="cell-content">
            <span class="cell-icon">{@html module.icon}</span>
            <span class="cell-label">{module.label}</span>

            <!-- Disabled badge -->
            {#if isDisabled && module.disabledMessage}
              <div class="cell-badge">{module.disabledMessage}</div>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </section>
{/if}

<style>
  /* ============================================================================
     2026 PREMIUM COMPACT GRID DESIGN
     Optimized for mobile - all modules visible without scrolling
     ============================================================================ */

  .module-section {
    margin-bottom: 20px;
  }

  .module-section:last-child {
    margin-bottom: 0;
  }

  .dev-section {
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .section-title {
    margin: 0 0 12px 4px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: rgba(255, 255, 255, 0.45);
  }

  /* ============================================================================
     2-COLUMN GRID LAYOUT
     ============================================================================ */
  .module-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  /* Developer grid - single column if only one item */
  .dev-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }

  /* ============================================================================
     MODULE CELL - COMPACT CARD DESIGN
     ============================================================================ */
  .module-cell {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 88px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 14px;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    text-align: center;
    overflow: hidden;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    isolation: isolate;
  }

  /* Layered Background System */
  .cell-background {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.07) 0%,
      rgba(255, 255, 255, 0.03) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 0;
  }

  .cell-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at 50% 40%,
      var(--module-color, #667eea) 0%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;
    mix-blend-mode: screen;
  }

  /* Content Layer */
  .cell-content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 14px 8px;
    width: 100%;
    z-index: 2;
  }

  /* ============================================================================
     HOVER STATES
     ============================================================================ */
  .module-cell:hover .cell-background {
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.11) 0%,
      rgba(255, 255, 255, 0.05) 100%
    );
    border-color: rgba(255, 255, 255, 0.16);
  }

  .module-cell:hover .cell-glow {
    opacity: 0.06;
  }

  .module-cell:hover {
    transform: scale(1.02);
  }

  /* ============================================================================
     ACTIVE STATE - MODULE-SPECIFIC COLORS
     ============================================================================ */
  .module-cell.active .cell-background {
    background: linear-gradient(
      145deg,
      color-mix(in srgb, var(--module-color) 18%, transparent) 0%,
      color-mix(in srgb, var(--module-color) 6%, transparent) 100%
    );
    border-color: color-mix(in srgb, var(--module-color) 45%, transparent);
    box-shadow:
      0 0 16px color-mix(in srgb, var(--module-color) 12%, transparent),
      0 2px 8px rgba(0, 0, 0, 0.15),
      inset 0 0 20px color-mix(in srgb, var(--module-color) 8%, transparent);
  }

  .module-cell.active .cell-glow {
    opacity: 0.1;
  }

  /* ============================================================================
     ICON STYLING
     ============================================================================ */
  .cell-icon {
    font-size: 26px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .module-cell:hover .cell-icon {
    transform: scale(1.1);
  }

  /* Icon shadow and glow */
  .cell-icon :global(svg),
  .cell-icon :global(i) {
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.25));
  }

  .module-cell.active .cell-icon :global(svg),
  .module-cell.active .cell-icon :global(i) {
    filter: drop-shadow(
      0 0 8px color-mix(in srgb, var(--module-color) 50%, transparent)
    );
  }

  /* ============================================================================
     LABEL STYLING
     ============================================================================ */
  .cell-label {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.88);
    letter-spacing: 0.01em;
    line-height: 1.2;
    transition: color 0.2s ease;
  }

  .module-cell.active .cell-label {
    color: rgba(255, 255, 255, 1);
  }

  /* ============================================================================
     DISABLED BADGE
     ============================================================================ */
  .cell-badge {
    position: absolute;
    top: 6px;
    right: 6px;
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 2px 5px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.15);
    letter-spacing: 0.4px;
    z-index: 3;
  }

  /* ============================================================================
     PRESS/ACTIVE INTERACTION
     ============================================================================ */
  .module-cell:active {
    transform: scale(0.96);
  }

  /* ============================================================================
     DISABLED STATE
     ============================================================================ */
  .module-cell.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .module-cell.disabled:hover {
    transform: none;
  }

  .module-cell.disabled:hover .cell-background {
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.07) 0%,
      rgba(255, 255, 255, 0.03) 100%
    );
    border-color: rgba(255, 255, 255, 0.1);
  }

  .module-cell.disabled:hover .cell-glow {
    opacity: 0;
  }

  .module-cell.disabled:hover .cell-icon {
    transform: none;
  }

  /* ============================================================================
     RESPONSIVE - 3 columns on wider screens
     ============================================================================ */
  @media (min-width: 400px) {
    .module-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .module-cell {
      min-height: 82px;
    }
  }

  /* ============================================================================
     ACCESSIBILITY & REDUCED MOTION
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .module-cell,
    .cell-background,
    .cell-glow,
    .cell-icon {
      transition: none !important;
    }

    .module-cell:hover,
    .module-cell:active {
      transform: none !important;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .cell-background {
      background: rgba(255, 255, 255, 0.15) !important;
      border: 2px solid rgba(255, 255, 255, 0.4) !important;
    }

    .module-cell.active .cell-background {
      background: rgba(255, 255, 255, 0.25) !important;
      border: 2px solid white !important;
    }
  }

  /* Focus styles for keyboard navigation */
  .module-cell:focus-visible {
    outline: 2px solid rgba(102, 126, 234, 0.6);
    outline-offset: 2px;
  }
</style>

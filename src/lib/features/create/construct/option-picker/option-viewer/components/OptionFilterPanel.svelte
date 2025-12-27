<!--
OptionFilterPanel.svelte - Filter options dropdown panel

Provides a dedicated UI for filtering option viewer content:
- All/Continuous toggle
- Future filter options (grid mode, difficulty, etc.)
- Dropdown interaction sliding down from header
- Auto-dismisses on selection
- Container-aware sizing using modern runes-based approach
-->

<script lang="ts">
  import type { IHapticFeedback } from "$lib/shared/application/services/contracts/IHapticFeedback";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { fly, fade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  // Props
  const {
    isOpen = false,
    isContinuousOnly = false,
    onClose = () => {},
    onToggleContinuous = () => {},
  } = $props<{
    isOpen?: boolean;
    isContinuousOnly?: boolean;
    onClose?: () => void;
    onToggleContinuous?: (isContinuousOnly: boolean) => void;
  }>();

  const hapticService = resolve<IHapticFeedback>(
    TYPES.IHapticFeedback
  );

  // Container-aware sizing state
  let panelElement: HTMLElement | null = $state(null);
  let containerWidth = $state(0);
  let containerHeight = $state(0);

  // Track panel dimensions using ResizeObserver
  $effect(() => {
    if (!panelElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const parentElement = entry.target.parentElement;
        if (parentElement) {
          containerWidth = parentElement.clientWidth;
          containerHeight = parentElement.clientHeight;
        }
      }
    });

    // Also observe parent container to track its dimensions
    const parentElement = panelElement.parentElement;
    if (parentElement) {
      resizeObserver.observe(parentElement);
      containerWidth = parentElement.clientWidth;
      containerHeight = parentElement.clientHeight;
    }

    return () => {
      resizeObserver.disconnect();
    };
  });

  // Responsive sizing based on container dimensions
  const isCompact = $derived(containerWidth < 350 || containerHeight < 400);
  const isExtraCompact = $derived(
    containerWidth < 300 || containerHeight < 300
  );

  function handleClose() {
    onClose();
  }

  function handleContinuityToggle(value: boolean) {
    hapticService?.trigger("selection");
    onToggleContinuous(value);
    // Auto-dismiss after selection
    setTimeout(() => {
      onClose();
    }, 150); // Small delay for haptic feedback to register
  }

  // Close on backdrop click
  function handleBackdropClick() {
    handleClose();
  }

  // Close on escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && isOpen) {
      handleClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- Backdrop -->
  <div
    class="filter-backdrop"
    transition:fade={{ duration: 200, easing: cubicOut }}
    onclick={handleBackdropClick}
    role="presentation"
  ></div>

  <!-- Bottom Sheet Panel -->
  <div
    bind:this={panelElement}
    class="filter-panel"
    class:compact={isCompact}
    class:extra-compact={isExtraCompact}
    transition:fly={{ y: 300, duration: 300, easing: cubicOut }}
    role="dialog"
    aria-labelledby="filter-panel-title"
    aria-modal="true"
  >
    <!-- Drag handle indicator -->
    <div class="drag-handle"></div>

    <div class="filter-panel-header">
      <h2 id="filter-panel-title" class="filter-panel-title">
        <i class="fas fa-filter"></i>
        Filter Options
      </h2>
      <button
        class="close-button"
        onclick={handleClose}
        aria-label="Close filter panel"
        type="button"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div class="filter-panel-content">
      <!-- Continuity Filter Section -->
      <div class="filter-section">
        <h3 class="filter-section-title">Show Options</h3>
        <div class="toggle-group">
          <button
            class="toggle-option"
            class:active={!isContinuousOnly}
            onclick={() => handleContinuityToggle(false)}
            aria-pressed={!isContinuousOnly}
          >
            <div class="toggle-icon">
              <i class="fas fa-th"></i>
            </div>
            <div class="toggle-label">
              <div class="label-text">All Options</div>
              <div class="label-description">Show all available options</div>
            </div>
          </button>

          <button
            class="toggle-option"
            class:active={isContinuousOnly}
            onclick={() => handleContinuityToggle(true)}
            aria-pressed={isContinuousOnly}
          >
            <div class="toggle-icon">
              <i class="fas fa-link"></i>
            </div>
            <div class="toggle-label">
              <div class="label-text">Continuous Only</div>
              <div class="label-description">Show only continuous options</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Backdrop overlay */
  .filter-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }

  /* Bottom sheet panel */
  .filter-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    /* Use viewport height for responsive sizing */
    max-height: min(400px, 70vh);
    background: linear-gradient(180deg, #16213e 0%, #1a1a2e 100%);
    border-radius: 16px 16px 0 0;
    box-shadow:
      0 -8px 32px rgba(0, 0, 0, 0.4),
      0 -4px 16px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 1000;
  }

  /* Compact mode for smaller viewports */
  .filter-panel.compact {
    max-height: min(352px, 60vh);
    border-radius: 12px 12px 0 0;
  }

  /* Extra compact mode for very small viewports */
  .filter-panel.extra-compact {
    max-height: min(280px, 50vh);
    border-radius: 8px 8px 0 0;
  }

  /* Drag handle indicator */
  .drag-handle {
    width: 36px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    margin: 12px auto 0;
    flex-shrink: 0;
  }

  .filter-panel.compact .drag-handle {
    width: 32px;
    height: 3px;
    margin: 10px auto 0;
  }

  .filter-panel.extra-compact .drag-handle {
    width: 28px;
    height: 3px;
    margin: 8px auto 0;
  }

  .filter-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
  }

  .filter-panel.compact .filter-panel-header {
    padding: 10px 20px 12px;
  }

  .filter-panel.extra-compact .filter-panel-header {
    padding: 8px 16px 10px;
  }

  .filter-panel-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.25rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
  }

  .filter-panel.compact .filter-panel-title {
    font-size: 1.1rem;
    gap: 10px;
  }

  .filter-panel.extra-compact .filter-panel-title {
    font-size: 1rem;
    gap: 8px;
  }

  .filter-panel-title i {
    font-size: 1.1rem;
    color: rgba(147, 197, 253, 0.9);
  }

  .filter-panel.compact .filter-panel-title i {
    font-size: 1rem;
  }

  .filter-panel.extra-compact .filter-panel-title i {
    font-size: 0.9rem;
  }

  .close-button {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    /* 48px minimum for touch targets on mobile */
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .filter-panel.compact .close-button {
    width: var(--min-touch-target);
    height: var(--min-touch-target);
  }

  .filter-panel.extra-compact .close-button {
    width: 40px;
    height: 40px;
    font-size: 0.9rem;
    position: relative;
  }

  /* Ensure 48px touch target even in extra-compact mode */
  .filter-panel.extra-compact .close-button::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: var(--min-touch-target);
    min-height: var(--min-touch-target);
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.95);
    transform: scale(1.05);
  }

  .close-button:active {
    transform: scale(0.95);
  }

  .filter-panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .filter-panel.compact .filter-panel-content {
    padding: 16px 20px 20px;
    gap: 16px;
  }

  .filter-panel.extra-compact .filter-panel-content {
    padding: 12px 16px 16px;
    gap: 12px;
  }

  .filter-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .filter-panel.compact .filter-section {
    gap: 10px;
  }

  .filter-panel.extra-compact .filter-section {
    gap: 8px;
  }

  .filter-section-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0;
  }

  .filter-panel.compact .filter-section-title {
    font-size: 0.8rem;
  }

  .filter-panel.extra-compact .filter-section-title {
    font-size: 0.75rem;
    letter-spacing: 0.3px;
  }

  .toggle-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .filter-panel.compact .toggle-group {
    gap: 10px;
  }

  .filter-panel.extra-compact .toggle-group {
    gap: 8px;
  }

  .toggle-option {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-align: left;
  }

  .filter-panel.compact .toggle-option {
    gap: 14px;
    padding: 14px 18px;
    border-radius: 14px;
  }

  .filter-panel.extra-compact .toggle-option {
    gap: 12px;
    padding: 12px 16px;
    border-radius: 12px;
    border-width: 1.5px;
  }

  .toggle-option:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .toggle-option.active {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
  }

  .toggle-option.active:hover {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.6);
  }

  .toggle-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    background: rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .filter-panel.compact .toggle-icon {
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    border-radius: 11px;
    font-size: 1.15rem;
  }

  .filter-panel.extra-compact .toggle-icon {
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    border-radius: 10px;
    font-size: 1.05rem;
  }

  .toggle-option.active .toggle-icon {
    background: rgba(59, 130, 246, 0.25);
    color: rgba(147, 197, 253, 1);
  }

  .toggle-label {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .label-text {
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .filter-panel.compact .label-text {
    font-size: 0.95rem;
  }

  .filter-panel.extra-compact .label-text {
    font-size: 0.9rem;
  }

  .label-description {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .filter-panel.compact .label-description {
    font-size: 0.8rem;
  }

  .filter-panel.extra-compact .label-description {
    font-size: 0.75rem;
  }
</style>

<!--
CAPCard.svelte - Card for selecting CAP type
MOBILE: Opens modal for detailed selection when clicked
DESKTOP: Shows inline component buttons for direct selection
-->
<script lang="ts">
  import { CAP_TYPE_LABELS } from "$create/generate/circular";
  import { CAP_COMPONENTS } from "$create/generate/shared/domain/constants/cap-constants";
  import type { ICAPTypeService, IHapticFeedbackService } from "$shared";
  import {
    CAPComponent,
    CAPType,
    FontAwesomeIcon,
    resolve,
    TYPES,
  } from "$shared";
  import { onMount, getContext } from "svelte";
  import type { PanelCoordinationState } from "$create/shared/state/panel-coordination-state.svelte";
  import BaseCard from "./BaseCard.svelte";

  let {
    currentCAPType,
    onCAPTypeChange,
    shadowColor = "30deg 75% 55%", // Orange shadow
    gridColumnSpan = 2,
    cardIndex = 0,
    headerFontSize = "9px",
  } = $props<{
    currentCAPType: CAPType;
    onCAPTypeChange: (capType: CAPType) => void;
    shadowColor?: string;
    gridColumnSpan?: number;
    cardIndex?: number;
    headerFontSize?: string;
  }>();

  let hapticService: IHapticFeedbackService;
  let capTypeService: ICAPTypeService = resolve<ICAPTypeService>(
    TYPES.ICAPTypeService
  );
  let isDesktop = $state(false);

  // Get panel coordination state from context (provided by CreateModule)
  const panelState = getContext<PanelCoordinationState>("panelState");

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );

    // Simple desktop detection based on viewport width
    const checkDesktop = () => {
      isDesktop = window.innerWidth >= 1280;
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  });

  // Get current selected components using service
  const selectedComponents = $derived(
    capTypeService.parseComponents(currentCAPType)
  );

  // Desktop: Direct toggle with immediate application
  function toggleComponentDesktop(component: CAPComponent) {
    hapticService?.trigger("selection");
    const newComponents = new Set(selectedComponents);

    if (newComponents.has(component)) {
      newComponents.delete(component);
    } else {
      newComponents.add(component);
    }

    const capType = capTypeService.generateCAPType(newComponents);
    // Apply immediately on desktop (no modal, no pending)
    onCAPTypeChange(capType);
  }

  // Mobile: Open CAP panel via coordinator (renders at CreateModule level)
  function openExpanded() {
    hapticService?.trigger("selection");

    // Open the CAP panel via coordinator - this renders at CreateModule level
    // so the backdrop will properly cover the workspace
    panelState.openCAPPanel(
      currentCAPType,
      selectedComponents,
      onCAPTypeChange
    );
  }

  // Format CAP type display using user-friendly labels
  const capTypeDisplay = $derived(
    CAP_TYPE_LABELS[currentCAPType as CAPType] || currentCAPType
  );
</script>

<!-- CAP card with animated gradient wrapper -->
<div
  class="cap-card-wrapper"
  style="grid-column: span {gridColumnSpan}; --card-index: {cardIndex};"
>
  {#if isDesktop}
    <!-- DESKTOP: Inline component selection -->
    <div class="cap-card-desktop">
      <div class="cap-header" style="font-size: {headerFontSize};">
        CAP TYPE
      </div>
      <div class="cap-components-grid">
        {#each CAP_COMPONENTS as { component, label, icon, color: iconColor }}
          <button
            class="cap-component-btn"
            class:active={selectedComponents.has(component)}
            onclick={() => toggleComponentDesktop(component)}
            aria-label="Toggle {label}"
          >
            <span class="cap-icon">
              <FontAwesomeIcon {icon} size="1.2em" color={iconColor} />
            </span>
            <span class="cap-label">{label}</span>
          </button>
        {/each}
      </div>
    </div>
  {:else}
    <!-- MOBILE: Card that opens modal -->
    <BaseCard
      title="CAP Type"
      currentValue={capTypeDisplay}
      color="transparent"
      {shadowColor}
      gridColumnSpan={1}
      {cardIndex}
      {headerFontSize}
      onClick={openExpanded}
    />
  {/if}
</div>

<!-- CAP Selection Modal now renders at CreateModule level via CAPCoordinator -->

<style>
  /* ✨ Animated CAP Card - Mesh Gradient Wrapper */

  /* The wrapper has a simple static gradient background */
  .cap-card-wrapper {
    /* Enable container queries to detect card width AND height */
    container-type: size;
    container-name: cap-card;

    position: relative;
    border-radius: 16px;
    overflow: visible; /* Allow hover effects to overflow and pop */

    /* Warm orange gradient - represents transformation/variation, balances cool colors */
    background: linear-gradient(
      135deg,
      #fed7aa 0%,
      /* Orange 200 - Light peachy */ #fdba74 25%,
      /* Orange 300 - Soft orange */ #fb923c 50%,
      /* Orange 400 - Bright orange */ #f97316 75%,
      /* Orange 500 - Vibrant orange */ #ea580c 100%
        /* Orange 600 - Deep orange */
    );

    /* Subtle shadow - consistent with other cards */
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.15),
      0 4px 8px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);

    /* Only entrance animation - no gradient flow */
    animation: cardEnter 0.4s ease-out;
  }

  /* The BaseCard inside is transparent to show the wrapper's background */
  /* Disable its entrance animation since the wrapper handles it */
  .cap-card-wrapper :global(.base-card) {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    /* Remove entrance animation - the wrapper handles it */
    animation: none !important;
  }

  /* Maintain hover effects - only on hover-capable devices */
  @media (hover: hover) {
    .cap-card-wrapper:hover {
      transform: scale(1.02);
      filter: brightness(1.05);
      box-shadow:
        0 2px 4px rgba(0, 0, 0, 0.12),
        0 4px 8px rgba(0, 0, 0, 0.1),
        0 8px 16px rgba(0, 0, 0, 0.08),
        0 16px 24px rgba(0, 0, 0, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }

  /* Card entrance animation - clean fade in (matches BaseCard) */
  @keyframes cardEnter {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* DESKTOP: Inline CAP Selection Styles */
  .cap-card-desktop {
    display: flex;
    flex-direction: column;
    gap: clamp(8px, 2cqh, 12px);
    padding: clamp(10px, 2cqh, 14px) clamp(8px, 1.5cqw, 12px);
    height: 100%;
  }

  .cap-header {
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    text-align: center;
    color: rgba(255, 255, 255, 0.9);
    opacity: 0.85;
  }

  /* DEFAULT (narrow card, 2/3 width): 2×2 grid layout */
  .cap-components-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(6px, 1.5cqi, 10px);
    height: 100%;
  }

  .cap-component-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(2px, 0.5cqi, 4px);
    padding: clamp(8px, 2cqi, 14px);
    min-width: 0; /* Allow flex shrinking */

    /* Solid background for better readability - no glass morphism */
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  /* WIDE CARD (full width, alone): Single horizontal row */
  @container cap-card (min-width: 500px) {
    .cap-components-grid {
      display: flex;
      flex-direction: row;
      gap: clamp(8px, 2cqi, 14px);
    }
  }

  .cap-component-btn:hover {
    background: rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }

  .cap-component-btn.active {
    background: rgba(255, 255, 255, 0.2);
    border-color: white;
    border-width: 3px;
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.3);
  }

  .cap-icon {
    font-size: clamp(20px, 8cqi, 48px);
    line-height: 1;
  }

  .cap-label {
    font-size: clamp(10px, 4cqi, 18px);
    font-weight: 600;
    /* No text-transform - keep natural casing */
    letter-spacing: 0.3px;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
  }

  /* Respect user motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .cap-card-wrapper :global(.base-card) {
      animation: cardEnter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) backwards !important;
      animation-delay: calc(var(--card-index) * 50ms) !important;
      background-position: 0% 50% !important;
    }
  }
</style>

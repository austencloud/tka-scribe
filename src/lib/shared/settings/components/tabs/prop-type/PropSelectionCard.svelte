<!-- PropSelectionCard.svelte - Selection card for displaying current prop type -->
<script lang="ts">
  import type { PropType } from "../../../../pictograph/prop/domain/enums/PropType";
  import {
    getPropTypeDisplayInfo,
    hasVariations,
    getVariationLabel,
    getBasePropType,
    getAllVariations,
    getVariationIndex,
  } from "./PropTypeRegistry";

  type HandColor = "blue" | "red";

  let {
    propType,
    svgContent,
    svgContentRed,
    viewBox = "0 0 100 100",
    viewBoxRed,
    hand,
    isSingleMode = false,
    onSelect,
    onToggleVariation,
  }: {
    propType: PropType;
    svgContent: string;
    svgContentRed?: string;
    viewBox?: string;
    viewBoxRed?: string;
    hand?: HandColor;
    isSingleMode?: boolean;
    onSelect: () => void;
    onToggleVariation?: (hand: HandColor) => void;
  } = $props();

  const displayLabel = $derived(
    getPropTypeDisplayInfo(getBasePropType(propType)).label
  );
  const showVariations = $derived(hasVariations(propType));
  const variationText = $derived(getVariationLabel(propType));
  const showDualPreview = $derived(isSingleMode && svgContent && svgContentRed);
  const allVariations = $derived(getAllVariations(propType));
  const currentVariationIndex = $derived(getVariationIndex(propType));
  const totalVariations = $derived(allVariations.length);

  function handleVariationClick(e: MouseEvent) {
    e.stopPropagation();
    if (onToggleVariation && hand) {
      onToggleVariation(hand);
    } else if (onToggleVariation) {
      onToggleVariation("blue");
    }
  }

  function handleVariationKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      if (onToggleVariation && hand) {
        onToggleVariation(hand);
      } else if (onToggleVariation) {
        onToggleVariation("blue");
      }
    }
  }
</script>

<div class="selection-card-wrapper">
  <button
    class="selection-card"
    class:blue={hand === "blue"}
    class:red={hand === "red"}
    class:has-variations={showVariations}
    onclick={onSelect}
  >
    <div
      class="prop-preview-container"
      class:single={!isSingleMode && hand}
      class:dual={showDualPreview}
    >
      {#if showDualPreview}
        <!-- Dual preview for single mode (shows both blue and red) -->
        <svg
          class="prop-preview blue"
          {viewBox}
          preserveAspectRatio="xMidYMid meet"
        >
          {@html svgContent}
        </svg>
        <svg
          class="prop-preview red"
          viewBox={viewBoxRed || viewBox}
          preserveAspectRatio="xMidYMid meet"
        >
          {@html svgContentRed}
        </svg>
      {:else if svgContent}
        <svg
          class="prop-preview {hand || 'blue'}"
          {viewBox}
          preserveAspectRatio="xMidYMid meet"
        >
          {@html svgContent}
        </svg>
      {/if}
    </div>

    <div class="card-content">
      {#if hand}
        <div class="card-header">
          <span class="color-dot {hand}"></span>
          <span class="card-label"
            >{hand === "blue" ? "Blue (Left)" : "Red (Right)"}</span
          >
        </div>
      {:else}
        <span class="card-label">Current Prop</span>
      {/if}
      <span class="card-value">{displayLabel}</span>
    </div>

    <i class="fas fa-chevron-right card-chevron" aria-hidden="true"></i>
  </button>

  {#if showVariations}
    <button
      class="variation-toggle"
      type="button"
      onclick={handleVariationClick}
      onkeydown={handleVariationKeydown}
      aria-label="Toggle prop variation ({currentVariationIndex +
        1} of {totalVariations})"
    >
      <span class="variation-indicator">
        {#each Array(totalVariations) as _, i}
          <span class="variation-dot" class:active={i === currentVariationIndex}
          ></span>
        {/each}
      </span>
      <span class="variation-text">{variationText}</span>
      <i class="fas fa-sync-alt" aria-hidden="true"></i>
    </button>
  {/if}
</div>

<style>
  /* Wrapper to contain both the card and variation toggle */
  .selection-card-wrapper {
    display: flex;
    flex-direction: column;
    gap: clamp(8px, 1cqh, 12px);
  }

  /* Selection card with generous spacing */
  .selection-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: clamp(16px, 2.5cqw, 20px);
    padding: clamp(20px, 2.5cqh, 28px) clamp(20px, 3cqw, 28px);
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.36, 0.66, 0.04, 1);
    color: var(--theme-text, white);
    position: relative;
    min-height: clamp(108px, 16cqh, 150px);
    width: 100%;
  }

  .selection-card:active {
    transform: scale(0.98);
    background: var(--theme-card-hover-bg);
  }

  .selection-card.blue {
    border-left: 3px solid #2e3192;
  }

  .selection-card.red {
    border-left: 3px solid #ed1c24;
  }

  .prop-preview-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(8px, 1.5cqw, 14px);
    flex-shrink: 0;
    width: clamp(88px, 12cqw, 112px);
    height: clamp(68px, 10cqh, 92px);
  }

  .prop-preview-container.single {
    width: clamp(80px, 11cqw, 104px);
    height: clamp(68px, 10cqh, 92px);
  }

  .prop-preview-container.dual {
    width: clamp(108px, 15cqw, 140px);
  }

  .prop-preview {
    width: auto;
    height: 100%;
    max-height: clamp(58px, 8.5cqh, 78px);
    max-width: clamp(42px, 6cqw, 48px);
    opacity: 0.92;
  }

  .prop-preview-container.single .prop-preview {
    max-height: clamp(64px, 9.5cqh, 86px);
    max-width: clamp(64px, 9.5cqw, 86px);
  }

  .prop-preview-container.dual .prop-preview {
    max-height: clamp(48px, 8cqh, 70px);
    max-width: clamp(38px, 5.5cqw, 48px);
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: clamp(4px, 0.6cqh, 6px);
    flex: 1;
    text-align: left;
    min-width: 0;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: clamp(7px, 1cqw, 9px);
  }

  .color-dot {
    width: clamp(9px, 1.3cqw, 11px);
    height: clamp(9px, 1.3cqw, 11px);
    border-radius: 50%;
    flex-shrink: 0;
  }

  .color-dot.blue {
    background: #2e3192;
  }

  .color-dot.red {
    background: #ed1c24;
  }

  .card-label {
    font-size: clamp(12px, 1.75cqw, 14px);
    font-weight: 500;
    color: var(--theme-text-dim);
    letter-spacing: -0.01em;
    white-space: nowrap;
  }

  .card-value {
    font-size: clamp(17px, 2.5cqw, 20px);
    font-weight: 600;
    color: var(--theme-text, white);
    letter-spacing: -0.02em;
    text-transform: capitalize;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-chevron {
    flex-shrink: 0;
    margin-left: auto;
    color: var(--theme-text-dim);
    font-size: clamp(14px, 2cqw, 16px);
  }

  /* Variation toggle button - 50px minimum touch target */
  .variation-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(8px, 1cqw, 12px);
    min-height: var(--min-touch-target);
    min-width: var(--min-touch-target);
    padding: clamp(10px, 1.5cqh, 14px) clamp(16px, 2.5cqw, 24px);
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke);
    border-radius: 12px;
    color: var(--theme-text, var(--theme-text));
    font-size: clamp(13px, 1.8cqw, 15px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.36, 0.66, 0.04, 1);
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  .variation-toggle:hover {
    background: var(--theme-card-hover-bg);
    border-color: var(--theme-stroke-strong);
  }

  .variation-toggle:active {
    transform: scale(0.97);
    background: var(--theme-card-hover-bg, var(--theme-card-hover-bg));
  }

  .variation-toggle:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--theme-accent) 50%, transparent);
    outline-offset: 2px;
  }

  .variation-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .variation-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--theme-text-dim);
    transition: all 0.2s ease;
  }

  .variation-dot.active {
    background: var(--theme-accent);
    box-shadow: 0 0 6px
      color-mix(
        in srgb,
        var(--theme-accent, var(--theme-accent)) 50%,
        transparent
      );
  }

  .variation-text {
    white-space: nowrap;
  }

  .variation-toggle i {
    font-size: clamp(11px, 1.5cqw, 13px);
    opacity: 0.7;
  }

  @media (prefers-reduced-motion: reduce) {
    .selection-card,
    .variation-toggle {
      transition: none;
    }
  }
</style>

<!-- PropSelectionCard.svelte - Selection card for displaying current prop type -->
<script lang="ts">
  import type { PropType } from "../../../../pictograph/prop/domain/enums/PropType";
  import {
    getPropTypeDisplayInfo,
    hasVariations,
    getVariationLabel,
    getBasePropType,
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

<button
  class="selection-card"
  class:blue={hand === "blue"}
  class:red={hand === "red"}
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
        viewBox={viewBox}
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

    {#if showVariations}
      <span
        class="variation-toggle"
        role="button"
        tabindex="0"
        onclick={handleVariationClick}
        onkeydown={handleVariationKeydown}
      >
        {variationText}
        <i class="fas fa-exchange-alt"></i>
      </span>
    {/if}
  </div>

  <i class="fas fa-chevron-right"></i>
</button>

<style>
  .selection-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 0.33px solid rgba(255, 255, 255, 0.16);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.36, 0.66, 0.04, 1);
    color: white;
    text-align: center;
    position: relative;
    min-height: 280px;
  }

  .selection-card:active {
    transform: scale(0.98);
    background: rgba(255, 255, 255, 0.06);
  }

  .selection-card.blue {
    border-top: 3px solid #2e3192;
  }

  .selection-card.red {
    border-top: 3px solid #ed1c24;
  }

  .prop-preview-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    min-height: 100px;
    flex-shrink: 0;
  }

  .prop-preview-container.single {
    min-height: 80px;
  }

  .prop-preview-container.dual {
    flex-direction: row;
    gap: 24px;
    min-height: 100px;
  }

  .prop-preview {
    width: auto;
    height: 100%;
    max-height: 80px;
    max-width: 60px;
    opacity: 0.9;
  }

  .prop-preview-container.single .prop-preview {
    max-height: 70px;
    max-width: 70px;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    align-items: center;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .color-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .color-dot.blue {
    background: #2e3192;
  }

  .color-dot.red {
    background: #ed1c24;
  }

  .card-label {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: -0.08px;
  }

  .card-value {
    font-size: 17px;
    font-weight: 600;
    color: white;
    letter-spacing: -0.41px;
    text-transform: capitalize;
  }

  .variation-toggle {
    margin-top: 8px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 0.33px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.36, 0.66, 0.04, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 48px;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  .variation-toggle:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .variation-toggle:active {
    transform: scale(0.96);
  }

  .variation-toggle i {
    position: static;
    font-size: 11px;
    opacity: 0.8;
  }

  .selection-card > i {
    position: absolute;
    top: 16px;
    right: 16px;
    color: rgba(255, 255, 255, 0.3);
    font-size: 14px;
  }

  @media (prefers-reduced-motion: reduce) {
    .selection-card,
    .variation-toggle {
      transition: none;
    }
  }
</style>

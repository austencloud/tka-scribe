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
  /* Material design card with generous spacing */
  .selection-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: clamp(16px, 2.5cqw, 20px);
    padding: clamp(20px, 2.5cqh, 28px) clamp(20px, 3cqw, 28px);
    background: rgba(255, 255, 255, 0.04);
    border: 0.33px solid rgba(255, 255, 255, 0.16);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.36, 0.66, 0.04, 1);
    color: white;
    position: relative;
    min-height: clamp(108px, 16cqh, 148px);
  }

  .selection-card:active {
    transform: scale(0.98);
    background: rgba(255, 255, 255, 0.06);
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
    max-width: clamp(42px, 6cqw, 56px);
    opacity: 0.92;
  }

  .prop-preview-container.single .prop-preview {
    max-height: clamp(64px, 9.5cqh, 86px);
    max-width: clamp(64px, 9.5cqw, 86px);
  }

  .prop-preview-container.dual .prop-preview {
    max-height: clamp(52px, 8cqh, 70px);
    max-width: clamp(38px, 5.5cqw, 52px);
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
    color: rgba(255, 255, 255, 0.65);
    letter-spacing: -0.01em;
    white-space: nowrap;
  }

  .card-value {
    font-size: clamp(17px, 2.5cqw, 20px);
    font-weight: 600;
    color: white;
    letter-spacing: -0.02em;
    text-transform: capitalize;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .variation-toggle {
    margin-top: clamp(6px, 0.8cqh, 8px);
    padding: clamp(8px, 1.2cqh, 11px) clamp(14px, 2cqw, 18px);
    background: rgba(255, 255, 255, 0.08);
    border: 0.33px solid rgba(255, 255, 255, 0.16);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.88);
    font-size: clamp(12px, 1.75cqw, 14px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.36, 0.66, 0.04, 1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: clamp(6px, 0.8cqw, 8px);
    min-height: clamp(34px, 5cqh, 44px);
    white-space: nowrap;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  .variation-toggle:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.24);
  }

  .variation-toggle:active {
    transform: scale(0.96);
  }

  .variation-toggle i {
    font-size: clamp(10px, 1.4cqw, 12px);
    opacity: 0.85;
  }

  .selection-card > i {
    flex-shrink: 0;
    margin-left: auto;
    color: rgba(255, 255, 255, 0.35);
    font-size: clamp(14px, 2cqw, 16px);
  }

  @media (prefers-reduced-motion: reduce) {
    .selection-card,
    .variation-toggle {
      transition: none;
    }
  }
</style>

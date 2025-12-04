<!--
LengthCard.svelte - Unified sequence length selection card
Used by both Generate and Discover modules
Can operate as stepper (inline) or panel opener (click to select)
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import type { IRippleEffectService } from "$lib/shared/application/services/contracts/IRippleEffectService";
  import { tryResolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";

  type LengthCardMode = "stepper" | "panel-opener";

  let {
    value = null,
    mode = "stepper",
    min = 2,
    max = 64,
    step = 4,
    allowNull = true,
    disabled = false,
    gridColumnSpan = 2,
    cardIndex = 0,
    onChange,
    onOpenSheet,
  }: {
    value?: number | null;
    mode?: LengthCardMode;
    min?: number;
    max?: number;
    step?: number;
    allowNull?: boolean;
    disabled?: boolean;
    gridColumnSpan?: number;
    cardIndex?: number;
    onChange?: (length: number | null) => void;
    onOpenSheet?: () => void;
  } = $props();

  let hapticService: IHapticFeedbackService | null = null;
  let rippleService: IRippleEffectService | null = null;
  let cardElement: HTMLDivElement | null = $state(null);

  onMount(() => {
    hapticService = tryResolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
    rippleService = tryResolve<IRippleEffectService>(TYPES.IRippleEffectService);

    if (mode === "panel-opener" && cardElement && rippleService) {
      return rippleService.attachRipple(cardElement, {
        color: "rgba(255, 255, 255, 0.4)",
        duration: 600,
        opacity: 0.5,
      });
    }
    return undefined;
  });

  function handleDecrement() {
    if (disabled || mode !== "stepper" || !onChange) return;
    hapticService?.trigger("selection");

    if (value === null) {
      onChange(max);
    } else if (value > min) {
      onChange(value - step);
    } else if (allowNull) {
      onChange(null);
    }
  }

  function handleIncrement() {
    if (disabled || mode !== "stepper" || !onChange) return;
    hapticService?.trigger("selection");

    if (value === null) {
      onChange(min);
    } else if (value < max) {
      onChange(value + step);
    } else if (allowNull) {
      onChange(null);
    }
  }

  function handleCardClick() {
    if (disabled || mode !== "panel-opener" || !onOpenSheet) return;
    hapticService?.trigger("selection");
    onOpenSheet();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (mode === "panel-opener" && !disabled && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      handleCardClick();
    }
  }

  const displayValue = $derived(value ? `${value} beats` : "Any");

  // Generate beat dots for visual display
  const beatDots = $derived.by(() => {
    if (!value) return [];
    const maxVisible = 8;
    const count = Math.min(value, maxVisible);
    return Array.from({ length: count }, (_, i) => i);
  });
  const remainingCount = $derived(value && value > 8 ? value - 8 : 0);
</script>

{#if mode === "stepper"}
  <div
    class="length-card stepper"
    class:disabled
    style="--card-index: {cardIndex}; grid-column: span {gridColumnSpan};"
    role="group"
    aria-label="Sequence length selection"
  >
    <div class="card-header">
      <span class="card-title">Length</span>
    </div>

    <div class="stepper-controls">
      <button
        class="stepper-btn"
        onclick={handleDecrement}
        aria-label="Decrease length"
        disabled={disabled || (!allowNull && value === min)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div class="value-display">
        <span class="length-value">{displayValue}</span>
      </div>

      <button
        class="stepper-btn"
        onclick={handleIncrement}
        aria-label="Increase length"
        disabled={disabled || (!allowNull && value === max)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  </div>
{:else}
  <div
    bind:this={cardElement}
    class="length-card panel-opener"
    class:disabled
    role="button"
    tabindex={disabled ? -1 : 0}
    onclick={handleCardClick}
    onkeydown={handleKeydown}
    aria-label="Sequence length: {displayValue}. Click to change."
    style="--card-index: {cardIndex}; grid-column: span {gridColumnSpan};"
  >
    <div class="card-header">
      <span class="card-title">Length</span>
    </div>

    <div class="length-display">
      <span class="length-value">{displayValue}</span>
    </div>

    {#if value}
      <div class="beat-dots">
        {#each beatDots as _, i}
          <div class="beat-dot" style="--dot-index: {i}"></div>
        {/each}
        {#if remainingCount > 0}
          <span class="more-indicator">+{remainingCount}</span>
        {/if}
      </div>
    {/if}

    <div class="click-indicator" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </div>
  </div>
{/if}

<style>
  .length-card {
    container-type: size;
    container-name: length-card;

    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;

    aspect-ratio: 4 / 3;
    min-height: 80px;
    max-height: 140px;
    width: 100%;
    min-width: 0;

    padding: clamp(8px, 2cqh, 14px) clamp(6px, 2cqw, 10px);

    border-radius: 16px;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    border: none;
    color: white;
    text-align: center;

    box-shadow:
      0 1px 2px hsl(38deg 92% 50% / 0.15),
      0 2px 4px hsl(38deg 92% 50% / 0.12),
      0 4px 8px hsl(38deg 92% 50% / 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);

    overflow: hidden;

    animation: cardEnter 0.4s ease-out;
    animation-delay: calc(var(--card-index) * 50ms);
    animation-fill-mode: backwards;
  }

  .length-card.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .length-card.panel-opener {
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Glossy sheen overlay */
  .length-card::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 60%;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.25) 0%,
      rgba(255, 255, 255, 0.12) 40%,
      rgba(255, 255, 255, 0.04) 70%,
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: 16px 16px 0 0;
    pointer-events: none;
    z-index: 1;
  }

  @media (hover: hover) {
    .length-card.panel-opener:not(.disabled):hover {
      transform: translateY(-2px);
      filter: brightness(1.08);
      box-shadow:
        0 2px 4px hsl(38deg 92% 50% / 0.12),
        0 4px 8px hsl(38deg 92% 50% / 0.1),
        0 8px 16px hsl(38deg 92% 50% / 0.08),
        0 16px 24px hsl(38deg 92% 50% / 0.06),
        0 0 40px hsl(38deg 92% 50% / 0.2);
    }
  }

  .length-card.panel-opener:not(.disabled):active {
    transform: translateY(0) scale(0.98);
    transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .length-card:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.6);
    outline-offset: 3px;
  }

  @keyframes cardEnter {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .card-header {
    position: relative;
    z-index: 2;
    width: 100%;
  }

  .card-title {
    font-size: clamp(8px, 2.5cqw, 11px);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.7);
  }

  /* Stepper mode */
  .stepper-controls {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    flex: 1;
    gap: clamp(4px, 1cqw, 8px);
  }

  .stepper-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(28px, 8cqw, 40px);
    height: clamp(28px, 8cqh, 40px);
    background: rgba(255, 255, 255, 0.15);
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
    color: inherit;
  }

  .stepper-btn svg {
    width: clamp(14px, 4cqw, 20px);
    height: clamp(14px, 4cqw, 20px);
  }

  .stepper-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
  }

  .stepper-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .stepper-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .value-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-width: 0;
  }

  /* Panel opener mode */
  .length-display {
    position: relative;
    z-index: 2;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .length-value {
    font-size: clamp(14px, 4cqw, 22px);
    font-weight: 700;
    letter-spacing: 0.3px;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    white-space: nowrap;
  }

  .beat-dots {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: clamp(3px, 0.8cqw, 5px);
    padding: clamp(4px, 1cqh, 6px) clamp(8px, 2cqw, 12px);
    background: rgba(0, 0, 0, 0.15);
    border-radius: 100px;
  }

  .beat-dot {
    width: clamp(6px, 1.5cqw, 8px);
    height: clamp(6px, 1.5cqw, 8px);
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    animation: dotPop 0.3s ease-out;
    animation-delay: calc(var(--dot-index) * 30ms);
    animation-fill-mode: backwards;
  }

  @keyframes dotPop {
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .more-indicator {
    font-size: clamp(10px, 2.5cqw, 12px);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    margin-left: clamp(2px, 0.5cqw, 4px);
  }

  .click-indicator {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 18px;
    height: 18px;
    color: rgba(255, 255, 255, 0.4);
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 2;
  }

  @media (hover: hover) {
    .length-card.panel-opener:hover .click-indicator {
      opacity: 1;
    }
  }

  .click-indicator svg {
    width: 100%;
    height: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    .length-card {
      animation: none;
    }
    .beat-dot {
      animation: none;
    }
    .stepper-btn {
      transition: none;
    }
  }
</style>

<!--
LevelCard.svelte - Unified difficulty level selection card
Styled to match Generate module's LevelCard exactly
Used by Discover filters (Generate uses its own version with more features)
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import type { IRippleEffectService } from "$lib/shared/application/services/contracts/IRippleEffectService";
  import { tryResolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import {
    type DifficultyLevel,
    DIFFICULTY_LEVELS,
  } from "$lib/shared/domain/models/sequence-parameters";

  let {
    value = null,
    allowNull = true,
    disabled = false,
    gridColumnSpan = 2,
    cardIndex = 0,
    onChange,
  }: {
    value?: DifficultyLevel | null;
    allowNull?: boolean;
    disabled?: boolean;
    gridColumnSpan?: number;
    cardIndex?: number;
    onChange: (level: DifficultyLevel | null) => void;
  } = $props();

  let hapticService: IHapticFeedbackService | null = null;
  let rippleService: IRippleEffectService | null = null;
  let cardElement: HTMLDivElement | null = $state(null);
  let previousGradient = $state<string>("");

  onMount(() => {
    hapticService = tryResolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
    rippleService = tryResolve<IRippleEffectService>(TYPES.IRippleEffectService);
    previousGradient = gradient;

    if (cardElement && rippleService) {
      return rippleService.attachRipple(cardElement, {
        color: "rgba(255, 255, 255, 0.4)",
        duration: 600,
        opacity: 0.5,
      });
    }
    return undefined;
  });

  // Default styling when no level selected
  const defaultGradient = "radial-gradient(ellipse at top left, #60a5fa 0%, #3b82f6 40%, #1d4ed8 100%)";
  const defaultShadowColor = "220deg 80% 55%";

  const currentConfig = $derived(value ? DIFFICULTY_LEVELS[value] : null);
  const gradient = $derived(currentConfig?.gradient ?? defaultGradient);
  const shadowColor = $derived(currentConfig?.shadowColor ?? defaultShadowColor);
  const textColor = $derived(currentConfig?.textColor ?? "white");
  const displayValue = $derived(value ? `Level ${value}` : "All Levels");
  const description = $derived(currentConfig?.name ?? "Any difficulty");

  // Gradient crossfade animation
  $effect(() => {
    if (gradient !== previousGradient && cardElement) {
      cardElement.classList.add("transitioning");
      setTimeout(() => {
        cardElement?.classList.remove("transitioning");
        previousGradient = gradient;
      }, 800);
    }
  });

  function handleDecrement() {
    if (disabled) return;
    hapticService?.trigger("selection");

    if (value === null) {
      onChange(3);
    } else if (value > 1) {
      onChange((value - 1) as DifficultyLevel);
    } else if (allowNull) {
      onChange(null);
    }
  }

  function handleIncrement() {
    if (disabled) return;
    hapticService?.trigger("selection");

    if (value === null) {
      onChange(1);
    } else if (value < 3) {
      onChange((value + 1) as DifficultyLevel);
    } else if (allowNull) {
      onChange(null);
    }
  }

  function handleKeydown(event: KeyboardEvent, action: "increment" | "decrement") {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action === "increment" ? handleIncrement() : handleDecrement();
    }
  }

  const canIncrement = $derived(value === null || value < 3 || allowNull);
  const canDecrement = $derived(value === null || value > 1 || allowNull);
</script>

<div
  bind:this={cardElement}
  class="level-card"
  class:disabled
  style="
    --card-color: {gradient};
    --prev-color: {previousGradient || gradient};
    --shadow-color: {shadowColor};
    --text-color: {textColor};
    --card-index: {cardIndex};
    grid-column: span {gridColumnSpan};
  "
  role="group"
  aria-label="Difficulty level selection"
>
  <div class="card-header">
    <span class="card-title">Level</span>
  </div>

  <div class="stepper-controls">
    <button
      class="stepper-zone decrement"
      class:disabled={!canDecrement}
      onclick={handleDecrement}
      onkeydown={(e) => handleKeydown(e, "decrement")}
      aria-label="Previous level"
      disabled={!canDecrement || disabled}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>

    <div class="value-display">
      <span class="level-value">{displayValue}</span>
      <span class="level-description">{description}</span>
    </div>

    <button
      class="stepper-zone increment"
      class:disabled={!canIncrement}
      onclick={handleIncrement}
      onkeydown={(e) => handleKeydown(e, "increment")}
      aria-label="Next level"
      disabled={!canIncrement || disabled}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  </div>
</div>

<style>
  .level-card {
    container-type: size;
    container-name: level-card;

    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;

    /* Fill grid cell like Generate does */
    height: 100%;
    min-height: 80px;
    min-width: 0;

    padding: clamp(6px, 2cqh, 12px) clamp(4px, 1.5cqw, 8px);

    border-radius: 16px;
    background: var(--card-color);
    border: none;
    color: var(--text-color);
    text-align: center;

    /* Layered shadows matching Generate's BaseCard */
    box-shadow:
      0 1px 2px hsl(var(--shadow-color) / 0.15),
      0 2px 4px hsl(var(--shadow-color) / 0.12),
      0 4px 8px hsl(var(--shadow-color) / 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);

    transition:
      box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: visible;

    animation: cardEnter 0.4s ease-out;
  }

  .level-card.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  /* Gradient crossfade: ::before shows OLD gradient */
  .level-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--prev-color, var(--card-color));
    border-radius: 16px;
    opacity: 1;
    z-index: -1;
    pointer-events: none;
    transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  :global(.level-card.transitioning)::before {
    opacity: 0;
  }

  /* Glossy sheen overlay - matching Generate exactly */
  .level-card::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 60%;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.15) 40%,
      rgba(255, 255, 255, 0.05) 70%,
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: 16px 16px 0 0;
    pointer-events: none;
    z-index: 1;
  }

  @media (hover: hover) {
    .level-card:hover {
      transform: scale(1.02);
      filter: brightness(1.05);
      box-shadow:
        0 2px 4px hsl(var(--shadow-color) / 0.12),
        0 4px 8px hsl(var(--shadow-color) / 0.1),
        0 8px 16px hsl(var(--shadow-color) / 0.08),
        0 16px 24px hsl(var(--shadow-color) / 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }
  }

  .level-card:active {
    transform: scale(0.97);
    transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes cardEnter {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .card-header {
    position: relative;
    z-index: 2;
    width: 100%;
    padding: clamp(3px, 0.8cqh, 6px) clamp(6px, 1.5cqw, 10px);
  }

  .card-title {
    font-size: clamp(8px, 2.5cqi, 11px);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.2px;
    opacity: 0.9;
  }

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

  .stepper-zone {
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(32px, 10cqw, 48px);
    height: clamp(32px, 10cqh, 48px);
    background: rgba(255, 255, 255, 0.15);
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
    color: inherit;
  }

  .stepper-zone svg {
    width: clamp(16px, 5cqw, 24px);
    height: clamp(16px, 5cqw, 24px);
  }

  .stepper-zone:hover:not(.disabled) {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
  }

  .stepper-zone:active:not(.disabled) {
    transform: scale(0.95);
  }

  .stepper-zone.disabled {
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
    gap: clamp(2px, 0.5cqh, 4px);
  }

  .level-value {
    font-size: clamp(16px, 5cqw, 28px);
    font-weight: 700;
    letter-spacing: 0.3px;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    white-space: nowrap;
  }

  .level-description {
    font-size: clamp(9px, 2.5cqw, 12px);
    opacity: 0.8;
    white-space: nowrap;
  }

  @media (prefers-reduced-motion: reduce) {
    .level-card {
      animation: none;
      transition: none;
    }
    .level-card::before {
      transition: none;
    }
    .stepper-zone {
      transition: none;
    }
  }
</style>

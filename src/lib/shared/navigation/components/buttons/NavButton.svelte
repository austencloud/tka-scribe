<!-- NavButton - Reusable Navigation Button Component -->
<script lang="ts">
  import {
    resolve,
    TYPES,
    type IHapticFeedbackService,
    type INavigationLabelService,
  } from "$shared";
  import { onMount } from "svelte";

  let {
    icon = "",
    label = "",
    active = false,
    disabled = false,
    color = "rgba(255, 255, 255, 1)",
    gradient = "rgba(255, 255, 255, 1)",
    type = "section", // 'section' | 'special'
    onClick = () => {},
    ariaLabel = "",
  } = $props<{
    icon: string;
    label: string;
    active?: boolean;
    disabled?: boolean;
    color?: string;
    gradient?: string;
    type?: "section" | "special";
    onClick?: () => void;
    ariaLabel?: string;
  }>();

  // Services
  let hapticService: IHapticFeedbackService | undefined;
  let labelService: INavigationLabelService | undefined;

  // Derived label values
  let compactLabel = $derived(labelService?.getCompactLabel(label) || label);
  let fullLabel = $derived(labelService?.getFullLabel(label) || label);

  function handleClick() {
    if (!disabled) {
      hapticService?.trigger("selection");
      onClick();
    }
  }

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
    labelService = resolve<INavigationLabelService>(
      TYPES.INavigationLabelService
    );
  });
</script>

<button
  class="nav-button"
  class:active
  class:disabled
  class:section={type === "section"}
  class:special={type === "special"}
  onclick={handleClick}
  {disabled}
  aria-label={ariaLabel || label}
  style="--section-color: {color}; --section-gradient: {gradient};"
>
  <span class="nav-icon">{@html icon}</span>
  <span class="nav-label nav-label-full">{fullLabel}</span>
  <span class="nav-label nav-label-compact">{compactLabel}</span>
</button>

<style>
  /* Base button styles */
  .nav-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  /* Section buttons - rounded rectangles */
  .nav-button.section {
    border-radius: 12px;
  }

  /* Special buttons (Menu/Settings) - circular */
  .nav-button.special {
    border-radius: 50%;
    flex: 0 0 auto;
  }

  .nav-button:hover:not(.disabled) {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(1.05);
  }

  .nav-button:active {
    transform: scale(0.95);
  }

  .nav-button.active {
    color: rgba(255, 255, 255, 1);
    background: rgba(255, 255, 255, 0.1);
    /* Colored top border indicator */
    border-top: 3px solid var(--section-color, rgba(255, 255, 255, 0.5));
    padding-top: calc(var(--spacing-xs, 8px) - 3px); /* Compensate for border */
  }

  .nav-button.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .nav-button.disabled:active {
    transform: none;
  }

  .nav-icon {
    /* Container-aware icon sizing */
    font-size: clamp(18px, 4cqi, 22px);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all var(--transition-fast);
  }

  /* Style Font Awesome icons with gradient colors */
  .nav-icon :global(i) {
    background: var(--section-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.2));
  }

  /* Fallback for browsers that don't support background-clip */
  @supports not (background-clip: text) {
    .nav-icon :global(i) {
      color: var(--section-color);
      background: none;
      -webkit-text-fill-color: initial;
    }
  }

  /* Inactive buttons have reduced opacity */
  .nav-button:not(.active) .nav-icon :global(i) {
    opacity: 0.6;
  }

  .nav-button:hover .nav-icon :global(i) {
    opacity: 1;
    filter: drop-shadow(0 0 12px rgba(0, 0, 0, 0.3));
  }

  /* Active button has full color and glow */
  .nav-button.active .nav-icon :global(i) {
    opacity: 1;
    filter: drop-shadow(0 0 16px var(--section-color)) brightness(1.1);
  }

  /* Disabled buttons remain grayed out */
  .nav-button.disabled .nav-icon {
    opacity: 0.3;
    filter: grayscale(1);
  }

  .nav-button.disabled .nav-icon :global(i) {
    color: var(--muted-foreground);
  }

  .nav-label {
    /* Container-aware label sizing */
    font-size: clamp(9px, 2cqi, 11px);
    font-weight: 500;
    text-align: center;
    white-space: nowrap;
    line-height: 1.2;
  }

  /* Labels hidden by default - parent layout controls visibility */
  .nav-label-full,
  .nav-label-compact {
    display: none;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .nav-button {
      transition: none;
    }

    .nav-button:active {
      transform: none;
    }
  }
</style>

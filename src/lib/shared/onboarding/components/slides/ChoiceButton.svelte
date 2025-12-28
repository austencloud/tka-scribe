<!-- ChoiceButton - Individual tab choice button in onboarding -->
<script lang="ts">
  import { fly } from "svelte/transition";
  import type { TabInfo } from "../../domain/types";

  const { tab, index, isFocused, onclick, onmouseenter } = $props<{
    tab: TabInfo;
    index: number;
    isFocused: boolean;
    onclick: () => void;
    onmouseenter: () => void;
  }>();
</script>

<button
  id="choice-{index}"
  class="choice-button"
  class:focused={isFocused}
  style="--tab-color: {tab.color}; --button-index: {index}"
  {onclick}
  {onmouseenter}
  in:fly={{ y: 20, delay: 100 + index * 80, duration: 300 }}
  role="option"
  aria-selected={isFocused}
>
  <div class="choice-icon">
    <i class="fas {tab.icon}" aria-hidden="true"></i>
  </div>
  <div class="choice-info">
    <span class="choice-name">{tab.title}</span>
    <span class="choice-hint">{tab.subtitle}</span>
  </div>
  <i class="fas fa-chevron-right choice-arrow" aria-hidden="true"></i>
</button>

<style>
  .choice-button {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
    padding: 1rem 1.25rem;
    background: rgba(255, 255, 255, 0.04);
    border: 2px solid color-mix(in srgb, var(--tab-color) 40%, transparent);
    border-radius: 12px;
    cursor: pointer;
    transition: all 200ms ease;
    text-align: left;
    position: relative;
    overflow: hidden;
  }

  @media (prefers-reduced-motion: no-preference) {
    .choice-button {
      animation: buttonPulse 2.5s ease-in-out infinite;
    }
  }

  .choice-button::before {
    content: "";
    position: absolute;
    inset: -2px;
    background: radial-gradient(
      ellipse at center,
      color-mix(in srgb, var(--tab-color) 25%, transparent),
      transparent 70%
    );
    border-radius: 14px;
    opacity: 0;
    z-index: -1;
  }

  @media (prefers-reduced-motion: no-preference) {
    .choice-button::before {
      animation: glowPulse 2.5s ease-in-out infinite;
    }
  }

  @keyframes buttonPulse {
    0%,
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--tab-color) 30%, transparent);
    }
    50% {
      transform: scale(1.02);
      box-shadow: 0 4px 20px color-mix(in srgb, var(--tab-color) 25%, transparent);
    }
  }

  @keyframes glowPulse {
    0%,
    100% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
  }

  .choice-button.focused {
    background: rgba(255, 255, 255, 0.06);
    border-color: var(--tab-color);
    box-shadow: 0 2px 16px color-mix(in srgb, var(--tab-color) 25%, transparent);
  }

  .choice-button:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--tab-color);
    transform: translateX(4px) scale(1.02);
    animation: none;
    box-shadow: 0 4px 24px color-mix(in srgb, var(--tab-color) 35%, transparent);
  }

  .choice-button:hover::before {
    animation: none;
    opacity: 0;
  }

  .choice-icon {
    width: 3rem;
    height: 3rem;
    display: grid;
    place-items: center;
    background: var(--theme-card-bg);
    border-radius: 10px;
    font-size: 1.25rem;
    color: var(--tab-color);
    flex-shrink: 0;
    position: relative;
  }

  .choice-icon::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--tab-color);
    opacity: 0.12;
    border-radius: 10px;
  }

  .choice-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .choice-name {
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .choice-hint {
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.45);
  }

  .choice-arrow {
    color: var(--tab-color);
    font-size: 1rem;
    transition: all 200ms ease;
  }

  @media (prefers-reduced-motion: no-preference) {
    .choice-arrow {
      animation: arrowBounce 1.25s ease-in-out infinite;
    }
  }

  @keyframes arrowBounce {
    0%,
    100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(6px);
    }
  }

  .choice-button:hover .choice-arrow {
    transform: translateX(8px);
    animation: none;
  }

  .choice-button:focus-visible {
    outline: 2px solid var(--theme-accent);
    outline-offset: 2px;
  }

  @media (max-width: 500px) {
    .choice-button {
      padding: 0.875rem 1rem;
    }

    .choice-icon {
      width: 2.5rem;
      height: 2.5rem;
      font-size: 1rem;
    }

    .choice-name {
      font-size: 0.9375rem;
    }

    .choice-hint {
      font-size: 0.75rem;
    }
  }

  @media (min-width: 900px) {
    .choice-button {
      padding: 1.125rem 1.5rem;
    }

    .choice-icon {
      width: 3.5rem;
      height: 3.5rem;
      font-size: 1.5rem;
    }
  }
</style>

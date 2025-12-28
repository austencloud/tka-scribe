<!-- ChoiceSlide - Final choice slide for module onboarding -->
<script lang="ts">
  import type { TabInfo } from "../../domain/types";
  import ChoiceButton from "./ChoiceButton.svelte";

  const {
    icon,
    title,
    subtitle,
    description,
    color,
    tabs,
    focusedIndex,
    onTabSelect,
    onFocusChange,
  } = $props<{
    icon: string;
    title: string;
    subtitle: string;
    description: string;
    color: string;
    tabs: TabInfo[];
    focusedIndex: number;
    onTabSelect: (tabId: string) => void;
    onFocusChange: (index: number) => void;
  }>();
</script>

<div class="slide-content choice-slide">
  <div class="slide-icon choice-icon" style="--icon-color: {color}">
    <i class="fas {icon}" aria-hidden="true"></i>
  </div>
  <h1 class="slide-title">{title}</h1>
  <p class="slide-subtitle">{subtitle}</p>
  <p class="slide-description">{description}</p>

  <div class="choice-buttons" role="listbox" aria-label="Choose a tab">
    {#each tabs as tab, i}
      <ChoiceButton
        {tab}
        index={i}
        isFocused={focusedIndex === i}
        onclick={() => onTabSelect(tab.id)}
        onmouseenter={() => onFocusChange(i)}
      />
    {/each}
  </div>

  {#if tabs.length <= 5}
    <p class="keyboard-hint">
      <kbd>↑</kbd><kbd>↓</kbd> to navigate · <kbd>Enter</kbd> to select ·
      {#each tabs as _, i}<kbd>{i + 1}</kbd>{/each} for quick pick
    </p>
  {/if}
</div>

<style>
  .slide-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 400px;
    width: 100%;
  }

  .slide-icon {
    width: 5rem;
    height: 5rem;
    display: grid;
    place-items: center;
    border-radius: 1.5rem;
    font-size: 2.5rem;
    color: white;
    margin-bottom: 1.25rem;
  }

  .choice-icon {
    background: var(--icon-color);
    box-shadow: 0 8px 32px color-mix(in srgb, var(--icon-color) 40%, transparent);
  }

  .slide-title {
    font-size: clamp(1.5rem, 5vw, 2rem);
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    margin: 0 0 0.25rem;
  }

  .slide-subtitle {
    font-size: 1rem;
    color: var(--theme-text-dim);
    margin: 0 0 0.75rem;
  }

  .slide-description {
    font-size: 0.9375rem;
    color: rgba(255, 255, 255, 0.45);
    margin: 0 0 1rem;
    line-height: 1.5;
  }

  .choice-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    margin-top: 1rem;
  }

  .keyboard-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1.25rem;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.35);
  }

  .keyboard-hint kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    padding: 0.125rem 0.25rem;
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke-strong);
    border-radius: 3px;
    font-family: inherit;
    font-size: 0.6875rem;
    color: var(--theme-text-dim);
  }

  @media (hover: none) and (pointer: coarse) {
    .keyboard-hint {
      display: none;
    }
  }

  @media (max-width: 500px) {
    .slide-icon {
      width: 4rem;
      height: 4rem;
      font-size: 2rem;
    }
  }

  @media (min-width: 900px) {
    .slide-content {
      max-width: 450px;
    }

    .slide-icon {
      width: 6rem;
      height: 6rem;
      font-size: 3rem;
      border-radius: 1.75rem;
    }

    .slide-title {
      font-size: 2.25rem;
    }

    .slide-description {
      font-size: 1.0625rem;
    }
  }
</style>

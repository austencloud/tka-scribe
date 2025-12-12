<!--
IconGrid.svelte - Premium icon picker component
Provides a beautiful, consistent icon selection experience
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";

  let {
    selectedIcon = $bindable(),
    availableIcons = [
      "⚙️",
      "⭐",
      "🎯",
      "🔥",
      "💫",
      "✨",
      "🎪",
      "🎭",
      "🎨",
      "🌟",
      "💎",
      "🏆",
    ],
    label = "Choose an Icon",
  } = $props<{
    selectedIcon: string;
    availableIcons?: string[];
    label?: string;
  }>();

  let hapticService: IHapticFeedbackService;

  onMount(async () => {
    hapticService = await resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  function selectIcon(icon: string) {
    hapticService?.trigger("selection");
    selectedIcon = icon;
  }
</script>

<div class="icon-picker">
  <div class="icon-label">{label}</div>
  <div class="icon-grid" role="group" aria-label="Icon selection">
    {#each availableIcons as icon}
      <button
        class="icon-button"
        class:selected={selectedIcon === icon}
        onclick={() => selectIcon(icon)}
        aria-label={`Select icon ${icon}`}
        aria-pressed={selectedIcon === icon}
      >
        <span class="icon-emoji">{icon}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .icon-picker {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .icon-label {
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  .icon-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
  }

  .icon-button {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08)),
      var(--theme-card-bg, rgba(255, 255, 255, 0.03))
    );
    border: 2px solid var(--theme-stroke, rgba(255, 255, 255, 0.15));
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 0;
    position: relative;
    overflow: hidden;
  }

  .icon-button::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at center,
      var(--theme-stroke, rgba(255, 255, 255, 0.1)) 0%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .icon-button:hover::before {
    opacity: 1;
  }

  .icon-button:hover {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-text, #fff) 12%, transparent),
      color-mix(in srgb, var(--theme-text, #fff) 6%, transparent)
    );
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.3));
    transform: translateY(-2px);
    box-shadow:
      0 4px 12px var(--theme-shadow, rgba(0, 0, 0, 0.15)),
      0 0 0 1px var(--theme-stroke, rgba(255, 255, 255, 0.1)) inset;
  }

  .icon-button:active {
    transform: translateY(0);
  }

  .icon-button.selected {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-accent, #3b82f6) 30%, transparent),
      color-mix(in srgb, var(--theme-accent, #3b82f6) 20%, transparent)
    );
    border-color: color-mix(in srgb, var(--theme-accent, #3b82f6) 60%, transparent);
    box-shadow:
      0 0 0 3px color-mix(in srgb, var(--theme-accent, #3b82f6) 20%, transparent),
      0 4px 12px color-mix(in srgb, var(--theme-accent, #3b82f6) 30%, transparent);
  }

  .icon-button.selected:hover {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-accent, #3b82f6) 40%, transparent),
      color-mix(in srgb, var(--theme-accent, #3b82f6) 30%, transparent)
    );
    border-color: color-mix(in srgb, var(--theme-accent, #3b82f6) 70%, transparent);
  }

  .icon-emoji {
    font-size: 28px;
    line-height: 1;
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 2px 4px var(--theme-shadow, rgba(0, 0, 0, 0.2)));
  }

  @media (max-width: 640px) {
    .icon-grid {
      gap: 8px;
    }

    .icon-emoji {
      font-size: 24px;
    }

    .icon-button {
      border-radius: 10px;
    }
  }
</style>

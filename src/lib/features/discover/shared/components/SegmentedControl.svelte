<!--
SegmentedControl - Modern iOS-style segmented control
Provides a clean button group for mutually exclusive options
Used for sort method selection (Letter/Length/Date)
-->
<script lang="ts">
import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
import { resolve } from "$lib/shared/inversify/di";
import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";

  interface Segment<T = string> {
    value: T;
    label: string;
    icon?: string;
  }

  let hapticService: IHapticFeedbackService;

  // Props
  const {
    segments,
    value,
    onChange = () => {},
    ariaLabel = "Segmented control",
  } = $props<{
    segments: Segment[];
    value: string;
    onChange?: (value: string) => void;
    ariaLabel?: string;
  }>();

  // Handle segment click
  function handleClick(segment: Segment) {
    if (segment.value !== value) {
      hapticService?.trigger("selection");
      onChange(segment.value);
    }
  }

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });
</script>

<div class="segmented-control" role="group" aria-label={ariaLabel}>
  {#each segments as segment (segment.value)}
    <button
      type="button"
      class="segment"
      class:active={value === segment.value}
      onclick={() => handleClick(segment)}
      aria-pressed={value === segment.value}
      aria-label={segment.label}
    >
      {#if segment.icon}
        <i class="fas {segment.icon}"></i>
      {/if}
      <span class="segment-label">{segment.label}</span>
    </button>
  {/each}
</div>

<style>
  /* Modern segmented control - iOS 18 / macOS Sequoia inspired */
  .segmented-control {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 3px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.08));
    border-radius: 100px; /* Full pill */
    backdrop-filter: blur(12px);
    box-shadow:
      inset 0 0.5px 1px var(--theme-shadow, rgba(0, 0, 0, 0.15)),
      0 1px 2px var(--theme-shadow, rgba(0, 0, 0, 0.1));
    transition: all 0.2s ease;
  }

  .segment {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 7px 14px;
    background: transparent;
    border: none;
    border-radius: 100px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    font-size: 14px;
    font-weight: 590; /* SF Pro semibold weight */
    letter-spacing: -0.2px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    position: relative;
    -webkit-tap-highlight-color: transparent;
  }

  .segment:hover:not(.active) {
    color: color-mix(in srgb, var(--theme-text, white) 85%, transparent);
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.06));
  }

  /* Active state - modern iOS pill style */
  .segment.active {
    background: color-mix(in srgb, var(--theme-text, white) 22%, transparent);
    color: color-mix(in srgb, var(--theme-text, white) 98%, transparent);
    box-shadow:
      0 1px 3px var(--theme-shadow, rgba(0, 0, 0, 0.2)),
      0 0.5px 1px var(--theme-shadow, rgba(0, 0, 0, 0.15)),
      inset 0 0.5px 0.5px var(--theme-stroke, rgba(255, 255, 255, 0.15));
  }

  .segment:active {
    transform: scale(0.97);
  }

  .segment i {
    font-size: 13px;
    opacity: 0.9;
  }

  .segment-label {
    font-size: 14px;
  }

  /* Compact mode for smaller screens */
  @media (max-width: 480px) {
    .segmented-control {
      padding: 2px;
      gap: 1px;
    }

    .segment {
      padding: 6px 11px;
      font-size: 13px;
    }

    .segment i {
      font-size: 12px;
    }

    .segment-label {
      font-size: 13px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .segmented-control,
    .segment {
      transition: none;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .segmented-control {
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid white;
    }

    .segment.active {
      background: white;
      color: black;
    }
  }
</style>

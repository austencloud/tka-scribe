<!-- IOSSegmentedControl.svelte - iOS-native segmented control (UISegmentedControl) -->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";

  interface Segment {
    id: string;
    label: string;
    icon?: string;
  }

  let { segments, selectedId, onSegmentSelect } = $props<{
    segments: Segment[];
    selectedId: string;
    onSegmentSelect: (id: string) => void;
  }>();

  let hapticService: IHapticFeedbackService | null = null;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  function handleSegmentClick(id: string) {
    if (id === selectedId) return;

    // iOS uses selection haptic for segmented control changes
    hapticService?.trigger("selection");
    onSegmentSelect(id);
  }

  // Calculate the index of selected segment for animation
  const selectedIndex = $derived(
    segments.findIndex((seg: Segment) => seg.id === selectedId)
  );
</script>

<div class="ios-segmented-control" role="tablist">
  <!-- Sliding background indicator -->
  <div
    class="segment-indicator"
    style="
      transform: translateX(calc({selectedIndex} * 100%));
      width: calc(100% / {segments.length});
    "
    aria-hidden="true"
  ></div>

  <!-- Segments -->
  {#each segments as segment, _}
    <button
      class="segment"
      class:selected={selectedId === segment.id}
      onclick={() => handleSegmentClick(segment.id)}
      role="tab"
      aria-selected={selectedId === segment.id}
      aria-label={segment.label}
      type="button"
    >
      {#if segment.icon}
        <span class="segment-icon" aria-hidden="true">{@html segment.icon}</span
        >
      {/if}
      <span class="segment-label">{segment.label}</span>
    </button>
  {/each}
</div>

<style>
  /* iOS Segmented Control - HIG 2025 Specification (Dark Mode Default) */
  .ios-segmented-control {
    display: flex;
    position: relative;
    background: rgba(118, 118, 128, 0.24); /* iOS fill tertiary dark */
    border-radius: 9px; /* iOS standard corner radius */
    padding: 2px;
    height: 32px; /* iOS standard segmented control height */
    width: fit-content;
    min-width: 240px;
    max-width: 100%;
    margin: 0 auto;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    isolation: isolate; /* Create stacking context for indicator */
  }

  /* Sliding background indicator */
  .segment-indicator {
    position: absolute;
    top: 2px;
    bottom: 2px;
    left: 2px;
    background: rgba(99, 99, 102, 0.6); /* iOS system gray dark */
    border-radius: 7px;
    box-shadow:
      0 3px 8px rgba(0, 0, 0, 0.3),
      0 1px 1px rgba(0, 0, 0, 0.25);
    transition: transform 0.25s cubic-bezier(0.36, 0.66, 0.04, 1); /* iOS spring */
    pointer-events: none;
    z-index: 0;
  }

  /* Segment button */
  .segment {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 0 12px;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.95); /* iOS label primary dark */
    font-size: 13px; /* iOS standard segmented control font size */
    font-weight: 400;
    letter-spacing: -0.08px;
    cursor: pointer;
    transition: color 0.2s ease;
    position: relative;
    z-index: 1;
    min-width: 0; /* Allow flexbox to shrink */
    white-space: nowrap;
  }

  .segment:active {
    opacity: 0.7;
  }

  /* Selected segment */
  .segment.selected {
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  /* Unselected segments */
  .segment:not(.selected) {
    color: rgba(235, 235, 245, 0.6); /* iOS label tertiary dark */
  }

  /* Segment icon */
  .segment-icon {
    font-size: 14px;
    line-height: 1;
  }

  .segment-label {
    font-size: inherit;
    font-weight: inherit;
  }

  /* Focus state for keyboard navigation - iOS 15+ Enhanced */
  .segment:focus-visible {
    outline: none;
  }

  .segment:focus-visible::before {
    content: "";
    position: absolute;
    inset: -3px;
    border-radius: 8px;
    border: 3px solid #007aff; /* iOS 15+ thicker focus ring */
    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.2); /* iOS glow effect */
    pointer-events: none;
    animation: ios-focus-pulse 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);
  }

  @keyframes ios-focus-pulse {
    0% {
      transform: scale(0.95);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* Light Mode Override */
  @media (prefers-color-scheme: light) {
    .ios-segmented-control {
      background: rgba(118, 118, 128, 0.12); /* iOS fill tertiary light */
    }

    .segment-indicator {
      background: rgba(255, 255, 255, 0.95); /* iOS system white */
      box-shadow:
        0 3px 8px rgba(0, 0, 0, 0.15),
        0 1px 1px rgba(0, 0, 0, 0.16);
    }

    .segment {
      color: rgba(0, 0, 0, 0.95); /* iOS label primary light */
    }

    .segment.selected {
      color: rgba(0, 0, 0, 0.95);
    }

    .segment:not(.selected) {
      color: rgba(60, 60, 67, 0.6); /* iOS label tertiary light */
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .segment-indicator {
      transition: none;
    }
  }

  /* High Contrast */
  @media (prefers-contrast: high) {
    .ios-segmented-control {
      background: rgba(118, 118, 128, 0.3);
      border: 1px solid rgba(0, 0, 0, 0.3);
    }

    .segment-indicator {
      background: rgba(255, 255, 255, 0.98);
      box-shadow:
        0 3px 8px rgba(0, 0, 0, 0.4),
        0 1px 1px rgba(0, 0, 0, 0.3);
    }

    .segment {
      color: rgba(0, 0, 0, 0.95);
    }

    .segment:not(.selected) {
      color: rgba(0, 0, 0, 0.7);
    }
  }

  @media (prefers-contrast: high) and (prefers-color-scheme: dark) {
    .ios-segmented-control {
      background: rgba(118, 118, 128, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .segment-indicator {
      background: rgba(99, 99, 102, 0.8);
    }

    .segment {
      color: rgba(255, 255, 255, 0.95);
    }

    .segment:not(.selected) {
      color: rgba(255, 255, 255, 0.7);
    }
  }

  /* Responsive */
  @media (max-width: 480px) {
    .ios-segmented-control {
      min-width: 200px;
      width: 100%;
      max-width: 320px;
    }

    .segment {
      padding: 0 8px;
      font-size: 12px;
    }

    .segment-icon {
      font-size: 13px;
    }
  }
</style>

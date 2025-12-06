<!--
  BpmPresetChips.svelte

  2026 Bento Box Design - BPM preset chips
  - Click preset chip to instantly set that BPM
  - Click "Custom" to reveal floating popover with +/- controls
-->
<script lang="ts">
  import { createComponentLogger } from "$lib/shared/utils/debug-logger";

  const debug = createComponentLogger("BpmPresetChips");

  // Constants
  const BPM_PRESETS = [15, 30, 50, 90, 120, 150];

  // Props
  let {
    bpm = $bindable(60),
    min = 15,
    max = 180,
    step = 1,
    onBpmChange,
  }: {
    bpm: number;
    min?: number;
    max?: number;
    step?: number;
    onBpmChange?: (bpm: number) => void;
  } = $props();

  // State for custom popover
  let showCustomPopover = $state(false);
  let customButtonRef: HTMLButtonElement | null = null;
  let popoverX = $state(0);
  let popoverY = $state(0);

  // Handlers
  function selectPreset(presetBpm: number) {
    bpm = presetBpm;
    onBpmChange?.(presetBpm);
    showCustomPopover = false;
  }

  function toggleCustomPopover() {
    debug.log("Custom button clicked, current state:", showCustomPopover);
    showCustomPopover = !showCustomPopover;
    debug.log("New state:", showCustomPopover);
  }

  function decreaseBpm() {
    const newBpm = Math.max(min, bpm - step);
    bpm = newBpm;
    onBpmChange?.(newBpm);
  }

  function increaseBpm() {
    const newBpm = Math.min(max, bpm + step);
    bpm = newBpm;
    onBpmChange?.(newBpm);
  }

  // Check if current BPM matches a preset
  let isPresetValue = $derived(BPM_PRESETS.includes(bpm));

  // Update popover position when it opens
  $effect(() => {
    debug.log("Popover effect running:", {
      showCustomPopover,
      customButtonRef: !!customButtonRef,
    });

    if (showCustomPopover && customButtonRef) {
      const rect = customButtonRef.getBoundingClientRect();
      popoverX = rect.left + rect.width / 2;
      // Position ABOVE the button instead of below
      popoverY = rect.top - 8;
      debug.log("Popover position:", { popoverX, popoverY, rect });
    }
  });

  // Close popover on outside click
  function handleDocumentClick(event: MouseEvent) {
    if (showCustomPopover) {
      const target = event.target as HTMLElement;
      const popover = document.querySelector(".custom-popover");
      if (
        popover &&
        customButtonRef &&
        !popover.contains(target) &&
        !customButtonRef.contains(target)
      ) {
        showCustomPopover = false;
      }
    }
  }

  $effect(() => {
    if (showCustomPopover) {
      setTimeout(() => {
        document.addEventListener("click", handleDocumentClick);
      }, 0);
      return () => document.removeEventListener("click", handleDocumentClick);
    }
    return undefined;
  });
</script>

<div class="bpm-preset-chips">
  {#each BPM_PRESETS as presetBpm}
    <button
      class="preset-chip"
      class:active={bpm === presetBpm && !showCustomPopover}
      onclick={() => selectPreset(presetBpm)}
      type="button"
      aria-label="Set BPM to {presetBpm}"
    >
      {presetBpm}
    </button>
  {/each}

  <!-- Custom Chip -->
  <button
    bind:this={customButtonRef}
    class="preset-chip custom-chip"
    class:active={!isPresetValue || showCustomPopover}
    onclick={toggleCustomPopover}
    type="button"
    aria-label="Custom BPM"
  >
    {!isPresetValue ? bpm : "Custom"}
  </button>
</div>

<!-- Custom Controls Popover -->
{#if showCustomPopover}
  <div class="custom-popover" style="left: {popoverX}px; top: {popoverY}px;">
    <div class="popover-header">Custom BPM</div>
    <div class="popover-controls">
      <button
        class="popover-btn"
        onclick={decreaseBpm}
        disabled={bpm <= min}
        aria-label="Decrease BPM"
        type="button"
      >
        <i class="fas fa-minus"></i>
      </button>

      <div class="bpm-display">
        <span class="bpm-number">{bpm}</span>
        <span class="bpm-unit">BPM</span>
      </div>

      <button
        class="popover-btn"
        onclick={increaseBpm}
        disabled={bpm >= max}
        aria-label="Increase BPM"
        type="button"
      >
        <i class="fas fa-plus"></i>
      </button>
    </div>
  </div>
{/if}

<style>
  /* ===========================
     2026 BENTO BOX DESIGN
     BPM Preset Chips
     =========================== */

  .bpm-preset-chips {
    display: flex;
    gap: 6px;
    width: 100%;
  }

  .preset-chip {
    flex: 1;
    min-width: 0;
    min-height: 52px;
    padding: 10px 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.7);
    font-size: clamp(0.75rem, 2.5vw, 0.85rem);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    font-variant-numeric: tabular-nums;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  @media (hover: hover) and (pointer: fine) {
    .preset-chip:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.18);
      color: rgba(255, 255, 255, 0.85);
      transform: translateY(-1px);
      box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }
  }

  .preset-chip:active:not(:disabled) {
    transform: scale(0.97);
  }

  .preset-chip.active {
    background: linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.3) 0%,
      rgba(124, 58, 237, 0.25) 100%
    );
    border-color: rgba(139, 92, 246, 0.5);
    color: rgba(255, 255, 255, 1);
    box-shadow:
      0 0 20px rgba(139, 92, 246, 0.25),
      0 2px 8px rgba(139, 92, 246, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .custom-chip {
    font-size: clamp(0.65rem, 2vw, 0.7rem);
    text-transform: uppercase;
    letter-spacing: 0.2px;
    padding: 10px 6px;
  }

  /* ===========================
     CUSTOM POPOVER
     =========================== */

  .custom-popover {
    position: fixed;
    transform: translate(-50%, -100%);
    z-index: 9999;
    background: rgba(139, 92, 246, 0.95);
    border: 2px solid rgba(139, 92, 246, 0.8);
    border-radius: 16px;
    padding: 12px;
    min-width: 200px;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.1),
      0 0 24px rgba(139, 92, 246, 0.5);
    backdrop-filter: blur(20px);
    animation: popoverSlide 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: auto;
  }

  @keyframes popoverSlide {
    from {
      opacity: 0;
      transform: translate(-50%, calc(-100% - 8px));
    }
    to {
      opacity: 1;
      transform: translate(-50%, -100%);
    }
  }

  .popover-header {
    font-size: 0.7rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0 4px 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: 8px;
  }

  .popover-controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .popover-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.06);
    border: 1.5px solid rgba(255, 255, 255, 0.12);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.15s ease;
    font-size: 0.75rem;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  @media (hover: hover) and (pointer: fine) {
    .popover-btn:hover:not(:disabled) {
      background: rgba(139, 92, 246, 0.2);
      border-color: rgba(139, 92, 246, 0.4);
      color: white;
      box-shadow:
        0 2px 8px rgba(139, 92, 246, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }
  }

  .popover-btn:active:not(:disabled) {
    transform: scale(0.93);
    background: rgba(139, 92, 246, 0.25);
  }

  .popover-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .bpm-display {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 10px;
  }

  .bpm-number {
    font-size: 1.1rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .bpm-unit {
    font-size: 0.55rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 2px;
  }

  /* ===========================
     RESPONSIVE
     =========================== */

  @media (max-width: 480px) {
    .preset-chip {
      min-height: 44px;
      padding: 8px 6px;
      font-size: 0.75rem;
    }
  }

  /* ===========================
     ACCESSIBILITY
     =========================== */

  @media (prefers-reduced-motion: reduce) {
    .preset-chip,
    .popover-btn,
    .custom-popover {
      transition: none;
      animation: none;
    }

    .preset-chip:hover,
    .preset-chip:active {
      transform: none;
    }
  }
</style>

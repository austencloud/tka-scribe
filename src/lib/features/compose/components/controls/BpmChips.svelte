<!--
  BpmChips.svelte

  Unified BPM chip selector component

  Variants:
  - "full": Shows +/- buttons, tap tempo display, and preset chips (default)
  - "compact": Shows only preset chips with a "Custom" popover for fine adjustment
-->
<script lang="ts">
  // Constants
  const BPM_PRESETS = [15, 30, 60, 90, 120, 150];

  // Props
  let {
    bpm = $bindable(60),
    min = 15,
    max = 180,
    step = 1,
    variant = "full",
    onBpmChange,
  }: {
    bpm: number;
    min?: number;
    max?: number;
    step?: number;
    variant?: "full" | "compact";
    onBpmChange?: (bpm: number) => void;
  } = $props();

  // Tap tempo state (full variant only)
  let tapTimes: number[] = $state([]);
  let tapTimeout: number | null = null;
  const TAP_TIMEOUT_MS = 2000;
  const MAX_TAP_HISTORY = 8;

  // Custom popover state (compact variant only)
  let showCustomPopover = $state(false);
  let customButtonRef = $state<HTMLButtonElement | null>(null);
  let popoverX = $state(0);
  let popoverY = $state(0);

  // Derived
  let isPresetValue = $derived(BPM_PRESETS.includes(bpm));

  // Handlers
  function selectPreset(presetBpm: number) {
    bpm = presetBpm;
    onBpmChange?.(presetBpm);
    showCustomPopover = false;
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

  // Tap tempo handler (full variant)
  function handleTap() {
    const now = Date.now();

    if (tapTimeout !== null) {
      clearTimeout(tapTimeout);
    }

    tapTimes = [...tapTimes, now].slice(-MAX_TAP_HISTORY);

    if (tapTimes.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < tapTimes.length; i++) {
        const current = tapTimes[i];
        const previous = tapTimes[i - 1];
        if (current !== undefined && previous !== undefined) {
          intervals.push(current - previous);
        }
      }

      const avgInterval =
        intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      const newBpm = Math.max(min, Math.min(max, calculatedBpm));
      bpm = newBpm;
      onBpmChange?.(newBpm);
    }

    tapTimeout = setTimeout(() => {
      tapTimes = [];
    }, TAP_TIMEOUT_MS) as unknown as number;
  }

  // Custom popover toggle (compact variant)
  function toggleCustomPopover() {
    showCustomPopover = !showCustomPopover;
  }

  // Update popover position
  $effect(() => {
    if (showCustomPopover && customButtonRef) {
      const rect = customButtonRef.getBoundingClientRect();
      popoverX = rect.left + rect.width / 2;
      popoverY = rect.top - 8;
    }
  });

  // Close popover on outside click
  function handleDocumentClick(event: MouseEvent) {
    if (showCustomPopover) {
      const target = event.target as HTMLElement;
      const popover = document.querySelector(".bpm-custom-popover");
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

{#if variant === "full"}
  <!-- Full variant: +/- buttons + tap tempo display + chips -->
  <div class="bpm-chips-container">
    <div class="bpm-chips full">
      <div class="bpm-adjuster">
        <button
          class="adjust-btn"
          onclick={decreaseBpm}
          disabled={bpm <= min}
          aria-label="Decrease BPM"
          type="button"
        >
          <i class="fas fa-minus"></i>
        </button>

        <button
          class="current-bpm"
          onclick={handleTap}
          type="button"
          aria-label="Tap to set tempo"
          title="Tap repeatedly to set BPM"
        >
          <span class="bpm-value">{bpm}</span>
          <span class="bpm-label">{tapTimes.length > 0 ? "TAP" : "BPM"}</span>
        </button>

        <button
          class="adjust-btn"
          onclick={increaseBpm}
          disabled={bpm >= max}
          aria-label="Increase BPM"
          type="button"
        >
          <i class="fas fa-plus"></i>
        </button>
      </div>

      <div class="preset-chips">
        {#each BPM_PRESETS as presetBpm}
          <button
            class="preset-chip"
            class:active={bpm === presetBpm}
            onclick={() => selectPreset(presetBpm)}
            type="button"
            aria-label="Set BPM to {presetBpm}"
          >
            {presetBpm}
          </button>
        {/each}
      </div>
    </div>
  </div>
{:else}
  <!-- Compact variant: chips only + custom popover -->
  <div class="bpm-chips compact">
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

  {#if showCustomPopover}
    <div
      class="bpm-custom-popover"
      style="left: {popoverX}px; top: {popoverY}px;"
    >
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
{/if}

<style>
  /* ===========================
     UNIFIED BPM CHIPS
     =========================== */

  .bpm-chips-container {
    container-type: inline-size;
    container-name: bpm-chips;
    width: 100%;
  }

  .bpm-chips {
    display: flex;
    width: 100%;
  }

  .bpm-chips.full {
    flex-direction: column;
    gap: 8px;
  }

  .bpm-chips.compact {
    gap: 6px;
    overflow: hidden;
    flex-wrap: nowrap;
  }

  /* Wide layout for full variant */
  @container bpm-chips (min-width: 540px) {
    .bpm-chips.full {
      flex-direction: row;
      align-items: center;
      gap: 12px;
    }

    .bpm-adjuster {
      flex-shrink: 0;
    }

    .preset-chips {
      flex: 1;
      min-width: 0;
    }
  }

  /* ===========================
     BPM ADJUSTER (full variant)
     =========================== */

  .bpm-adjuster {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .current-bpm {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px 20px;
    min-width: 80px;
    background: rgba(139, 92, 246, 0.15);
    border: 1.5px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
    box-shadow:
      0 0 20px rgba(139, 92, 246, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    -webkit-tap-highlight-color: transparent;
  }

  @media (hover: hover) and (pointer: fine) {
    .current-bpm:hover {
      background: rgba(139, 92, 246, 0.2);
      border-color: rgba(139, 92, 246, 0.4);
      transform: scale(1.02);
      box-shadow:
        0 0 24px rgba(139, 92, 246, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
    }
  }

  .current-bpm:active {
    transform: scale(0.98);
    background: rgba(139, 92, 246, 0.25);
    border-color: rgba(139, 92, 246, 0.5);
  }

  .bpm-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .bpm-label {
    font-size: 0.6rem;
    font-weight: 600;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 2px;
  }

  /* ===========================
     ADJUST BUTTONS
     =========================== */

  .adjust-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 50%;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  @media (hover: hover) and (pointer: fine) {
    .adjust-btn:hover:not(:disabled) {
      background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
      border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.18));
      color: var(--theme-text, rgba(255, 255, 255, 0.85));
      transform: scale(1.05);
      box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }
  }

  .adjust-btn:active:not(:disabled) {
    transform: scale(0.97);
  }

  .adjust-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* ===========================
     PRESET CHIPS
     =========================== */

  .preset-chips {
    display: flex;
    gap: 6px;
    width: 100%;
  }

  .preset-chip {
    flex: 1;
    min-width: 0;
    min-height: 52px;
    padding: 10px 8px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
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

  .preset-chip:active:not(:disabled) {
    transform: scale(0.97);
  }

  /* Active (selected) state */
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

  @media (hover: hover) and (pointer: fine) {
    /* Hover for non-active chips only */
    .preset-chip:hover:not(:disabled):not(.active) {
      background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
      border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.18));
      color: var(--theme-text, rgba(255, 255, 255, 0.85));
      transform: translateY(-1px);
      box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }

    /* Hover for active chips - maintains purple with enhancement */
    .preset-chip.active:hover {
      background: linear-gradient(
        135deg,
        rgba(139, 92, 246, 0.35) 0%,
        rgba(124, 58, 237, 0.3) 100%
      );
      border-color: rgba(139, 92, 246, 0.6);
      color: rgba(255, 255, 255, 1);
      transform: translateY(-1px);
      box-shadow:
        0 0 24px rgba(139, 92, 246, 0.3),
        0 4px 12px rgba(139, 92, 246, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
    }
  }

  /* Custom chip (compact variant) */
  .custom-chip {
    font-size: clamp(0.65rem, 2vw, 0.7rem);
    text-transform: uppercase;
    letter-spacing: 0.2px;
    padding: 10px 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 60px;
  }

  /* ===========================
     CUSTOM POPOVER (compact)
     =========================== */

  .bpm-custom-popover {
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
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0 4px 8px;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
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
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.06));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 50%;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
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
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .bpm-unit {
    font-size: 0.55rem;
    font-weight: 600;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 2px;
  }

  /* ===========================
     RESPONSIVE
     =========================== */

  @media (max-width: 480px) {
    .adjust-btn {
      width: 44px;
      height: 44px;
      font-size: 0.7rem;
    }

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
    .adjust-btn,
    .preset-chip,
    .popover-btn,
    .bpm-custom-popover,
    .current-bpm {
      transition: none;
      animation: none;
    }

    .adjust-btn:hover,
    .adjust-btn:active,
    .preset-chip:hover,
    .preset-chip:active,
    .current-bpm:hover,
    .current-bpm:active {
      transform: none;
    }
  }
</style>

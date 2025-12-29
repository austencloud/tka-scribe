<!--
PreferencesPanel.svelte - Generation preferences controls

Modern chip-based UI for sequence generation preferences:
- Toggle chips for boolean preferences
- Chip group for motion type preference
- LOOP type selection when makeCircular is enabled
- Circularization options when sequence isn't directly loopable

Clicking a LOOP chip immediately applies it (regenerates with that LOOP).
-->
<script lang="ts">
  import type { Letter } from "$lib/shared/foundation/domain/models/Letter";
  import type {
    SpellPreferences,
    LOOPOption,
    LOOPType,
    CircularizationOption,
  } from "../domain/models/spell-models";
  import { slide } from "svelte/transition";

  let {
    preferences,
    onUpdate,
    availableLOOPOptions = [],
    onApplyLOOP,
    circularizationOptions = [],
    directLoopUnavailableReason = null,
    needsCircularization = false,
  }: {
    preferences: SpellPreferences;
    onUpdate: <K extends keyof SpellPreferences>(
      key: K,
      value: SpellPreferences[K]
    ) => void;
    availableLOOPOptions?: LOOPOption[];
    /** Called when user clicks a LOOP chip - immediately applies it */
    onApplyLOOP?: (bridgeLetter: Letter | null, loopType: LOOPType) => void;
    circularizationOptions?: CircularizationOption[];
    directLoopUnavailableReason?: string | null;
    needsCircularization?: boolean;
  } = $props();

  // Motion preference options
  const motionOptions = [
    { value: null, label: "Any Motion" },
    { value: "dash" as const, label: "Favor Dashes" },
    { value: "no-dash" as const, label: "Avoid Dashes" },
  ];

  // Format LOOP type for display
  function formatLOOPType(loopType: LOOPType): string {
    // Convert STRICT_ROTATED -> "Rotated", STRICT_MIRRORED -> "Mirrored", etc.
    return loopType
      .replace("STRICT_", "")
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  }

  // Handle LOOP chip click - immediately apply it
  function handleUniversalLOOPClick(loopType: LOOPType) {
    onApplyLOOP?.(null, loopType);
  }

  // Handle bridge letter LOOP click - apply with bridge letter
  function handleBridgeLOOPClick(bridgeLetter: Letter, loopType: LOOPType) {
    onApplyLOOP?.(bridgeLetter, loopType);
  }
</script>

<div class="preferences-panel">
  <h4 class="section-title">Preferences</h4>

  <!-- Boolean toggles as chips -->
  <div class="toggle-chips">
    <button
      class="toggle-chip"
      class:active={preferences.minimizeReversals}
      onclick={() => onUpdate("minimizeReversals", !preferences.minimizeReversals)}
      title="Prefer sequences without prop reversals"
    >
      Minimize Reversals
    </button>

    <button
      class="toggle-chip"
      class:active={preferences.preferContinuous}
      onclick={() => onUpdate("preferContinuous", !preferences.preferContinuous)}
      title="Favor smooth, flowing transitions"
    >
      Continuous Flow
    </button>

    <button
      class="toggle-chip"
      class:active={preferences.makeCircular}
      onclick={() => onUpdate("makeCircular", !preferences.makeCircular)}
      title="End position connects back to start (LOOP)"
    >
      Circular (LOOP)
    </button>
  </div>

  <!-- Motion type as chip group -->
  <div class="motion-section">
    <span class="motion-label">Motion Style</span>
    <div class="motion-chips">
      {#each motionOptions as option}
        <button
          class="motion-chip"
          class:active={preferences.favorMotionType === option.value}
          onclick={() => onUpdate("favorMotionType", option.value)}
        >
          {option.label}
        </button>
      {/each}
    </div>
  </div>

  <!-- LOOP type selection (shown when makeCircular is on) -->
  {#if preferences.makeCircular && availableLOOPOptions.length > 0 && !needsCircularization}
    <!-- Direct LOOP options (when position groups match) -->
    <div class="loop-section" transition:slide={{ duration: 200 }}>
      <span class="loop-label">Apply LOOP</span>
      <p class="loop-description">
        Click to apply a LOOP that returns to start position
      </p>
      <div class="loop-chips">
        {#each availableLOOPOptions as option}
          <button
            class="loop-chip"
            onclick={() => handleUniversalLOOPClick(option.loopType)}
            title={option.description || formatLOOPType(option.loopType)}
          >
            {formatLOOPType(option.loopType)}
          </button>
        {/each}
      </div>
    </div>
  {:else if preferences.makeCircular && needsCircularization}
    <!-- Circularization options (when position groups don't match) -->
    <div class="loop-section circularization" transition:slide={{ duration: 200 }}>
      <span class="loop-label">Apply LOOP</span>
      {#if directLoopUnavailableReason}
        <p class="loop-reason">{directLoopUnavailableReason}</p>
      {/if}

      <!-- Universal LOOPs (always available, no bridge letter needed) -->
      {#if availableLOOPOptions.length > 0}
        <div class="universal-loops">
          <p class="loop-description">Click to apply (no bridge letter needed):</p>
          <div class="loop-chips">
            {#each availableLOOPOptions as option}
              <button
                class="loop-chip"
                onclick={() => handleUniversalLOOPClick(option.loopType)}
                title={option.description || formatLOOPType(option.loopType)}
              >
                {formatLOOPType(option.loopType)}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Bridge letter options for position-dependent LOOPs -->
      {#if circularizationOptions.length > 0}
        <div class="bridge-options">
          <p class="loop-description">
            Or click to add a bridge letter + LOOP:
          </p>
          <div class="circularization-options">
            {#each circularizationOptions as option}
              <div class="circularization-option">
                <div class="option-header">
                  <span class="bridge-letters">
                    +{option.bridgeLetters.join("")}
                  </span>
                  <span class="option-end">→ {option.endPosition}</span>
                </div>
                <div class="option-loops">
                  {#each option.availableLOOPs as loop}
                    <button
                      class="loop-chip small"
                      onclick={() => handleBridgeLOOPClick(option.bridgeLetters[0], loop.loopType)}
                      title={loop.description || formatLOOPType(loop.loopType)}
                    >
                      {formatLOOPType(loop.loopType)}
                    </button>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {:else if preferences.makeCircular}
    <div class="loop-section no-options" transition:slide={{ duration: 200 }}>
      <span class="loop-label">LOOP Type</span>
      <p class="loop-note">
        Generate a sequence first to see available LOOP options
      </p>
    </div>
  {/if}
</div>

<style>
  .preferences-panel {
    display: flex;
    flex-direction: column;
    gap: var(--settings-spacing-md, 16px);
  }

  .section-title {
    margin: 0;
    font-size: var(--font-size-min, 14px);
    font-weight: 600;
    color: var(--theme-text, #ffffff);
  }

  /* Toggle chips for boolean preferences */
  .toggle-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--settings-spacing-sm, 8px);
  }

  .toggle-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--settings-spacing-sm, 8px) var(--settings-spacing-md, 16px);
    min-height: 44px;
    background: var(--theme-panel-bg, rgba(18, 18, 28, 0.98));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 22px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
    font-size: var(--font-size-min, 14px);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .toggle-chip:hover {
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.2));
    color: var(--theme-text, #ffffff);
  }

  .toggle-chip.active {
    background: var(--theme-accent, #6366f1);
    border-color: var(--theme-accent, #6366f1);
    color: white;
  }

  .toggle-chip.active:hover {
    background: var(--theme-accent-hover, #4f46e5);
    border-color: var(--theme-accent-hover, #4f46e5);
  }

  /* Motion preference section */
  .motion-section {
    display: flex;
    flex-direction: column;
    gap: var(--settings-spacing-sm, 8px);
  }

  .motion-label {
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .motion-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--settings-spacing-xs, 4px);
  }

  .motion-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--settings-spacing-xs, 4px) var(--settings-spacing-sm, 8px);
    min-height: 36px;
    background: var(--theme-panel-bg, rgba(18, 18, 28, 0.98));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 18px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
    font-size: var(--font-size-compact, 12px);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .motion-chip:hover {
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.2));
    color: var(--theme-text, #ffffff);
  }

  .motion-chip.active {
    background: var(--theme-accent, #6366f1);
    border-color: var(--theme-accent, #6366f1);
    color: white;
  }

  .motion-chip.active:hover {
    background: var(--theme-accent-hover, #4f46e5);
    border-color: var(--theme-accent-hover, #4f46e5);
  }

  /* LOOP type selection section */
  .loop-section {
    display: flex;
    flex-direction: column;
    gap: var(--settings-spacing-sm, 8px);
    padding-top: var(--settings-spacing-sm, 8px);
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .loop-label {
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .loop-description {
    margin: 0;
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
  }

  .loop-note {
    margin: 0;
    font-size: var(--font-size-min, 14px);
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
    font-style: italic;
  }

  .loop-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--settings-spacing-xs, 4px);
  }

  .loop-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: var(--settings-spacing-sm, 8px) var(--settings-spacing-md, 16px);
    min-height: 44px;
    background: var(--theme-panel-bg, rgba(18, 18, 28, 0.98));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: var(--settings-radius-sm, 8px);
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
    font-size: var(--font-size-min, 14px);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .loop-chip:hover {
    border-color: var(--theme-accent, #6366f1);
    background: var(--theme-accent, #6366f1);
    color: white;
  }

  /* Circularization options */
  .loop-section.circularization {
    border-top-color: var(--semantic-warning, #f59e0b);
  }

  .loop-reason {
    margin: 0;
    font-size: var(--font-size-compact, 12px);
    color: var(--semantic-warning, #f59e0b);
    font-style: italic;
  }

  .universal-loops,
  .bridge-options {
    display: flex;
    flex-direction: column;
    gap: var(--settings-spacing-sm, 8px);
  }

  .bridge-options {
    margin-top: var(--settings-spacing-sm, 8px);
    padding-top: var(--settings-spacing-sm, 8px);
    border-top: 1px dashed var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .circularization-options {
    display: flex;
    flex-direction: column;
    gap: var(--settings-spacing-md, 16px);
  }

  .circularization-option {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: var(--settings-radius-sm, 8px);
    padding: var(--settings-spacing-sm, 8px);
    display: flex;
    flex-direction: column;
    gap: var(--settings-spacing-sm, 8px);
  }

  .option-header {
    display: flex;
    align-items: center;
    gap: var(--settings-spacing-sm, 8px);
    font-size: var(--font-size-min, 14px);
  }

  .bridge-letters {
    font-weight: 600;
    color: var(--theme-accent, #6366f1);
  }

  .option-end {
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
    font-size: var(--font-size-compact, 12px);
  }

  .option-loops {
    display: flex;
    flex-wrap: wrap;
    gap: var(--settings-spacing-xs, 4px);
  }

  .loop-chip.small {
    padding: var(--settings-spacing-xs, 4px) var(--settings-spacing-sm, 8px);
    min-height: 32px;
    font-size: var(--font-size-compact, 12px);
  }
</style>

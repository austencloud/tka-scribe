<!--
PreferencesPanel.svelte - Generation preferences controls

Modern chip-based UI for sequence generation preferences:
- Toggle chips for boolean preferences (minimize reversals, continuous flow, circular)
- Chip group for motion type preference
-->
<script lang="ts">
  import type { SpellPreferences } from "../domain/models/spell-models";

  let {
    preferences,
    onUpdate,
  }: {
    preferences: SpellPreferences;
    onUpdate: <K extends keyof SpellPreferences>(
      key: K,
      value: SpellPreferences[K]
    ) => void;
  } = $props();

  // Motion preference options
  const motionOptions = [
    { value: null, label: "Any Motion" },
    { value: "dash" as const, label: "Favor Dashes" },
    { value: "no-dash" as const, label: "Avoid Dashes" },
  ];
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
</style>

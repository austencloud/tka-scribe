<!--
PreferencesPanel.svelte - Generation preferences controls

Allows users to customize how sequences are generated:
- Minimize reversals
- Prefer continuous movement
- Motion type preference
- Max bridge letters
- Make circular (LOOP)
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

  // Handle checkbox toggle
  function handleToggle(key: keyof SpellPreferences) {
    onUpdate(key, !preferences[key] as SpellPreferences[typeof key]);
  }

  // Handle motion preference change
  function handleMotionChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target.value as "dash" | "no-dash" | "none";
    onUpdate("favorMotionType", value === "none" ? null : value);
  }

  // Handle max bridge letters change
  function handleMaxBridgeChange(event: Event) {
    const target = event.target as HTMLInputElement;
    onUpdate("maxBridgeLetters", parseInt(target.value, 10));
  }
</script>

<div class="preferences-panel">
  <h4 class="section-title">Preferences</h4>

  <div class="preferences-grid">
    <!-- Minimize Reversals -->
    <label class="preference-item">
      <input
        type="checkbox"
        checked={preferences.minimizeReversals}
        onchange={() => handleToggle("minimizeReversals")}
      />
      <span class="preference-label">Minimize reversals</span>
      <span class="preference-hint">Prefer sequences without prop reversals</span
      >
    </label>

    <!-- Prefer Continuous -->
    <label class="preference-item">
      <input
        type="checkbox"
        checked={preferences.preferContinuous}
        onchange={() => handleToggle("preferContinuous")}
      />
      <span class="preference-label">Prefer continuous</span>
      <span class="preference-hint">Favor smooth, flowing transitions</span>
    </label>

    <!-- Make Circular (LOOP) -->
    <label class="preference-item">
      <input
        type="checkbox"
        checked={preferences.makeCircular}
        onchange={() => handleToggle("makeCircular")}
      />
      <span class="preference-label">Make circular (LOOP)</span>
      <span class="preference-hint"
        >End position connects back to start</span
      >
    </label>

    <!-- Motion Type Preference -->
    <div class="preference-item select-item">
      <span class="preference-label">Motion preference</span>
      <select
        class="preference-select"
        value={preferences.favorMotionType ?? "none"}
        onchange={handleMotionChange}
      >
        <option value="none">No preference</option>
        <option value="dash">Favor dashes</option>
        <option value="no-dash">Avoid dashes</option>
      </select>
    </div>

    <!-- Max Bridge Letters -->
    <div class="preference-item range-item">
      <span class="preference-label">Max bridge letters per gap</span>
      <div class="range-control">
        <input
          type="range"
          min="1"
          max="5"
          value={preferences.maxBridgeLetters}
          oninput={handleMaxBridgeChange}
        />
        <span class="range-value">{preferences.maxBridgeLetters}</span>
      </div>
    </div>
  </div>
</div>

<style>
  .preferences-panel {
    display: flex;
    flex-direction: column;
    gap: var(--settings-spacing-sm, 8px);
  }

  .section-title {
    margin: 0;
    font-size: var(--font-size-min, 14px);
    font-weight: 600;
    color: var(--theme-text, #ffffff);
  }

  .preferences-grid {
    display: flex;
    flex-direction: column;
    gap: var(--settings-spacing-sm, 8px);
  }

  .preference-item {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--settings-spacing-sm, 8px);
    padding: var(--settings-spacing-sm, 8px);
    background: var(--theme-panel-bg, rgba(18, 18, 28, 0.98));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: var(--settings-radius-sm, 8px);
    cursor: pointer;
    transition: border-color 0.2s ease;
  }

  .preference-item:hover {
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.15));
  }

  .preference-item input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: var(--theme-accent, #6366f1);
    cursor: pointer;
  }

  .preference-label {
    font-size: var(--font-size-min, 14px);
    color: var(--theme-text, #ffffff);
    flex: 1;
    min-width: 150px;
  }

  .preference-hint {
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
    width: 100%;
    padding-left: 26px; /* Align with label after checkbox */
  }

  .select-item,
  .range-item {
    cursor: default;
    flex-direction: column;
    align-items: flex-start;
  }

  .preference-select {
    width: 100%;
    padding: var(--settings-spacing-sm, 8px);
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: var(--settings-radius-sm, 8px);
    color: var(--theme-text, #ffffff);
    font-size: var(--font-size-min, 14px);
    cursor: pointer;
    margin-top: var(--settings-spacing-xs, 4px);
  }

  .preference-select:focus {
    outline: none;
    border-color: var(--theme-accent, #6366f1);
  }

  .range-control {
    display: flex;
    align-items: center;
    gap: var(--settings-spacing-sm, 8px);
    width: 100%;
    margin-top: var(--settings-spacing-xs, 4px);
  }

  .range-control input[type="range"] {
    flex: 1;
    height: 4px;
    accent-color: var(--theme-accent, #6366f1);
    cursor: pointer;
  }

  .range-value {
    min-width: 24px;
    text-align: center;
    font-size: var(--font-size-min, 14px);
    font-weight: 600;
    color: var(--theme-accent, #6366f1);
  }
</style>

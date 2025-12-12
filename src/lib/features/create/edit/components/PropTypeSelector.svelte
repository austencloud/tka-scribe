<!--
PropTypeSelector.svelte - Per-motion prop type selector

Allows changing the prop type for each individual motion (red and blue).
This enables mixed prop types in a single pictograph (e.g., red hand + blue staff).
-->
<script lang="ts">
  import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
  import { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";

  // Props
  const { currentBeatData, onPropTypeChanged } = $props<{
    currentBeatData: BeatData | null;
    onPropTypeChanged: (color: string, propType: PropType) => void;
  }>();

  // Available prop types
  const propTypes = [
    { value: PropType.HAND, label: "Hand" },
    { value: PropType.STAFF, label: "Staff" },
    { value: PropType.SIMPLESTAFF, label: "Simple Staff" },
    { value: PropType.CLUB, label: "Club" },
    { value: PropType.FAN, label: "Fan" },
    { value: PropType.TRIAD, label: "Triad" },
    { value: PropType.MINIHOOP, label: "Mini Hoop" },
    { value: PropType.BUUGENG, label: "Buugeng" },
    { value: PropType.TRIQUETRA, label: "Triquetra" },
    { value: PropType.TRIQUETRA2, label: "Triquetra 2" },
    { value: PropType.SWORD, label: "Sword" },
    { value: PropType.CHICKEN, label: "Chicken" },
    { value: PropType.GUITAR, label: "Guitar" },
    { value: PropType.DOUBLESTAR, label: "Double Star" },
    { value: PropType.EIGHTRINGS, label: "Eight Rings" },
    { value: PropType.QUIAD, label: "Quiad" },
  ];

  // Get current prop types
  const bluePropType = $derived(
    currentBeatData?.motions.blue?.propType || PropType.STAFF
  );
  const redPropType = $derived(
    currentBeatData?.motions.red?.propType || PropType.STAFF
  );

  // Handlers
  function handleBluePropTypeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const propType = select.value as PropType;
    onPropTypeChanged("blue", propType);
  }

  function handleRedPropTypeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const propType = select.value as PropType;
    onPropTypeChanged("red", propType);
  }
</script>

{#if currentBeatData && !currentBeatData.isBlank}
  <div class="prop-type-selector">
    <div class="section-header">
      <h3>Prop Types</h3>
      <p class="help-text">Set different prop types for each hand</p>
    </div>

    <div class="prop-selectors">
      <!-- Blue prop selector -->
      <div class="prop-selector blue-selector">
        <label for="blue-prop-select">
          <span class="color-indicator blue"></span>
          Blue Prop
        </label>
        <select
          id="blue-prop-select"
          value={bluePropType}
          onchange={handleBluePropTypeChange}
        >
          {#each propTypes as propType}
            <option value={propType.value}>{propType.label}</option>
          {/each}
        </select>
      </div>

      <!-- Red prop selector -->
      <div class="prop-selector red-selector">
        <label for="red-prop-select">
          <span class="color-indicator red"></span>
          Red Prop
        </label>
        <select
          id="red-prop-select"
          value={redPropType}
          onchange={handleRedPropTypeChange}
        >
          {#each propTypes as propType}
            <option value={propType.value}>{propType.label}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>
{/if}

<style>
  .prop-type-selector {
    width: 100%;
    padding: var(--spacing-md, 16px);
    background: var(--surface-secondary, rgba(255, 255, 255, 0.05));
    border-radius: var(--radius-md, 8px);
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  }

  .section-header {
    margin-bottom: var(--spacing-md, 16px);
  }

  .section-header h3 {
    margin: 0 0 var(--spacing-xs, 4px) 0;
    font-size: var(--font-size-md, 14px);
    font-weight: 600;
    color: var(--text-primary, #fff);
  }

  .help-text {
    margin: 0;
    font-size: var(--font-size-sm, 12px);
    color: var(--text-secondary, rgba(255, 255, 255, 0.6));
  }

  .prop-selectors {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md, 12px);
  }

  .prop-selector {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs, 6px);
  }

  .prop-selector label {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs, 6px);
    font-size: var(--font-size-sm, 13px);
    font-weight: 500;
    color: var(--text-primary, #fff);
  }

  .color-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid var(--border-color, rgba(255, 255, 255, 0.2));
  }

  .color-indicator.blue {
    background-color: var(--prop-blue, #2e3192);
  }

  .color-indicator.red {
    background-color: var(--prop-red, #ed1c24);
  }

  select {
    width: 100%;
    padding: var(--spacing-sm, 8px) var(--spacing-md, 12px);
    background: var(--surface-tertiary, rgba(0, 0, 0, 0.3));
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
    border-radius: var(--radius-sm, 6px);
    color: var(--text-primary, #fff);
    font-size: var(--font-size-sm, 13px);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  select:hover {
    border-color: var(--border-hover, rgba(255, 255, 255, 0.3));
    background: var(--surface-tertiary-hover, rgba(0, 0, 0, 0.4));
  }

  select:focus {
    outline: none;
    border-color: var(--theme-accent, #6366f1);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--theme-accent) 10%, transparent);
  }

  option {
    background: var(--surface-primary, #1a1a1a);
    color: var(--text-primary, #fff);
  }
</style>

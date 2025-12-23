<script lang="ts">
  /**
   * Whole Mode Builder Panel
   *
   * Component selection grid for adding whole-sequence designations.
   * Designations are displayed in the unified DesignationsPanel above.
   */
  import type { ComponentId } from "../../domain/constants/cap-components";
  import type {
    TransformationIntervals,
    TransformationInterval,
  } from "../../domain/models/label-models";
  import { BASE_COMPONENTS } from "../../domain/constants/cap-components";
  import FontAwesomeIcon from "$lib/shared/foundation/ui/FontAwesomeIcon.svelte";

  interface Props {
    selectedComponents: Set<ComponentId>;
    transformationIntervals: TransformationIntervals;
    onToggleComponent: (component: ComponentId) => void;
    onSetInterval: (
      key: keyof TransformationIntervals,
      value: TransformationInterval
    ) => void;
    onAddDesignation: () => void;
  }

  let {
    selectedComponents,
    transformationIntervals,
    onToggleComponent,
    onSetInterval,
    onAddDesignation,
  }: Props = $props();

  // Components that support intervals
  const intervalComponents: {
    id: ComponentId;
    key: keyof TransformationIntervals;
    color: string;
  }[] = [
    { id: "rotated", key: "rotation", color: "#36c3ff" },
    { id: "swapped", key: "swap", color: "#26e600" },
    { id: "mirrored", key: "mirror", color: "#6F2DA8" },
    { id: "flipped", key: "flip", color: "#14b8a6" },
    { id: "inverted", key: "invert", color: "#eb7d00" },
  ];

  // Get interval config for a component
  function getIntervalConfig(id: ComponentId) {
    return intervalComponents.find((c) => c.id === id);
  }

  // Check if component has interval selected
  function hasInterval(id: ComponentId): boolean {
    const config = getIntervalConfig(id);
    if (!config) return false;
    return !!transformationIntervals[config.key];
  }

  // Get interval display for component
  function getIntervalDisplay(id: ComponentId): string {
    const config = getIntervalConfig(id);
    if (!config) return "";
    const val = transformationIntervals[config.key];
    if (val === "halved") return "½";
    if (val === "quartered") return "¼";
    return "";
  }

  // Can add designation?
  const canAdd = $derived(selectedComponents.size > 0);
</script>

<div class="whole-mode-builder">
  <div class="builder-hint">
    Select components that describe the whole sequence pattern
  </div>

  <!-- Component Grid with Integrated Intervals -->
  <div class="component-grid">
    {#each BASE_COMPONENTS as component}
      {@const intervalConfig = getIntervalConfig(component.id)}
      {@const isSelected = selectedComponents.has(component.id)}
      <div class="component-cell" class:selected={isSelected}>
        <button
          class="component-btn"
          class:selected={isSelected}
          style="--component-color: {component.color}"
          onclick={() => onToggleComponent(component.id)}
        >
          <FontAwesomeIcon
            icon={component.icon}
            size="1.2em"
            color={component.color}
          />
          <span class="component-name">{component.label}</span>
          {#if isSelected && hasInterval(component.id)}
            <span class="interval-badge"
              >{getIntervalDisplay(component.id)}</span
            >
          {/if}
        </button>

        <!-- Interval chips (shown when component is selected and supports intervals) -->
        {#if isSelected && intervalConfig}
          <div class="interval-row">
            <button
              class="interval-chip"
              class:active={transformationIntervals[intervalConfig.key] ===
                "halved"}
              style="--chip-color: {intervalConfig.color}"
              onclick={() => onSetInterval(intervalConfig.key, "halved")}
              >½</button
            >
            <button
              class="interval-chip"
              class:active={transformationIntervals[intervalConfig.key] ===
                "quartered"}
              style="--chip-color: {intervalConfig.color}"
              onclick={() => onSetInterval(intervalConfig.key, "quartered")}
              >¼</button
            >
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Add button -->
  <button class="add-btn" disabled={!canAdd} onclick={onAddDesignation}>
    <FontAwesomeIcon icon="plus" size="0.9em" />
    Add to designations
  </button>
</div>

<style>
  .whole-mode-builder {
    display: flex;
    flex-direction: column;
    gap: var(--space-md, 12px);
    padding: var(--space-md, 12px);
    background: var(--surface-inset, rgba(0, 0, 0, 0.2));
    border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
    border-radius: var(--radius-lg, 12px);
  }

  .builder-hint {
    font-size: var(--text-xs, 11px);
    color: var(--text-muted, rgba(255, 255, 255, 0.5));
    text-align: center;
  }

  /* Component Grid */
  .component-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-sm, 8px);
  }

  .component-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .component-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: var(--space-sm, 8px);
    background: var(--surface-overlay, rgba(255, 255, 255, 0.05));
    border: 2px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
    border-radius: var(--radius-md, 8px);
    color: var(--text-secondary, rgba(255, 255, 255, 0.7));
    cursor: pointer;
    transition: all 0.15s ease;
    position: relative;
  }

  .component-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: color-mix(in srgb, var(--component-color) 40%, transparent);
  }

  .component-btn.selected {
    background: color-mix(in srgb, var(--component-color) 20%, transparent);
    border-color: var(--component-color);
    color: var(--text-primary, #fff);
  }

  .component-name {
    font-size: var(--text-xs, 11px);
    font-weight: 600;
  }

  .interval-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--component-color);
    border-radius: 50%;
    font-size: 10px;
    font-weight: 700;
    color: #000;
  }

  /* Interval Row */
  .interval-row {
    display: flex;
    gap: 4px;
    justify-content: center;
  }

  .interval-chip {
    flex: 1;
    padding: 4px;
    background: var(--surface-overlay, rgba(255, 255, 255, 0.08));
    border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.15));
    border-radius: var(--radius-sm, 6px);
    color: var(--text-secondary, rgba(255, 255, 255, 0.7));
    font-size: var(--text-sm, 12px);
    font-weight: 700;
    cursor: pointer;
    transition: all 0.1s ease;
  }

  .interval-chip:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  .interval-chip.active {
    background: color-mix(in srgb, var(--chip-color) 30%, transparent);
    border-color: var(--chip-color);
    color: var(--text-primary, #fff);
  }

  /* Add Button */
  .add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm, 8px);
    padding: var(--space-sm, 8px) var(--space-md, 12px);
    background: rgba(99, 102, 241, 0.15);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: var(--radius-md, 8px);
    color: var(--text-primary, #fff);
    font-size: var(--text-sm, 12px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .add-btn:hover:not(:disabled) {
    background: rgba(99, 102, 241, 0.25);
    border-color: rgba(99, 102, 241, 0.5);
  }

  .add-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>

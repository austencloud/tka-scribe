<!--
LOOPComponentButton.svelte - Individual LOOP component selection button
Displays a selectable button for a single LOOP transformation type
Container-aware and aspect-ratio responsive
-->
<script lang="ts">
  import FontAwesomeIcon from "$lib/shared/foundation/ui/FontAwesomeIcon.svelte";
  import type { LOOPComponentInfo } from "$lib/features/create/generate/shared/domain/constants/loop-components";

  let {
    componentInfo,
    isMultiSelectMode = false,
    isSelected = false,
    onClick,
  } = $props<{
    componentInfo: LOOPComponentInfo;
    isMultiSelectMode?: boolean;
    isSelected?: boolean;
    onClick: () => void;
  }>();

  // Reactive destructure - updates when componentInfo changes
  const label = $derived(componentInfo.label);
  const shortLabel = $derived(componentInfo.shortLabel);
  const icon = $derived(componentInfo.icon);
  const color = $derived(componentInfo.color);
</script>

<button
  class="loop-component-button"
  class:selected={isSelected}
  class:multi-select={isMultiSelectMode}
  onclick={onClick}
  style="--component-color: {color};"
  aria-label="{label} - {isSelected ? 'selected' : 'not selected'}"
>
  <div class="loop-component-icon">
    <FontAwesomeIcon {icon} size="1em" />
  </div>
  <div class="loop-component-label">
    <span class="loop-label-full">{label}</span>
    <span class="loop-label-short">{shortLabel}</span>
  </div>

  {#if isMultiSelectMode}
    <!-- Multi-select mode: Show checkbox -->
    <div class="selection-indicator checkbox" class:checked={isSelected}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
      >
        <rect x="3" y="3" width="18" height="18" rx="3"></rect>
        {#if isSelected}
          <polyline points="6,12 10,16 18,8" stroke-width="3"></polyline>
        {/if}
      </svg>
    </div>
  {/if}
</button>

<style>
  .loop-component-button {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;

    /* Vibrant color-tinted glass effect */
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--component-color) 20%, rgba(0, 0, 0, 0.4)) 0%,
      var(--theme-shadow) 100%
    );
    border: 2px solid
      color-mix(in srgb, var(--component-color) 40%, rgba(255, 255, 255, 0.2));
    border-radius: 12px;
    cursor: pointer;
    text-align: center;
    color: var(--theme-text, white);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;
    height: 100%;
    box-sizing: border-box;

    /* Subtle color glow */
    box-shadow:
      0 4px 12px var(--theme-shadow, var(--theme-shadow)),
      0 0 20px color-mix(in srgb, var(--component-color) 15%, transparent);
  }

  /* Single-select mode: Strong hover (immediate action) */
  .loop-component-button:not(.multi-select):hover {
    background: linear-gradient(
      135deg,
      color-mix(
          in srgb,
          var(--component-color) 35%,
          color-mix(in srgb, var(--theme-text) 20%, transparent)
        )
        0%,
      color-mix(
          in srgb,
          var(--component-color) 20%,
          var(--theme-shadow, var(--theme-shadow))
        )
        100%
    );
    border-color: var(--component-color);
    box-shadow:
      0 0 24px color-mix(in srgb, var(--component-color) 50%, transparent),
      0 6px 16px var(--theme-shadow),
      0 0 40px color-mix(in srgb, var(--component-color) 30%, transparent);
    transform: translateY(-3px) scale(1.05);
  }

  /* Single-select mode: Active state (clicking feedback) */
  .loop-component-button:not(.multi-select):active {
    transform: translateY(0) scale(0.98);
    box-shadow:
      0 0 16px color-mix(in srgb, var(--component-color) 40%, transparent),
      0 2px 8px var(--theme-shadow, var(--theme-shadow));
  }

  /* Multi-select mode: Subtle hover (state building) */
  .loop-component-button.multi-select:hover {
    background: linear-gradient(
      135deg,
      color-mix(
          in srgb,
          var(--component-color) 25%,
          var(--theme-shadow)
        )
        0%,
      var(--theme-shadow) 100%
    );
    border-color: color-mix(
      in srgb,
      var(--component-color) 60%,
      var(--theme-stroke-strong)
    );
    box-shadow:
      0 4px 12px var(--theme-shadow, var(--theme-shadow)),
      0 0 24px color-mix(in srgb, var(--component-color) 25%, transparent);
    transform: translateY(-2px) scale(1.02);
  }

  .loop-component-button.selected {
    background: linear-gradient(
      135deg,
      color-mix(
          in srgb,
          var(--component-color) 40%,
          color-mix(in srgb, var(--theme-text) 15%, transparent)
        )
        0%,
      color-mix(
          in srgb,
          var(--component-color) 25%,
          var(--theme-shadow, var(--theme-shadow))
        )
        100%
    );
    border-color: var(--component-color);
    border-width: 3px;
    box-shadow:
      0 4px 16px var(--theme-shadow),
      0 0 30px color-mix(in srgb, var(--component-color) 40%, transparent),
      inset 0 0 20px color-mix(in srgb, var(--component-color) 10%, transparent);
  }

  .loop-component-button.selected:hover {
    background: linear-gradient(
      135deg,
      color-mix(
          in srgb,
          var(--component-color) 50%,
          color-mix(in srgb, var(--theme-text) 20%, transparent)
        )
        0%,
      color-mix(
          in srgb,
          var(--component-color) 30%,
          var(--theme-shadow, var(--theme-shadow))
        )
        100%
    );
    box-shadow:
      0 6px 20px var(--theme-shadow),
      0 0 40px color-mix(in srgb, var(--component-color) 60%, transparent),
      inset 0 0 25px color-mix(in srgb, var(--component-color) 15%, transparent);
  }

  .loop-component-icon {
    font-size: var(--font-size-3xl);
    line-height: 1;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loop-component-label {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--theme-text, white);
    line-height: 1.3;
    width: 100%;
    text-align: center;
    white-space: nowrap;
    overflow: visible;
    text-overflow: ellipsis;
    flex-shrink: 0;
  }

  /* Show full label by default, hide short label */
  .loop-label-short {
    display: none;
  }

  .loop-label-full {
    display: inline;
  }

  /* Switch to short label when container is narrow */
  @container (max-width: 120px) {
    .loop-label-short {
      display: inline;
    }

    .loop-label-full {
      display: none;
    }
  }

  .selection-indicator {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    color: var(--theme-text, white);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s ease;
    pointer-events: none;
  }

  .selection-indicator svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 2px 4px var(--theme-shadow));
  }

  /* Checkbox style (multi-select mode only) */
  .selection-indicator.checkbox svg rect {
    fill: color-mix(in srgb, var(--theme-text) 15%, transparent);
  }

  .selection-indicator.checkbox.checked svg rect {
    fill: var(--theme-text, white);
  }

  .selection-indicator.checkbox.checked svg polyline {
    stroke: var(--theme-panel-bg);
  }
</style>

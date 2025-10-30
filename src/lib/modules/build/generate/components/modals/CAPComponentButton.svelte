<!--
CAPComponentButton.svelte - Individual CAP component selection button
Displays a selectable button for a single CAP transformation type
Container-aware and aspect-ratio responsive
-->
<script lang="ts">
  import { FontAwesomeIcon } from "$shared";
  import type { CAPComponentInfo } from "$build/generate/shared/domain/constants/cap-components";

  let {
    componentInfo,
    isSelected = false,
    onClick
  } = $props<{
    componentInfo: CAPComponentInfo;
    isSelected?: boolean;
    onClick: () => void;
  }>();

  const { component, label, shortLabel, icon, color } = componentInfo;
</script>

<button
  class="cap-component-button"
  class:selected={isSelected}
  onclick={onClick}
  style="--component-color: {color};"
  aria-label="{label} - {isSelected ? 'selected' : 'not selected'}"
>
  <div class="cap-component-icon">
    <FontAwesomeIcon {icon} size="1em" />
  </div>
  <div class="cap-component-label">
    <span class="cap-label-full">{label}</span>
    <span class="cap-label-short">{shortLabel}</span>
  </div>

  {#if isSelected}
    <div class="selected-indicator">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <polyline points="20,6 9,17 4,12"></polyline>
      </svg>
    </div>
  {/if}
</button>

<style>
  .cap-component-button {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 10px;
    cursor: pointer;
    text-align: center;
    color: white;
    transition: all 0.2s ease;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }

  .cap-component-button:hover {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
  }

  .cap-component-button.selected {
    background: color-mix(in srgb, var(--component-color) 25%, rgba(0, 0, 0, 0.3));
    border-color: var(--component-color);
    border-width: 2px;
  }

  .cap-component-button.selected:hover {
    background: color-mix(in srgb, var(--component-color) 35%, rgba(0, 0, 0, 0.3));
  }

  .cap-component-icon {
    font-size: 40px;
    line-height: 1;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cap-component-label {
    font-size: 15px;
    font-weight: 600;
    color: white;
    line-height: 1.3;
    width: 100%;
    text-align: center;
    white-space: nowrap;
    overflow: visible;
    text-overflow: ellipsis;
    flex-shrink: 0;
  }

  /* Show full label by default, hide short label */
  .cap-label-short {
    display: none;
  }

  .cap-label-full {
    display: inline;
  }

  /* Switch to short label when container is narrow */
  @container (max-width: 120px) {
    .cap-label-short {
      display: inline;
    }

    .cap-label-full {
      display: none;
    }
  }

  .selected-indicator {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    color: white;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .selected-indicator svg {
    width: 60%;
    height: 60%;
  }
</style>

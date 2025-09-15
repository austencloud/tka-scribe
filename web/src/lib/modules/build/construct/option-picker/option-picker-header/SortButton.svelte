<script lang="ts">
  import type { SortOption } from "./sort-types";

  // Props using Svelte 5 runes
  const props = $props<{
    selectedViewOption: SortOption;
    isOpen: boolean;
    onClick: () => void;
    compact?: boolean;
    onButtonRef?: (element: HTMLButtonElement) => void;
  }>();

  // Local state
  let isCompact = $state(false);
  let buttonRef = $state<HTMLButtonElement | null>(null);

  // Update compact mode based on props
  $effect(() => {
    isCompact = props.compact || false;
  });

  // Use the buttonRef to call the callback prop
  $effect(() => {
    if (buttonRef && props.onButtonRef) {
      props.onButtonRef(buttonRef);
    }
  });
</script>

<button
  class="sort-button"
  class:compact={isCompact}
  bind:this={buttonRef}
  onclick={props.onClick}
  aria-label="Change view mode"
  aria-expanded={props.isOpen}
  aria-haspopup="listbox"
  title={props.selectedViewOption.description}
>
  <span class="view-icon" aria-hidden="true"
    >{props.selectedViewOption.icon}</span
  >
  {#if !isCompact}
    <span class="view-label">{props.selectedViewOption.label}</span>
    <span class="dropdown-arrow" aria-hidden="true"
      >{props.isOpen ? "▲" : "▼"}</span
    >
  {/if}
</button>

<style>
  /* Base variables for sizing, mirroring other Sequence Widget buttons */
  :root {
    --sort-button-base-size: 45px;
    --sort-button-icon-size: 19px;
    /* Define a specific icon color for the view button, defaulting to a vibrant blue */
    --tkc-icon-color-view: var(--tkc-icon-color-fullscreen, #4cc9f0);
  }

  .sort-button {
    /* Base sizing variables - identical to other sequence buttons */
    --base-size: 45px;
    --base-icon-size: 19px;
    --base-margin: 10px;

    /* Sizing and Shape */
    width: calc(var(--button-size-factor, 1) * var(--base-size));
    height: calc(var(--button-size-factor, 1) * var(--base-size));
    min-width: 38px;
    min-height: 38px;
    border-radius: 50%;
    padding: 0;

    /* Display and Alignment */
    display: flex;
    align-items: center;
    justify-content: center;

    /* Appearance */
    background-color: var(--tkc-button-panel-background, #2a2a2e);
    color: var(
      --tkc-icon-color-view,
      var(--tkc-icon-color-fullscreen, #4cc9f0)
    );
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .sort-button:hover {
    background-color: var(--tkc-button-panel-background-hover, #3a3a3e);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  }

  .sort-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .sort-button:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px var(--tkc-focus-ring-color, rgba(108, 156, 233, 0.6)),
      0 3px 6px rgba(0, 0, 0, 0.16),
      0 3px 6px rgba(0, 0, 0, 0.23);
  }

  .view-icon {
    font-size: calc(var(--button-size-factor, 1) * var(--base-icon-size));
    line-height: 1; /* Ensure consistent icon alignment */
  }

  /* Hide label and dropdown arrow to make it an icon-only button */
  .view-label,
  .dropdown-arrow {
    display: none;
  }

  /* Compact mode adjustments */
  .sort-button.compact {
    width: 36px;
    height: 36px;
    min-width: 36px;
    min-height: 36px;
  }

  .sort-button.compact .view-icon {
    font-size: 16px;
  }
</style>

<script lang="ts">
  import { quintOut } from "svelte/easing";
  import { fade } from "svelte/transition";
  import type { SortOption } from "./sort-types";

  const props = $props<{
    isOpen: boolean;
    selectedSortOption: SortOption;
    sortOptions: readonly SortOption[];
    onSelect: (option: SortOption) => void;
    onKeydown: (event: KeyboardEvent) => void;
  }>();
</script>

{#if props.isOpen}
  <div
    class="dropdown"
    transition:fade={{ duration: 200, easing: quintOut }}
    role="listbox"
    aria-label="Sort options"
    onkeydown={props.onKeydown}
    tabindex="-1"
  >
    {#each props.viewOptions as option (option.value)}
      <button
        class="dropdown-item"
        class:selected={props.selectedViewOption.value === option.value}
        onclick={() => props.onSelect(option)}
        role="option"
        aria-selected={props.selectedViewOption.value === option.value}
        title={option.description}
      >
        <span class="option-icon" aria-hidden="true">{option.icon}</span>
        <span class="option-text">{option.label}</span>
        {#if option.description}
          <span class="option-description">{option.description}</span>
        {/if}
      </button>
    {/each}
  </div>
{/if}

<style>
  .dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0; /* Changed from left: 0; */
    background-color: rgba(
      15,
      23,
      42,
      0.95
    ); /* Very dark blue with transparency */
    border-radius: 12px;
    border: 1px solid rgba(71, 85, 105, 0.6);
    box-shadow:
      0 10px 25px -5px rgba(0, 0, 0, 0.25),
      0 8px 10px -6px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(255, 255, 255, 0.1);
    min-width: 220px;
    width: max-content;
    z-index: 9999;
    overflow: visible;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transform-origin: top right; /* Changed from top left */
    transition: box-shadow 0.2s ease;
  }

  /* Remove outline when dropdown is focused */
  .dropdown:focus {
    outline: none;
  }

  /* Add subtle glow when dropdown is focused */
  .dropdown:focus-visible {
    box-shadow:
      0 10px 25px -5px rgba(0, 0, 0, 0.25),
      0 8px 10px -6px rgba(0, 0, 0, 0.15),
      0 0 0 3px rgba(59, 130, 246, 0.3);
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    text-align: left;
    padding: 12px 16px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1rem;
    color: #e2e8f0; /* Light gray text */
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  /* Highlight effect for selected item */
  .dropdown-item.selected {
    background: linear-gradient(
      to right,
      rgba(59, 130, 246, 0.2),
      rgba(59, 130, 246, 0.1)
    );
    font-weight: 600;
    color: #93c5fd; /* Light blue text */
  }

  /* Hover effect */
  .dropdown-item:hover {
    background: linear-gradient(
      to right,
      rgba(59, 130, 246, 0.15),
      rgba(59, 130, 246, 0.05)
    );
    color: #ffffff;
  }

  /* Focus effect */
  .dropdown-item:focus {
    outline: none;
    background: linear-gradient(
      to right,
      rgba(59, 130, 246, 0.2),
      rgba(59, 130, 246, 0.1)
    );
  }

  /* Only apply background color when not hovering */
  .dropdown-item:focus-visible:not(:hover) {
    background-color: rgba(59, 130, 246, 0.15);
  }

  /* Subtle divider between items */
  .dropdown-item:not(:last-child)::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 16px;
    right: 16px;
    height: 1px;
    background: linear-gradient(
      to right,
      transparent,
      rgba(148, 163, 184, 0.2),
      transparent
    );
  }

  .option-icon {
    font-size: 1.4rem;
    width: 1.5em;
    height: 1.5em;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    line-height: 1;
    color: #94a3b8; /* Muted blue-gray */
    background: rgba(51, 65, 85, 0.4);
    border-radius: 8px;
    padding: 6px;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .dropdown-item:hover .option-icon,
  .dropdown-item.selected .option-icon {
    color: #ffffff;
    background: rgba(59, 130, 246, 0.3);
  }

  .option-text {
    font-weight: 500;
    flex-grow: 1;
  }

  .option-description {
    font-size: 0.85rem;
    color: #94a3b8;
    font-style: italic;
    margin-left: auto;
    white-space: nowrap;
  }

  .dropdown-item:hover .option-description,
  .dropdown-item.selected .option-description {
    color: #cbd5e1;
  }
</style>

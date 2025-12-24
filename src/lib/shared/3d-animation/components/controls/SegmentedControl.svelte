<script lang="ts" generics="T extends string">
  /**
   * SegmentedControl - iOS-style segmented button group
   * Uses --theme-* and --prop-* CSS variables for consistent theming.
   */

  interface Option {
    value: T;
    label: string;
    icon?: string; // FontAwesome class
  }

  interface Props {
    /** Available options */
    options: Option[];
    /** Currently selected value */
    value: T;
    /** Callback when selection changes */
    onchange: (value: T) => void;
    /** Prop color for accent */
    color?: "blue" | "red";
    /** Size variant */
    size?: "sm" | "md";
  }

  let {
    options,
    value,
    onchange,
    color = "blue",
    size = "md",
  }: Props = $props();

  function handleSelect(val: T) {
    onchange(val);
  }

  // Find selected index for indicator position
  const selectedIndex = $derived(options.findIndex(o => o.value === value));
</script>

<div
  class="segmented-control"
  class:sm={size === "sm"}
  class:blue={color === "blue"}
  class:red={color === "red"}
  style="--count: {options.length}"
>
  <div class="indicator" style="--index: {selectedIndex}"></div>

  {#each options as option}
    <button
      type="button"
      class="segment"
      class:selected={value === option.value}
      onclick={() => handleSelect(option.value)}
    >
      {#if option.icon}
        <i class={option.icon}></i>
      {:else}
        {option.label}
      {/if}
    </button>
  {/each}
</div>

<style>
  .segmented-control {
    display: flex;
    position: relative;
    background: var(--theme-card-bg, rgba(0, 0, 0, 0.45));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 8px;
    padding: 3px;
    gap: 2px;
    width: 100%;
  }

  .indicator {
    position: absolute;
    top: 3px;
    bottom: 3px;
    left: calc(3px + (100% - 6px) / var(--count) * var(--index));
    width: calc((100% - 6px) / var(--count) - 2px);
    border-radius: 6px;
    transition: left 0.2s ease;
    z-index: 0;
  }

  .blue .indicator {
    background: var(--prop-blue, #2e3192);
  }

  .red .indicator {
    background: var(--prop-red, #ed1c24);
  }

  .segment {
    flex: 1;
    min-height: 44px;
    min-width: 0;
    padding: 0.5rem 0.5rem;
    background: none;
    border: none;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
    font-size: var(--font-size-sm, 0.875rem);
    font-weight: 500;
    cursor: pointer;
    transition: color 0.15s;
    position: relative;
    z-index: 1;
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .sm .segment {
    min-height: 44px;
    padding: 0.4rem 0.35rem;
    font-size: var(--font-size-compact, 0.75rem);
  }

  .segment:hover {
    color: var(--theme-text, rgba(255, 255, 255, 0.92));
  }

  .segment.selected {
    color: white;
  }

  .segment i {
    font-size: var(--font-size-sm, 0.875rem);
  }

  .sm .segment i {
    font-size: var(--font-size-compact, 0.75rem);
  }
</style>

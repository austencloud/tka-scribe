<script lang="ts">
  /**
   * PresetButtonGroup - Row of preset buttons
   * Uses --theme-* and --prop-* CSS variables for consistent theming.
   */

  interface Props {
    /** Preset names to display */
    presets: string[];
    /** Prop color for hover accent */
    color?: "blue" | "red";
    /** Handler when preset is selected */
    onSelect: (preset: string) => void;
  }

  let { presets, color = "blue", onSelect }: Props = $props();
</script>

<div class="preset-group" class:blue={color === "blue"} class:red={color === "red"}>
  {#each presets as preset}
    <button
      type="button"
      class="preset-btn"
      onclick={() => onSelect(preset)}
    >
      {preset}
    </button>
  {/each}
</div>

<style>
  .preset-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  .preset-btn {
    flex: 1 1 auto;
    min-height: 40px;
    min-width: 0;
    padding: 0.35rem 0.5rem;
    background: var(--theme-card-bg, rgba(0, 0, 0, 0.45));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
    font-size: var(--font-size-compact, 0.75rem);
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .preset-btn:hover {
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.14));
    color: var(--theme-text, rgba(255, 255, 255, 0.92));
  }

  .blue .preset-btn:hover {
    background: var(--prop-blue, #2e3192);
    border-color: var(--prop-blue, #2e3192);
    color: white;
  }

  .red .preset-btn:hover {
    background: var(--prop-red, #ed1c24);
    border-color: var(--prop-red, #ed1c24);
    color: white;
  }
</style>

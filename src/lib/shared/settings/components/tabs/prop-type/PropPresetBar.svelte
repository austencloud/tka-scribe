<!--
  PropPresetBar.svelte - Fixed preset slots for quick prop switching

  Shows 3 fixed preset slots. Empty slots can be filled by saving current config.
  Filled slots can be selected to apply that preset.
  To update a preset: select it, then change props below.
-->
<script lang="ts">
  import type { PropPreset } from "../../../domain/AppSettings";
  import PropPresetSlot from "./PropPresetSlot.svelte";

  const SLOT_COUNT = 3;

  let {
    presets = [],
    selectedIndex = -1,
    onSelectPreset,
    onSaveToSlot,
  } = $props<{
    presets: PropPreset[];
    selectedIndex: number;
    onSelectPreset?: (index: number) => void;
    onSaveToSlot?: (index: number) => void;
  }>();

  // Create array of slots (filled or empty)
  const slots = $derived(
    Array.from({ length: SLOT_COUNT }, (_, i) => presets[i] ?? null)
  );
</script>

<div class="preset-bar">
  <div class="presets-container">
    {#each slots as preset, i}
      <PropPresetSlot
        {preset}
        index={i}
        selected={i === selectedIndex}
        onSelect={() => onSelectPreset?.(i)}
        onSave={() => onSaveToSlot?.(i)}
      />
    {/each}
  </div>

  <p class="preset-hint">
    <i class="fas fa-info-circle"></i>
    Tap empty slot to save. Select a preset, then change props to update it.
  </p>
</div>

<style>
  .preset-bar {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .presets-container {
    display: grid;
    grid-template-columns: repeat(3, minmax(72px, clamp(72px, 18cqi, 120px)));
    gap: 12px;
    align-items: stretch;
    justify-content: center;
  }

  .preset-hint {
    margin: 0;
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .preset-hint i {
    font-size: 12px;
    opacity: 0.6;
  }
</style>

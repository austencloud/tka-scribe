<!--
  PropPresetSlot.svelte - A single preset slot (empty or filled)

  Empty: Shows slot number with + icon, tap to save current config
  Filled: Shows prop icon(s), tap to select/apply preset
-->
<script lang="ts">
  import type { PropPreset } from "../../../domain/AppSettings";
  import { getPropTypeDisplayInfo } from "./PropTypeRegistry";

  let {
    preset,
    index,
    selected = false,
    onSelect,
    onSave,
  } = $props<{
    preset: PropPreset | null;
    index: number;
    selected?: boolean;
    onSelect?: () => void;
    onSave?: () => void;
  }>();

  const isEmpty = $derived(!preset);
  const blueInfo = $derived(
    preset ? getPropTypeDisplayInfo(preset.bluePropType) : null
  );
  const redInfo = $derived(
    preset ? getPropTypeDisplayInfo(preset.redPropType) : null
  );
  const isCatDog = $derived(
    preset && preset.catDogMode && preset.bluePropType !== preset.redPropType
  );

  function handleClick() {
    if (isEmpty) {
      onSave?.();
    } else {
      onSelect?.();
    }
  }
</script>

<button
  class="preset-slot"
  class:empty={isEmpty}
  class:selected
  onclick={handleClick}
  aria-label={isEmpty
    ? `Save to slot ${index + 1}`
    : isCatDog
      ? `Preset ${index + 1}: ${blueInfo?.label} and ${redInfo?.label}`
      : `Preset ${index + 1}: ${blueInfo?.label}`}
  aria-pressed={!isEmpty && selected}
  title={isEmpty
    ? "Save current props"
    : isCatDog
      ? `${blueInfo?.label} / ${redInfo?.label}`
      : blueInfo?.label}
>
  <span class="slot-number">{index + 1}</span>

  {#if isEmpty}
    <i class="fas fa-plus empty-icon" aria-hidden="true"></i>
  {:else if isCatDog && blueInfo && redInfo}
    <div class="dual-props">
      <img src={blueInfo.image} alt={blueInfo.label} class="prop-icon" />
      <img src={redInfo.image} alt={redInfo.label} class="prop-icon red" />
    </div>
  {:else if blueInfo}
    <img src={blueInfo.image} alt={blueInfo.label} class="prop-icon single" />
  {/if}
</button>

<style>
  .preset-slot {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-width: 0;
    aspect-ratio: var(--preset-slot-aspect, 1 / 1);
    min-height: var(--min-touch-target, 48px);
    padding: 4px;
    background: var(--theme-card-bg);
    border: 2px solid var(--theme-stroke, var(--theme-stroke));
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .preset-slot:hover {
    background: var(--theme-card-hover-bg);
    border-color: var(--theme-stroke-strong);
  }

  .preset-slot:active {
    transform: scale(0.96);
  }

  /* Empty slot styling */
  .preset-slot.empty {
    border-style: dashed;
    background: transparent;
  }

  .preset-slot.empty:hover {
    background: color-mix(in srgb, var(--theme-accent) 8%, transparent);
    border-color: var(--theme-accent);
  }

  .empty-icon {
    font-size: clamp(16px, 25%, 24px);
    color: var(--theme-text-dim);
    transition: color 0.15s ease;
  }

  .preset-slot.empty:hover .empty-icon {
    color: var(--theme-accent);
  }

  /* Selected state */
  .preset-slot.selected {
    background: color-mix(in srgb, var(--theme-accent) 15%, transparent);
    border-color: var(--theme-accent);
    border-style: solid;
  }

  /* Slot number badge */
  .slot-number {
    position: absolute;
    top: 3px;
    left: 3px;
    min-width: 14px;
    height: 14px;
    padding: 0 3px;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.4);
    font-size: var(--font-size-compact);
    font-weight: 600;
    color: var(--theme-text-dim);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preset-slot.selected .slot-number {
    background: var(--theme-accent);
    color: white;
  }

  /* Prop icons */
  .prop-icon {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
    pointer-events: none;
  }

  .prop-icon.single {
    width: 65%;
    height: 65%;
    object-fit: contain;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  }

  .dual-props {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    width: 70%;
    height: 70%;
  }

  .dual-props .prop-icon {
    width: 48%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  }

  .dual-props .prop-icon.red {
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3)) hue-rotate(125deg)
      saturate(1.2);
  }

  /* Focus state */
  .preset-slot:focus-visible {
    outline: 2px solid var(--theme-accent);
    outline-offset: 2px;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .preset-slot {
      transition: none;
    }

    .preset-slot:active {
      transform: none;
    }
  }
</style>

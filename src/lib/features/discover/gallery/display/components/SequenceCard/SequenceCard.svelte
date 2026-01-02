<!--
SequenceCard.svelte

Ultra-minimal card component for the Explore grid.
Clicking the card opens the sequence detail viewer.

Uses PropAwareThumbnail for cloud-cached rendering:
- First user to view a prop type renders it locally
- Rendered image is uploaded to Firebase Storage
- All subsequent users get instant loading from cloud
-->
<script lang="ts">
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import type { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";
  import PropAwareThumbnail from "../PropAwareThumbnail.svelte";

  const {
    sequence,
    onPrimaryAction = () => {},
    selected = false,
    bluePropType = undefined,
    redPropType = undefined,
    catDogModeEnabled = false,
    lightMode = false,
    coverUrl: _coverUrl = undefined, // Legacy prop - kept for backwards compatibility
  }: {
    sequence: SequenceData;
    onPrimaryAction?: (sequence: SequenceData) => void;
    selected?: boolean;
    bluePropType?: PropType;
    redPropType?: PropType;
    catDogModeEnabled?: boolean;
    lightMode?: boolean;
    coverUrl?: string;
  } = $props();

  function handlePrimaryAction() {
    onPrimaryAction(sequence);
  }
</script>

<button class="sequence-card" class:selected onclick={handlePrimaryAction}>
  <PropAwareThumbnail
    {sequence}
    {bluePropType}
    {redPropType}
    {catDogModeEnabled}
    {lightMode}
  />
</button>

<style>
  .sequence-card {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke);
    color: var(--theme-text);
    display: block;
    box-shadow: 0 12px 40px var(--theme-shadow);
    width: 100%; /* Fill grid cell width */
    padding: 0; /* Remove default button padding */
    margin: 0; /* Remove default button margin */

    /* Enable container queries */
    container-type: inline-size;
    container-name: sequence-card;

    /* Make card clickable */
    cursor: pointer;
    /* Target only specific properties for smoother, faster animations */
    transition:
      transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1),
      border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sequence-card:hover {
    /* Subtle scale instead of lift - more modern, less aggressive */
    transform: scale(1.02);
    /* Slightly enhanced shadow - much more subtle */
    box-shadow: 0 14px 50px var(--theme-shadow);
    border-color: var(--theme-stroke-strong);
  }

  /* Active state - brief feedback on touch/mobile only */
  @media (hover: none) and (pointer: coarse) {
    .sequence-card:active {
      transform: scale(0.98);
      transition-duration: 0.1s;
    }
  }

  .sequence-card:focus-visible {
    outline: 2px solid var(--theme-accent);
    outline-offset: 2px;
  }

  .sequence-card.selected {
    border-color: color-mix(
      in srgb,
      var(--semantic-info) 80%,
      transparent
    );
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--semantic-info) 40%, transparent);
  }
</style>

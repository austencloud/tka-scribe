<!--
AssemblyOptionButton.svelte - Individual assembly option selection button

Displays a pictograph option without container styling
-->
<script lang="ts">
  import type { MotionColor, PictographData } from "$shared";
  import { Pictograph } from "$shared";

  const {
    option,
    visibleHand,
    isDisabled = false,
    ariaLabel,
    onSelect,
  } = $props<{
    option: PictographData;
    visibleHand: MotionColor;
    isDisabled?: boolean;
    ariaLabel?: string;
    onSelect: (option: PictographData) => void;
  }>();
</script>

<button
  class="option-button"
  onclick={() => onSelect(option)}
  disabled={isDisabled}
  aria-label={ariaLabel}
>
  <Pictograph
    pictographData={option}
    {visibleHand}
    disableContentTransitions={false}
  />
</button>

<style>
  .option-button {
    /* Fill the entire grid cell */
    width: 100%;
    height: 100%;

    min-width: 0;
    min-height: 0;

    /* Clean transparent button */
    background: transparent;
    border: none;
    padding: 0;

    cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    /* Ensure pictograph scales to fit available space */
    container-type: size;
  }

  /* Hover effects */
  @media (hover: hover) {
    .option-button:not(:disabled):hover {
      transform: scale(1.05);
    }
  }

  .option-button:not(:disabled):active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }

  .option-button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
</style>

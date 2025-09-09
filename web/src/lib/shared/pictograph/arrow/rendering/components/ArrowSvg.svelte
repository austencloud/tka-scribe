<!--
Simple Arrow Component - Just renders an arrow with provided data
-->
<script lang="ts">
  import type { MotionData } from "$shared";
  import type { ArrowAssets, ArrowPosition } from "$shared/pictograph/arrow";

  interface Props {
    motionData: MotionData;
    arrowAssets: ArrowAssets;
    arrowPosition: ArrowPosition;
    shouldMirror?: boolean;
    showArrow?: boolean;
  }

  let {
    motionData,
    arrowAssets,
    arrowPosition,
    shouldMirror = false,
    showArrow = true,
  }: Props = $props();
</script>

{#if showArrow}
  <g
    transform="
      translate({arrowPosition.x}, {arrowPosition.y})
      rotate({arrowPosition.rotation})
      scale({shouldMirror ? -1 : 1}, 1)
      translate({-arrowAssets.center.x}, {-arrowAssets.center.y})
    "
    class="arrow-svg {motionData.color}-arrow-svg"
    class:mirrored={shouldMirror}
  >
    {@html arrowAssets.imageSrc}
  </g>
{/if}

<style>
  .arrow-svg {
    pointer-events: none;
  }
</style>

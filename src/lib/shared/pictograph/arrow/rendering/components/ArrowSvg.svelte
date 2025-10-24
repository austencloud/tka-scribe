<!--
Simple Arrow Component - Just renders an arrow with provided data
-->
<script lang="ts">
  import type { MotionData } from "$shared";
  import type { ArrowAssets, ArrowPosition } from "$shared/pictograph/arrow";

  let {
    motionData,
    arrowAssets,
    arrowPosition,
    shouldMirror = false,
    showArrow = true,
  } = $props<{
    motionData: MotionData;
    arrowAssets: ArrowAssets;
    arrowPosition: ArrowPosition;
    shouldMirror?: boolean;
    showArrow?: boolean;
  }>();
</script>

{#if showArrow}
  <g
    transform="
      translate({arrowPosition.x}, {arrowPosition.y})
      rotate({arrowPosition.rotation})
      {shouldMirror ? 'scale(-1, 1)' : ''}
    "
    class="arrow-svg {motionData.color}-arrow-svg"
    class:mirrored={shouldMirror}
  >
    <!-- Position group at calculated coordinates, let SVG handle its own centering -->
    <g transform="translate({-arrowAssets.center.x}, {-arrowAssets.center.y})">
      {@html arrowAssets.imageSrc}
    </g>
  </g>
{/if}

<style>
  .arrow-svg {
    pointer-events: none;
  }
</style>

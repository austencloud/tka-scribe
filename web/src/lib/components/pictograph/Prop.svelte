<script lang="ts">
  import type { MotionData, PropData } from "$lib/domain";
  import { GridMode } from "$lib/domain/enums";
  import type { IPropCoordinatorService } from "$lib/services/implementations/rendering/PropCoordinatorService";
  import { IPropCoordinatorServiceInterface } from "$lib/services/di/interfaces/core-interfaces";
  import { resolve } from "$lib/services/bootstrap";
  interface Props {
    propData: PropData;
    motionData?: MotionData;
    gridMode?: GridMode;
    betaOffset?: { x: number; y: number };
    color: string;
  }

  interface RenderData {
    position: { x: number; y: number };
    rotation: number;
    svgData: {
      svgContent: string;
      viewBox: { width: number; height: number };
      center: { x: number; y: number };
    } | null;
    loaded: boolean;
  }

  let {
    propData,
    motionData,
    gridMode = GridMode.DIAMOND,
    betaOffset = { x: 0, y: 0 },
    color,
  }: Props = $props();

  const propCoordinator: IPropCoordinatorService = resolve(
    IPropCoordinatorServiceInterface
  );

  let renderData = $state<RenderData>({
    position: { x: 475, y: 475 },
    rotation: 0,
    svgData: null,
    loaded: false,
  });

  $effect(() => {
    if (!propData) return;

    propCoordinator
      .calculatePropRenderData(propData, motionData, gridMode, betaOffset)
      .then((data) => {
        renderData = data;
      });
  });
</script>

<g
  class="prop-group {color}-prop"
  data-prop-color={color}
  data-prop-type={propData?.propType}
  data-location={motionData?.endLocation}
>
  {#if renderData.svgData}
    <!-- Native SVG with simplified transform chain -->
    <g
      transform="
        translate({renderData.position.x}, {renderData.position.y})
        rotate({renderData.rotation})
        translate({-renderData.svgData.center.x}, {-renderData.svgData.center
        .y})
      "
      class="prop-svg"
    >
      {@html renderData.svgData.svgContent}
    </g>
  {/if}
</g>

<style>
  .prop-group {
    transition: all 0.2s ease;
    transform-origin: center;
    z-index: 1;
  }

  .prop-svg {
    pointer-events: none;
  }
</style>

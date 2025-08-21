<!--
Arrow Component - Renders SVG arrows with proper positioning and natural sizing
Follows the same pattern as Prop component for consistent sizing behavior
REFACTORED: Now purely presentational, uses ArrowRenderingService for business logic
-->
<script lang="ts">
  import { MotionColor, type ArrowData, type MotionData } from "$lib/domain";
  import { onMount } from "svelte";
  import type { IArrowRenderingService } from "$lib/services/interfaces/pictograph-interfaces";
  import { resolve } from "$lib/services/bootstrap";

  interface Props {
    arrowData: ArrowData;
    motionData?: MotionData; // MotionData from pictograph
    preCalculatedPosition?:
      | { x: number; y: number; rotation: number }
      | undefined; // Pre-calculated position from parent
    preCalculatedMirroring?: boolean | undefined; // Pre-calculated mirroring from parent
    showArrow?: boolean; // Whether to show the arrow (coordination flag)
    onLoaded?: (componentType: string) => void;
    onError?: (componentType: string, error: string) => void;
  }

  let {
    arrowData,
    motionData,
    preCalculatedPosition,
    preCalculatedMirroring,
    showArrow = true,
    onLoaded,
    onError,
  }: Props = $props();

  // Get arrow rendering service from DI container
  const arrowRenderingService = resolve(
    "IArrowRenderingService"
  ) as IArrowRenderingService;

  let loaded = $state(false);
  let error = $state<string | null>(null);
  let svgData = $state<{
    imageSrc: string;
    viewBox: { width: number; height: number };
    center: { x: number; y: number };
  } | null>(null);

  // SINGLE SOURCE OF TRUTH: Use ONLY pre-calculated positions from ArrowPositioningOrchestrator
  const position = $derived(() => {
    if (!arrowData) return { x: 475.0, y: 475.0, rotation: 0 };

    // ONLY use preCalculatedPosition - no more redundant calculations!
    if (preCalculatedPosition) {
      return preCalculatedPosition;
    }

    // Fallback: use position data from arrowData if available (for legacy compatibility)
    if (arrowData.positionX !== 0 || arrowData.positionY !== 0) {
      return {
        x: arrowData.positionX,
        y: arrowData.positionY,
        rotation: arrowData.rotationAngle || 0,
      };
    }

    return { x: 475.0, y: 475.0, rotation: 0 };
  });

  // SINGLE SOURCE OF TRUTH: Use only the position from the derived function
  const calculatedPosition = $derived(() => position());
  const shouldMirror = $derived(() => preCalculatedMirroring ?? false);

  // Load SVG data using ArrowRenderingService (business logic now in service)
  const loadSvg = async () => {
    try {
      if (!arrowData) throw new Error("No arrow data available");
      if (!motionData) throw new Error("No motion data available");

      // Use ArrowRenderingService for all business logic
      const svgDataResult = await arrowRenderingService.loadArrowSvgData(
        arrowData,
        motionData
      );

      svgData = svgDataResult;
      loaded = true;
      onLoaded?.(`${motionData?.color}-arrow`);
    } catch (e) {
      error = `Failed to load arrow SVG: ${e}`;
      onError?.(`${motionData?.color}-arrow`, error);
      // Still mark as loaded to prevent blocking
      loaded = true;
    }
  };

  onMount(() => {
    loadSvg();
  });

  // Reload SVG when arrow path changes - REMOVED $effect TO PREVENT INFINITE LOOP
  // SVG will be loaded once on mount, no reactive reloading to avoid loops
</script>

<!-- Arrow Group -->
<g
  class="arrow-group {motionData?.color}-arrow"
  class:loaded
  data-arrow-color={motionData?.color}
  data-motion-type={motionData?.motionType}
  data-location={arrowData?.arrowLocation}
>
  {#if error}
    <!-- Error state -->
    <circle r="10" fill="red" opacity="0.5" />
    <text x="0" y="4" text-anchor="middle" font-size="8" fill="white">!</text>
  {:else if !motionData}
    <!-- No motion data available -->
    <text
      x="0"
      y="4"
      text-anchor="middle"
      font-size="10"
      fill="gray"
      opacity="0.5"
    >
      No motion data
    </text>
  {:else if !loaded || !svgData}
    <!-- Loading state -->
    <circle
      r="8"
      fill={motionData?.color === MotionColor.BLUE ? "#2E3192" : "#ED1C24"}
      opacity="0.3"
    />
    <animate
      attributeName="opacity"
      values="0.3;0.8;0.3"
      dur="1s"
      repeatCount="indefinite"
    />
  {:else if showArrow}
    <!-- Actual arrow SVG with natural sizing and centering (same as props) -->
    <!-- Native SVG with simplified transform chain -->
    <g
      transform="
        translate({calculatedPosition().x}, {calculatedPosition().y})
        rotate({calculatedPosition().rotation || arrowData?.rotationAngle || 0})
        scale({shouldMirror() ? -1 : 1}, 1)
        translate({-svgData.center.x}, {-svgData.center.y})
      "
      class="arrow-svg {motionData?.color}-arrow-svg"
      class:mirrored={shouldMirror}
      style:opacity={showArrow ? 1 : 0}
    >
      <!-- ✅ FIXED: Use raw SVG content directly instead of trying to load it as an image -->
      {@html svgData.imageSrc}
    </g>
  {:else}
    <!-- Hidden but loaded arrow (positioning ready but waiting for coordination) -->
    <g opacity="0" aria-hidden="true">
      <circle
        r="2"
        fill={motionData?.color === MotionColor.BLUE ? "#2E3192" : "#ED1C24"}
        opacity="0.1"
      />
    </g>

    <!-- Debug info (if needed) -->
    {#if import.meta.env.DEV}
      <circle r="2" fill="red" opacity="0.5" />
      <text x="0" y="-25" text-anchor="middle" font-size="6" fill="black">
        {arrowData?.arrowLocation}
      </text>
    {/if}
  {/if}
</g>

<style>
  .arrow-group {
    transition: all 0.2s ease;
    transform-origin: center;
  }

  .arrow-group.loaded {
    opacity: 1;
  }

  .arrow-svg {
    pointer-events: none;
  }

  /* Ensure proper layering */
  .arrow-group {
    z-index: 2;
  }
</style>

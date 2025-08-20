<!--
Prop Component - Renders SVG props with proper positioning
-->
<script lang="ts">
  import type { MotionData, PropData } from "$lib/domain";
  import {
    Location,
    MotionType,
    Orientation,
    RotationDirection,
    MotionColor,
  } from "$lib/domain/enums";
  import { DefaultPropPositioner } from "$lib/services/DefaultPropPositioner";
  import { PropRotAngleManager } from "$lib/services/PropRotAngleManager";
  import { BetaOffsetCalculator } from "$lib/services/implementations/positioning/BetaOffsetCalculator";
  import { BetaPropDirectionCalculator } from "$lib/services/implementations/positioning/BetaPropDirectionCalculator";
  import { onMount } from "svelte";

  interface Props {
    propData: PropData;
    motionData?: MotionData;
    gridMode?: string;
    allProps?: PropData[];
    endsWithBeta?: boolean; // NEW: Indicates if this pictograph actually ends with beta
    onLoaded?: (componentType: string) => void;
    onError?: (componentType: string, error: string) => void;
  }

  let {
    propData,
    motionData,
    gridMode = "diamond",
    allProps = [],
    endsWithBeta = false, // NEW: Default to false
    onLoaded,
    onError,
  }: Props = $props();

  // Prop element used in bind:this
  let _propElement = $state<SVGGElement | null>(null);
  let loaded = $state(false);
  let error = $state<string | null>(null);
  let svgData = $state<{
    imageSrc: string;
    viewBox: { width: number; height: number };
    center: { x: number; y: number };
  } | null>(null);

  // Calculate position using DefaultPropPositioner for consistency with legacy
  const position = $derived(() => {
    if (!propData) {
      console.log(`🔧 [PROP DEBUG] unknown prop: No propData, using center`);
      return { x: 475, y: 475 };
    }

    // Props use their OWN location, not motion end location
    // This is critical - PropPlacementManager sets prop.location which may differ from motion.endLocation
    const location = propData.location || motionData?.endLocation;
    console.log(
      `🔧 [PROP DEBUG] ${propData.color} prop: location=${location}, gridMode=${gridMode}`
    );

    // Use DefaultPropPositioner for consistent positioning
    const basePosition = DefaultPropPositioner.calculatePosition(
      location as string,
      gridMode
    );
    console.log(
      `🔧 [PROP DEBUG] ${propData.color} prop: basePosition=`,
      basePosition
    );

    // Apply beta adjustment if needed (when props are at same location)
    const betaOffset = calculateBetaOffset();
    console.log(
      `🔧 [PROP DEBUG] ${propData.color} prop: betaOffset=`,
      betaOffset
    );

    const finalPosition = {
      x: basePosition.x + betaOffset.x,
      y: basePosition.y + betaOffset.y,
    };
    console.log(
      `🔧 [PROP DEBUG] ${propData.color} prop: finalPosition=`,
      finalPosition
    );

    return finalPosition;
  });

  // Calculate beta adjustment offset for prop separation using legacy direction logic
  function calculateBetaOffset(): { x: number; y: number } {
    // CRITICAL FIX: Only apply beta offset if the pictograph actually ends with beta
    if (!endsWithBeta) {
      return { x: 0, y: 0 };
    }

    if (!propData || !allProps || allProps.length < 2) {
      return { x: 0, y: 0 };
    }

    // Check if there's another prop at the same location
    const otherProp = allProps.find(
      (p) => p.color !== propData.color && p.location === propData.location
    );

    if (!otherProp) {
      return { x: 0, y: 0 };
    }

    console.log(
      `🔧 Applying beta offset for ${propData.color} prop at ${propData.location} (endsWithBeta: ${endsWithBeta})`
    );

    // DEBUG: Log for G pictograph case with both props at West
    if (propData.location === "w" || propData.location === "west") {
      console.log(
        `🔧 [G DEBUG] Beta offset calculation for ${propData.color} prop:`,
        {
          location: propData.location,
          orientation: propData.orientation,
          rotationDirection: propData.rotationDirection,
          motionData: motionData
            ? {
                startLocation: motionData.startLocation,
                endLocation: motionData.endLocation,
                endOrientation: motionData.endOrientation,
                rotationDirection: motionData.rotationDirection,
              }
            : "NO_MOTION_DATA",
          allProps: allProps.map((p) => ({
            color: p.color,
            location: p.location,
            orientation: p.orientation,
          })),
          endsWithBeta,
          expectedDirection:
            "Should be UP/DOWN for West location with IN orientation",
        }
      );
    }

    // Use legacy direction calculator logic for proper beta positioning
    try {
      // Get motion data for both props - use the motionData prop passed to component
      const redProp = allProps.find((p) => p.color === MotionColor.RED);
      const blueProp = allProps.find((p) => p.color === MotionColor.BLUE);

      // For start positions, we need to construct motion data from prop data
      // Since start positions are static, we can use the prop location as both start and end
      const redMotion: MotionData = {
        motionType: MotionType.STATIC,
        rotationDirection: RotationDirection.CLOCKWISE,
        startLocation: (redProp?.location as Location) || Location.SOUTH,
        endLocation: (redProp?.location as Location) || Location.SOUTH,
        turns: 0,
        startOrientation: Orientation.IN,
        endOrientation: Orientation.IN,
        isVisible: true,
      };

      const blueMotion: MotionData = {
        motionType: MotionType.STATIC,
        rotationDirection: RotationDirection.CLOCKWISE,
        startLocation: (blueProp?.location as Location) || Location.SOUTH,
        endLocation: (blueProp?.location as Location) || Location.SOUTH,
        turns: 0,
        startOrientation: Orientation.IN,
        endOrientation: Orientation.IN,
        isVisible: true,
      };

      // Create direction calculator
      const directionCalculator = new BetaPropDirectionCalculator({
        red: redMotion,
        blue: blueMotion,
      });

      // Get direction for this prop
      const direction = directionCalculator.getDirection(propData);

      // DEBUG: Log direction calculation for West props
      if (propData.location === "w" || propData.location === "west") {
        console.log(`🔧 [G DEBUG] Direction calculation result:`, {
          propColor: propData.color,
          calculatedDirection: direction,
          expectedDirection: "UP or DOWN",
          redMotion: {
            startLocation: redMotion.startLocation,
            endLocation: redMotion.endLocation,
            endOrientation: redMotion.endOrientation,
          },
          blueMotion: {
            startLocation: blueMotion.startLocation,
            endLocation: blueMotion.endLocation,
            endOrientation: blueMotion.endOrientation,
          },
        });
      }

      if (!direction) {
        console.log(
          `⚠️ No direction calculated, using fallback for ${propData.color}`
        );
        return propData.color === "blue" ? { x: -25, y: 0 } : { x: 25, y: 0 };
      }

      // Calculate offset using direction
      const offsetCalculator = new BetaOffsetCalculator();
      const basePosition = { x: 0, y: 0 }; // We only want the offset, not absolute position
      const newPosition = offsetCalculator.calculateNewPositionWithOffset(
        basePosition,
        direction
      );

      // DEBUG: Log final offset calculation for West props
      if (propData.location === "w" || propData.location === "west") {
        console.log(`🔧 [G DEBUG] Final offset calculation:`, {
          propColor: propData.color,
          direction,
          calculatedOffset: { x: newPosition.x, y: newPosition.y },
          expectedOffset: direction?.includes("UP")
            ? "negative Y"
            : direction?.includes("DOWN")
              ? "positive Y"
              : "unknown",
        });
      }

      return { x: newPosition.x, y: newPosition.y };
    } catch (error) {
      console.error("Error in beta direction calculation:", error);
      // Fallback to simple left/right separation
      return propData.color === "blue" ? { x: -25, y: 0 } : { x: 25, y: 0 };
    }
  }

  // Calculate rotation using PropRotAngleManager for consistency with legacy
  const rotation = $derived(() => {
    if (!propData) return 0;

    const location = propData.location || motionData?.endLocation;
    // Use prop's own orientation instead of motion's end orientation
    const propOrientation = propData.orientation || "in";

    // Convert string orientation to enum
    let orientation: Orientation;
    switch (propOrientation) {
      case "in":
        orientation = Orientation.IN;
        break;
      case "out":
        orientation = Orientation.OUT;
        break;
      case "clock":
        orientation = Orientation.CLOCK;
        break;
      case "counter":
        orientation = Orientation.COUNTER;
        break;
      default:
        orientation = Orientation.IN;
    }

    const calculatedRotation = PropRotAngleManager.calculateRotation(
      location as string,
      orientation
    );

    // Debug logging for prop orientation and rotation
    console.log(
      `🔧 [PROP ROTATION] ${propData.color} prop: location=${location}, orientation=${propOrientation}, rotation=${calculatedRotation}°`
    );

    return calculatedRotation;
  });

  // Parse SVG to get proper dimensions and center point
  const parsePropSvg = (
    svgText: string
  ): {
    viewBox: { width: number; height: number };
    center: { x: number; y: number };
  } => {
    const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
    const svg = doc.documentElement;

    // Get viewBox dimensions
    const viewBoxValues = svg.getAttribute("viewBox")?.split(/\s+/) || [
      "0",
      "0",
      "252.8",
      "77.8",
    ];
    const viewBox = {
      width: parseFloat(viewBoxValues[2] || "252.8") || 252.8,
      height: parseFloat(viewBoxValues[3] || "77.8") || 77.8,
    };

    // Get center point from SVG
    let center = { x: viewBox.width / 2, y: viewBox.height / 2 };

    try {
      const centerElement = doc.getElementById("centerPoint");
      if (centerElement) {
        center = {
          x: parseFloat(centerElement.getAttribute("cx") || "0") || center.x,
          y: parseFloat(centerElement.getAttribute("cy") || "0") || center.y,
        };
      }
    } catch {
      // SVG center calculation failed, using default center
    }

    return { viewBox, center };
  };

  // Apply color transformation to SVG content
  const applyColorToSvg = (svgText: string, color: MotionColor): string => {
    // Avoid CSS parser conflicts by using a different approach
    const colorMap = new Map([
      [MotionColor.BLUE, "#2E3192"],
      [MotionColor.RED, "#ED1C24"],
    ]);

    const targetColor = colorMap.get(color) || "#2E3192";

    // Use regex replacement to change fill colors directly
    let coloredSvg = svgText.replace(
      /fill="#[0-9A-Fa-f]{6}"/g,
      `fill="${targetColor}"`
    );
    coloredSvg = coloredSvg.replace(
      /fill:\s*#[0-9A-Fa-f]{6}/g,
      `fill:${targetColor}`
    );

    // Remove the centerPoint circle entirely to prevent CIRCLE_PROP detection
    coloredSvg = coloredSvg.replace(
      /<circle[^>]*id="centerPoint"[^>]*\/?>/,
      ""
    );

    return coloredSvg;
  };

  // Load SVG data
  const loadSvg = async () => {
    try {
      if (!propData) throw new Error("No prop data available");

      const response = await fetch(`/images/props/${propData.propType}.svg`);
      if (!response.ok) throw new Error("Failed to fetch SVG");

      const originalSvgText = await response.text();
      const { viewBox, center } = parsePropSvg(originalSvgText);

      // Apply color transformation to the SVG
      const coloredSvgText = applyColorToSvg(originalSvgText, propData.color);

      svgData = {
        imageSrc: `data:image/svg+xml;base64,${btoa(coloredSvgText)}`,
        viewBox,
        center,
      };

      loaded = true;
      onLoaded?.(`${propData?.color}-prop`);
    } catch (e) {
      error = `Failed to load prop SVG: ${e}`;
      onError?.(`${propData?.color}-prop`, error);
      // Still mark as loaded to prevent blocking
      loaded = true;
    }
  };

  onMount(() => {
    loadSvg();
  });
</script>

<!-- Prop Group -->
<g
  bind:this={_propElement}
  class="prop-group {propData?.color}-prop"
  class:loaded
  data-prop-color={propData?.color}
  data-prop-type={propData?.propType}
  data-location={propData?.location}
>
  {#if error}
    <!-- Error state -->
    <rect
      x="-15"
      y="-15"
      width="30"
      height="30"
      fill="red"
      opacity="0.5"
      rx="3"
    />
    <text x="0" y="4" text-anchor="middle" font-size="8" fill="white">!</text>
  {:else if !loaded || !svgData}
    <!-- Loading state -->
    <rect
      x="-12"
      y="-12"
      width="24"
      height="24"
      fill={propData?.color === "blue" ? "#2E3192" : "#ED1C24"}
      opacity="0.3"
      rx="2"
    />
    <animate
      attributeName="opacity"
      values="0.3;0.8;0.3"
      dur="1s"
      repeatCount="indefinite"
    />
  {:else}
    <!-- Actual prop SVG with proper sizing and centering -->
    <image
      href={svgData.imageSrc}
      transform="
				translate({position().x}, {position().y})
				rotate({rotation()})
				translate({-svgData.center.x}, {-svgData.center.y})
			"
      width={svgData.viewBox.width}
      height={svgData.viewBox.height}
      preserveAspectRatio="xMidYMid meet"
      class="prop-svg"
      onerror={() => {
        error = "Failed to load prop SVG";
        onError?.(`${propData?.color}-prop`, error);
      }}
    />

    <!-- Debug info disabled to prevent CIRCLE_PROP duplicates -->
    <!-- Debug circles were creating duplicate CIRCLE_PROP elements in comparison tests -->
    <!-- {#if import.meta.env.DEV}
			<circle r="2" fill="green" opacity="0.5" cx={position().x} cy={position().y} />
			<text x={position().x} y={position().y - 30} text-anchor="middle" font-size="6" fill="black">
				{propData?.location}
			</text>
		{/if} -->
  {/if}
</g>

<style>
  .prop-group {
    transition: all 0.2s ease;
    transform-origin: center;
  }

  .prop-group.loaded {
    opacity: 1;
  }

  .prop-svg {
    pointer-events: none;
  }

  /* Ensure proper layering */
  .prop-group {
    z-index: 1;
  }
</style>

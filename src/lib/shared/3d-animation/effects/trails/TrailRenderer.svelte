<script lang="ts">
  /**
   * TrailRenderer Component
   *
   * Renders a thick line trail following prop movement using Line2.
   * Supports solid colors and rainbow mode (HSL cycling).
   * Uses three/addons Line2 for variable width with vertex colors.
   */

  import { T, useTask } from "@threlte/core";
  import { Vector3, Color } from "three";
  import { Line2 } from "three/addons/lines/Line2.js";
  import { LineMaterial } from "three/addons/lines/LineMaterial.js";
  import { LineGeometry } from "three/addons/lines/LineGeometry.js";

  interface Props {
    /** Trail points from newest to oldest */
    positions: Vector3[];
    /** Hex color or 'rainbow' for HSL cycling */
    color: string;
    /** Trail thickness in pixels (default: 4) */
    width?: number;
    /** Base opacity (default: 0.8) */
    opacity?: number;
    /** Fade opacity toward tail (default: true) */
    fadeOut?: boolean;
    /** Minimum points to render trail (default: 2) */
    minPoints?: number;
  }

  let {
    positions,
    color,
    width = 4,
    opacity = 0.8,
    fadeOut = true,
    minPoints = 2,
  }: Props = $props();

  // Line2 objects - we create once and update
  let lineGeometry: LineGeometry | null = $state(null);
  let lineMaterial: LineMaterial | null = $state(null);
  let line2: Line2 | null = $state(null);

  // Whether we have enough points to render
  const hasEnoughPoints = $derived(positions.length >= minPoints);

  // Whether it's rainbow mode
  const isRainbow = $derived(color === "rainbow");

  // Convert hex color to Color object for solid mode
  const solidColor = $derived.by(() => {
    if (isRainbow) return new Color(0xffffff);
    try {
      return new Color(color);
    } catch {
      return new Color(0xffffff);
    }
  });

  /**
   * Generate rainbow color for a point based on its position in the trail
   * @param index - Point index (0 = head, max = tail)
   * @param total - Total number of points
   */
  function getRainbowColor(index: number, total: number): Color {
    // Map index to hue (0-1)
    const hue = total > 1 ? index / (total - 1) : 0;
    // Use HSL with high saturation and moderate lightness
    const color = new Color();
    color.setHSL(hue, 0.8, 0.6);
    return color;
  }

  /**
   * Build position array for LineGeometry
   * Format: [x0, y0, z0, x1, y1, z1, ...]
   */
  function buildPositionArray(points: Vector3[]): Float32Array {
    const arr = new Float32Array(points.length * 3);
    for (let i = 0; i < points.length; i++) {
      const p = points[i]!;
      arr[i * 3] = p.x;
      arr[i * 3 + 1] = p.y;
      arr[i * 3 + 2] = p.z;
    }
    return arr;
  }

  /**
   * Build color array for LineGeometry (vertex colors)
   * Format: [r0, g0, b0, r1, g1, b1, ...]
   * For fade effect, we blend with alpha in the color
   */
  function buildColorArray(points: Vector3[]): Float32Array {
    const arr = new Float32Array(points.length * 3);
    const total = points.length;

    for (let i = 0; i < total; i++) {
      let c: Color;

      if (isRainbow) {
        c = getRainbowColor(i, total);
      } else {
        c = solidColor.clone();
      }

      // Apply fadeOut by darkening the color (since Line2 doesn't support per-vertex alpha)
      if (fadeOut && total > 1) {
        const fadeRatio = 1 - i / (total - 1);
        c.multiplyScalar(fadeRatio);
      }

      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }

    return arr;
  }

  // Initialize Line2 objects
  $effect(() => {
    if (!lineGeometry) {
      lineGeometry = new LineGeometry();
    }
    if (!lineMaterial) {
      lineMaterial = new LineMaterial({
        linewidth: width,
        vertexColors: true,
        transparent: true,
        opacity: opacity,
        alphaToCoverage: false,
        dashed: false,
      });
      // LineMaterial requires resolution for correct width calculation
      lineMaterial.resolution.set(window.innerWidth, window.innerHeight);
    }
    if (!line2 && lineGeometry && lineMaterial) {
      line2 = new Line2(lineGeometry, lineMaterial);
      line2.computeLineDistances();
    }
  });

  // Update material properties when they change
  $effect(() => {
    if (lineMaterial) {
      lineMaterial.linewidth = width;
      lineMaterial.opacity = opacity;
      lineMaterial.resolution.set(window.innerWidth, window.innerHeight);
    }
  });

  // Update geometry when positions change
  $effect(() => {
    if (!lineGeometry || !hasEnoughPoints) return;

    const positionArray = buildPositionArray(positions);
    const colorArray = buildColorArray(positions);

    lineGeometry.setPositions(positionArray);
    lineGeometry.setColors(colorArray);

    // Recompute line distances for proper rendering
    if (line2) {
      line2.computeLineDistances();
    }
  });

  // Update resolution on window resize
  useTask(() => {
    if (lineMaterial) {
      lineMaterial.resolution.set(window.innerWidth, window.innerHeight);
    }
  });

  // Cleanup on unmount
  $effect(() => {
    return () => {
      lineGeometry?.dispose();
      lineMaterial?.dispose();
      lineGeometry = null;
      lineMaterial = null;
      line2 = null;
    };
  });
</script>

{#if hasEnoughPoints && line2}
  <T is={line2} />
{/if}

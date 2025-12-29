<script lang="ts">
  /**
   * GroundPlane Primitive
   *
   * A configurable ground surface for 3D environments.
   * Renders as a circular plane at the specified position.
   */

  import { T } from "@threlte/core";

  interface Props {
    /** Ground color (hex string) */
    color?: string;
    /** Opacity (0-1) */
    opacity?: number;
    /** Radius of the plane */
    size?: number;
    /** Geometry segments for smoothness */
    segments?: number;
    /** Position in scene [x, y, z] */
    position?: [number, number, number];
  }

  let {
    color = "#2d5a27",
    opacity = 0.9,
    size = 500,
    segments = 64,
    position = [0, -200, 0],
  }: Props = $props();
</script>

<T.Group position={position}>
  <T.Mesh rotation.x={-Math.PI / 2}>
    <T.CircleGeometry args={[size, segments]} />
    <T.MeshStandardMaterial
      {color}
      {opacity}
      transparent={opacity < 1}
      side={2}
    />
  </T.Mesh>
</T.Group>

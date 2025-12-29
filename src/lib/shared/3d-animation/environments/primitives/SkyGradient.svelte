<script lang="ts">
  /**
   * SkyGradient Primitive
   *
   * Renders a gradient background as a large inverted sphere.
   * Uses a custom shader for smooth color transitions.
   */

  import { T } from "@threlte/core";
  import { ShaderMaterial, Color, BackSide } from "three";
  import { onMount, onDestroy } from "svelte";

  interface Props {
    /** Top color of gradient */
    topColor?: string;
    /** Bottom color of gradient */
    bottomColor?: string;
    /** Optional middle color for 3-stop gradient */
    midColor?: string;
    /** Radius of sky sphere */
    radius?: number;
  }

  let {
    topColor = "#1e1b4b",
    bottomColor = "#0a0a12",
    midColor,
    radius = 2000,
  }: Props = $props();

  // Shader material for gradient
  let material: ShaderMaterial | null = $state(null);

  // Vertex shader - passes UV to fragment
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  // Fragment shader - creates vertical gradient
  const fragmentShader = `
    uniform vec3 uTopColor;
    uniform vec3 uBottomColor;
    uniform vec3 uMidColor;
    uniform float uHasMidColor;
    varying vec2 vUv;

    void main() {
      float t = vUv.y;

      vec3 color;
      if (uHasMidColor > 0.5) {
        // 3-stop gradient
        if (t < 0.5) {
          color = mix(uBottomColor, uMidColor, t * 2.0);
        } else {
          color = mix(uMidColor, uTopColor, (t - 0.5) * 2.0);
        }
      } else {
        // 2-stop gradient
        color = mix(uBottomColor, uTopColor, t);
      }

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  onMount(() => {
    material = new ShaderMaterial({
      uniforms: {
        uTopColor: { value: new Color(topColor) },
        uBottomColor: { value: new Color(bottomColor) },
        uMidColor: { value: new Color(midColor ?? topColor) },
        uHasMidColor: { value: midColor ? 1.0 : 0.0 },
      },
      vertexShader,
      fragmentShader,
      side: BackSide,
      depthWrite: false,
    });
  });

  onDestroy(() => {
    material?.dispose();
  });

  // Update uniforms when colors change
  $effect(() => {
    if (material?.uniforms) {
      material.uniforms.uTopColor.value.set(topColor);
      material.uniforms.uBottomColor.value.set(bottomColor);
      material.uniforms.uMidColor.value.set(midColor ?? topColor);
      material.uniforms.uHasMidColor.value = midColor ? 1.0 : 0.0;
    }
  });
</script>

{#if material}
  <T.Mesh renderOrder={-1000}>
    <T.SphereGeometry args={[radius, 32, 32]} />
    <T is={material} />
  </T.Mesh>
{/if}

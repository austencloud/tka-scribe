<script lang="ts">
  /**
   * Fog3D Primitive
   *
   * Adds atmospheric fog to the scene.
   * Uses Three.js Fog (linear) for predictable depth cues.
   */

  import { useThrelte } from "@threlte/core";
  import { Fog, Color } from "three";
  import { onMount, onDestroy } from "svelte";

  interface Props {
    /** Fog color (hex string) */
    color?: string;
    /** Distance where fog starts */
    near?: number;
    /** Distance where fog is fully opaque */
    far?: number;
  }

  let {
    color = "#1a1a2e",
    near = 200,
    far = 1500,
  }: Props = $props();

  const { scene } = useThrelte();

  // Store original fog to restore on unmount
  let originalFog = scene.fog;

  onMount(() => {
    scene.fog = new Fog(new Color(color), near, far);
  });

  onDestroy(() => {
    scene.fog = originalFog;
  });

  // Update fog when props change
  $effect(() => {
    if (scene.fog instanceof Fog) {
      scene.fog.color.set(color);
      scene.fog.near = near;
      scene.fog.far = far;
    }
  });
</script>

<!-- Fog is applied to scene, no visible element needed -->

<script lang="ts">
  import { Pictograph } from "$shared/pictograph/shared/components";
  import type { BeatData } from "$shared";
  import { ensureContainerInitialized } from "$shared/inversify";
  import { loadSharedModules } from "$shared/inversify/container";
  import { onMount } from "svelte";

  let modulesLoaded = $state(false);

  onMount(async () => {
    try {
      console.log("🔄 Initializing container and loading modules...");
      // First ensure the container is initialized and cached
      await ensureContainerInitialized();
      // Then load the shared modules (animator, pictograph, etc.)
      await loadSharedModules();
      modulesLoaded = true;
      console.log("✅ Container and modules loaded successfully");
    } catch (error) {
      console.error("❌ Failed to load container/modules:", error);
    }
  });

  const testBeat: BeatData = {
    "id": "ed2b7661-1bd3-4ecb-8bb3-5cb59ec17876",
    "letter": "A",
    "startPosition": "alpha2",
    "endPosition": "alpha4",
    "motions": {
      "blue": {
        "motionType": "pro",
        "rotationDirection": "cw",
        "startLocation": "sw",
        "endLocation": "nw",
        "turns": 0,
        "startOrientation": "in",
        "endOrientation": "in",
        "isVisible": true,
        "propType": "staff",
        "arrowLocation": "n",
        "color": "blue",
        "gridMode": "box",
        "arrowPlacementData": {
          "positionX": 0,
          "positionY": 0,
          "rotationAngle": 0,
          "coordinates": null,
          "svgCenter": null,
          "svgMirrored": false,
          "manualAdjustmentX": 0,
          "manualAdjustmentY": 0
        },
        "propPlacementData": {
          "positionX": 0,
          "positionY": 0,
          "rotationAngle": 0,
          "coordinates": null,
          "svgCenter": null
        },
        "prefloatMotionType": null,
        "prefloatRotationDirection": null
      },
      "red": {
        "motionType": "pro",
        "rotationDirection": "cw",
        "startLocation": "ne",
        "endLocation": "se",
        "turns": 0,
        "startOrientation": "in",
        "endOrientation": "in",
        "isVisible": true,
        "propType": "staff",
        "arrowLocation": "n",
        "color": "red",
        "gridMode": "box",
        "arrowPlacementData": {
          "positionX": 0,
          "positionY": 0,
          "rotationAngle": 0,
          "coordinates": null,
          "svgCenter": null,
          "svgMirrored": false,
          "manualAdjustmentX": 0,
          "manualAdjustmentY": 0
        },
        "propPlacementData": {
          "positionX": 0,
          "positionY": 0,
          "rotationAngle": 0,
          "coordinates": null,
          "svgCenter": null
        },
        "prefloatMotionType": null,
        "prefloatRotationDirection": null
      }
    },
    "beatNumber": 1,
    "duration": 1,
    "blueReversal": false,
    "redReversal": false,
    "isBlank": false
  };
</script>

<div class="test-page">
  <h1>Box Mode Pictograph Test</h1>
  <p>Letter: A (box mode)</p>
  <p>Check console for placement calculations</p>

  {#if modulesLoaded}
    <div class="pictograph-container">
      <Pictograph pictographData={testBeat} />
    </div>
  {:else}
    <p>Loading modules...</p>
  {/if}
</div>

<style>
  .test-page {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .pictograph-container {
    margin-top: 2rem;
    border: 2px solid #333;
    display: inline-block;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    margin: 0.5rem 0;
  }
</style>

<script lang="ts">
  import Pictograph from "$lib/shared/pictograph/shared/components/Pictograph.svelte";
import type { PictographData } from "$shared/pictograph/shared/domain/models/PictographData";
  import { onMount } from "svelte";

  // TODO: Update test pictograph data to match new PictographData structure
  // Real pictograph data from start-alpha1 (simple static position)
  const testPictograph: PictographData | null = null;
  /*
  const testPictograph: PictographData = {
    id: "start-alpha1",
    letter: null,
    motions: {
      blue: {
        motionType: "static",
        startLoc: "n",
        endLoc: "n",
        startOrientation: { redOrientation: "in", blueOrientation: "in" },
        endOrientation: { redOrientation: "in", blueOrientation: "in" },
        propRotation: { redRotation: 0, blueRotation: 0 },
        turns: 0,
        motion: null,
        color: "blue",
        startPosition: "n",
        endPosition: "n",
      },
      red: {
        motionType: "static",
        startLoc: "s",
        endLoc: "s",
        startOrientation: { redOrientation: "in", blueOrientation: "in" },
        endOrientation: { redOrientation: "in", blueOrientation: "in" },
        propRotation: { redRotation: 0, blueRotation: 0 },
        turns: 0,
        motion: null,
        color: "red",
        startPosition: "s",
        endPosition: "s",
      },
    },
  };
  */

  let svgElement: SVGSVGElement | null = null;
  let canvasElement: HTMLCanvasElement | null = null;
  let downloadUrl = "";
  let status = "Ready";
  let svgBounds = { width: 0, height: 0, right: 0, bottom: 0 };

  onMount(() => {
    // Give Pictograph time to render
    setTimeout(() => {
      capturePictograph();
    }, 500);
  });

  function capturePictograph() {
    status = "Capturing...";

    // Find the SVG element rendered by Pictograph component
    const container = document.querySelector(".pictograph-container");
    if (!container) {
      status = "Error: Container not found";
      return;
    }

    svgElement = container.querySelector("svg");
    if (!svgElement) {
      status = "Error: SVG not found";
      return;
    }

    // Get actual content bounds
    const bbox = svgElement.getBBox();
    svgBounds = {
      width: bbox.width,
      height: bbox.height,
      right: bbox.x + bbox.width,
      bottom: bbox.y + bbox.height,
    };

    status = `SVG Found: ${bbox.width}×${bbox.height}`;

    // Convert to canvas
    convertToCanvas();
  }

  function convertToCanvas() {
    if (!svgElement) return;

    status = "Converting to canvas...";

    // Get SVG as string
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);

    // Create image from SVG
    const img = new Image();
    img.onload = () => {
      // Create canvas with same size as SVG viewBox
      const canvas = document.createElement("canvas");
      canvas.width = 950;
      canvas.height = 950;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        status = "Error: Canvas context failed";
        return;
      }

      // Fill white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Update canvas element
      canvasElement = canvas;

      // Create download URL
      canvas.toBlob(
        (blob) => {
          if (blob) {
            downloadUrl = URL.createObjectURL(blob);
            status = "Ready to download!";
          }
        },
        "image/jpeg",
        0.95
      );

      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      status = "Error: Image load failed";
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }

  function downloadImage() {
    if (!downloadUrl) return;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "pictograph-test.jpg";
    link.click();
  }
</script>

<div class="test-page">
  <h1>🔬 Pictograph Rendering Test</h1>
  <p class="status">{status}</p>

  <div class="test-grid">
    <!-- Original SVG from Pictograph component -->
    <div class="test-section">
      <h2>Original SVG (Pictograph Component)</h2>
      <div class="pictograph-container">
        <Pictograph pictographData={testPictograph} />
      </div>
      <div class="info">
        <strong>SVG Bounds:</strong><br />
        Width: {svgBounds.width}px<br />
        Height: {svgBounds.height}px<br />
        Right edge: {svgBounds.right}px<br />
        Bottom edge: {svgBounds.bottom}px
      </div>
    </div>

    <!-- Converted Canvas -->
    <div class="test-section">
      <h2>Converted to Canvas/Image</h2>
      {#if canvasElement}
        <div class="canvas-container">
          <img
            src={canvasElement.toDataURL("image/jpeg", 0.95)}
            alt="Converted pictograph"
            style="width: 950px; height: 950px; border: 2px solid red;"
          />
        </div>
      {:else}
        <div class="placeholder">Converting...</div>
      {/if}
    </div>
  </div>

  <div class="actions">
    <button onclick={() => capturePictograph()}> 🔄 Re-capture </button>
    <button onclick={() => downloadImage()} disabled={!downloadUrl}>
      💾 Download JPEG
    </button>
  </div>

  <div class="instructions">
    <h3>📋 Test Instructions:</h3>
    <ol>
      <li>
        Look at the <strong>Original SVG</strong> on the left - this is what Pictograph.svelte
        renders
      </li>
      <li>
        Look at the <strong>Converted Canvas</strong> on the right - this is what
        gets exported
      </li>
      <li>
        Check if bottom-right is clipped in the converted version (red border
        shows canvas bounds)
      </li>
      <li>
        Check SVG bounds - if right/bottom exceed 950px, content extends beyond
        viewBox
      </li>
      <li>Download and examine the JPEG to see exactly what's being clipped</li>
    </ol>
  </div>
</div>

<style>
  .test-page {
    padding: 2rem;
    max-width: 2000px;
    margin: 0 auto;
    background: #1a1a2e;
    color: #eee;
    min-height: 100vh;
  }

  h1 {
    color: #4ecca3;
    margin-bottom: 1rem;
  }

  .status {
    background: #16213e;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    margin-bottom: 2rem;
    font-family: monospace;
  }

  .test-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .test-section {
    background: #16213e;
    padding: 1.5rem;
    border-radius: 8px;
  }

  .test-section h2 {
    color: #4ecca3;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  .pictograph-container {
    background: white;
    padding: 1rem;
    border-radius: 4px;
    display: inline-block;
  }

  .canvas-container {
    background: white;
    padding: 1rem;
    border-radius: 4px;
    display: inline-block;
  }

  .placeholder {
    width: 950px;
    height: 950px;
    background: #0f3460;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }

  .info {
    margin-top: 1rem;
    padding: 1rem;
    background: #0f3460;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.9rem;
  }

  .actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  button {
    padding: 0.75rem 1.5rem;
    background: #4ecca3;
    color: #1a1a2e;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  button:hover:not(:disabled) {
    background: #5ef3b1;
    transform: translateY(-2px);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .instructions {
    background: #16213e;
    padding: 1.5rem;
    border-radius: 8px;
    border-left: 4px solid #4ecca3;
  }

  .instructions h3 {
    color: #4ecca3;
    margin-bottom: 1rem;
  }

  .instructions ol {
    padding-left: 1.5rem;
  }

  .instructions li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }
</style>

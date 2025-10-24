<!--
Read Tab - PDF flipbook reader interface

Provides access to the adorable PDF flipbook reader:
- Beautiful page-turning animations with StPageFlip
- PDF.js integration for seamless PDF display
- Responsive design for all devices
- Intuitive navigation controls
-->
<script lang="ts">
  import type { FlipBookConfig } from "../domain";
  import FlipBook from "./FlipBook.svelte";

  // Configuration for the flipbook - use PDF aspect ratio
  const flipBookConfig: Partial<FlipBookConfig> = {
    width: 734, // Match PDF page width (734.4)
    height: 950, // Match PDF page height (950.4)
    showCover: false, // Show both pages side by side
    drawShadow: true,
    flippingTime: 800,
    maxShadowOpacity: 0.6,
    mobileScrollSupport: false, // Allow normal page scrolling
  };

  // PDF URL - this will load from the static directory
  const pdfUrl = "/static/Level 1.pdf";
</script>

<div class="read-tab">
  <!-- Main Content - Full Space -->
  <div class="read-content">
    <FlipBook {pdfUrl} config={flipBookConfig} />
  </div>
</div>

<style>
  .read-tab {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
  }

  .read-content {
    flex: 1;
    width: 100%;
    height: 100%;
    padding: 1rem;
    box-sizing: border-box;
  }
</style>

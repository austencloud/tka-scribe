/**
 * Utility for rendering Pictograph component to SVG string
 *
 * This utility mounts a Pictograph.svelte component to a hidden DOM container,
 * waits for it to render, then extracts the SVG string.
 *
 * ARCHITECTURE NOTES:
 * - Uses Svelte 5's mount() API for programmatic component instantiation
 * - Matches desktop approach of grabbing rendered view (QPainter.drawPixmap)
 * - Browser-only utility (requires DOM)
 */

import type { BeatData, PictographData } from "$shared";
import Pictograph from "$shared/pictograph/shared/components/Pictograph.svelte";
import { mount, tick, unmount } from "svelte";
import { resolve as resolveService } from "$shared/inversify/container";
import { TYPES } from "$shared/inversify/types";
import type { IGlyphCacheService } from "../services/implementations/GlyphCacheService";

/**
 * Render a Pictograph component to SVG string
 *
 * @param pictographData - BeatData or PictographData to render
 * @param size - Size of the SVG viewBox (will be size x size)
 * @param beatNumber - Optional beat number to display (for export)
 * @returns Promise<string> - SVG string ready to be converted to canvas
 */
export async function renderPictographToSVG(
  pictographData: BeatData | PictographData,
  size: number = 300,
  beatNumber?: number
): Promise<string> {
  // Create hidden container
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = `${size}px`;
  container.style.height = `${size}px`;
  container.style.opacity = "0";
  container.style.pointerEvents = "none";

  document.body.appendChild(container);

  try {
    // Prepare pictograph data with beat number if provided
    const dataWithBeatNumber =
      beatNumber !== undefined
        ? { ...pictographData, beatNumber }
        : pictographData;

    // Mount Pictograph component
    const component = mount(Pictograph, {
      target: container,
      props: {
        pictographData: dataWithBeatNumber,
        disableContentTransitions: true, // Disable animations for export
      },
    });

    // Wait for component to fully render
    await tick();

    // CRITICAL: Wait for external images (TKAGlyph letter images) to load
    // The TKAGlyph component uses <image> tags with external SVG references
    // We need to wait for these to load before capturing the SVG
    await waitForImagesLoaded(container);

    // Find the SVG element in the rendered component
    const svgElement = container.querySelector("svg");

    if (!svgElement) {
      throw new Error("Failed to find SVG element in rendered Pictograph");
    }

    // CRITICAL FIX: Calculate actual bounding box of SVG content
    // The viewBox is "0 0 950 950" but content may extend beyond these bounds
    const bbox = svgElement.getBBox();

    // Use the larger of the viewBox or actual content bounds
    const viewBoxWidth = Math.max(950, Math.ceil(bbox.x + bbox.width));
    const viewBoxHeight = Math.max(950, Math.ceil(bbox.y + bbox.height));

    // Detect if content extends beyond original viewBox
    const isClipped = bbox.x + bbox.width > 950 || bbox.y + bbox.height > 950;

    if (isClipped) {
      const rightClip = Math.max(0, bbox.x + bbox.width - 950);
      const bottomClip = Math.max(0, bbox.y + bbox.height - 950);
      console.warn("⚠️ Content extends beyond original viewBox:", {
        rightOverflow: rightClip,
        bottomOverflow: bottomClip,
        calculatedViewBox: `0 0 ${viewBoxWidth} ${viewBoxHeight}`,
      });
    }

    // Set explicit size and viewBox to accommodate all content
    svgElement.setAttribute("width", size.toString());
    svgElement.setAttribute("height", size.toString());
    svgElement.setAttribute("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`);

    // Verify TKA glyphs are present in final SVG
    const finalTkaGlyphs = svgElement.querySelectorAll(".tka-glyph");
    const finalImages = svgElement.querySelectorAll("image[href]");

    if (finalTkaGlyphs.length === 0) {
      console.error("❌ NO TKA GLYPHS FOUND IN FINAL SVG!");
    }

    if (finalImages.length === 0) {
      console.error("❌ NO IMAGES FOUND IN FINAL SVG!");
    }

    // Extract SVG string
    const svgString = svgElement.outerHTML;

    // Clean up component
    unmount(component);

    return svgString;
  } finally {
    // Always clean up container
    document.body.removeChild(container);
  }
}

/**
 * Wait for all images in the container to load and TKA glyphs to render
 * This ensures TKA glyph images are fully loaded before capturing SVG
 */
async function waitForImagesLoaded(container: HTMLElement): Promise<void> {
  // First, wait for TKA glyph elements to appear (they render conditionally)
  let attempts = 0;
  const maxAttempts = 50; // 5 seconds max

  while (attempts < maxAttempts) {
    const tkaGlyphs = container.querySelectorAll(".tka-glyph");
    const images = container.querySelectorAll("image[href]");

    if (tkaGlyphs.length > 0 && images.length > 0) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;
  }

  // Now wait for the actual images to load
  const images = container.querySelectorAll("image[href]");

  if (images.length === 0) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return;
  }

  // Get glyph cache service
  const glyphCache = await resolveService<IGlyphCacheService>(TYPES.IGlyphCacheService);

  const imagePromises = Array.from(images).map((img) => {
    return new Promise<void>((resolve) => {
      const imageElement = img as SVGImageElement;
      const href = imageElement.getAttribute("href");

      if (!href) {
        resolve();
        return;
      }

      // Perform async operations inside the executor without making it async
      (async () => {
        try {
          // Try to get from cache first (FAST!)
          let dataUrl = glyphCache.getGlyphDataUrl(href);

          if (dataUrl) {
            // Cache hit! No network request needed
            imageElement.setAttribute("href", dataUrl);
            resolve();
            return;
          }

          // Cache miss - fall back to fetching (slower, but rare)
          console.warn(`⚠️ Glyph cache miss for: ${href}`);
          const response = await fetch(href);

          if (!response.ok) {
            console.error(
              `❌ Failed to fetch image (${response.status}):`,
              href
            );
            resolve();
            return;
          }

          const svgContent = await response.text();

          // Convert SVG content to data URL
          dataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`;

          // Replace the external href with the data URL
          imageElement.setAttribute("href", dataUrl);

          resolve();
        } catch (error) {
          console.error(`❌ Error processing image:`, href, error);
          resolve(); // Still resolve to not block the export
        }
      })();
    });
  });

  await Promise.all(imagePromises);

  // Small delay to ensure rendering is complete (reduced from 200ms since cache is instant)
  await new Promise((resolve) => setTimeout(resolve, 50));
}

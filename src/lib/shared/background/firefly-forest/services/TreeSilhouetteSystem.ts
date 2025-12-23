import type { Dimensions } from "$lib/shared/background/shared/domain/types/background-types";

interface Tree {
  x: number;
  height: number;
  width: number;
  type: "pine" | "fir" | "spruce";
}

/**
 * Creates forest silhouettes rising from the bottom of the screen
 * Trees are dark shapes against the sky - no ground layers needed
 */
export function createTreeSilhouetteSystem() {
  let cachedCanvas: OffscreenCanvas | null = null;
  let cachedDimensions: Dimensions | null = null;

  type RenderContext =
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;

  /**
   * Pine tree - layered branches
   */
  function drawPine(
    ctx: RenderContext,
    x: number,
    baseY: number,
    width: number,
    height: number
  ): void {
    const trunkW = width * 0.12;
    const trunkH = height * 0.15;

    ctx.beginPath();
    ctx.moveTo(x - trunkW / 2, baseY);
    ctx.lineTo(x - trunkW / 2, baseY - trunkH);

    const bodyStart = baseY - trunkH;

    // Layered branches
    ctx.lineTo(x - width * 0.45, bodyStart);
    ctx.lineTo(x - width * 0.08, bodyStart - height * 0.25);
    ctx.lineTo(x - width * 0.38, bodyStart - height * 0.22);
    ctx.lineTo(x - width * 0.06, bodyStart - height * 0.48);
    ctx.lineTo(x - width * 0.28, bodyStart - height * 0.45);
    ctx.lineTo(x - width * 0.04, bodyStart - height * 0.68);
    ctx.lineTo(x - width * 0.18, bodyStart - height * 0.65);
    ctx.lineTo(x, baseY - height);

    // Right side
    ctx.lineTo(x + width * 0.18, bodyStart - height * 0.65);
    ctx.lineTo(x + width * 0.04, bodyStart - height * 0.68);
    ctx.lineTo(x + width * 0.28, bodyStart - height * 0.45);
    ctx.lineTo(x + width * 0.06, bodyStart - height * 0.48);
    ctx.lineTo(x + width * 0.38, bodyStart - height * 0.22);
    ctx.lineTo(x + width * 0.08, bodyStart - height * 0.25);
    ctx.lineTo(x + width * 0.45, bodyStart);

    ctx.lineTo(x + trunkW / 2, baseY - trunkH);
    ctx.lineTo(x + trunkW / 2, baseY);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Fir tree - triangular with texture
   */
  function drawFir(
    ctx: RenderContext,
    x: number,
    baseY: number,
    width: number,
    height: number
  ): void {
    const trunkW = width * 0.1;
    const trunkH = height * 0.12;

    ctx.beginPath();
    ctx.moveTo(x - trunkW / 2, baseY);
    ctx.lineTo(x - trunkW / 2, baseY - trunkH);

    const bodyStart = baseY - trunkH;

    ctx.lineTo(x - width * 0.48, bodyStart);
    ctx.lineTo(x - width * 0.42, bodyStart - height * 0.12);
    ctx.lineTo(x - width * 0.44, bodyStart - height * 0.15);
    ctx.lineTo(x - width * 0.36, bodyStart - height * 0.3);
    ctx.lineTo(x - width * 0.38, bodyStart - height * 0.33);
    ctx.lineTo(x - width * 0.28, bodyStart - height * 0.5);
    ctx.lineTo(x - width * 0.3, bodyStart - height * 0.53);
    ctx.lineTo(x - width * 0.18, bodyStart - height * 0.72);
    ctx.lineTo(x - width * 0.12, bodyStart - height * 0.78);
    ctx.lineTo(x, baseY - height);

    ctx.lineTo(x + width * 0.12, bodyStart - height * 0.78);
    ctx.lineTo(x + width * 0.18, bodyStart - height * 0.72);
    ctx.lineTo(x + width * 0.3, bodyStart - height * 0.53);
    ctx.lineTo(x + width * 0.28, bodyStart - height * 0.5);
    ctx.lineTo(x + width * 0.38, bodyStart - height * 0.33);
    ctx.lineTo(x + width * 0.36, bodyStart - height * 0.3);
    ctx.lineTo(x + width * 0.44, bodyStart - height * 0.15);
    ctx.lineTo(x + width * 0.42, bodyStart - height * 0.12);
    ctx.lineTo(x + width * 0.48, bodyStart);

    ctx.lineTo(x + trunkW / 2, baseY - trunkH);
    ctx.lineTo(x + trunkW / 2, baseY);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Spruce - tall and narrow
   */
  function drawSpruce(
    ctx: RenderContext,
    x: number,
    baseY: number,
    width: number,
    height: number
  ): void {
    const trunkW = width * 0.15;
    const trunkH = height * 0.1;

    ctx.beginPath();
    ctx.moveTo(x - trunkW / 2, baseY);
    ctx.lineTo(x - trunkW / 2, baseY - trunkH);

    const bodyStart = baseY - trunkH;

    ctx.lineTo(x - width * 0.35, bodyStart);
    ctx.lineTo(x - width * 0.25, bodyStart - height * 0.15);
    ctx.lineTo(x - width * 0.3, bodyStart - height * 0.18);
    ctx.lineTo(x - width * 0.2, bodyStart - height * 0.35);
    ctx.lineTo(x - width * 0.24, bodyStart - height * 0.38);
    ctx.lineTo(x - width * 0.15, bodyStart - height * 0.55);
    ctx.lineTo(x - width * 0.18, bodyStart - height * 0.58);
    ctx.lineTo(x - width * 0.1, bodyStart - height * 0.75);
    ctx.lineTo(x - width * 0.08, bodyStart - height * 0.85);
    ctx.lineTo(x, baseY - height);

    ctx.lineTo(x + width * 0.08, bodyStart - height * 0.85);
    ctx.lineTo(x + width * 0.1, bodyStart - height * 0.75);
    ctx.lineTo(x + width * 0.18, bodyStart - height * 0.58);
    ctx.lineTo(x + width * 0.15, bodyStart - height * 0.55);
    ctx.lineTo(x + width * 0.24, bodyStart - height * 0.38);
    ctx.lineTo(x + width * 0.2, bodyStart - height * 0.35);
    ctx.lineTo(x + width * 0.3, bodyStart - height * 0.18);
    ctx.lineTo(x + width * 0.25, bodyStart - height * 0.15);
    ctx.lineTo(x + width * 0.35, bodyStart);

    ctx.lineTo(x + trunkW / 2, baseY - trunkH);
    ctx.lineTo(x + trunkW / 2, baseY);
    ctx.closePath();
    ctx.fill();
  }

  function createTrees(dimensions: Dimensions): Tree[] {
    const trees: Tree[] = [];
    const { width, height } = dimensions;

    // Intentional placement - a few trees at varying sizes
    // These rise from below the screen, so baseY will be at screen bottom + some extra

    // Large foreground trees (fewer, bigger)
    const foregroundPositions = [0.08, 0.25, 0.52, 0.78, 0.95];
    for (const xRatio of foregroundPositions) {
      trees.push({
        x: width * xRatio + (Math.random() - 0.5) * width * 0.05,
        height: height * (0.45 + Math.random() * 0.2),
        width: height * (0.12 + Math.random() * 0.06),
        type: ["pine", "fir", "spruce"][
          Math.floor(Math.random() * 3)
        ] as Tree["type"],
      });
    }

    // Medium background trees (fill gaps)
    const midPositions = [0.15, 0.38, 0.62, 0.85];
    for (const xRatio of midPositions) {
      trees.push({
        x: width * xRatio + (Math.random() - 0.5) * width * 0.08,
        height: height * (0.3 + Math.random() * 0.15),
        width: height * (0.08 + Math.random() * 0.04),
        type: ["pine", "fir", "spruce"][
          Math.floor(Math.random() * 3)
        ] as Tree["type"],
      });
    }

    // Small distant trees (peek between larger ones)
    const farPositions = [0.12, 0.32, 0.48, 0.68, 0.88];
    for (const xRatio of farPositions) {
      trees.push({
        x: width * xRatio + (Math.random() - 0.5) * width * 0.06,
        height: height * (0.18 + Math.random() * 0.1),
        width: height * (0.05 + Math.random() * 0.03),
        type: ["pine", "fir", "spruce"][
          Math.floor(Math.random() * 3)
        ] as Tree["type"],
      });
    }

    // Sort by height (tallest last so they draw on top)
    return trees.sort((a, b) => a.height - b.height);
  }

  function initialize(dimensions: Dimensions): void {
    renderToCache(dimensions);
  }

  function renderToCache(dimensions: Dimensions): void {
    cachedCanvas = new OffscreenCanvas(dimensions.width, dimensions.height);
    cachedDimensions = dimensions;
    const ctx = cachedCanvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    const trees = createTrees(dimensions);
    const baseY = dimensions.height + dimensions.height * 0.05; // Trees extend below screen

    // Draw trees - smallest/shortest first, tallest last
    for (const tree of trees) {
      // Taller trees are darker (closer to viewer)
      // Dark green tones but dark enough to contrast against background
      const heightRatio = tree.height / (dimensions.height * 0.65);
      const r = Math.floor(2 + heightRatio * 4); // 2-6
      const g = Math.floor(6 + heightRatio * 8); // 6-14 (green tint but dark)
      const b = Math.floor(3 + heightRatio * 4); // 3-7
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

      switch (tree.type) {
        case "pine":
          drawPine(ctx, tree.x, baseY, tree.width, tree.height);
          break;
        case "fir":
          drawFir(ctx, tree.x, baseY, tree.width, tree.height);
          break;
        case "spruce":
          drawSpruce(ctx, tree.x, baseY, tree.width, tree.height);
          break;
      }
    }
  }

  function draw(ctx: CanvasRenderingContext2D, dimensions: Dimensions): void {
    if (!cachedCanvas || !cachedDimensions) {
      initialize(dimensions);
    }

    if (cachedCanvas) {
      ctx.drawImage(cachedCanvas as unknown as CanvasImageSource, 0, 0);
    }
  }

  function handleResize(
    _oldDimensions: Dimensions,
    newDimensions: Dimensions
  ): void {
    initialize(newDimensions);
  }

  function cleanup(): void {
    cachedCanvas = null;
    cachedDimensions = null;
  }

  return {
    initialize,
    draw,
    handleResize,
    cleanup,
  };
}

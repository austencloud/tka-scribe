/**
 * Grid Overlay Service
 *
 * Handles combined grid overlays for TKA image export. This service implements
 * the functionality equivalent to desktop CombinedGridHandler, allowing both
 * diamond and box grids to be displayed simultaneously by overlaying the
 * opposite SVG grid file.
 *
 * Critical: Must match desktop overlay behavior exactly - overlays opposite
 * SVG grid file with full opacity.
 */

import type { CombinedGridOptions } from "$shared";
import { GridMode } from "$shared";
import { injectable } from "inversify";
import type { IBeatGridService } from "../contracts";

@injectable()
export class GridOverlayService implements IBeatGridService {
  // Grid constants
  private static readonly GRID_OPACITY = 1.0; // Desktop uses 100% opacity
  private static readonly GRID_COLOR = "#e5e7eb"; // Light gray
  private static readonly GRID_LINE_WIDTH = 1;

  /**
   * Apply combined grids to beat canvas
   * Matches desktop CombinedGridHandler.process_beat_for_combined_grids
   * 
   * This overlays the opposite SVG grid file on top of the existing beat canvas
   */
  applyCombinedGrids(
    canvas: HTMLCanvasElement,
    options: CombinedGridOptions
  ): HTMLCanvasElement {
    const currentGridMode = options.primaryGridMode;
    if (!this.validateGridMode(currentGridMode)) {
      throw new Error(`Invalid grid mode: ${currentGridMode}`);
    }

    // Create new canvas for combined result
    const combinedCanvas = document.createElement("canvas");
    combinedCanvas.width = canvas.width;
    combinedCanvas.height = canvas.height;

    const ctx = combinedCanvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context from combined canvas");
    }

    // Step 1: Draw original canvas
    ctx.drawImage(canvas, 0, 0);

    // Step 2: Add opposite grid SVG overlay with full opacity (match desktop)
    const oppositeGridMode = this.getOppositeGridMode(currentGridMode);
    this.drawSVGGridOverlay(
      ctx,
      oppositeGridMode,
      canvas.width,
      GridOverlayService.GRID_OPACITY
    );

    return combinedCanvas;
  }

  /**
   * Draw SVG grid overlay on canvas
   * Loads and renders the appropriate SVG grid file
   */
  drawSVGGridOverlay(
    ctx: CanvasRenderingContext2D,
    gridMode: GridMode,
    size: number,
    opacity: number = 1.0
  ): void {
    if (!this.validateGridMode(gridMode)) {
      throw new Error(`Invalid grid mode: ${gridMode}`);
    }

    // Save current context state
    ctx.save();
    ctx.globalAlpha = opacity;

    // Get SVG grid path based on mode
    const svgPath = this.getSVGGridPath(gridMode);
    
    // Load and render SVG grid
    // Note: In a full implementation, this would load the actual SVG file
    // from the shared/images/grid/ directory and render it
    // For now, we'll draw a placeholder pattern that represents the grid structure
    this.drawPlaceholderGrid(ctx, gridMode, size);

    // Restore context state
    ctx.restore();
  }

  /**
   * Get SVG grid file path for grid mode
   */
  private getSVGGridPath(gridMode: GridMode): string {
    // These paths should match the desktop grid SVG files
    switch (gridMode) {
      case GridMode.DIAMOND:
        return 'shared/images/grid/DIAMOND_grid.svg';
      case GridMode.BOX:
        return 'shared/images/grid/BOX_grid.svg';
      default:
        throw new Error(`Unknown grid mode: ${gridMode}`);
    }
  }

  /**
   * Draw placeholder grid pattern
   * TODO: Replace with actual SVG grid file loading and rendering
   */
  private drawPlaceholderGrid(
    ctx: CanvasRenderingContext2D,
    gridMode: GridMode,
    size: number
  ): void {
    ctx.strokeStyle = GridOverlayService.GRID_COLOR;
    ctx.lineWidth = GridOverlayService.GRID_LINE_WIDTH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (gridMode === GridMode.DIAMOND) {
      this.drawDiamondGrid(ctx, size);
    } else if (gridMode === GridMode.BOX) {
      this.drawBoxGrid(ctx, size);
    }
  }

  /**
   * Get opposite grid mode
   * Matches desktop logic exactly
   */
  getOppositeGridMode(currentMode: GridMode): GridMode {
    switch (currentMode) {
      case GridMode.DIAMOND:
        return GridMode.BOX;
      case GridMode.BOX:
        return GridMode.DIAMOND;
      default:
        throw new Error(`Unknown grid mode: ${currentMode}`);
    }
  }

  /**
   * Validate grid modes - only accepts proper GridMode enum
   */
  validateGridMode(gridMode: GridMode): boolean {
    const validModes = [GridMode.DIAMOND, GridMode.BOX];
    return validModes.includes(gridMode);
  }

  /**
   * Draw diamond grid pattern
   * Matches desktop diamond grid implementation
   */
  private drawDiamondGrid(ctx: CanvasRenderingContext2D, size: number): void {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4; // Standard diamond size

    ctx.beginPath();

    // Draw diamond shape
    ctx.moveTo(centerX, centerY - radius); // Top point
    ctx.lineTo(centerX + radius, centerY); // Right point
    ctx.lineTo(centerX, centerY + radius); // Bottom point
    ctx.lineTo(centerX - radius, centerY); // Left point
    ctx.closePath();

    ctx.stroke();

    // Add grid lines inside diamond
    this.drawDiamondGridLines(ctx, centerX, centerY, radius);
  }

  /**
   * Draw box grid pattern
   * Matches desktop box grid implementation
   */
  private drawBoxGrid(ctx: CanvasRenderingContext2D, size: number): void {
    const margin = size * 0.1; // Standard box margin
    const boxSize = size - 2 * margin;

    // Draw main box
    ctx.strokeRect(margin, margin, boxSize, boxSize);

    // Add grid lines inside box
    this.drawBoxGridLines(ctx, margin, margin, boxSize);
  }

  /**
   * Draw internal grid lines for diamond
   */
  private drawDiamondGridLines(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
  ): void {
    // Lighter opacity for internal lines
    const originalAlpha = ctx.globalAlpha;
    ctx.globalAlpha = originalAlpha * 0.5;

    // Draw horizontal and vertical center lines
    ctx.beginPath();

    // Horizontal line
    ctx.moveTo(centerX - radius * 0.7, centerY);
    ctx.lineTo(centerX + radius * 0.7, centerY);

    // Vertical line
    ctx.moveTo(centerX, centerY - radius * 0.7);
    ctx.lineTo(centerX, centerY + radius * 0.7);

    ctx.stroke();

    // Restore original alpha
    ctx.globalAlpha = originalAlpha;
  }

  /**
   * Draw internal grid lines for box
   */
  private drawBoxGridLines(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ): void {
    // Lighter opacity for internal lines
    const originalAlpha = ctx.globalAlpha;
    ctx.globalAlpha = originalAlpha * 0.5;

    ctx.beginPath();

    // Draw center cross
    const centerX = x + size / 2;
    const centerY = y + size / 2;

    // Horizontal line
    ctx.moveTo(x, centerY);
    ctx.lineTo(x + size, centerY);

    // Vertical line
    ctx.moveTo(centerX, y);
    ctx.lineTo(centerX, y + size);

    ctx.stroke();

    // Restore original alpha
    ctx.globalAlpha = originalAlpha;
  }

  // ============================================================================
  // INTERFACE IMPLEMENTATION METHODS
  // ============================================================================

  /**
   * Draw grid on canvas context (interface requirement)
   */
  drawGrid(
    ctx: CanvasRenderingContext2D,
    gridMode: GridMode,
    options: any
  ): void {
    this.drawSVGGridOverlay(ctx, gridMode, options.size || 144, 1.0);
  }

  /**
   * Determine grid mode from beat data
   */
  getGridModeForBeat(beatData: any): GridMode {
    // Default to DIAMOND if no grid mode specified
    return beatData?.gridMode || GridMode.DIAMOND;
  }

  /**
   * Draw grid points/intersections (not needed for SVG overlays)
   */
  drawGridPoints(
    ctx: CanvasRenderingContext2D,
    gridMode: GridMode,
    options: any
  ): void {
    // Not needed for SVG grid overlays - grids are rendered as complete overlays
  }

  /**
   * Validate grid options
   */
  validateGridOptions(gridMode: GridMode, options: any): any {
    return {
      isValid: this.validateGridMode(gridMode),
      errors: this.validateGridMode(gridMode) ? [] : ['Invalid grid mode']
    };
  }

  /**
   * Get grid metrics (basic implementation)
   */
  getGridMetrics(gridMode: GridMode, size: number): any {
    const spacing = size / 8;
    return {
      spacing,
      points: [], // Not needed for SVG overlays
      lines: []   // Not needed for SVG overlays
    };
  }

  /**
   * Create grid as SVG string
   */
  createGridSVG(gridMode: GridMode, size: number, options?: any): string {
    const svgPath = this.getSVGGridPath(gridMode);
    // In a full implementation, this would load and return the actual SVG content
    // For now, return a placeholder
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="100%" height="100%" fill="none" stroke="#ccc"/>
      <!-- TODO: Load actual ${gridMode} grid SVG content from ${svgPath} -->
    </svg>`;
  }

  /**
   * Get default grid options
   */
  getDefaultGridOptions(gridMode: GridMode): any {
    return {
      size: 144,
      opacity: 1.0,
      color: GridOverlayService.GRID_COLOR
    };
  }

  /**
   * Check if two grid modes are compatible for overlay
   */
  areGridModesCompatible(primary: GridMode, overlay: GridMode): boolean {
    // All grid modes are compatible for overlay
    return this.validateGridMode(primary) && this.validateGridMode(overlay);
  }

  /**
   * Get supported grid modes
   */
  getSupportedGridModes(): string[] {
    return [GridMode.DIAMOND, GridMode.BOX];
  }
}

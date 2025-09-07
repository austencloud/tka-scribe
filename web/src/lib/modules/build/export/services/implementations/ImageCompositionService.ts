/**
 * Image Composition Service
 *
 * Main orchestrator for composing complete TKA sequence images. This service
 * combines rendered beats, text overlays, and background elements to create
 * the final export image. Equivalent to desktop ImageCreator.
 *
 * Critical: Maintains exact positioning and sizing compatibility with desktop.
 *
 * Architecture: Uses internal composition to delegate to specialized components
 * while maintaining the same public interface contracts.
 */

import type { SequenceData } from "$shared";
import { GridMode, TYPES } from "$shared";
import { inject, injectable } from "inversify";
import type { CompositionOptions, LayoutData, SequenceExportOptions } from "../../domain/models";
import type { IBeatGridService, IBeatRenderingService, IDifficultyBadgeRenderer, IDimensionCalculationService, IImageCompositionService, ILayoutCalculationService, ITextRenderingUtils, IUserInfoRenderer, IWordTextRenderer } from "../contracts";


@injectable()
export class ImageCompositionService implements IImageCompositionService {
  constructor(
    @inject(TYPES.ILayoutCalculationService)
    private layoutService: ILayoutCalculationService,
    @inject(TYPES.IDimensionCalculationService)
    private dimensionService: IDimensionCalculationService,
    @inject(TYPES.IBeatRenderingService) 
    private beatRenderer: IBeatRenderingService,
    @inject(TYPES.IWordTextRenderer) 
    private wordRenderer: IWordTextRenderer,
    @inject(TYPES.IUserInfoRenderer) 
    private userInfoRenderer: IUserInfoRenderer,
    @inject(TYPES.IDifficultyBadgeRenderer)
    private difficultyRenderer: IDifficultyBadgeRenderer,
    @inject(TYPES.ITextRenderingUtils) 
    private textUtils: ITextRenderingUtils,
    @inject(TYPES.IBeatGridService)
    private gridService: IBeatGridService
  ) {}

  /**
   * Compose complete sequence image from sequence data
   * Main entry point that orchestrates the entire composition process
   */
  async composeSequenceImage(
    sequence: SequenceData,
    options: SequenceExportOptions
  ): Promise<HTMLCanvasElement> {
    if (!sequence) {
      throw new Error("Sequence data is required for composition");
    }

    try {
      // Step 1: Calculate layout and dimensions
      const layoutData = this.calculateLayoutData(sequence, options);

      // Step 2: Render all beats to individual canvases
      const beatCanvases = await this.renderAllBeats(sequence, layoutData, options);

      // Step 3: Render start position if needed
      const startPositionCanvas = options.includeStartPosition
        ? await this.renderStartPosition(sequence, layoutData, options)
        : null;

      // Step 4: Compose final image from canvases
      const mainCanvas = await this.composeFromCanvases(
        beatCanvases,
        startPositionCanvas,
        layoutData,
        this.toCompositionOptions(options, layoutData)
      );

      // Step 5: Add text overlays
      this.addTextOverlays(mainCanvas, sequence, layoutData, options);

      return mainCanvas;
    } catch (error) {
      throw new Error(
        `Image composition failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Compose image from pre-rendered canvases
   * Lower-level composition for when beats are already rendered
   */
  async composeFromCanvases(
    beatCanvases: HTMLCanvasElement[],
    startPositionCanvas: HTMLCanvasElement | null,
    layoutData: LayoutData,
    options: CompositionOptions
  ): Promise<HTMLCanvasElement> {
    // Calculate total dimensions
    const totalAdditionalHeight = layoutData.additionalHeightTop + layoutData.additionalHeightBottom;
    const [width, height] = this.layoutService.calculateImageDimensions(
      [layoutData.columns, layoutData.rows],
      totalAdditionalHeight,
      options.beatScale || 1
    );

    // Create main canvas
    const mainCanvas = document.createElement('canvas');
    mainCanvas.width = width;
    mainCanvas.height = height;
    
    const ctx = mainCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from main canvas');
    }

    // Step 1: Fill background
    this.fillBackground(ctx, mainCanvas.width, mainCanvas.height);

    // Step 2: Position and draw start position
    let startColumn = 0;
    if (startPositionCanvas && options.includeStartPosition) {
      this.drawBeatCanvas(
        ctx,
        startPositionCanvas,
        0, // column 0
        0, // row 0
        layoutData
      );
      startColumn = 1;
    }

    // Step 3: Position and draw all beats in grid layout
    this.drawBeatsInGrid(
      ctx,
      beatCanvases,
      layoutData,
      startColumn
    );

    return mainCanvas;
  }

  /**
   * Apply background and borders
   * Matches desktop white background
   */
  applyBackground(
    canvas: HTMLCanvasElement,
    backgroundColor: string = "white"
  ): HTMLCanvasElement {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context from canvas");
    }
    this.fillBackground(ctx, canvas.width, canvas.height, backgroundColor);
    return canvas;
  }

  /**
   * Optimize canvas for export
   * Applies final optimizations before export
   */
  optimizeForExport(canvas: HTMLCanvasElement): HTMLCanvasElement {
    // For now, return as-is. In the future, could apply:
    // - Anti-aliasing improvements
    // - Color space conversions
    // - Compression optimizations
    return canvas;
  }

  /**
   * Fill canvas background
   */
  private fillBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    color: string = "white"
  ): void {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Draw a single beat canvas at grid position
   */
  private drawBeatCanvas(
    ctx: CanvasRenderingContext2D,
    beatCanvas: HTMLCanvasElement,
    column: number,
    row: number,
    layoutData: LayoutData
  ): void {
    const x = column * layoutData.beatSize;
    const y = row * layoutData.beatSize + layoutData.additionalHeightTop;

    ctx.drawImage(beatCanvas, x, y);
  }

  /**
   * Draw all beats in grid layout
   * Matches desktop grid positioning exactly
   */
  private drawBeatsInGrid(
    ctx: CanvasRenderingContext2D,
    beatCanvases: HTMLCanvasElement[],
    layoutData: LayoutData,
    startColumn: number = 0
  ): void {
    let beatIndex = 0;

    // Iterate through grid positions (matches desktop logic)
    for (
      let row = 0;
      row < layoutData.rows && beatIndex < beatCanvases.length;
      row++
    ) {
      for (
        let col = startColumn;
        col < layoutData.columns && beatIndex < beatCanvases.length;
        col++
      ) {
        const beatCanvas = beatCanvases[beatIndex];
        this.drawBeatCanvas(ctx, beatCanvas, col, row, layoutData);
        beatIndex++;
      }
    }
  }

  /**
   * Create composition preview (smaller scale)
   */
  async createPreview(
    sequence: SequenceData,
    options: SequenceExportOptions,
    previewScale: number = 0.5
  ): Promise<HTMLCanvasElement> {
    const previewOptions = {
      ...options,
      beatScale: options.beatScale * previewScale,
    };

    return await this.composeSequenceImage(sequence, previewOptions);
  }

  /**
   * Calculate layout data for composition
   */
  private calculateLayoutData(
    sequence: SequenceData,
    options: SequenceExportOptions
  ): LayoutData {
    const beatCount = sequence.beats.length;

    // Calculate layout using exact desktop algorithms
    const [columns, rows] = this.layoutService.calculateLayout(
      beatCount,
      options.includeStartPosition
    );

    // Calculate additional heights for text areas
    const [additionalHeightTop, additionalHeightBottom] =
      this.dimensionService.determineAdditionalHeights(
        options,
        beatCount,
        options.beatScale
      );

    return {
      columns,
      rows,
      beatSize: Math.floor(options.beatSize * options.beatScale),
      includeStartPosition: options.includeStartPosition,
      additionalHeightTop,
      additionalHeightBottom,
    };
  }

  /**
   * Render all beats to individual canvases
   */
  private async renderAllBeats(
    sequence: SequenceData,
    layoutData: LayoutData,
    options: SequenceExportOptions
  ): Promise<HTMLCanvasElement[]> {
    if (!sequence.beats || sequence.beats.length === 0) {
      return [];
    }

    const beatRenderOptions = {
      addBeatNumbers: options.addBeatNumbers,
      redVisible: options.redVisible,
      blueVisible: options.blueVisible,
      combinedGrids: false, // Handle combined grids separately
      beatScale: options.beatScale,
    };

    // First render all beats normally
    const beatCanvases = await this.beatRenderer.renderBeatsToCanvases(
      [...sequence.beats],
      layoutData.beatSize,
      beatRenderOptions
    );

    // Apply combined grids if enabled
    if (options.combinedGrids) {
      const processedCanvases = [];
      for (let i = 0; i < beatCanvases.length; i++) {
        const beat = sequence.beats[i];
        const beatCanvas = beatCanvases[i];
        
        // Get the beat's current grid mode from options (BeatData doesn't have gridMode)
        const currentGridMode = GridMode.DIAMOND; // Default to DIAMOND
        
        // Apply combined grids using the grid service
        const processedCanvas = this.gridService.applyCombinedGrids(
          beatCanvas,
          { primaryGridMode: currentGridMode }
        );
        
        processedCanvases.push(processedCanvas);
      }
      return processedCanvases;
    }

    return beatCanvases;
  }

  /**
   * Render start position canvas
   */
  private async renderStartPosition(
    sequence: SequenceData,
    layoutData: LayoutData,
    options: SequenceExportOptions
  ): Promise<HTMLCanvasElement> {
    const beatRenderOptions = {
      addBeatNumbers: options.addBeatNumbers,
      redVisible: options.redVisible,
      blueVisible: options.blueVisible,
      combinedGrids: options.combinedGrids,
      beatScale: options.beatScale,
    };

    return await this.beatRenderer.renderStartPositionToCanvas(
      sequence,
      layoutData.beatSize,
      beatRenderOptions
    );
  }

  /**
   * Convert options to composition options with layout data
   */
  private toCompositionOptions(
    options: SequenceExportOptions,
    layoutData: LayoutData
  ): CompositionOptions {
    return {
      ...options,
      layout: [layoutData.columns, layoutData.rows],
      additionalHeightTop: layoutData.additionalHeightTop || 0,
      additionalHeightBottom: layoutData.additionalHeightBottom || 0,
    };
  }

  /**
   * Add all text overlays (word, user info, difficulty)
   */
  private addTextOverlays(
    canvas: HTMLCanvasElement,
    sequence: SequenceData,
    layoutData: LayoutData,
    options: SequenceExportOptions
  ): void {
    const textOptions = {
      margin: Math.floor(options.margin * options.beatScale),
      beatScale: options.beatScale,
      additionalHeightTop: layoutData.additionalHeightTop,
      additionalHeightBottom: layoutData.additionalHeightBottom,
    };

    // Add word title if enabled
    if (options.addWord && sequence.word) {
      this.wordRenderer.render(canvas, sequence.word, textOptions);
    }

    // Add user info if enabled
    if (options.addUserInfo) {
      const userInfo = {
        userName: options.userName,
        notes: options.notes,
        exportDate: options.exportDate,
      };
      this.userInfoRenderer.render(canvas, userInfo, textOptions);
    }

    // Add difficulty level badge if enabled and available
    if (
      options.addDifficultyLevel &&
      sequence.level &&
      layoutData.additionalHeightTop > 0
    ) {
      const badgeSize = Math.floor(layoutData.additionalHeightTop * 0.75);
      const inset = Math.floor(layoutData.additionalHeightTop / 8);
      this.difficultyRenderer.render(canvas, sequence.level, [inset, inset], badgeSize);
    }
  }
}

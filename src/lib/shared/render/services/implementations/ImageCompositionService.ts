 /**
 * Simple Image Composition Service
 *
 * Dead-simple approach: Render pictographs directly onto a single canvas.
 * No intermediate canvases, no complex calculations, just straightforward rendering.
 */

import type { BeatData, PictographData, SequenceData } from "$shared";
import { TYPES } from "$shared/inversify/types";
import { inject, injectable } from "inversify";
import type { SequenceExportOptions } from "../../domain/models";
import { renderPictographToSVG } from "../../utils/pictograph-to-svg";
import { simplifyRepeatedWord } from "../../utils/word-simplifier";
import type {
  IDimensionCalculationService,
  ILayoutCalculationService,
  ITextRenderingService,
} from "../contracts";
import {} from "../contracts";
import type { IImageCompositionService } from "../contracts";
import { SequenceDifficultyCalculator } from "$lib/modules/explore/gallery/display/services/implementations/SequenceDifficultyCalculator";

@injectable()
export class ImageCompositionService implements IImageCompositionService {
  // Create instance directly to avoid DI module loading order issues
  private readonly difficultyCalculator = new SequenceDifficultyCalculator();

  constructor(
    @inject(TYPES.ILayoutCalculationService)
    private readonly layoutService: ILayoutCalculationService,
    @inject(TYPES.ITextRenderingService)
    private readonly textRenderingService: ITextRenderingService,
    @inject(TYPES.IDimensionCalculationService)
    private readonly dimensionCalculationService: IDimensionCalculationService
  ) {}
  /**
   * Compose complete sequence image from sequence data
   */
  async composeSequenceImage(
    sequence: SequenceData,
    options: SequenceExportOptions
  ): Promise<HTMLCanvasElement> {
    if (!sequence.beats || sequence.beats.length === 0) {
      throw new Error("Sequence must have at least one beat");
    }

    // Step 1: Calculate layout using LayoutCalculationService
    // This service has the proper lookup tables matching the desktop application
    const beatCount = sequence.beats.length;
    const [columns, rows] = this.layoutService.calculateLayout(
      beatCount,
      options.includeStartPosition
    );

    // Step 2: Calculate canvas dimensions including title space
    // Scale beatSize by beatScale to maintain proportions between grid and title areas
    const baseBeatSize = options.beatSize || 120;
    const beatSize = Math.floor(baseBeatSize * (options.beatScale || 1));
    const canvasWidth = columns * beatSize;

    // Derive word from beat letters if sequence.word is empty
    // This ensures the word displays even when built dynamically in the create module
    const rawWord =
      sequence.word ||
      sequence.beats
        .filter((beat) => beat.letter)
        .map((beat) => beat.letter)
        .join("");

    // Simplify repeated patterns (e.g., "ABCABCABC" → "ABC")
    // This matches the behavior of the WordLabel component in the workspace
    const derivedWord = simplifyRepeatedWord(rawWord);

    // DEBUG: Log word derivation to diagnose share preview issue
    console.log("🎨 ImageCompositionService word debug:", {
      sequenceWord: sequence.word,
      rawWord,
      derivedWord,
      addWord: options.addWord,
      beatCount,
      beatLetters: sequence.beats.map((b) => b.letter),
    });

    // Calculate header height if word should be included
    // Header is at the TOP of the image
    const headerHeight =
      options.addWord && derivedWord
        ? this.calculateHeaderHeight(beatCount, options.beatScale || 1)
        : 0;
    const canvasHeight = rows * beatSize + headerHeight;

    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context");
    }

    // Step 3: Fill white background for the grid area (offset by header height)
    ctx.fillStyle = "white";
    ctx.fillRect(0, headerHeight, canvasWidth, rows * beatSize);

    // Step 4: Render each pictograph directly onto the canvas (offset by header height)
    // Render start position if needed (always at column 0, row 0)
    if (options.includeStartPosition && sequence.startPosition) {
      await this.renderPictographAt(
        ctx,
        sequence.startPosition,
        0,
        0,
        beatSize,
        0,
        headerHeight // Offset grid below header
      ); // beatNumber = 0 for start position
    }

    // Step 5: Render all beats in the grid
    // Calculate how many beats per row based on the layout
    const startColumn = options.includeStartPosition ? 1 : 0;
    const beatsPerRow = columns - startColumn; // Available columns for beats

    for (let i = 0; i < sequence.beats.length; i++) {
      const beat = sequence.beats[i];
      if (!beat) continue; // Skip if beat is undefined
      // Calculate position: beats fill remaining columns, then wrap to next row
      const col = startColumn + (i % beatsPerRow);
      const row = Math.floor(i / beatsPerRow);
      const beatNumber = i + 1; // Beat numbers start from 1
      await this.renderPictographAt(
        ctx,
        beat,
        col,
        row,
        beatSize,
        beatNumber,
        headerHeight // Offset grid below header
      );
    }

    // Step 6: Draw cell borders only between occupied cells
    this.drawSmartCellBorders(
      ctx,
      columns,
      rows,
      beatSize,
      sequence,
      options,
      headerHeight // Offset grid below header
    );

    // Step 7: Render header with word at the top
    // The header has a level badge indicator
    if (options.addWord && derivedWord && headerHeight > 0) {
      const difficultyLevel = this.getDifficultyLevel(sequence);
      this.textRenderingService.renderWordHeader(
        canvas,
        derivedWord,
        {
          margin: options.margin || 0,
          beatScale: options.beatScale || 1,
        },
        headerHeight,
        difficultyLevel
      );
    }

    return canvas;
  }

  /**
   * Render a single pictograph directly onto the canvas at the specified grid position
   */
  private async renderPictographAt(
    ctx: CanvasRenderingContext2D,
    pictographData: BeatData | PictographData,
    column: number,
    row: number,
    beatSize: number,
    beatNumber?: number,
    titleOffset: number = 0
  ): Promise<void> {
    try {
      // Generate SVG with beat number
      const svgString = await renderPictographToSVG(
        pictographData,
        beatSize,
        beatNumber
      );

      // Convert SVG to image
      const img = await this.svgStringToImage(svgString);

      // Draw directly onto the canvas at the correct position (offset by title)
      const x = column * beatSize;
      const y = row * beatSize + titleOffset;

      ctx.drawImage(img, x, y, beatSize, beatSize);
    } catch (error) {
      console.error(`❌ Failed to render beat at (${column}, ${row}):`, error);
      // Draw error placeholder
      const x = column * beatSize;
      const y = row * beatSize;
      ctx.fillStyle = "#ffeeee";
      ctx.fillRect(x + 5, y + 5, beatSize - 10, beatSize - 10);
      ctx.fillStyle = "#cc0000";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Error", x + beatSize / 2, y + beatSize / 2);
    }
  }

  /**
   * Draw cell borders only between occupied cells (smart grid)
   */
  private drawSmartCellBorders(
    ctx: CanvasRenderingContext2D,
    columns: number,
    rows: number,
    beatSize: number,
    sequence: SequenceData,
    options: SequenceExportOptions,
    titleOffset: number = 0
  ): void {
    ctx.strokeStyle = "#e0e0e0"; // Light gray border color (matching workbench)
    ctx.lineWidth = 1;

    // Create a map of occupied cells
    const occupiedCells = this.getOccupiedCells(sequence, options, columns);

    // Helper function to check if a cell is occupied
    const isOccupied = (col: number, row: number): boolean => {
      return occupiedCells.has(`${col},${row}`);
    };

    // Draw vertical lines between horizontally adjacent occupied cells
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns - 1; col++) {
        if (isOccupied(col, row) && isOccupied(col + 1, row)) {
          const x = (col + 1) * beatSize;
          ctx.beginPath();
          ctx.moveTo(x, row * beatSize + titleOffset);
          ctx.lineTo(x, (row + 1) * beatSize + titleOffset);
          ctx.stroke();
        }
      }
    }

    // Draw horizontal lines between vertically adjacent occupied cells
    for (let col = 0; col < columns; col++) {
      for (let row = 0; row < rows - 1; row++) {
        if (isOccupied(col, row) && isOccupied(col, row + 1)) {
          const y = (row + 1) * beatSize + titleOffset;
          ctx.beginPath();
          ctx.moveTo(col * beatSize, y);
          ctx.lineTo((col + 1) * beatSize, y);
          ctx.stroke();
        }
      }
    }
  }

  /**
   * Get a set of occupied cell coordinates
   */
  private getOccupiedCells(
    sequence: SequenceData,
    options: SequenceExportOptions,
    columns: number
  ): Set<string> {
    const occupied = new Set<string>();

    // Add start position if included
    if (options.includeStartPosition && sequence.startPosition) {
      occupied.add("0,0");
    }

    // Add all beats
    const startColumn = options.includeStartPosition ? 1 : 0;
    const beatsPerRow = columns - startColumn;

    for (let i = 0; i < (sequence.beats.length || 0); i++) {
      const col = startColumn + (i % beatsPerRow);
      const row = Math.floor(i / beatsPerRow);
      occupied.add(`${col},${row}`);
    }

    return occupied;
  }

  /**
   * Convert SVG string to HTMLImageElement
   */
  private async svgStringToImage(svgString: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load SVG as image"));

      // Convert SVG string to data URL
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      img.src = url;

      // Clean up blob URL after image loads
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
    });
  }

  // Stub methods to satisfy interface (not used in simple version)
  async composeFromCanvases(): Promise<HTMLCanvasElement> {
    throw new Error("Not implemented in simple version");
  }

  applyBackground(canvas: HTMLCanvasElement): HTMLCanvasElement {
    return canvas;
  }

  optimizeForExport(canvas: HTMLCanvasElement): HTMLCanvasElement {
    // Simple version doesn't need optimization
    return canvas;
  }

  /**
   * Calculate header height based on beat count
   * Header is at the top of the image
   */
  private calculateHeaderHeight(beatCount: number, beatScale: number): number {
    // Use a simpler, more compact header height
    let baseHeight = 0;

    if (beatCount === 0) {
      baseHeight = 0;
    } else if (beatCount === 1) {
      baseHeight = 80;
    } else if (beatCount === 2) {
      baseHeight = 100;
    } else {
      // beatCount >= 3
      baseHeight = 120;
    }

    // Apply beat scale
    return Math.floor(baseHeight * beatScale);
  }

  /**
   * Calculate difficulty level from sequence beats
   * Uses the SequenceDifficultyCalculator to analyze turns and orientations
   */
  private getDifficultyLevel(sequence: SequenceData): number {
    // Use the difficulty calculator to analyze beats dynamically
    if (sequence.beats && sequence.beats.length > 0) {
      // Copy to mutable array for the calculator
      return this.difficultyCalculator.calculateDifficultyLevel([...sequence.beats]);
    }

    // Fallback to stored level if no beats
    if (typeof sequence.level === "number" && sequence.level > 0) {
      return sequence.level;
    }

    // Default fallback
    return 1;
  }
}

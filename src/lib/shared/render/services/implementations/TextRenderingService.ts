/**
 * Text Rendering Service
 *
 * Handles rendering of sequence titles, user info, and other text overlays
 * on exported images. Matches desktop application text rendering patterns.
 */

import { inject, injectable } from "inversify";
import { TYPES } from "../../../inversify/types";
import type { TextRenderOptions, UserInfo } from "../../domain/models";
import type { ITextRenderingService } from "../contracts";
import type { IDimensionCalculationService } from "../contracts/IDimensionCalculationService";
@injectable()
export class TextRenderingService implements ITextRenderingService {
  // Font configuration matching WordLabel component exactly
  private readonly titleFontFamily = "Georgia, serif"; // Matches WordLabel
  private readonly titleFontWeight = "600"; // Matches WordLabel
  private readonly fallbackFontFamily =
    "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  private readonly userInfoFontWeight = "400";

  constructor(
    @inject(TYPES.IDimensionCalculationService)
    private dimensionService: IDimensionCalculationService
  ) {}

  /**
   * Render sequence word/title text at the top center of the canvas
   * @deprecated Use renderWordFooter instead for Explorer Gallery style
   */
  renderWordText(
    canvas: HTMLCanvasElement,
    word: string,
    options: TextRenderOptions,
    beatCount: number = 3 // Default to 3+ beats scaling
  ): void {
    if (!word || word.trim() === "") {
      console.log("🚫 TextRenderingService: No word to render");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.log("🚫 TextRenderingService: No canvas context");
      return;
    }

    // Get desktop-compatible font scaling based on beat count
    const scalingFactors =
      this.dimensionService.getTextScalingFactors(beatCount);

    // Calculate title area height (matches ImageCompositionService logic)
    // titleHeight is already scaled by beatScale internally
    const titleHeight = this.calculateTitleHeight(
      beatCount,
      options.beatScale || 1
    );
    // Apply font scaling factor - but NOT beatScale again since titleHeight is already scaled
    // Additional 0.7 multiplier to reduce overall font size for better visual balance
    const finalFontSize = titleHeight * scalingFactors.fontScale * 0.7;

    // Set font properties using Georgia serif font (matches WordLabel)
    ctx.font = `${this.titleFontWeight} ${finalFontSize}px ${this.titleFontFamily}`;
    ctx.fillStyle = "black"; // Matches WordLabel color
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Calculate positioning
    const centerX = canvas.width / 2;
    const centerY = titleHeight / 2;

    this.drawTitleBackground(ctx, canvas.width, titleHeight);

    // Set text color to dark gray for visibility
    ctx.fillStyle = "black";

    // Render the text
    ctx.fillText(word, centerX, centerY);
  }

  /**
   * Render word in a footer at the bottom of the canvas
   * Uses Explorer Gallery style: color-coded gradient background based on difficulty level
   */
  renderWordFooter(
    canvas: HTMLCanvasElement,
    word: string,
    options: TextRenderOptions,
    footerHeight: number,
    difficultyLevel: number = 1
  ): void {
    if (!word || word.trim() === "") {
      console.log("🚫 TextRenderingService: No word to render in footer");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.log("🚫 TextRenderingService: No canvas context");
      return;
    }

    // Get level style (gradient colors and text color) matching Explorer Gallery
    const levelStyle = this.getLevelStyle(difficultyLevel);

    // Calculate footer position (at the bottom of the canvas)
    const footerY = canvas.height - footerHeight;

    // Draw gradient background
    this.drawFooterGradient(ctx, 0, footerY, canvas.width, footerHeight, levelStyle);

    // Calculate font size based on footer height (larger, bolder text)
    const finalFontSize = footerHeight * 0.55;

    // Set font properties - bold weight for emphasis
    ctx.font = `700 ${finalFontSize}px ${this.titleFontFamily}`;
    ctx.fillStyle = levelStyle.textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Calculate positioning (centered in footer)
    const centerX = canvas.width / 2;
    const centerY = footerY + footerHeight / 2;

    // Render the text
    ctx.fillText(word, centerX, centerY);
  }

  /**
   * Render word in a header at the top of the canvas
   * Simple background with optional level badge indicator
   */
  renderWordHeader(
    canvas: HTMLCanvasElement,
    word: string,
    options: TextRenderOptions,
    headerHeight: number,
    difficultyLevel: number = 1,
    showDifficultyBadge: boolean = true
  ): void {
    if (!word || word.trim() === "") {
      console.log("🚫 TextRenderingService: No word to render in header");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.log("🚫 TextRenderingService: No canvas context");
      return;
    }

    // Draw simple light gray background for header
    ctx.fillStyle = "rgba(245, 245, 245, 0.98)";
    ctx.fillRect(0, 0, canvas.width, headerHeight);

    // Draw subtle bottom border
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, headerHeight - 0.5);
    ctx.lineTo(canvas.width, headerHeight - 0.5);
    ctx.stroke();

    // Calculate font size based on header height (90% of header height)
    const finalFontSize = headerHeight * 0.9;

    // Set font properties - bold weight for emphasis
    ctx.font = `700 ${finalFontSize}px ${this.titleFontFamily}`;
    ctx.fillStyle = "#1f2937"; // Dark gray text
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Calculate badge size (90% of header height)
    const badgeSize = headerHeight * 0.9;
    const badgePadding = headerHeight * 0.05; // Small padding from edge
    const centerX = canvas.width / 2;
    const centerY = headerHeight / 2;

    // Render the word text
    ctx.fillText(word, centerX, centerY);

    // Render level badge on the left side (only if showDifficultyBadge is true)
    if (showDifficultyBadge) {
      this.renderLevelBadge(
        ctx,
        difficultyLevel,
        badgePadding,
        (headerHeight - badgeSize) / 2,
        badgeSize
      );
    }
  }

  /**
   * Render a colored level badge with gradient
   * Colors: 1=white, 2=silver, 3=gold, 4=red, 5=purple
   */
  private renderLevelBadge(
    ctx: CanvasRenderingContext2D,
    level: number,
    x: number,
    y: number,
    size: number
  ): void {
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const radius = size / 2;

    // Create gradient for badge
    const gradient = this.createLevelBadgeGradient(ctx, centerX, centerY, radius, level);

    // Draw badge circle with gradient
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Add subtle border for definition
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw level number - dark text for light badges, light text for dark badges
    const textColor = level <= 3 ? "#1f2937" : "#ffffff";
    ctx.fillStyle = textColor;
    ctx.font = `bold ${size * 0.55}px ${this.fallbackFontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(level.toString(), centerX, centerY);
  }

  /**
   * Create gradient for level badge
   * 1=white, 2=silver, 3=gold, 4=red, 5=purple
   */
  private createLevelBadgeGradient(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    level: number
  ): CanvasGradient {
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius
    );

    switch (level) {
      case 1:
        // White - clean, beginner
        gradient.addColorStop(0, "rgb(255, 255, 255)");
        gradient.addColorStop(1, "rgb(235, 235, 235)");
        break;
      case 2:
        // Silver - intermediate
        gradient.addColorStop(0, "rgb(220, 220, 225)");
        gradient.addColorStop(0.3, "rgb(192, 192, 200)");
        gradient.addColorStop(0.6, "rgb(169, 169, 180)");
        gradient.addColorStop(1, "rgb(140, 140, 155)");
        break;
      case 3:
        // Gold - advanced
        gradient.addColorStop(0, "rgb(255, 215, 0)");
        gradient.addColorStop(0.2, "rgb(238, 201, 0)");
        gradient.addColorStop(0.4, "rgb(218, 165, 32)");
        gradient.addColorStop(0.6, "rgb(184, 134, 11)");
        gradient.addColorStop(0.8, "rgb(160, 110, 20)");
        gradient.addColorStop(1, "rgb(139, 90, 19)");
        break;
      case 4:
        // Red - expert
        gradient.addColorStop(0, "rgb(255, 120, 120)");
        gradient.addColorStop(0.3, "rgb(239, 68, 68)");
        gradient.addColorStop(0.6, "rgb(220, 38, 38)");
        gradient.addColorStop(1, "rgb(185, 28, 28)");
        break;
      case 5:
        // Purple - legendary
        gradient.addColorStop(0, "rgb(216, 180, 254)");
        gradient.addColorStop(0.3, "rgb(168, 85, 247)");
        gradient.addColorStop(0.6, "rgb(147, 51, 234)");
        gradient.addColorStop(1, "rgb(126, 34, 206)");
        break;
      default:
        // Fallback to white
        gradient.addColorStop(0, "rgb(255, 255, 255)");
        gradient.addColorStop(1, "rgb(235, 235, 235)");
    }

    return gradient;
  }

  /**
   * Get level style (colors) matching Explorer Gallery SequenceCard
   * 1=white, 2=silver, 3=gold, 4=red, 5=purple
   */
  private getLevelStyle(level: number): { background: string[]; textColor: string } {
    const levelStyles: Record<number, { background: string[]; textColor: string }> = {
      1: {
        // White - Beginner
        background: [
          "rgba(255, 255, 255, 0.98)",
          "rgba(250, 250, 250, 0.95)",
          "rgba(245, 245, 245, 0.92)",
          "rgba(235, 235, 235, 0.9)",
        ],
        textColor: "#1f2937",
      },
      2: {
        // Silver - Intermediate
        background: [
          "rgba(220, 220, 225, 0.98)",
          "rgba(192, 192, 200, 0.95)",
          "rgba(169, 169, 180, 0.92)",
          "rgba(140, 140, 155, 0.9)",
        ],
        textColor: "#1f2937",
      },
      3: {
        // Gold - Advanced
        background: [
          "rgba(255, 215, 0, 0.98)",
          "rgba(238, 201, 0, 0.95)",
          "rgba(218, 165, 32, 0.92)",
          "rgba(184, 134, 11, 0.9)",
        ],
        textColor: "#1f2937",
      },
      4: {
        // Red - Expert
        background: [
          "rgba(255, 120, 120, 0.98)",
          "rgba(239, 68, 68, 0.95)",
          "rgba(220, 38, 38, 0.92)",
          "rgba(185, 28, 28, 0.9)",
        ],
        textColor: "#ffffff",
      },
      5: {
        // Purple - Legendary
        background: [
          "rgba(216, 180, 254, 0.98)",
          "rgba(168, 85, 247, 0.95)",
          "rgba(147, 51, 234, 0.92)",
          "rgba(126, 34, 206, 0.9)",
        ],
        textColor: "#ffffff",
      },
    };

    const defaultStyle = {
      background: ["#374151", "#1f2937", "#111827", "#0f0f0f"],
      textColor: "#f8fafc",
    };

    return levelStyles[level] ?? defaultStyle;
  }

  /**
   * Draw gradient background for footer
   */
  private drawFooterGradient(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    levelStyle: { background: string[]; textColor: string }
  ): void {
    // Create linear gradient at 135 degrees (matching CSS gradient)
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);

    // Add color stops matching the Explorer Gallery CSS gradients
    gradient.addColorStop(0, levelStyle.background[0] ?? "#374151");
    gradient.addColorStop(0.3, levelStyle.background[1] ?? "#1f2937");
    gradient.addColorStop(0.6, levelStyle.background[2] ?? "#111827");
    gradient.addColorStop(1, levelStyle.background[3] ?? "#0f0f0f");

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
  }

  /**
   * Calculate title height based on beat count (matches desktop logic)
   */
  private calculateTitleHeight(beatCount: number, beatScale: number): number {
    let baseHeight = 0;

    // Match desktop logic exactly based on beat count
    if (beatCount === 0) {
      baseHeight = 0;
    } else if (beatCount === 1) {
      baseHeight = 150;
    } else if (beatCount === 2) {
      baseHeight = 200;
    } else {
      // beatCount >= 3
      baseHeight = 300;
    }

    // Apply beat scale
    return Math.floor(baseHeight * beatScale);
  }

  /**
   * Render user information at the bottom of the canvas
   * Matches legacy desktop layout:
   * - Username (bottom-left) - Bold & Italic, Georgia font
   * - Notes (bottom-center) - Italic, default: "Created using The Kinetic Alphabet"
   * - Date (bottom-right) - Italic, format: MM-DD-YYYY
   */
  renderUserInfo(
    canvas: HTMLCanvasElement,
    userInfo: UserInfo,
    options: TextRenderOptions,
    footerHeight: number = 60
  ): void {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const margin = Math.max(8, footerHeight * 0.1); // 10% of footer as margin
    const beatScale = options.beatScale || 1;

    // Calculate font size based on footer height for proper scaling
    // Use 40% of footer height as base font size, clamped to reasonable range
    const baseFontSize = footerHeight * 0.4;
    const fontSize = Math.max(14, Math.min(baseFontSize, 36));

    // Position text vertically centered in footer area
    const footerTop = canvas.height - footerHeight;
    const yPosition = footerTop + (footerHeight / 2);

    ctx.fillStyle = "#333333";
    ctx.textBaseline = "middle"; // Center text vertically

    // Username (bottom-left, bold italic) - Georgia font matches legacy
    if (userInfo.userName && userInfo.userName.trim() !== "") {
      ctx.font = `bold italic ${fontSize}px Georgia, serif`;
      ctx.textAlign = "left";
      ctx.fillText(userInfo.userName, margin, yPosition);
    }

    // Notes (bottom-center, italic) - default text if no notes provided
    const notes = userInfo.notes && userInfo.notes.trim() !== ""
      ? userInfo.notes
      : "Created using The Kinetic Alphabet";
    ctx.font = `italic ${fontSize}px Georgia, serif`;
    ctx.textAlign = "center";
    ctx.fillText(notes, canvas.width / 2, yPosition);

    // Date (bottom-right, italic) - format: MM-DD-YYYY matches legacy
    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    ctx.textAlign = "right";
    ctx.fillText(dateStr, canvas.width - margin, yPosition);
  }

  /**
   * Render difficulty level badge with beautiful gradients
   */
  renderDifficultyBadge(
    canvas: HTMLCanvasElement,
    level: number,
    position: [number, number],
    size: number
  ): void {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const [x, y] = position;
    const radius = size / 2;
    const centerX = x + radius;
    const centerY = y + radius;

    // Create gradient based on difficulty level
    const gradient = this.createDifficultyGradient(
      ctx,
      centerX,
      centerY,
      radius,
      level
    );

    // Draw badge background with gradient
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw badge border
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw level text
    ctx.fillStyle = "#000000"; // Black text for better contrast on gradients
    ctx.font = `bold ${size * 0.6}px ${this.fallbackFontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(level.toString(), centerX, centerY);
  }

  /**
   * Calculate text dimensions for layout planning
   */
  measureText(
    text: string,
    fontFamily: string,
    fontSize: number,
    fontWeight?: string
  ): { width: number; height: number } {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return { width: 0, height: 0 };

    ctx.font = `${fontWeight || "normal"} ${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);

    return {
      width: metrics.width,
      height: fontSize, // Approximate height
    };
  }

  /**
   * Apply custom kerning to text
   */
  renderTextWithKerning(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    kerning: number
  ): void {
    if (kerning === 0) {
      ctx.fillText(text, x, y);
      return;
    }

    let currentX = x;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (!char) continue; // Skip if char is undefined
      ctx.fillText(char, currentX, y);

      const charWidth = ctx.measureText(char).width;
      currentX += charWidth + kerning;
    }
  }

  /**
   * Draw subtle background behind title text
   */
  private drawTitleBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    // Very subtle white background
    ctx.fillStyle = "rgba(235, 235, 235, 0.98)";
    ctx.fillRect(0, 0, width, height);

    // Very subtle bottom border
    ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height - 1);
    ctx.lineTo(width, height - 1);
    ctx.stroke();
  }

  /**
   * Create beautiful gradient for difficulty level badge
   * Based on legacy desktop gradient definitions
   */
  private createDifficultyGradient(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    level: number
  ): CanvasGradient {
    // Create radial gradient from center to edge
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius
    );

    if (level <= 2) {
      // Beginner - Light gray (solid color, matches desktop)
      gradient.addColorStop(0, "rgb(245, 245, 245)");
      gradient.addColorStop(1, "rgb(225, 225, 225)");
    } else if (level <= 4) {
      // Intermediate - Gray gradient (matches desktop)
      gradient.addColorStop(0, "rgb(180, 180, 180)");
      gradient.addColorStop(0.3, "rgb(170, 170, 170)");
      gradient.addColorStop(0.6, "rgb(120, 120, 120)");
      gradient.addColorStop(1, "rgb(110, 110, 110)");
    } else {
      // Advanced - Gold/brown gradient (matches desktop)
      gradient.addColorStop(0, "rgb(255, 215, 0)");
      gradient.addColorStop(0.2, "rgb(238, 201, 0)");
      gradient.addColorStop(0.4, "rgb(218, 165, 32)");
      gradient.addColorStop(0.6, "rgb(184, 134, 11)");
      gradient.addColorStop(0.8, "rgb(139, 69, 19)");
      gradient.addColorStop(1, "rgb(85, 107, 47)");
    }

    return gradient;
  }
}

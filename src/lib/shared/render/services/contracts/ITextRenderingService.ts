import type { TextRenderOptions, UserInfo } from "../../domain";
/**
 * Text rendering service for titles, user info, and overlays
 * Equivalent to desktop WordDrawer, UserInfoDrawer, DifficultyLevelDrawer
 */
export interface ITextRenderingService {
  /**
   * Render sequence word/title text at the top
   * @deprecated Use renderWordFooter for Explorer Gallery style
   */
  renderWordText(
    canvas: HTMLCanvasElement,
    word: string,
    options: TextRenderOptions,
    beatCount?: number
  ): void;

  /**
   * Render word in a footer at the bottom of the canvas
   * Uses Explorer Gallery style: color-coded gradient background based on difficulty level
   */
  renderWordFooter(
    canvas: HTMLCanvasElement,
    word: string,
    options: TextRenderOptions,
    footerHeight: number,
    difficultyLevel?: number
  ): void;

  /**
   * Render word in a header at the top of the canvas
   * Simple background with level badge indicator
   */
  renderWordHeader(
    canvas: HTMLCanvasElement,
    word: string,
    options: TextRenderOptions,
    headerHeight: number,
    difficultyLevel?: number
  ): void;

  /**
   * Render user information (name, date, notes)
   */
  renderUserInfo(
    canvas: HTMLCanvasElement,
    userInfo: UserInfo,
    options: TextRenderOptions
  ): void;

  /**
   * Render difficulty level badge
   */
  renderDifficultyBadge(
    canvas: HTMLCanvasElement,
    level: number,
    position: [number, number],
    size: number
  ): void;

  /**
   * Calculate text dimensions for layout planning
   */
  measureText(
    text: string,
    fontFamily: string,
    fontSize: number,
    fontWeight?: string
  ): { width: number; height: number };

  /**
   * Apply custom kerning to text
   */
  renderTextWithKerning(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    kerning: number
  ): void;
}

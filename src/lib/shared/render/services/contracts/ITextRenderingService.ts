import type { TextRenderOptions, UserInfo } from "../../domain";
/**
 * Text rendering service for titles, user info, and overlays
 * Equivalent to desktop WordDrawer, UserInfoDrawer, DifficultyLevelDrawer
 */
export interface ITextRenderingService {
  /**
   * Render sequence word/title text
   */
  renderWordText(
    canvas: HTMLCanvasElement,
    word: string,
    options: TextRenderOptions,
    beatCount?: number
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

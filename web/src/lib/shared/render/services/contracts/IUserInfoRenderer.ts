import type { TextRenderOptions, UserInfo } from "../../domain";

/**
 * User info rendering interface
 * Handles 3-column user information layout
 */
export interface IUserInfoRenderer {
  /**
   * Render user information (name, date, notes)
   */
  render(
    canvas: HTMLCanvasElement,
    userInfo: UserInfo,
    options: TextRenderOptions
  ): void;

  /**
   * Get recommended user info text settings
   */
  getRecommendedSettings(
    beatCount: number,
    beatScale: number
  ): {
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    italic: boolean;
  };
}

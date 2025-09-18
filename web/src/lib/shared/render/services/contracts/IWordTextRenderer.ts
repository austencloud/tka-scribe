import type { TextRenderOptions } from "../../domain";

/**
 * Word text rendering interface
 * Handles sequence word/title text with font scaling and kerning
 */
export interface IWordTextRenderer {
  /**
   * Render sequence word/title text
   */
  render(
    canvas: HTMLCanvasElement,
    word: string,
    options: TextRenderOptions
  ): void;

  /**
   * Get recommended word text settings
   */
  getRecommendedSettings(beatScale: number): {
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    italic: boolean;
  };
}

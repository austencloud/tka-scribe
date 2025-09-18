
/**
 * Difficulty badge rendering interface
 * Handles difficulty level badges with gradients
 */
export interface IDifficultyBadgeRenderer {
  /**
   * Render difficulty level badge
   */
  render(
    canvas: HTMLCanvasElement,
    level: number,
    position: [number, number],
    size: number
  ): void;

  /**
   * Get recommended difficulty badge settings
   */
  getRecommendedSettings(): {
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    italic: boolean;
  };
}
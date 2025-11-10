/**
 * Background Theme Calculator
 *
 * Calculates theme properties (luminance, contrast, appropriate glass morphism styles)
 * for background colors and gradients to ensure accessibility and visual consistency.
 */

/**
 * Calculate relative luminance of a color using WCAG formula
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function calculateLuminance(hex: string): number {
  // Remove # if present
  const color = hex.replace("#", "");

  // Parse RGB components
  const r = parseInt(color.substring(0, 2), 16) / 255;
  const g = parseInt(color.substring(2, 4), 16) / 255;
  const b = parseInt(color.substring(4, 6), 16) / 255;

  // Apply gamma correction
  const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // Calculate luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate average luminance for a gradient
 * For simplicity, we weight the first color more heavily (60%) since it's typically
 * the dominant color in diagonal gradients
 */
export function calculateGradientLuminance(colors: string[]): number {
  if (colors.length === 0) return 0;
  if (colors.length === 1 && colors[0]) return calculateLuminance(colors[0]);

  // Weight colors: first 50%, middle colors split 30%, last 20%
  const first = colors[0] ? calculateLuminance(colors[0]) * 0.5 : 0;
  const lastColor = colors[colors.length - 1];
  const last = lastColor ? calculateLuminance(lastColor) * 0.2 : 0;

  const middleColors = colors.slice(1, -1);
  const middle =
    middleColors.length > 0
      ? middleColors.reduce(
          (sum, color) => sum + calculateLuminance(color),
          0
        ) *
        (0.3 / middleColors.length)
      : 0;

  return first + middle + last;
}

/**
 * Determine theme mode based on luminance
 */
export type ThemeMode = "light" | "dark";

export function getThemeMode(luminance: number): ThemeMode {
  // Threshold at 0.4 - colors with luminance above this are considered "light"
  return luminance > 0.4 ? "light" : "dark";
}

/**
 * Generate CSS custom properties for glass morphism based on theme
 */
export interface GlassMorphismTheme {
  panelBg: string;
  panelBorder: string;
  panelHover: string;
  cardBg: string;
  cardBorder: string;
  cardHover: string;
  textPrimary: string;
  textSecondary: string;
  inputBg: string;
  inputBorder: string;
  inputFocus: string;
  buttonActive: string;
  backdropBlur: string;
}

/**
 * Generate theme-aware glass morphism styles
 */
export function generateGlassMorphismTheme(
  mode: ThemeMode,
  accentColor?: string
): GlassMorphismTheme {
  if (mode === "light") {
    // Light backgrounds need dark, semi-opaque overlays
    return {
      panelBg: "rgba(20, 10, 40, 0.85)",
      panelBorder: accentColor
        ? `rgba(${hexToRgb(accentColor)}, 0.3)`
        : "rgba(168, 85, 247, 0.3)",
      panelHover: "rgba(30, 15, 60, 0.9)",
      cardBg: "rgba(25, 15, 45, 0.88)",
      cardBorder: accentColor
        ? `rgba(${hexToRgb(accentColor)}, 0.35)`
        : "rgba(168, 85, 247, 0.35)",
      cardHover: "rgba(35, 20, 65, 0.92)",
      textPrimary: "#ffffff",
      textSecondary: "rgba(255, 255, 255, 0.85)",
      inputBg: "rgba(30, 20, 50, 0.75)",
      inputBorder: accentColor
        ? `rgba(${hexToRgb(accentColor)}, 0.4)`
        : "rgba(168, 85, 247, 0.4)",
      inputFocus: "rgba(40, 25, 70, 0.85)",
      buttonActive: "rgba(88, 28, 135, 0.75)",
      backdropBlur: "blur(20px)",
    };
  } else {
    // Dark backgrounds use standard light glass morphism
    return {
      panelBg: "rgba(255, 255, 255, 0.05)",
      panelBorder: "rgba(255, 255, 255, 0.1)",
      panelHover: "rgba(255, 255, 255, 0.08)",
      cardBg: "rgba(255, 255, 255, 0.05)",
      cardBorder: "rgba(255, 255, 255, 0.1)",
      cardHover: "rgba(255, 255, 255, 0.08)",
      textPrimary: "#ffffff",
      textSecondary: "rgba(255, 255, 255, 0.7)",
      inputBg: "rgba(255, 255, 255, 0.05)",
      inputBorder: "rgba(255, 255, 255, 0.1)",
      inputFocus: "rgba(255, 255, 255, 0.08)",
      buttonActive: "rgba(255, 255, 255, 0.15)",
      backdropBlur: "blur(20px)",
    };
  }
}

/**
 * Convert hex color to RGB string (for use in rgba())
 */
function hexToRgb(hex: string): string {
  const color = hex.replace("#", "");
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

/**
 * Get a suitable accent color from gradient colors
 * (typically the most vibrant middle or end color)
 */
export function extractAccentColor(colors: string[]): string | undefined {
  if (colors.length === 0) return undefined;
  if (colors.length === 1) return colors[0];

  // For 3-color gradients, use the middle color
  if (colors.length === 3) return colors[1];

  // For 2-color gradients, use the second color
  return colors[1];
}

/**
 * Background Theme Calculator
 *
 * Calculates theme properties (luminance, contrast, appropriate glass morphism styles)
 * for background colors and gradients to ensure accessibility and visual consistency.
 */

import { BackgroundType } from "$lib/shared/background/shared/domain/enums/background-enums";

/**
 * Theme colors for each background type
 * These represent the dominant visual palette for deriving UI accents
 */
export const BACKGROUND_THEME_COLORS: Record<BackgroundType, string[]> = {
  [BackgroundType.AURORA]: ["#064e3b", "#0d9488", "#06b6d4", "#a855f7"],
  [BackgroundType.SNOWFALL]: ["#1e3a5f", "#3b82f6", "#93c5fd"],
  [BackgroundType.NIGHT_SKY]: ["#1e1b4b", "#4338ca", "#818cf8"],
  [BackgroundType.DEEP_OCEAN]: ["#0c4a6e", "#0891b2", "#22d3ee"],
  [BackgroundType.EMBER_GLOW]: ["#7c2d12", "#ea580c", "#fb923c"],
  [BackgroundType.SAKURA_DRIFT]: ["#831843", "#db2777", "#f9a8d4"],
  [BackgroundType.SOLID_COLOR]: ["#18181b", "#3f3f46", "#71717a"],
  [BackgroundType.LINEAR_GRADIENT]: ["#0d1117", "#161b22", "#21262d"],
};

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
 * Matte (non-glass) theme tokens for 2026 bento style.
 */
export interface MatteTheme {
  panelBg: string;
  panelElevatedBg: string;
  cardBg: string;
  cardHoverBg: string;
  accent: string;
  accentStrong: string;
  stroke: string;
  strokeStrong: string;
  text: string;
  textDim: string;
  shadow: string;
  panelShadow: string;
}

function fallbackAccent(mode: ThemeMode, accentColor?: string): string {
  if (accentColor) return accentColor;
  return mode === "light" ? "#2563eb" : "#38bdf8";
}

export function generateMatteTheme(
  mode: ThemeMode,
  accentColor?: string
): MatteTheme {
  const accent = fallbackAccent(mode, accentColor);
  if (mode === "light") {
    return {
      panelBg: "#f5f7fb",
      panelElevatedBg: "#ffffff",
      cardBg: "#ffffff",
      cardHoverBg: "#f3f6fb",
      accent,
      accentStrong: accent,
      stroke: "rgba(15, 23, 42, 0.08)",
      strokeStrong: "rgba(15, 23, 42, 0.14)",
      text: "#0f172a",
      textDim: "rgba(15, 23, 42, 0.7)",
      shadow: "0 12px 28px rgba(15, 23, 42, 0.12)",
      panelShadow: "0 12px 28px rgba(15, 23, 42, 0.12)",
    };
  }

  return {
    panelBg: "#0b1021",
    panelElevatedBg: "#0d1324",
    cardBg: "#0f172a",
    cardHoverBg: "#131c33",
    accent,
    accentStrong: mode === "dark" ? "#34d399" : accent,
    stroke: "rgba(255, 255, 255, 0.08)",
    strokeStrong: "rgba(255, 255, 255, 0.14)",
    text: "rgba(255, 255, 255, 0.92)",
    textDim: "rgba(255, 255, 255, 0.65)",
    shadow: "0 14px 36px rgba(0, 0, 0, 0.4)",
    panelShadow: "0 12px 28px rgba(0, 0, 0, 0.35)",
  };
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

/**
 * Apply theme CSS variables to document root based on colors
 * Can be called with solid color OR gradient/theme colors
 */
export function applyThemeFromColors(
  solidColor?: string,
  gradientColors?: string[]
): void {
  if (typeof document === "undefined") return;

  // Calculate luminance
  const luminance = solidColor
    ? calculateLuminance(solidColor)
    : gradientColors
      ? calculateGradientLuminance(gradientColors)
      : 0;

  // Determine theme mode
  const mode = getThemeMode(luminance);

  // Extract accent color
  const accentColor = gradientColors
    ? extractAccentColor(gradientColors)
    : solidColor;

  // Generate themes
  const theme = generateGlassMorphismTheme(mode, accentColor);
  const matteTheme = generateMatteTheme(mode, accentColor);

  // Apply to document root
  const root = document.documentElement;

  // Legacy glass variables
  root.style.setProperty("--panel-bg-current", theme.panelBg);
  root.style.setProperty("--panel-border-current", theme.panelBorder);
  root.style.setProperty("--panel-hover-current", theme.panelHover);
  root.style.setProperty("--card-bg-current", theme.cardBg);
  root.style.setProperty("--card-border-current", theme.cardBorder);
  root.style.setProperty("--card-hover-current", theme.cardHover);
  root.style.setProperty("--text-primary-current", theme.textPrimary);
  root.style.setProperty("--text-secondary-current", theme.textSecondary);
  root.style.setProperty("--input-bg-current", theme.inputBg);
  root.style.setProperty("--input-border-current", theme.inputBorder);
  root.style.setProperty("--input-focus-current", theme.inputFocus);
  root.style.setProperty("--button-active-current", theme.buttonActive);
  root.style.setProperty("--glass-backdrop", theme.backdropBlur);

  // Matte 2026 bento theme variables
  root.style.setProperty("--theme-panel-bg", matteTheme.panelBg);
  root.style.setProperty("--theme-panel-elevated-bg", matteTheme.panelElevatedBg);
  root.style.setProperty("--theme-card-bg", matteTheme.cardBg);
  root.style.setProperty("--theme-card-hover-bg", matteTheme.cardHoverBg);
  root.style.setProperty("--theme-accent", matteTheme.accent);
  root.style.setProperty("--theme-accent-strong", matteTheme.accentStrong);
  root.style.setProperty("--theme-stroke", matteTheme.stroke);
  root.style.setProperty("--theme-stroke-strong", matteTheme.strokeStrong);
  root.style.setProperty("--theme-text", matteTheme.text);
  root.style.setProperty("--theme-text-dim", matteTheme.textDim);
  root.style.setProperty("--theme-shadow", matteTheme.shadow);
  root.style.setProperty("--theme-panel-shadow", matteTheme.panelShadow);
}

/**
 * Apply theme based on BackgroundType
 * Convenience function that looks up theme colors and applies them
 */
export function applyThemeForBackground(backgroundType: BackgroundType): void {
  const themeColors = BACKGROUND_THEME_COLORS[backgroundType];
  if (themeColors) {
    applyThemeFromColors(undefined, themeColors);
  }
}

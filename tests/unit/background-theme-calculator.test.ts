import { describe, it, expect } from "vitest";
import {
  calculateLuminance,
  calculateGradientLuminance,
  getThemeMode,
  generateGlassMorphismTheme,
  extractAccentColor,
} from "$lib/shared/settings/utils/background-theme-calculator";

describe("Background Theme Calculator", () => {
  describe("calculateLuminance", () => {
    it("should calculate luminance for pure black", () => {
      const luminance = calculateLuminance("#000000");
      expect(luminance).toBe(0);
    });

    it("should calculate luminance for pure white", () => {
      const luminance = calculateLuminance("#ffffff");
      expect(luminance).toBeCloseTo(1, 2);
    });

    it("should calculate luminance for deep violet (dark)", () => {
      const luminance = calculateLuminance("#4c1d95");
      expect(luminance).toBeLessThan(0.4); // Should be dark theme
    });

    it("should calculate luminance for bright cyan (light)", () => {
      const luminance = calculateLuminance("#22d3ee");
      expect(luminance).toBeGreaterThan(0.4); // Should be light theme
    });

    it("should handle colors with # prefix", () => {
      const with_hash = calculateLuminance("#667eea");
      const without_hash = calculateLuminance("667eea");
      expect(with_hash).toBe(without_hash);
    });
  });

  describe("calculateGradientLuminance", () => {
    it("should return 0 for empty array", () => {
      const luminance = calculateGradientLuminance([]);
      expect(luminance).toBe(0);
    });

    it("should handle single color gradient", () => {
      const luminance = calculateGradientLuminance(["#4c1d95"]);
      expect(luminance).toBeCloseTo(calculateLuminance("#4c1d95"), 5);
    });

    it("should weight first color heavily (50%)", () => {
      // Pure black to pure white gradient should be weighted toward black
      const luminance = calculateGradientLuminance(["#000000", "#ffffff"]);
      expect(luminance).toBeLessThan(0.5); // Should be < 0.5 due to 50% weight on black
    });

    it("should calculate Twilight gradient as dark", () => {
      const luminance = calculateGradientLuminance([
        "#4c1d95",
        "#7c3aed",
        "#c084fc",
      ]);
      expect(luminance).toBeLessThan(0.4); // Dark background
    });

    it("should calculate Ocean gradient as dark", () => {
      const luminance = calculateGradientLuminance([
        "#0c4a6e",
        "#0891b2",
        "#22d3ee",
      ]);
      expect(luminance).toBeLessThan(0.4); // Dark background
    });

    it("should handle 3-color gradient weighting correctly", () => {
      // First 50%, middle 30%, last 20%
      const colors = ["#000000", "#808080", "#ffffff"];
      const luminance = calculateGradientLuminance(colors);

      // Calculate expected: 0*0.5 + 0.22*0.3 + 1.0*0.2 = 0.266
      expect(luminance).toBeCloseTo(0.266, 1);
    });
  });

  describe("getThemeMode", () => {
    it("should return dark for low luminance", () => {
      expect(getThemeMode(0.1)).toBe("dark");
      expect(getThemeMode(0.2)).toBe("dark");
      expect(getThemeMode(0.3)).toBe("dark");
    });

    it("should return light for high luminance", () => {
      expect(getThemeMode(0.5)).toBe("light");
      expect(getThemeMode(0.7)).toBe("light");
      expect(getThemeMode(0.9)).toBe("light");
    });

    it("should use 0.4 as threshold", () => {
      expect(getThemeMode(0.4)).toBe("dark"); // Exactly 0.4 is dark
      expect(getThemeMode(0.41)).toBe("light"); // Just above is light
      expect(getThemeMode(0.39)).toBe("dark"); // Just below is dark
    });
  });

  describe("generateGlassMorphismTheme", () => {
    it("should generate dark theme styles", () => {
      const theme = generateGlassMorphismTheme("dark");

      expect(theme.panelBg).toContain("rgba(255, 255, 255");
      expect(theme.textPrimary).toBe("#ffffff");
      expect(theme.backdropBlur).toContain("blur");
    });

    it("should generate light theme styles", () => {
      const theme = generateGlassMorphismTheme("light");

      expect(theme.panelBg).toContain("rgba(20, 10, 40"); // Dark overlay
      expect(theme.textPrimary).toBe("#ffffff"); // White text on dark overlay
      expect(theme.backdropBlur).toContain("blur");
    });

    it("should use accent color for light theme borders", () => {
      const theme = generateGlassMorphismTheme("light", "#7c3aed");

      expect(theme.panelBorder).toContain("124, 58, 237"); // RGB of #7c3aed
    });

    it("should provide all required theme properties", () => {
      const theme = generateGlassMorphismTheme("dark");

      expect(theme).toHaveProperty("panelBg");
      expect(theme).toHaveProperty("panelBorder");
      expect(theme).toHaveProperty("panelHover");
      expect(theme).toHaveProperty("cardBg");
      expect(theme).toHaveProperty("cardBorder");
      expect(theme).toHaveProperty("cardHover");
      expect(theme).toHaveProperty("textPrimary");
      expect(theme).toHaveProperty("textSecondary");
      expect(theme).toHaveProperty("inputBg");
      expect(theme).toHaveProperty("inputBorder");
      expect(theme).toHaveProperty("inputFocus");
      expect(theme).toHaveProperty("buttonActive");
      expect(theme).toHaveProperty("backdropBlur");
    });
  });

  describe("extractAccentColor", () => {
    it("should return undefined for empty array", () => {
      expect(extractAccentColor([])).toBeUndefined();
    });

    it("should return single color for single-color array", () => {
      expect(extractAccentColor(["#667eea"])).toBe("#667eea");
    });

    it("should return second color for 2-color gradient", () => {
      expect(extractAccentColor(["#000000", "#667eea"])).toBe("#667eea");
    });

    it("should return middle color for 3-color gradient", () => {
      expect(extractAccentColor(["#4c1d95", "#7c3aed", "#c084fc"])).toBe(
        "#7c3aed"
      );
    });
  });

  describe("Integration - Preset Gradients", () => {
    const presets = [
      {
        name: "Twilight",
        colors: ["#4c1d95", "#7c3aed", "#c084fc"],
        expectedMode: "dark",
      },
      {
        name: "Ocean",
        colors: ["#0c4a6e", "#0891b2", "#22d3ee"],
        expectedMode: "dark",
      },
      {
        name: "Sunset",
        colors: ["#7f1d1d", "#dc2626", "#fb923c"],
        expectedMode: "dark",
      },
      {
        name: "Forest",
        colors: ["#14532d", "#059669", "#34d399"],
        expectedMode: "dark",
      },
      {
        name: "Royal",
        colors: ["#1e3a8a", "#3b82f6", "#818cf8"],
        expectedMode: "dark",
      },
      {
        name: "Midnight",
        colors: ["#0f172a", "#1e293b", "#475569"],
        expectedMode: "dark",
      },
    ];

    it.each(presets)(
      "should correctly theme $name gradient",
      ({ name, colors, expectedMode }) => {
        const luminance = calculateGradientLuminance(colors);
        const mode = getThemeMode(luminance);
        const theme = generateGlassMorphismTheme(mode);

        expect(mode).toBe(expectedMode);
        expect(theme).toBeDefined();
        expect(theme.textPrimary).toBe("#ffffff"); // All presets should have white text
      }
    );
  });

  describe("Integration - Solid Colors", () => {
    it("should theme pure black correctly", () => {
      const luminance = calculateLuminance("#000000");
      const mode = getThemeMode(luminance);
      const theme = generateGlassMorphismTheme(mode);

      expect(mode).toBe("dark");
      expect(theme.panelBg).toContain("255, 255, 255"); // Light glass on dark
    });

    it("should theme charcoal correctly", () => {
      const luminance = calculateLuminance("#18181b");
      const mode = getThemeMode(luminance);
      const theme = generateGlassMorphismTheme(mode);

      expect(mode).toBe("dark");
      expect(theme.textPrimary).toBe("#ffffff");
    });
  });
});

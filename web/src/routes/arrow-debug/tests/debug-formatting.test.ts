import { describe, it, expect } from "vitest";
import {
  formatCoordinate,
  formatPoint,
  formatTimestamp,
} from "../utils/debug-formatting.js";

describe("Debug Formatting Utilities", () => {
  describe("formatCoordinate", () => {
    it("should format valid numbers with 2 decimal places", () => {
      expect(formatCoordinate(123.456)).toBe("123.46");
      expect(formatCoordinate(0)).toBe("0.00");
      expect(formatCoordinate(-45.678)).toBe("-45.68");
    });

    it("should handle undefined and null values", () => {
      expect(formatCoordinate(undefined)).toBe("N/A");
      expect(formatCoordinate(null as unknown as number)).toBe("N/A");
    });

    it("should handle edge cases", () => {
      expect(formatCoordinate(0.001)).toBe("0.00");
      expect(formatCoordinate(999.999)).toBe("1000.00");
    });
  });

  describe("formatPoint", () => {
    it("should format point with numeric properties", () => {
      const point = { x: 10.123, y: 20.456 };
      expect(formatPoint(point)).toBe("(10.12, 20.46)");
    });

    it("should format point with function properties", () => {
      const point = {
        x: () => 15.789,
        y: () => 25.123,
      };
      expect(formatPoint(point)).toBe("(15.79, 25.12)");
    });

    it("should handle null and undefined points", () => {
      expect(formatPoint(null)).toBe("N/A");
      expect(formatPoint(undefined)).toBe("N/A");
    });

    it("should handle zero coordinates", () => {
      const point = { x: 0, y: 0 };
      expect(formatPoint(point)).toBe("(0.00, 0.00)");
    });

    it("should handle negative coordinates", () => {
      const point = { x: -10.5, y: -20.7 };
      expect(formatPoint(point)).toBe("(-10.50, -20.70)");
    });
  });

  describe("formatTimestamp", () => {
    it("should format timestamp to locale time string", () => {
      const timestamp = new Date("2023-01-01T12:30:45").getTime();
      const result = formatTimestamp(timestamp);

      // Should return a time string (format varies by locale)
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });

    it("should handle different timestamps", () => {
      const morning = new Date("2023-01-01T09:15:30").getTime();
      const evening = new Date("2023-01-01T21:45:15").getTime();

      expect(formatTimestamp(morning)).toBeTruthy();
      expect(formatTimestamp(evening)).toBeTruthy();
    });
  });
});

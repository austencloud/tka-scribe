import { describe, it, expect } from "vitest";

// Simple smoke tests for the refactored components
describe("Arrow Debug Components Refactoring", () => {
  it("should successfully extract utility functions", async () => {
    const { formatCoordinate, formatPoint, formatTimestamp } = await import(
      "../utils/debug-formatting.js"
    );

    expect(formatCoordinate).toBeDefined();
    expect(formatPoint).toBeDefined();
    expect(formatTimestamp).toBeDefined();

    // Test basic functionality
    expect(formatCoordinate(123.456)).toBe("123.46");
    expect(formatPoint(null)).toBe("N/A");
    expect(typeof formatTimestamp(Date.now())).toBe("string");
  });

  it("should successfully extract step utilities", async () => {
    const { getStepStatus } = await import("../utils/debug-step-utils.js");

    expect(getStepStatus).toBeDefined();
    expect(getStepStatus(1, 3)).toBe("completed");
    expect(getStepStatus(3, 3)).toBe("current");
    expect(getStepStatus(5, 3)).toBe("pending");
  });

  it("should have extracted all step components", async () => {
    // Test that all components can be imported
    const locationStep = await import(
      "../components/steps/LocationCalculationStep.svelte"
    );
    const initialPositionStep = await import(
      "../components/steps/InitialPositionStep.svelte"
    );
    const defaultAdjustmentStep = await import(
      "../components/steps/DefaultAdjustmentStep.svelte"
    );
    const specialAdjustmentStep = await import(
      "../components/steps/SpecialAdjustmentStep.svelte"
    );
    const finalResultStep = await import(
      "../components/steps/FinalResultStep.svelte"
    );

    expect(locationStep.default).toBeDefined();
    expect(initialPositionStep.default).toBeDefined();
    expect(defaultAdjustmentStep.default).toBeDefined();
    expect(specialAdjustmentStep.default).toBeDefined();
    expect(finalResultStep.default).toBeDefined();
  });

  it("should have extracted section components", async () => {
    const calculationStatusSection = await import(
      "../components/sections/CalculationStatusSection.svelte"
    );
    const debugSection = await import(
      "../components/shared/DebugSection.svelte"
    );

    expect(calculationStatusSection.default).toBeDefined();
    expect(debugSection.default).toBeDefined();
  });

  it("should have the clean main component", async () => {
    const cleanComponent = await import("../ArrowDebugInfoPanel.svelte");

    expect(cleanComponent.default).toBeDefined();
  });
});

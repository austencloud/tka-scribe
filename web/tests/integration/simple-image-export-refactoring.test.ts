/**
 * Simple Image Export Refactoring Test
 *
 * Basic test to verify the refactored services can be resolved from DI container.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { createWebApplication } from "$lib/services/bootstrap";
import type { ServiceContainer } from "$lib/services/di/ServiceContainer";

// Import service interface tokens for the new refactored services
import {
  IExportConfigurationManagerInterface,
  IExportMemoryCalculatorInterface,
  IExportOptionsValidatorInterface,
  IFilenameGeneratorServiceInterface,
  IImagePreviewGeneratorInterface,
  ITKAImageExportOrchestratorInterface,
  ITKAImageExportServiceInterface,
} from "$lib/services/di/interfaces/image-export-interfaces";

describe("Image Export Monolith Refactoring - Basic DI Test", () => {
  let container: ServiceContainer;

  beforeEach(async () => {
    container = await createWebApplication();
  });

  it("should successfully resolve all new refactored services", async () => {
    // Test that all new focused services can be resolved
    const configManager = container.resolve(
      IExportConfigurationManagerInterface
    );
    const memoryCalculator = container.resolve(
      IExportMemoryCalculatorInterface
    );
    const validator = container.resolve(IExportOptionsValidatorInterface);
    const filenameGenerator = container.resolve(
      IFilenameGeneratorServiceInterface
    );
    const previewGenerator = container.resolve(IImagePreviewGeneratorInterface);
    const orchestrator = container.resolve(
      ITKAImageExportOrchestratorInterface
    );

    // All should be defined (DI working)
    expect(configManager).toBeDefined();
    expect(memoryCalculator).toBeDefined();
    expect(validator).toBeDefined();
    expect(filenameGenerator).toBeDefined();
    expect(previewGenerator).toBeDefined();
    expect(orchestrator).toBeDefined();
  });

  it("should resolve main TKA export service via orchestrator", async () => {
    const mainService = container.resolve(ITKAImageExportServiceInterface);
    expect(mainService).toBeDefined();

    // Should have all the original monolith's methods
    expect(typeof mainService.exportSequenceImage).toBe("function");
    expect(typeof mainService.generatePreview).toBe("function");
    expect(typeof mainService.exportAndDownload).toBe("function");
    expect(typeof mainService.batchExport).toBe("function");
    expect(typeof mainService.validateExport).toBe("function");
  });

  it("should demonstrate that monolith has been broken down into focused services", async () => {
    // Each service should have its specific responsibility
    const configManager = container.resolve(
      IExportConfigurationManagerInterface
    );
    const memoryCalculator = container.resolve(
      IExportMemoryCalculatorInterface
    );
    const validator = container.resolve(IExportOptionsValidatorInterface);

    // Configuration service - focused on options management
    expect(typeof configManager.getDefaultOptions).toBe("function");
    expect(typeof configManager.mergeWithDefaults).toBe("function");
    expect(typeof configManager.createPreviewOptions).toBe("function");

    // Memory calculator - focused on resource estimation
    expect(typeof memoryCalculator.estimateMemoryUsage).toBe("function");
    expect(typeof memoryCalculator.isWithinMemoryLimits).toBe("function");

    // Validator - focused on data validation
    expect(typeof validator.validateExport).toBe("function");
    expect(typeof validator.validateOptions).toBe("function");
    expect(typeof validator.validateSequence).toBe("function");

    // Services should NOT have methods outside their responsibility
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((configManager as any).estimateMemoryUsage).toBeUndefined();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((memoryCalculator as any).validateExport).toBeUndefined();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((validator as any).getDefaultOptions).toBeUndefined();
  });

  it("should maintain backward compatibility", async () => {
    // The main service should still provide all original functionality
    const exportService = container.resolve(ITKAImageExportServiceInterface);

    const originalMethods = [
      "exportSequenceImage",
      "generatePreview",
      "exportAndDownload",
      "batchExport",
      "validateExport",
    ];

    originalMethods.forEach((method) => {
      expect(exportService).toHaveProperty(method);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(typeof (exportService as any)[method]).toBe("function");
    });
  });
});

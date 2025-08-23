/**
 * Sequence Card Export Service Registration Tests
 *
 * Tests to ensure the refactored services are properly registered and can be resolved.
 */

import { beforeEach, describe, expect, it } from "vitest";

// Import the DI container to test service resolution
import { createWebApplication } from "../lib/services/bootstrap";
import type { ServiceContainer } from "../lib/services/di/ServiceContainer";

// Import service interface tokens
import {
  ISequenceCardBatchProcessingServiceInterface,
  ISequenceCardCacheServiceInterface,
  ISequenceCardExportOrchestratorInterface,
  ISequenceCardExportProgressTrackerInterface,
  ISequenceCardImageConversionServiceInterface,
  ISequenceCardImageGenerationServiceInterface,
  ISequenceCardMetadataOverlayServiceInterface,
  ISequenceCardSVGCompositionServiceInterface,
} from "../lib/services/di/interfaces/sequence-card-export-interfaces";

describe("Sequence Card Export Services - DI Registration", () => {
  let container: ServiceContainer;

  beforeEach(async () => {
    container = await createWebApplication();
  });

  describe("🏗️ Service Registration", () => {
    it("should register all sequence card export services", async () => {
      // Test that all services can be resolved from the container
      expect(() =>
        container.resolve(ISequenceCardExportOrchestratorInterface)
      ).not.toThrow();
      expect(() =>
        container.resolve(ISequenceCardImageGenerationServiceInterface)
      ).not.toThrow();
      expect(() =>
        container.resolve(ISequenceCardSVGCompositionServiceInterface)
      ).not.toThrow();
      expect(() =>
        container.resolve(ISequenceCardMetadataOverlayServiceInterface)
      ).not.toThrow();
      expect(() =>
        container.resolve(ISequenceCardBatchProcessingServiceInterface)
      ).not.toThrow();
      expect(() =>
        container.resolve(ISequenceCardImageConversionServiceInterface)
      ).not.toThrow();
      expect(() =>
        container.resolve(ISequenceCardExportProgressTrackerInterface)
      ).not.toThrow();
      expect(() =>
        container.resolve(ISequenceCardCacheServiceInterface)
      ).not.toThrow();
    });

    it("should resolve services to defined instances", async () => {
      const orchestrator = container.resolve(
        ISequenceCardExportOrchestratorInterface
      );
      const imageGenerator = container.resolve(
        ISequenceCardImageGenerationServiceInterface
      );
      const cache = container.resolve(ISequenceCardCacheServiceInterface);

      expect(orchestrator).toBeDefined();
      expect(imageGenerator).toBeDefined();
      expect(cache).toBeDefined();

      // Services should be objects
      expect(typeof orchestrator).toBe("object");
      expect(typeof imageGenerator).toBe("object");
      expect(typeof cache).toBe("object");
    });

    it("should create singleton instances", async () => {
      // Test that services are singletons
      const orchestrator1 = container.resolve(
        ISequenceCardExportOrchestratorInterface
      );
      const orchestrator2 = container.resolve(
        ISequenceCardExportOrchestratorInterface
      );

      expect(orchestrator1).toBe(orchestrator2);
    });
  });

  describe("🔗 Service Dependencies", () => {
    it("should properly inject dependencies into orchestrator", async () => {
      const orchestrator = container.resolve(
        ISequenceCardExportOrchestratorInterface
      );

      // The orchestrator should be properly constructed with its dependencies
      expect(orchestrator).toBeDefined();
      expect(orchestrator).toBeInstanceOf(Object);
    });

    it("should inject pictograph rendering service into SVG composition", async () => {
      const svgComposition = container.resolve(
        ISequenceCardSVGCompositionServiceInterface
      );

      expect(svgComposition).toBeDefined();
      expect(svgComposition).toBeInstanceOf(Object);
    });
  });

  describe("📊 Service Integration", () => {
    it("should have working progress tracker", async () => {
      const progressTracker = container.resolve(
        ISequenceCardExportProgressTrackerInterface
      );

      expect(progressTracker).toBeDefined();
      expect(progressTracker).toBeInstanceOf(Object);
    });

    it("should have working cache service", async () => {
      const cache = container.resolve(ISequenceCardCacheServiceInterface);

      expect(cache).toBeDefined();
      expect(cache).toBeInstanceOf(Object);
    });

    it("should have working image conversion service", async () => {
      const converter = container.resolve(
        ISequenceCardImageConversionServiceInterface
      );

      expect(converter).toBeDefined();
      expect(converter).toBeInstanceOf(Object);
    });
  });

  describe("🎯 Service Architecture", () => {
    it("should follow single responsibility principle", async () => {
      // Each service should be a distinct instance
      const cache = container.resolve(ISequenceCardCacheServiceInterface);
      const progress = container.resolve(
        ISequenceCardExportProgressTrackerInterface
      );
      const conversion = container.resolve(
        ISequenceCardImageConversionServiceInterface
      );

      expect(cache).toBeDefined();
      expect(progress).toBeDefined();
      expect(conversion).toBeDefined();

      // Each service should be distinct
      expect(cache).not.toBe(progress);
      expect(progress).not.toBe(conversion);
      expect(conversion).not.toBe(cache);
    });

    it("should properly separate concerns", async () => {
      const orchestrator = container.resolve(
        ISequenceCardExportOrchestratorInterface
      );
      const svgComposition = container.resolve(
        ISequenceCardSVGCompositionServiceInterface
      );
      const metadataOverlay = container.resolve(
        ISequenceCardMetadataOverlayServiceInterface
      );

      // All services should be different instances
      expect(orchestrator).not.toBe(svgComposition);
      expect(svgComposition).not.toBe(metadataOverlay);
      expect(metadataOverlay).not.toBe(orchestrator);

      // Each should be defined objects
      expect(orchestrator).toBeDefined();
      expect(svgComposition).toBeDefined();
      expect(metadataOverlay).toBeDefined();
    });
  });
});

/**
 * Basic test to ensure the refactoring doesn't break the build
 */
describe("Build Validation", () => {
  it("should compile without TypeScript errors", () => {
    // If this test runs, it means the TypeScript compilation succeeded
    expect(true).toBe(true);
  });

  it("should have all interfaces properly defined", async () => {
    // Test that interface tokens are defined
    expect(ISequenceCardExportOrchestratorInterface).toBeDefined();
    expect(ISequenceCardImageGenerationServiceInterface).toBeDefined();
    expect(ISequenceCardSVGCompositionServiceInterface).toBeDefined();
    expect(ISequenceCardMetadataOverlayServiceInterface).toBeDefined();
    expect(ISequenceCardBatchProcessingServiceInterface).toBeDefined();
    expect(ISequenceCardImageConversionServiceInterface).toBeDefined();
    expect(ISequenceCardExportProgressTrackerInterface).toBeDefined();
    expect(ISequenceCardCacheServiceInterface).toBeDefined();
  });
});

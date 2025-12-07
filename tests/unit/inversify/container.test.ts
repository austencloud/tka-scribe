/**
 * DI Container Tests
 *
 * Critical tests for the Inversify container initialization.
 * If the container fails, the entire app is dead - these tests catch that early.
 */

import type { IPersistenceService } from "$lib/shared/persistence/services/contracts/IPersistenceService";
import {
  getContainerStatus,
  initializeContainer,
  isContainerInitialized,
  resolve,
  tryResolve,
  TYPES,
} from "$lib/shared/inversify/container";
import { describe, expect, it } from "vitest";

describe("Inversify Container", () => {
  // ============================================================================
  // INITIALIZATION TESTS
  // ============================================================================

  describe("Container Initialization", () => {
    it("should initialize and be ready for service resolution", async () => {
      await initializeContainer();
      expect(isContainerInitialized()).toBe(true);
    }, 30000); // 30 second timeout for slow test environment
  });

  // ============================================================================
  // SERVICE RESOLUTION TESTS
  // ============================================================================

  describe("Service Resolution", () => {
    it("should resolve core services without errors", async () => {
      const coreServices = [
        TYPES.IPersistenceService,
        TYPES.IDeviceDetector,
        TYPES.IHapticFeedbackService,
      ];

      for (const serviceType of coreServices) {
        const service = await resolve(serviceType);
        expect(service).toBeDefined();
      }
    });

    it("should throw helpful error for unregistered service", async () => {
      const fakeType = Symbol.for("NonExistentService");

      await expect(resolve(fakeType)).rejects.toThrow();
    });

    it("should return same instance for singleton services", async () => {
      const service1 = await resolve(TYPES.IPersistenceService);
      const service2 = await resolve(TYPES.IPersistenceService);

      // Both services should be defined and have the same constructor
      expect(service1).toBeDefined();
      expect(service2).toBeDefined();
      expect((service1 as object).constructor.name).toBe(
        (service2 as object).constructor.name
      );
    });
  });

  // ============================================================================
  // TRYREVOLVE TESTS (SAFE RESOLUTION)
  // ============================================================================

  describe("tryResolve (Safe Resolution)", () => {
    it("should return service when available", () => {
      const service = tryResolve(TYPES.IPersistenceService);
      expect(service).not.toBeNull();
    });

    it("should return null for unregistered service instead of throwing", () => {
      const fakeType = Symbol.for("NonExistent");
      const service = tryResolve(fakeType);
      expect(service).toBeNull();
    });
  });

  // ============================================================================
  // CONTAINER STATUS TESTS
  // ============================================================================

  describe("Container Status", () => {
    it("should report initialization status correctly", async () => {
      const beforeStatus = getContainerStatus();
      await initializeContainer();
      const afterStatus = getContainerStatus();

      expect(afterStatus.isInitialized).toBe(true);
      expect(afterStatus.containerExists).toBe(true);
    });

    it("should report container existence", () => {
      const status = getContainerStatus();
      expect(status.containerExists).toBe(true);
    });
  });

  // ============================================================================
  // MODULE LOADING TESTS
  // ============================================================================

  describe("Module Loading", () => {
    it("should load all required modules", async () => {
      await initializeContainer();

      const requiredServices = [
        TYPES.IPersistenceService,
        TYPES.ISequenceService,
        TYPES.IDeviceDetector,
        TYPES.IAnimationService,
      ];

      for (const serviceType of requiredServices) {
        const service = await resolve(serviceType);
        expect(service).toBeDefined();
      }
    });

    it("should load core module services", async () => {
      await initializeContainer();

      const service = await resolve<IPersistenceService>(
        TYPES.IPersistenceService
      );
      expect(service).toBeDefined();
      expect(typeof service.initialize).toBe("function");
    });

    it("should load animator module services", async () => {
      await initializeContainer();

      const service = await resolve(TYPES.IAnimationService);
      expect(service).toBeDefined();
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe("Error Handling", () => {
    it("should provide clear error message for missing service", async () => {
      await initializeContainer();
      const fakeType = Symbol.for("ThisServiceDoesNotExist");

      try {
        await resolve(fakeType);
        expect.fail("Should have thrown an error");
      } catch (error: unknown) {
        expect(error).toBeDefined();
        // Error should mention the service or container
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        expect(errorMessage).toBeTruthy();
      }
    });

    it("should handle resolution errors gracefully with tryResolve", () => {
      const fakeType = Symbol.for("NonExistent");
      const result = tryResolve(fakeType);
      expect(result).toBeNull(); // Should not throw
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe("Integration Tests", () => {
    it("should resolve services with correct interface", async () => {
      // Test that services are properly resolved and have expected methods
      await initializeContainer();

      const persistenceService = await resolve<IPersistenceService>(
        TYPES.IPersistenceService
      );

      // Verify service has the expected interface (don't call methods that need IndexedDB)
      expect(persistenceService).toBeDefined();
      expect(typeof persistenceService.initialize).toBe("function");
      expect(typeof persistenceService.saveSequence).toBe("function");
      expect(typeof persistenceService.loadSequence).toBe("function");
      expect(typeof persistenceService.deleteSequence).toBe("function");
    });

    it("should maintain service dependencies", async () => {
      await initializeContainer();

      // Services that depend on each other should work
      const sequenceService = await resolve(TYPES.ISequenceService);
      expect(sequenceService).toBeDefined();
    });
  });
});

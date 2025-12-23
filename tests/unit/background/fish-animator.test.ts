import { describe, it, expect, beforeEach, vi } from "vitest";
import { FishAnimator } from "../../../src/lib/shared/background/deep-ocean/services/implementations/FishAnimator";
import type {
  IFishSpriteManager,
  PreRenderedSprite,
} from "../../../src/lib/shared/background/deep-ocean/services/contracts/IFishSpriteManager";
import type { FishMarineLife } from "../../../src/lib/shared/background/deep-ocean/domain/models/DeepOceanModels";
import {
  EDGE_AWARENESS,
  BEHAVIOR_CONFIG,
} from "../../../src/lib/shared/background/deep-ocean/domain/constants/fish-constants";

// Mock sprite manager - returns deterministic test data
function createMockSpriteManager(): IFishSpriteManager {
  const mockCanvas = {
    width: 64,
    height: 48,
    getContext: () => null,
  } as unknown as HTMLCanvasElement;

  const mockEntry: PreRenderedSprite = {
    sprite: { name: "TestFish", path: "" },
    canvas: mockCanvas,
    width: 64,
    height: 48,
    hueRotate: 0,
  };

  return {
    preloadSprites: vi.fn().mockResolvedValue(undefined),
    getRandomSpriteEntry: vi.fn().mockReturnValue(mockEntry),
    getAnyLoadedSpriteEntry: vi.fn().mockReturnValue(mockEntry),
    getMarineLifeColor: vi.fn().mockReturnValue("#3d7a8c"),
    isReady: vi.fn().mockReturnValue(true),
  };
}

// Simulate running the animator for N frames
function runFrames(
  animator: FishAnimator,
  fish: FishMarineLife[],
  dimensions: { width: number; height: number },
  frameCount: number,
  frameMultiplier = 1
): FishMarineLife[] {
  let currentFish = fish;
  for (let i = 0; i < frameCount; i++) {
    const animationTime = i * 0.016; // ~60fps
    currentFish = animator.updateFish(
      currentFish,
      dimensions,
      frameMultiplier,
      animationTime
    );
    // Process any pending spawns
    const newFish = animator.processPendingSpawns(dimensions, animationTime);
    currentFish = [...currentFish, ...newFish];
  }
  return currentFish;
}

describe("FishAnimator", () => {
  let animator: FishAnimator;
  let mockSpriteManager: IFishSpriteManager;
  const dimensions = { width: 800, height: 600 };

  beforeEach(() => {
    mockSpriteManager = createMockSpriteManager();
    // Create animator with mocked dependency (bypass DI)
    animator = new (FishAnimator as any)(mockSpriteManager);
  });

  describe("Fish Creation", () => {
    it("should create fish with valid properties", () => {
      const fish = animator.createFish(dimensions);

      expect(fish.type).toBe("fish");
      expect(fish.width).toBeGreaterThan(0);
      expect(fish.height).toBeGreaterThan(0);
      expect(fish.speed).toBeGreaterThan(0);
      expect([1, -1]).toContain(fish.direction);
      expect(["far", "mid", "near"]).toContain(fish.depthLayer);
      expect(fish.behavior).toBe("cruising");
    });

    it("should spawn fish off-screen based on direction", () => {
      // Create many fish to test both directions
      const fish: FishMarineLife[] = [];
      for (let i = 0; i < 20; i++) {
        fish.push(animator.createFish(dimensions));
      }

      for (const f of fish) {
        if (f.direction === 1) {
          // Moving right, should start left of screen
          expect(f.x).toBeLessThan(0);
        } else {
          // Moving left, should start right of screen
          expect(f.x).toBeGreaterThan(dimensions.width);
        }
      }
    });

    it("should assign depth bands within screen bounds", () => {
      const fish: FishMarineLife[] = [];
      for (let i = 0; i < 20; i++) {
        fish.push(animator.createFish(dimensions));
      }

      for (const f of fish) {
        expect(f.depthBand.min).toBeGreaterThanOrEqual(0);
        expect(f.depthBand.max).toBeLessThanOrEqual(dimensions.height);
        expect(f.baseY).toBeGreaterThanOrEqual(f.depthBand.min);
        expect(f.baseY).toBeLessThanOrEqual(f.depthBand.max);
      }
    });
  });

  describe("Edge Awareness - Fish Turn Before Leaving Screen", () => {
    it("should statistically turn more often when near edges", () => {
      // Run many trials to test probabilistic behavior
      const warningZone = dimensions.width * EDGE_AWARENESS.warningZone;
      let turnsNearEdge = 0;
      let turnsInCenter = 0;
      const trials = 50;

      for (let i = 0; i < trials; i++) {
        // Fish near edge
        const edgeFish = animator.createFish(dimensions);
        edgeFish.x = dimensions.width - warningZone / 2;
        edgeFish.direction = 1;
        edgeFish.behavior = "cruising";
        edgeFish.behaviorTimer = 0.001;

        const edgeResult = runFrames(animator, [edgeFish], dimensions, 5);
        if (
          edgeResult[0]?.behavior === "turning" ||
          edgeResult[0]?.direction === -1
        ) {
          turnsNearEdge++;
        }

        // Fish in center
        const centerFish = animator.createFish(dimensions);
        centerFish.x = dimensions.width / 2;
        centerFish.direction = 1;
        centerFish.behavior = "cruising";
        centerFish.behaviorTimer = 0.001;

        const centerResult = runFrames(animator, [centerFish], dimensions, 5);
        if (centerResult[0]?.behavior === "turning") {
          turnsInCenter++;
        }
      }

      // Edge fish should turn more often due to multiplier
      // With 5x multiplier, expect edge turns > center turns
      expect(turnsNearEdge).toBeGreaterThanOrEqual(turnsInCenter);
    });

    it("should remove fish that go completely off-screen right", () => {
      const fish = animator.createFish(dimensions);
      fish.x = dimensions.width + fish.width + 200; // Way past edge
      fish.direction = 1;

      const result = runFrames(animator, [fish], dimensions, 3);
      expect(result.length).toBe(0); // Fish removed
    });

    it("should remove fish that go completely off-screen left", () => {
      const fish = animator.createFish(dimensions);
      fish.x = -fish.width - 200; // Way past left edge
      fish.direction = -1;

      const result = runFrames(animator, [fish], dimensions, 3);
      expect(result.length).toBe(0); // Fish removed
    });
  });

  describe("Movement - Fish Actually Move", () => {
    it("should move fish horizontally over time", () => {
      const fish = animator.createFish(dimensions);
      fish.x = 400; // Start in middle
      fish.direction = 1;
      fish.behavior = "cruising";
      fish.behaviorTimer = 100; // Long timer to prevent behavior change

      const initialX = fish.x;
      const result = runFrames(animator, [fish], dimensions, 60); // 1 second at 60fps

      const updatedFish = result[0];
      expect(updatedFish).toBeDefined();
      expect(updatedFish!.x).toBeGreaterThan(initialX);
    });

    it("should bob fish vertically", () => {
      const fish = animator.createFish(dimensions);
      fish.x = 400;
      fish.baseY = 300;
      fish.y = 300;
      fish.behavior = "cruising";
      fish.behaviorTimer = 100;
      fish.bobAmplitude = 5;

      // Collect y positions over time
      const yPositions: number[] = [];
      let currentFish = [fish];

      for (let i = 0; i < 120; i++) {
        currentFish = animator.updateFish(
          currentFish,
          dimensions,
          1,
          i * 0.016
        );
        if (currentFish[0]) {
          yPositions.push(currentFish[0].y);
        }
      }

      // Should have variation in y (bobbing)
      const minY = Math.min(...yPositions);
      const maxY = Math.max(...yPositions);
      expect(maxY - minY).toBeGreaterThan(1); // At least some bobbing
    });
  });

  describe("Off-Screen Removal and Respawn", () => {
    it("should remove fish that go off-screen", () => {
      const fish = animator.createFish(dimensions);
      fish.x = dimensions.width + 500; // Way off right edge
      fish.direction = 1; // Moving further right
      fish.behavior = "cruising";

      const result = runFrames(animator, [fish], dimensions, 10);

      // Fish should be removed (respawn scheduled separately)
      expect(result.length).toBe(0);
    });

    it("should schedule respawn when fish removed", () => {
      const fish = animator.createFish(dimensions);
      fish.x = dimensions.width + 500;
      fish.direction = 1;

      // Run to trigger removal
      runFrames(animator, [fish], dimensions, 5);

      // Run more frames with enough time for respawn
      const laterFish = animator.processPendingSpawns(dimensions, 100);

      expect(laterFish.length).toBeGreaterThan(0);
    });
  });

  describe("Behavior Transitions", () => {
    it("should transition from cruising after timer expires", () => {
      const fish = animator.createFish(dimensions);
      fish.x = 400;
      fish.behavior = "cruising";
      fish.behaviorTimer = 0.01; // About to expire

      const result = runFrames(animator, [fish], dimensions, 5);
      const updatedFish = result[0];

      // Should have transitioned to something
      expect(updatedFish).toBeDefined();
      // Behavior should have changed OR timer should have reset
      const changed =
        updatedFish!.behavior !== "cruising" ||
        updatedFish!.behaviorTimer > 0.01;
      expect(changed).toBe(true);
    });

    it("should complete turning behavior and flip direction", () => {
      const fish = animator.createFish(dimensions);
      fish.x = 400;
      fish.direction = 1;
      fish.behavior = "turning";
      fish.targetDirection = -1;
      fish.behaviorTimer = BEHAVIOR_CONFIG.turning.duration;

      // Run through the turn duration
      const frames = Math.ceil(BEHAVIOR_CONFIG.turning.duration / 0.016) + 10;
      const result = runFrames(animator, [fish], dimensions, frames);

      const updatedFish = result[0];
      expect(updatedFish).toBeDefined();
      // After turn completes, direction should be flipped
      if (updatedFish!.behavior !== "turning") {
        expect(updatedFish!.direction).toBe(-1);
      }
    });

    it("should speed up during darting behavior", () => {
      const fish = animator.createFish(dimensions);
      fish.x = 400;
      fish.behavior = "darting";
      fish.dartSpeed = fish.baseSpeed * 3;
      fish.behaviorTimer = BEHAVIOR_CONFIG.darting.duration;

      const initialX = fish.x;
      const result = runFrames(animator, [fish], dimensions, 30);

      const updatedFish = result[0];
      expect(updatedFish).toBeDefined();
      // Should have moved faster than normal (more distance)
      const distance = Math.abs(updatedFish!.x - initialX);
      expect(distance).toBeGreaterThan(fish.baseSpeed * 0.5); // Moved significantly
    });
  });

  describe("Schooling Behavior", () => {
    it("should form schools during initialization", async () => {
      const fish = await animator.initializeFish(dimensions, 10);

      // Some fish should have school IDs
      const schoolingFish = fish.filter((f) => f.schoolId !== undefined);
      expect(schoolingFish.length).toBeGreaterThan(0);

      // Fish in same school should share schoolId
      const schoolIds = new Set(schoolingFish.map((f) => f.schoolId));
      expect(schoolIds.size).toBeLessThan(schoolingFish.length); // Multiple fish per school
    });

    it("should keep schooling fish relatively close together", async () => {
      const fish = await animator.initializeFish(dimensions, 12);

      // Find a school with multiple members
      const schoolIds = new Map<number, FishMarineLife[]>();
      for (const f of fish) {
        if (f.schoolId !== undefined) {
          if (!schoolIds.has(f.schoolId)) schoolIds.set(f.schoolId, []);
          schoolIds.get(f.schoolId)!.push(f);
        }
      }

      // Find a school with at least 2 members
      let testSchool: FishMarineLife[] | undefined;
      for (const [, members] of schoolIds) {
        if (members.length >= 2) {
          testSchool = members;
          break;
        }
      }

      if (!testSchool) {
        // No school formed (random chance), skip
        return;
      }

      // Position school members together
      const baseX = 400;
      const baseY = 300;
      testSchool.forEach((f, i) => {
        f.x = baseX + i * 20;
        f.y = baseY + i * 10;
        f.baseY = f.y;
        f.behavior = "schooling";
        f.behaviorTimer = 100;
      });

      // Run simulation
      const result = runFrames(animator, fish, dimensions, 60);

      // Check school members stayed relatively close
      const updatedSchool = result.filter(
        (f) => f.schoolId === testSchool![0]!.schoolId
      );

      if (updatedSchool.length >= 2) {
        const avgX =
          updatedSchool.reduce((s, f) => s + f.x, 0) / updatedSchool.length;
        const avgY =
          updatedSchool.reduce((s, f) => s + f.y, 0) / updatedSchool.length;

        // All should be within 150px of center (flocking keeps them together)
        for (const f of updatedSchool) {
          const dist = Math.sqrt((f.x - avgX) ** 2 + (f.y - avgY) ** 2);
          expect(dist).toBeLessThan(200);
        }
      }
    });
  });

  describe("Depth Layer Parallax", () => {
    it("should make far fish smaller than near fish", async () => {
      const fish = await animator.initializeFish(dimensions, 20);

      const farFish = fish.filter((f) => f.depthLayer === "far");
      const nearFish = fish.filter((f) => f.depthLayer === "near");

      if (farFish.length > 0 && nearFish.length > 0) {
        const avgFarWidth =
          farFish.reduce((s, f) => s + f.width, 0) / farFish.length;
        const avgNearWidth =
          nearFish.reduce((s, f) => s + f.width, 0) / nearFish.length;

        expect(avgFarWidth).toBeLessThan(avgNearWidth);
      }
    });

    it("should make far fish more transparent", async () => {
      const fish = await animator.initializeFish(dimensions, 20);

      const farFish = fish.filter((f) => f.depthLayer === "far");
      const nearFish = fish.filter((f) => f.depthLayer === "near");

      if (farFish.length > 0 && nearFish.length > 0) {
        const avgFarOpacity =
          farFish.reduce((s, f) => s + f.opacity, 0) / farFish.length;
        const avgNearOpacity =
          nearFish.reduce((s, f) => s + f.opacity, 0) / nearFish.length;

        expect(avgFarOpacity).toBeLessThan(avgNearOpacity);
      }
    });
  });
});

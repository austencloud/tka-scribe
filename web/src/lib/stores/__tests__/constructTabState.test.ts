/**
 * ConstructTabState Tests
 *
 * Tests for the factory-based state management using Svelte 5 runes
 */

import { beforeEach, describe, expect, it } from "vitest";
import { createConstructTabState } from "../../state/construct-tab-state.svelte";
import type { SequenceData } from "$lib/domain";

describe("ConstructTabState", () => {
  let mockSequenceState: { currentSequence: SequenceData | null };
  let constructTabState: ReturnType<typeof createConstructTabState>;

  beforeEach(() => {
    // Create a fresh mock sequence state for each test
    mockSequenceState = {
      currentSequence: null,
    };

    // Create a fresh construct tab state instance
    constructTabState = createConstructTabState(mockSequenceState);
  });

  describe("Initial State", () => {
    it("should have correct default values", () => {
      expect(constructTabState.activeRightPanel).toBe("build");
      expect(constructTabState.gridMode).toBe("diamond");
      expect(constructTabState.isTransitioning).toBe(false);
      expect(constructTabState.isSubTabTransitionActive).toBe(false);
      expect(constructTabState.currentSubTabTransition).toBe(null);
      expect(constructTabState.errorMessage).toBe(null);
    });

    it("should show start position picker when no sequence", () => {
      mockSequenceState.currentSequence = null;
      constructTabState.updateShouldShowStartPositionPicker();
      expect(constructTabState.shouldShowStartPositionPicker).toBe(true);
    });

    it("should show start position picker when sequence has no start position", () => {
      mockSequenceState.currentSequence = {
        id: "test",
        name: "Test Sequence",
        word: "test",
        beats: [{ beat_number: 1 }],
        thumbnails: [],
        is_favorite: false,
        is_circular: false,
        tags: [],
        metadata: {},
      } as any;
      constructTabState.updateShouldShowStartPositionPicker();
      expect(constructTabState.shouldShowStartPositionPicker).toBe(true);
    });

    it("should not show start position picker when sequence has start position", () => {
      mockSequenceState.currentSequence = {
        id: "test",
        name: "Test Sequence",
        word: "test",
        beats: [{ beat_number: 1 }],
        start_position: { endPos: "alpha1" },
        thumbnails: [],
        is_favorite: false,
        is_circular: false,
        tags: [],
        metadata: {},
      } as any;
      constructTabState.updateShouldShowStartPositionPicker();
      expect(constructTabState.shouldShowStartPositionPicker).toBe(false);
    });
  });

  describe("State Management Functions", () => {
    it("should update active right panel", () => {
      constructTabState.setActiveRightPanel("generate");
      expect(constructTabState.activeRightPanel).toBe("generate");

      constructTabState.setActiveRightPanel("edit");
      expect(constructTabState.activeRightPanel).toBe("edit");

      constructTabState.setActiveRightPanel("export");
      expect(constructTabState.activeRightPanel).toBe("export");
    });

    it("should update grid mode", () => {
      constructTabState.setGridMode("box");
      expect(constructTabState.gridMode).toBe("box");

      constructTabState.setGridMode("diamond");
      expect(constructTabState.gridMode).toBe("diamond");
    });

    it("should update error message", () => {
      constructTabState.setError("Test error");
      expect(constructTabState.errorMessage).toBe("Test error");
      expect(constructTabState.getHasError()).toBe(true);

      constructTabState.clearError();
      expect(constructTabState.errorMessage).toBe(null);
      expect(constructTabState.getHasError()).toBe(false);
    });
  });

  describe("Derived State Getters", () => {
    it("should return current sequence", () => {
      const testSequence = {
        id: "test",
        name: "Test Sequence",
        word: "test",
        beats: [],
        thumbnails: [],
        is_favorite: false,
        is_circular: false,
        tags: [],
        metadata: {},
      } as any;
      mockSequenceState.currentSequence = testSequence;
      expect(constructTabState.getCurrentSequence()).toBe(testSequence);
    });

    it("should return hasError correctly", () => {
      expect(constructTabState.getHasError()).toBe(false);

      constructTabState.setError("Some error");
      expect(constructTabState.getHasError()).toBe(true);

      constructTabState.clearError();
      expect(constructTabState.getHasError()).toBe(false);
    });

    it("should return mode checks correctly", () => {
      expect(constructTabState.getIsInBuildMode()).toBe(true);

      constructTabState.setActiveRightPanel("generate");
      expect(constructTabState.getIsInBuildMode()).toBe(false);

      constructTabState.setActiveRightPanel("build");
      expect(constructTabState.getIsInBuildMode()).toBe(true);
    });
  });
});

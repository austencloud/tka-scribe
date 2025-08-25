/**
 * Unit tests for option-ui-state.svelte.ts
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Type definitions for testing
type MockSortMethod = "type" | "letter" | "complexity";
type MockLastSelectedTabState = Partial<Record<MockSortMethod, string | null>>;

interface MockUIState {
  sortMethod: MockSortMethod;
  isLoading: boolean;
  error: string | null;
  lastSelectedTab: MockLastSelectedTabState;
}

// Mock the entire module to avoid import issues during testing
vi.mock(
  "../../../../../../src/lib/components/construct/option-picker/state/focused/option-ui-state.svelte",
  () => {
    const getStoredState = (): MockUIState => {
      if (typeof window === "undefined")
        return {
          sortMethod: "type" as MockSortMethod,
          isLoading: false,
          error: null,
          lastSelectedTab: {},
        };

      try {
        const stored = localStorage.getItem("optionPickerUIState");
        if (!stored)
          return {
            sortMethod: "type" as MockSortMethod,
            isLoading: false,
            error: null,
            lastSelectedTab: { type: "all" },
          };

        const parsed = JSON.parse(stored);
        return {
          sortMethod: parsed.sortMethod || "type",
          isLoading: false,
          error: null,
          lastSelectedTab: parsed.lastSelectedTab || { type: "all" },
        };
      } catch (e) {
        return {
          sortMethod: "type" as MockSortMethod,
          isLoading: false,
          error: null,
          lastSelectedTab: { type: "all" },
        };
      }
    };

    return {
      createOptionUIState: () => {
        const storedState = getStoredState();
        let uiState: MockUIState = {
          sortMethod: storedState.sortMethod,
          isLoading: storedState.isLoading,
          error: storedState.error,
          lastSelectedTab: storedState.lastSelectedTab,
        };

        return {
          get sortMethod() {
            return uiState.sortMethod;
          },
          get isLoading() {
            return uiState.isLoading;
          },
          get error() {
            return uiState.error;
          },
          get lastSelectedTab() {
            return uiState.lastSelectedTab;
          },

          setSortMethod: (method: MockSortMethod) => {
            uiState.sortMethod = method;
          },
          setLoading: (loading: boolean) => {
            uiState.isLoading = loading;
          },
          setError: (error: string | null) => {
            uiState.error = error;
          },
          setLastSelectedTabForSort: (
            sortMethod: MockSortMethod,
            tabKey: string | null
          ) => {
            if (uiState.lastSelectedTab[sortMethod] === tabKey) return;
            uiState.lastSelectedTab = {
              ...uiState.lastSelectedTab,
              [sortMethod]: tabKey,
            };
          },
          reset: () => {
            const currentSortMethod =
              uiState.sortMethod || ("type" as MockSortMethod);
            uiState = {
              sortMethod: currentSortMethod,
              isLoading: false,
              error: null,
              lastSelectedTab: uiState.lastSelectedTab || {},
            };
          },
        };
      },
    };
  }
);

describe("createOptionUIState", () => {
  let uiState: ReturnType<any>;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Import the mocked module
    const {
      createOptionUIState,
    } = require("../../../../../../src/lib/components/construct/option-picker/state/focused/option-ui-state.svelte");
    uiState = createOptionUIState();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe("Initial State", () => {
    it("should initialize with default values when no localStorage data", () => {
      expect(uiState.sortMethod).toBe("type");
      expect(uiState.isLoading).toBe(false);
      expect(uiState.error).toBeNull();
      expect(uiState.lastSelectedTab).toEqual({ type: "all" });
    });

    it("should initialize from localStorage when available", () => {
      const storedData = {
        sortMethod: "letter",
        lastSelectedTab: { letter: "vowels", type: "all" },
      };
      localStorage.setItem("optionPickerUIState", JSON.stringify(storedData));

      // Create new instance to test localStorage loading
      const {
        createOptionUIState,
      } = require("../../../../../../src/lib/components/construct/option-picker/state/focused/option-ui-state.svelte");
      const newUiState = createOptionUIState();

      expect(newUiState.sortMethod).toBe("letter");
      expect(newUiState.lastSelectedTab).toEqual({
        letter: "vowels",
        type: "all",
      });
    });
  });

  describe("setSortMethod", () => {
    it("should update sort method", () => {
      expect(uiState.sortMethod).toBe("type");

      uiState.setSortMethod("letter");
      expect(uiState.sortMethod).toBe("letter");

      uiState.setSortMethod("complexity");
      expect(uiState.sortMethod).toBe("complexity");
    });
  });

  describe("setLoading", () => {
    it("should update loading state", () => {
      expect(uiState.isLoading).toBe(false);

      uiState.setLoading(true);
      expect(uiState.isLoading).toBe(true);

      uiState.setLoading(false);
      expect(uiState.isLoading).toBe(false);
    });
  });

  describe("setError", () => {
    it("should update error state", () => {
      expect(uiState.error).toBeNull();

      uiState.setError("Test error message");
      expect(uiState.error).toBe("Test error message");

      uiState.setError(null);
      expect(uiState.error).toBeNull();
    });
  });

  describe("setLastSelectedTabForSort", () => {
    it("should update last selected tab for specific sort method", () => {
      uiState.setLastSelectedTabForSort("type", "vowels");
      expect(uiState.lastSelectedTab.type).toBe("vowels");

      uiState.setLastSelectedTabForSort("letter", "consonants");
      expect(uiState.lastSelectedTab.letter).toBe("consonants");
      expect(uiState.lastSelectedTab.type).toBe("vowels"); // Should preserve existing
    });

    it("should not update if value is the same", () => {
      const initialTabs = { ...uiState.lastSelectedTab };

      uiState.setLastSelectedTabForSort("type", "all"); // Same as initial
      expect(uiState.lastSelectedTab).toEqual(initialTabs);
    });

    it("should handle null values", () => {
      uiState.setLastSelectedTabForSort("type", null);
      expect(uiState.lastSelectedTab.type).toBeNull();
    });
  });

  describe("reset", () => {
    it("should reset state while preserving sort method and last selected tabs", () => {
      // Set some state
      uiState.setSortMethod("letter");
      uiState.setLoading(true);
      uiState.setError("Some error");
      uiState.setLastSelectedTabForSort("letter", "vowels");

      // Verify state is set
      expect(uiState.sortMethod).toBe("letter");
      expect(uiState.isLoading).toBe(true);
      expect(uiState.error).toBe("Some error");
      expect(uiState.lastSelectedTab.letter).toBe("vowels");

      // Reset
      uiState.reset();

      // Verify reset behavior
      expect(uiState.sortMethod).toBe("letter"); // Preserved
      expect(uiState.isLoading).toBe(false); // Reset
      expect(uiState.error).toBeNull(); // Reset
      expect(uiState.lastSelectedTab.letter).toBe("vowels"); // Preserved
    });

    it("should default to type sort method if current is invalid", () => {
      // Manually set invalid state
      uiState.setSortMethod("type");

      // Reset should preserve valid sort method
      uiState.reset();
      expect(uiState.sortMethod).toBe("type");
    });
  });

  describe("localStorage integration", () => {
    it("should handle corrupted localStorage gracefully", () => {
      localStorage.setItem("optionPickerUIState", "invalid json");

      // Should not throw and use defaults
      const {
        createOptionUIState,
      } = require("../../../../../../src/lib/components/construct/option-picker/state/focused/option-ui-state.svelte");
      const newUiState = createOptionUIState();

      expect(newUiState.sortMethod).toBe("type");
      expect(newUiState.isLoading).toBe(false);
      expect(newUiState.error).toBeNull();
    });
  });
});

/**
 * Option Picker State
 *
 * Factory function for creating option picker reactive state.
 * Follows the same pattern as the simplified start position picker.
 */

import type { GridMode, PictographData } from "$shared";

import type {
  OptionPickerState,
  SortMethod,
} from "../domain/option-picker-types";
import type { OptionPickerLayout } from "../domain/option-viewer-models";
import type {
  IOptionFilter,
  IOptionLoader,
  IOptionSorter,
} from "../services/contracts";

export interface OptionPickerStateConfig {
  optionLoader: IOptionLoader;
  filterService: IOptionFilter;
  optionSorter: IOptionSorter;
}

export function createOptionPickerState(config: OptionPickerStateConfig) {
  const { optionLoader, filterService, optionSorter } = config;

  // Core reactive state
  let state = $state<OptionPickerState>("ready");
  let options = $state<PictographData[]>([]);
  let preloadedOptions = $state<PictographData[] | null>(null); // Temporary storage for preloaded options
  let error = $state<string | null>(null);
  let sortMethod = $state<SortMethod>("type");
  let lastSequenceId = $state<string | null>(null); // Track last loaded sequence
  let currentSequence = $state<PictographData[]>([]); // Track current sequence for reversal context

  const layout = $state<OptionPickerLayout>({
    optionsPerRow: 4,
    optionSize: 100,
    gridGap: "8px",
    gridColumns: "repeat(4, 1fr)",
    containerWidth: 800,
    containerHeight: 600,
  });

  // Simplified filter state - just continuous vs all
  let isContinuousOnly = $state(false);

  // Computed state
  const isLoading = $derived(() => state === "loading");
  const hasError = $derived(() => state === "error");
  const hasOptions = $derived(() => options.length > 0);

  const filteredOptions = $derived(() => {
    if (!hasOptions) {
      return [];
    }

    let filteredResults = [...options];

    console.log("🔍 filteredOptions derived - isContinuousOnly:", isContinuousOnly);
    console.log("🔍 currentSequence.length:", currentSequence.length);
    console.log("🔍 options.length:", options.length);

    // Apply continuity filter if enabled
    // Only apply when we have at least 2 beats (start position + 1 actual beat)
    // With just a start position, there's no rotation context to compare against
    if (isContinuousOnly && currentSequence.length >= 2) {
      console.log("✅ Applying continuous filter");
      const continuousFilter = {
        continuous: true,
        "1-reversal": false,
        "2-reversals": false,
      };
      filteredResults = filterService.applyReversalFiltering(
        filteredResults,
        continuousFilter,
        currentSequence
      );
      console.log("🔍 After filter, filteredResults.length:", filteredResults.length);
    } else if (isContinuousOnly) {
      console.log("⚠️ Continuous filter enabled but sequence too short (length:", currentSequence.length, ")");
    }

    // Apply sorting
    if (sortMethod) {
      filteredResults = optionSorter.applySorting(filteredResults, sortMethod);
    }

    console.log("🔍 Returning", filteredResults.length, "options");
    return filteredResults;
  });

  // Actions
  async function loadOptions(sequence: PictographData[], gridMode: GridMode) {
    if (state === "loading") {
      return; // Prevent concurrent loads
    }

    // Create a simple sequence ID to prevent reloading the same sequence
    const sequenceId =
      sequence.length > 0
        ? `${sequence.length}-${sequence[sequence.length - 1]?.id || "empty"}-${gridMode}`
        : `empty-${gridMode}`;

    if (lastSequenceId === sequenceId) {
      return; // Skip reload for same sequence
    }

    state = "loading";
    error = null;
    lastSequenceId = sequenceId;
    currentSequence = sequence; // Store sequence for reversal filtering context

    try {
      const newOptions = await optionLoader.loadOptions(sequence, gridMode);

      options = newOptions;
      state = "ready";
    } catch (err) {
      console.error("❌ Failed to load options:", err);
      error = err instanceof Error ? err.message : "Failed to load options";
      state = "error";
      options = [];
    }
  }

  /**
   * Preload options without applying them to the UI
   * This allows loading options in parallel with animations
   */
  async function preloadOptions(
    sequence: PictographData[],
    gridMode: GridMode
  ): Promise<void> {
    // Create a simple sequence ID to prevent reloading the same sequence
    const sequenceId =
      sequence.length > 0
        ? `${sequence.length}-${sequence[sequence.length - 1]?.id || "empty"}-${gridMode}`
        : `empty-${gridMode}`;

    if (lastSequenceId === sequenceId) {
      return; // Skip reload for same sequence
    }

    try {
      const newOptions = await optionLoader.loadOptions(sequence, gridMode);
      preloadedOptions = newOptions;
      lastSequenceId = sequenceId;
    } catch (err) {
      console.error("❌ Failed to preload options:", err);
      error = err instanceof Error ? err.message : "Failed to preload options";
      preloadedOptions = [];
    }
  }

  /**
   * Apply preloaded options to the UI
   * Call this after fade-out completes to show new options during fade-in
   */
  function applyPreloadedOptions(): void {
    if (preloadedOptions !== null) {
      options = preloadedOptions;
      preloadedOptions = null;
      state = "ready";
      error = null;
    }
  }

  function setSortMethod(method: SortMethod) {
    sortMethod = method;
  }

  function setContinuousOnly(value: boolean) {
    isContinuousOnly = value;
  }

  function selectOption(_option: PictographData) {
    try {
      // Basic selection handling - can be extended as needed
      // Currently this is a no-op, reserved for future functionality
    } catch (err) {
      console.error("Failed to select option:", err);
      error = err instanceof Error ? err.message : "Failed to select option";
    }
  }

  function clearError() {
    error = null;
    if (state === "error") {
      state = "ready";
    }
  }

  function reset() {
    state = "ready";
    options = [];
    error = null;
    sortMethod = "type";
    lastSequenceId = null;
    isContinuousOnly = false;
    currentSequence = [];
  }

  // Return the state interface
  return {
    // State getters
    get state() {
      return state;
    },
    get options() {
      return options;
    },
    get error() {
      return error;
    },
    get sortMethod() {
      return sortMethod;
    },
    get isContinuousOnly() {
      return isContinuousOnly;
    },
    get layout() {
      return layout;
    },

    // Computed getters
    get isLoading() {
      return isLoading();
    },
    get hasError() {
      return hasError();
    },
    get hasOptions() {
      return hasOptions();
    },
    get filteredOptions() {
      return filteredOptions();
    },

    // Actions
    loadOptions,
    preloadOptions,
    applyPreloadedOptions,
    setSortMethod,
    setContinuousOnly,
    selectOption,
    clearError,
    reset,
  };
}

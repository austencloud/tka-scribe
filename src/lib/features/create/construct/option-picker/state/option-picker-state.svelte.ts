/**
 * Option Picker State
 *
 * Factory function for creating option picker reactive state.
 * Follows the same pattern as the simplified start position picker.
 */

import type { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
import type {
  OptionPickerState,
  SortMethod,
} from "../domain/option-picker-types";
import type { OptionPickerLayout } from "../domain/option-viewer-models";
import type { IOptionFilter } from "../services/contracts/IOptionFilter";
import type { IOptionLoader } from "../services/contracts/IOptionLoader";
import type { IOptionSorter } from "../services/contracts/IOptionSorter";

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
    if (!hasOptions()) {
      return [];
    }

    let filteredResults = [...options];

    // Apply continuity filter if enabled
    // Only apply when we have at least 2 beats (start position + 1 actual beat)
    // With just a start position, there's no rotation context to compare against
    if (isContinuousOnly && currentSequence.length >= 2) {
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
    }

    // Apply sorting
    if (sortMethod) {
      filteredResults = optionSorter.applySorting(filteredResults, sortMethod);
    }

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
    setSortMethod,
    setContinuousOnly,
    selectOption,
    clearError,
    reset,
  };
}

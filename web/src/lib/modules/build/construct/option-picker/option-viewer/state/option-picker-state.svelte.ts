/**
 * Option Picker State
 * 
 * Factory function for creating option picker reactive state.
 * Follows the same pattern as the simplified start position picker.
 */

import type { PictographData } from "../../../../../../shared";
import type { OptionPickerState, SortMethod, TypeFilter } from "../domain/option-picker-types";
import type { OptionPickerLayout, OptionPickerStateConfig } from "../domain/option-viewer-models";

export function createOptionPickerState(config: OptionPickerStateConfig) {
  const { optionPickerService } = config;

  // Core reactive state
  let state = $state<OptionPickerState>('ready');
  let options = $state<PictographData[]>([]);
  let error = $state<string | null>(null);
  let sortMethod = $state<SortMethod>('type');
  let lastSequenceId = $state<string | null>(null); // Track last loaded sequence

  // Type filter state - all enabled by default
  let typeFilter = $state<TypeFilter>({
    type1: true, // Dual-Shift (A-V)
    type2: true, // Shift (W, X, Y, Z, Σ, Δ, θ, Ω)
    type3: true, // Cross-Shift (W-, X-, Y-, Z-, Σ-, Δ-, θ-, Ω-)
    type4: true, // Dash (Φ, Ψ, Λ)
    type5: true, // Dual-Dash (Φ-, Ψ-, Λ-)
    type6: true, // Static (α, β, Γ)
  });
  let layout = $state<OptionPickerLayout>({
    optionsPerRow: 4,
    optionSize: 100,
    gridGap: '8px',
    gridColumns: 'repeat(4, 1fr)',
    containerWidth: 800,
    containerHeight: 600
  });

  // Computed state
  const isLoading = $derived(() => state === 'loading');
  const hasError = $derived(() => state === 'error');
  const hasOptions = $derived(() => options.length > 0);

  const filteredOptions = $derived(() => {
    if (!hasOptions) {
      return [];
    }
    return optionPickerService.getFilteredOptions(options, sortMethod, typeFilter);
  });

  // Actions
  async function loadOptions(sequence: PictographData[]) {
    if (state === 'loading') return; // Prevent concurrent loads

    // Create a simple sequence ID to prevent reloading the same sequence
    const sequenceId = sequence.length > 0 ?
      `${sequence.length}-${sequence[sequence.length - 1]?.id || 'empty'}` :
      'empty';

    if (lastSequenceId === sequenceId) {
      return; // Skip reload for same sequence
    }

    state = 'loading';
    error = null;
    lastSequenceId = sequenceId;

    try {
      const newOptions = await optionPickerService.loadOptionsFromSequence(sequence);

      options = newOptions;
      state = 'ready';
    } catch (err) {
      console.error("Failed to load options:", err);
      error = err instanceof Error ? err.message : 'Failed to load options';
      state = 'error';
      options = [];
    }
  }

  function setSortMethod(method: SortMethod) {
    sortMethod = method;
  }

  function toggleTypeFilter(typeNumber: number) {
    const typeKey = `type${typeNumber}` as keyof TypeFilter;
    typeFilter[typeKey] = !typeFilter[typeKey];
  }



  async function selectOption(option: PictographData) {
    try {
      await optionPickerService.selectOption(option);
    } catch (err) {
      console.error("Failed to select option:", err);
      error = err instanceof Error ? err.message : 'Failed to select option';
    }
  }

  function clearError() {
    error = null;
    if (state === 'error') {
      state = 'ready';
    }
  }

  function reset() {
    state = 'ready';
    options = [];
    error = null;
    sortMethod = 'type';
    lastSequenceId = null; // Clear sequence tracking
  }

  // Return the state interface
  return {
    // State getters
    get state() { return state; },
    get options() { return options; },
    get error() { return error; },
    get sortMethod() { return sortMethod; },
    get typeFilter() { return typeFilter; },

    get layout() { return layout; },

    // Computed getters
    get isLoading() { return isLoading(); },
    get hasError() { return hasError(); },
    get hasOptions() { return hasOptions(); },
    get filteredOptions() { return filteredOptions(); },

    // Actions
    loadOptions,
    setSortMethod,
    toggleTypeFilter,
    selectOption,
    clearError,
    reset
  };
}

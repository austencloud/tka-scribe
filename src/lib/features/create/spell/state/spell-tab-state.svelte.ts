/**
 * Spell Tab State - Sub-tab State
 *
 * Manages state specific to the Spell sub-tab functionality.
 * Handles word-to-sequence conversion and spell-specific UI state.
 *
 * ✅ All spell-specific runes ($state, $derived, $effect) live here
 * ✅ Pure reactive wrappers - no business logic
 * ✅ Services injected via parameters
 * ✅ Component-scoped state (not global singleton)
 * ✅ Each tab maintains its own independent sequence state
 */

import type { ISequenceRepository } from "$lib/features/create/shared/services/contracts/ISequenceRepository";
import type { ISequencePersister } from "$lib/features/create/shared/services/contracts/ISequencePersister";
import type { ISequenceStatsCalculator } from "$lib/features/create/shared/services/contracts/ISequenceStatsCalculator";
import type { ISequenceTransformer } from "$lib/features/create/shared/services/contracts/ISequenceTransformer";
import type { ISequenceValidator } from "$lib/features/create/shared/services/contracts/ISequenceValidator";
import { createSequenceState } from "$lib/features/create/shared/state/SequenceStateOrchestrator.svelte";
import type { SequenceState } from "$lib/features/create/shared/state/SequenceStateOrchestrator.svelte";
import type { IUndoManager } from "$lib/features/create/shared/services/contracts/IUndoManager";
import { createUndoController } from "$lib/features/create/shared/state/create-module/undo-controller.svelte";
import { resolve } from "$lib/shared/inversify/di";
import { TYPES } from "$lib/shared/inversify/types";
import type { LetterSource, SpellPreferences } from "../domain/models/spell-models";
import { DEFAULT_SPELL_PREFERENCES } from "../domain/constants/spell-constants";

/**
 * Creates spell tab state for spell-specific concerns
 *
 * @param sequenceService - Injected sequence service for business logic
 * @param SequencePersister - Optional persistence service for state survival
 * @param sequenceStatisticsService - Optional statistics service for sequence analysis
 * @param SequenceTransformer - Optional transformation service for sequence operations
 * @param sequenceValidationService - Optional validation service for sequence validation
 * @returns Reactive state object with getters and state mutations
 */
export function createSpellTabState(
  sequenceService?: ISequenceRepository,
  SequencePersister?: ISequencePersister,
  sequenceStatisticsService?: ISequenceStatsCalculator,
  SequenceTransformer?: ISequenceTransformer,
  sequenceValidationService?: ISequenceValidator
) {
  // ============================================================================
  // REACTIVE STATE (Spell-specific)
  // ============================================================================

  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let isTransitioning = $state(false);
  let isInitialized = $state(false);

  // Spell-specific state
  let inputWord = $state("");
  let expandedWord = $state("");
  let letterSources = $state<LetterSource[]>([]);
  let isGenerating = $state(false);
  let showLetterPalette = $state(false);
  let preferences = $state<SpellPreferences>({ ...DEFAULT_SPELL_PREFERENCES });

  // Spell tab has its own independent sequence state
  // IMPORTANT: Pass tabId="spell" to ensure persistence loads/saves only spell's data
  const sequenceState: SequenceState | null = sequenceService
    ? createSequenceState({
        sequenceService,
        ...(SequencePersister && { SequencePersister }),
        ...(sequenceStatisticsService && { sequenceStatisticsService }),
        ...(SequenceTransformer && { SequenceTransformer }),
        ...(sequenceValidationService && { sequenceValidationService }),
        tabId: "spell", // Persistence isolation - only load/save spell's data
      })
    : null;

  // Spell tab has its own independent undo controller
  const UndoManager = resolve<IUndoManager>(TYPES.IUndoManager);
  const undoController = sequenceState
    ? createUndoController({
        UndoManager,
        sequenceState,
        getActiveSection: () => "spell",
        setActiveSectionInternal: async () => {
          // Spell tab doesn't need to change active section since it's always spell
          // This is just for compatibility with the undo controller interface
        },
      })
    : null;

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  const hasError = $derived(error !== null);
  const hasSequence = $derived(() => {
    return sequenceState ? sequenceState.hasSequence() : false;
  });
  const hasInput = $derived(inputWord.trim().length > 0);
  const canGenerate = $derived(hasInput && !isGenerating);
  const hasBridgeLetters = $derived(
    letterSources.some((source) => !source.isOriginal)
  );

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize spell tab - called from component onMount
   */
  async function initializeSpellTab() {
    if (!sequenceState) {
      console.warn(
        "⚠️ SpellTabState: No sequence service provided, skipping sequence state initialization"
      );
      isInitialized = true;
      return;
    }

    try {
      // Initialize persistence and restore state if available
      if (SequencePersister) {
        await sequenceState.initializeWithPersistence();
      }

      isInitialized = true;
    } catch (error) {
      console.error("❌ SpellTabState: Failed to initialize:", error);
      setError(error instanceof Error ? error.message : "Failed to initialize");
    }
  }

  // ============================================================================
  // STATE MUTATIONS - Core
  // ============================================================================

  function setLoading(loading: boolean) {
    isLoading = loading;
  }

  function setTransitioning(transitioning: boolean) {
    isTransitioning = transitioning;
  }

  function setError(errorMessage: string | null) {
    error = errorMessage;
  }

  function clearError() {
    error = null;
  }

  async function clearSequenceCompletely() {
    try {
      clearError();
      clearSpellState();

      // Clear sequence state asynchronously
      if (sequenceState) {
        await sequenceState.clearSequenceCompletely();
      }
    } catch (error) {
      console.error("❌ SpellTabState: Failed to clear sequence:", error);
      setError(
        error instanceof Error ? error.message : "Failed to clear sequence"
      );
    }
  }

  // ============================================================================
  // STATE MUTATIONS - Spell-specific
  // ============================================================================

  function setInputWord(word: string) {
    inputWord = word;
    // Clear previous generation results when input changes
    if (expandedWord) {
      expandedWord = "";
      letterSources = [];
    }
  }

  function setExpandedWord(word: string) {
    expandedWord = word;
  }

  function setLetterSources(sources: LetterSource[]) {
    letterSources = sources;
  }

  function setGenerating(generating: boolean) {
    isGenerating = generating;
  }

  function setShowLetterPalette(show: boolean) {
    showLetterPalette = show;
  }

  function toggleLetterPalette() {
    showLetterPalette = !showLetterPalette;
  }

  function updatePreference<K extends keyof SpellPreferences>(
    key: K,
    value: SpellPreferences[K]
  ) {
    preferences = { ...preferences, [key]: value };
  }

  function resetPreferences() {
    preferences = { ...DEFAULT_SPELL_PREFERENCES };
  }

  function clearSpellState() {
    inputWord = "";
    expandedWord = "";
    letterSources = [];
    isGenerating = false;
    error = null;
  }

  /**
   * Insert a letter at the current cursor position or at the end
   * Used by the letter palette for Greek letter insertion
   */
  function insertLetter(letter: string) {
    inputWord = inputWord + letter;
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  return {
    // Readonly state access - Core
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
    get isTransitioning() {
      return isTransitioning;
    },
    get hasError() {
      return hasError;
    },
    get isInitialized() {
      return isInitialized;
    },
    get isPersistenceInitialized() {
      return isInitialized;
    },
    get hasSequence() {
      return hasSequence;
    },

    // Readonly state access - Spell-specific
    get inputWord() {
      return inputWord;
    },
    get expandedWord() {
      return expandedWord;
    },
    get letterSources() {
      return letterSources;
    },
    get isGenerating() {
      return isGenerating;
    },
    get showLetterPalette() {
      return showLetterPalette;
    },
    get preferences() {
      return preferences;
    },
    get hasInput() {
      return hasInput;
    },
    get canGenerate() {
      return canGenerate;
    },
    get hasBridgeLetters() {
      return hasBridgeLetters;
    },

    // Sequence state access
    get sequenceState() {
      return sequenceState;
    },

    // Undo controller (tab-scoped)
    get undoController() {
      return undoController;
    },
    get canUndo() {
      return undoController?.canUndo || false;
    },
    get canRedo() {
      return undoController?.canRedo || false;
    },
    get undoHistory() {
      return undoController?.undoHistory || [];
    },
    pushUndoSnapshot: (type: any, metadata?: any) => {
      undoController?.pushUndoSnapshot(type, metadata);
    },
    undo: () => {
      return undoController?.undo() || false;
    },
    redo: () => {
      return undoController?.redo() || false;
    },
    clearUndoHistory: () => {
      undoController?.clearUndoHistory();
    },

    // State mutations - Core
    setLoading,
    setTransitioning,
    setError,
    clearError,
    clearSequenceCompletely,

    // State mutations - Spell-specific
    setInputWord,
    setExpandedWord,
    setLetterSources,
    setGenerating,
    setShowLetterPalette,
    toggleLetterPalette,
    updatePreference,
    resetPreferences,
    clearSpellState,
    insertLetter,

    // Initialization
    initializeSpellTab,
  };
}

/**
 * Type for SpellTabState - the return type of createSpellTabState
 */
export type SpellTabState = ReturnType<typeof createSpellTabState>;

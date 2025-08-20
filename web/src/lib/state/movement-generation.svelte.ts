/**
 * Movement Generation State - Svelte 5 runes
 *
 * Reactive state management for movement pattern generation.
 * Wraps movement generation services with runes for UI reactivity.
 * Follows TKA architecture: services handle business logic, runes handle reactivity.
 */

import { resolve } from "$lib/services/bootstrap";
import type { MovementSet, MovementPattern } from "$lib/domain/MovementData";
import type {
  IMovementGeneratorService,
  IMovementPatternService,
} from "$lib/services/interfaces/generation-interfaces";
import {
  Timing,
  Direction,
  MotionType,
  RotationDirection,
} from "$lib/domain/enums";

/**
 * Creates reactive state for movement generation
 */
export function createMovementGenerationState() {
  // Get services from DI container
  const movementGenerator = resolve(
    "IMovementGeneratorService"
  ) as IMovementGeneratorService;

  // Core reactive state
  let isGenerating = $state(false);
  let movementSets = $state<MovementSet[]>([]);
  let selectedLetter = $state<string>("");
  let error = $state<string | null>(null);
  let lastGenerated = $state<string | null>(null);

  // Filter state
  let filterText = $state("");
  let showOnlyGenerated = $state(false);

  // Derived computed values
  const filteredMovementSets = $derived(() => {
    let result = movementSets;

    if (showOnlyGenerated) {
      result = result.filter((set) => set.movements.length > 0);
    }

    if (filterText.trim()) {
      const filter = filterText.toLowerCase().trim();
      result = result.filter((set) =>
        set.letter.toLowerCase().includes(filter)
      );
    }

    return result;
  });

  const generationStats = $derived(() => ({
    totalSets: movementSets.length,
    totalMovements: movementSets.reduce(
      (sum, set) => sum + set.movements.length,
      0
    ),
    filteredCount: filteredMovementSets.length,
    isFiltered: filterText.trim() !== "" || showOnlyGenerated,
  }));

  const availableLetters = $derived(() => [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "Σ",
    "Δ",
    "θ",
    "Ω",
    "Φ",
    "Ψ",
    "Λ",
    "α",
    "β",
    "Γ",
    "W-",
    "X-",
    "Y-",
    "Z-",
    "Σ-",
    "Δ-",
    "θ-",
    "Ω-",
    "Φ-",
    "Ψ-",
    "Λ-",
  ]);

  // Actions
  async function generateMovementSet(
    letter: string
  ): Promise<MovementSet | null> {
    if (isGenerating) return null;

    isGenerating = true;
    error = null;

    try {
      const movementSet = movementGenerator.getMovementSetByLetter(letter);

      if (movementSet) {
        // Update or add to the collection
        const existingIndex = movementSets.findIndex(
          (set) => set.letter === letter
        );
        if (existingIndex >= 0) {
          movementSets[existingIndex] = movementSet;
        } else {
          movementSets.push(movementSet);
        }

        selectedLetter = letter;
        lastGenerated = letter;

        return movementSet;
      } else {
        error = `No generator found for letter: ${letter}`;
        return null;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Unknown error occurred";
      return null;
    } finally {
      isGenerating = false;
    }
  }

  async function generateAllMovements(): Promise<void> {
    if (isGenerating) return;

    isGenerating = true;
    error = null;

    try {
      const allSets = movementGenerator.getAllMovementSets();
      movementSets = allSets;
      lastGenerated = "all";
    } catch (err) {
      error =
        err instanceof Error ? err.message : "Failed to generate all movements";
    } finally {
      isGenerating = false;
    }
  }

  function clearMovements(): void {
    movementSets = [];
    selectedLetter = "";
    error = null;
    lastGenerated = null;
  }

  function selectLetter(letter: string): void {
    selectedLetter = letter;
  }

  function setFilter(text: string): void {
    filterText = text;
  }

  function toggleShowOnlyGenerated(): void {
    showOnlyGenerated = !showOnlyGenerated;
  }

  function clearError(): void {
    error = null;
  }

  function getMovementSetByLetter(letter: string): MovementSet | undefined {
    return movementSets.find((set) => set.letter === letter);
  }

  function hasMovementSet(letter: string): boolean {
    return movementSets.some((set) => set.letter === letter);
  }

  // Export reactive state and actions
  return {
    // State
    get isGenerating() {
      return isGenerating;
    },
    get movementSets() {
      return movementSets;
    },
    get selectedLetter() {
      return selectedLetter;
    },
    get error() {
      return error;
    },
    get lastGenerated() {
      return lastGenerated;
    },
    get filterText() {
      return filterText;
    },
    get showOnlyGenerated() {
      return showOnlyGenerated;
    },

    // Derived state
    get filteredMovementSets() {
      return filteredMovementSets;
    },
    get generationStats() {
      return generationStats;
    },
    get availableLetters() {
      return availableLetters;
    },

    // Actions
    generateMovementSet,
    generateAllMovements,
    clearMovements,
    selectLetter,
    setFilter,
    toggleShowOnlyGenerated,
    clearError,
    getMovementSetByLetter,
    hasMovementSet,
  };
}

/**
 * Creates reactive state for movement pattern creation
 */
export function createMovementPatternState() {
  // Get service from DI container
  const patternService = resolve(
    "IMovementPatternService"
  ) as IMovementPatternService;

  // Core reactive state
  let currentPattern = $state<MovementPattern | null>(null);
  let isCreating = $state(false);
  let error = $state<string | null>(null);

  // Pattern configuration state
  let letter = $state("");
  let timing = $state("split");
  let direction = $state("same");
  let positionSystem = $state("alpha");
  let blueMotion = $state("pro");
  let redMotion = $state("pro");
  let blueRotation = $state("cw");
  let redRotation = $state("cw");

  // Derived validation
  const isValidConfiguration = $derived(() => {
    return letter.trim() !== "" && timing !== "" && direction !== "";
  });

  // Actions
  function createPattern(): MovementPattern | null {
    if (!isValidConfiguration || isCreating) return null;

    isCreating = true;
    error = null;

    try {
      const pattern = patternService.createPattern(letter, {
        timing: timing as Timing,
        direction: direction as Direction,
        positionSystem: positionSystem as "alpha" | "beta" | "gamma",
        baseBlueMotion: blueMotion as MotionType,
        baseRedMotion: redMotion as MotionType,
        baseBlueRotation: blueRotation as RotationDirection,
        baseRedRotation: redRotation as RotationDirection,
      });

      currentPattern = pattern;
      return pattern;
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to create pattern";
      return null;
    } finally {
      isCreating = false;
    }
  }

  function updateLetter(value: string): void {
    letter = value;
  }

  function updateTiming(value: string): void {
    timing = value;
  }

  function updateDirection(value: string): void {
    direction = value;
  }

  function updatePositionSystem(value: string): void {
    positionSystem = value;
  }

  function updateBlueMotion(value: string): void {
    blueMotion = value;
  }

  function updateRedMotion(value: string): void {
    redMotion = value;
  }

  function updateBlueRotation(value: string): void {
    blueRotation = value;
  }

  function updateRedRotation(value: string): void {
    redRotation = value;
  }

  function reset(): void {
    currentPattern = null;
    letter = "";
    timing = "split";
    direction = "same";
    positionSystem = "alpha";
    blueMotion = "pro";
    redMotion = "pro";
    blueRotation = "cw";
    redRotation = "cw";
    error = null;
  }

  function clearError(): void {
    error = null;
  }

  return {
    // State
    get currentPattern() {
      return currentPattern;
    },
    get isCreating() {
      return isCreating;
    },
    get error() {
      return error;
    },
    get letter() {
      return letter;
    },
    get timing() {
      return timing;
    },
    get direction() {
      return direction;
    },
    get positionSystem() {
      return positionSystem;
    },
    get blueMotion() {
      return blueMotion;
    },
    get redMotion() {
      return redMotion;
    },
    get blueRotation() {
      return blueRotation;
    },
    get redRotation() {
      return redRotation;
    },

    // Derived state
    get isValidConfiguration() {
      return isValidConfiguration;
    },

    // Actions
    createPattern,
    updateLetter,
    updateTiming,
    updateDirection,
    updatePositionSystem,
    updateBlueMotion,
    updateRedMotion,
    updateBlueRotation,
    updateRedRotation,
    reset,
    clearError,
  };
}

export type MovementGenerationState = ReturnType<
  typeof createMovementGenerationState
>;
export type MovementPatternState = ReturnType<
  typeof createMovementPatternState
>;

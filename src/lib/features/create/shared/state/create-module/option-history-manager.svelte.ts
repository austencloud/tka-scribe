/**
 * Option History Manager
 *
 * Tracks option selections (beat additions) so we can provide undo-friendly UX.
 * Isolated from the main create module state for clarity and easier testing.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { BeatData } from "../../domain/models/BeatData";

export type OptionSelectionHistoryEntry = {
  beatIndex: number;
  beatData: BeatData;
  timestamp: number;
};

type OptionHistoryManagerDeps = {
  getSequence: () => SequenceData | null;
};

const MAX_OPTION_HISTORY = 50;

export function createOptionHistoryManager({
  getSequence,
}: OptionHistoryManagerDeps) {
  const history = $state<OptionSelectionHistoryEntry[]>([]);
  const hasHistory = $derived(history.length > 0);

  function add(beatIndex: number, beatData: BeatData) {
    history.push({
      beatIndex,
      beatData,
      timestamp: Date.now(),
    });

    if (history.length > MAX_OPTION_HISTORY) {
      history.shift();
    }
  }

  function pop(): OptionSelectionHistoryEntry | null {
    const lastEntry = history.pop();
    return lastEntry ?? null;
  }

  function clear() {
    history.splice(0, history.length);
  }

  function rebuildFromSequence() {
    const sequence = getSequence();
    history.splice(0, history.length);

    if (!sequence) {
      return;
    }

    // Skip index 0 because it represents the start position
    const beats = sequence.beats ?? [];
    for (let i = 1; i < beats.length; i++) {
      const beat = beats[i];
      if (!beat) continue;

      history.push({
        beatIndex: i,
        beatData: beat,
        timestamp: Date.now() - (beats.length - i) * 1000,
      });
    }
  }

  return {
    get history() {
      return history;
    },
    get hasHistory() {
      return hasHistory;
    },
    add,
    pop,
    clear,
    rebuildFromSequence,
  };
}

export type OptionHistoryManager = ReturnType<
  typeof createOptionHistoryManager
>;

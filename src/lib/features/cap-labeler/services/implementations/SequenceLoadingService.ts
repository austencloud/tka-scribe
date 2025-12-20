import { injectable } from "inversify";
import type { SequenceEntry } from "../contracts/IBeatDataConversionService";
import type { LabeledSequence } from "../contracts/ICAPLabelsFirebaseService";
import type {
  ISequenceLoadingService,
  FilterMode,
  SequenceStats,
} from "../contracts/ISequenceLoadingService";

/**
 * Service for loading and filtering sequences
 */
@injectable()
export class SequenceLoadingService implements ISequenceLoadingService {
  async loadSequences(): Promise<SequenceEntry[]> {
    try {
      const response = await fetch("/data/sequence-index.json");
      const data = await response.json();
      return data.sequences || [];
    } catch (error) {
      console.error("Failed to load sequences:", error);
      return [];
    }
  }

  filterSequences(
    sequences: SequenceEntry[],
    labels: Map<string, LabeledSequence>,
    filterMode: FilterMode
  ): SequenceEntry[] {
    // First filter to only circular sequences
    const circularSequences = sequences.filter((s) => s.isCircular);

    // Apply filter mode
    switch (filterMode) {
      case "all":
        return circularSequences;

      case "unlabeled":
        return circularSequences.filter((s) => !labels.has(s.word));

      case "labeled":
        return circularSequences.filter((s) => labels.has(s.word));

      case "unknown":
        return circularSequences.filter(
          (s) => labels.get(s.word)?.isUnknown === true
        );

      default:
        return circularSequences;
    }
  }

  calculateStats(
    sequences: SequenceEntry[],
    labels: Map<string, LabeledSequence>
  ): SequenceStats {
    const circularSequences = sequences.filter((s) => s.isCircular);
    const total = circularSequences.length;
    const labeled = labels.size;
    const unlabeled = total - labeled;
    const unknown = Array.from(labels.values()).filter(
      (l) => l.isUnknown === true
    ).length;

    return {
      total,
      labeled,
      unlabeled,
      unknown,
    };
  }
}

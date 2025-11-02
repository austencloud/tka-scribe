import type { BeatData } from "../models/BeatData";

export function createBeatData(data: Partial<BeatData> = {}): BeatData {
  return {
    // PictographData properties
    id: data.id ?? crypto.randomUUID(),
    letter: data.letter ?? null,
    startPosition: data.startPosition ?? null,
    endPosition: data.endPosition ?? null,
    motions: data.motions ?? {},

    // Beat context properties
    beatNumber: data.beatNumber ?? 1,
    duration: data.duration ?? 1.0,
    blueReversal: data.blueReversal ?? false,
    redReversal: data.redReversal ?? false,
    isBlank: data.isBlank ?? false,
    // Conditionally include isSelected only if it's defined
    ...(data.isSelected !== undefined && { isSelected: data.isSelected }),
  };
}

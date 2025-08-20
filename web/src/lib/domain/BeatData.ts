/**
 * Beat Domain Model
 *
 * Immutable data structure for individual beats in kinetic sequences.
 * Based on the modern desktop app's BeatData adapted for TypeScript.
 */

import type { MotionData } from "./MotionData";
import type { PictographData } from "./PictographData";
import { Direction, Timing } from "./enums";

export interface BeatData {
  readonly id: string;
  readonly beatNumber: number;
  readonly duration: number;
  readonly timing?: Timing | null;
  readonly direction?: Direction | null;
  readonly blueReversal: boolean;
  readonly redReversal: boolean;
  readonly isBlank: boolean;
  readonly pictographData?: PictographData | null;
  readonly metadata: Record<string, unknown>;
}

export function createBeatData(data: Partial<BeatData> = {}): BeatData {
  return {
    id: data.id ?? crypto.randomUUID(),
    beatNumber: data.beatNumber ?? 1,
    duration: data.duration ?? 1.0,
    blueReversal: data.blueReversal ?? false,
    redReversal: data.redReversal ?? false,
    isBlank: data.isBlank ?? false,
    pictographData: data.pictographData ?? null,
    metadata: data.metadata ?? {},
  };
}

export function updateBeatData(
  beat: BeatData,
  updates: Partial<BeatData>
): BeatData {
  return {
    ...beat,
    ...updates,
  };
}

export function isValidBeat(beat: BeatData): boolean {
  return beat.duration >= 0 && beat.beatNumber >= 0;
}

export function getBeatLetter(beat: BeatData): string | undefined {
  return (
    beat.pictographData?.letter ??
    (typeof beat.metadata.letter === "string"
      ? beat.metadata.letter
      : undefined)
  );
}

export function hasPictograph(beat: BeatData): boolean {
  return beat.pictographData != null;
}

export function getBlueMotion(beat: BeatData): MotionData | null {
  if (beat.pictographData?.motions) {
    return beat.pictographData.motions.blue ?? null;
  }
  return null;
}

export function getRedMotion(beat: BeatData): MotionData | null {
  if (beat.pictographData?.motions) {
    return beat.pictographData.motions.red ?? null;
  }
  return null;
}

export function createBeatFromPictograph(
  pictographData: PictographData,
  beatNumber: number
): BeatData {
  return createBeatData({
    beatNumber,
    pictographData,
    metadata: {
      letter: pictographData.letter,
      created_from_pictograph: true,
    },
  });
}

export function beatDataToObject(beat: BeatData): Record<string, unknown> {
  return {
    id: beat.id,
    beatNumber: beat.beatNumber,
    duration: beat.duration,
    blueReversal: beat.blueReversal,
    redReversal: beat.redReversal,
    isBlank: beat.isBlank,
    pictographData: beat.pictographData,
    metadata: beat.metadata,
  };
}

export function beatDataFromObject(data: Record<string, unknown>): BeatData {
  const partialData: Record<string, unknown> = {};

  if (typeof data.id === "string") partialData.id = data.id;
  if (typeof data.beatNumber === "number")
    partialData.beatNumber = data.beatNumber;
  if (typeof data.duration === "number") partialData.duration = data.duration;
  if (typeof data.blueReversal === "boolean")
    partialData.blueReversal = data.blueReversal;
  if (typeof data.redReversal === "boolean")
    partialData.redReversal = data.redReversal;
  if (typeof data.isBlank === "boolean") partialData.isBlank = data.isBlank;
  if (data.pictographData)
    partialData.pictographData = data.pictographData as PictographData;
  if (typeof data.metadata === "object" && data.metadata !== null)
    partialData.metadata = data.metadata as Record<string, unknown>;

  return createBeatData(partialData as Partial<BeatData>);
}

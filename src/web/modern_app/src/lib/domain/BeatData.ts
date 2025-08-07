/**
 * Beat Domain Model
 * 
 * Immutable data structure for individual beats in kinetic sequences.
 * Based on the modern desktop app's BeatData but adapted for TypeScript.
 */

export interface MotionData {
  motion_type: string;
  direction: string;
  rotation: number;
}

export interface PictographData {
  letter: string;
  start_position: string;
  end_position: string;
  blue_attributes: Record<string, any>;
  red_attributes: Record<string, any>;
  motions: {
    blue?: MotionData;
    red?: MotionData;
  };
  grid_mode: string;
  timing: number;
}

export interface BeatData {
  readonly id: string;
  readonly beat_number: number;
  readonly duration: number;
  readonly blue_reversal: boolean;
  readonly red_reversal: boolean;
  readonly is_blank: boolean;
  readonly pictograph_data?: PictographData;
  readonly metadata: Record<string, any>;
}

export function createBeatData(data: Partial<BeatData> = {}): BeatData {
  return {
    id: data.id ?? crypto.randomUUID(),
    beat_number: data.beat_number ?? 1,
    duration: data.duration ?? 1.0,
    blue_reversal: data.blue_reversal ?? false,
    red_reversal: data.red_reversal ?? false,
    is_blank: data.is_blank ?? false,
    pictograph_data: data.pictograph_data,
    metadata: data.metadata ?? {},
  };
}

export function updateBeatData(beat: BeatData, updates: Partial<BeatData>): BeatData {
  return {
    ...beat,
    ...updates,
  };
}

export function isValidBeat(beat: BeatData): boolean {
  return beat.duration >= 0 && beat.beat_number >= 0;
}

export function getBeatLetter(beat: BeatData): string | undefined {
  return beat.pictograph_data?.letter ?? beat.metadata.letter;
}

export function hasPictograph(beat: BeatData): boolean {
  return beat.pictograph_data != null;
}

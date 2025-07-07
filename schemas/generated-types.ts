/**
 * TypeScript types generated from TKA schemas v2
 * Based on modern desktop domain models
 *
 * GENERATED FROM: F:\CODE\TKA\schemas\
 * DO NOT EDIT - Regenerate from schemas when desktop models change
 */

// Core Enums (from core-enums.json)
export type MotionType = "pro" | "anti" | "float" | "dash" | "static";
export type HandMotionType = "shift" | "dash" | "static";
export type HandPath = "cw" | "ccw" | "dash" | "static";
export type RotationDirection = "cw" | "ccw" | "no_rot";
export type Orientation = "in" | "out" | "clock" | "counter";
export type Location = "n" | "e" | "s" | "w" | "ne" | "se" | "sw" | "nw";

export type GridPosition =
  | "alpha1"
  | "alpha2"
  | "alpha3"
  | "alpha4"
  | "alpha5"
  | "alpha6"
  | "alpha7"
  | "alpha8"
  | "beta1"
  | "beta2"
  | "beta3"
  | "beta4"
  | "beta5"
  | "beta6"
  | "beta7"
  | "beta8"
  | "gamma1"
  | "gamma2"
  | "gamma3"
  | "gamma4"
  | "gamma5"
  | "gamma6"
  | "gamma7"
  | "gamma8"
  | "gamma9"
  | "gamma10"
  | "gamma11"
  | "gamma12"
  | "gamma13"
  | "gamma14"
  | "gamma15"
  | "gamma16";

export type VTGMode = "SS" | "SO" | "TS" | "TO" | "QS" | "QO";
export type ElementalType = "water" | "fire" | "earth" | "air" | "sun" | "moon";
export type LetterType =
  | "Type1"
  | "Type2"
  | "Type3"
  | "Type4"
  | "Type5"
  | "Type6"
  | "Type7"
  | "Type8"
  | "Type9";
export type ArrowColor = "red" | "blue";
export type GridMode = "diamond" | "box";

// Motion Data (from motion-data-v2.json)
export interface MotionData {
  motion_type: MotionType;
  prop_rot_dir: RotationDirection;
  start_loc: Location;
  end_loc: Location;
  turns: number;
  start_ori: Orientation;
  end_ori: Orientation;
}

// Glyph Data (from glyph-data.json)
export interface GlyphData {
  vtg_mode?: VTGMode | null;
  elemental_type?: ElementalType | null;
  letter_type?: LetterType | null;
  has_dash?: boolean;
  turns_data?: string | null;
  start_position?: string | null;
  end_position?: string | null;
  show_elemental?: boolean;
  show_vtg?: boolean;
  show_tka?: boolean;
  show_positions?: boolean;
}

// Beat Data (from beat-data-v2.json)
export interface BeatData {
  id: string;
  beat_number: number;
  letter?: string | null;
  duration?: number;
  blue_motion?: MotionData | null;
  red_motion?: MotionData | null;
  glyph_data?: GlyphData | null;
  blue_reversal?: boolean;
  red_reversal?: boolean;
  is_blank?: boolean;
  metadata?: {
    is_start_position?: boolean;
    [key: string]: any;
  };
}

// Sequence Data (from sequence-data-v2.json)
export interface SequenceData {
  id: string;
  name: string;
  word: string;
  beats: BeatData[];
  start_position?: GridPosition | null;
  metadata?: {
    author?: string;
    description?: string;
    difficulty?: number;
    tags?: string[];
    created_at?: string;
    modified_at?: string;
    version?: string;
    [key: string]: any;
  };
}

// Utility types for immutable operations
export interface BeatDataUpdate extends Partial<BeatData> {}
export interface SequenceDataUpdate extends Partial<SequenceData> {}

// Factory functions (to be implemented to match Python behavior)
export interface BeatDataFactory {
  empty(): BeatData;
  fromDict(data: Record<string, any>): BeatData;
}

export interface SequenceDataFactory {
  empty(): SequenceData;
  fromDict(data: Record<string, any>): SequenceData;
}

/**
 * ISequenceConverterService Contract
 *
 * Service for converting SequenceData to MotionConfig3D.
 * Bridges 2D sequence data model with 3D animation system.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
import type { MotionData } from "$lib/shared/pictograph/shared/domain/models/MotionData";
import type { MotionConfig3D } from "../../domain/models/MotionData3D";
import type { Plane } from "../../domain/enums/Plane";

/**
 * Motion configurations for a single beat
 */
export interface BeatMotionConfigs {
  beatNumber: number;
  blue: MotionConfig3D | null;
  red: MotionConfig3D | null;
}

export interface ISequenceConverterService {
  /**
   * Convert a MotionData object to MotionConfig3D
   */
  motionDataToConfig3D(motion: MotionData, plane?: Plane): MotionConfig3D;

  /**
   * Extract motion configs from a BeatData object
   */
  beatDataToConfigs(beat: BeatData, plane?: Plane): BeatMotionConfigs;

  /**
   * Convert an entire sequence to an array of beat motion configs
   * Filters out beat 0 (start position)
   */
  sequenceToMotionConfigs(sequence: SequenceData, plane?: Plane): BeatMotionConfigs[];

  /**
   * Get start position configs from sequence
   */
  getStartPositionConfigs(sequence: SequenceData, plane?: Plane): BeatMotionConfigs | null;

  /**
   * Create default motion config
   */
  createDefaultConfig(plane?: Plane): MotionConfig3D;
}

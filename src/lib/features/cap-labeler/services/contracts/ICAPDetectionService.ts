import type { SequenceEntry } from "../../domain/models/sequence-models";
import type { CandidateDesignation, BeatPairGroups, TransformationIntervals } from "../../domain/models/label-models";
import type { BeatPairRelationship } from "./IBeatPairAnalysisService";
import type { ComponentId } from "../../domain/constants/cap-components";
import type { PolyrhythmicCAPResult } from "./IPolyrhythmicDetectionService";

/**
 * Result of CAP detection on a sequence
 */
export interface CAPDetectionResult {
  /** Primary cap type string (e.g., "rotated_swapped") */
  capType: string | null;

  /** Detected transformation components */
  components: ComponentId[];

  /** Per-transformation interval configuration */
  transformationIntervals: TransformationIntervals;

  /** Rotation direction for quartered patterns */
  rotationDirection: "cw" | "ccw" | null;

  /** All candidate designations (can be multiple equally valid) */
  candidateDesignations: CandidateDesignation[];

  /** Beat-pair relationships for display */
  beatPairs: BeatPairRelationship[];

  /** Beat pairs grouped by transformation pattern */
  beatPairGroups: BeatPairGroups;

  /** Is this a circular sequence? */
  isCircular: boolean;

  /** Is this a freeform pattern (circular but no recognized CAP)? */
  isFreeform: boolean;

  /** Is this a modular pattern (multiple different but recognizable transformations)? */
  isModular: boolean;

  // === POLYRHYTHMIC DETECTION (runs alongside beat-pair detection) ===

  /** Polyrhythmic analysis result */
  polyrhythmic: PolyrhythmicCAPResult | null;

  /** Is this a polyrhythmic pattern? */
  isPolyrhythmic: boolean;
}

/**
 * Service for detecting CAP patterns in sequences
 *
 * Computes designations on-the-fly from sequence data,
 * eliminating the need to store them in Firebase.
 */
export interface ICAPDetectionService {
  /**
   * Detect CAP patterns in a sequence
   * Returns computed designations without storing anything
   */
  detectCAP(sequence: SequenceEntry): CAPDetectionResult;

  /**
   * Check if a sequence is circular (ends where it started)
   */
  isCircular(sequence: SequenceEntry): boolean;
}

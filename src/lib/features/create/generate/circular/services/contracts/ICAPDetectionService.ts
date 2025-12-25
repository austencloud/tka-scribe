/**
 * CAP Detection Service Contract
 *
 * Service for detecting and classifying Continuous Assembly Patterns (CAPs)
 * in existing sequences. This is the reverse of CAP generation - given a sequence,
 * determine what CAP type (if any) it follows.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { CAPType, SliceSize } from "../../domain/models/circular-models";
import type { CAPComponent } from "../../../shared/domain/models/generate-models";

/**
 * Describes a transformation at a specific interval
 */
export interface IntervalTransformation {
  /** The interval at which this transformation occurs */
  interval: SliceSize;
  /** The transformation component detected */
  component: CAPComponent;
  /** Human-readable description */
  description: string;
}

/**
 * Describes a compound CAP pattern with multiple transformations at different intervals
 */
export interface CompoundPattern {
  /** Whether this is a compound pattern (multiple intervals) */
  isCompound: true;
  /** Transformations at quartered interval (90°) */
  quarteredTransformations: CAPComponent[];
  /** Transformations at halved interval (180°) */
  halvedTransformations: CAPComponent[];
  /** Combined human-readable description like "90° CCW Rotated (quartered) + Swapped (halved)" */
  description: string;
}

/**
 * Result of CAP type detection on a sequence
 */
export interface CAPDetectionResult {
  /** Does the sequence return to its start position with matching orientations? */
  isCircular: boolean;

  /** The detected CAP type (null if circular but not a recognized pattern) */
  capType: CAPType | null;

  /** Slice size for rotational patterns (HALVED = 180°, QUARTERED = 90°) */
  sliceSize: SliceSize | null;

  /**
   * Detection confidence level:
   * - 'strict': All transformation rules match exactly
   * - 'probable': Most rules match, minor deviations
   * - 'accidental': Circular by coincidence, not a structured CAP
   */
  confidence: "strict" | "probable" | "accidental";

  /**
   * Compound pattern info when transformations occur at different intervals
   * e.g., rotation at quartered + swap at halved
   */
  compoundPattern?: CompoundPattern;
}

/**
 * Service interface for CAP detection
 */
export interface ICAPDetectionService {
  /**
   * Analyze a sequence and detect its CAP type
   * @param sequence - The sequence to analyze
   * @returns Detection result with CAP type, slice size, and confidence
   */
  detectCAPType(sequence: SequenceData): CAPDetectionResult;

  /**
   * Batch detect CAP types for multiple sequences
   * Uses chunked processing to avoid blocking UI
   * @param sequences - Array of sequences to analyze
   * @returns Promise of detection results
   */
  batchDetect(sequences: SequenceData[]): Promise<CAPDetectionResult[]>;

  /**
   * Quick check if a sequence is circular (without full CAP analysis)
   * @param sequence - The sequence to check
   * @returns True if sequence returns to start position with matching orientations
   */
  isCircular(sequence: SequenceData): boolean;
}

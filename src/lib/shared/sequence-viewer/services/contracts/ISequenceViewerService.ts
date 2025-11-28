/**
 * Sequence Viewer Service Contract
 *
 * Provides operations for loading, viewing, and editing sequences
 * in the standalone Sequence Viewer context.
 */

import type { SequenceData } from "../../../foundation/domain/models/SequenceData";
import type { BeatData } from "$lib/modules/create/shared/domain/models/BeatData";

export interface ISequenceViewerService {
	// ============================================
	// SEQUENCE LOADING
	// ============================================

	/**
	 * Load a sequence by ID from persistence
	 * @param sequenceId - The sequence ID to load
	 * @returns The sequence data or null if not found
	 */
	loadSequence(sequenceId: string): Promise<SequenceData | null>;

	/**
	 * Decode a sequence from a URL-encoded string
	 * @param encodedSequence - Base64 encoded sequence data
	 * @returns The decoded sequence data
	 */
	decodeSequence(encodedSequence: string): SequenceData | null;

	// ============================================
	// SEQUENCE MUTATIONS (Immutable - returns new sequence)
	// ============================================

	/**
	 * Update orientation for a beat
	 * @returns New sequence with updated beat
	 */
	updateBeatOrientation(
		sequence: SequenceData,
		beatIndex: number,
		color: string,
		orientation: string
	): SequenceData;

	/**
	 * Update turn amount for a beat
	 * @returns New sequence with updated beat
	 */
	updateBeatTurns(
		sequence: SequenceData,
		beatIndex: number,
		color: string,
		turnAmount: number | "fl"
	): SequenceData;

	/**
	 * Remove a beat from the sequence
	 * @returns New sequence without the beat
	 */
	removeBeat(sequence: SequenceData, beatIndex: number): SequenceData;

	// ============================================
	// PERSISTENCE
	// ============================================

	/**
	 * Save sequence changes to persistence
	 */
	saveSequence(sequence: SequenceData): Promise<void>;

	// ============================================
	// THUMBNAILS & URLS
	// ============================================

	/**
	 * Get the thumbnail URL for a sequence
	 */
	getThumbnailUrl(sequence: SequenceData, variationIndex?: number): string;

	/**
	 * Encode sequence for URL sharing
	 */
	encodeForUrl(sequence: SequenceData): string;

	/**
	 * Generate a shareable deep link URL
	 */
	generateShareUrl(sequence: SequenceData): string;

	// ============================================
	// BEAT DATA HELPERS
	// ============================================

	/**
	 * Get BeatData for a specific beat index
	 * @param beatIndex - 0 = start position, 1+ = beats
	 */
	getBeatData(sequence: SequenceData, beatIndex: number): BeatData | null;
}

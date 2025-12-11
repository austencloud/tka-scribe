/**
 * Sequence Cache Service Interface
 *
 * Manages cache lifecycle when sequences change or playback stops.
 * Ensures memory is properly released to prevent leaks.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

/**
 * Callback for when caches should be cleared
 */
export type CacheClearCallback = () => void;

/**
 * Service for managing sequence-related cache lifecycle
 */
export interface ISequenceCacheService {
	/**
	 * Set callback for when caches need to be cleared
	 */
	setClearCallback(callback: CacheClearCallback): void;

	/**
	 * Update with new sequence data - clears caches if sequence changed
	 * @returns The new sequence ID if changed, null otherwise
	 */
	handleSequenceChange(sequenceData: SequenceData | null): string | null;

	/**
	 * Handle playback state change - clears pre-rendered frames when stopped
	 */
	handlePlaybackChange(isPlaying: boolean): void;

	/**
	 * Get current sequence ID
	 */
	getCurrentSequenceId(): string | null;

	/**
	 * Clean up resources
	 */
	dispose(): void;
}

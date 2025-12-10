/**
 * Animation Visibility Sync Service Interface
 *
 * Provides a clean interface for components to subscribe to all
 * animation visibility settings at once, eliminating repetitive
 * individual state variable syncing.
 */

/**
 * All visibility settings as a single object
 */
export interface AnimationVisibilityState {
	grid: boolean;
	beatNumbers: boolean;
	props: boolean;
	trails: boolean;
	tkaGlyph: boolean;
	turnNumbers: boolean;
	blueMotion: boolean;
	redMotion: boolean;
}

/**
 * Callback for visibility state changes
 */
export type VisibilityStateCallback = (state: AnimationVisibilityState) => void;

/**
 * Service for syncing animation visibility state
 */
export interface IAnimationVisibilitySyncService {
	/**
	 * Get current visibility state
	 */
	getState(): AnimationVisibilityState;

	/**
	 * Subscribe to visibility changes
	 * @returns Unsubscribe function
	 */
	subscribe(callback: VisibilityStateCallback): () => void;

	/**
	 * Clean up resources
	 */
	dispose(): void;
}

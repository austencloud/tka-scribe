/**
 * Animation Playback State
 *
 * Runtime playback state for animation instances.
 * NOT persisted - this is ephemeral state for active animations.
 *
 * Each animation viewer creates its own playback state instance.
 * Multiple animations can run simultaneously with independent state.
 *
 * Includes:
 * - Current beat position
 * - Playing/paused status
 * - Prop render states (positions, angles)
 * - Sequence metadata
 */

import type { SequenceData } from '$shared';
import type { PropState } from '../domain';

/**
 * Complete playback state for an animation instance
 */
export interface PlaybackState {
	// Playback position
	currentBeat: number;
	isPlaying: boolean;

	// Sequence info
	totalBeats: number;
	sequenceWord: string;
	sequenceAuthor: string;
	sequenceData: SequenceData | null;

	// Prop states
	bluePropState: PropState;
	redPropState: PropState;

	// Loading state
	loading: boolean;
	error: string | null;
}

// ============================================================================
// DEFAULTS
// ============================================================================

const DEFAULT_PROP_STATE: PropState = {
	centerPathAngle: 0,
	staffRotationAngle: 0
};

const DEFAULT_PLAYBACK_STATE: PlaybackState = {
	currentBeat: 0,
	isPlaying: false,
	totalBeats: 0,
	sequenceWord: '',
	sequenceAuthor: '',
	sequenceData: null,
	bluePropState: { ...DEFAULT_PROP_STATE },
	redPropState: { ...DEFAULT_PROP_STATE },
	loading: false,
	error: null
};

// ============================================================================
// STATE FACTORY
// ============================================================================

export type AnimationPlaybackState = {
	// Read-only access
	readonly currentBeat: number;
	readonly isPlaying: boolean;
	readonly totalBeats: number;
	readonly sequenceWord: string;
	readonly sequenceAuthor: string;
	readonly sequenceData: SequenceData | null;
	readonly bluePropState: PropState;
	readonly redPropState: PropState;
	readonly loading: boolean;
	readonly error: string | null;

	// Computed
	readonly progress: number; // 0-1 progress through sequence
	readonly hasSequence: boolean;
	readonly canPlay: boolean;

	// Playback control
	setCurrentBeat: (beat: number) => void;
	setIsPlaying: (playing: boolean) => void;
	play: () => void;
	pause: () => void;
	togglePlayback: () => void;
	seekTo: (beat: number) => void;
	seekToProgress: (progress: number) => void;

	// Sequence management
	setSequenceData: (data: SequenceData | null) => void;
	setTotalBeats: (beats: number) => void;
	setSequenceMetadata: (word: string, author: string) => void;

	// Prop state updates (called by animation orchestrator)
	setBluePropState: (state: PropState) => void;
	setRedPropState: (state: PropState) => void;
	setPropStates: (blue: PropState, red: PropState) => void;

	// Loading state
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;

	// Reset
	reset: () => void;
};

/**
 * Create a new animation playback state instance.
 * Each animation viewer should create its own instance.
 */
export function createAnimationPlaybackState(): AnimationPlaybackState {
	// Playback state
	let currentBeat = $state(0);
	let isPlaying = $state(false);

	// Sequence info
	let totalBeats = $state(0);
	let sequenceWord = $state('');
	let sequenceAuthor = $state('');
	let sequenceData = $state<SequenceData | null>(null);

	// Prop states
	let bluePropState = $state<PropState>({ ...DEFAULT_PROP_STATE });
	let redPropState = $state<PropState>({ ...DEFAULT_PROP_STATE });

	// Loading state
	let loading = $state(false);
	let error = $state<string | null>(null);

	return {
		// Read-only getters
		get currentBeat() {
			return currentBeat;
		},
		get isPlaying() {
			return isPlaying;
		},
		get totalBeats() {
			return totalBeats;
		},
		get sequenceWord() {
			return sequenceWord;
		},
		get sequenceAuthor() {
			return sequenceAuthor;
		},
		get sequenceData() {
			return sequenceData;
		},
		get bluePropState() {
			return bluePropState;
		},
		get redPropState() {
			return redPropState;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},

		// Computed
		get progress() {
			return totalBeats > 0 ? currentBeat / totalBeats : 0;
		},
		get hasSequence() {
			return sequenceData !== null && (sequenceData.beats?.length ?? 0) > 0;
		},
		get canPlay() {
			return !loading && !error && sequenceData !== null && (sequenceData.beats?.length ?? 0) > 0;
		},

		// Playback control
		setCurrentBeat: (beat: number) => {
			currentBeat = Math.max(0, beat);
		},

		setIsPlaying: (playing: boolean) => {
			isPlaying = playing;
		},

		play: () => {
			if (sequenceData && (sequenceData.beats?.length ?? 0) > 0) {
				isPlaying = true;
			}
		},

		pause: () => {
			isPlaying = false;
		},

		togglePlayback: () => {
			if (isPlaying) {
				isPlaying = false;
			} else if (sequenceData && (sequenceData.beats?.length ?? 0) > 0) {
				isPlaying = true;
			}
		},

		seekTo: (beat: number) => {
			currentBeat = Math.max(0, Math.min(beat, totalBeats));
		},

		seekToProgress: (progress: number) => {
			const clampedProgress = Math.max(0, Math.min(1, progress));
			currentBeat = clampedProgress * totalBeats;
		},

		// Sequence management
		setSequenceData: (data: SequenceData | null) => {
			sequenceData = data;
			if (data) {
				totalBeats = data.beats?.length ?? 0;
				sequenceWord = data.word ?? data.name ?? '';
				sequenceAuthor = (data.metadata?.['creator'] as string) ?? '';
			} else {
				totalBeats = 0;
				sequenceWord = '';
				sequenceAuthor = '';
			}
			// Reset playback position when sequence changes
			currentBeat = 0;
			isPlaying = false;
			error = null;
		},

		setTotalBeats: (beats: number) => {
			totalBeats = beats;
		},

		setSequenceMetadata: (word: string, author: string) => {
			sequenceWord = word;
			sequenceAuthor = author;
		},

		// Prop state updates
		setBluePropState: (state: PropState) => {
			bluePropState = { ...state };
		},

		setRedPropState: (state: PropState) => {
			redPropState = { ...state };
		},

		setPropStates: (blue: PropState, red: PropState) => {
			bluePropState = { ...blue };
			redPropState = { ...red };
		},

		// Loading state
		setLoading: (isLoading: boolean) => {
			loading = isLoading;
		},

		setError: (err: string | null) => {
			error = err;
			if (err) {
				isPlaying = false;
			}
		},

		// Reset
		reset: () => {
			currentBeat = 0;
			isPlaying = false;
			totalBeats = 0;
			sequenceWord = '';
			sequenceAuthor = '';
			sequenceData = null;
			bluePropState = { ...DEFAULT_PROP_STATE };
			redPropState = { ...DEFAULT_PROP_STATE };
			loading = false;
			error = null;
		}
	};
}

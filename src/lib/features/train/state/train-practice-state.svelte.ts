/**
 * Train Practice State
 *
 * Manages practice mode settings and configuration for the Practice tab.
 * Also persists last-used sequence and recent sequence history for quick resume.
 */

import { PracticeMode } from "../domain/enums/TrainEnums";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

const MAX_RECENT_SEQUENCES = 3;

interface AdaptiveConfig {
	sensitivity: number; // Frames to match before advancing (5-30)
	autoAdvance: boolean;
}

interface StepConfig {
	voiceCues: boolean;
	voiceKeyword: string; // Default: "next"
	requiredConfirmation: "tap" | "voice" | "both";
}

interface TimedConfig {
	bpm: number;
	strictTiming: boolean;
	showTimingFeedback: boolean;
}

interface RecentSequence {
	id: string;
	name: string;
	word?: string;
	beatCount: number;
	lastPracticedAt: number; // timestamp
}

interface PracticeState {
	currentMode: PracticeMode;
	adaptiveConfig: AdaptiveConfig;
	stepConfig: StepConfig;
	timedConfig: TimedConfig;
	currentChallengeId?: string;
	// Sequence persistence
	lastSequenceId: string | null;
	lastSequenceData: SequenceData | null;
	recentSequences: RecentSequence[];
}

const DEFAULT_STATE: PracticeState = {
	currentMode: PracticeMode.TIMED,
	adaptiveConfig: {
		sensitivity: 10,
		autoAdvance: true
	},
	stepConfig: {
		voiceCues: true,
		voiceKeyword: "next",
		requiredConfirmation: "tap"
	},
	timedConfig: {
		bpm: 120,
		strictTiming: true,
		showTimingFeedback: true
	},
	lastSequenceId: null,
	lastSequenceData: null,
	recentSequences: []
};

export function createTrainPracticeState() {
	// Load from localStorage if available (with SSR guard)
	let savedState: Partial<PracticeState> = {};
	if (typeof window !== "undefined") {
		try {
			const saved = localStorage.getItem("train-practice-state");
			if (saved) {
				savedState = JSON.parse(saved);
			}
		} catch (error) {
			console.warn("[train-practice-state] Failed to load from localStorage:", error);
		}
	}

	const state = $state<PracticeState>({
		...DEFAULT_STATE,
		...savedState
	});

	function setMode(mode: PracticeMode) {
		state.currentMode = mode;
		persistSettings();
	}

	function updateAdaptiveConfig(config: Partial<AdaptiveConfig>) {
		state.adaptiveConfig = { ...state.adaptiveConfig, ...config };
		persistSettings();
	}

	function updateStepConfig(config: Partial<StepConfig>) {
		state.stepConfig = { ...state.stepConfig, ...config };
		persistSettings();
	}

	function updateTimedConfig(config: Partial<TimedConfig>) {
		state.timedConfig = { ...state.timedConfig, ...config };
		persistSettings();
	}

	function getCurrentModeConfig(): AdaptiveConfig | StepConfig | TimedConfig {
		switch (state.currentMode) {
			case PracticeMode.ADAPTIVE:
				return state.adaptiveConfig;
			case PracticeMode.STEP_BY_STEP:
				return state.stepConfig;
			case PracticeMode.TIMED:
				return state.timedConfig;
		}
	}

	function loadChallenge(challengeId: string) {
		state.currentChallengeId = challengeId;
	}

	function clearChallenge() {
		state.currentChallengeId = undefined;
	}

	/**
	 * Set the last-used sequence for quick resume on next visit
	 */
	function setLastSequence(sequence: SequenceData) {
		state.lastSequenceId = sequence.id;
		state.lastSequenceData = sequence;
		persistSettings();
	}

	/**
	 * Clear the last-used sequence (e.g., when user clicks back)
	 */
	function clearLastSequence() {
		state.lastSequenceId = null;
		state.lastSequenceData = null;
		persistSettings();
	}

	/**
	 * Add a sequence to recent history after a training session completes
	 */
	function addToRecentSequences(sequence: SequenceData) {
		const recentEntry: RecentSequence = {
			id: sequence.id,
			name: sequence.name ?? sequence.word ?? "Untitled",
			word: sequence.word,
			beatCount: sequence.beats?.length ?? 0,
			lastPracticedAt: Date.now()
		};

		// Remove if already exists (will re-add at front)
		const filtered = state.recentSequences.filter((s) => s.id !== sequence.id);

		// Add to front and limit to MAX_RECENT_SEQUENCES
		state.recentSequences = [recentEntry, ...filtered].slice(0, MAX_RECENT_SEQUENCES);
		persistSettings();
	}

	/**
	 * Check if we have a sequence ready for instant resume
	 */
	function hasLastSequence(): boolean {
		return state.lastSequenceId !== null && state.lastSequenceData !== null;
	}

	function persistSettings() {
		if (typeof window !== "undefined") {
			try {
				localStorage.setItem("train-practice-state", JSON.stringify(state));
			} catch (error) {
				console.warn("[train-practice-state] Failed to persist settings:", error);
			}
		}
	}

	return {
		get currentMode() {
			return state.currentMode;
		},
		get adaptiveConfig() {
			return state.adaptiveConfig;
		},
		get stepConfig() {
			return state.stepConfig;
		},
		get timedConfig() {
			return state.timedConfig;
		},
		get currentChallengeId() {
			return state.currentChallengeId;
		},
		get lastSequenceId() {
			return state.lastSequenceId;
		},
		get lastSequenceData() {
			return state.lastSequenceData;
		},
		get recentSequences() {
			return state.recentSequences;
		},
		setMode,
		updateAdaptiveConfig,
		updateStepConfig,
		updateTimedConfig,
		getCurrentModeConfig,
		loadChallenge,
		clearChallenge,
		setLastSequence,
		clearLastSequence,
		addToRecentSequences,
		hasLastSequence,
		persistSettings
	};
}

// Global singleton instance
let practiceStateInstance: ReturnType<typeof createTrainPracticeState> | null = null;

export function getTrainPracticeState() {
	if (!practiceStateInstance) {
		practiceStateInstance = createTrainPracticeState();
	}
	return practiceStateInstance;
}

export type { AdaptiveConfig, StepConfig, TimedConfig, PracticeState, RecentSequence };

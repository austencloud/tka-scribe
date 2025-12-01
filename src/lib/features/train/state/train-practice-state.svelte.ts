/**
 * Train Practice State
 *
 * Manages practice mode settings and configuration for the Practice tab.
 */

import { PracticeMode } from "../domain/enums/TrainEnums";

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

interface PracticeState {
	currentMode: PracticeMode;
	adaptiveConfig: AdaptiveConfig;
	stepConfig: StepConfig;
	timedConfig: TimedConfig;
	currentChallengeId?: string;
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
	}
};

export function createTrainPracticeState() {
	// Load from localStorage if available
	const saved = localStorage.getItem("train-practice-state");
	const state = $state<PracticeState>(
		saved ? { ...DEFAULT_STATE, ...JSON.parse(saved) } : { ...DEFAULT_STATE }
	);

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

	function persistSettings() {
		localStorage.setItem("train-practice-state", JSON.stringify(state));
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
		setMode,
		updateAdaptiveConfig,
		updateStepConfig,
		updateTimedConfig,
		getCurrentModeConfig,
		loadChallenge,
		clearChallenge,
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

export type { AdaptiveConfig, StepConfig, TimedConfig, PracticeState };

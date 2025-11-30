/**
 * Train Challenges State
 *
 * Manages UI state for the Challenges tab.
 */

interface ChallengesTabState {
	selectedChallengeId: string | null;
	filter: "all" | "active" | "completed";
	sortBy: "difficulty" | "xp" | "deadline";
}

const DEFAULT_STATE: ChallengesTabState = {
	selectedChallengeId: null,
	filter: "active",
	sortBy: "deadline"
};

export function createTrainChallengesState() {
	const state = $state<ChallengesTabState>({ ...DEFAULT_STATE });

	function selectChallenge(challengeId: string | null) {
		state.selectedChallengeId = challengeId;
	}

	function setFilter(filter: "all" | "active" | "completed") {
		state.filter = filter;
	}

	function setSortBy(sortBy: "difficulty" | "xp" | "deadline") {
		state.sortBy = sortBy;
	}

	return {
		get selectedChallengeId() {
			return state.selectedChallengeId;
		},
		get filter() {
			return state.filter;
		},
		get sortBy() {
			return state.sortBy;
		},
		selectChallenge,
		setFilter,
		setSortBy
	};
}

export type { ChallengesTabState };

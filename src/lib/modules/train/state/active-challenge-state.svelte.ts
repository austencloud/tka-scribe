/**
 * Active Challenge State
 *
 * Manages the currently active challenge for the Practice tab.
 * When a challenge is started from the Challenges tab, it's stored here
 * and the Practice tab can read it to configure appropriately.
 */

import type { TrainChallenge } from "../domain/models/TrainChallengeModels";

class ActiveChallengeState {
	activeChallenge = $state<TrainChallenge | null>(null);

	setActiveChallenge(challenge: TrainChallenge | null) {
		this.activeChallenge = challenge;
		console.log("Active challenge set:", challenge?.title ?? "none");
	}

	clearActiveChallenge() {
		this.activeChallenge = null;
	}

	get hasActiveChallenge(): boolean {
		return this.activeChallenge !== null;
	}
}

export const activeChallengeState = new ActiveChallengeState();

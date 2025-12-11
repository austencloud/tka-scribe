/**
 * Animation Visibility Sync Service Implementation
 *
 * Provides a clean interface for components to subscribe to all
 * animation visibility settings at once.
 */

import { getAnimationVisibilityManager } from "../../state/animation-visibility-state.svelte";
import type {
	IAnimationVisibilitySyncService,
	AnimationVisibilityState,
	VisibilityStateCallback,
} from "../contracts/IAnimationVisibilitySyncService";

export class AnimationVisibilitySyncService implements IAnimationVisibilitySyncService {
	private manager = getAnimationVisibilityManager();
	private callbacks: Set<VisibilityStateCallback> = new Set();
	private boundObserver: () => void;

	constructor() {
		this.boundObserver = () => this.notifySubscribers();
		this.manager.registerObserver(this.boundObserver);
	}

	getState(): AnimationVisibilityState {
		return {
			grid: this.manager.getVisibility("grid"),
			beatNumbers: this.manager.getVisibility("beatNumbers"),
			props: this.manager.getVisibility("props"),
			trails: this.manager.getVisibility("trails"),
			tkaGlyph: this.manager.getVisibility("tkaGlyph"),
			turnNumbers: this.manager.getVisibility("turnNumbers"),
			blueMotion: this.manager.getVisibility("blueMotion"),
			redMotion: this.manager.getVisibility("redMotion"),
		};
	}

	subscribe(callback: VisibilityStateCallback): () => void {
		this.callbacks.add(callback);
		// Immediately call with current state
		callback(this.getState());

		// Return unsubscribe function
		return () => {
			this.callbacks.delete(callback);
		};
	}

	dispose(): void {
		this.manager.unregisterObserver(this.boundObserver);
		this.callbacks.clear();
	}

	private notifySubscribers(): void {
		const state = this.getState();
		this.callbacks.forEach((callback) => {
			try {
				callback(state);
			} catch (error) {
				console.error("[AnimationVisibilitySyncService] Error in callback:", error);
			}
		});
	}
}

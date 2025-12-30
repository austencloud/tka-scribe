<script lang="ts">
	/**
	 * MovementUpdater
	 *
	 * Runs per-frame movement updates for avatar locomotion.
	 * Uses Threlte's useTask for consistent timing with the render loop.
	 *
	 * PROOF OF CONCEPT - Movement loop for locomotion MVP.
	 *
	 * This is a render-less component - it only runs logic, no visual output.
	 */
	import { useTask } from '@threlte/core';

	interface MovementState {
		position: { x: number; z: number };
		moveTarget: { x: number; z: number } | null;
		isMoving: boolean;
	}

	interface Props {
		/**
		 * The avatar state object with position and movement methods.
		 * Must have: position, moveTarget, isMoving, and an updateMovement method.
		 */
		avatarState: {
			position: { x: number; z: number };
			moveTarget: { x: number; z: number } | null;
			isMoving: boolean;
			updateMovement: (delta: number) => void;
		};
		/** Whether movement updates are enabled */
		enabled?: boolean;
	}

	let { avatarState, enabled = true }: Props = $props();

	// Run movement update every frame
	useTask((delta) => {
		if (!enabled) return;
		if (!avatarState.isMoving) return;

		avatarState.updateMovement(delta);
	});
</script>

<!-- Render-less component - no visual output -->

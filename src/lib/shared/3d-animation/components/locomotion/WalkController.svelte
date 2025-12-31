<script lang="ts">
	/**
	 * WalkController
	 *
	 * Orchestrates click-to-move locomotion for an avatar.
	 * Combines ground detection, movement updates, and visual feedback.
	 *
	 * PROOF OF CONCEPT - Main locomotion controller for MVP.
	 *
	 * Usage:
	 * ```svelte
	 * <WalkController avatarState={avatar1State} enabled={locomotionEnabled} />
	 * ```
	 *
	 * The avatarState must implement:
	 * - position: { x: number, z: number }
	 * - moveTarget: { x: number, z: number } | null
	 * - isMoving: boolean
	 * - facingAngle: number
	 * - setMoveTarget(target: { x: number, z: number }): void
	 * - updateMovement(delta: number): void
	 * - cancelMovement(): void
	 */
	import GroundClickPlane from './GroundClickPlane.svelte';
	import MoveTargetIndicator from './MoveTargetIndicator.svelte';
	import MovementUpdater from './MovementUpdater.svelte';

	// Minimal interface for avatar state compatibility
	interface LocomotionState {
		position: { x: number; z: number };
		moveTarget: { x: number; z: number } | null;
		isMoving: boolean;
		setMoveTarget: (target: { x: number; z: number }) => void;
		updateMovement: (delta: number) => void;
		cancelMovement?: () => void;
	}

	interface Props {
		/** Avatar state with locomotion methods */
		avatarState: LocomotionState;
		/** Whether locomotion is enabled */
		enabled?: boolean;
		/** Y position of the ground plane */
		groundY?: number;
		/** Color of the move target indicator */
		indicatorColor?: string;
	}

	let {
		avatarState,
		enabled = true,
		groundY = -100,
		indicatorColor = '#4fc3f7'
	}: Props = $props();

	function handleGroundClick(point: { x: number; z: number }) {
		if (!enabled) return;
		avatarState.setMoveTarget(point);
	}
</script>

<!-- Movement update loop (runs per frame) -->
<MovementUpdater {avatarState} {enabled} />

<!-- Invisible click detection plane -->
<GroundClickPlane onGroundClick={handleGroundClick} {enabled} {groundY} />

<!-- Visual feedback for movement target -->
<MoveTargetIndicator target={avatarState.moveTarget} groundY={groundY + 5} color={indicatorColor} />

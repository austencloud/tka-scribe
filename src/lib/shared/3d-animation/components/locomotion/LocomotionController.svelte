<script lang="ts">
	/**
	 * LocomotionController
	 *
	 * Orchestrates WASD movement with third-person camera.
	 * Main entry point for avatar locomotion system.
	 *
	 * PROOF OF CONCEPT - Orchestrator for locomotion MVP.
	 *
	 * Usage:
	 * ```svelte
	 * <LocomotionController avatarState={activeAvatarState} enabled={locomotionMode} />
	 * ```
	 *
	 * The avatarState must implement:
	 * - position: { x: number, z: number }
	 * - facingAngle: number
	 * - isMoving: boolean
	 * - setMoveInput(input: { x: number, z: number }): void
	 * - updateMovement(delta: number, cameraAngle: number): void
	 */
	import { useTask } from '@threlte/core';
	import WASDController from './WASDController.svelte';
	import ThirdPersonCamera from './ThirdPersonCamera.svelte';

	// Minimal interface for avatar state compatibility
	interface LocomotionState {
		position: { x: number; y?: number; z: number };
		facingAngle: number;
		isMoving: boolean;
		setMoveInput: (input: { x: number; z: number }) => void;
		updateMovement: (delta: number, cameraAngle: number) => void;
	}

	interface Props {
		/** Avatar state with locomotion methods */
		avatarState: LocomotionState;
		/** Whether locomotion is enabled */
		enabled?: boolean;
		/** Distance of camera behind avatar */
		cameraDistance?: number;
		/** Height of camera above avatar */
		cameraHeight?: number;
		/** Camera follow damping (0-1, higher = snappier) */
		cameraDamping?: number;
	}

	let {
		avatarState,
		enabled = true,
		cameraDistance = 300,
		cameraHeight = 150,
		cameraDamping = 0.08
	}: Props = $props();

	// Current camera angle for camera-relative movement
	let cameraAngle = $state(0);

	// Handle WASD input
	function handleInput(input: { x: number; z: number }) {
		if (!enabled) return;
		avatarState.setMoveInput(input);
	}

	// Receive camera angle updates
	function handleCameraAngle(angle: number) {
		cameraAngle = angle;
	}

	// Update movement each frame
	useTask((delta) => {
		if (!enabled) return;
		avatarState.updateMovement(delta, cameraAngle);
	});
</script>

<!-- WASD keyboard input handler -->
<WASDController onInput={handleInput} {enabled} />

<!-- Third-person follow camera -->
<ThirdPersonCamera
	target={avatarState.position}
	targetAngle={avatarState.facingAngle}
	distance={cameraDistance}
	height={cameraHeight}
	damping={cameraDamping}
	onAngleChange={handleCameraAngle}
/>

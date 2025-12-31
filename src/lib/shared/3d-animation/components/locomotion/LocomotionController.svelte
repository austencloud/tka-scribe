<script lang="ts">
	/**
	 * LocomotionController
	 *
	 * Orchestrates WASD movement with third-person camera.
	 * Game-style controls with pointer lock:
	 * - Click canvas to capture mouse
	 * - Mouse movement orbits camera freely
	 * - WASD to move (relative to camera direction)
	 * - Avatar faces camera direction
	 * - Escape to release mouse
	 *
	 * Usage:
	 * ```svelte
	 * <LocomotionController avatarState={activeAvatarState} enabled={locomotionMode} />
	 * ```
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
		/** Distance of camera from avatar */
		cameraDistance?: number;
		/** Height of camera above avatar */
		cameraHeight?: number;
		/** Callback when pointer lock state changes */
		onPointerLockChange?: (locked: boolean) => void;
	}

	let {
		avatarState,
		enabled = true,
		cameraDistance = 400,
		cameraHeight = 200,
		onPointerLockChange
	}: Props = $props();

	// Current camera angle - use a mutable ref for immediate updates
	// (Svelte state batches updates which causes lag in movement direction)
	let cameraAngleRef = { current: 0 };

	// Handle WASD input
	function handleInput(input: { x: number; z: number }) {
		if (!enabled) return;
		avatarState.setMoveInput(input);
	}

	// Receive camera angle updates - store immediately in ref
	function handleCameraAngle(angle: number) {
		cameraAngleRef.current = angle;
	}

	// Track pointer lock state and notify parent
	function handlePointerLockChange(locked: boolean) {
		onPointerLockChange?.(locked);
	}

	// Update movement each frame using the latest camera angle
	useTask((delta) => {
		if (!enabled) return;
		avatarState.updateMovement(delta, cameraAngleRef.current);
	});
</script>

<!-- WASD keyboard input handler -->
<WASDController onInput={handleInput} {enabled} />

<!-- Third-person follow camera with pointer lock -->
<ThirdPersonCamera
	target={avatarState.position}
	distance={cameraDistance}
	height={cameraHeight}
	onAngleChange={handleCameraAngle}
	onPointerLockChange={handlePointerLockChange}
/>


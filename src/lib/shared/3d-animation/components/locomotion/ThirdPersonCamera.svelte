<script lang="ts">
	/**
	 * ThirdPersonCamera
	 *
	 * Camera that follows behind the avatar with smooth damping.
	 * Provides an over-the-shoulder third-person view.
	 *
	 * PROOF OF CONCEPT - Follow camera for locomotion MVP.
	 *
	 * The camera:
	 * - Stays behind the avatar at a fixed distance
	 * - Smoothly follows position changes with damping
	 * - Reports its angle for camera-relative movement
	 */
	import { T, useTask, useThrelte } from '@threlte/core';
	import { Vector3 } from 'three';
	import type { PerspectiveCamera } from 'three';

	interface Props {
		/** Target position to follow (avatar position) */
		target: { x: number; y?: number; z: number };
		/** Target's facing angle in radians (avatar rotation) */
		targetAngle: number;
		/** Distance behind target */
		distance?: number;
		/** Height above target */
		height?: number;
		/** How quickly camera follows (0-1, higher = snappier) */
		damping?: number;
		/** Callback with current camera angle (used for movement direction) */
		onAngleChange?: (angle: number) => void;
	}

	let {
		target,
		targetAngle,
		distance = 300,
		height = 150,
		damping = 0.08,
		onAngleChange
	}: Props = $props();

	const { invalidate } = useThrelte();

	// Camera reference for lookAt updates
	let cameraRef = $state<PerspectiveCamera | null>(null);

	// Current smoothed camera position
	let currentPosition = $state({
		x: target.x - Math.sin(targetAngle) * distance,
		y: (target.y ?? 0) + height,
		z: target.z - Math.cos(targetAngle) * distance
	});

	// Current smoothed look-at point (slightly above avatar)
	let currentLookAt = $state({
		x: target.x,
		y: (target.y ?? 0) + 50,
		z: target.z
	});

	// Run every frame to update camera position
	useTask((delta) => {
		// Calculate ideal camera position (behind and above avatar)
		const idealX = target.x - Math.sin(targetAngle) * distance;
		const idealY = (target.y ?? 0) + height;
		const idealZ = target.z - Math.cos(targetAngle) * distance;

		// Smooth interpolation factor (frame-rate independent)
		// Using exponential damping: lerp factor = 1 - (1-damping)^(delta*60)
		const lerpFactor = 1 - Math.pow(1 - damping, delta * 60);

		// Smoothly move camera toward ideal position
		currentPosition.x += (idealX - currentPosition.x) * lerpFactor;
		currentPosition.y += (idealY - currentPosition.y) * lerpFactor;
		currentPosition.z += (idealZ - currentPosition.z) * lerpFactor;

		// Smooth look-at target (point above avatar's center)
		const idealLookY = (target.y ?? 0) + 50;
		currentLookAt.x += (target.x - currentLookAt.x) * lerpFactor;
		currentLookAt.y += (idealLookY - currentLookAt.y) * lerpFactor;
		currentLookAt.z += (target.z - currentLookAt.z) * lerpFactor;

		// Update camera lookAt
		if (cameraRef) {
			cameraRef.lookAt(currentLookAt.x, currentLookAt.y, currentLookAt.z);
		}

		// Calculate camera's forward angle for movement direction
		// This is the angle from camera to target, used for camera-relative controls
		const dx = target.x - currentPosition.x;
		const dz = target.z - currentPosition.z;
		const cameraAngle = Math.atan2(dx, dz);

		// Report camera angle for movement calculations
		onAngleChange?.(cameraAngle);

		// Force re-render
		invalidate();
	});
</script>

<!--
  Third-person perspective camera.
  - Uses makeDefault to become the active camera
  - Position smoothly follows avatar
  - LookAt updated in useTask for smooth tracking
-->
<T.PerspectiveCamera
	makeDefault
	bind:ref={cameraRef}
	position={[currentPosition.x, currentPosition.y, currentPosition.z]}
	fov={60}
	near={1}
	far={6000}
	oncreate={(ref) => {
		// Initial lookAt
		ref.lookAt(currentLookAt.x, currentLookAt.y, currentLookAt.z);
	}}
/>

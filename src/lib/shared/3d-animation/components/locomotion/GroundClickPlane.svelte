<script lang="ts">
	/**
	 * GroundClickPlane
	 *
	 * Invisible plane that detects clicks for movement targeting.
	 * Positioned at ground level, spanning the walkable area.
	 *
	 * PROOF OF CONCEPT - Basic click detection for locomotion MVP.
	 */
	import { T } from '@threlte/core';
	import { interactivity } from '@threlte/extras';
	import type { Vector3 } from 'three';

	interface Props {
		onGroundClick: (point: { x: number; z: number }) => void;
		enabled?: boolean;
		/** Y position of the ground plane */
		groundY?: number;
	}

	let { onGroundClick, enabled = true, groundY = -100 }: Props = $props();

	// Enable click detection for this component tree
	interactivity();

	// Threlte click event type with intersection point
	interface ThrelteClickEvent {
		stopPropagation: () => void;
		point: Vector3;
	}

	function handleClick(event: ThrelteClickEvent) {
		if (!enabled) return;

		// Stop propagation to prevent OrbitControls from handling
		event.stopPropagation();

		const point = event.point;
		onGroundClick({ x: point.x, z: point.z });
	}
</script>

<!--
  Large invisible plane at ground level.
  Rotated to face upward (XZ plane).
  Using transparent material so it's invisible but clickable.
-->
<T.Mesh position.y={groundY} rotation.x={-Math.PI / 2} onclick={handleClick}>
	<T.PlaneGeometry args={[2000, 2000]} />
	<T.MeshBasicMaterial visible={false} transparent opacity={0} />
</T.Mesh>

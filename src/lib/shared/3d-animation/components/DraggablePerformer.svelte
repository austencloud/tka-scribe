<script lang="ts">
	/**
	 * DraggablePerformer
	 *
	 * Wrapper component that provides visual feedback for performer selection/dragging.
	 * Click detection is handled by raycasting against the actual Avatar3D mesh.
	 */

	import { T } from '@threlte/core';
	import * as THREE from 'three';
	import type { Snippet } from 'svelte';

	interface Props {
		/** Current position */
		position: { x: number; y?: number; z: number };
		/** Whether this performer is active/selected */
		isActive: boolean;
		/** Whether this performer is currently being dragged */
		isDragging?: boolean;
		/** Children content (Avatar3D, Staff3D, etc.) */
		children: Snippet;
	}

	let {
		position,
		isActive,
		isDragging = false,
		children
	}: Props = $props();

	// Ring size for selection indicator
	const RING_RADIUS = 60;
</script>

<!-- Selection ring on ground (visible when active or dragging) -->
{#if isActive || isDragging}
	<T.Group position.x={position.x} position.z={position.z}>
		<T.Mesh rotation.x={-Math.PI / 2} position.y={1}>
			<T.RingGeometry args={[RING_RADIUS - 5, RING_RADIUS + 5, 32]} />
			<T.MeshBasicMaterial
				color={isDragging ? '#4caf50' : '#64b5f6'}
				transparent
				opacity={isDragging ? 0.6 : 0.3}
				side={THREE.DoubleSide}
			/>
		</T.Mesh>
	</T.Group>
{/if}

<!-- Actual performer content (Avatar, Props, Label) rendered as children -->
{@render children()}

<script lang="ts">
	/**
	 * DraggablePerformer
	 *
	 * Wrapper component that enables click-and-drag positioning for performers.
	 * Uses an invisible hitbox cylinder for interaction detection.
	 */

	import { T } from '@threlte/core';
	import * as THREE from 'three';
	import type { Snippet } from 'svelte';

	interface Props {
		/** Current position */
		position: { x: number; y?: number; z: number };
		/** Whether this performer is active/selected */
		isActive: boolean;
		/** Performer index for identification */
		index: number;
		/** Called when performer is clicked (to select) */
		onSelect: () => void;
		/** Called when position changes during drag */
		onPositionChange: (position: { x: number; z: number }) => void;
		/** Called when drag starts */
		onDragStart?: () => void;
		/** Called when drag ends */
		onDragEnd?: () => void;
		/** Children content (Avatar3D, Staff3D, etc.) */
		children: Snippet;
	}

	let {
		position,
		isActive,
		index,
		onSelect,
		onPositionChange,
		onDragStart,
		onDragEnd,
		children
	}: Props = $props();

	// Drag state
	let isDragging = $state(false);
	let isHovered = $state(false);

	// Hitbox dimensions - sized to match the avatar model closely
	// Avatar is approximately 180 units wide and 400 units tall
	const HITBOX_RADIUS = 80;
	const HITBOX_HEIGHT = 380;

	// Debug: make hitbox visible (set to false for production)
	const DEBUG_HITBOX = false;

	function handlePointerDown(event: ThreltePointerEvent) {
		onSelect();
		isDragging = true;
		onDragStart?.();
		event.stopPropagation?.();
	}

	function handlePointerUp(event: ThreltePointerEvent) {
		if (isDragging) {
			isDragging = false;
			onDragEnd?.();
		}
	}

	function handlePointerEnter(event: ThreltePointerEvent) {
		isHovered = true;
	}

	function handlePointerLeave(event: ThreltePointerEvent) {
		if (!isDragging) {
			isHovered = false;
		}
	}

	// Type for Threlte pointer events
	type ThreltePointerEvent = {
		stopPropagation?: () => void;
		point?: THREE.Vector3;
		nativeEvent?: PointerEvent;
	};
</script>

<!-- Invisible hitbox for interaction -->
<T.Group position.x={position.x} position.z={position.z}>
	<!-- Clickable cylinder around avatar - named for raycaster identification -->
	<T.Mesh
		position.y={HITBOX_HEIGHT / 2}
		name={`PERFORMER_HITBOX_${index}`}
	>
		<T.CylinderGeometry args={[HITBOX_RADIUS, HITBOX_RADIUS, HITBOX_HEIGHT, 16]} />
		<!-- Invisible when not debugging, but still raycastable -->
		<T.MeshBasicMaterial
			transparent
			opacity={DEBUG_HITBOX ? 0.3 : 0}
			color={isActive ? '#64b5f6' : '#ff00ff'}
			depthWrite={false}
		/>
	</T.Mesh>

	<!-- Selection ring on ground (visible when active or dragging) -->
	{#if isActive || isDragging}
		<T.Mesh rotation.x={-Math.PI / 2} position.y={1}>
			<T.RingGeometry args={[HITBOX_RADIUS - 5, HITBOX_RADIUS + 5, 32]} />
			<T.MeshBasicMaterial
				color={isDragging ? '#4caf50' : '#64b5f6'}
				transparent
				opacity={isDragging ? 0.6 : 0.3}
				side={THREE.DoubleSide}
			/>
		</T.Mesh>
	{/if}
</T.Group>

<!-- Actual performer content (Avatar, Props, Label) rendered as children -->
{@render children()}

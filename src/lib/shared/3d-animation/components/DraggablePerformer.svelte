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

	// Hitbox dimensions - must be large enough to cover the avatar model
	// Avatar is approximately 180 units wide and 400 units tall
	const HITBOX_RADIUS = 120;
	const HITBOX_HEIGHT = 450;

	// Debug: make hitbox visible (set to false for production)
	const DEBUG_HITBOX = true;

	function handlePointerDown(event: ThreltePointerEvent) {
		console.log('[DraggablePerformer] CLICK on performer', index);
		// Select this performer
		onSelect();

		// Start drag
		isDragging = true;
		onDragStart?.();

		// Prevent orbit controls from taking over
		event.stopPropagation?.();
	}

	function handlePointerUp(event: ThreltePointerEvent) {
		console.log('[DraggablePerformer] POINTER UP on performer', index);
		if (isDragging) {
			isDragging = false;
			onDragEnd?.();
		}
	}

	function handlePointerEnter(event: ThreltePointerEvent) {
		console.log('[DraggablePerformer] HOVER ENTER on performer', index);
		isHovered = true;
	}

	function handlePointerLeave(event: ThreltePointerEvent) {
		console.log('[DraggablePerformer] HOVER LEAVE on performer', index);
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
		<!-- Using solid material for reliable raycasting - transparency can interfere -->
		<T.MeshStandardMaterial
			transparent={DEBUG_HITBOX}
			opacity={DEBUG_HITBOX ? 0.3 : 1}
			color={isActive ? '#64b5f6' : '#ff00ff'}
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

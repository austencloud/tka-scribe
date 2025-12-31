<script lang="ts">
	/**
	 * ManualRaycaster
	 *
	 * Implements manual raycasting for click detection on 3D objects.
	 * Bypasses Threlte's interactivity plugin which has issues with multiple Three.js instances.
	 */
	import { useThrelte } from '@threlte/core';
	import * as THREE from 'three';
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		/** Callback when a mesh is clicked, with the mesh and intersection point */
		onMeshClick?: (mesh: THREE.Object3D, point: THREE.Vector3) => void;
		/** Callback when pointer is released */
		onPointerUp?: () => void;
		/** Callback when mouse enters a mesh */
		onMeshEnter?: (mesh: THREE.Object3D) => void;
		/** Callback when mouse leaves a mesh */
		onMeshLeave?: (mesh: THREE.Object3D) => void;
	}

	let { onMeshClick, onPointerUp, onMeshEnter, onMeshLeave }: Props = $props();

	const { scene, camera, renderer } = useThrelte();

	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2();

	let currentHovered: THREE.Object3D | null = null;
	let canvasElement: HTMLCanvasElement | null = null;

	function getCanvasCoords(event: PointerEvent): THREE.Vector2 {
		if (!canvasElement) return pointer;

		const rect = canvasElement.getBoundingClientRect();
		pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

		return pointer;
	}

	function findIntersection(event: PointerEvent): THREE.Intersection | null {
		const cam = camera.current;
		if (!cam || !scene) return null;

		getCanvasCoords(event);
		raycaster.setFromCamera(pointer, cam);

		// Only raycast against meshes (not lights, cameras, etc.)
		const intersects = raycaster.intersectObjects(scene.children, true);

		// Find first mesh intersection
		for (const intersection of intersects) {
			if (intersection.object instanceof THREE.Mesh) {
				return intersection;
			}
		}

		return null;
	}

	function handlePointerDown(event: PointerEvent) {
		const intersection = findIntersection(event);
		if (intersection) {
			const meshName = intersection.object.name || intersection.object.uuid;
			console.log('🎯 ManualRaycaster: HIT', meshName, 'callback exists:', !!onMeshClick);
			if (onMeshClick) {
				onMeshClick(intersection.object, intersection.point);
				console.log('🎯 ManualRaycaster: Callback invoked');
			}
		} else {
			console.log('🎯 ManualRaycaster: MISS (no mesh hit)');
		}
	}

	function handlePointerUp(event: PointerEvent) {
		console.log('🎯 ManualRaycaster: pointerup');
		onPointerUp?.();
	}

	function handlePointerMove(event: PointerEvent) {
		const intersection = findIntersection(event);
		const hitObject = intersection?.object ?? null;

		if (hitObject !== currentHovered) {
			if (currentHovered) {
				onMeshLeave?.(currentHovered);
			}
			if (hitObject) {
				onMeshEnter?.(hitObject);
			}
			currentHovered = hitObject;
		}
	}

	onMount(() => {
		// Get the canvas from the renderer
		canvasElement = renderer?.domElement ?? null;
		if (!canvasElement) {
			console.error('[ManualRaycaster] Could not find canvas element');
			return;
		}

		console.log('[ManualRaycaster] Attached to canvas');
		canvasElement.addEventListener('pointerdown', handlePointerDown);
		canvasElement.addEventListener('pointerup', handlePointerUp);
		canvasElement.addEventListener('pointermove', handlePointerMove);
	});

	onDestroy(() => {
		if (canvasElement) {
			canvasElement.removeEventListener('pointerdown', handlePointerDown);
			canvasElement.removeEventListener('pointerup', handlePointerUp);
			canvasElement.removeEventListener('pointermove', handlePointerMove);
		}
	});
</script>

<script lang="ts">
	/**
	 * MoveTargetIndicator
	 *
	 * Visual indicator showing where the avatar is moving to.
	 * Displays a pulsing ring at the target location.
	 *
	 * PROOF OF CONCEPT - Visual feedback for locomotion MVP.
	 */
	import { T, useTask } from '@threlte/core';

	interface Props {
		target: { x: number; z: number } | null;
		/** Y position of the indicator */
		groundY?: number;
		/** Color of the indicator */
		color?: string;
	}

	let { target, groundY = -95, color = '#4fc3f7' }: Props = $props();

	// Pulse animation state
	let time = $state(0);

	// Animate while target exists
	useTask((delta) => {
		if (target) {
			time += delta * 5; // Speed of pulse
		}
	});

	// Derived animation values
	const pulse = $derived(Math.sin(time) * 0.5 + 0.5); // 0-1 range
	const scale = $derived(0.8 + pulse * 0.4);
	const opacity = $derived(0.3 + pulse * 0.4);
</script>

{#if target}
	<T.Group position.x={target.x} position.y={groundY} position.z={target.z}>
		<!-- Outer ring that pulses -->
		<T.Mesh rotation.x={-Math.PI / 2} scale={[scale, scale, 1]}>
			<T.RingGeometry args={[15, 20, 32]} />
			<T.MeshBasicMaterial {color} transparent {opacity} side={2} depthWrite={false} />
		</T.Mesh>

		<!-- Center dot (static) -->
		<T.Mesh rotation.x={-Math.PI / 2} position.y={0.1}>
			<T.CircleGeometry args={[5, 16]} />
			<T.MeshBasicMaterial {color} transparent opacity={0.8} depthWrite={false} />
		</T.Mesh>

		<!-- Direction indicator (small line toward origin for reference) -->
		<T.Mesh rotation.x={-Math.PI / 2} position.y={0.05}>
			<T.RingGeometry args={[22, 24, 4, 1, 0, Math.PI / 4]} />
			<T.MeshBasicMaterial {color} transparent opacity={0.5} side={2} depthWrite={false} />
		</T.Mesh>
	</T.Group>
{/if}

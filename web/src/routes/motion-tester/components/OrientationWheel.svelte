<!--
OrientationWheel.svelte - Visual circular orientation selector

Replaces dropdown with intuitive circular arrangement showing 
In/Out/Clock/Counter orientations with directional icons.
-->
<script lang="ts">
	import type { Orientation } from '$lib/domain/enums';

	interface Props {
		selectedOrientation: Orientation;
		onOrientationChange: (orientation: Orientation) => void;
		label: string;
		color: string;
	}

	let { selectedOrientation, onOrientationChange, label, color }: Props = $props();

	const orientations = [
		{ id: 'in', label: 'In', icon: '↑', position: 'top' },
		{ id: 'clock', label: 'Clock', icon: '↻', position: 'right' },
		{ id: 'out', label: 'Out', icon: '↓', position: 'bottom' },
		{ id: 'counter', label: 'Counter', icon: '↺', position: 'left' }
	];

	function handleOrientationClick(orientationId: string) {
		onOrientationChange(orientationId as Orientation);
	}

	function isSelected(orientationId: string): boolean {
		return orientationId.toLowerCase() === selectedOrientation.toLowerCase();
	}
</script>

<div class="orientation-wheel-container">
	<div class="wheel-label">{label}</div>
	<div class="orientation-wheel" style="--accent-color: {color}">
		{#each orientations as orientation}
			<button
				class="orientation-btn {orientation.position}"
				class:selected={isSelected(orientation.id)}
				onclick={() => handleOrientationClick(orientation.id)}
				aria-label={`Select ${orientation.label} orientation`}
				title={`${orientation.label} orientation`}
			>
				<span class="orientation-icon">{orientation.icon}</span>
				<span class="orientation-label">{orientation.label}</span>
			</button>
		{/each}
		
		<!-- Center indicator -->
		<div class="center-indicator">
			<span class="center-dot"></span>
		</div>
	</div>
</div>

<style>
	.orientation-wheel-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}

	.wheel-label {
		font-size: 11px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.orientation-wheel {
		position: relative;
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.orientation-btn {
		position: absolute;
		width: 32px;
		height: 32px;
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 0.7);
		font-size: 10px;
		font-weight: 600;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
		gap: 1px;
	}

	.orientation-btn:hover {
		background: rgba(var(--accent-color), 0.2);
		border-color: rgba(var(--accent-color), 0.4);
		color: white;
		transform: scale(1.1);
	}

	.orientation-btn.selected {
		background: linear-gradient(135deg, rgba(var(--accent-color), 0.3), rgba(var(--accent-color), 0.2));
		border-color: rgba(var(--accent-color), 0.6);
		color: white;
		box-shadow: 
			0 0 8px rgba(var(--accent-color), 0.3),
			inset 0 1px 2px rgba(255, 255, 255, 0.1);
	}

	/* Position buttons around the circle */
	.orientation-btn.top {
		top: -16px;
		left: 50%;
		transform: translateX(-50%);
	}

	.orientation-btn.right {
		top: 50%;
		right: -16px;
		transform: translateY(-50%);
	}

	.orientation-btn.bottom {
		bottom: -16px;
		left: 50%;
		transform: translateX(-50%);
	}

	.orientation-btn.left {
		top: 50%;
		left: -16px;
		transform: translateY(-50%);
	}

	.orientation-btn.top.selected,
	.orientation-btn.top:hover {
		transform: translateX(-50%) scale(1.1);
	}

	.orientation-btn.right.selected,
	.orientation-btn.right:hover {
		transform: translateY(-50%) scale(1.1);
	}

	.orientation-btn.bottom.selected,
	.orientation-btn.bottom:hover {
		transform: translateX(-50%) scale(1.1);
	}

	.orientation-btn.left.selected,
	.orientation-btn.left:hover {
		transform: translateY(-50%) scale(1.1);
	}

	.orientation-icon {
		font-size: 14px;
		line-height: 1;
	}

	.orientation-label {
		font-size: 8px;
		line-height: 1;
		text-transform: uppercase;
		letter-spacing: 0.3px;
	}

	.center-indicator {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.center-dot {
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.3);
	}

	/* Focus styles for accessibility */
	.orientation-btn:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgba(var(--accent-color), 0.5);
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.orientation-wheel {
			width: 70px;
			height: 70px;
		}

		.orientation-btn {
			width: 28px;
			height: 28px;
			font-size: 9px;
		}

		.orientation-btn.top,
		.orientation-btn.bottom {
			top: -14px;
		}

		.orientation-btn.bottom {
			bottom: -14px;
			top: auto;
		}

		.orientation-btn.left,
		.orientation-btn.right {
			left: -14px;
		}

		.orientation-btn.right {
			right: -14px;
			left: auto;
		}

		.orientation-icon {
			font-size: 12px;
		}

		.orientation-label {
			font-size: 7px;
		}
	}
</style>

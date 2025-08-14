<!--
MotionTypeButtons.svelte - Visual motion type selector

Replaces dropdown with styled button group showing motion types
with intuitive icons and better visual feedback.
-->
<script lang="ts">
	import type { MotionType } from '$lib/domain/enums';

	interface Props {
		selectedMotionType: MotionType;
		onMotionTypeChange: (motionType: MotionType) => void;
		onTurnsChange?: (turns: number | "fl") => void; // For setting turns to "fl" when float is selected
		color: string;
		availableMotionTypes?: string[]; // Optional prop for filtering
	}

	let { selectedMotionType, onMotionTypeChange, onTurnsChange, color, availableMotionTypes }: Props = $props();

	const allMotionTypes = [
		{ id: 'pro', label: 'Pro', description: 'Pronation - Natural circular motion' },
		{ id: 'anti', label: 'Anti', description: 'Anti-pronation - Reverse circular motion' },
		{ id: 'float', label: 'Float', description: 'Float motion - Negative turns' },
		{ id: 'dash', label: 'Dash', description: 'Dash motion - Opposite locations' },
		{ id: 'static', label: 'Static', description: 'Static motion - Same location' }
	];

	// Filter motion types based on available types, or show all if not specified
	let motionTypes = $derived.by(() => {
		if (!availableMotionTypes || availableMotionTypes.length === 0) {
			return allMotionTypes;
		}
		return allMotionTypes.filter(type => availableMotionTypes.includes(type.id));
	});

	function handleMotionTypeClick(motionTypeId: string) {
		const motionType = motionTypeId as MotionType;
		onMotionTypeChange(motionType);

		// If user selects float, automatically set turns to "fl"
		if (motionType === 'float' && onTurnsChange) {
			onTurnsChange("fl");
		}
	}

	function isSelected(motionTypeId: string): boolean {
		return motionTypeId.toLowerCase() === selectedMotionType.toLowerCase();
	}
</script>

<div class="motion-type-container">
	<div class="motion-label">Motion Type</div>
	<div class="motion-type-buttons" style="--accent-color: {color}">
		{#each motionTypes as motionType}
			<button
				class="motion-btn"
				class:selected={isSelected(motionType.id)}
				onclick={() => handleMotionTypeClick(motionType.id)}
				aria-label={`Select ${motionType.label} motion type`}
				title={motionType.description}
			>
				<span class="motion-label-text">{motionType.label}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.motion-type-container {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.motion-label {
		font-size: 11px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		text-align: center;
	}

	.motion-type-buttons {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 6px;
		padding: 8px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.motion-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px 12px;
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 0.7);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 56px;
		flex: 1;
	}

	.motion-btn:hover {
		background: rgba(var(--accent-color), 0.2);
		border-color: rgba(var(--accent-color), 0.4);
		color: white;
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.motion-btn.selected {
		background: linear-gradient(135deg, rgba(var(--accent-color), 0.3), rgba(var(--accent-color), 0.2));
		border-color: rgba(var(--accent-color), 0.6);
		color: white;
		box-shadow: 
			0 0 8px rgba(var(--accent-color), 0.3),
			inset 0 1px 2px rgba(255, 255, 255, 0.1);
	}

	.motion-label-text {
		font-size: 11px;
		line-height: 1;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Focus styles for accessibility */
	.motion-btn:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgba(var(--accent-color), 0.5);
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.motion-type-buttons {
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: repeat(2, 1fr);
		}

		.motion-btn {
			padding: 10px 6px;
			min-height: 42px;
		}

		.motion-label-text {
			font-size: 10px;
		}
	}

	@media (max-width: 480px) {
		.motion-type-buttons {
			gap: 3px;
			padding: 3px;
		}

		.motion-btn {
			padding: 8px 4px;
			min-height: 38px;
		}

		.motion-label-text {
			font-size: 9px;
		}
	}
</style>

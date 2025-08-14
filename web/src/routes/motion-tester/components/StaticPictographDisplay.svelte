<!--
StaticPictographDisplay.svelte - Static pictograph display

Shows the pictograph at its initial state (progress = 0) for the left side
of the static vs animated comparison. Clean, minimal display with no controls.
-->
<script lang="ts">
	import type { MotionTesterState } from '../state/motion-tester-state.svelte';
	import Pictograph from '$lib/components/pictograph/Pictograph.svelte';
	import { createPictographData, createGridData } from '$lib/domain';
	import { GridMode, MotionType, Location, Orientation, RotationDirection } from '$lib/domain/enums';

	interface Props {
		motionState: MotionTesterState;
	}

	let { motionState }: Props = $props();

	// Fixed size for consistent layout
	const PICTOGRAPH_SIZE = 280;

	// Create pictograph data for static display (always at progress = 0)
	function createStaticPictographData() {
		try {
			const gridMode = motionState.gridType === 'diamond' ? GridMode.DIAMOND : GridMode.BOX;
			
			const gridData = createGridData({
				grid_mode: gridMode
			});

			const pictographData = createPictographData({
				id: 'motion-tester-static-pictograph',
				grid_data: gridData,
				arrows: {},
				props: {},
				motions: {
					blue: {
						motion_type: motionState.blueMotionParams.motionType as MotionType,
						start_loc: motionState.blueMotionParams.startLoc as Location,
						end_loc: motionState.blueMotionParams.endLoc as Location,
						start_ori: motionState.blueMotionParams.startOri as Orientation,
						end_ori: motionState.blueMotionParams.endOri as Orientation,
						prop_rot_dir: motionState.blueMotionParams.propRotDir as RotationDirection,
						turns: motionState.blueMotionParams.turns,
						is_visible: true
					},
					red: {
						motion_type: motionState.redMotionParams.motionType as MotionType,
						start_loc: motionState.redMotionParams.startLoc as Location,
						end_loc: motionState.redMotionParams.endLoc as Location,
						start_ori: motionState.redMotionParams.startOri as Orientation,
						end_ori: motionState.redMotionParams.endOri as Orientation,
						prop_rot_dir: motionState.redMotionParams.propRotDir as RotationDirection,
						turns: motionState.redMotionParams.turns,
						is_visible: true
					}
				},
				letter: 'T', // T for "Tester"
				beat: 1,
				is_blank: false,
				is_mirrored: false,
				metadata: {
					source: 'motion_tester_static',
					grid_type: motionState.gridType,
					progress: 0 // Always show initial state
				}
			});

			return pictographData;
		} catch (error) {
			console.error('Error creating static pictograph data:', error);
			return null;
		}
	}

	let pictographData = $derived(createStaticPictographData());
</script>

<div class="static-pictograph-display">
	<div class="display-header">
		<h3>Static</h3>
		<span class="state-indicator">Initial State</span>
	</div>

	<div class="pictograph-container">
		{#if pictographData}
			<div class="pictograph-wrapper">
				<Pictograph
					pictographData={pictographData}
					width={PICTOGRAPH_SIZE}
					height={PICTOGRAPH_SIZE}
					debug={false}
					beatNumber={null}
				/>
			</div>
		{:else}
			<div class="error-state">
				<span class="error-icon">⚠️</span>
				<p>Unable to display pictograph</p>
			</div>
		{/if}
	</div>

	<!-- Motion summary -->
	<div class="motion-summary">
		<div class="prop-info blue">
			<span class="prop-dot"></span>
			<span class="prop-text">
				{motionState.blueMotionParams.startLoc.toUpperCase()} → {motionState.blueMotionParams.endLoc.toUpperCase()}
			</span>
		</div>
		<div class="prop-info red">
			<span class="prop-dot"></span>
			<span class="prop-text">
				{motionState.redMotionParams.startLoc.toUpperCase()} → {motionState.redMotionParams.endLoc.toUpperCase()}
			</span>
		</div>
	</div>
</div>

<style>
	.static-pictograph-display {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(59, 130, 246, 0.05));
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		overflow: hidden;
	}

	.display-header {
		background: linear-gradient(135deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.1));
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		padding: 12px 16px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-shrink: 0;
	}

	.display-header h3 {
		margin: 0;
		color: #e0e7ff;
		font-size: 1rem;
		font-weight: 600;
	}

	.state-indicator {
		font-size: 11px;
		color: #a5b4fc;
		background: rgba(0, 0, 0, 0.2);
		padding: 2px 6px;
		border-radius: 4px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.pictograph-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
		min-height: 300px;
	}

	.pictograph-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.02);
		padding: 10px;
	}

	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #f87171;
		text-align: center;
		padding: 20px;
	}

	.error-icon {
		font-size: 24px;
		margin-bottom: 8px;
	}

	.error-state p {
		margin: 0;
		font-size: 14px;
		color: #fca5a5;
	}

	.motion-summary {
		background: rgba(0, 0, 0, 0.1);
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		padding: 12px 16px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		flex-shrink: 0;
	}

	.prop-info {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
	}

	.prop-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.prop-info.blue .prop-dot {
		background: #60a5fa;
	}

	.prop-info.red .prop-dot {
		background: #f87171;
	}

	.prop-text {
		color: #c7d2fe;
		font-weight: 500;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.pictograph-container {
			padding: 15px;
			min-height: 250px;
		}

		.display-header {
			padding: 10px 12px;
		}

		.display-header h3 {
			font-size: 0.9rem;
		}

		.motion-summary {
			padding: 10px 12px;
		}
	}
</style>

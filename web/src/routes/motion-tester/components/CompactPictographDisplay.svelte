<!--
CompactPictographDisplay.svelte - Responsive pictograph visualization

A compact, responsive version of the pictograph display that scales appropriately
within the motion tester layout. Includes zoom controls and responsive sizing.
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

	// Local state for display options
	let showBeatNumbers = $state(true);
	let zoomLevel = $state(1.0);
	let showDebugInfo = $state(false);

	// Container dimensions for responsive sizing
	let containerElement: HTMLDivElement;
	let containerWidth = $state(300);
	let containerHeight = $state(300);

	// Calculate display size based on zoom and container
	let displaySize = $derived(() => {
		const baseSize = Math.min(containerWidth, containerHeight, 300);
		return Math.floor(baseSize * zoomLevel);
	});

	// Helper function to cast string to enum safely
	function castToMotionType(value: string): MotionType {
		return value as MotionType;
	}

	function castToLocation(value: string): Location {
		return value as Location;
	}

	function castToOrientation(value: string): Orientation {
		return value as Orientation;
	}

	function castToRotationDirection(value: string): RotationDirection {
		return value as RotationDirection;
	}

	// Create pictograph data from current motion state
	let pictographData = $derived(() => {
		return createPictographData({
			id: 'motion-tester-pictograph',
			grid_data: createGridData({
				grid_mode: motionState.gridType === 'diamond' ? GridMode.DIAMOND : GridMode.BOX
			}),
			arrows: {},
			props: {},
			motions: {
				blue: {
					motion_type: castToMotionType(motionState.blueMotionParams.motionType),
					start_loc: castToLocation(motionState.blueMotionParams.startLoc),
					end_loc: castToLocation(motionState.blueMotionParams.endLoc),
					start_ori: castToOrientation(motionState.blueMotionParams.startOri),
					end_ori: castToOrientation(motionState.blueMotionParams.endOri),
					prop_rot_dir: castToRotationDirection(motionState.blueMotionParams.propRotDir),
					turns: motionState.blueMotionParams.turns,
					is_visible: true
				},
				red: {
					motion_type: castToMotionType(motionState.redMotionParams.motionType),
					start_loc: castToLocation(motionState.redMotionParams.startLoc),
					end_loc: castToLocation(motionState.redMotionParams.endLoc),
					start_ori: castToOrientation(motionState.redMotionParams.startOri),
					end_ori: castToOrientation(motionState.redMotionParams.endOri),
					prop_rot_dir: castToRotationDirection(motionState.redMotionParams.propRotDir),
					turns: motionState.redMotionParams.turns,
					is_visible: true
				}
			},
			letter: 'T', // T for "Tester"
			beat: 1,
			is_blank: false,
			is_mirrored: false,
			metadata: {
				source: 'motion_tester',
				grid_type: motionState.gridType
			}
		});
	});

	// ResizeObserver to track container size
	$effect(() => {
		if (containerElement) {
			const resizeObserver = new ResizeObserver(entries => {
				const entry = entries[0];
				if (entry) {
					containerWidth = entry.contentRect.width;
					containerHeight = entry.contentRect.height;
				}
			});

			resizeObserver.observe(containerElement);
			
			return () => {
				resizeObserver.disconnect();
			};
		}
	});

	// Zoom control functions
	function zoomIn() {
		zoomLevel = Math.min(zoomLevel + 0.1, 2.0);
	}

	function zoomOut() {
		zoomLevel = Math.max(zoomLevel - 0.1, 0.5);
	}

	function resetZoom() {
		zoomLevel = 1.0;
	}

	function toggleBeatNumbers() {
		showBeatNumbers = !showBeatNumbers;
	}

	function toggleDebug() {
		showDebugInfo = !showDebugInfo;
	}

	// Keyboard shortcuts
	function handleKeyDown(event: KeyboardEvent) {
		if (event.ctrlKey || event.metaKey) {
			switch (event.key) {
				case '=':
				case '+':
					event.preventDefault();
					zoomIn();
					break;
				case '-':
					event.preventDefault();
					zoomOut();
					break;
				case '0':
					event.preventDefault();
					resetZoom();
					break;
			}
		}
		
		// Other shortcuts
		switch (event.key) {
			case 'b':
			case 'B':
				event.preventDefault();
				toggleBeatNumbers();
				break;
			case 'd':
			case 'D':
				if (event.shiftKey) {
					event.preventDefault();
					toggleDebug();
				}
				break;
		}
	}
</script>

<div 
	class="compact-pictograph-display"
	bind:this={containerElement}
	role="region"
	aria-label="Motion pictograph visualization"
	tabindex="-1"
	onkeydown={handleKeyDown}
>
	<div class="display-header">
		<h3>🎨 Motion Visualization</h3>
		
		<div class="display-controls">
			<!-- Zoom Controls -->
			<div class="zoom-controls" role="group" aria-label="Zoom controls">
				<button
					class="control-btn zoom-btn"
					onclick={zoomOut}
					disabled={zoomLevel <= 0.5}
					aria-label="Zoom out"
					title="Zoom out (Ctrl + -)"
				>
					<span aria-hidden="true">🔍−</span>
				</button>
				
				<span class="zoom-level" aria-live="polite">
					{Math.round(zoomLevel * 100)}%
				</span>
				
				<button
					class="control-btn zoom-btn"
					onclick={zoomIn}
					disabled={zoomLevel >= 2.0}
					aria-label="Zoom in"
					title="Zoom in (Ctrl + +)"
				>
					<span aria-hidden="true">🔍+</span>
				</button>
				
				<button
					class="control-btn reset-btn"
					onclick={resetZoom}
					aria-label="Reset zoom to 100%"
					title="Reset zoom (Ctrl + 0)"
				>
					<span aria-hidden="true">↺</span>
				</button>
			</div>

			<!-- Display Options -->
			<div class="display-options" role="group" aria-label="Display options">
				<button
					class="control-btn option-btn {showBeatNumbers ? 'active' : ''}"
					onclick={toggleBeatNumbers}
					aria-pressed={showBeatNumbers}
					aria-label="Toggle beat numbers"
					title="Toggle beat numbers (B)"
				>
					<span aria-hidden="true">🔢</span>
				</button>
				
				<button
					class="control-btn option-btn {showDebugInfo ? 'active' : ''}"
					onclick={toggleDebug}
					aria-pressed={showDebugInfo}
					aria-label="Toggle debug information"
					title="Toggle debug mode (Shift + D)"
				>
					<span aria-hidden="true">🐛</span>
				</button>
			</div>
		</div>
	</div>

	<!-- Pictograph Container -->
	<div class="pictograph-container" style:--display-size="{displaySize()}px">
		<div class="pictograph-wrapper">
			<Pictograph
				pictographData={pictographData()}
				width={displaySize()}
				height={displaySize()}
				debug={showDebugInfo}
				beatNumber={showBeatNumbers ? 1 : null}
			/>
		</div>

	</div>

	<!-- Motion Status -->
	<div class="motion-status">
		<div class="status-item blue">
			<span class="status-dot" aria-hidden="true"></span>
			<span class="status-text">
				Blue: {motionState.blueMotionParams.startLoc.toUpperCase()} → {motionState.blueMotionParams.endLoc.toUpperCase()}
			</span>
		</div>
		<div class="status-item red">
			<span class="status-dot" aria-hidden="true"></span>
			<span class="status-text">
				Red: {motionState.redMotionParams.startLoc.toUpperCase()} → {motionState.redMotionParams.endLoc.toUpperCase()}
			</span>
		</div>
	</div>


</div>

<style>
	.compact-pictograph-display {
		background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(59, 130, 246, 0.05));
		border: 1px solid rgba(59, 130, 246, 0.2);
		border-radius: 12px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-height: 0;
		flex: 1;
	}

	.compact-pictograph-display:focus-within {
		border-color: rgba(59, 130, 246, 0.4);
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
	}

	.display-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
		flex-wrap: wrap;
	}

	.display-header h3 {
		margin: 0;
		color: #e0e7ff;
		font-size: 1rem;
		font-weight: 600;
	}

	.display-controls {
		display: flex;
		gap: 16px;
		align-items: center;
	}

	/* Control Groups */
	.zoom-controls,
	.display-options {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.control-btn {
		background: rgba(59, 130, 246, 0.2);
		border: 1px solid rgba(59, 130, 246, 0.3);
		border-radius: 6px;
		color: white;
		padding: 6px 8px;
		cursor: pointer;
		font-size: 12px;
		transition: all 0.2s ease;
		min-width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.control-btn:hover:not(:disabled) {
		background: rgba(59, 130, 246, 0.3);
		transform: translateY(-1px);
	}

	.control-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.control-btn:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
	}

	.control-btn.active {
		background: rgba(16, 185, 129, 0.3);
		border-color: rgba(16, 185, 129, 0.5);
	}

	.zoom-level {
		font-size: 12px;
		color: #c7d2fe;
		font-weight: 600;
		min-width: 40px;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}

	/* Pictograph Container */
	.pictograph-container {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		min-height: 200px;
		flex: 1;
		position: relative;
	}

	.pictograph-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		width: var(--display-size);
		height: var(--display-size);
		max-width: 100%;
		max-height: 100%;
	}

	.size-indicator {
		font-size: 11px;
		color: #a5b4fc;
		background: rgba(0, 0, 0, 0.3);
		padding: 4px 8px;
		border-radius: 4px;
		font-variant-numeric: tabular-nums;
	}

	/* Motion Status */
	.motion-status {
		display: flex;
		gap: 16px;
		justify-content: center;
		flex-wrap: wrap;
	}

	.status-item {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		padding: 6px 12px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.status-item.blue .status-dot {
		background: #3b82f6;
		box-shadow: 0 0 6px rgba(59, 130, 246, 0.4);
	}

	.status-item.red .status-dot {
		background: #ef4444;
		box-shadow: 0 0 6px rgba(239, 68, 68, 0.4);
	}

	.status-text {
		color: #c7d2fe;
		font-family: 'Courier New', monospace;
	}

	/* Keyboard Help */
	.keyboard-help {
		margin-top: auto;
		padding-top: 16px;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.keyboard-help details {
		color: #a5b4fc;
	}

	.keyboard-help summary {
		cursor: pointer;
		font-size: 12px;
		padding: 4px;
		user-select: none;
	}

	.keyboard-help ul {
		margin: 8px 0 0 0;
		padding-left: 20px;
		font-size: 11px;
		list-style-type: none;
	}

	.keyboard-help li {
		margin: 4px 0;
	}

	.keyboard-help kbd {
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 3px;
		padding: 1px 4px;
		font-size: 10px;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.compact-pictograph-display {
			padding: 12px;
			gap: 12px;
		}

		.display-header {
			flex-direction: column;
			align-items: stretch;
			gap: 12px;
		}

		.display-controls {
			flex-direction: column;
			gap: 12px;
		}

		.motion-status {
			flex-direction: column;
			gap: 8px;
		}

		.keyboard-help {
			display: none; /* Hide on mobile */
		}
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.compact-pictograph-display {
			border: 2px solid white;
			background: rgba(0, 0, 0, 0.8);
		}

		.control-btn {
			border: 2px solid white;
		}

		.pictograph-container {
			border: 2px solid white;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.control-btn {
			transition: none;
		}
	}
</style>

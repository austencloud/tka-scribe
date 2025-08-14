<!--
PropStateIndicators.svelte - Real-time prop state display

Shows live rotation angles and positions for both blue and red props
with clear visual indicators and accessibility features.
-->
<script lang="ts">
	import type { MotionTesterState } from '../state/motion-tester-state.svelte';

	interface Props {
		motionState: MotionTesterState;
	}

	let { motionState }: Props = $props();

	// Local state for display options
	let showDegrees = $state(true);
	let showRadians = $state(false);
	let showVisualIndicators = $state(true);

	// Helper functions for angle conversion and formatting
	function radToDeg(radians: number): number {
		return (radians * 180) / Math.PI;
	}

	function formatAngle(radians: number): string {
		if (showDegrees && showRadians) {
			return `${radToDeg(radians).toFixed(1)}° (${radians.toFixed(3)}rad)`;
		} else if (showRadians) {
			return `${radians.toFixed(3)} rad`;
		} else {
			return `${radToDeg(radians).toFixed(1)}°`;
		}
	}

	function normalizeAngle(radians: number): number {
		// Normalize to 0-360 degrees range
		let degrees = radToDeg(radians);
		while (degrees < 0) degrees += 360;
		while (degrees >= 360) degrees -= 360;
		return degrees;
	}

	// Visual indicator rotation for props
	function getIndicatorRotation(angle: number): string {
		const degrees = normalizeAngle(angle);
		return `rotate(${degrees}deg)`;
	}

	// Get color intensity based on rotation speed
	function getIntensityColor(angle: number): string {
		const normalizedSpeed = Math.abs(angle) % (2 * Math.PI);
		const intensity = normalizedSpeed / (2 * Math.PI);
		return `hsl(${220 + intensity * 120}, 70%, ${50 + intensity * 30}%)`;
	}

	// Toggle functions
	function toggleDegrees() {
		showDegrees = !showDegrees;
		if (!showDegrees && !showRadians) {
			showRadians = true; // Ensure at least one unit is shown
		}
	}

	function toggleRadians() {
		showRadians = !showRadians;
		if (!showDegrees && !showRadians) {
			showDegrees = true; // Ensure at least one unit is shown
		}
	}

	function toggleVisualIndicators() {
		showVisualIndicators = !showVisualIndicators;
	}

	// Keyboard shortcuts
	function handleKeyDown(event: KeyboardEvent) {
		switch (event.key) {
			case 'd':
			case 'D':
				event.preventDefault();
				toggleDegrees();
				break;
			case 'r':
			case 'R':
				event.preventDefault();
				toggleRadians();
				break;
			case 'v':
			case 'V':
				event.preventDefault();
				toggleVisualIndicators();
				break;
		}
	}
</script>

<div 
	class="prop-state-indicators"
	role="region"
	aria-label="Real-time prop states"
	tabindex="-1"
	onkeydown={handleKeyDown}
>
	<div class="indicators-header">
		<h3>📊 Prop States</h3>
		
		<div class="display-toggles">
			<button
				class="toggle-btn {showDegrees ? 'active' : ''}"
				onclick={toggleDegrees}
				aria-pressed={showDegrees}
				aria-label="Toggle degrees display"
				title="Show angles in degrees (D)"
			>
				°
			</button>
			
			<button
				class="toggle-btn {showRadians ? 'active' : ''}"
				onclick={toggleRadians}
				aria-pressed={showRadians}
				aria-label="Toggle radians display"
				title="Show angles in radians (R)"
			>
				rad
			</button>
			
			<button
				class="toggle-btn {showVisualIndicators ? 'active' : ''}"
				onclick={toggleVisualIndicators}
				aria-pressed={showVisualIndicators}
				aria-label="Toggle visual indicators"
				title="Show visual rotation indicators (V)"
			>
				👁️
			</button>
		</div>
	</div>

	<div class="prop-states-grid">
		<!-- Blue Prop State -->
		<div class="prop-state blue-prop">
			<div class="prop-header">
				<span class="prop-icon" aria-hidden="true">🔵</span>
				<h4>Blue Prop</h4>
				{#if showVisualIndicators}
					<div 
						class="visual-indicator"
						style:transform={getIndicatorRotation(motionState.currentPropStates.blue?.staffRotationAngle ?? 0)}
						style:border-color={getIntensityColor(motionState.currentPropStates.blue?.staffRotationAngle ?? 0)}
						aria-hidden="true"
					>
						<div class="indicator-arrow"></div>
					</div>
				{/if}
			</div>

			<div class="state-values">
				<div class="state-row">
					<div class="state-label">Center Path:</div>
					<span 
						class="state-value"
						aria-label="Center path angle: {formatAngle(motionState.currentPropStates.blue?.centerPathAngle ?? 0)}"
					>
						{formatAngle(motionState.currentPropStates.blue?.centerPathAngle ?? 0)}
					</span>
				</div>
				
				<div class="state-row">
					<div class="state-label">Staff Rotation:</div>
					<span 
						class="state-value"
						aria-label="Staff rotation angle: {formatAngle(motionState.currentPropStates.blue?.staffRotationAngle ?? 0)}"
					>
						{formatAngle(motionState.currentPropStates.blue?.staffRotationAngle ?? 0)}
					</span>
				</div>

				<div class="state-row">
					<div class="state-label">Normalized:</div>
					<span class="state-value normalized">
						{normalizeAngle(motionState.currentPropStates.blue?.staffRotationAngle ?? 0).toFixed(1)}°
					</span>
				</div>
			</div>

			<!-- Mini progress bars for visual feedback -->
			<div class="angle-bars" aria-hidden="true">
				<div class="angle-bar">
					<div class="bar-label">Center</div>
					<div class="bar-track">
						<div 
							class="bar-fill blue"
							style:width="{(normalizeAngle(motionState.currentPropStates.blue?.centerPathAngle ?? 0) / 360) * 100}%"
						></div>
					</div>
				</div>
				<div class="angle-bar">
					<div class="bar-label">Staff</div>
					<div class="bar-track">
						<div 
							class="bar-fill blue"
							style:width="{(normalizeAngle(motionState.currentPropStates.blue?.staffRotationAngle ?? 0) / 360) * 100}%"
						></div>
					</div>
				</div>
			</div>
		</div>

		<!-- Red Prop State -->
		<div class="prop-state red-prop">
			<div class="prop-header">
				<span class="prop-icon" aria-hidden="true">🔴</span>
				<h4>Red Prop</h4>
				{#if showVisualIndicators}
					<div 
						class="visual-indicator"
						style:transform={getIndicatorRotation(motionState.currentPropStates.red?.staffRotationAngle ?? 0)}
						style:border-color={getIntensityColor(motionState.currentPropStates.red?.staffRotationAngle ?? 0)}
						aria-hidden="true"
					>
						<div class="indicator-arrow"></div>
					</div>
				{/if}
			</div>

			<div class="state-values">
				<div class="state-row">
					<div class="state-label">Center Path:</div>
					<span 
						class="state-value"
						aria-label="Center path angle: {formatAngle(motionState.currentPropStates.red?.centerPathAngle ?? 0)}"
					>
						{formatAngle(motionState.currentPropStates.red?.centerPathAngle ?? 0)}
					</span>
				</div>
				
				<div class="state-row">
					<div class="state-label">Staff Rotation:</div>
					<span 
						class="state-value"
						aria-label="Staff rotation angle: {formatAngle(motionState.currentPropStates.red?.staffRotationAngle ?? 0)}"
					>
						{formatAngle(motionState.currentPropStates.red?.staffRotationAngle ?? 0)}
					</span>
				</div>

				<div class="state-row">
					<div class="state-label">Normalized:</div>
					<span class="state-value normalized">
						{normalizeAngle(motionState.currentPropStates.red?.staffRotationAngle ?? 0).toFixed(1)}°
					</span>
				</div>
			</div>

			<!-- Mini progress bars for visual feedback -->
			<div class="angle-bars" aria-hidden="true">
				<div class="angle-bar">
					<div class="bar-label">Center</div>
					<div class="bar-track">
						<div 
							class="bar-fill red"
							style:width="{(normalizeAngle(motionState.currentPropStates.red?.centerPathAngle ?? 0) / 360) * 100}%"
						></div>
					</div>
				</div>
				<div class="angle-bar">
					<div class="bar-label">Staff</div>
					<div class="bar-track">
						<div 
							class="bar-fill red"
							style:width="{(normalizeAngle(motionState.currentPropStates.red?.staffRotationAngle ?? 0) / 360) * 100}%"
						></div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Update Frequency Info -->
	<div class="update-info" aria-live="polite">
		<span class="update-indicator {motionState.animationState.isPlaying ? 'active' : 'paused'}">
			{motionState.animationState.isPlaying ? '🔄' : '⏸️'}
		</span>
		<span class="update-text">
			{motionState.animationState.isPlaying ? 'Live Updates' : 'Paused'}
		</span>
	</div>
</div>

<style>
	.prop-state-indicators {
		background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
		border: 1px solid rgba(16, 185, 129, 0.2);
		border-radius: 12px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-height: fit-content;
	}

	.prop-state-indicators:focus-within {
		border-color: rgba(16, 185, 129, 0.4);
		box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
	}

	.indicators-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.indicators-header h3 {
		margin: 0;
		color: #e0e7ff;
		font-size: 1rem;
		font-weight: 600;
	}

	.display-toggles {
		display: flex;
		gap: 4px;
	}

	.toggle-btn {
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 6px;
		color: #c7d2fe;
		padding: 4px 8px;
		cursor: pointer;
		font-size: 11px;
		font-weight: 600;
		transition: all 0.2s ease;
		min-width: 32px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.toggle-btn:hover {
		background: rgba(16, 185, 129, 0.2);
		border-color: rgba(16, 185, 129, 0.4);
	}

	.toggle-btn:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.5);
	}

	.toggle-btn.active {
		background: rgba(16, 185, 129, 0.3);
		border-color: rgba(16, 185, 129, 0.5);
		color: white;
	}

	/* Prop States Grid */
	.prop-states-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	.prop-state {
		background: rgba(0, 0, 0, 0.15);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 10px;
		padding: 14px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.prop-header {
		display: flex;
		align-items: center;
		gap: 8px;
		position: relative;
	}

	.prop-icon {
		font-size: 16px;
		line-height: 1;
	}

	.prop-header h4 {
		margin: 0;
		color: #e0e7ff;
		font-size: 14px;
		font-weight: 600;
		flex: 1;
	}

	/* Visual Indicator */
	.visual-indicator {
		width: 24px;
		height: 24px;
		border: 2px solid;
		border-radius: 50%;
		position: relative;
		transition: transform 0.1s ease;
	}

	.indicator-arrow {
		position: absolute;
		top: -1px;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 3px solid transparent;
		border-right: 3px solid transparent;
		border-bottom: 8px solid currentColor;
	}

	/* State Values */
	.state-values {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.state-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 12px;
	}

	.state-label {
		color: #a5b4fc;
		font-weight: 500;
		min-width: 0;
		flex: 1;
	}

	.state-value {
		color: #e0e7ff;
		font-family: 'Courier New', monospace;
		font-weight: 600;
		text-align: right;
		font-variant-numeric: tabular-nums;
		background: rgba(0, 0, 0, 0.2);
		padding: 2px 6px;
		border-radius: 4px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		min-width: 0;
	}

	.state-value.normalized {
		color: #fbbf24;
	}

	/* Angle Bars */
	.angle-bars {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-top: 4px;
	}

	.angle-bar {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.bar-label {
		font-size: 10px;
		color: #a5b4fc;
		min-width: 36px;
		text-align: right;
	}

	.bar-track {
		flex: 1;
		height: 4px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2px;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		transition: width 0.1s ease;
		border-radius: 2px;
	}

	.bar-fill.blue {
		background: linear-gradient(90deg, #3b82f6, #60a5fa);
	}

	.bar-fill.red {
		background: linear-gradient(90deg, #ef4444, #f87171);
	}

	/* Update Info */
	.update-info {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding-top: 12px;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		font-size: 12px;
	}

	.update-indicator {
		font-size: 14px;
		transition: all 0.3s ease;
	}

	.update-indicator.active {
		animation: spin 2s linear infinite;
	}

	.update-text {
		color: #c7d2fe;
		font-weight: 500;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.prop-state-indicators {
			padding: 12px;
			gap: 12px;
		}

		.prop-states-grid {
			grid-template-columns: 1fr;
			gap: 12px;
		}

		.display-toggles {
			gap: 2px;
		}

		.toggle-btn {
			min-width: 28px;
			height: 24px;
			font-size: 10px;
		}

		.visual-indicator {
			width: 20px;
			height: 20px;
		}

		.angle-bars {
			display: none; /* Hide on mobile to save space */
		}
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.prop-state-indicators {
			border: 2px solid white;
			background: rgba(0, 0, 0, 0.8);
		}

		.prop-state {
			border: 2px solid white;
		}

		.toggle-btn {
			border: 2px solid white;
		}

		.state-value {
			border: 2px solid white;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.visual-indicator {
			transition: none;
		}

		.bar-fill {
			transition: none;
		}

		.update-indicator.active {
			animation: none;
		}
	}
</style>

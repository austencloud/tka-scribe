<!--
  TrailSettingsChips.svelte

  Simplified trail settings as chips for compact UI.
  Used in Share panel and other places where space is limited.

  For full trail controls, use TrailSettingsPanel from the animate module.
-->
<script lang="ts">
	import { animationSettings, TrailMode } from '../state/animation-settings-state.svelte';

	// Props
	let {
		showBpmControl = true,
		showMoreButton = true,
		onMoreSettings
	}: {
		showBpmControl?: boolean;
		showMoreButton?: boolean;
		onMoreSettings?: () => void;
	} = $props();

	// Trail mode options as chips
	const trailModes = [
		{ mode: TrailMode.OFF, label: 'Off', icon: 'fa-ban' },
		{ mode: TrailMode.FADE, label: 'Fade', icon: 'fa-clock' },
		{ mode: TrailMode.LOOP_CLEAR, label: 'Loop', icon: 'fa-redo' },
		{ mode: TrailMode.PERSISTENT, label: 'Persist', icon: 'fa-infinity' }
	];

	// BPM presets
	const bpmPresets = [60, 90, 120, 150, 180];

	function selectTrailMode(mode: TrailMode) {
		animationSettings.setTrailMode(mode);
	}

	function selectBpm(bpm: number) {
		animationSettings.setBpm(bpm);
	}

	// Derived state
	let currentTrailMode = $derived(animationSettings.trail.mode);
	let currentBpm = $derived(animationSettings.bpm);
</script>

<div class="trail-chips-container">
	<!-- Trail Mode Chips -->
	<div class="chips-section">
		<span class="section-label">Trail</span>
		<div class="chips-row">
			{#each trailModes as { mode, label, icon }}
				<button
					class="chip"
					class:active={currentTrailMode === mode}
					onclick={() => selectTrailMode(mode)}
					type="button"
				>
					<i class="fas {icon}"></i>
					<span>{label}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- BPM Control -->
	{#if showBpmControl}
		<div class="chips-section">
			<span class="section-label">BPM</span>
			<div class="bpm-control">
				<div class="bpm-presets">
					{#each bpmPresets as bpm}
						<button
							class="bpm-chip"
							class:active={currentBpm === bpm}
							onclick={() => selectBpm(bpm)}
							type="button"
						>
							{bpm}
						</button>
					{/each}
				</div>
				<input
					type="number"
					class="bpm-input"
					value={currentBpm}
					min="30"
					max="300"
					oninput={(e) => selectBpm(parseInt(e.currentTarget.value) || 120)}
				/>
			</div>
		</div>
	{/if}

	<!-- More Settings Button -->
	{#if showMoreButton && onMoreSettings}
		<button class="more-btn" onclick={onMoreSettings} type="button">
			<i class="fas fa-sliders"></i>
			<span>More Settings</span>
		</button>
	{/if}
</div>

<style>
	.trail-chips-container {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 100%;
	}

	.chips-section {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.section-label {
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: rgba(255, 255, 255, 0.5);
	}

	.chips-row {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	/* Trail Mode Chips */
	.chip {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 14px 18px;
		min-height: 48px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 24px;
		color: rgba(255, 255, 255, 0.6);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.chip i {
		font-size: 12px;
	}

	.chip:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.9);
	}

	.chip.active {
		background: rgba(59, 130, 246, 0.2);
		border-color: rgba(59, 130, 246, 0.5);
		color: #60a5fa;
	}

	/* BPM Control */
	.bpm-control {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.bpm-presets {
		display: flex;
		gap: 4px;
	}

	.bpm-chip {
		padding: 12px 16px;
		min-height: 48px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		color: rgba(255, 255, 255, 0.6);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
		min-width: 52px;
		text-align: center;
	}

	.bpm-chip:hover {
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.9);
	}

	.bpm-chip.active {
		background: rgba(236, 72, 153, 0.2);
		border-color: rgba(236, 72, 153, 0.5);
		color: #f472b6;
	}

	.bpm-input {
		width: 75px;
		padding: 12px 14px;
		min-height: 48px;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 12px;
		color: white;
		font-size: 14px;
		font-weight: 600;
		text-align: center;
	}

	.bpm-input:focus {
		outline: none;
		border-color: rgba(236, 72, 153, 0.5);
	}

	/* Hide spinner buttons on number input */
	.bpm-input::-webkit-outer-spin-button,
	.bpm-input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.bpm-input[type='number'] {
		-moz-appearance: textfield;
		appearance: textfield;
	}

	/* More Settings Button */
	.more-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 14px 18px;
		min-height: 48px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		color: rgba(255, 255, 255, 0.6);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.more-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.9);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.more-btn i {
		font-size: 13px;
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.chip,
		.bpm-chip,
		.more-btn {
			transition: none;
		}
	}
</style>

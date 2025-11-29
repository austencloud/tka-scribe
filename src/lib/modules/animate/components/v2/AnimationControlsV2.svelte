<!--
  AnimationControlsV2.svelte

  Main orchestrator for the new tiered animation controls.
  Adapts layout based on mode (fullscreen, inline, compact).

  Tier 1: FloatingControlBar (BPM, Play, Export) - Always visible
  Tier 2: QuickTogglesRow (Visibility, Presets, Settings) - Always visible

  Note: AdvancedSettingsDrawer should be rendered at a higher level (e.g., SingleModePanel)
  to ensure proper overlay behavior. Use onOpenAdvancedSettings callback.
-->
<script lang="ts">
	import FloatingControlBar from './FloatingControlBar.svelte';
	import QuickTogglesRow from './QuickTogglesRow.svelte';
	import { animationSettings } from '$lib/shared/animate/state/animation-settings-state.svelte';

	type ControlsMode = 'fullscreen' | 'inline' | 'compact';

	let {
		mode = 'fullscreen',
		isPlaying = $bindable(false),
		showExport = true,
		onPlayToggle,
		onExport,
		onOpenTrailPanel,
		onOpenAdvancedSettings
	}: {
		mode?: ControlsMode;
		isPlaying: boolean;
		showExport?: boolean;
		onPlayToggle?: (playing: boolean) => void;
		onExport?: () => void;
		onOpenTrailPanel?: () => void;
		onOpenAdvancedSettings?: () => void;
	} = $props();

	// Get state from singleton
	let bpm = $derived(animationSettings.bpm);
	let blueVisible = $derived(animationSettings.motionVisibility.blue);
	let redVisible = $derived(animationSettings.motionVisibility.red);
	let trailSettings = $derived(animationSettings.trail);

	// Handlers - BPM
	function handleBpmChange(newBpm: number) {
		animationSettings.setBpm(newBpm);
	}

	// Handlers - Playback
	function handlePlayToggle(playing: boolean) {
		isPlaying = playing;
		onPlayToggle?.(playing);
	}

	// Handlers - Visibility
	function handleBlueToggle(visible: boolean) {
		animationSettings.setBlueVisible(visible);
	}

	function handleRedToggle(visible: boolean) {
		animationSettings.setRedVisible(visible);
	}

	// Handlers - Advanced Settings
	function handleOpenSettings() {
		onOpenAdvancedSettings?.();
	}
</script>

<div class="animation-controls-v2" data-mode={mode}>
	{#if mode === 'fullscreen'}
		<!-- Fullscreen layout: Stacked tiers -->
		<div class="fullscreen-layout">
			<div class="tier-2">
				<QuickTogglesRow
					{blueVisible}
					{redVisible}
					{trailSettings}
					onBlueToggle={handleBlueToggle}
					onRedToggle={handleRedToggle}
					onOpenTrailPanel={onOpenTrailPanel}
					onOpenSettings={handleOpenSettings}
				/>
			</div>

			<div class="tier-1">
				<FloatingControlBar
					{bpm}
					{isPlaying}
					{showExport}
					onBpmChange={handleBpmChange}
					onPlayToggle={handlePlayToggle}
					onExport={onExport}
				/>
			</div>
		</div>
	{:else if mode === 'inline'}
		<!-- Inline layout: Single row, more compact -->
		<div class="inline-layout">
			<FloatingControlBar
				{bpm}
				{isPlaying}
				showExport={false}
				onBpmChange={handleBpmChange}
				onPlayToggle={handlePlayToggle}
			/>

			<QuickTogglesRow
				{blueVisible}
				{redVisible}
				{trailSettings}
				onBlueToggle={handleBlueToggle}
				onRedToggle={handleRedToggle}
				onOpenTrailPanel={onOpenTrailPanel}
				onOpenSettings={handleOpenSettings}
			/>
		</div>
	{:else}
		<!-- Compact layout: Minimal for mobile -->
		<div class="compact-layout">
			<FloatingControlBar
				{bpm}
				{isPlaying}
				showExport={false}
				onBpmChange={handleBpmChange}
				onPlayToggle={handlePlayToggle}
			/>
		</div>
	{/if}

</div>

<style>
	.animation-controls-v2 {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	/* Fullscreen Layout */
	.fullscreen-layout {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 16px;
	}

	.fullscreen-layout .tier-1 {
		display: flex;
		justify-content: center;
	}

	.fullscreen-layout .tier-2 {
		display: flex;
		justify-content: center;
	}

	/* Inline Layout */
	.inline-layout {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 12px;
	}

	/* Compact Layout */
	.compact-layout {
		display: flex;
		justify-content: center;
		padding: 12px;
	}

	/* Responsive adjustments */
	@media (max-width: 480px) {
		.fullscreen-layout {
			padding: 12px;
			gap: 10px;
		}

		.inline-layout {
			padding: 10px;
			gap: 8px;
		}

		.compact-layout {
			padding: 10px;
		}
	}
</style>

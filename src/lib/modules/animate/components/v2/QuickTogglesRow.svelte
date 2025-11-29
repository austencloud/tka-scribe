<!--
  QuickTogglesRow.svelte

  Tier 2: Quick access row with visibility toggles, preset picker, and settings button.
  Compact horizontal layout for secondary controls.
-->
<script lang="ts">
	import VisibilityChip from './VisibilityChip.svelte';
	import TrailPresetPicker from './TrailPresetPicker.svelte';
	import type { TrailSettings } from '../../domain/types/TrailTypes';

	let {
		blueVisible = $bindable(true),
		redVisible = $bindable(true),
		trailSettings,
		onBlueToggle,
		onRedToggle,
		onOpenTrailPanel,
		onOpenSettings
	}: {
		blueVisible: boolean;
		redVisible: boolean;
		trailSettings: TrailSettings;
		onBlueToggle?: (visible: boolean) => void;
		onRedToggle?: (visible: boolean) => void;
		onOpenTrailPanel?: () => void;
		onOpenSettings?: () => void;
	} = $props();
</script>

<div class="quick-toggles-row">
	<!-- Visibility Chips -->
	<div class="visibility-group">
		<VisibilityChip color="blue" bind:visible={blueVisible} onToggle={onBlueToggle} />
		<VisibilityChip color="red" bind:visible={redVisible} onToggle={onRedToggle} />
	</div>

	<!-- Divider -->
	<div class="divider"></div>

	<!-- Trail Preset Picker -->
	{#if onOpenTrailPanel}
		<div class="preset-section">
			<TrailPresetPicker
				currentSettings={trailSettings}
				onOpenPanel={onOpenTrailPanel}
			/>
		</div>
	{/if}

	<!-- Settings Button -->
	{#if onOpenSettings}
		<button class="settings-btn" onclick={onOpenSettings} aria-label="Open advanced settings">
			<i class="fas fa-sliders"></i>
		</button>
	{/if}
</div>

<style>
	.quick-toggles-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 16px;
		background: rgba(20, 25, 35, 0.7);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 14px;
	}

	.visibility-group {
		display: flex;
		gap: 8px;
	}

	.divider {
		width: 1px;
		height: 28px;
		background: rgba(255, 255, 255, 0.1);
	}

	.preset-section {
		flex: 1;
		min-width: 0;
	}

	.settings-btn {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 10px;
		border: 1.5px solid rgba(255, 255, 255, 0.12);
		background: rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.95rem;
		cursor: pointer;
		transition: all 0.2s ease;
		-webkit-tap-highlight-color: transparent;
	}

	.settings-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
		color: rgba(255, 255, 255, 0.9);
	}

	.settings-btn:active {
		transform: scale(0.95);
		background: rgba(139, 92, 246, 0.2);
		border-color: rgba(139, 92, 246, 0.4);
	}

	/* Responsive - stack on very small screens */
	@media (max-width: 400px) {
		.quick-toggles-row {
			flex-wrap: wrap;
			gap: 8px;
		}

		.divider {
			display: none;
		}

		.visibility-group {
			order: 1;
		}

		.preset-section {
			order: 3;
			flex-basis: 100%;
		}

		.settings-btn {
			order: 2;
			margin-left: auto;
		}
	}
</style>

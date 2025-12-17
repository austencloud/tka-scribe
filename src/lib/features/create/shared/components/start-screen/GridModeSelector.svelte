<!--
GridModeSelector.svelte - Diamond/Box grid mode toggle

Allows user to select the grid mode before starting a new sequence.
Extracted from AssemblyWelcome for reuse.
-->
<script lang="ts">
	import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";

	interface Props {
		/** Current grid mode */
		gridMode: GridMode;
		/** Called when mode changes */
		onGridModeChange: (mode: GridMode) => void;
		/** Optional accent color */
		accentColor?: string;
	}

	const { gridMode, onGridModeChange, accentColor }: Props = $props();

	const isDiamond = $derived(gridMode === GridMode.DIAMOND);
</script>

<div class="grid-mode-section">
	<span class="grid-mode-label">Grid Mode</span>
	<div class="grid-mode-toggle" style:--accent-color={accentColor}>
		<button
			class="mode-button"
			class:active={isDiamond}
			type="button"
			onclick={() => onGridModeChange(GridMode.DIAMOND)}
		>
			<span class="mode-icon">◇</span>
			Diamond
		</button>
		<button
			class="mode-button"
			class:active={!isDiamond}
			type="button"
			onclick={() => onGridModeChange(GridMode.BOX)}
		>
			<span class="mode-icon">□</span>
			Box
		</button>
	</div>
</div>

<style>
	.grid-mode-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		width: 100%;
	}

	.grid-mode-label {
		font-size: var(--font-size-compact, 12px);
		font-weight: 500;
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.grid-mode-toggle {
		display: flex;
		background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
		border-radius: 8px;
		padding: 4px;
		gap: 4px;
	}

	.mode-button {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 16px;
		border: none;
		background: transparent;
		border-radius: 6px;
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
		font-size: var(--font-size-min, 14px);
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.mode-button.active {
		background: color-mix(in srgb, var(--accent-color, var(--theme-accent-strong, #8b5cf6)) 20%, transparent);
		color: var(--theme-text, rgba(255, 255, 255, 0.95));
	}

	.mode-button:hover:not(.active) {
		background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.05));
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
	}

	.mode-icon {
		font-size: 16px;
	}
</style>

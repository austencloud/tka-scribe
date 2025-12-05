<!--
  GridSettingsPopover.svelte - Compact popover for grid overlay settings

  Shows a scale slider to adjust how large the grid appears over the camera feed.
  Designed to be non-intrusive - appears as a small floating panel.
-->
<script lang="ts">
	import { fade, fly } from "svelte/transition";

	interface Props {
		isOpen: boolean;
		gridScale: number;
		onScaleChange: (scale: number) => void;
		onClose: () => void;
	}

	let { isOpen, gridScale, onScaleChange, onClose }: Props = $props();

	function handleScaleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		onScaleChange(parseFloat(target.value));
	}

	function resetScale() {
		onScaleChange(1.0);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div
		class="popover-backdrop"
		transition:fade={{ duration: 150 }}
		onclick={onClose}
		role="presentation"
	></div>
	<div
		class="popover"
		transition:fly={{ y: 10, duration: 200 }}
	>
		<div class="popover-header">
			<span class="popover-title">Grid Size</span>
			<button class="close-btn" onclick={onClose} aria-label="Close">
				<i class="fas fa-times"></i>
			</button>
		</div>

		<div class="popover-content">
			<div class="scale-control">
				<input
					type="range"
					min="0.5"
					max="1.5"
					step="0.05"
					value={gridScale}
					oninput={handleScaleInput}
					class="scale-slider"
				/>
				<div class="scale-labels">
					<span class="scale-value">{Math.round(gridScale * 100)}%</span>
					{#if gridScale !== 1.0}
						<button class="reset-btn" onclick={resetScale}>
							Reset
						</button>
					{/if}
				</div>
			</div>

			<p class="hint">
				Adjust how large the grid appears over your camera
			</p>
		</div>
	</div>
{/if}

<style>
	.popover-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.3);
		z-index: 999;
	}

	.popover {
		position: absolute;
		bottom: calc(0.5rem + 44px);
		left: 0.5rem;
		width: 220px;
		background: linear-gradient(
			135deg,
			rgba(30, 30, 40, 0.98) 0%,
			rgba(20, 20, 30, 0.98) 100%
		);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
		z-index: 1000;
		overflow: hidden;
	}

	.popover-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.popover-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.95);
	}

	.close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: rgba(255, 255, 255, 0.05);
		border: none;
		border-radius: 6px;
		color: rgba(255, 255, 255, 0.6);
		cursor: pointer;
		transition: all 0.2s;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.9);
	}

	.popover-content {
		padding: 1rem;
	}

	.scale-control {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.scale-slider {
		width: 100%;
		height: 6px;
		appearance: none;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
		outline: none;
		cursor: pointer;
	}

	.scale-slider::-webkit-slider-thumb {
		appearance: none;
		width: 18px;
		height: 18px;
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
		transition: transform 0.15s;
	}

	.scale-slider::-webkit-slider-thumb:hover {
		transform: scale(1.1);
	}

	.scale-slider::-moz-range-thumb {
		width: 18px;
		height: 18px;
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		border: none;
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
	}

	.scale-labels {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.scale-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: #3b82f6;
		font-variant-numeric: tabular-nums;
	}

	.reset-btn {
		padding: 0.25rem 0.5rem;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.reset-btn:hover {
		background: rgba(255, 255, 255, 0.12);
		color: rgba(255, 255, 255, 0.9);
	}

	.hint {
		margin: 0.75rem 0 0 0;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.45);
		line-height: 1.4;
	}
</style>

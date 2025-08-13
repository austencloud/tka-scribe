<script lang="ts">
	interface Props {
		gridType: 'diamond' | 'box';
		onGridTypeChange: (gridType: 'diamond' | 'box') => void;
	}

	let { gridType, onGridTypeChange }: Props = $props();
</script>

<div class="grid-options-control">
	<div class="grid-toggle-row">
		<span class="grid-label">Grid Type:</span>
		<div class="grid-toggle-buttons">
			<button 
				class="grid-toggle-btn"
				class:active={gridType === 'diamond'}
				onclick={() => onGridTypeChange('diamond')}
			>
				◆ Diamond
			</button>
			<button 
				class="grid-toggle-btn"
				class:active={gridType === 'box'}
				onclick={() => onGridTypeChange('box')}
			>
				⬜ Box
			</button>
		</div>
	</div>
</div>

<style>
	.grid-options-control {
		width: 100%;
	}

	.grid-toggle-row {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
	}

	.grid-label {
		color: #c7d2fe;
		font-size: 0.9rem;
		font-weight: 500;
		min-width: 80px;
	}

	.grid-toggle-buttons {
		display: flex;
		gap: 4px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 6px;
		padding: 2px;
	}

	.grid-toggle-btn {
		background: transparent;
		border: none;
		color: #c7d2fe;
		padding: 6px 12px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.8rem;
		font-weight: 500;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.grid-toggle-btn:hover {
		background: rgba(99, 102, 241, 0.2);
		color: #e0e7ff;
	}

	.grid-toggle-btn.active {
		background: rgba(99, 102, 241, 0.4);
		color: #ffffff;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}
</style>

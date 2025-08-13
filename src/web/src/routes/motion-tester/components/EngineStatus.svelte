<script lang="ts">
	interface Props {
		isEngineInitialized: boolean;
		animationState: string;
		totalBeats: number;
		currentBeat: number;
	}

	let { isEngineInitialized, animationState, totalBeats, currentBeat }: Props = $props();
</script>

<div class="engine-status">
	<h4>🔧 Engine Status</h4>
	<div class="status-grid">
		<div class="status-item">
			<span class="label">Animation Engine:</span>
			<span class="value" class:success={isEngineInitialized} class:error={!isEngineInitialized}>
				{isEngineInitialized ? 'Initialized ✓' : 'Initializing...'}
			</span>
		</div>
		<div class="status-item">
			<span class="label">Animation State:</span>
			<span class="value">{animationState}</span>
		</div>
		<div class="status-item">
			<span class="label">Current Beat:</span>
			<span class="value">{currentBeat.toFixed(2)}</span>
		</div>
		<div class="status-item">
			<span class="label">Total Beats:</span>
			<span class="value">{totalBeats}</span>
		</div>
	</div>
</div>

<style>
	.engine-status {
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		padding: 15px;
	}

	h4 {
		margin: 0 0 12px 0;
		color: #c7d2fe;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.status-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.status-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.8rem;
	}

	.label {
		color: #c7d2fe;
		font-weight: 500;
	}

	.value {
		color: #fbbf24;
		font-family: 'Courier New', monospace;
		font-weight: 600;
	}

	.value.success {
		color: #10b981;
	}

	.value.error {
		color: #ef4444;
	}
</style>

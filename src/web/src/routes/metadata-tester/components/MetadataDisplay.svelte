<!-- Metadata Display Component -->
<script lang="ts">
	import type { MetadataTesterState } from '../state/metadata-tester-state.svelte';

	interface Props {
		state: {
			state: MetadataTesterState;
		};
	}

	let { state }: Props = $props();

	// Format beat information for display
	function formatBeatInfo(beat: any, index: number): string {
		if (!beat) return 'Invalid beat data';
		
		const beatNumber = index + 1;
		const letter = beat.letter || 'Unknown';
		const blueMotion = beat.blue_attributes?.motion_type || 'Unknown';
		const redMotion = beat.red_attributes?.motion_type || 'Unknown';
		
		return `Beat ${beatNumber} (${letter}): Blue=${blueMotion}, Red=${redMotion}`;
	}

	// Check if beat is start position
	function isStartPosition(beat: any): boolean {
		return !!beat.sequence_start_position;
	}

	// Get filtered real beats (no start position entries)
	function getRealBeats(metadata: any[]): any[] {
		if (!Array.isArray(metadata)) return [];
		return metadata.filter(beat => beat.letter && !beat.sequence_start_position);
	}

	// Copy metadata to clipboard
	async function copyToClipboard() {
		if (!state.state.rawMetadata) return;
		
		try {
			await navigator.clipboard.writeText(state.state.rawMetadata);
			// You might want to show a toast notification here
		} catch (error) {
			console.error('Failed to copy to clipboard:', error);
		}
	}
</script>

<div class="metadata-display">
	<div class="display-header">
		<h2>📊 Metadata Analysis</h2>
		{#if state.state.rawMetadata}
			<button class="copy-btn" onclick={copyToClipboard} title="Copy raw metadata to clipboard">
				📋 Copy
			</button>
		{/if}
	</div>

	<div class="display-content">
		{#if state.state.isExtractingMetadata}
			<div class="loading-state">
				<div class="spinner"></div>
				<p>Extracting metadata...</p>
			</div>
		{:else if state.state.error}
			<div class="error-state">
				<h3>❌ Extraction Error</h3>
				<p>{state.state.error}</p>
			</div>
		{:else if !state.state.selectedThumbnail}
			<div class="empty-state">
				<h3>🎯 Select a Sequence</h3>
				<p>Click on a thumbnail to extract and analyze its metadata</p>
			</div>
		{:else if state.state.metadataStats}
			<!-- Metadata Summary -->
			<div class="metadata-summary">
				<h3>📈 Summary for {state.state.selectedThumbnail.word}</h3>
				<div class="stats-grid">
					<div class="stat-item">
						<span class="stat-label">Total Beats:</span>
						<span class="stat-value">{state.state.metadataStats.totalBeats}</span>
					</div>
					<div class="stat-item">
						<span class="stat-label">Author:</span>
						<span class="stat-value" class:missing={!state.state.metadataStats.hasAuthor}>
							{state.state.metadataStats.hasAuthor ? 
								state.state.metadataStats.authorName : 
								'❌ Missing'
							}
						</span>
					</div>
					<div class="stat-item">
						<span class="stat-label">Level:</span>
						<span class="stat-value" class:missing={!state.state.metadataStats.hasLevel}>
							{state.state.metadataStats.hasLevel ? 
								state.state.metadataStats.level : 
								'❌ Missing'
							}
						</span>
					</div>
					<div class="stat-item">
						<span class="stat-label">Start Position:</span>
						<span class="stat-value" class:missing={!state.state.metadataStats.hasStartPosition}>
							{state.state.metadataStats.hasStartPosition ? '✅ Present' : '❌ Missing'}
						</span>
					</div>
					<div class="stat-item">
						<span class="stat-label">Sequence Length:</span>
						<span class="stat-value">{state.state.metadataStats.sequenceLength}</span>
					</div>
				</div>
			</div>

			<!-- Beat-by-Beat Analysis -->
			{#if state.state.extractedMetadata && Array.isArray(state.state.extractedMetadata)}
				<div class="beat-analysis">
					<h3>🎵 Beat Analysis</h3>
					<div class="beats-container">
						{#each state.state.extractedMetadata as beat, index}
							<div class="beat-item" class:start-position={isStartPosition(beat)}>
								{#if isStartPosition(beat)}
									<div class="beat-header start-pos">
										<span class="beat-type">Start Position</span>
										<span class="position-value">{beat.sequence_start_position}</span>
									</div>
								{:else}
									<div class="beat-header">
										<span class="beat-number">Beat {getRealBeats(state.state.extractedMetadata).indexOf(beat) + 1}</span>
										<span class="beat-letter">{beat.letter}</span>
									</div>
									<div class="motion-info">
										<div class="motion-item blue">
											<span class="prop-label">🔵 Blue:</span>
											<span class="motion-type">{beat.blue_attributes?.motion_type || 'Unknown'}</span>
										</div>
										<div class="motion-item red">
											<span class="prop-label">🔴 Red:</span>
											<span class="motion-type">{beat.red_attributes?.motion_type || 'Unknown'}</span>
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Raw JSON Data (Collapsible) -->
			<details class="raw-data">
				<summary>🔍 Raw JSON Data</summary>
				<pre class="json-content">{state.state.rawMetadata}</pre>
			</details>
		{/if}
	</div>
</div>

<style>
	.metadata-display {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}

	.display-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		padding-bottom: 15px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.display-header h2 {
		margin: 0;
		font-size: 1.25rem;
		color: #22c55e;
	}

	.copy-btn {
		background: rgba(34, 197, 94, 0.2);
		border: 1px solid rgba(34, 197, 94, 0.4);
		color: #22c55e;
		padding: 8px 16px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s ease;
	}

	.copy-btn:hover {
		background: rgba(34, 197, 94, 0.3);
		border-color: rgba(34, 197, 94, 0.6);
	}

	.display-content {
		flex: 1;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
	}

	.display-content::-webkit-scrollbar {
		width: 8px;
	}

	.display-content::-webkit-scrollbar-track {
		background: transparent;
	}

	.display-content::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 4px;
	}

	.display-content::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.loading-state,
	.error-state,
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 300px;
		text-align: center;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid rgba(255, 255, 255, 0.1);
		border-top: 3px solid #22c55e;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 15px;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.metadata-summary {
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.2);
		border-radius: 8px;
		padding: 20px;
		margin-bottom: 20px;
	}

	.metadata-summary h3 {
		margin: 0 0 15px 0;
		color: #22c55e;
		font-size: 1.1rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 12px;
	}

	.stat-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 12px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 6px;
	}

	.stat-label {
		font-weight: 500;
		opacity: 0.8;
	}

	.stat-value {
		font-weight: 600;
		color: #22c55e;
	}

	.stat-value.missing {
		color: #f87171;
	}

	.beat-analysis {
		margin-bottom: 20px;
	}

	.beat-analysis h3 {
		margin: 0 0 15px 0;
		color: #22c55e;
		font-size: 1.1rem;
	}

	.beats-container {
		display: grid;
		gap: 8px;
	}

	.beat-item {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 12px;
	}

	.beat-item.start-position {
		background: rgba(168, 85, 247, 0.1);
		border-color: rgba(168, 85, 247, 0.3);
	}

	.beat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.beat-header.start-pos {
		margin-bottom: 0;
	}

	.beat-number {
		font-weight: 600;
		color: #60a5fa;
	}

	.beat-letter {
		font-weight: 600;
		color: #fbbf24;
		font-size: 1.1rem;
	}

	.beat-type {
		font-weight: 600;
		color: #a855f7;
	}

	.position-value {
		font-weight: 600;
		color: #c084fc;
	}

	.motion-info {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.motion-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 0.9rem;
	}

	.motion-item.blue {
		background: rgba(59, 130, 246, 0.1);
	}

	.motion-item.red {
		background: rgba(239, 68, 68, 0.1);
	}

	.prop-label {
		font-weight: 500;
	}

	.motion-type {
		font-weight: 600;
		text-transform: uppercase;
		font-size: 0.8rem;
	}

	.raw-data {
		margin-top: 20px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		overflow: hidden;
	}

	.raw-data summary {
		padding: 12px 16px;
		background: rgba(255, 255, 255, 0.05);
		cursor: pointer;
		font-weight: 500;
		color: #60a5fa;
		user-select: none;
	}

	.raw-data summary:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.json-content {
		padding: 16px;
		margin: 0;
		background: rgba(0, 0, 0, 0.2);
		font-family: 'Courier New', monospace;
		font-size: 0.85rem;
		line-height: 1.4;
		white-space: pre-wrap;
		word-break: break-all;
		max-height: 400px;
		overflow-y: auto;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}

		.motion-info {
			grid-template-columns: 1fr;
		}

		.display-header {
			flex-direction: column;
			gap: 10px;
			align-items: stretch;
		}
	}
</style>

<!-- Construct Tab - Main sequence editing interface -->
<script lang="ts">
	// Import runes-based state
	import { currentSequence, sequences, isLoading } from '$stores/sequenceState.svelte';

	// Placeholder content for now
	$: sequenceCount = sequences.length;
</script>

<div class="construct-tab">
	<div class="tab-header glass-surface">
		<h1>Construct</h1>
		<p>Create and edit kinetic sequences</p>
	</div>

	<div class="tab-content">
		<div class="placeholder-content">
			<h2>🏗️ Construct Tab</h2>
			<p>This is where sequence construction will happen.</p>
			
			<div class="stats">
				<div class="stat">
					<span class="stat-value">{sequenceCount}</span>
					<span class="stat-label">Sequences</span>
				</div>
				<div class="stat">
					<span class="stat-value">{currentSequence?.beats.length ?? 0}</span>
					<span class="stat-label">Beats</span>
				</div>
				<div class="stat">
					<span class="stat-value">{isLoading ? 'Loading...' : 'Ready'}</span>
					<span class="stat-label">Status</span>
				</div>
			</div>

			<p class="coming-soon">🚧 Coming Soon: Sequence Workbench, Beat Frames, Motion Editing</p>
		</div>
	</div>
</div>

<style>
	.construct-tab {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: var(--spacing-lg);
		gap: var(--spacing-lg);
	}

	.tab-header {
		padding: var(--spacing-lg);
		text-align: center;
	}

	.tab-header h1 {
		font-size: var(--font-size-2xl);
		margin-bottom: var(--spacing-sm);
		color: var(--foreground);
	}

	.tab-header p {
		color: var(--muted-foreground);
	}

	.tab-content {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.placeholder-content {
		text-align: center;
		max-width: 600px;
	}

	.placeholder-content h2 {
		font-size: var(--font-size-xl);
		margin-bottom: var(--spacing-md);
		color: var(--foreground);
	}

	.placeholder-content p {
		color: var(--muted-foreground);
		margin-bottom: var(--spacing-lg);
	}

	.stats {
		display: flex;
		gap: var(--spacing-xl);
		justify-content: center;
		margin: var(--spacing-xl) 0;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: var(--spacing-lg);
		background: rgba(255, 255, 255, 0.05);
		border-radius: 12px;
		min-width: 100px;
	}

	.stat-value {
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--primary-color);
		margin-bottom: var(--spacing-xs);
	}

	.stat-label {
		font-size: var(--font-size-sm);
		color: var(--muted-foreground);
	}

	.coming-soon {
		background: rgba(255, 193, 7, 0.1);
		border: 1px solid rgba(255, 193, 7, 0.3);
		color: #ffc107;
		padding: var(--spacing-md);
		border-radius: 8px;
		margin-top: var(--spacing-lg);
	}
</style>

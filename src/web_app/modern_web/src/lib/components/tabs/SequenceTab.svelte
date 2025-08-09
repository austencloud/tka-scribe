<!-- SequenceTab.svelte - Clean sequence workbench interface matching desktop modern app -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { getCurrentSequence, getIsLoading } from '$stores/sequenceState.svelte';
	import Workbench from '$components/workbench/Workbench.svelte';
	import type { BeatData, SequenceData } from '$services/interfaces';
	import { ISequenceService } from '$services/interfaces';
	import { resolve } from '$services/bootstrap';

	// Services
	let sequenceService = $state<ISequenceService | null>(null);

	// State
	let isProcessing = $state(false);
	let errorMessage = $state<string | null>(null);
	let successMessage = $state<string | null>(null);

	// Reactive current sequence
	let currentSequence = $derived(getCurrentSequence());
	let isLoading = $derived(getIsLoading());

	// Initialize services
	$effect(() => {
		try {
			if (!sequenceService) {
				sequenceService = resolve(ISequenceService);
			}
		} catch (error) {
			console.error('SequenceTab: Failed to resolve services:', error);
		}
	});

	// Handle workbench operations
	async function handleSequenceOperation(operation: string, data?: any) {
		try {
			isProcessing = true;
			errorMessage = null;

			switch (operation) {
				case 'save':
					if (currentSequence) {
						// TODO: Implement sequence saving
						console.log('Saving sequence:', currentSequence.name);
						successMessage = `Sequence "${currentSequence.name}" saved successfully`;
						setTimeout(() => successMessage = null, 3000);
					}
					break;
				case 'load':
					// TODO: Implement sequence loading
					console.log('Loading sequence:', data);
					break;
				case 'export':
					// TODO: Implement sequence export
					console.log('Exporting sequence');
					successMessage = 'Sequence exported successfully';
					setTimeout(() => successMessage = null, 3000);
					break;
				case 'clear':
					// Clear handled by workbench
					break;
				default:
					console.log('Unknown operation:', operation);
			}
		} catch (error) {
			console.error('Error handling operation:', error);
			errorMessage = error instanceof Error ? error.message : 'Operation failed';
			setTimeout(() => errorMessage = null, 5000);
		} finally {
			isProcessing = false;
		}
	}

	// Keyboard shortcuts
	function handleKeyboard(event: KeyboardEvent) {
		if (event.ctrlKey || event.metaKey) {
			switch (event.key) {
				case 's':
					event.preventDefault();
					handleSequenceOperation('save');
					break;
				case 'e':
					event.preventDefault();
					handleSequenceOperation('export');
					break;
			}
		}
	}

	onMount(() => {
		console.log('🎵 SequenceTab mounted');
		document.addEventListener('keydown', handleKeyboard);
		return () => document.removeEventListener('keydown', handleKeyboard);
	});
</script>

<div class="sequence-tab" data-testid="sequence-tab">
	<!-- Header Section -->
	<div class="sequence-header">
		<div class="header-left">
			<h1 class="tab-title">
				<span class="icon">🎵</span>
				Sequence Workbench
			</h1>
			{#if currentSequence}
				<div class="sequence-info">
					<div class="sequence-details">
						<span class="sequence-name">{currentSequence.name || 'Untitled Sequence'}</span>
						<span class="beat-count">{currentSequence.beats?.length || 0} beats</span>
						{#if currentSequence.start_position}
							<span class="start-position">Start: {currentSequence.start_position.letter || 'Set'}</span>
						{/if}
					</div>
				</div>
			{:else}
				<div class="no-sequence">
					<span class="text-muted">No sequence loaded</span>
				</div>
			{/if}
		</div>

		<div class="header-actions">
			<button 
				class="action-btn save-btn"
				disabled={!currentSequence || isProcessing}
				onclick={() => handleSequenceOperation('save')}
				title="Save Sequence (Ctrl+S)"
			>
				<span class="btn-icon">💾</span>
				Save
			</button>
			<button 
				class="action-btn export-btn"
				disabled={!currentSequence || isProcessing}
				onclick={() => handleSequenceOperation('export')}
				title="Export Sequence (Ctrl+E)"
			>
				<span class="btn-icon">📤</span>
				Export
			</button>
		</div>
	</div>

	<!-- Status Messages -->
	{#if errorMessage}
		<div class="status-message error-message">
			<span class="status-icon">❌</span>
			{errorMessage}
			<button class="dismiss-btn" onclick={() => errorMessage = null}>×</button>
		</div>
	{/if}

	{#if successMessage}
		<div class="status-message success-message">
			<span class="status-icon">✅</span>
			{successMessage}
			<button class="dismiss-btn" onclick={() => successMessage = null}>×</button>
		</div>
	{/if}

	<!-- Main Workbench Area -->
	<div class="workbench-container">
		<div class="workbench-wrapper">
			{#if isLoading}
				<div class="loading-state">
					<div class="loading-spinner"></div>
					<p>Loading sequence...</p>
				</div>
			{:else}
				<Workbench />
			{/if}
		</div>
	</div>

	<!-- Footer Information -->
	<div class="sequence-footer">
		<div class="footer-left">
			{#if currentSequence}
				<span class="footer-info">
					Difficulty: <strong>{currentSequence.difficulty || 'Intermediate'}</strong>
				</span>
				<span class="footer-info">
					Length: <strong>{currentSequence.length || currentSequence.beats?.length || 0}</strong>
				</span>
				{#if currentSequence.grid_mode}
					<span class="footer-info">
						Grid: <strong>{currentSequence.grid_mode}</strong>
					</span>
				{/if}
			{/if}
		</div>
		<div class="footer-right">
			<span class="footer-help">
				💡 Use <kbd>Ctrl+S</kbd> to save, <kbd>Ctrl+E</kbd> to export
			</span>
		</div>
	</div>

	<!-- Processing Overlay -->
	{#if isProcessing}
		<div class="processing-overlay">
			<div class="processing-content">
				<div class="processing-spinner"></div>
				<p>Processing...</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.sequence-tab {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		background: var(--background);
		position: relative;
		overflow: hidden;
	}

	/* Header Section */
	.sequence-header {
		flex-shrink: 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-lg) var(--spacing-xl);
		background: var(--muted)/20;
		border-bottom: 2px solid var(--border);
		min-height: 80px;
	}

	.header-left {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.tab-title {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		margin: 0;
		color: var(--foreground);
		font-size: var(--font-size-2xl);
		font-weight: 600;
	}

	.icon {
		font-size: 1.5em;
	}

	.sequence-info {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.sequence-details {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		flex-wrap: wrap;
	}

	.sequence-name {
		padding: var(--spacing-xs) var(--spacing-sm);
		background: var(--primary);
		color: var(--primary-foreground);
		border-radius: var(--border-radius);
		font-weight: 600;
		font-size: var(--font-size-sm);
	}

	.beat-count {
		padding: var(--spacing-xs) var(--spacing-sm);
		background: var(--accent);
		color: var(--accent-foreground);
		border-radius: var(--border-radius);
		font-weight: 500;
		font-size: var(--font-size-sm);
	}

	.start-position {
		padding: var(--spacing-xs) var(--spacing-sm);
		background: var(--secondary);
		color: var(--secondary-foreground);
		border-radius: var(--border-radius);
		font-weight: 500;
		font-size: var(--font-size-sm);
	}

	.no-sequence {
		color: var(--muted-foreground);
		font-style: italic;
	}

	.header-actions {
		display: flex;
		gap: var(--spacing-md);
		align-items: center;
	}

	.action-btn {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-md) var(--spacing-lg);
		border: 2px solid var(--border);
		border-radius: var(--border-radius);
		background: var(--background);
		color: var(--foreground);
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 100px;
		justify-content: center;
	}

	.action-btn:hover:not(:disabled) {
		background: var(--muted);
		border-color: var(--accent);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.action-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.save-btn:hover:not(:disabled) {
		border-color: var(--primary);
		color: var(--primary);
	}

	.export-btn:hover:not(:disabled) {
		border-color: var(--accent);
		color: var(--accent);
	}

	.btn-icon {
		font-size: 1.1em;
	}

	/* Status Messages */
	.status-message {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-md) var(--spacing-xl);
		font-weight: 500;
		position: relative;
	}

	.error-message {
		background: var(--destructive)/10;
		color: var(--destructive);
		border-bottom: 1px solid var(--destructive)/20;
	}

	.success-message {
		background: #10b981/10;
		color: #047857;
		border-bottom: 1px solid #10b981/20;
	}

	.status-icon {
		font-size: 1.2em;
	}

	.dismiss-btn {
		margin-left: auto;
		padding: var(--spacing-xs);
		border: none;
		background: none;
		color: inherit;
		font-size: 1.5em;
		cursor: pointer;
		opacity: 0.7;
		transition: opacity 0.2s ease;
	}

	.dismiss-btn:hover {
		opacity: 1;
	}

	/* Main Workbench Area */
	.workbench-container {
		flex: 1;
		padding: var(--spacing-lg);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.workbench-wrapper {
		flex: 1;
		background: var(--card);
		border: 2px solid var(--border);
		border-radius: var(--border-radius-lg);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	/* Loading State */
	.loading-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-lg);
		color: var(--muted-foreground);
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid var(--muted);
		border-top: 4px solid var(--primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.loading-state p {
		margin: 0;
		font-size: var(--font-size-lg);
		font-weight: 500;
	}

	/* Footer */
	.sequence-footer {
		flex-shrink: 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-md) var(--spacing-xl);
		background: var(--muted)/10;
		border-top: 1px solid var(--border);
		font-size: var(--font-size-sm);
	}

	.footer-left {
		display: flex;
		gap: var(--spacing-lg);
	}

	.footer-info {
		color: var(--muted-foreground);
	}

	.footer-info strong {
		color: var(--foreground);
	}

	.footer-help {
		color: var(--muted-foreground);
		font-style: italic;
	}

	kbd {
		padding: 2px 6px;
		background: var(--muted);
		border: 1px solid var(--border);
		border-radius: 3px;
		font-size: 0.9em;
		font-family: monospace;
	}

	/* Processing Overlay */
	.processing-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(255, 255, 255, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(4px);
	}

	.processing-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-lg);
		padding: var(--spacing-xl);
		background: var(--card);
		border: 2px solid var(--border);
		border-radius: var(--border-radius-lg);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.processing-spinner {
		width: 48px;
		height: 48px;
		border: 4px solid var(--muted);
		border-top: 4px solid var(--primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.processing-content p {
		margin: 0;
		color: var(--foreground);
		font-size: var(--font-size-lg);
		font-weight: 600;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	/* Responsive Design */
	@media (max-width: 1024px) {
		.sequence-header {
			flex-direction: column;
			gap: var(--spacing-md);
			min-height: auto;
			padding: var(--spacing-md);
		}

		.header-left,
		.header-actions {
			width: 100%;
		}

		.header-actions {
			justify-content: center;
		}

		.sequence-footer {
			flex-direction: column;
			gap: var(--spacing-sm);
			text-align: center;
		}
	}

	@media (max-width: 768px) {
		.tab-title {
			font-size: var(--font-size-xl);
		}

		.sequence-details {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-sm);
		}

		.workbench-container {
			padding: var(--spacing-md);
		}

		.action-btn {
			min-width: 80px;
			padding: var(--spacing-sm) var(--spacing-md);
		}

		.footer-left {
			flex-direction: column;
			gap: var(--spacing-sm);
		}
	}
</style>

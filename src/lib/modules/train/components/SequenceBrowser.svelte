<!--
  SequenceBrowser.svelte - Simple sequence browser for Train module

  Uses Library service instead of Discover to avoid dependency issues.
-->
<script lang="ts">
	import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
	import { tryResolve, TYPES } from "$lib/shared/inversify";
	import type { ILibraryService } from "$lib/modules/library/services/contracts/ILibraryService";
	import { onMount } from "svelte";
	import { Drawer } from "$lib/shared/foundation/ui";

	interface Props {
		show?: boolean;
		onSelect?: (sequence: SequenceData) => void;
		onClose?: () => void;
	}

	let { show = false, onSelect, onClose }: Props = $props();

	// Services - lazily resolved
	let libraryService: ILibraryService | null = null;

	// State
	let sequences = $state<SequenceData[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let searchQuery = $state("");

	// Filtered sequences
	const filteredSequences = $derived.by(() => {
		if (!searchQuery.trim()) return sequences;

		const query = searchQuery.toLowerCase();
		return sequences.filter(
			(seq) =>
				seq.word?.toLowerCase().includes(query) ||
				seq.name?.toLowerCase().includes(query)
		);
	});

	async function loadSequences() {
		try {
			isLoading = true;
			error = null;

			// Resolve service if not already resolved
			if (!libraryService) {
				libraryService = tryResolve<ILibraryService>(TYPES.ILibraryService);
				if (!libraryService) {
					throw new Error("Library service not available");
				}
			}

			const loaded = await libraryService.getSequences();
			sequences = loaded;
		} catch (err) {
			console.error("Failed to load sequences:", err);
			error = err instanceof Error ? err.message : "Failed to load sequences";
		} finally {
			isLoading = false;
		}
	}

	function handleSelect(sequence: SequenceData) {
		onSelect?.(sequence);
	}

	// Load sequences when drawer is opened
	$effect(() => {
		if (show && sequences.length === 0 && !isLoading) {
			loadSequences();
		}
	});
</script>

<Drawer isOpen={show} onclose={onClose}>
	<div class="sequence-browser">
		<header class="browser-header">
			<h2>Select a Sequence</h2>
			<button class="close-button" onclick={onClose} aria-label="Close">
				<i class="fas fa-times"></i>
			</button>
		</header>

		<!-- Search -->
		<div class="search-bar">
			<i class="fas fa-search"></i>
			<input
				type="text"
				placeholder="Search sequences..."
				bind:value={searchQuery}
			/>
		</div>

		<!-- Content -->
		<div class="browser-content">
			{#if isLoading}
				<div class="loading-state">
					<i class="fas fa-spinner fa-spin"></i>
					<p>Loading sequences...</p>
				</div>
			{:else if error}
				<div class="error-state">
					<i class="fas fa-exclamation-triangle"></i>
					<p>{error}</p>
					<button onclick={loadSequences}>Retry</button>
				</div>
			{:else if filteredSequences.length === 0}
				<div class="empty-state">
					<i class="fas fa-folder-open"></i>
					<p>
						{searchQuery ? "No sequences found matching your search" : "No sequences available"}
					</p>
				</div>
			{:else}
				<div class="sequences-grid">
					{#each filteredSequences as sequence (sequence.id)}
						<button class="sequence-card" onclick={() => handleSelect(sequence)}>
							<div class="sequence-info">
								<h3>{sequence.word || sequence.name || "Untitled"}</h3>
								<div class="sequence-meta">
									<span><i class="fas fa-drum"></i> {sequence.beats?.length || 0} beats</span>
									{#if sequence.author}
										<span><i class="fas fa-user"></i> {sequence.author}</span>
									{/if}
								</div>
							</div>
							<i class="fas fa-chevron-right"></i>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</Drawer>

<style>
	.sequence-browser {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--background-primary, #0f0f0f);
		color: white;
	}

	.browser-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.browser-header h2 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.close-button {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		color: white;
		cursor: pointer;
		transition: all 0.2s;
	}

	.close-button:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.search-bar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
		background: rgba(255, 255, 255, 0.05);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.search-bar i {
		color: rgba(255, 255, 255, 0.5);
	}

	.search-bar input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: white;
		font-size: 1rem;
	}

	.search-bar input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	.browser-content {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
	}

	.loading-state,
	.error-state,
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 3rem 1rem;
		text-align: center;
		color: rgba(255, 255, 255, 0.6);
	}

	.loading-state i,
	.error-state i,
	.empty-state i {
		font-size: 3rem;
		color: rgba(255, 255, 255, 0.3);
	}

	.error-state button {
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #3b82f6, #8b5cf6);
		border: none;
		border-radius: 8px;
		color: white;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.error-state button:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
	}

	.sequences-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.sequence-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.25rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		color: white;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
	}

	.sequence-card:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(59, 130, 246, 0.4);
		transform: translateX(4px);
	}

	.sequence-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.sequence-info h3 {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.sequence-meta {
		display: flex;
		gap: 1rem;
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.6);
	}

	.sequence-meta span {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.sequence-card > i {
		color: rgba(255, 255, 255, 0.3);
		transition: all 0.2s;
	}

	.sequence-card:hover > i {
		color: rgba(59, 130, 246, 0.8);
		transform: translateX(4px);
	}
</style>

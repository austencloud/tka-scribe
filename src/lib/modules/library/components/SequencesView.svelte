<!--
  SequencesView.svelte - Sequences Library View

  Displays:
  - All sequences: All sequences in user's library
  - My Creations: Sequences created by the user
  - Forked: Sequences forked from other creators
  - Favorites: User's starred/bookmarked sequences

  Features:
  - Real-time Firestore sync
  - Search, sort, and filter
  - Selection mode for batch operations
  - Opens sequence viewer on click
-->
<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { goto } from "$app/navigation";
	import { libraryState } from "../state/library-state.svelte";
	import { authStore } from "$shared/auth/stores/authStore.svelte";
	import SequenceCard from "../../explore/gallery/display/components/SequenceCard/SequenceCard.svelte";
	import type { LibrarySequence } from "../domain/models/LibrarySequence";
	import type { SequenceData } from "$shared/foundation/domain/models/SequenceData";

	type ViewFilter = "all" | "created" | "forked" | "favorites";

	// Local UI state
	let currentFilter = $state<ViewFilter>("all");
	let searchQuery = $state("");
	let showSortMenu = $state(false);

	// Derived from library state
	const isLoading = $derived(libraryState.isLoading);
	const error = $derived(libraryState.error);
	const isSelectMode = $derived(libraryState.isSelectMode);
	const selectedCount = $derived(libraryState.selectedCount);
	const isAuthenticated = $derived(!!authStore.effectiveUserId);

	// Filtered sequences based on current filter
	const displayedSequences = $derived(() => {
		let sequences = libraryState.filteredSequences;

		switch (currentFilter) {
			case "created":
				return sequences.filter((s) => s.source === "created");
			case "forked":
				return sequences.filter((s) => s.source === "forked");
			case "favorites":
				return sequences.filter((s) => s.isFavorite);
			default:
				return sequences;
		}
	});

	// Stats for filter badges
	const stats = $derived({
		all: libraryState.sequences.length,
		created: libraryState.sequences.filter((s) => s.source === "created")
			.length,
		forked: libraryState.sequences.filter((s) => s.source === "forked").length,
		favorites: libraryState.sequences.filter((s) => s.isFavorite).length,
	});

	// Sort options
	const sortOptions = [
		{ field: "updatedAt", label: "Recently Updated" },
		{ field: "createdAt", label: "Date Created" },
		{ field: "name", label: "Name" },
		{ field: "word", label: "Word" },
	] as const;

	// Filter handlers
	function handleFilterChange(filter: ViewFilter) {
		currentFilter = filter;
	}

	function handleSearchInput(event: Event) {
		const target = event.target as HTMLInputElement;
		searchQuery = target.value;
		libraryState.setSearchQuery(searchQuery);
	}

	function handleSortChange(
		field: "updatedAt" | "createdAt" | "name" | "word"
	) {
		if (libraryState.filters.sortBy === field) {
			libraryState.toggleSortDirection();
		} else {
			libraryState.setSortBy(field);
		}
		showSortMenu = false;
	}

	// Selection handlers
	function enterSelectMode() {
		libraryState.enterSelectMode();
	}

	function exitSelectMode() {
		libraryState.exitSelectMode();
	}

	function handleSelectAll() {
		libraryState.selectAll();
	}

	function handleCardClick(sequence: SequenceData) {
		if (isSelectMode) {
			libraryState.toggleSelection(sequence.id ?? "");
		} else {
			// Navigate to sequence viewer
			openSequenceViewer(sequence.id ?? "");
		}
	}

	function openSequenceViewer(sequenceId: string) {
		// Navigate to the sequence viewer route
		goto(`/sequence?id=${sequenceId}`);
	}

	// Batch actions
	async function handleDeleteSelected() {
		if (selectedCount === 0) return;

		const confirmed = confirm(
			`Delete ${selectedCount} sequence${selectedCount > 1 ? "s" : ""}? This cannot be undone.`
		);

		if (confirmed) {
			await libraryState.deleteSelected();
		}
	}

	async function handlePublishSelected() {
		await libraryState.setVisibilityBatch("public");
	}

	async function handleUnpublishSelected() {
		await libraryState.setVisibilityBatch("private");
	}

	// Initialize
	onMount(() => {
		if (isAuthenticated) {
			libraryState.initialize();
		}
	});

	onDestroy(() => {
		libraryState.dispose();
	});

	// Re-initialize when auth changes
	$effect(() => {
		if (isAuthenticated) {
			libraryState.initialize();
		} else {
			libraryState.reset();
		}
	});

	// Get cover URL for sequence
	function getCoverUrl(sequence: LibrarySequence): string | undefined {
		return sequence.thumbnails?.[0];
	}
</script>

<div class="sequences-view">
	<!-- Header with Search & Actions -->
	<div class="header-bar">
		<!-- Search -->
		<div class="search-container">
			<i class="fas fa-search search-icon"></i>
			<input
				type="text"
				placeholder="Search sequences..."
				value={searchQuery}
				oninput={handleSearchInput}
				class="search-input"
			/>
			{#if searchQuery}
				<button
					class="clear-search"
					aria-label="Clear search"
					onclick={() => {
						searchQuery = "";
						libraryState.setSearchQuery("");
					}}
				>
					<i class="fas fa-times"></i>
				</button>
			{/if}
		</div>

		<!-- Actions -->
		<div class="header-actions">
			<!-- Sort button -->
			<div class="sort-dropdown">
				<button
					class="action-btn"
					aria-label="Sort sequences"
					onclick={() => (showSortMenu = !showSortMenu)}
					title="Sort sequences"
				>
					<i class="fas fa-sort-amount-down"></i>
				</button>
				{#if showSortMenu}
					<div class="sort-menu">
						{#each sortOptions as option}
							<button
								class="sort-option"
								class:active={libraryState.filters.sortBy === option.field}
								onclick={() => handleSortChange(option.field)}
							>
								<span>{option.label}</span>
								{#if libraryState.filters.sortBy === option.field}
									<i
										class="fas fa-arrow-{libraryState.filters.sortDirection ===
										'asc'
											? 'up'
											: 'down'}"
									></i>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Select mode toggle -->
			{#if !isSelectMode}
				<button class="action-btn" aria-label="Select sequences" onclick={enterSelectMode} title="Select">
					<i class="fas fa-check-square"></i>
				</button>
			{:else}
				<button class="action-btn active" aria-label="Exit selection mode" onclick={exitSelectMode} title="Done">
					<i class="fas fa-times"></i>
				</button>
			{/if}
		</div>
	</div>

	<!-- Filter Tabs -->
	<div class="filter-tabs">
		<button
			class="filter-tab"
			class:active={currentFilter === "all"}
			onclick={() => handleFilterChange("all")}
		>
			<i class="fas fa-th"></i>
			<span>All</span>
			{#if stats.all > 0}
				<span class="badge">{stats.all}</span>
			{/if}
		</button>
		<button
			class="filter-tab"
			class:active={currentFilter === "created"}
			onclick={() => handleFilterChange("created")}
		>
			<i class="fas fa-pencil-alt"></i>
			<span>Created</span>
			{#if stats.created > 0}
				<span class="badge">{stats.created}</span>
			{/if}
		</button>
		<button
			class="filter-tab"
			class:active={currentFilter === "forked"}
			onclick={() => handleFilterChange("forked")}
		>
			<i class="fas fa-code-branch"></i>
			<span>Forked</span>
			{#if stats.forked > 0}
				<span class="badge">{stats.forked}</span>
			{/if}
		</button>
		<button
			class="filter-tab"
			class:active={currentFilter === "favorites"}
			onclick={() => handleFilterChange("favorites")}
		>
			<i class="fas fa-star"></i>
			<span>Favorites</span>
			{#if stats.favorites > 0}
				<span class="badge">{stats.favorites}</span>
			{/if}
		</button>
	</div>

	<!-- Selection Bar (when in select mode) -->
	{#if isSelectMode}
		<div class="selection-bar">
			<div class="selection-info">
				<span>{selectedCount} selected</span>
				<button class="text-btn" onclick={handleSelectAll}>Select All</button>
				<button class="text-btn" onclick={() => libraryState.clearSelection()}>
					Clear
				</button>
			</div>
			<div class="selection-actions">
				<button
					class="batch-btn"
					aria-label="Make selected sequences public"
					onclick={handlePublishSelected}
					disabled={selectedCount === 0}
					title="Make public"
				>
					<i class="fas fa-globe"></i>
				</button>
				<button
					class="batch-btn"
					aria-label="Make selected sequences private"
					onclick={handleUnpublishSelected}
					disabled={selectedCount === 0}
					title="Make private"
				>
					<i class="fas fa-lock"></i>
				</button>
				<button
					class="batch-btn danger"
					aria-label="Delete selected sequences"
					onclick={handleDeleteSelected}
					disabled={selectedCount === 0}
					title="Delete"
				>
					<i class="fas fa-trash"></i>
				</button>
			</div>
		</div>
	{/if}

	<!-- Content Area -->
	<div class="content-area">
		{#if !isAuthenticated}
			<div class="auth-required">
				<i class="fas fa-lock"></i>
				<h3>Sign In Required</h3>
				<p>Please sign in to access your library.</p>
			</div>
		{:else if isLoading}
			<div class="loading-state">
				<div class="spinner"></div>
				<p>Loading your library...</p>
			</div>
		{:else if error}
			<div class="error-state">
				<i class="fas fa-exclamation-triangle"></i>
				<h3>Error Loading Sequences</h3>
				<p>{error}</p>
				<button class="retry-button" onclick={() => libraryState.loadSequences()}>
					<i class="fas fa-redo"></i>
					Retry
				</button>
			</div>
		{:else if displayedSequences().length === 0}
			<div class="empty-state">
				<i class="fas fa-folder-open"></i>
				<h3>
					{#if searchQuery}
						No Results Found
					{:else if currentFilter === "created"}
						No Sequences Created Yet
					{:else if currentFilter === "forked"}
						No Forked Sequences
					{:else if currentFilter === "favorites"}
						No Favorites Yet
					{:else}
						Library is Empty
					{/if}
				</h3>
				<p>
					{#if searchQuery}
						Try a different search term.
					{:else if currentFilter === "created"}
						Create your first sequence in the Create module!
					{:else if currentFilter === "forked"}
						Fork sequences from the Explore tab to add them here.
					{:else if currentFilter === "favorites"}
						Star sequences to add them to your favorites.
					{:else}
						Start creating or exploring sequences to build your library.
					{/if}
				</p>
			</div>
		{:else}
			<div class="sequences-grid">
				{#each displayedSequences() as sequence (sequence.id)}
					<SequenceCard
						{sequence}
						coverUrl={getCoverUrl(sequence)}
						onPrimaryAction={handleCardClick}
						selected={libraryState.isSelected(sequence.id)}
					/>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.sequences-view {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		overflow: hidden;
	}

	/* Header Bar */
	.header-bar {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-md);
		background: rgba(255, 255, 255, 0.03);
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.search-container {
		flex: 1;
		position: relative;
		max-width: 400px;
	}

	.search-icon {
		position: absolute;
		left: var(--spacing-sm);
		top: 50%;
		transform: translateY(-50%);
		color: rgba(255, 255, 255, 0.4);
		font-size: 0.875rem;
	}

	.search-input {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		padding-left: calc(var(--spacing-sm) + 1.5rem);
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: var(--border-radius-md);
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.875rem;
	}

	.search-input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	.search-input:focus {
		outline: none;
		border-color: rgba(16, 185, 129, 0.4);
		background: rgba(255, 255, 255, 0.08);
	}

	.clear-search {
		position: absolute;
		right: var(--spacing-sm);
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.4);
		cursor: pointer;
		padding: var(--spacing-xs);
	}

	.clear-search:hover {
		color: rgba(255, 255, 255, 0.7);
	}

	.header-actions {
		display: flex;
		gap: var(--spacing-xs);
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: var(--border-radius-md);
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.action-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.9);
	}

	.action-btn.active {
		background: rgba(16, 185, 129, 0.2);
		border-color: rgba(16, 185, 129, 0.4);
		color: rgba(16, 185, 129, 0.9);
	}

	/* Sort Dropdown */
	.sort-dropdown {
		position: relative;
	}

	.sort-menu {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: var(--spacing-xs);
		background: rgba(30, 30, 40, 0.98);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: var(--border-radius-md);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
		z-index: 100;
		min-width: 180px;
		overflow: hidden;
	}

	.sort-option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.875rem;
		text-align: left;
		cursor: pointer;
		transition: background 0.15s ease;
	}

	.sort-option:hover {
		background: rgba(255, 255, 255, 0.08);
	}

	.sort-option.active {
		background: rgba(16, 185, 129, 0.15);
		color: rgba(16, 185, 129, 0.9);
	}

	/* Filter Tabs */
	.filter-tabs {
		display: flex;
		gap: var(--spacing-sm);
		padding: var(--spacing-md);
		background: rgba(255, 255, 255, 0.02);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		overflow-x: auto;
		overflow-y: hidden;
		flex-shrink: 0;
	}

	.filter-tab {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm) var(--spacing-md);
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: var(--border-radius-md);
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.filter-tab:hover {
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.9);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.filter-tab.active {
		background: rgba(16, 185, 129, 0.2);
		border-color: rgba(16, 185, 129, 0.4);
		color: rgba(255, 255, 255, 1);
	}

	.filter-tab i {
		font-size: 0.875rem;
	}

	.badge {
		background: rgba(255, 255, 255, 0.15);
		padding: 2px 6px;
		border-radius: 10px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.filter-tab.active .badge {
		background: rgba(16, 185, 129, 0.4);
	}

	/* Selection Bar */
	.selection-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-sm) var(--spacing-md);
		background: rgba(16, 185, 129, 0.1);
		border-bottom: 1px solid rgba(16, 185, 129, 0.2);
	}

	.selection-info {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.875rem;
	}

	.text-btn {
		background: none;
		border: none;
		color: rgba(16, 185, 129, 0.9);
		font-size: 0.875rem;
		cursor: pointer;
		padding: 0;
	}

	.text-btn:hover {
		text-decoration: underline;
	}

	.selection-actions {
		display: flex;
		gap: var(--spacing-xs);
	}

	.batch-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: var(--border-radius-sm);
		color: rgba(255, 255, 255, 0.8);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.batch-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.2);
	}

	.batch-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.batch-btn.danger:hover:not(:disabled) {
		background: rgba(239, 68, 68, 0.3);
		border-color: rgba(239, 68, 68, 0.4);
		color: rgba(239, 68, 68, 0.9);
	}

	/* Content Area */
	.content-area {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: var(--spacing-lg);
	}

	/* Loading State */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: rgba(255, 255, 255, 0.7);
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid rgba(255, 255, 255, 0.1);
		border-top-color: rgba(16, 185, 129, 0.8);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin-bottom: var(--spacing-md);
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Auth Required State */
	.auth-required {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		text-align: center;
		color: rgba(255, 255, 255, 0.7);
		padding: var(--spacing-xl);
	}

	.auth-required i {
		font-size: 4rem;
		margin-bottom: var(--spacing-lg);
		opacity: 0.5;
	}

	.auth-required h3 {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: var(--spacing-md);
		color: rgba(255, 255, 255, 0.9);
	}

	/* Empty State */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		text-align: center;
		color: rgba(255, 255, 255, 0.7);
		padding: var(--spacing-xl);
	}

	.empty-state i {
		font-size: 4rem;
		margin-bottom: var(--spacing-lg);
		opacity: 0.5;
	}

	.empty-state h3 {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: var(--spacing-md);
		color: rgba(255, 255, 255, 0.9);
	}

	.empty-state p {
		font-size: 1rem;
		line-height: 1.6;
		max-width: 400px;
	}

	/* Error State */
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		text-align: center;
		color: rgba(255, 255, 255, 0.7);
		padding: var(--spacing-xl);
	}

	.error-state i {
		font-size: 4rem;
		margin-bottom: var(--spacing-lg);
		color: rgba(239, 68, 68, 0.7);
	}

	.error-state h3 {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: var(--spacing-md);
		color: rgba(255, 255, 255, 0.9);
	}

	.error-state p {
		font-size: 1rem;
		margin-bottom: var(--spacing-lg);
		max-width: 400px;
	}

	.retry-button {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm) var(--spacing-lg);
		background: rgba(16, 185, 129, 0.2);
		border: 1px solid rgba(16, 185, 129, 0.4);
		border-radius: var(--border-radius-md);
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.retry-button:hover {
		background: rgba(16, 185, 129, 0.3);
		border-color: rgba(16, 185, 129, 0.5);
	}

	/* Sequences Grid */
	.sequences-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: var(--spacing-md);
	}

	/* Responsive adjustments */
	@container (max-width: 600px) {
		.sequences-grid {
			grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		}

		.filter-tab span {
			display: none;
		}

		.filter-tab .badge {
			display: none;
		}
	}
</style>

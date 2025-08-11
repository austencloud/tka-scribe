<script lang="ts">
	import type { BrowseSequenceMetadata, FilterType, FilterValue } from '$lib/domain/browse';
	import { NavigationMode } from '$lib/domain/browse';
	import { resolve } from '$lib/services/bootstrap';
	import type {
		IBrowseService,
		ISequenceIndexService,
		IThumbnailService,
	} from '$lib/services/interfaces';
	import { createBrowseState } from '$lib/state/browse-state.svelte';
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import DeleteConfirmationDialog from './browse/DeleteConfirmationDialog.svelte';
	import FilterSelectionPanel from './browse/FilterSelectionPanel.svelte';
	import NavigationSidebar from './browse/NavigationSidebar.svelte';
	import SequenceBrowserPanel from './browse/sequence-browser/SequenceBrowserPanel.svelte';
	import { SequenceViewer } from './browse/sequence-viewer';

	// ✅ RESOLVE SERVICES: Get services from DI container
	const browseService = resolve('IBrowseService') as IBrowseService;
	const thumbnailService = resolve('IThumbnailService') as IThumbnailService;
	const sequenceIndexService = resolve('ISequenceIndexService') as ISequenceIndexService;
	// Advanced browse services
	const favoritesService = resolve('IFavoritesService');
	const navigationService = resolve('INavigationService');
	const filterPersistenceService = resolve('IFilterPersistenceService');
	const sectionService = resolve('ISectionService');
	const deleteService = resolve('IDeleteService');

	// ✅ CREATE BROWSE STATE: Runes-based reactive state
	const browseState = createBrowseState(
		browseService,
		thumbnailService,
		sequenceIndexService,
		favoritesService,
		navigationService,
		filterPersistenceService,
		sectionService,
		deleteService
	);

	// ✅ PURE RUNES: Local UI state
	let currentPanelIndex = $state(0); // 0 = filter selection, 1 = sequence browser

	// ✅ DERIVED RUNES: Computed UI state from browse state
	let selectedFilter = $derived(browseState.currentFilter);
	let selectedSequence = $derived(browseState.selectedSequence);
	let isLoading = $derived(browseState.isLoading);
	let hasError = $derived(browseState.hasError);
	let sequences = $derived(browseState.displayedSequences);
	let navigationMode = $derived(browseState.navigationMode);

	// Advanced derived values
	let navigationSections = $derived(browseState.navigationSections);
	let favorites = $derived(browseState.favorites);
	let deleteConfirmation = $derived(browseState.deleteConfirmation);
	let showDeleteDialog = $derived(browseState.showDeleteDialog);

	// ✅ EFFECT: Sync navigation mode with panel index
	$effect(() => {
		if (navigationMode === NavigationMode.FILTER_SELECTION) {
			currentPanelIndex = 0;
		} else if (navigationMode === NavigationMode.SEQUENCE_BROWSER) {
			currentPanelIndex = 1;
		}
	});

	// Load initial data when component mounts
	onMount(async () => {
		try {
			console.log('🚀 Loading browse data...');
			await browseState.loadAllSequences();
			console.log('✅ Browse data loaded successfully');
		} catch (error) {
			console.error('❌ Failed to load browse data:', error);
		}
	});

	// ✅ RUNES METHODS: Event handlers that delegate to state
	function handleFilterSelected(data: { type: FilterType; value: FilterValue }) {
		console.log('🔍 Filter selected:', data);
		browseState.applyFilter(data.type, data.value);
		currentPanelIndex = 1;
	}

	function handleSequenceSelected(sequence: BrowseSequenceMetadata) {
		console.log('📄 Sequence selected:', sequence.word);
		browseState.selectSequence(sequence);
	}

	function handleBackToFilters() {
		console.log('⬅️ Back to filters');
		browseState.backToFilters();
		currentPanelIndex = 0;
	}

	function handleBackToBrowser() {
		console.log('⬅️ Back to browser');
		browseState.clearSelection();
	}

	function handleSequenceAction(action: string, sequence: BrowseSequenceMetadata) {
		console.log(`🎬 Action: ${action} on sequence:`, sequence.word);

		switch (action) {
			case 'edit':
				// TODO: Navigate to construct tab with this sequence
				console.log('Edit sequence:', sequence.id);
				break;
			case 'save':
			case 'favorite':
				// Toggle favorite status
				browseState.toggleFavorite(sequence.id);
				break;
			case 'delete':
				// Prepare delete confirmation
				browseState.prepareDeleteSequence(sequence);
				break;
			case 'fullscreen':
				// TODO: Open sequence in fullscreen viewer
				console.log('Fullscreen sequence:', sequence.id);
				break;
			default:
				console.warn('Unknown action:', action);
		}
	}

	// Navigation sidebar handlers
	function handleNavigationSectionToggle(sectionId: string) {
		browseState.toggleNavigationSection(sectionId);
	}

	function handleNavigationItemClick(sectionId: string, itemId: string) {
		browseState.setActiveNavigationItem(sectionId, itemId);
		// Apply filter based on navigation selection
		// TODO: Implement navigation-based filtering
	}

	// Section handlers (commented out - not currently used)
	// function handleSectionToggle(sectionId: string) {
	// 	browseState.toggleSequenceSection(sectionId);
	// }

	// Delete confirmation handlers
	function handleConfirmDelete() {
		browseState.confirmDeleteSequence();
	}

	function handleCancelDelete() {
		browseState.cancelDeleteSequence();
	}

	// Handle errors
	function handleClearError() {
		browseState.clearError();
	}
</script>

<div class="browse-tab">
	<!-- Error banner -->
	{#if hasError}
		<div class="error-banner" transition:slide>
			<div class="error-content">
				<span class="error-message">{browseState.loadingState.error}</span>
				<button class="error-dismiss" onclick={handleClearError}>✕</button>
			</div>
		</div>
	{/if}

	<!-- Main three-column layout: Navigation | Panels | Viewer -->
	<div class="main-layout">
		<!-- Navigation Sidebar (left) -->
		<div class="navigation-sidebar-container">
			<NavigationSidebar
				sections={navigationSections}
				onSectionToggle={handleNavigationSectionToggle}
				onItemClick={handleNavigationItemClick}
			/>
		</div>

		<!-- Center - Stacked panels (Filter/Browser) -->
		<div class="center-panel-stack">
			{#if currentPanelIndex === 0}
				<!-- Filter Selection Panel -->
				<div class="panel-container" data-panel="filter-selection">
					<FilterSelectionPanel onFilterSelected={handleFilterSelected} />
				</div>
			{:else if currentPanelIndex === 1}
				<!-- Sequence Browser Panel -->
				<div class="panel-container" data-panel="sequence-browser">
					<SequenceBrowserPanel
						filter={selectedFilter}
						{sequences}
						{isLoading}
						{favorites}
						onSequenceSelected={handleSequenceSelected}
						onBackToFilters={handleBackToFilters}
						onFavoriteToggle={browseState.toggleFavorite}
					/>
				</div>
			{/if}
		</div>

		<!-- Right side - Sequence Viewer Panel -->
		<div class="right-panel">
			<SequenceViewer
				sequence={selectedSequence}
				onBackToBrowser={handleBackToBrowser}
				onSequenceAction={handleSequenceAction}
			/>
		</div>
	</div>

	<!-- Loading overlay for initial load -->
	{#if isLoading && sequences.length === 0}
		<div class="loading-overlay" transition:fade>
			<div class="loading-content">
				<div class="loading-spinner"></div>
				<p>Loading sequence library...</p>
				<p class="loading-detail">{browseState.loadingState.currentOperation}</p>
			</div>
		</div>
	{/if}

	<!-- Delete Confirmation Dialog -->
	<DeleteConfirmationDialog
		confirmationData={deleteConfirmation}
		show={showDeleteDialog}
		onConfirm={handleConfirmDelete}
		onCancel={handleCancelDelete}
	/>
</div>

<style>
	.browse-tab {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		overflow: hidden;
		background: transparent;
		position: relative;
	}

	/* Error banner */
	.error-banner {
		flex-shrink: 0;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 8px;
		margin: var(--spacing-md);
		padding: var(--spacing-md);
		z-index: 100;
	}

	.error-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-md);
	}

	.error-message {
		color: #dc2626;
		font-weight: 500;
		flex: 1;
	}

	.error-dismiss {
		background: none;
		border: none;
		color: #dc2626;
		font-size: 1.2rem;
		cursor: pointer;
		padding: var(--spacing-xs);
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.error-dismiss:hover {
		background: rgba(239, 68, 68, 0.1);
	}

	.main-layout {
		display: flex;
		flex: 1;
		gap: 0;
		overflow: hidden;
	}

	/* Three-column layout */
	.navigation-sidebar-container {
		flex: 0 0 250px; /* Fixed width for navigation */
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border-right: var(--glass-border);
		background: rgba(255, 255, 255, 0.05);
	}

	.center-panel-stack {
		flex: 1; /* Flexible width for main content */
		display: flex;
		flex-direction: column;
		overflow: hidden;
		min-width: 0;
	}

	.right-panel {
		flex: 0 0 350px; /* Fixed width for viewer */
		display: flex;
		flex-direction: column;
		overflow: hidden;
		min-width: 0;
		border-left: var(--glass-border);
	}

	.panel-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	/* Smooth panel transitions */
	.panel-container {
		animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(-20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	/* Loading overlay */
	.loading-overlay {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.loading-content {
		background: white;
		border-radius: 12px;
		padding: var(--spacing-xl);
		text-align: center;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
		max-width: 300px;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid #e2e8f0;
		border-top-color: var(--primary-color);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto var(--spacing-md);
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-content p {
		margin: 0;
		color: #374151;
		font-weight: 600;
	}

	.loading-detail {
		font-size: var(--font-size-sm);
		color: #6b7280;
		font-weight: 400;
		margin-top: var(--spacing-xs);
	}

	/* Responsive design */
	@media (max-width: 1200px) {
		.navigation-sidebar-container {
			flex: 0 0 200px; /* Smaller navigation on tablets */
		}

		.right-panel {
			flex: 0 0 300px; /* Smaller viewer on tablets */
		}
	}

	@media (max-width: 1024px) {
		.main-layout {
			flex-direction: column;
		}

		.navigation-sidebar-container {
			flex: 0 0 auto;
			max-height: 200px;
			border-right: none;
			border-bottom: var(--glass-border);
		}

		.center-panel-stack {
			flex: 1;
		}

		.right-panel {
			flex: 0 0 auto;
			max-height: 400px;
			border-left: none;
			border-top: var(--glass-border);
		}
	}

	@media (max-width: 768px) {
		.main-layout {
			gap: 0;
		}

		.error-banner {
			margin: var(--spacing-sm);
			padding: var(--spacing-sm);
		}
	}
</style>

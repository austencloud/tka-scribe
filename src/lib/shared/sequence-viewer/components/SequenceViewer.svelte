<!--
  SequenceViewer.svelte - Standalone Sequence Viewer

  Full-page sequence viewer that can be used as a landing page for deep links.
  Shows sequence details with the ability to edit beats inline.

  Features:
  - Sequence thumbnail with variation navigation
  - Beat grid with tap-to-edit
  - Action buttons (Edit, Share, Favorite, Open in Create)
  - Integrated EditSlidePanel for inline editing
-->
<script lang="ts">
	import type { SequenceData } from "$shared";
	import type { BeatData } from "$lib/modules/create/shared/domain/models/BeatData";
	import { resolve, tryResolve, TYPES } from "$shared";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { browser } from "$app/environment";
	import { createSequenceViewerState } from "../state/sequence-viewer-state.svelte";
	import type { ISequenceViewerService } from "../services/contracts/ISequenceViewerService";
	import type { IHapticFeedbackService } from "$shared";
	import EditSlidePanel from "$lib/modules/create/edit/components/EditSlidePanel.svelte";
	import { Pictograph } from "$shared";

	// Props
	const {
		sequenceId,
		initialSequence = null,
		onAction = () => {},
		onClose,
		onOpenInCreate,
	} = $props<{
		sequenceId?: string;
		initialSequence?: SequenceData | null;
		onAction?: (action: string, sequence: SequenceData) => void;
		onClose?: () => void;
		onOpenInCreate?: (sequence: SequenceData) => void;
	}>();

	// State
	const viewerState = createSequenceViewerState();

	// Services
	let viewerService: ISequenceViewerService | null = null;
	let hapticService: IHapticFeedbackService | null = null;

	// Derived
	const thumbnailUrl = $derived.by(() => {
		if (!viewerState.sequence) return "";
		return viewerService?.getThumbnailUrl(
			viewerState.sequence,
			viewerState.currentVariationIndex
		) ?? "";
	});

	const allBeats = $derived.by(() => {
		if (!viewerState.sequence) return [];
		const beats: { index: number; data: BeatData | null }[] = [];

		// Start position (index 0)
		const startPos = viewerState.sequence.startPosition ?? viewerState.sequence.startingPositionBeat;
		if (startPos) {
			beats.push({
				index: 0,
				data: {
					...startPos,
					beatNumber: 0,
					duration: 1000,
					blueReversal: false,
					redReversal: false,
					isBlank: false,
				} as BeatData,
			});
		}

		// Regular beats (index 1+)
		viewerState.sequence.beats.forEach((beat: BeatData, idx: number) => {
			beats.push({
				index: idx + 1,
				data: beat,
			});
		});

		return beats;
	});

	// Layout detection
	let windowWidth = $state(0);
	const isSideBySide = $derived(windowWidth >= 1024);

	function updateWidth() {
		if (browser) {
			windowWidth = window.innerWidth;
			viewerState.setLayoutMode(windowWidth >= 1024);
		}
	}

	// Load sequence
	async function loadSequence() {
		if (initialSequence) {
			viewerState.setSequence(initialSequence);
			return;
		}

		if (!sequenceId || !viewerService) {
			viewerState.setError("No sequence ID provided");
			return;
		}

		viewerState.setLoading(true);
		try {
			const seq = await viewerService.loadSequence(sequenceId);
			if (seq) {
				viewerState.setSequence(seq);
			} else {
				viewerState.setError("Sequence not found");
			}
		} catch (err) {
			viewerState.setError(err instanceof Error ? err.message : "Failed to load sequence");
		}
	}

	// Handlers
	function handleBeatClick(beatIndex: number, beatData: BeatData | null) {
		if (!beatData) return;
		hapticService?.trigger("selection");
		viewerState.selectBeat(beatIndex, beatData);
		viewerState.openEditPanel();
	}

	function handleEditPanelClose() {
		viewerState.closeEditPanel();
		viewerState.clearSelection();
	}

	function handleOrientationChanged(color: string, orientation: string) {
		if (!viewerState.sequence || viewerState.selectedBeatIndex === null || !viewerService) return;

		const updatedSequence = viewerService.updateBeatOrientation(
			viewerState.sequence,
			viewerState.selectedBeatIndex,
			color,
			orientation
		);
		viewerState.setSequence(updatedSequence);

		// Update selected beat data
		const newBeatData = viewerService.getBeatData(updatedSequence, viewerState.selectedBeatIndex);
		if (newBeatData) {
			viewerState.selectBeat(viewerState.selectedBeatIndex, newBeatData);
		}
	}

	function handleTurnAmountChanged(color: string, turnAmount: number) {
		if (!viewerState.sequence || viewerState.selectedBeatIndex === null || !viewerService) return;

		const updatedSequence = viewerService.updateBeatTurns(
			viewerState.sequence,
			viewerState.selectedBeatIndex,
			color,
			turnAmount
		);
		viewerState.setSequence(updatedSequence);

		// Update selected beat data
		const newBeatData = viewerService.getBeatData(updatedSequence, viewerState.selectedBeatIndex);
		if (newBeatData) {
			viewerState.selectBeat(viewerState.selectedBeatIndex, newBeatData);
		}
	}

	function handleRemoveBeat(beatNumber: number) {
		if (!viewerState.sequence || !viewerService) return;

		const updatedSequence = viewerService.removeBeat(viewerState.sequence, beatNumber - 1);
		viewerState.setSequence(updatedSequence);
		handleEditPanelClose();
	}

	function handleAction(action: string) {
		if (!viewerState.sequence) return;
		hapticService?.trigger("selection");

		switch (action) {
			case "open-in-create":
				// Use callback if provided, otherwise navigate directly
				if (onOpenInCreate) {
					onOpenInCreate(viewerState.sequence);
				} else {
					// Navigate to Create module with this sequence
					const encoded = viewerService?.encodeForUrl(viewerState.sequence);
					if (encoded) {
						goto(`/?open=construct:${encoded}`);
					}
				}
				break;
			case "share":
				// Share action
				onAction("share", viewerState.sequence);
				break;
			case "favorite":
				// Toggle favorite
				onAction("favorite", viewerState.sequence);
				break;
			default:
				onAction(action, viewerState.sequence);
		}
	}

	function handleClose() {
		if (onClose) {
			onClose();
		} else if (browser) {
			// Navigate back or to home
			if (history.length > 1) {
				history.back();
			} else {
				goto("/");
			}
		}
	}

	function handleVariationChange(delta: number) {
		hapticService?.trigger("selection");
		if (delta > 0) {
			viewerState.nextVariation();
		} else {
			viewerState.previousVariation();
		}
	}

	// Lifecycle
	onMount(() => {
		viewerService = tryResolve<ISequenceViewerService>(TYPES.ISequenceViewerService);
		hapticService = tryResolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);

		updateWidth();
		window.addEventListener("resize", updateWidth);

		// Load sequence after services are resolved
		loadSequence();

		return () => {
			window.removeEventListener("resize", updateWidth);
		};
	});
</script>

<div class="sequence-viewer" class:side-by-side={isSideBySide}>
	<!-- Header -->
	<header class="viewer-header">
		<button class="back-button" onclick={handleClose} aria-label="Go back">
			<i class="fas fa-arrow-left"></i>
		</button>
		<h1 class="viewer-title">
			{viewerState.sequence?.word || viewerState.sequence?.name || "Sequence"}
		</h1>
		<div class="header-spacer"></div>
	</header>

	<!-- Main Content -->
	<main class="viewer-content">
		{#if viewerState.isLoading}
			<div class="loading-state">
				<div class="spinner"></div>
				<p>Loading sequence...</p>
			</div>
		{:else if viewerState.error}
			<div class="error-state">
				<i class="fas fa-exclamation-triangle"></i>
				<p>{viewerState.error}</p>
				<button onclick={handleClose}>Go Back</button>
			</div>
		{:else if viewerState.sequence}
			<!-- Thumbnail Section -->
			<section class="thumbnail-section">
				{#if thumbnailUrl}
					<img
						src={thumbnailUrl}
						alt={viewerState.sequence.word || "Sequence"}
						class="thumbnail-image"
					/>
				{:else}
					<div class="thumbnail-placeholder">
						<i class="fas fa-image"></i>
					</div>
				{/if}

				<!-- Variation Navigation -->
				{#if viewerState.hasMultipleVariations}
					<div class="variation-nav">
						<button
							class="nav-button"
							onclick={() => handleVariationChange(-1)}
							disabled={viewerState.currentVariationIndex === 0}
							aria-label="Previous variation"
						>
							<i class="fas fa-chevron-left"></i>
						</button>
						<span class="variation-indicator">
							{viewerState.currentVariationIndex + 1} / {viewerState.totalVariations}
						</span>
						<button
							class="nav-button"
							onclick={() => handleVariationChange(1)}
							disabled={viewerState.currentVariationIndex === viewerState.totalVariations - 1}
							aria-label="Next variation"
						>
							<i class="fas fa-chevron-right"></i>
						</button>
					</div>
				{/if}
			</section>

			<!-- Metadata -->
			<section class="metadata-section">
				{#if viewerState.sequence.author}
					<div class="metadata-item">
						<span class="label">Author</span>
						<span class="value">{viewerState.sequence.author}</span>
					</div>
				{/if}
				{#if viewerState.sequence.beats.length > 0}
					<div class="metadata-item">
						<span class="label">Beats</span>
						<span class="value">{viewerState.sequence.beats.length}</span>
					</div>
				{/if}
				{#if viewerState.sequence.level}
					<div class="metadata-item">
						<span class="label">Level</span>
						<span class="value">{viewerState.sequence.level}</span>
					</div>
				{/if}
			</section>

			<!-- Beat Grid (tap to edit) -->
			<section class="beats-section">
				<h2 class="section-title">Beats <span class="hint">(tap to edit)</span></h2>
				<div class="beat-grid">
					{#each allBeats as { index, data }}
						<button
							class="beat-cell"
							class:selected={viewerState.selectedBeatIndex === index}
							onclick={() => handleBeatClick(index, data)}
							aria-label={index === 0 ? "Edit start position" : `Edit beat ${index}`}
						>
							{#if data}
								<div class="beat-pictograph">
									<Pictograph pictographData={data} />
								</div>
							{/if}
							<span class="beat-label">
								{index === 0 ? "Start" : index}
							</span>
						</button>
					{/each}
				</div>
			</section>

			<!-- Action Buttons -->
			<section class="actions-section">
				<button class="action-button primary" onclick={() => handleAction("open-in-create")}>
					<i class="fas fa-pen-to-square"></i>
					Open in Create
				</button>
				<button class="action-button" onclick={() => handleAction("share")}>
					<i class="fas fa-share-alt"></i>
					Share
				</button>
				<button
					class="action-button"
					class:active={viewerState.sequence.isFavorite}
					onclick={() => handleAction("favorite")}
				>
					<i class={viewerState.sequence.isFavorite ? "fas fa-heart" : "far fa-heart"}></i>
					Favorite
				</button>
			</section>
		{/if}
	</main>
</div>

<!-- Edit Panel -->
{#if viewerState.sequence}
	<EditSlidePanel
		isOpen={viewerState.isEditPanelOpen}
		onClose={handleEditPanelClose}
		selectedBeatNumber={viewerState.selectedBeatIndex}
		selectedBeatData={viewerState.selectedBeatData}
		placement="bottom"
		onOrientationChanged={handleOrientationChanged}
		onTurnAmountChanged={handleTurnAmountChanged}
		onRemoveBeat={handleRemoveBeat}
	/>
{/if}

<style>
	.sequence-viewer {
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: column;
		background: var(--app-bg, #0a0a0f);
		color: white;
		overflow: hidden;
	}

	/* Header */
	.viewer-header {
		display: flex;
		align-items: center;
		padding: 12px 16px;
		background: rgba(15, 20, 30, 0.95);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		flex-shrink: 0;
	}

	.back-button {
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		color: white;
		font-size: 18px;
		cursor: pointer;
		border-radius: 50%;
		transition: background 0.2s;
	}

	.back-button:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.viewer-title {
		flex: 1;
		text-align: center;
		font-size: 18px;
		font-weight: 600;
		margin: 0;
	}

	.header-spacer {
		width: 44px;
	}

	/* Content */
	.viewer-content {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	/* Loading & Error States */
	.loading-state,
	.error-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		color: rgba(255, 255, 255, 0.6);
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid rgba(255, 255, 255, 0.2);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error-state i {
		font-size: 48px;
		color: #ef4444;
	}

	.error-state button {
		padding: 12px 24px;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		color: white;
		cursor: pointer;
	}

	/* Thumbnail Section */
	.thumbnail-section {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.thumbnail-image {
		max-width: 100%;
		max-height: 300px;
		object-fit: contain;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.05);
	}

	.thumbnail-placeholder {
		width: 200px;
		height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 12px;
		font-size: 48px;
		color: rgba(255, 255, 255, 0.2);
	}

	.variation-nav {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.nav-button {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.1);
		border: none;
		border-radius: 50%;
		color: white;
		cursor: pointer;
		transition: background 0.2s;
	}

	.nav-button:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.2);
	}

	.nav-button:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.variation-indicator {
		font-size: 14px;
		color: rgba(255, 255, 255, 0.6);
	}

	/* Metadata */
	.metadata-section {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		justify-content: center;
	}

	.metadata-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}

	.metadata-item .label {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.5);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.metadata-item .value {
		font-size: 16px;
		font-weight: 600;
	}

	/* Beats Section */
	.beats-section {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.section-title {
		font-size: 16px;
		font-weight: 600;
		margin: 0;
	}

	.section-title .hint {
		font-weight: 400;
		color: rgba(255, 255, 255, 0.5);
		font-size: 14px;
	}

	.beat-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
		gap: 12px;
	}

	.beat-cell {
		aspect-ratio: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.05);
		border: 2px solid transparent;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s;
		padding: 8px;
		gap: 4px;
	}

	.beat-cell:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.beat-cell.selected {
		background: rgba(59, 130, 246, 0.2);
		border-color: #3b82f6;
	}

	.beat-pictograph {
		width: 100%;
		height: calc(100% - 20px);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.beat-label {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.6);
	}

	/* Actions */
	.actions-section {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		justify-content: center;
		padding-bottom: 24px;
	}

	.action-button {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 20px;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		color: white;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.action-button:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	.action-button.primary {
		background: linear-gradient(135deg, #3b82f6, #2563eb);
		border: none;
	}

	.action-button.primary:hover {
		background: linear-gradient(135deg, #60a5fa, #3b82f6);
	}

	.action-button.active {
		color: #ef4444;
	}

	/* Side-by-side layout (desktop) */
	.sequence-viewer.side-by-side .viewer-content {
		flex-direction: row;
		flex-wrap: wrap;
		align-items: flex-start;
		max-width: 1200px;
		margin: 0 auto;
	}

	.sequence-viewer.side-by-side .thumbnail-section {
		flex: 1;
		min-width: 300px;
	}

	.sequence-viewer.side-by-side .beats-section {
		flex: 1;
		min-width: 300px;
	}

	.sequence-viewer.side-by-side .metadata-section,
	.sequence-viewer.side-by-side .actions-section {
		width: 100%;
	}
</style>

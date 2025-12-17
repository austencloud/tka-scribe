<!--
CreationStartScreen.svelte - Unified start screen for Create tabs

Main container that composes header, draft, library sequences, grid mode, and CTA.
Used by Assemble and Construct tabs (Generate has no start screen).
-->
<script lang="ts">
	import type { Snippet } from "svelte";
	import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
	import type { CreateTabDraft } from "../../domain/models/CreateTabDraft";
	import type { LibrarySequence } from "$lib/features/library/domain/models/LibrarySequence";
	import type { HowItWorksStep } from "./HowItWorksSection.svelte";

	import StartScreenHeader from "./StartScreenHeader.svelte";
	import HowItWorksSection from "./HowItWorksSection.svelte";
	import DraftSection from "./DraftSection.svelte";
	import RecentLibrarySection from "./RecentLibrarySection.svelte";
	import GridModeSelector from "./GridModeSelector.svelte";
	import StartNewButton from "./StartNewButton.svelte";

	interface Props {
		// Header content
		icon: Snippet;
		title: string;
		description: string;
		howItWorksSteps?: HowItWorksStep[];

		// Draft (optional)
		draft?: CreateTabDraft | null;
		onContinueDraft?: (draft: CreateTabDraft) => void;
		onDeleteDraft?: (draft: CreateTabDraft) => void;

		// Library sequences (optional, Construct only)
		recentSequences?: LibrarySequence[];
		onSelectLibrarySequence?: (sequence: LibrarySequence) => void;

		// Grid mode
		gridMode: GridMode;
		onGridModeChange: (mode: GridMode) => void;

		// Start new
		onStartNew: () => void;
		startButtonLabel?: string;

		// Styling
		accentColor?: string;
	}

	const {
		icon,
		title,
		description,
		howItWorksSteps,
		draft = null,
		onContinueDraft,
		onDeleteDraft,
		recentSequences = [],
		onSelectLibrarySequence,
		gridMode,
		onGridModeChange,
		onStartNew,
		startButtonLabel = "Start New Sequence",
		accentColor,
	}: Props = $props();

	const hasHowItWorks = $derived(howItWorksSteps && howItWorksSteps.length > 0);
	const hasDraft = $derived(draft !== null);
	const hasRecentSequences = $derived(recentSequences.length > 0);
</script>

<div class="creation-start-screen">
	<div class="start-screen-content">
		<!-- Header: Icon, Title, Description -->
		<StartScreenHeader {icon} {title} {description} {accentColor} />

		<!-- Draft Section (if draft exists) -->
		{#if hasDraft && onContinueDraft && onDeleteDraft}
			<DraftSection
				{draft}
				onContinue={onContinueDraft}
				onDelete={onDeleteDraft}
			/>
		{/if}

		<!-- Recent Library Sequences (Construct only) -->
		{#if hasRecentSequences && onSelectLibrarySequence}
			<RecentLibrarySection
				sequences={recentSequences}
				onSelect={onSelectLibrarySequence}
			/>
		{/if}

		<!-- How it Works -->
		{#if hasHowItWorks}
			<HowItWorksSection steps={howItWorksSteps!} />
		{/if}

		<!-- Grid Mode Selector -->
		<GridModeSelector {gridMode} {onGridModeChange} {accentColor} />

		<!-- Start New Button -->
		<StartNewButton
			label={startButtonLabel}
			{accentColor}
			onclick={onStartNew}
		/>
	</div>
</div>

<style>
	.creation-start-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 100%;
		padding: 24px;
		overflow-y: auto;
	}

	.start-screen-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 400px;
		width: 100%;
		gap: 20px;
	}

	/* Mobile */
	@media (max-width: 480px) {
		.creation-start-screen {
			padding: 16px;
		}

		.start-screen-content {
			gap: 16px;
		}
	}
</style>

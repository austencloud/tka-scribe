<!--
DraftSection.svelte - Display current draft for a tab

Shows the tab's draft with a "Continue" action if one exists.
Includes delete functionality.
-->
<script lang="ts">
	import type { CreateTabDraft } from "../../domain/models/CreateTabDraft";
	import { formatDraftAge } from "../../domain/models/CreateTabDraft";
	import SequenceCard from "./SequenceCard.svelte";

	interface Props {
		/** The draft to display (null if no draft) */
		draft: CreateTabDraft | null;
		/** Called when user wants to continue the draft */
		onContinue: (draft: CreateTabDraft) => void;
		/** Called when user deletes the draft */
		onDelete: (draft: CreateTabDraft) => void;
	}

	const { draft, onContinue, onDelete }: Props = $props();
</script>

{#if draft}
	<div class="draft-section">
		<div class="section-header">
			<h2 class="section-title">Continue your draft</h2>
		</div>

		<div class="draft-content">
			<SequenceCard
				thumbnailUrl={draft.thumbnailDataUrl}
				beatCount={draft.beatCount}
				timeAgo={formatDraftAge(draft)}
				name={draft.sequence.word || draft.sequence.name}
				onclick={() => onContinue(draft)}
				ondelete={() => onDelete(draft)}
			/>

			<button class="continue-btn" type="button" onclick={() => onContinue(draft)}>
				<span class="btn-text">Continue</span>
				<span class="btn-icon">→</span>
			</button>
		</div>
	</div>
{/if}

<style>
	.draft-section {
		width: 100%;
		background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
		border-radius: 12px;
		padding: 16px;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
	}

	.section-title {
		font-size: var(--font-size-compact, 12px);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
		margin: 0;
	}

	.draft-content {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.continue-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 12px 20px;
		background: color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 15%, transparent);
		border: 1px solid color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 30%, transparent);
		border-radius: 10px;
		color: var(--theme-text, rgba(255, 255, 255, 0.95));
		font-size: var(--font-size-min, 14px);
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.continue-btn:hover {
		background: color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 25%, transparent);
		border-color: color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 50%, transparent);
	}

	.continue-btn:active {
		transform: scale(0.98);
	}

	.btn-icon {
		font-size: 16px;
		transition: transform 0.2s ease;
	}

	.continue-btn:hover .btn-icon {
		transform: translateX(4px);
	}

	/* Mobile: stack vertically */
	@media (max-width: 360px) {
		.draft-content {
			flex-direction: column;
		}

		.continue-btn {
			width: 100%;
		}
	}
</style>

<!--
RecentLibrarySection.svelte - Display recent library sequences

Shows a horizontal carousel of recently saved sequences from the user's library.
Only used in Construct tab (the "load to extend" hub).
-->
<script lang="ts">
	import type { LibrarySequence } from "$lib/features/library/domain/models/LibrarySequence";
	import SequenceCard from "./SequenceCard.svelte";

	interface Props {
		/** Recent sequences from library */
		sequences: LibrarySequence[];
		/** Maximum sequences to show */
		maxVisible?: number;
		/** Called when user selects a sequence to load */
		onSelect: (sequence: LibrarySequence) => void;
	}

	const { sequences, maxVisible = 5, onSelect }: Props = $props();

	const visibleSequences = $derived(sequences.slice(0, maxVisible));

	function formatTimeAgo(date: Date): string {
		const now = Date.now();
		const diff = now - date.getTime();

		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (days > 0) return `${days}d ago`;
		if (hours > 0) return `${hours}h ago`;
		if (minutes > 0) return `${minutes}m ago`;
		return "just now";
	}

	function getThumbnail(seq: LibrarySequence): string | undefined {
		if (seq.thumbnails && seq.thumbnails.length > 0) {
			return seq.thumbnails[0];
		}
		return undefined;
	}
</script>

{#if visibleSequences.length > 0}
	<div class="recent-section">
		<div class="section-header">
			<h2 class="section-title">Recent sequences</h2>
			<span class="section-subtitle">From your library</span>
		</div>

		<div class="carousel-container">
			<div class="carousel">
				{#each visibleSequences as seq (seq.id)}
					<SequenceCard
						thumbnailUrl={getThumbnail(seq)}
						beatCount={seq.beats?.length ?? 0}
						timeAgo={formatTimeAgo(seq.updatedAt)}
						name={seq.word || seq.name}
						onclick={() => onSelect(seq)}
					/>
				{/each}
			</div>

			{#if sequences.length > maxVisible}
				<div class="more-indicator">
					<span class="more-text">+{sequences.length - maxVisible} more</span>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.recent-section {
		width: 100%;
		background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
		border-radius: 12px;
		padding: 16px;
	}

	.section-header {
		display: flex;
		align-items: baseline;
		gap: 8px;
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

	.section-subtitle {
		font-size: 11px;
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.3));
	}

	.carousel-container {
		position: relative;
	}

	.carousel {
		display: flex;
		gap: 12px;
		overflow-x: auto;
		padding-bottom: 4px;
		scrollbar-width: thin;
		scrollbar-color: var(--theme-stroke, rgba(255, 255, 255, 0.1)) transparent;
	}

	.carousel::-webkit-scrollbar {
		height: 4px;
	}

	.carousel::-webkit-scrollbar-track {
		background: transparent;
	}

	.carousel::-webkit-scrollbar-thumb {
		background: var(--theme-stroke, rgba(255, 255, 255, 0.1));
		border-radius: 2px;
	}

	.more-indicator {
		position: absolute;
		right: 0;
		top: 50%;
		transform: translateY(-50%);
		background: linear-gradient(to right, transparent, var(--theme-card-bg, rgba(30, 30, 30, 0.95)) 50%);
		padding: 8px 0 8px 24px;
		pointer-events: none;
	}

	.more-text {
		font-size: var(--font-size-compact, 12px);
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
		font-weight: 500;
	}
</style>

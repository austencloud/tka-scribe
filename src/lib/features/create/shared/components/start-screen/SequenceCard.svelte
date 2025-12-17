<!--
SequenceCard.svelte - Thumbnail card for drafts and library sequences

Displays a sequence preview with thumbnail, beat count, and timestamp.
Used in both DraftSection and RecentLibrarySection.
-->
<script lang="ts">
	interface Props {
		/** Thumbnail image URL or base64 data URL */
		thumbnailUrl?: string;
		/** Number of beats in the sequence */
		beatCount: number;
		/** Display timestamp (e.g., "2h ago") */
		timeAgo: string;
		/** Optional sequence name/word */
		name?: string;
		/** Click handler */
		onclick: () => void;
		/** Optional delete handler (shows delete button if provided) */
		ondelete?: () => void;
	}

	const { thumbnailUrl, beatCount, timeAgo, name, onclick, ondelete }: Props = $props();

	let showDeleteConfirm = $state(false);

	function handleDelete(e: MouseEvent) {
		e.stopPropagation();
		if (showDeleteConfirm) {
			ondelete?.();
			showDeleteConfirm = false;
		} else {
			showDeleteConfirm = true;
			// Auto-hide after 3 seconds
			setTimeout(() => {
				showDeleteConfirm = false;
			}, 3000);
		}
	}
</script>

<button class="sequence-card" type="button" {onclick}>
	<div class="thumbnail">
		{#if thumbnailUrl}
			<img src={thumbnailUrl} alt="Sequence preview" />
		{:else}
			<div class="placeholder">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<rect x="3" y="3" width="18" height="18" rx="2" />
					<path d="M3 9h18M9 21V9" />
				</svg>
			</div>
		{/if}
	</div>

	<div class="info">
		{#if name}
			<span class="name">{name}</span>
		{/if}
		<span class="meta">{beatCount} beat{beatCount !== 1 ? "s" : ""}</span>
		<span class="time">{timeAgo}</span>
	</div>

	{#if ondelete}
		<button
			class="delete-btn"
			class:confirm={showDeleteConfirm}
			type="button"
			onclick={handleDelete}
			title={showDeleteConfirm ? "Click again to delete" : "Delete draft"}
		>
			{#if showDeleteConfirm}
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="20,6 9,17 4,12" />
				</svg>
			{:else}
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M18 6L6 18M6 6l12 12" />
				</svg>
			{/if}
		</button>
	{/if}
</button>

<style>
	.sequence-card {
		display: flex;
		flex-direction: column;
		width: 100px;
		background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
		border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
		border-radius: 10px;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
		padding: 0;
	}

	.sequence-card:hover {
		background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.06));
		border-color: var(--theme-stroke-hover, rgba(255, 255, 255, 0.15));
		transform: translateY(-2px);
	}

	.sequence-card:active {
		transform: translateY(0);
	}

	.thumbnail {
		width: 100%;
		aspect-ratio: 1;
		background: var(--theme-surface, rgba(0, 0, 0, 0.2));
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.placeholder {
		width: 40%;
		height: 40%;
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.3));
	}

	.placeholder svg {
		width: 100%;
		height: 100%;
	}

	.info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 8px;
		text-align: left;
	}

	.name {
		font-size: var(--font-size-compact, 12px);
		font-weight: 600;
		color: var(--theme-text, rgba(255, 255, 255, 0.9));
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.meta {
		font-size: var(--font-size-compact, 12px);
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
	}

	.time {
		font-size: 11px;
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
	}

	.delete-btn {
		position: absolute;
		top: 4px;
		right: 4px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.6);
		border: none;
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: all 0.2s ease;
		padding: 0;
	}

	.sequence-card:hover .delete-btn {
		opacity: 1;
	}

	.delete-btn:hover {
		background: rgba(239, 68, 68, 0.8);
		color: white;
	}

	.delete-btn.confirm {
		opacity: 1;
		background: rgba(239, 68, 68, 0.9);
		color: white;
	}

	.delete-btn svg {
		width: 14px;
		height: 14px;
	}
</style>

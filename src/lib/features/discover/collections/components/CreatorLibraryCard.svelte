<!--
CreatorLibraryCard - Shows a creator's profile with their content preview

Displays:
- Creator avatar, name, stats
- Tabbed content: Sequences | Collections | Compositions (coming soon)
- Sequence thumbnails inline
- "View Profile" link to full profile
-->
<script lang="ts">
	import type { CreatorLibraryData, CreatorContentTab } from "../state/collections-browse-state.svelte";

	const {
		data,
		isExpanded = false,
		activeTab = "sequences",
		onExpand,
		onCollapse,
		onTabChange,
		onViewProfile,
		onSequenceClick,
	} = $props<{
		data: CreatorLibraryData;
		isExpanded?: boolean;
		activeTab?: CreatorContentTab;
		onExpand?: () => void;
		onCollapse?: () => void;
		onTabChange?: (tab: CreatorContentTab) => void;
		onViewProfile?: () => void;
		onSequenceClick?: (sequenceId: string) => void;
	}>();

	const { profile, publicCollections, previewSequences, publicSequenceCount } = $derived(data);

	// Content counts
	const sequenceCount = $derived(publicSequenceCount);
	const collectionCount = $derived(publicCollections.length);
	const compositionCount = $derived(0); // Coming soon

	// Has any content to show
	const hasContent = $derived(sequenceCount > 0 || collectionCount > 0);

	function handleCardClick() {
		if (!isExpanded && onExpand) {
			onExpand();
		}
	}

	function handleTabClick(tab: CreatorContentTab, e: MouseEvent) {
		e.stopPropagation();
		onTabChange?.(tab);
	}
</script>

<div
	class="creator-library-card"
	class:expanded={isExpanded}
	class:has-content={hasContent}
	role="article"
	aria-label={`${profile.displayName}'s library`}
>
	<!-- Header: Avatar + Info + Actions -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="card-header"
		onclick={handleCardClick}
		role="button"
		tabindex="0"
		aria-expanded={isExpanded}
		onkeydown={(e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				handleCardClick();
			}
		}}
	>
		<!-- Avatar -->
		<div class="avatar">
			{#if profile.avatar}
				<img
					src={profile.avatar}
					alt={profile.displayName}
					crossorigin="anonymous"
					referrerpolicy="no-referrer"
					onerror={(e) => {
						const img = e.currentTarget as HTMLImageElement;
						img.style.display = "none";
						const fallback = img.nextElementSibling as HTMLElement;
						if (fallback) fallback.style.display = "flex";
					}}
				/>
				<div class="avatar-fallback" style="display: none;">
					<i class="fas fa-user"></i>
				</div>
			{:else}
				<div class="avatar-fallback">
					<i class="fas fa-user"></i>
				</div>
			{/if}
		</div>

		<!-- Creator Info -->
		<div class="creator-info">
			<h3 class="display-name">{profile.displayName}</h3>
			<p class="username">@{profile.username}</p>
			<div class="stats">
				<span class="stat" title="Sequences">
					<i class="fas fa-list"></i>
					{sequenceCount}
				</span>
				<span class="stat" title="Collections">
					<i class="fas fa-folder"></i>
					{collectionCount}
				</span>
				<span class="stat" title="Followers">
					<i class="fas fa-users"></i>
					{profile.followerCount}
				</span>
			</div>
		</div>

		<!-- View Profile Button -->
		<button
			type="button"
			class="view-profile-btn"
			onclick={(e) => {
				e.stopPropagation();
				onViewProfile?.();
			}}
			aria-label="View full profile"
		>
			<i class="fas fa-user-circle"></i>
			<span>Profile</span>
		</button>
	</div>

	<!-- Content Area (always visible, expands on click) -->
	{#if hasContent}
		<div class="content-area">
			<!-- Content Tabs -->
			<div class="content-tabs" role="tablist">
				<button
					type="button"
					role="tab"
					class="tab"
					class:active={activeTab === "sequences"}
					aria-selected={activeTab === "sequences"}
					onclick={(e) => handleTabClick("sequences", e)}
				>
					Sequences
					<span class="count">{sequenceCount}</span>
				</button>
				<button
					type="button"
					role="tab"
					class="tab"
					class:active={activeTab === "collections"}
					aria-selected={activeTab === "collections"}
					onclick={(e) => handleTabClick("collections", e)}
				>
					Collections
					<span class="count">{collectionCount}</span>
				</button>
				<button
					type="button"
					role="tab"
					class="tab disabled"
					disabled
					title="Coming soon"
				>
					Compositions
					<span class="count">0</span>
				</button>
			</div>

			<!-- Tab Content -->
			<div class="tab-content" role="tabpanel">
				{#if activeTab === "sequences"}
					{#if previewSequences.length > 0}
						<div class="sequence-grid">
							{#each previewSequences as sequence (sequence.id)}
								<button
									type="button"
									class="sequence-thumbnail"
									onclick={(e) => {
										e.stopPropagation();
										onSequenceClick?.(sequence.id);
									}}
									aria-label={sequence.name || sequence.word}
								>
									{#if sequence.thumbnails?.[0]}
										<img
											src={sequence.thumbnails[0]}
											alt={sequence.name || sequence.word}
										/>
									{:else}
										<div class="thumbnail-placeholder">
											<i class="fas fa-image"></i>
										</div>
									{/if}
									<span class="sequence-name">{sequence.word || sequence.name}</span>
								</button>
							{/each}
							{#if sequenceCount > previewSequences.length}
								<button
									type="button"
									class="see-all-btn"
									onclick={(e) => {
										e.stopPropagation();
										onViewProfile?.();
									}}
								>
									<span class="see-all-count">+{sequenceCount - previewSequences.length}</span>
									<span class="see-all-text">See all</span>
								</button>
							{/if}
						</div>
					{:else}
						<p class="empty-message">No public sequences yet</p>
					{/if}
				{:else if activeTab === "collections"}
					{#if publicCollections.length > 0}
						<div class="collection-list">
							{#each publicCollections as collection (collection.id)}
								<div class="collection-item">
									<i class={collection.icon || "fas fa-folder"} style="color: {collection.color || 'inherit'}"></i>
									<span class="collection-name">{collection.name}</span>
									<span class="collection-count">{collection.sequenceCount}</span>
								</div>
							{/each}
						</div>
					{:else}
						<p class="empty-message">No public collections</p>
					{/if}
				{/if}
			</div>
		</div>
	{:else}
		<div class="no-content">
			<p>No public content yet</p>
		</div>
	{/if}
</div>

<style>
	.creator-library-card {
		display: flex;
		flex-direction: column;
		background: var(--card-bg-current, rgba(255, 255, 255, 0.04));
		border: 1px solid var(--card-border-current, rgba(255, 255, 255, 0.08));
		border-radius: 16px;
		overflow: hidden;
		transition: all 0.2s ease;
	}

	.creator-library-card:hover {
		background: var(--card-hover-current, rgba(255, 255, 255, 0.06));
		border-color: rgba(255, 255, 255, 0.12);
	}

	.creator-library-card.has-content {
		cursor: default;
	}

	/* Header */
	.card-header {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px;
		background: transparent;
		border: none;
		width: 100%;
		text-align: left;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.card-header:hover {
		background: rgba(255, 255, 255, 0.02);
	}

	/* Avatar */
	.avatar {
		width: 56px;
		height: 56px;
		flex-shrink: 0;
	}

	.avatar img,
	.avatar-fallback {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		object-fit: cover;
	}

	.avatar-fallback {
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.1);
		border: 2px solid rgba(255, 255, 255, 0.2);
	}

	.avatar-fallback i {
		font-size: 24px;
		color: rgba(255, 255, 255, 0.4);
	}

	/* Creator info */
	.creator-info {
		flex: 1;
		min-width: 0;
	}

	.display-name {
		margin: 0;
		font-size: 16px;
		font-weight: 600;
		color: var(--text-primary-current, rgba(255, 255, 255, 0.95));
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.username {
		margin: 2px 0 0 0;
		font-size: 13px;
		color: var(--text-secondary-current, rgba(255, 255, 255, 0.6));
	}

	.stats {
		display: flex;
		gap: 12px;
		margin-top: 6px;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 12px;
		color: var(--text-secondary-current, rgba(255, 255, 255, 0.5));
	}

	.stat i {
		font-size: 10px;
	}

	/* View profile button */
	.view-profile-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 8px;
		color: var(--text-secondary-current, rgba(255, 255, 255, 0.7));
		font-size: 12px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.view-profile-btn:hover {
		background: rgba(255, 255, 255, 0.12);
		color: var(--text-primary-current, white);
	}

	.view-profile-btn span {
		display: none;
	}

	/* Content area */
	.content-area {
		border-top: 1px solid rgba(255, 255, 255, 0.06);
	}

	/* Content tabs */
	.content-tabs {
		display: flex;
		gap: 4px;
		padding: 8px 16px;
		background: rgba(0, 0, 0, 0.1);
	}

	.tab {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		background: transparent;
		border: none;
		border-radius: 6px;
		color: var(--text-secondary-current, rgba(255, 255, 255, 0.6));
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.tab:hover:not(.disabled) {
		background: rgba(255, 255, 255, 0.06);
		color: var(--text-primary-current, white);
	}

	.tab.active {
		background: rgba(255, 255, 255, 0.1);
		color: var(--text-primary-current, white);
	}

	.tab.disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.tab .count {
		padding: 2px 6px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 10px;
		font-size: 10px;
	}

	/* Tab content */
	.tab-content {
		padding: 12px 16px 16px;
	}

	/* Sequence grid */
	.sequence-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
		gap: 8px;
	}

	.sequence-thumbnail {
		position: relative;
		aspect-ratio: 1;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.sequence-thumbnail:hover {
		border-color: rgba(255, 255, 255, 0.2);
		transform: scale(1.02);
	}

	.sequence-thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.thumbnail-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: rgba(255, 255, 255, 0.3);
	}

	.sequence-name {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 4px 6px;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
		font-size: 10px;
		color: white;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* See all button */
	.see-all-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		aspect-ratio: 1;
		background: rgba(168, 85, 247, 0.15);
		border: 1px dashed rgba(168, 85, 247, 0.4);
		border-radius: 8px;
		color: #a855f7;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.see-all-btn:hover {
		background: rgba(168, 85, 247, 0.25);
		border-color: rgba(168, 85, 247, 0.6);
	}

	.see-all-count {
		font-size: 16px;
		font-weight: 600;
	}

	.see-all-text {
		font-size: 10px;
	}

	/* Collection list */
	.collection-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.collection-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		background: rgba(255, 255, 255, 0.04);
		border-radius: 8px;
	}

	.collection-item i {
		font-size: 14px;
	}

	.collection-name {
		flex: 1;
		font-size: 13px;
		color: var(--text-primary-current, white);
	}

	.collection-count {
		font-size: 12px;
		color: var(--text-secondary-current, rgba(255, 255, 255, 0.5));
	}

	/* Empty/no content states */
	.empty-message,
	.no-content {
		text-align: center;
		padding: 20px;
		color: var(--text-secondary-current, rgba(255, 255, 255, 0.4));
		font-size: 13px;
	}

	.no-content {
		border-top: 1px solid rgba(255, 255, 255, 0.06);
	}

	/* Responsive */
	@media (min-width: 640px) {
		.view-profile-btn span {
			display: inline;
		}

		.sequence-grid {
			grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		}
	}
</style>

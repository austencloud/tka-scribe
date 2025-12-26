<!--
  MediaSearchBar.svelte - Search input with favorites toggle
-->
<script lang="ts">
	interface Props {
		searchQuery: string;
		isFavoritesActive: boolean;
		onSearchChange: (query: string) => void;
		onFavoritesToggle: (active: boolean) => void;
	}

	let { searchQuery, isFavoritesActive, onSearchChange, onFavoritesToggle }: Props = $props();
</script>

<div class="search-bar">
	<i class="fas fa-search"></i>
	<input
		type="text"
		placeholder="Search..."
		value={searchQuery}
		oninput={(e) => onSearchChange(e.currentTarget.value)}
	/>
	<button
		class="favorites-btn"
		class:active={isFavoritesActive}
		onclick={() => onFavoritesToggle(!isFavoritesActive)}
		title="Favorites"
		aria-label="Toggle favorites filter"
	>
		<i class="fas fa-heart"></i>
	</button>
	{#if searchQuery}
		<button class="clear-btn" onclick={() => onSearchChange('')} aria-label="Clear search">
			<i class="fas fa-times"></i>
		</button>
	{/if}
</div>

<style>
	.search-bar {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 14px;
		background: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.5));
		border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
		flex-shrink: 0;
	}

	.search-bar i {
		font-size: 13px;
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
	}

	.search-bar input {
		flex: 1;
		background: transparent;
		border: none;
		color: var(--theme-text, rgba(255, 255, 255, 0.92));
		font-size: var(--font-size-min, 14px);
		outline: none;
		min-width: 0;
	}

	.search-bar input::placeholder {
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
	}

	.favorites-btn {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
		background: var(--theme-card-hover-bg, rgba(0, 0, 0, 0.55));
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		transition: all 0.2s ease;
		margin-left: auto;
	}

	.favorites-btn:hover {
		background: var(--theme-card-hover-bg, rgba(0, 0, 0, 0.65));
		border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.14));
		color: #ec4899;
		transform: scale(1.1);
	}

	.favorites-btn.active {
		background: linear-gradient(135deg, rgba(244, 114, 182, 0.25) 0%, rgba(236, 72, 153, 0.2) 100%);
		border-color: #ec4899;
		color: #ec4899;
		box-shadow: 0 0 12px rgba(236, 72, 153, 0.3);
	}

	.favorites-btn.active:hover {
		background: linear-gradient(135deg, rgba(244, 114, 182, 0.35) 0%, rgba(236, 72, 153, 0.3) 100%);
		transform: scale(1.1);
	}

	.clear-btn {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
		background: var(--theme-card-hover-bg, rgba(0, 0, 0, 0.55));
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 9px;
		transition: all 0.2s ease;
	}

	.clear-btn:hover {
		background: var(--theme-accent, #4a9eff);
		border-color: var(--theme-accent, #4a9eff);
		color: white;
		box-shadow: 0 0 8px color-mix(in srgb, var(--theme-accent, #4a9eff) 40%, transparent);
	}
</style>

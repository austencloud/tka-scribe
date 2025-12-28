<!--
  MediaSortRow.svelte - Sort options and advanced filter toggle
-->
<script lang="ts">
	import { ExploreSortMethod } from '$lib/features/discover/shared/domain/enums/discover-enums';

	interface Props {
		currentSortMethod: ExploreSortMethod;
		sortDirection: 'asc' | 'desc';
		showFilters: boolean;
		onSortChange: (method: ExploreSortMethod) => void;
		onToggleFilters: () => void;
	}

	let { currentSortMethod, sortDirection, showFilters, onSortChange, onToggleFilters }: Props = $props();

	const sortOptions = [
		{ id: ExploreSortMethod.ALPHABETICAL, label: 'A → Z', icon: 'fa-arrow-down-a-z' },
		{ id: ExploreSortMethod.SEQUENCE_LENGTH, label: 'Length', icon: 'fa-ruler' },
		{ id: ExploreSortMethod.DIFFICULTY_LEVEL, label: 'Difficulty', icon: 'fa-signal' },
		{ id: ExploreSortMethod.DATE_ADDED, label: 'Recent', icon: 'fa-clock' },
	];
</script>

<div class="sort-row">
	{#each sortOptions as option}
		{@const isActive = currentSortMethod === option.id}
		<button
			class="sort-chip"
			class:active={isActive}
			onclick={() => onSortChange(option.id)}
			title={option.label}
		>
			<i class="fas {option.icon}" aria-hidden="true"></i>
			{#if isActive}
				<i class="fas {sortDirection === 'asc' ? 'fa-arrow-up' : 'fa-arrow-down'} direction-icon" aria-hidden="true"></i>
			{/if}
		</button>
	{/each}

	<button
		class="advanced-toggle"
		class:active={showFilters}
		onclick={onToggleFilters}
		title="Advanced filters"
		aria-label="Toggle advanced filters"
	>
		<i class="fas fa-sliders-h" aria-hidden="true"></i>
	</button>
</div>

<style>
	.sort-row {
		display: flex;
		gap: 6px;
		padding: 8px 14px;
		background: var(--theme-card-bg, rgba(0, 0, 0, 0.45));
		border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
		flex-shrink: 0;
	}

	.sort-chip {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
		padding: 7px 10px;
		border-radius: 12px;
		border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
		background: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.5));
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.sort-chip:hover {
		background: var(--theme-card-hover-bg, rgba(0, 0, 0, 0.55));
		border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.14));
		color: var(--theme-text, white);
		transform: translateY(-1px);
	}

	.sort-chip.active {
		background: color-mix(in srgb, var(--theme-accent, #4a9eff) 20%, transparent);
		border-color: var(--theme-accent, #4a9eff);
		color: var(--theme-accent, #4a9eff);
		box-shadow: 0 0 12px color-mix(in srgb, var(--theme-accent, #4a9eff) 30%, transparent);
	}

	.direction-icon {
		font-size: 12px;
		margin-left: 2px;
	}

	.advanced-toggle {
		width: 48px; /* WCAG AAA touch target */
		height: 48px;
		border-radius: 12px;
		border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
		background: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.5));
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 13px;
		transition: all 0.2s ease;
	}

	.advanced-toggle:hover {
		background: var(--theme-card-hover-bg, rgba(0, 0, 0, 0.55));
		border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.14));
		color: var(--theme-text, white);
		transform: translateY(-1px);
	}

	.advanced-toggle.active {
		background: color-mix(in srgb, var(--theme-accent, #4a9eff) 20%, transparent);
		border-color: var(--theme-accent, #4a9eff);
		color: var(--theme-accent, #4a9eff);
		box-shadow: 0 0 12px color-mix(in srgb, var(--theme-accent, #4a9eff) 30%, transparent);
	}
</style>

<script lang="ts">
	/**
	 * AdminFilterGroup
	 * Filter button group with active states
	 */

	import type { FilterOption } from '../types/admin-component-types';

	interface AdminFilterGroupProps {
		options: FilterOption[];
		selected: string;
		onChange: (id: string) => void;
		variant?: 'pills' | 'tabs';
		class?: string;
	}

	let {
		options,
		selected,
		onChange,
		variant = 'pills',
		class: className = '',
	}: AdminFilterGroupProps = $props();
</script>

<div class="admin-filter-group variant-{variant} {className}">
	{#each options as option (option.id)}
		<button
			class="filter-btn"
			class:active={selected === option.id}
			onclick={() => onChange(option.id)}
		>
			{#if option.icon}
				<i class="fas {option.icon}"></i>
			{/if}
			<span>{option.label}</span>
			{#if option.count !== undefined}
				<span class="count">{option.count}</span>
			{/if}
		</button>
	{/each}
</div>

<style>
	.admin-filter-group {
		display: flex;
		gap: 6px;
		background: rgba(255, 255, 255, 0.05);
		padding: 4px;
		border-radius: 8px;
		overflow-x: auto;
		overflow-y: hidden;
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* IE/Edge */
		flex-shrink: 1;
		min-width: 0;
	}

	.admin-filter-group::-webkit-scrollbar {
		display: none; /* Chrome/Safari */
	}

	.filter-btn {
		padding: 8px 12px;
		border: none;
		background: transparent;
		color: rgba(255, 255, 255, 0.6);
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 13px;
		display: flex;
		align-items: center;
		gap: 6px;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.filter-btn:hover {
		color: rgba(255, 255, 255, 0.9);
		background: rgba(255, 255, 255, 0.05);
	}

	.filter-btn.active {
		background: rgba(255, 255, 255, 0.15);
		color: white;
	}

	.filter-btn span {
		display: inline;
	}

	.count {
		font-size: 12px;
		opacity: 0.7;
	}

	/* Tabs variant */
	.variant-tabs {
		background: none;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		padding: 0;
		border-radius: 0;
	}

	.variant-tabs .filter-btn {
		border-radius: 0;
		border-bottom: 2px solid transparent;
	}

	.variant-tabs .filter-btn.active {
		background: none;
		border-bottom-color: #3b82f6;
	}
</style>

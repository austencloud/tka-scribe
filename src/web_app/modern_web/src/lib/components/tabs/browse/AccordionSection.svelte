<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import CategoryButton from './CategoryButton.svelte';

	export let title: string;
	export let type: string;
	export let options: any[];
	export let isActive: boolean = false;
	export let isExpanded: boolean = false;

	const dispatch = createEventDispatcher();

	let contentElement: HTMLDivElement;

	// Handle header click to request expansion/collapse
	function toggleExpansion() {
		dispatch('expansionRequested', { type, title });
	}

	// Handle filter selection from category buttons
	function handleFilterSelection(event: CustomEvent) {
		const value = event.detail;
		dispatch('filterSelected', { type, value });
	}
</script>

<div class="accordion-section" class:expanded={isExpanded} class:active={isActive}>
	<!-- Accordion Header -->
	<button 
		class="accordion-header"
		class:expanded={isExpanded}
		on:click={toggleExpansion}
		type="button"
	>
		<div class="header-content">
			<span class="header-title">{title}</span>
			{#if isActive}
				<span class="active-indicator">●</span>
			{/if}
		</div>
		<div class="header-icon" class:rotated={isExpanded}>
			<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
				<path 
					d="M5 7.5L10 12.5L15 7.5" 
					stroke="currentColor" 
					stroke-width="2" 
					stroke-linecap="round" 
					stroke-linejoin="round"
				/>
			</svg>
		</div>
	</button>

	<!-- Accordion Content -->
	{#if isExpanded}
		<div 
			class="accordion-content"
			bind:this={contentElement}
			transition:slide={{ duration: 300, easing: cubicInOut }}
		>
			<div class="content-inner">
				{#if type === 'starting_position' || type === 'difficulty' || type === 'grid_mode'}
					<!-- Image-based content for visual filters -->
					<div class="options-grid visual-grid">
						{#each options as option}
							<CategoryButton 
								{option}
								visualType={type}
								on:selected={handleFilterSelection}
							/>
						{/each}
					</div>
				{:else}
					<!-- Standard button grid for other filters -->
					<div class="options-grid standard-grid">
						{#each options as option}
							<CategoryButton 
								{option}
								on:selected={handleFilterSelection}
							/>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.accordion-section {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		margin: 4px;
		padding: 0px;
		overflow: hidden;
		transition: all var(--transition-normal);
	}

	.accordion-section:hover {
		background: rgba(255, 255, 255, 0.15);
		border: 1px solid rgba(255, 255, 255, 0.3);
	}

	.accordion-section.expanded {
		background: rgba(255, 255, 255, 0.15);
		border: 1px solid rgba(255, 255, 255, 0.3);
	}

	.accordion-section.active {
		border-color: var(--accent-color);
		background: rgba(6, 182, 212, 0.1);
	}

	/* Accordion Header */
	.accordion-header {
		width: 100%;
		padding: 12px 16px;
		background: transparent;
		border: none;
		cursor: pointer;
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: all var(--transition-fast);
		color: rgba(255, 255, 255, 0.9);
		font-family: inherit;
		border-radius: 12px;
	}

	.accordion-header:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.accordion-header.expanded {
		background: rgba(255, 255, 255, 0.05);
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.header-title {
		font-size: 11pt;
		font-weight: 500;
		margin: 0;
		color: rgba(255, 255, 255, 0.9);
	}

	.active-indicator {
		color: var(--accent-color);
		font-size: var(--font-size-sm);
		animation: pulse 2s ease-in-out infinite;
	}

	.header-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform var(--transition-normal);
		color: var(--muted-foreground);
	}

	.header-icon.rotated {
		transform: rotate(180deg);
		color: var(--primary-color);
	}

	/* Accordion Content */
	.accordion-content {
		overflow: hidden;
	}

	.content-inner {
		padding: var(--spacing-lg);
		padding-top: var(--spacing-md);
	}

	/* Options Grid */
	.options-grid {
		display: grid;
		gap: var(--spacing-sm);
	}

	.standard-grid {
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
	}

	.visual-grid {
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
	}

	/* Animations */
	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.accordion-header {
			padding: var(--spacing-md);
		}

		.content-inner {
			padding: var(--spacing-md);
		}

		.standard-grid {
			grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		}

		.visual-grid {
			grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
		}

		.header-title {
			font-size: var(--font-size-base);
		}
	}
</style>

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		description?: string;
		variant?: 'default' | 'accent' | 'transparent';
		children: Snippet;
	}

	let { title, description, variant = 'default', children }: Props = $props();
</script>

<div class="setting-card" class:accent={variant === 'accent'} class:transparent={variant === 'transparent'}>
	{#if title || description}
		<div class="card-header">
			{#if title}
				<h4 class="card-title">{title}</h4>
			{/if}
			{#if description}
				<p class="card-description">{description}</p>
			{/if}
		</div>
	{/if}

	<div class="setting-card-body">
		{@render children()}
	</div>
</div>

<style>
	.setting-card {
		background: var(--settings-glass-bg);
		border: 1px solid var(--settings-glass-border);
		border-radius: var(--settings-radius-md);
		padding: var(--settings-space-lg);
		transition: all var(--settings-transition-base) var(--settings-ease-out);
	}

	.setting-card:hover {
		background: var(--settings-glass-bg-hover);
		border-color: var(--settings-glass-border-hover);
	}

	/* Accent variant (highlighted) */
	.setting-card.accent {
		border-color: var(--settings-glass-border-active);
		box-shadow: var(--settings-shadow-primary), inset 0 1px 0 rgba(99, 102, 241, 0.1);
	}

	/* Transparent variant (no background) */
	.setting-card.transparent {
		background: transparent;
		border: none;
		padding: 0;
	}

	.setting-card.transparent:hover {
		background: transparent;
	}

	/* Card header */
	.card-header {
		margin-bottom: var(--settings-space-md);
		padding-bottom: var(--settings-space-md);
		border-bottom: 1px solid var(--settings-glass-border);
	}

	.card-title {
		font-size: var(--settings-font-size-h3);
		font-weight: var(--settings-font-weight-semibold);
		color: var(--settings-text-primary);
		margin: 0 0 var(--settings-space-xs) 0;
		letter-spacing: var(--settings-letter-spacing-normal);
	}

	.card-description {
		font-size: var(--settings-font-size-caption);
		font-weight: var(--settings-font-weight-normal);
		color: var(--settings-text-secondary);
		margin: 0;
		line-height: 1.5;
	}

	/* Card content */
	.setting-card-body {
		display: flex;
		flex-direction: column;
		gap: var(--settings-space-md);
	}

	/* Mobile adjustments */
	@media (max-width: 768px) {
		.setting-card {
			padding: var(--settings-space-md);
		}

		.card-header {
			margin-bottom: var(--settings-space-sm);
			padding-bottom: var(--settings-space-sm);
		}

		.card-title {
			font-size: var(--settings-font-size-body);
		}
	}
</style>

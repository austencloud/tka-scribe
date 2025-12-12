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
		background: var(--theme-card-bg);
		border: 1px solid var(--theme-stroke);
		border-radius: 12px;
		padding: 24px;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.setting-card:hover {
		background: var(--theme-card-hover-bg);
		border-color: var(--theme-stroke-strong);
	}

	/* Accent variant (highlighted) */
	.setting-card.accent {
		border-color: color-mix(in srgb, var(--theme-accent) 50%, transparent);
		box-shadow: 0 8px 32px color-mix(in srgb, var(--theme-accent) 30%, transparent),
			inset 0 1px 0 color-mix(in srgb, var(--theme-accent) 10%, transparent);
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
		margin-bottom: 16px;
		padding-bottom: 16px;
		border-bottom: 1px solid var(--theme-stroke);
	}

	.card-title {
		font-size: 18px;
		font-weight: 600;
		color: var(--theme-text);
		margin: 0 0 4px 0;
		letter-spacing: -0.3px;
	}

	.card-description {
		font-size: 13px;
		font-weight: 400;
		color: var(--theme-text-dim);
		margin: 0;
		line-height: 1.5;
	}

	/* Card content */
	.setting-card-body {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	/* Mobile adjustments */
	@media (max-width: 768px) {
		.setting-card {
			padding: 16px;
		}

		.card-header {
			margin-bottom: 8px;
			padding-bottom: 8px;
		}

		.card-title {
			font-size: 15px;
		}
	}
</style>

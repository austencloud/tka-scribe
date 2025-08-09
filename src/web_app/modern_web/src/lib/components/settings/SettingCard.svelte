<!-- SettingCard.svelte - Improved contrast card container -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		description?: string;
		children: Snippet;
	}

	let { title, description, children }: Props = $props();
</script>

<div class="setting-section">
	{#if title}
		<h3 class="section-title">{title}</h3>
	{/if}
	{#if description}
		<p class="section-description">{description}</p>
	{/if}

	<div class="setting-cards">
		{@render children()}
	</div>
</div>

<style>
	.setting-section {
		margin-bottom: var(--spacing-lg);
	}

	.section-title {
		margin: 0 0 var(--spacing-sm) 0;
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: #ffffff;
	}

	.section-description {
		margin: 0 0 var(--spacing-md) 0;
		color: rgba(255, 255, 255, 0.7);
		font-size: var(--font-size-sm);
		line-height: 1.4;
	}

	.setting-cards {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}
</style>

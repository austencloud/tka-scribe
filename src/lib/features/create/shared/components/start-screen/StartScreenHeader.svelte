<!--
StartScreenHeader.svelte - Icon, title, and description for start screen

Displays the tab identity section with customizable icon, title, and description.
-->
<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		/** Custom icon snippet (SVG content) */
		icon: Snippet;
		/** Main title text */
		title: string;
		/** Description text */
		description: string;
		/** Accent color for icon (defaults to theme accent) */
		accentColor?: string;
	}

	const { icon, title, description, accentColor }: Props = $props();
</script>

<div class="start-screen-header">
	<div class="icon-container" style:--accent-color={accentColor}>
		{@render icon()}
	</div>

	<h1 class="title">{title}</h1>

	<p class="description">{description}</p>
</div>

<style>
	.start-screen-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 12px;
	}

	.icon-container {
		width: 64px;
		height: 64px;
		color: var(--accent-color, var(--theme-accent-strong, #8b5cf6));
		margin-bottom: 4px;
	}

	.icon-container :global(svg) {
		width: 100%;
		height: 100%;
	}

	.title {
		font-size: 24px;
		font-weight: 700;
		color: var(--theme-text, rgba(255, 255, 255, 0.95));
		margin: 0;
		letter-spacing: -0.02em;
	}

	.description {
		font-size: var(--font-size-min, 14px);
		line-height: 1.5;
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
		margin: 0;
		max-width: 320px;
	}

	/* Mobile */
	@media (max-width: 480px) {
		.icon-container {
			width: 56px;
			height: 56px;
		}

		.title {
			font-size: 22px;
		}
	}
</style>

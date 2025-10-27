<script lang="ts">
	import { fade } from 'svelte/transition';
	import { formatStyledHeader } from '../utils/headerUtils'; // Import the utility

	export let groupKey: string; // The key for this header (e.g., "Type1")
	export let isFirstHeader: boolean = false; // To adjust top margin
</script>

<div
	class="section-header-container"
	class:first={isFirstHeader}
	transition:fade={{ duration: 150 }}
>
	<span class="section-header">
		{@html formatStyledHeader(groupKey)}
	</span>
</div>

<style>
	.section-header-container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		padding: 0;
		/* margin-top: 16px; */
		/* margin-bottom: 10px; */
		position: sticky;
		/* top: -8px;  */
		/* z-index: 5; */
		/* pointer-events: none; */
	}
	.section-header-container.first {
		margin-top: 4px; /* Less top margin for the very first header */
	}

	.section-header {
		display: inline-block;
		background-color: rgba(255, 255, 255, 0.9);
		color: #1e293b;
		padding: 6px 18px;
		border-radius: 9999px;
		font-size: 0.9rem;
		font-weight: 500; /* Base weight */
		text-align: center;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		pointer-events: auto;
		border: 1px solid rgba(0, 0, 0, 0.1);
		white-space: nowrap;
	}
	/* Removed unused CSS selectors */
</style>

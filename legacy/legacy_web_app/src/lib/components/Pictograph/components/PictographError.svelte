<script lang="ts">
	import { fade } from 'svelte/transition';
	
	export let errorMessage: string | null = null;
	export let animationDuration = 300;
</script>

<g transition:fade={{ duration: animationDuration }}>
	<circle cx="475" cy="450" r="40" fill="#fed7d7" />
	<text
		x="475"
		y="450"
		dominant-baseline="middle"
		text-anchor="middle"
		font-size="40"
		fill="#e53e3e"
	>
		!
	</text>
	<text
		x="475"
		y="520"
		dominant-baseline="middle"
		text-anchor="middle"
		font-size="18"
		fill="#e53e3e"
	>
		Error
	</text>
	<text
		x="475"
		y="550"
		dominant-baseline="middle"
		text-anchor="middle"
		font-size="14"
		fill="#718096"
	>
		{errorMessage || 'Unknown error'}
	</text>
</g>
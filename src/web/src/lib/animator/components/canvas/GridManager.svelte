<script lang="ts">
	import { SVGGenerator } from '../../utils/canvas/SVGGenerator.js';
	import { svgStringToImage } from '../../svgStringToImage.js';

	// Modern Svelte 5 props
	let {
		width = 500,
		height = 500,
		onGridImageLoad
	}: {
		width?: number;
		height?: number;
		onGridImageLoad: (image: HTMLImageElement) => void;
	} = $props();

	let gridImage: HTMLImageElement | null = null;
	let isLoading = $state(false);

	// Load grid image when component mounts or size changes
	$effect(() => {
		loadGridImage();
	});

	async function loadGridImage(): Promise<void> {
		if (isLoading) return;
		
		isLoading = true;
		
		try {
			const svgString = SVGGenerator.generateGridSvg(width, height);
			gridImage = await svgStringToImage(svgString, width, height);
			
			// Notify parent component
			onGridImageLoad(gridImage);
		} catch (error) {
			console.error('Failed to load grid image:', error);
		} finally {
			isLoading = false;
		}
	}
</script>

<!-- GridManager is invisible - it just manages grid image loading -->
<div style="display: none;">
	{#if isLoading}
		Loading grid...
	{/if}
</div>

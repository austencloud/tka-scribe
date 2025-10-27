<!-- src/lib/components/objects/Glyphs/TKAGlyph/components/LetterRenderer.svelte -->
<script lang="ts">
	import { onMount, createEventDispatcher, tick } from 'svelte';
	import { getLetterPath, assetCache, fetchSVGDimensions, type Rect } from '$lib/stores/glyphStore';
	import type { Letter } from '$lib/types/Letter';

	export let letter: Letter | null = null;

	const dispatch = createEventDispatcher<{
		letterLoaded: Rect;
	}>();

	// Local state with clean types
	let svgPath = '';
	let dimensions = { width: 0, height: 0 };
	let imageElement: SVGImageElement | null = null;
	let isLoaded = false;
	let isFetchFailed = false;

	// Clear reactive dependency on letter changes
	$: if (letter) {
		loadLetterSVG(letter);
	}

	// Load SVG with proper caching strategy
	async function loadLetterSVG(currentLetter: Letter) {
		if (!currentLetter) return;

		const path = getLetterPath(currentLetter);
		svgPath = path;

		// Check cache first
		const cacheKey = currentLetter.toString();
		let cachedSVG = $assetCache.letterSVGs.get(cacheKey);

		if (cachedSVG) {
			dimensions = cachedSVG.dimensions;
			isLoaded = true;
			return;
		}

		try {
			// Fetch dimensions if not in cache
			dimensions = await fetchSVGDimensions(path);

			// Update cache
			assetCache.update((cache) => {
				cache.letterSVGs.set(cacheKey, {
					svg: svgPath,
					dimensions
				});
				return cache;
			});

			isLoaded = true;
		} catch (error) {
			console.error(`Failed to load letter SVG for ${currentLetter}:`, error);
			isFetchFailed = true;
		}
	}

	// Handle image loaded with proper layout calculation
	async function handleImageLoad() {
		if (!imageElement) return;

		// Use Promise.all to ensure SVG is fully rendered
		await Promise.all([new Promise((resolve) => setTimeout(resolve, 50)), tick()]);

		try {
			const bbox = imageElement.getBBox();
			const rect: Rect = {
				left: bbox.x,
				top: bbox.y,
				width: bbox.width,
				height: bbox.height,
				right: bbox.x + bbox.width,
				bottom: bbox.y + bbox.height
			};

			dispatch('letterLoaded', rect);
		} catch (error) {
			console.error('Error calculating letter bounding box:', error);
		}
	}
</script>

<g class="tka-letter">
	{#if svgPath && isLoaded && dimensions.width > 0}
		<image
			bind:this={imageElement}
			href={svgPath}
			width={dimensions.width}
			height={dimensions.height}
			preserveAspectRatio="xMinYMin meet"
			on:load={handleImageLoad}
		/>
	{:else if isFetchFailed}
		<!-- Fallback for failed loads -->
		<rect width="50" height="50" fill="rgba(255,0,0,0.2)" stroke="red" stroke-width="1" />
		<text x="10" y="30" fill="red" font-size="12">Error</text>
	{:else}
		<!-- Loading placeholder -->
		<rect width="50" height="50" fill="rgba(200,200,200,0.3)" />
	{/if}
</g>

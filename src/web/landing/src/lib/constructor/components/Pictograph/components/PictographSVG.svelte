<!--
  PictographSVG Component
  
  This component provides the SVG element for the pictograph.
-->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { PictographData } from '$lib/constructor/types/PictographData.js';

	// Props
	export let pictographData: PictographData;
	export let debug = false;

	const dispatch = createEventDispatcher();

	function getPictographAriaLabel(pictographData: PictographData): string {
		if (!pictographData) return 'Pictograph';
		return `Pictograph for letter ${pictographData.letter || 'unknown'}`;
	}

	// Simple placeholder SVG content for now
	// This will be replaced with the actual pictograph rendering logic
	$: svgContent = generateSVGContent(pictographData);

	function generateSVGContent(data: PictographData): string {
		if (!data) return '';
		
		// For now, just show the letter as a simple text element
		// This will be replaced with the full pictograph rendering
		return `
			<text x="475" y="500" text-anchor="middle" font-size="100" fill="#333">
				${data.letter || '?'}
			</text>
			<circle cx="475" cy="475" r="400" fill="none" stroke="#ddd" stroke-width="2"/>
		`;
	}
</script>

<svg
	class="pictograph"
	class:debug
	viewBox="0 0 950 950"
	xmlns="http://www.w3.org/2000/svg"
	role="img"
	aria-label={getPictographAriaLabel(pictographData)}
>
	{@html svgContent}
</svg>

<style>
	.pictograph {
		width: 100%;
		height: 100%;
		max-width: 100%;
		max-height: 100%;
		display: block;
		background-color: white;
		transition: transform 0.1s ease-in-out;
		transform: scale(1);
		z-index: 1;
		position: relative;
		border: 1px solid #ccc;
		aspect-ratio: 1;
		margin: auto;
		overflow: visible;
		transform-origin: center center;
		box-sizing: border-box;
		border-radius: 8px;
	}

	.pictograph.debug {
		border-color: #ff6b6b;
		border-width: 2px;
	}
</style>

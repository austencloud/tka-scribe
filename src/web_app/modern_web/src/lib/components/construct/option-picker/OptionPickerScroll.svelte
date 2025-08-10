<!--
OptionPickerScroll.svelte - Main scrollable container

Matches the desktop version exactly:
- Vertical layout with individual sections first (Types 1, 2, 3)
- Horizontal group widget for grouped sections (Types 4, 5, 6)
- Transparent background and proper spacing
- Scrollable content area
-->
<script lang="ts">
	import type { PictographData } from '$lib/domain/PictographData';
	import { LetterType } from './types/LetterType.js';
	import OptionPickerSection from './OptionPickerSection.svelte';
	import OptionPickerGroupWidget from './OptionPickerGroupWidget.svelte';

	// Props
	const {
		pictographs = [],
		onPictographSelected = () => {},
		containerWidth = 800,
		containerHeight = 600,
	} = $props<{
		pictographs?: PictographData[];
		onPictographSelected?: (pictograph: PictographData) => void;
		containerWidth?: number;
		containerHeight?: number;
	}>();

	// Organize sections like desktop: individual sections first, then grouped
	const individualSections = [LetterType.TYPE1, LetterType.TYPE2, LetterType.TYPE3];
	const groupedSections = [LetterType.TYPE4, LetterType.TYPE5, LetterType.TYPE6];

	// Check if we have any pictographs for grouped sections
	const hasGroupedPictographs = $derived(() => {
		return pictographs.some(p => {
			const pictographType = LetterType.getLetterType(p.letter || '');
			return groupedSections.includes(pictographType);
		});
	});
</script>

<div 
	class="option-picker-scroll"
	style:height="{containerHeight}px"
>
	<div class="scroll-container">
		<div class="content-layout">
			<!-- Individual sections first (Types 1, 2, 3) -->
			{#each individualSections as letterType (letterType)}
				<OptionPickerSection
					{letterType}
					{pictographs}
					{onPictographSelected}
					{containerWidth}
				/>
			{/each}

			<!-- Grouped sections in horizontal layout (Types 4, 5, 6) -->
			{#if hasGroupedPictographs}
				<OptionPickerGroupWidget
					{pictographs}
					{onPictographSelected}
					{containerWidth}
				/>
			{/if}
		</div>
	</div>
</div>

<style>
	.option-picker-scroll {
		width: 100%;
		/* Transparent background like desktop */
		background: transparent;
		border: none;
		/* Enable scrolling */
		overflow-y: auto;
		overflow-x: hidden;
		/* Remove default margins */
		margin: 0;
		padding: 0;
	}

	.scroll-container {
		width: 100%;
		min-height: 100%;
		/* Transparent background */
		background: transparent;
		/* Expanding size policy like desktop */
		display: flex;
		flex-direction: column;
	}

	.content-layout {
		/* Vertical layout with no spacing initially */
		display: flex;
		flex-direction: column;
		gap: 0;
		/* No margins like desktop */
		margin: 0;
		padding: 0;
		/* Fill available space */
		flex: 1;
		/* Transparent background */
		background: transparent;
	}

	/* Scrollbar styling to match desktop (minimal/hidden) */
	.option-picker-scroll::-webkit-scrollbar {
		width: 8px;
	}

	.option-picker-scroll::-webkit-scrollbar-track {
		background: transparent;
	}

	.option-picker-scroll::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 4px;
	}

	.option-picker-scroll::-webkit-scrollbar-thumb:hover {
		background: rgba(0, 0, 0, 0.3);
	}

	/* Firefox scrollbar styling */
	.option-picker-scroll {
		scrollbar-width: thin;
		scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.option-picker-scroll::-webkit-scrollbar {
			width: 6px;
		}
	}

	@media (max-width: 480px) {
		.option-picker-scroll::-webkit-scrollbar {
			width: 4px;
		}
	}
</style>

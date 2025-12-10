<!--
GlyphOverlayLayer.svelte

Renders TKA glyphs and beat numbers with cross-fade transitions.
Hidden GlyphRenderer converts letters to SVG for texture loading.
-->

<script lang="ts">
	import { createComponentLogger } from "$lib/shared/utils/debug-logger";
	import GlyphRenderer from "../GlyphRenderer.svelte";
	import TKAGlyph from "$lib/shared/pictograph/tka-glyph/components/TKAGlyph.svelte";
	import BeatNumber from "$lib/shared/pictograph/shared/components/BeatNumber.svelte";
	import type { Letter } from "$lib/shared/foundation/domain/models/Letter";
	import type { StartPositionData } from "$lib/features/create/shared/domain/models/StartPositionData";
	import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
	import type { IPixiAnimationRenderer } from "$lib/features/compose/services/contracts/IPixiAnimationRenderer";
	import type { ITurnsTupleGeneratorService } from "$lib/shared/pictograph/arrow/positioning/placement/services/contracts/ITurnsTupleGeneratorService";

	const debug = createComponentLogger("GlyphOverlayLayer");

	// Props
	let {
		pixiRenderer = null,
		turnsTupleGenerator = null,
		letter = null,
		beatData = null,
		beatNumber = 0,
		tkaGlyphVisible = true,
		beatNumbersVisible = true,
		onGlyphTextureReady = () => {},
	}: {
		pixiRenderer: IPixiAnimationRenderer | null;
		turnsTupleGenerator: ITurnsTupleGeneratorService | null;
		letter: Letter | null;
		beatData: StartPositionData | BeatData | null;
		beatNumber: number;
		tkaGlyphVisible: boolean;
		beatNumbersVisible: boolean;
		onGlyphTextureReady?: (svg: string, width: number, height: number) => void;
	} = $props();

	// Glyph cross-fade transition state
	let fadingOutLetter = $state<Letter | null>(null);
	let fadingOutTurnsTuple = $state<string | null>(null);
	let fadingOutBeatNumber = $state<number | null>(null);
	let displayedLetter = $state<Letter | null>(null);
	let displayedTurnsTuple = $state("(s, 0, 0)");
	let displayedBeatNumber = $state<number | null>(null);
	let isNewLetter = $state(false);
	const GLYPH_TRANSITION_DURATION_MS = 200;

	// Calculate turns tuple from beat data
	const turnsTuple = $derived.by(() => {
		if (!beatData || !beatData.motions?.blue || !beatData.motions?.red) {
			return "(s, 0, 0)";
		}
		return turnsTupleGenerator?.generateTurnsTuple(beatData) ?? "(s, 0, 0)";
	});

	// Watch for letter OR turns OR beat number changes and trigger cross-fade transition
	$effect(() => {
		const hasLetterChanged = letter !== displayedLetter;
		const hasTurnsChanged = turnsTuple !== displayedTurnsTuple;
		const hasBeatChanged = beatNumber !== displayedBeatNumber;

		if (hasLetterChanged || hasTurnsChanged || hasBeatChanged) {
			// Start fading out old letter (if exists)
			if (displayedLetter !== null || displayedBeatNumber !== null) {
				fadingOutLetter = displayedLetter;
				fadingOutTurnsTuple = displayedTurnsTuple; // Use the PREVIOUS turns, not current
				fadingOutBeatNumber = displayedBeatNumber; // Use the PREVIOUS beat number, not current
				isNewLetter = true;

				// Remove fading-out letter after transition completes
				setTimeout(() => {
					fadingOutLetter = null;
					fadingOutTurnsTuple = null;
					fadingOutBeatNumber = null;
				}, GLYPH_TRANSITION_DURATION_MS);

				// Reset isNewLetter flag after transition
				setTimeout(() => {
					isNewLetter = false;
				}, GLYPH_TRANSITION_DURATION_MS);
			}

			// Update displayed letter, turns, and beat number
			displayedLetter = letter;
			displayedTurnsTuple = turnsTuple;
			displayedBeatNumber = beatNumber;
		}
	});

	// Callback from GlyphRenderer when SVG is ready
	function handleGlyphSvgReady(
		svgString: string,
		width: number,
		height: number
	) {
		loadGlyphTexture(svgString, width, height);
	}

	async function loadGlyphTexture(
		svgString: string,
		width: number,
		height: number
	) {
		// Guard: must be initialized before loading textures
		if (!pixiRenderer) {
			debug.log("Renderer not ready, deferring glyph texture load");
			return;
		}
		try {
			debug.log("Loading glyph texture, SVG length:", svgString.length);
			await pixiRenderer.loadGlyphTexture(svgString, width, height);
			onGlyphTextureReady?.(svgString, width, height);
		} catch (err) {
			console.error("[GlyphOverlayLayer] Failed to load glyph texture:", err);
		}
	}
</script>

<!-- Hidden GlyphRenderer that converts TKAGlyph to SVG for PixiJS rendering -->
{#if letter}
	<GlyphRenderer
		{letter}
		{beatData}
		onSvgReady={handleGlyphSvgReady}
	/>
{/if}

<!-- DOM overlay glyph (visible on top of canvas) -->
<div class="glyph-overlay">
	<!-- Fading out glyph (previous letter + beat number) -->
	{#if fadingOutLetter || fadingOutBeatNumber !== null}
		<div class="glyph-wrapper fade-out">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 950 950"
				class="glyph-svg"
			>
				{#if fadingOutLetter && tkaGlyphVisible}
					<TKAGlyph
						letter={fadingOutLetter}
						turnsTuple={fadingOutTurnsTuple ?? "(s, 0, 0)"}
						pictographData={null}
						x={50}
						y={800}
						scale={1}
						visible={true}
					/>
				{/if}
				{#if beatNumbersVisible}
					<BeatNumber beatNumber={fadingOutBeatNumber} />
				{/if}
			</svg>
		</div>
	{/if}

	<!-- Current glyph (fades in when letter/beat changes) -->
	{#if letter || displayedBeatNumber !== null}
		<div class="glyph-wrapper" class:fade-in={isNewLetter}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 950 950"
				class="glyph-svg"
			>
				{#if letter && tkaGlyphVisible}
					<TKAGlyph
						{letter}
						turnsTuple={displayedTurnsTuple}
						pictographData={null}
						x={50}
						y={800}
						scale={1}
						visible={true}
					/>
				{/if}
				{#if beatNumbersVisible}
					<BeatNumber beatNumber={displayedBeatNumber} />
				{/if}
			</svg>
		</div>
	{/if}
</div>

<style>
	.glyph-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 15;
	}

	/* Glyph wrapper divs for cross-fade transitions */
	.glyph-wrapper {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 1;
	}

	/* Override TKAGlyph's internal opacity transitions - we control fade at wrapper level */
	.glyph-wrapper :global(.tka-glyph) {
		opacity: 1 !important;
		transition: none !important;
	}

	.glyph-wrapper.fade-out {
		animation: glyphFadeOut 200ms ease-out forwards;
	}

	.glyph-wrapper.fade-in {
		animation: glyphFadeIn 200ms ease-in forwards;
	}

	@keyframes glyphFadeOut {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}

	@keyframes glyphFadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.glyph-svg {
		width: 100%;
		height: 100%;
	}
</style>

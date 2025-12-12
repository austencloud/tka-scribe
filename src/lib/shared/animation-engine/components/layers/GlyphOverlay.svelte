<!--
GlyphOverlay.svelte

Cross-fading glyph overlay for AnimatorCanvas.
Displays TKA glyph and beat number with fade transitions.
-->
<script lang="ts">
  import type { Letter } from "$lib/shared/foundation/domain/models/Letter";
  import TKAGlyph from "$lib/shared/pictograph/tka-glyph/components/TKAGlyph.svelte";
  import TurnsColumn from "$lib/shared/pictograph/tka-glyph/components/TurnsColumn.svelte";
  import BeatNumber from "$lib/shared/pictograph/shared/components/BeatNumber.svelte";

  let {
    // Current glyph state
    letter = null,
    displayedLetter = null,
    displayedTurnsTuple = "(s, 0, 0)",
    displayedBeatNumber = null,
    // Fading out state
    fadingOutLetter = null,
    fadingOutTurnsTuple = null,
    fadingOutBeatNumber = null,
    // Transition flag
    isNewLetter = false,
    // Visibility
    tkaGlyphVisible = true,
    beatNumbersVisible = true,
  }: {
    letter?: Letter | null;
    displayedLetter?: Letter | null;
    displayedTurnsTuple?: string;
    displayedBeatNumber?: number | null;
    fadingOutLetter?: Letter | null;
    fadingOutTurnsTuple?: string | null;
    fadingOutBeatNumber?: number | null;
    isNewLetter?: boolean;
    tkaGlyphVisible?: boolean;
    beatNumbersVisible?: boolean;
  } = $props();
</script>

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
            pictographData={null}
            x={50}
            y={800}
            scale={1}
            visible={true}
          />
          <TurnsColumn
            turnsTuple={fadingOutTurnsTuple ?? "(s, 0, 0)"}
            letter={fadingOutLetter}
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
            pictographData={null}
            x={50}
            y={800}
            scale={1}
            visible={true}
          />
          <TurnsColumn
            turnsTuple={displayedTurnsTuple}
            {letter}
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
    z-index: 5;
  }

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

  .glyph-wrapper :global(.turns-column) {
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
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes glyphFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .glyph-svg {
    width: 100%;
    height: 100%;
  }
</style>

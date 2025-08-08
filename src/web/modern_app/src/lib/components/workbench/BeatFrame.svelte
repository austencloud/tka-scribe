<script lang="ts">
  import type { BeatData } from '$lib/domain';
  import { beatFrameService } from '$lib/services/BeatFrameService.svelte';
  import BeatView from './BeatView.svelte';

  interface Props {
    beats: BeatData[];
    selectedBeatIndex?: number;
    onBeatClick?: (index: number) => void;
    onBeatDoubleClick?: (index: number) => void;
  }

  let {
    beats,
    selectedBeatIndex = -1,
    onBeatClick,
    onBeatDoubleClick
  }: Props = $props();

  const config = $derived(beatFrameService.config);
  const hoveredBeatIndex = $derived(beatFrameService.hoveredBeatIndex);
  const frameDimensions = $derived(beatFrameService.calculateFrameDimensions(beats.length));

  function handleBeatClick(index: number) {
    onBeatClick?.(index);
  }

  function handleBeatDoubleClick(index: number) {
    onBeatDoubleClick?.(index);
  }

  function handleBeatHover(index: number) {
    beatFrameService.setHoveredBeat(index);
  }

  function handleBeatLeave() {
    beatFrameService.clearHoveredBeat();
  }
</script>

<div 
  class="beat-frame"
  style:width="{frameDimensions.width}px"
  style:height="{frameDimensions.height}px"
>
  {#each beats as beat, index}
    {@const position = beatFrameService.calculateBeatPosition(index)}
    <div
      class="beat-container"
      style:left="{position.x}px"
      style:top="{position.y}px"
      style:width="{config.beatSize}px"
      style:height="{config.beatSize}px"
    >
      <BeatView
        {beat}
        {index}
        isSelected={index === selectedBeatIndex}
        isHovered={index === hoveredBeatIndex}
        onClick={handleBeatClick}
        onDoubleClick={handleBeatDoubleClick}
        onHover={handleBeatHover}
        onLeave={handleBeatLeave}
      />
    </div>
  {/each}
</div>

<style>
  .beat-frame {
    position: relative;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 12px;
    padding: 16px;
    margin: 16px 0;
    overflow: visible;
  }

  .beat-container {
    position: absolute;
    transition: all 0.2s ease;
  }

  /* Add subtle grid pattern */
  .beat-frame::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0);
    background-size: 20px 20px;
    pointer-events: none;
    border-radius: inherit;
  }
</style>

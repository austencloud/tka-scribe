<!-- Beat Analysis Grid Component -->
<script lang="ts">
  interface BeatData {
    letter?: string;
    sequence_start_position?: string;
    blueAttributes?: { motionType?: string };
    redAttributes?: { motionType?: string };
    [key: string]: any;
  }

  interface Props {
    beats: BeatData[];
    title?: string;
  }

  let { beats, title = "🎵 Beat Analysis" }: Props = $props();

  // Check if beat is start position
  function isStartPosition(beat: BeatData): boolean {
    return !!beat.sequence_start_position;
  }

  // Get filtered real beats (no start position entries)
  function getRealBeats(metadata: BeatData[]): BeatData[] {
    if (!Array.isArray(metadata)) return [];
    return metadata.filter(
      (beat) => beat.letter && !beat.sequence_start_position
    );
  }
</script>

{#if beats && Array.isArray(beats)}
  <div class="beat-analysis">
    <h3>{title}</h3>
    <div class="beats-container">
      {#each beats as beat, index}
        <div class="beat-item" class:start-position={isStartPosition(beat)}>
          {#if isStartPosition(beat)}
            <div class="beat-header start-pos">
              <span class="beat-type">Start Position</span>
              <span class="position-value">{beat.sequence_start_position}</span>
            </div>
          {:else}
            <div class="beat-header">
              <span class="beat-number">
                Beat {getRealBeats(beats).indexOf(beat) + 1}
              </span>
              <span class="beat-letter">{beat.letter}</span>
            </div>
            <div class="motion-info">
              <div class="motion-item blue">
                <span class="prop-label">🔵 Blue:</span>
                <span class="motion-type">
                  {beat.blueAttributes?.motionType || "Unknown"}
                </span>
              </div>
              <div class="motion-item red">
                <span class="prop-label">🔴 Red:</span>
                <span class="motion-type">
                  {beat.redAttributes?.motionType || "Unknown"}
                </span>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .beat-analysis {
    margin-bottom: 20px;
  }

  .beat-analysis h3 {
    margin: 0 0 15px 0;
    color: #22c55e;
    font-size: 1.1rem;
  }

  .beats-container {
    display: grid;
    gap: 8px;
  }

  .beat-item {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 12px;
  }

  .beat-item.start-position {
    background: rgba(168, 85, 247, 0.1);
    border-color: rgba(168, 85, 247, 0.3);
  }

  .beat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .beat-header.start-pos {
    margin-bottom: 0;
  }

  .beat-number {
    font-weight: 600;
    color: #60a5fa;
  }

  .beat-letter {
    font-weight: 600;
    color: #fbbf24;
    font-size: 1.1rem;
  }

  .beat-type {
    font-weight: 600;
    color: #a855f7;
  }

  .position-value {
    font-weight: 600;
    color: #c084fc;
  }

  .motion-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .motion-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .motion-item.blue {
    background: rgba(59, 130, 246, 0.1);
  }

  .motion-item.red {
    background: rgba(239, 68, 68, 0.1);
  }

  .prop-label {
    font-weight: 500;
  }

  .motion-type {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.8rem;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .motion-info {
      grid-template-columns: 1fr;
    }
  }
</style>

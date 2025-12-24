<script lang="ts">
  /**
   * Beat-Pair Analysis Display
   *
   * Shows detected beat-pair relationships and their groupings.
   * Used to visualize modular patterns and transformation groups.
   */
  import type { BeatPairRelationship } from "../../domain/models/beatpair-models";
  import type { BeatPairGroups } from "../../domain/models/label-models";
  import FontAwesomeIcon from "$lib/shared/foundation/ui/FontAwesomeIcon.svelte";

  interface Props {
    beatPairs: BeatPairRelationship[];
    beatPairGroups?: BeatPairGroups;
    collapsed?: boolean;
  }

  let { beatPairs, beatPairGroups, collapsed = false }: Props = $props();

  let isExpanded = $state(!collapsed);

  // Color coding for different transformation types
  const transformationColors: Record<string, string> = {
    FLIPPED: "#14b8a6",
    HORIZONTAL_FLIP: "#14b8a6",
    ROTATED_180: "#36c3ff",
    ROTATED_90: "#36c3ff",
    ROTATED_90_CCW: "#36c3ff",
    ROTATED_90_CW: "#36c3ff",
    SWAPPED: "#26e600",
    INVERTED: "#eb7d00",
    MIRRORED: "#a855f7",
    REPEATED: "#6b7280",
    UNKNOWN: "#ef4444",
  };

  function getColorForPattern(pattern: string): string {
    // Check each known transformation in the pattern
    for (const [key, color] of Object.entries(transformationColors)) {
      if (pattern.toUpperCase().includes(key)) {
        return color;
      }
    }
    return "#6b7280"; // default gray
  }

  const groupCount = $derived(Object.keys(beatPairGroups || {}).length);
  const isModular = $derived(groupCount > 1);
</script>

{#if beatPairs.length > 0}
  <div class="beat-pair-analysis">
    <button
      class="header"
      class:expanded={isExpanded}
      onclick={() => (isExpanded = !isExpanded)}
    >
      <div class="header-left">
        <FontAwesomeIcon
          icon={isExpanded ? "chevron-down" : "chevron-right"}
          size="0.8em"
        />
        <span class="title">Beat-Pair Analysis</span>
        {#if isModular}
          <span class="modular-badge">Modular ({groupCount} patterns)</span>
        {/if}
      </div>
      <span class="pair-count">{beatPairs.length} pairs</span>
    </button>

    {#if isExpanded}
      <!-- Groups Summary -->
      {#if beatPairGroups && groupCount > 0}
        <div class="groups-section">
          <h4 class="section-title">Transformation Groups</h4>
          <div class="groups-grid">
            {#each Object.entries(beatPairGroups) as [pattern, beats]}
              <div
                class="group-card"
                style="--group-color: {getColorForPattern(pattern)}"
              >
                <div class="group-pattern">{pattern}</div>
                <div class="group-beats">
                  Beats: {beats.join(", ")}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Detailed Pairs -->
      <div class="pairs-section">
        <h4 class="section-title">Detailed Pairs</h4>
        <div class="pairs-list">
          {#each beatPairs as pair}
            <div class="pair-row">
              <div class="pair-beats">
                <span class="beat-num">{pair.keyBeat}</span>
                <span class="arrow">↔</span>
                <span class="beat-num">{pair.correspondingBeat}</span>
              </div>
              <div class="pair-transforms">
                {#each pair.detectedTransformations as transform, i}
                  <span
                    class="transform-tag"
                    class:primary={i === 0}
                    class:alternative={i > 0}
                    style="--tag-color: {getColorForPattern(transform)}"
                  >
                    {transform}
                  </span>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .beat-pair-analysis {
    background: var(--surface-dark, rgba(0, 0, 0, 0.3));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    overflow: hidden;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    background: transparent;
    border: none;
    color: var(--foreground);
    cursor: pointer;
    transition: background var(--transition-micro);
  }

  .header:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .title {
    font-size: var(--font-size-sm);
    font-weight: 600;
  }

  .modular-badge {
    padding: 2px 8px;
    background: rgba(168, 85, 247, 0.2);
    border: 1px solid rgba(168, 85, 247, 0.4);
    border-radius: 12px;
    font-size: var(--font-size-xs);
    color: #a855f7;
    font-weight: 500;
  }

  .pair-count {
    font-size: var(--font-size-xs);
    color: var(--muted-foreground);
  }

  /* Groups Section */
  .groups-section,
  .pairs-section {
    padding: var(--spacing-sm) var(--spacing-md);
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  .section-title {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .groups-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  .group-card {
    flex: 1;
    min-width: 120px;
    padding: var(--spacing-sm);
    background: color-mix(in srgb, var(--group-color) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--group-color) 40%, transparent);
    border-radius: 8px;
  }

  .group-pattern {
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--group-color);
    margin-bottom: 4px;
  }

  .group-beats {
    font-size: var(--font-size-xs);
    color: var(--muted-foreground);
  }

  /* Pairs List */
  .pairs-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .pair-row {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: rgba(255, 255, 255, 0.02);
    border-radius: 6px;
  }

  .pair-beats {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    min-width: 70px;
  }

  .beat-num {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(99, 102, 241, 0.2);
    border-radius: 4px;
    font-size: var(--font-size-xs);
    font-weight: 600;
  }

  .arrow {
    color: var(--muted-foreground);
    font-size: var(--font-size-xs);
  }

  .pair-transforms {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    flex: 1;
  }

  .transform-tag {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 500;
    white-space: nowrap;
  }

  .transform-tag.primary {
    background: color-mix(in srgb, var(--tag-color) 25%, transparent);
    border: 1px solid color-mix(in srgb, var(--tag-color) 50%, transparent);
    color: var(--tag-color);
  }

  .transform-tag.alternative {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--muted-foreground);
    font-style: italic;
  }
</style>

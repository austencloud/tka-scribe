<!-- Individual Sequence Display Component -->
<script lang="ts">
  import HealthScoreCard from "./shared/HealthScoreCard.svelte";
  import SummaryStatsGrid from "./shared/SummaryStatsGrid.svelte";
  import IssuesPanel from "./shared/IssuesPanel.svelte";
  import BeatAnalysisGrid from "./shared/BeatAnalysisGrid.svelte";
  import RawDataViewer from "./shared/RawDataViewer.svelte";

  interface MetadataStats {
    healthScore: number;
    errorCount: number;
    warningCount: number;
    realBeatsCount: number;
    sequenceLength: number;
    startPositionCount: number;
    hasAuthor: boolean;
    authorName: string | null;
    authorMissing: boolean;
    hasLevel: boolean;
    level: number | null;
    levelMissing: boolean;
    levelZero: boolean;
    hasStartPosition: boolean;
    startPositionMissing: boolean;
    startPositionValue: string | null;
    hasErrors: boolean;
    hasWarnings: boolean;
    missingLetters: number[];
    missingMotionData: number[];
    missingRequiredFields: Array<{ beat: number; field: string }>;
    authorInconsistent: boolean;
    levelInconsistent: boolean;
    startPositionInconsistent: boolean;
    duplicateBeats: number[];
    invalidMotionTypes: Array<{ beat: number; prop: string; type: string }>;
  }

  interface ThumbnailData {
    word?: string;
  }

  interface BeatData {
    letter?: string;
    sequence_start_position?: string;
    blueAttributes?: { motionType?: string };
    redAttributes?: { motionType?: string };
    [key: string]: any;
  }

  interface Props {
    stats: MetadataStats;
    selectedThumbnail: ThumbnailData | null;
    extractedMetadata: BeatData[] | null;
    rawMetadata: string | null;
  }

  let { stats, selectedThumbnail, extractedMetadata, rawMetadata }: Props =
    $props();
</script>

<div class="individual-sequence">
  <!-- Metadata Summary -->
  <div class="metadata-summary">
    <h3>📈 Analysis for {selectedThumbnail?.word || "Unknown"}</h3>

    <!-- Health Score -->
    <HealthScoreCard
      healthScore={stats.healthScore}
      errorCount={stats.errorCount}
      warningCount={stats.warningCount}
    />

    <!-- Basic Stats -->
    <SummaryStatsGrid {stats} />
  </div>

  <!-- Issues & Warnings -->
  <IssuesPanel {stats} />

  <!-- Beat-by-Beat Analysis -->
  {#if extractedMetadata && Array.isArray(extractedMetadata)}
    <BeatAnalysisGrid beats={extractedMetadata} />
  {/if}

  <!-- Raw JSON Data -->
  {#if rawMetadata}
    <RawDataViewer rawData={rawMetadata} />
  {/if}
</div>

<style>
  .individual-sequence {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .metadata-summary {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.2);
    border-radius: 8px;
    padding: 20px;
  }

  .metadata-summary h3 {
    margin: 0 0 15px 0;
    color: #22c55e;
    font-size: 1.1rem;
  }
</style>

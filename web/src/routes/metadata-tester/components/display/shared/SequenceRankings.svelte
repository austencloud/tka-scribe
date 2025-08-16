<!-- Sequence Rankings Component -->
<script lang="ts">
  interface SequenceRanking {
    sequence: string;
    healthScore: number;
  }

  interface Props {
    bestSequences: SequenceRanking[];
    worstSequences: SequenceRanking[];
  }

  let { bestSequences, worstSequences }: Props = $props();

  function getScoreClass(score: number): string {
    return `score-${Math.floor(score / 20)}`;
  }
</script>

<div class="sequence-rankings">
  <div class="worst-sequences">
    <h4>❌ Worst Health Scores</h4>
    <ul class="ranking-list">
      {#each worstSequences as sequence}
        <li class="ranking-item">
          <span class="sequence-name">{sequence.sequence}</span>
          <span class="health-score {getScoreClass(sequence.healthScore)}">
            {sequence.healthScore}%
          </span>
        </li>
      {/each}
    </ul>
  </div>

  <div class="best-sequences">
    <h4>✅ Best Health Scores</h4>
    <ul class="ranking-list">
      {#each bestSequences as sequence}
        <li class="ranking-item">
          <span class="sequence-name">{sequence.sequence}</span>
          <span class="health-score {getScoreClass(sequence.healthScore)}">
            {sequence.healthScore}%
          </span>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .sequence-rankings {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .worst-sequences,
  .best-sequences {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 16px;
  }

  .worst-sequences h4,
  .best-sequences h4 {
    margin: 0 0 12px 0;
    color: #f9fafb;
  }

  .ranking-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .ranking-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .ranking-item:last-child {
    border-bottom: none;
  }

  .sequence-name {
    color: #f9fafb;
    font-family: monospace;
  }

  .health-score {
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 0.8rem;
  }

  .health-score.score-0,
  .health-score.score-1 {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
  }

  .health-score.score-2 {
    background: rgba(245, 158, 11, 0.2);
    color: #fbbf24;
  }

  .health-score.score-3,
  .health-score.score-4 {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .sequence-rankings {
      grid-template-columns: 1fr;
    }
  }
</style>

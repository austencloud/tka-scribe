<!-- Summary Stats Grid Component -->
<script lang="ts">
  interface Props {
    stats: {
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
    };
  }

  let { stats }: Props = $props();
</script>

<div class="stats-grid">
  <div class="stat-item">
    <span class="stat-label">Real Beats:</span>
    <span class="stat-value">{stats.realBeatsCount}</span>
  </div>

  <div class="stat-item">
    <span class="stat-label">Total Length:</span>
    <span class="stat-value">{stats.sequenceLength}</span>
  </div>

  <div class="stat-item">
    <span class="stat-label">Start Positions:</span>
    <span class="stat-value">{stats.startPositionCount}</span>
  </div>

  <div class="stat-item">
    <span class="stat-label">Author:</span>
    <span class="stat-value" class:error={stats.authorMissing}>
      {stats.hasAuthor ? stats.authorName : "❌ Missing"}
    </span>
  </div>

  <div class="stat-item">
    <span class="stat-label">Level:</span>
    <span
      class="stat-value"
      class:error={stats.levelMissing || stats.levelZero}
    >
      {stats.hasLevel
        ? stats.levelZero
          ? "⚠️ 0 (needs calculation)"
          : stats.level
        : "❌ Missing"}
    </span>
  </div>

  <div class="stat-item">
    <span class="stat-label">Start Position:</span>
    <span class="stat-value" class:error={stats.startPositionMissing}>
      {stats.hasStartPosition ? `✅ ${stats.startPositionValue}` : "❌ Missing"}
    </span>
  </div>
</div>

<style>
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
  }

  .stat-label {
    font-weight: 500;
    opacity: 0.8;
  }

  .stat-value {
    font-weight: 600;
    color: #22c55e;
  }

  .stat-value.error {
    color: #f87171;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

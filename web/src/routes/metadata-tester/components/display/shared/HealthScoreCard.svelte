<!-- Health Score Card Component -->
<script lang="ts">
  interface Props {
    healthScore: number;
    errorCount: number;
    warningCount: number;
  }

  let { healthScore, errorCount, warningCount }: Props = $props();

  const scoreClass = $derived(() => {
    if (healthScore >= 90) return "excellent";
    if (healthScore >= 70) return "good";
    if (healthScore >= 50) return "warning";
    return "poor";
  });

  const scoreText = $derived(() => {
    if (healthScore >= 90) return "✅ Excellent metadata quality";
    if (healthScore >= 70) return "✅ Good metadata quality";
    if (healthScore >= 50) return "⚠️ Some issues found";
    return "❌ Significant issues detected";
  });
</script>

<div class="health-score {scoreClass}">
  <div class="score-circle">
    <span class="score-value">{healthScore}</span>
    <span class="score-label">Health</span>
  </div>
  <div class="score-details">
    <p class="score-text">{scoreText}</p>
    <p class="issue-count">
      {errorCount} errors, {warningCount} warnings
    </p>
  </div>
</div>

<style>
  .health-score {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
    padding: 15px;
    border-radius: 8px;
    border: 2px solid;
  }

  .health-score.excellent {
    background: rgba(34, 197, 94, 0.1);
    border-color: rgba(34, 197, 94, 0.3);
    color: #22c55e;
  }

  .health-score.good {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.3);
    color: #3b82f6;
  }

  .health-score.warning {
    background: rgba(251, 191, 36, 0.1);
    border-color: rgba(251, 191, 36, 0.3);
    color: #fbbf24;
  }

  .health-score.poor {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    color: #f87171;
  }

  .score-circle {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 3px solid currentColor;
  }

  .score-value {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1;
  }

  .score-label {
    font-size: 0.7rem;
    font-weight: 500;
    opacity: 0.8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .score-details {
    flex: 1;
  }

  .score-text {
    margin: 0 0 5px 0;
    font-weight: 600;
    font-size: 1.1rem;
  }

  .issue-count {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.8;
  }
</style>

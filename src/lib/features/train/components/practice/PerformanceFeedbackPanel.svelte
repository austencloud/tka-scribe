<!--
  PerformanceFeedbackPanel.svelte - Performance feedback panel for Practice tab

  Shows current score and combo during training sessions.
  Displays last hit feedback (hit/miss) with points.
  Hidden on mobile (shown in camera overlay), visible on desktop in top bar.
-->
<script lang="ts">
	interface Props {
		currentScore?: number;
		currentCombo?: number;
		lastHitResult?: boolean | null;
		lastHitPoints?: number;
		isPerforming?: boolean;
	}

	let {
		currentScore = 0,
		currentCombo = 0,
		lastHitResult = null,
		lastHitPoints = 0,
		isPerforming = false
	}: Props = $props();
</script>

{#if isPerforming}
	<div class="performance-feedback-panel">
		<!-- Score Display -->
		<div class="metric">
			<span class="metric-label">Score</span>
			<span class="metric-value score">{currentScore.toLocaleString()}</span>
		</div>

		<!-- Combo Display (only when active) -->
		{#if currentCombo > 0}
			<div class="metric combo-metric">
				<span class="metric-label">Combo</span>
				<span class="metric-value combo">{currentCombo}x</span>
			</div>
		{/if}

		<!-- Last Hit Feedback -->
		{#if lastHitResult !== null}
			<div class="hit-feedback" class:hit={lastHitResult} class:miss={!lastHitResult}>
				{lastHitResult ? `+${lastHitPoints}` : "MISS"}
			</div>
		{/if}
	</div>
{:else}
	<div class="performance-feedback-panel empty">
		<span class="empty-text">Ready to train</span>
	</div>
{/if}

<style>
	/* ============================================
	   PERFORMANCE FEEDBACK PANEL - 2026 Design
	   Hidden on mobile, visible on desktop top bar
	   ============================================ */
	.performance-feedback-panel {
		display: none; /* Hidden on mobile (shown in camera overlay instead) */
		align-items: center;
		gap: var(--space-2026-lg, 28px);
		padding: var(--space-2026-md, 20px) var(--space-2026-lg, 28px);
		background: #1a1a24;
		border: 1px solid var(--border-2026, rgba(255, 255, 255, 0.06));
		border-radius: var(--radius-2026-md, 14px);
		box-shadow: var(--shadow-2026-md, 0 2px 8px rgba(0, 0, 0, 0.08));
		min-height: 72px;
	}

	.performance-feedback-panel.empty {
		justify-content: center;
	}

	.empty-text {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.4);
		font-weight: 500;
	}

	.metric {
		display: flex;
		flex-direction: column;
		gap: var(--space-2026-xs, 6px);
	}

	.metric-label {
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: rgba(255, 255, 255, 0.5);
	}

	.metric-value {
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1;
	}

	.metric-value.score {
		color: #3b82f6;
		text-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
	}

	.metric-value.combo {
		color: #fbbf24;
		text-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
	}

	.combo-metric {
		padding: var(--space-2026-sm, 12px) var(--space-2026-md, 20px);
		background: linear-gradient(
			135deg,
			rgba(251, 191, 36, 0.12) 0%,
			rgba(251, 191, 36, 0.08) 100%
		);
		border-radius: var(--radius-2026-sm, 10px);
		border: 1px solid rgba(251, 191, 36, 0.2);
	}

	.hit-feedback {
		padding: var(--space-2026-sm, 12px) var(--space-2026-md, 20px);
		border-radius: var(--radius-2026-sm, 10px);
		font-weight: 700;
		font-size: 1.125rem;
		animation: fadeInOut 0.8s ease-out forwards;
		border: 1px solid;
	}

	.hit-feedback.hit {
		background: linear-gradient(
			135deg,
			rgba(34, 197, 94, 0.15) 0%,
			rgba(34, 197, 94, 0.1) 100%
		);
		border-color: rgba(34, 197, 94, 0.3);
		color: rgba(134, 239, 172, 1);
		text-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
	}

	.hit-feedback.miss {
		background: linear-gradient(
			135deg,
			rgba(239, 68, 68, 0.15) 0%,
			rgba(239, 68, 68, 0.1) 100%
		);
		border-color: rgba(239, 68, 68, 0.3);
		color: rgba(248, 113, 113, 1);
		text-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
	}

	@keyframes fadeInOut {
		0% { opacity: 0; transform: scale(0.9); }
		15% { opacity: 1; transform: scale(1.05); }
		75% { opacity: 1; transform: scale(1); }
		100% { opacity: 0; transform: scale(0.95); }
	}

	/* ============================================
	   DESKTOP (≥ 1024px) - SHOW IN TOP BAR
	   ============================================ */
	@media (min-width: 1024px) {
		.performance-feedback-panel {
			display: flex;
		}
	}
</style>

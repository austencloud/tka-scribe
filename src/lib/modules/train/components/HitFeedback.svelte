<!--
  HitFeedback.svelte - Visual feedback for hits/misses

  Shows combo counter, score feedback, and animations for successful hits.
-->
<script lang="ts">
	interface Props {
		combo: number;
		lastHit: boolean | null;
		lastPoints: number;
		totalScore: number;
	}

	let { combo = 0, lastHit = null, lastPoints = 0, totalScore = 0 }: Props = $props();

	// Track when we show hit feedback animation
	let showFeedback = $state(false);
	let feedbackKey = $state(0);

	// Trigger animation when lastHit changes
	$effect(() => {
		if (lastHit !== null) {
			showFeedback = true;
			feedbackKey++;
			// Reset after animation
			const timeout = setTimeout(() => {
				showFeedback = false;
			}, 1000);
			return () => clearTimeout(timeout);
		}
		return;
	});
</script>

<div class="hit-feedback">
	<!-- Total Score Display -->
	<div class="score-display">
		<span class="score-label">Score</span>
		<span class="score-value">{totalScore.toLocaleString()}</span>
	</div>

	<!-- Combo Display -->
	{#if combo > 0}
		<div class="combo-display" class:high-combo={combo >= 10}>
			<span class="combo-value">{combo}x</span>
			<span class="combo-label">COMBO</span>
		</div>
	{/if}

	<!-- Hit/Miss Feedback Animation -->
	{#if showFeedback}
		{#key feedbackKey}
			<div class="feedback-popup" class:hit={lastHit} class:miss={!lastHit}>
				{#if lastHit}
					<div class="hit-text">HIT!</div>
					<div class="points-text">+{lastPoints}</div>
				{:else}
					<div class="miss-text">MISS</div>
				{/if}
			</div>
		{/key}
	{/if}
</div>

<style>
	.hit-feedback {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		position: relative;
	}

	.score-display {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.75rem 1.5rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
	}

	.score-label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: rgba(255, 255, 255, 0.6);
		font-weight: 600;
	}

	.score-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: white;
		font-variant-numeric: tabular-nums;
	}

	.combo-display {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
		border: 2px solid rgba(59, 130, 246, 0.4);
		border-radius: 8px;
		animation: pulse-combo 0.5s ease-in-out;
	}

	.combo-display.high-combo {
		background: linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(239, 68, 68, 0.2));
		border-color: rgba(234, 179, 8, 0.6);
		animation: pulse-high-combo 0.5s ease-in-out;
	}

	.combo-value {
		font-size: 2rem;
		font-weight: 800;
		color: #3b82f6;
		font-variant-numeric: tabular-nums;
	}

	.high-combo .combo-value {
		color: #eab308;
		text-shadow: 0 0 10px rgba(234, 179, 8, 0.5);
	}

	.combo-label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: rgba(255, 255, 255, 0.8);
		font-weight: 700;
	}

	.feedback-popup {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1.5rem 2rem;
		border-radius: 12px;
		pointer-events: none;
		z-index: 100;
		animation: popup 1s ease-out forwards;
	}

	.feedback-popup.hit {
		background: linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.3));
		border: 3px solid rgba(34, 197, 94, 0.8);
		box-shadow: 0 0 30px rgba(34, 197, 94, 0.4);
	}

	.feedback-popup.miss {
		background: linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.3));
		border: 3px solid rgba(239, 68, 68, 0.8);
		box-shadow: 0 0 30px rgba(239, 68, 68, 0.4);
	}

	.hit-text,
	.miss-text {
		font-size: 2.5rem;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.hit-text {
		color: #22c55e;
		text-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
	}

	.miss-text {
		color: #ef4444;
		text-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
	}

	.points-text {
		font-size: 1.5rem;
		font-weight: 700;
		color: white;
		font-variant-numeric: tabular-nums;
	}

	@keyframes pulse-combo {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
	}

	@keyframes pulse-high-combo {
		0%,
		100% {
			transform: scale(1);
			box-shadow: 0 0 20px rgba(234, 179, 8, 0.3);
		}
		50% {
			transform: scale(1.1);
			box-shadow: 0 0 40px rgba(234, 179, 8, 0.6);
		}
	}

	@keyframes popup {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.5);
		}
		20% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1.2);
		}
		40% {
			transform: translate(-50%, -50%) scale(1);
		}
		80% {
			opacity: 1;
			transform: translate(-50%, -60%) scale(1);
		}
		100% {
			opacity: 0;
			transform: translate(-50%, -80%) scale(0.8);
		}
	}
</style>

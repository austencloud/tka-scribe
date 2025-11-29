<!--
  ResultsScreen.svelte - Post-performance results display

  Shows performance statistics, accuracy, combo stats, and final score.
-->
<script lang="ts">
	interface Props {
		totalBeats: number;
		hits: number;
		misses: number;
		maxCombo: number;
		finalScore: number;
		sequenceName?: string;
		onPlayAgain?: () => void;
		onExit?: () => void;
	}

	let {
		totalBeats = 0,
		hits = 0,
		misses = 0,
		maxCombo = 0,
		finalScore = 0,
		sequenceName = "Sequence",
		onPlayAgain,
		onExit,
	}: Props = $props();

	// Calculate stats
	const accuracy = $derived(totalBeats > 0 ? (hits / totalBeats) * 100 : 0);
	const grade = $derived(
		accuracy >= 95 ? "S" :
		accuracy >= 85 ? "A" :
		accuracy >= 75 ? "B" :
		accuracy >= 65 ? "C" :
		"D"
	);
	const gradeColor = $derived(
		grade === "S" ? "#eab308" :
		grade === "A" ? "#22c55e" :
		grade === "B" ? "#3b82f6" :
		grade === "C" ? "#f59e0b" :
		"#ef4444"
	);
</script>

<div class="results-screen">
	<div class="results-container">
		<!-- Header -->
		<div class="results-header">
			<h1>Training Complete!</h1>
			{#if sequenceName}
				<p class="sequence-name">{sequenceName}</p>
			{/if}
		</div>

		<!-- Grade Display -->
		<div class="grade-display" style="--grade-color: {gradeColor}">
			<div class="grade-circle">
				<span class="grade-letter">{grade}</span>
			</div>
			<div class="accuracy-text">
				{accuracy.toFixed(1)}% Accuracy
			</div>
		</div>

		<!-- Stats Grid -->
		<div class="stats-grid">
			<div class="stat-card">
				<div class="stat-icon score">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
					</svg>
				</div>
				<div class="stat-value">{finalScore.toLocaleString()}</div>
				<div class="stat-label">Score</div>
			</div>

			<div class="stat-card">
				<div class="stat-icon hits">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M20 6L9 17l-5-5"/>
					</svg>
				</div>
				<div class="stat-value">{hits}</div>
				<div class="stat-label">Hits</div>
			</div>

			<div class="stat-card">
				<div class="stat-icon misses">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M18 6L6 18M6 6l12 12"/>
					</svg>
				</div>
				<div class="stat-value">{misses}</div>
				<div class="stat-label">Misses</div>
			</div>

			<div class="stat-card">
				<div class="stat-icon combo">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
					</svg>
				</div>
				<div class="stat-value">{maxCombo}x</div>
				<div class="stat-label">Max Combo</div>
			</div>
		</div>

		<!-- Detailed Stats -->
		<div class="detailed-stats">
			<div class="detail-row">
				<span class="detail-label">Total Beats</span>
				<span class="detail-value">{totalBeats}</span>
			</div>
			<div class="detail-row">
				<span class="detail-label">Hit Rate</span>
				<span class="detail-value">{accuracy.toFixed(1)}%</span>
			</div>
			<div class="detail-row">
				<span class="detail-label">Perfect Combo</span>
				<span class="detail-value">{maxCombo === totalBeats ? "Yes! 🎉" : "No"}</span>
			</div>
		</div>

		<!-- Action buttons -->
		<div class="action-buttons">
			{#if onPlayAgain}
				<button class="primary-button" onclick={onPlayAgain}>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M1 4v6h6M23 20v-6h-6"/>
						<path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
					</svg>
					Play Again
				</button>
			{/if}
			{#if onExit}
				<button class="secondary-button" onclick={onExit}>
					Exit
				</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.results-screen {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.95);
		backdrop-filter: blur(10px);
		z-index: 100;
		animation: fadeIn 0.4s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.results-container {
		max-width: 600px;
		width: 90%;
		max-height: 90vh;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		animation: slideUp 0.5s ease-out;
		overflow-y: auto;
	}

	@media (max-width: 768px) {
		.results-container {
			width: 100%;
			max-height: 100vh;
			padding: 1rem;
			gap: 1.5rem;
		}
	}

	@keyframes slideUp {
		from {
			transform: translateY(40px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.results-header {
		text-align: center;
	}

	.results-header h1 {
		font-size: 2.5rem;
		font-weight: 800;
		margin: 0;
		background: linear-gradient(135deg, #3b82f6, #8b5cf6);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	@media (max-width: 768px) {
		.results-header h1 {
			font-size: 1.75rem;
		}
	}

	.sequence-name {
		font-size: 1.125rem;
		opacity: 0.7;
		margin: 0.5rem 0 0 0;
	}

	@media (max-width: 768px) {
		.sequence-name {
			font-size: 1rem;
		}
	}

	.grade-display {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 2rem;
		background: rgba(255, 255, 255, 0.05);
		border: 2px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
	}

	.grade-circle {
		width: 150px;
		height: 150px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: radial-gradient(circle, var(--grade-color, #3b82f6) 0%, transparent 70%);
		border: 4px solid var(--grade-color, #3b82f6);
		box-shadow: 0 0 40px var(--grade-color, #3b82f6);
		animation: pulseGrade 2s ease-in-out infinite;
	}

	@media (max-width: 768px) {
		.grade-circle {
			width: 120px;
			height: 120px;
			border-width: 3px;
		}
	}

	@keyframes pulseGrade {
		0%, 100% {
			transform: scale(1);
			box-shadow: 0 0 40px var(--grade-color, #3b82f6);
		}
		50% {
			transform: scale(1.05);
			box-shadow: 0 0 60px var(--grade-color, #3b82f6);
		}
	}

	.grade-letter {
		font-size: 5rem;
		font-weight: 900;
		color: var(--grade-color, #3b82f6);
		text-shadow: 0 0 20px var(--grade-color, #3b82f6);
	}

	@media (max-width: 768px) {
		.grade-letter {
			font-size: 4rem;
		}
	}

	.accuracy-text {
		font-size: 1.5rem;
		font-weight: 700;
		color: white;
	}

	@media (max-width: 768px) {
		.accuracy-text {
			font-size: 1.25rem;
		}
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	@media (max-width: 600px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}
	}

	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		transition: all 0.3s;
	}

	.stat-card:hover {
		background: rgba(255, 255, 255, 0.08);
		transform: translateY(-2px);
	}

	.stat-icon {
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 12px;
		padding: 10px;
	}

	.stat-icon.score {
		background: rgba(234, 179, 8, 0.2);
		color: #eab308;
	}

	.stat-icon.hits {
		background: rgba(34, 197, 94, 0.2);
		color: #22c55e;
	}

	.stat-icon.misses {
		background: rgba(239, 68, 68, 0.2);
		color: #ef4444;
	}

	.stat-icon.combo {
		background: rgba(59, 130, 246, 0.2);
		color: #3b82f6;
	}

	.stat-icon svg {
		width: 100%;
		height: 100%;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 800;
		color: white;
		font-variant-numeric: tabular-nums;
	}

	.stat-label {
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: rgba(255, 255, 255, 0.6);
		font-weight: 600;
	}

	.detailed-stats {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.detail-row:last-child {
		border-bottom: none;
	}

	.detail-label {
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.7);
	}

	.detail-value {
		font-size: 1rem;
		font-weight: 600;
		color: white;
		font-variant-numeric: tabular-nums;
	}

	.action-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.primary-button,
	.secondary-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.875rem 2rem;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.primary-button {
		background: linear-gradient(135deg, #3b82f6, #8b5cf6);
		border: none;
		color: white;
	}

	.primary-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
	}

	.primary-button svg {
		width: 20px;
		height: 20px;
	}

	.secondary-button {
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.3);
		color: white;
	}

	.secondary-button:hover {
		background: rgba(255, 255, 255, 0.1);
	}
</style>

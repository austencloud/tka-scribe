<!--
  ResultsScreen.svelte - Post-performance results display

  Shows performance statistics, accuracy, combo stats, final score, XP earned, and challenge progress.
-->
<script lang="ts">
	import { onMount } from "svelte";
	import type { TrainChallenge } from "../domain/models/TrainChallengeModels";

	interface XPBreakdown {
		baseXP: number;
		accuracyBonus: number;
		comboBonus: number;
		totalXP: number;
	}

	interface ChallengeProgress {
		challenge: TrainChallenge;
		currentProgress: number;
		isComplete: boolean;
	}

	interface Props {
		totalBeats: number;
		hits: number;
		misses: number;
		maxCombo: number;
		finalScore: number;
		sequenceName?: string;
		xpBreakdown?: XPBreakdown;
		challengeProgress?: ChallengeProgress;
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
		xpBreakdown,
		challengeProgress,
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

	// Handle Escape key to exit
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape" && onExit) {
			event.preventDefault();
			onExit();
		}
	}

	onMount(() => {
		window.addEventListener("keydown", handleKeydown);
		return () => window.removeEventListener("keydown", handleKeydown);
	});
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

		<!-- XP Breakdown -->
		{#if xpBreakdown}
			<div class="xp-section">
				<div class="xp-header">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
					</svg>
					<h3>XP Earned</h3>
				</div>
				<div class="xp-breakdown">
					<div class="xp-row">
						<span class="xp-label">Base XP</span>
						<span class="xp-value">+{xpBreakdown.baseXP}</span>
					</div>
					{#if xpBreakdown.accuracyBonus > 0}
						<div class="xp-row bonus">
							<span class="xp-label">Accuracy Bonus</span>
							<span class="xp-value">+{xpBreakdown.accuracyBonus}</span>
						</div>
					{/if}
					{#if xpBreakdown.comboBonus > 0}
						<div class="xp-row bonus">
							<span class="xp-label">Combo Bonus</span>
							<span class="xp-value">+{xpBreakdown.comboBonus}</span>
						</div>
					{/if}
					<div class="xp-total">
						<span class="xp-total-label">Total XP</span>
						<span class="xp-total-value">+{xpBreakdown.totalXP}</span>
					</div>
				</div>
			</div>
		{/if}

		<!-- Challenge Progress -->
		{#if challengeProgress}
			<div class="challenge-section" class:complete={challengeProgress.isComplete}>
				<div class="challenge-header">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
						<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
						<path d="M4 22h16"/>
						<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
						<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
						<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
					</svg>
					<h3>{challengeProgress.isComplete ? "Challenge Completed!" : "Challenge Progress"}</h3>
				</div>
				<div class="challenge-info">
					<div class="challenge-title">{challengeProgress.challenge.title}</div>
					<div class="challenge-progress-bar">
						<div class="progress-track">
							<div
								class="progress-fill"
								style="width: {Math.min((challengeProgress.currentProgress / challengeProgress.challenge.requirement.target) * 100, 100)}%"
							></div>
						</div>
						<div class="progress-text">
							{challengeProgress.currentProgress} / {challengeProgress.challenge.requirement.target}
						</div>
					</div>
					{#if challengeProgress.isComplete}
						<div class="challenge-reward">
							<span class="reward-label">Reward:</span>
							<span class="reward-value">+{challengeProgress.challenge.xpReward} XP</span>
						</div>
					{/if}
				</div>
			</div>
		{/if}

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
		max-width: 500px;
		width: 90%;
		max-height: 90vh;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		animation: slideUp 0.5s ease-out;
		overflow-y: auto;
	}

	@media (max-width: 768px) {
		.results-container {
			width: 100%;
			max-height: 100vh;
			padding: 1rem;
			gap: 0.75rem;
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
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.05);
		border: 2px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
	}

	.grade-circle {
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: radial-gradient(circle, var(--grade-color, #3b82f6) 0%, transparent 70%);
		border: 3px solid var(--grade-color, #3b82f6);
		box-shadow: 0 0 20px var(--grade-color, #3b82f6);
		flex-shrink: 0;
	}

	@media (max-width: 768px) {
		.grade-circle {
			width: 64px;
			height: 64px;
			border-width: 2px;
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
		font-size: 2.5rem;
		font-weight: 900;
		color: var(--grade-color, #3b82f6);
		text-shadow: 0 0 10px var(--grade-color, #3b82f6);
	}

	@media (max-width: 768px) {
		.grade-letter {
			font-size: 2rem;
		}
	}

	.accuracy-text {
		font-size: 1.25rem;
		font-weight: 700;
		color: white;
	}

	@media (max-width: 768px) {
		.accuracy-text {
			font-size: 1.125rem;
		}
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
	}

	@media (max-width: 600px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.75rem 0.5rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		transition: all 0.3s;
	}

	.stat-card:hover {
		background: rgba(255, 255, 255, 0.08);
	}

	.stat-icon {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		padding: 5px;
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
		font-size: 1.25rem;
		font-weight: 700;
		color: white;
		font-variant-numeric: tabular-nums;
	}

	.stat-label {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: rgba(255, 255, 255, 0.6);
		font-weight: 600;
	}

	.detailed-stats {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.25rem 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.detail-row:last-child {
		border-bottom: none;
	}

	.detail-label {
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.7);
	}

	.detail-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: white;
		font-variant-numeric: tabular-nums;
	}

	.action-buttons {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		margin-top: 0.5rem;
	}

	.primary-button,
	.secondary-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 44px;
		padding: 0.625rem 1.5rem;
		border-radius: 8px;
		font-size: 0.9rem;
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

	/* XP Section */
	.xp-section {
		padding: 0.75rem 1rem;
		background: linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(245, 158, 11, 0.05));
		border: 1px solid rgba(234, 179, 8, 0.3);
		border-radius: 8px;
	}

	.xp-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.xp-header svg {
		width: 18px;
		height: 18px;
		color: #eab308;
	}

	.xp-header h3 {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 700;
		color: #eab308;
	}

	.xp-breakdown {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.xp-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.25rem 0;
		color: rgba(255, 255, 255, 0.8);
	}

	.xp-row.bonus {
		color: rgba(234, 179, 8, 0.9);
	}

	.xp-label {
		font-size: 0.8rem;
	}

	.xp-value {
		font-size: 0.875rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.xp-total {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		margin-top: 0.25rem;
		border-top: 1px solid rgba(234, 179, 8, 0.3);
	}

	.xp-total-label {
		font-size: 0.9rem;
		font-weight: 700;
		color: white;
	}

	.xp-total-value {
		font-size: 1.125rem;
		font-weight: 800;
		color: #eab308;
		font-variant-numeric: tabular-nums;
	}

	/* Challenge Section */
	.challenge-section {
		padding: 0.75rem 1rem;
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.05));
		border: 1px solid rgba(59, 130, 246, 0.3);
		border-radius: 8px;
	}

	.challenge-section.complete {
		background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05));
		border-color: rgba(34, 197, 94, 0.3);
	}

	.challenge-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.challenge-header svg {
		width: 18px;
		height: 18px;
		color: #3b82f6;
	}

	.challenge-section.complete .challenge-header svg {
		color: #22c55e;
	}

	.challenge-header h3 {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 700;
		color: #3b82f6;
	}

	.challenge-section.complete .challenge-header h3 {
		color: #22c55e;
	}

	.challenge-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.challenge-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: white;
	}

	.challenge-progress-bar {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.progress-track {
		width: 100%;
		height: 6px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #3b82f6, #8b5cf6);
		border-radius: 3px;
		transition: width 0.5s ease-out;
	}

	.challenge-section.complete .progress-fill {
		background: linear-gradient(90deg, #22c55e, #10b981);
	}

	.progress-text {
		font-size: 0.75rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.7);
		text-align: center;
		font-variant-numeric: tabular-nums;
	}

	.challenge-reward {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background: rgba(34, 197, 94, 0.2);
		border-radius: 6px;
	}

	.reward-label {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.8);
	}

	.reward-value {
		font-size: 0.9rem;
		font-weight: 700;
		color: #22c55e;
		font-variant-numeric: tabular-nums;
	}
</style>

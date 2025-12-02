<!--
  ProgressPanel.svelte - Progress Tab

  Displays training statistics, session history, and personal bests.
  Shows an engaging placeholder when no data exists yet.
-->
<script lang="ts">
	import { onMount } from "svelte";
	import { fly, fade } from "svelte/transition";
	import { resolve } from "$lib/shared/inversify/di";
	import { TYPES } from "$lib/shared/inversify/types";
	import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
	import type { IPerformanceHistoryService } from "../../services/contracts/IPerformanceHistoryService";
	import type { StatsOverview, PersonalBest } from "../../services/contracts/IPerformanceHistoryService";
	import type { StoredPerformance } from "../../domain/models/TrainDatabaseModels";
	import { handleModuleChange } from "$lib/shared/navigation-coordinator/navigation-coordinator.svelte";
	import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
	import StatsOverviewComponent from "./StatsOverview.svelte";
	import PersonalBests from "./PersonalBests.svelte";
	import SessionHistory from "./SessionHistory.svelte";

	let isLoading = $state(true);
	let isVisible = $state(false);
	let stats = $state<StatsOverview | null>(null);
	let personalBests = $state<PersonalBest[]>([]);
	let recentSessions = $state<StoredPerformance[]>([]);
	let hapticService: IHapticFeedbackService | undefined;

	const hasData = $derived(stats && stats.totalSessions > 0);

	onMount(async () => {
		hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
		try {
			const historyService = resolve<IPerformanceHistoryService>(
				TYPES.IPerformanceHistoryService
			);

			const [statsData, bestsData, sessionsData] = await Promise.all([
				historyService.getStatsOverview(),
				historyService.getPersonalBests(),
				historyService.getRecentSessions(10)
			]);

			stats = statsData;
			personalBests = bestsData;
			recentSessions = sessionsData;
		} catch (error) {
			console.error("[ProgressPanel] Failed to load data:", error);
		} finally {
			isLoading = false;
			setTimeout(() => {
				isVisible = true;
			}, 50);
		}
	});

	function navigateToPractice() {
		hapticService?.trigger("selection");
		navigationState.setActiveTab("train", "practice");
	}
</script>

<div class="progress-panel" class:visible={isVisible}>
	{#if isLoading}
		<div class="loading-state" transition:fade={{ duration: 200 }}>
			<div class="spinner"></div>
			<p>Loading your stats...</p>
		</div>
	{:else if !hasData}
		<!-- EMPTY STATE - Engaging placeholder -->
		<div class="empty-state">
			<!-- Header -->
			{#if isVisible}
				<header class="empty-header" transition:fly={{ y: -12, duration: 300 }}>
					<div class="header-icon">
						<i class="fas fa-chart-line"></i>
					</div>
					<h1>Your Training Journey</h1>
					<p>Track your progress and see how far you've come</p>
				</header>
			{/if}

			<!-- Preview Stats Grid -->
			{#if isVisible}
				<section class="preview-stats" transition:fly={{ y: 12, duration: 300, delay: 100 }}>
					<div class="stat-card">
						<div class="stat-icon sessions">
							<i class="fas fa-dumbbell"></i>
						</div>
						<div class="stat-content">
							<span class="stat-value">0</span>
							<span class="stat-label">Sessions</span>
						</div>
					</div>

					<div class="stat-card">
						<div class="stat-icon time">
							<i class="fas fa-clock"></i>
						</div>
						<div class="stat-content">
							<span class="stat-value placeholder">--:--</span>
							<span class="stat-label">Practice Time</span>
						</div>
					</div>

					<div class="stat-card">
						<div class="stat-icon accuracy">
							<i class="fas fa-bullseye"></i>
						</div>
						<div class="stat-content">
							<span class="stat-value placeholder">--%</span>
							<span class="stat-label">Avg Accuracy</span>
						</div>
					</div>

					<div class="stat-card">
						<div class="stat-icon combo">
							<i class="fas fa-fire"></i>
						</div>
						<div class="stat-content">
							<span class="stat-value">0</span>
							<span class="stat-label">Best Combo</span>
						</div>
					</div>
				</section>
			{/if}

			<!-- Preview Sections -->
			{#if isVisible}
				<div class="preview-sections" transition:fly={{ y: 12, duration: 300, delay: 200 }}>
					<!-- Personal Bests Preview -->
					<section class="preview-section">
						<div class="section-header">
							<i class="fas fa-trophy"></i>
							<h2>Personal Bests</h2>
						</div>
						<div class="empty-rows">
							<div class="empty-row">
								<div class="empty-bar" style="width: 75%"></div>
							</div>
							<div class="empty-row">
								<div class="empty-bar" style="width: 60%"></div>
							</div>
							<div class="empty-row">
								<div class="empty-bar" style="width: 45%"></div>
							</div>
						</div>
						<p class="section-hint">Your top scores for each sequence will appear here</p>
					</section>

					<!-- Recent Sessions Preview -->
					<section class="preview-section">
						<div class="section-header">
							<i class="fas fa-history"></i>
							<h2>Recent Sessions</h2>
						</div>
						<div class="empty-rows">
							<div class="empty-row">
								<div class="empty-bar" style="width: 85%"></div>
							</div>
							<div class="empty-row">
								<div class="empty-bar" style="width: 70%"></div>
							</div>
							<div class="empty-row">
								<div class="empty-bar" style="width: 55%"></div>
							</div>
						</div>
						<p class="section-hint">Your training history will be tracked here</p>
					</section>
				</div>
			{/if}

			<!-- CTA -->
			{#if isVisible}
				<div class="cta-section" transition:fly={{ y: 12, duration: 300, delay: 300 }}>
					<button class="start-btn" onclick={navigateToPractice}>
						<i class="fas fa-play"></i>
						<span>Start Your First Session</span>
						<i class="fas fa-arrow-right"></i>
					</button>
				</div>
			{/if}
		</div>
	{:else}
		<!-- HAS DATA - Real content -->
		{#if isVisible}
			<div transition:fly={{ y: 12, duration: 300 }}>
				<StatsOverviewComponent {stats} />
			</div>
		{/if}

		{#if personalBests.length > 0 && isVisible}
			<section class="section" transition:fly={{ y: 12, duration: 300, delay: 100 }}>
				<h2>Personal Bests</h2>
				<PersonalBests bests={personalBests} />
			</section>
		{/if}

		{#if recentSessions.length > 0 && isVisible}
			<section class="section" transition:fly={{ y: 12, duration: 300, delay: 200 }}>
				<h2>Recent Sessions</h2>
				<SessionHistory sessions={recentSessions} />
			</section>
		{/if}
	{/if}
</div>

<style>
	.progress-panel {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		width: 100%;
		height: 100%;
		overflow-y: auto;
		padding: 1.5rem;
		background: transparent;
		color: var(--foreground, #ffffff);
		opacity: 0;
		transition: opacity 300ms ease;
	}

	.progress-panel.visible {
		opacity: 1;
	}

	/* Loading State */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		min-height: 400px;
		text-align: center;
	}

	.spinner {
		width: 3rem;
		height: 3rem;
		border: 3px solid rgba(255, 255, 255, 0.1);
		border-top: 3px solid #ef4444;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* ========================================
	   EMPTY STATE - Engaging Placeholder
	   ======================================== */

	.empty-state {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		max-width: 600px;
		margin: 0 auto;
		width: 100%;
	}

	/* Header */
	.empty-header {
		text-align: center;
		padding: 1rem 0;
	}

	.header-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%);
		border-radius: 18px;
		margin-bottom: 1rem;
		animation: pulse-glow 3s ease-in-out infinite;
	}

	.header-icon i {
		font-size: 28px;
		color: #ef4444;
	}

	@keyframes pulse-glow {
		0%, 100% {
			box-shadow: 0 0 20px rgba(239, 68, 68, 0.1);
		}
		50% {
			box-shadow: 0 0 30px rgba(239, 68, 68, 0.2);
		}
	}

	.empty-header h1 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.95);
		letter-spacing: -0.02em;
	}

	.empty-header p {
		margin: 0.5rem 0 0;
		font-size: 0.95rem;
		color: rgba(255, 255, 255, 0.5);
	}

	/* Preview Stats Grid */
	.preview-stats {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}

	.stat-card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 16px;
		transition: all 200ms ease;
	}

	.stat-card:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.1);
	}

	.stat-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 12px;
		flex-shrink: 0;
		font-size: 18px;
	}

	.stat-icon.sessions {
		background: rgba(239, 68, 68, 0.12);
		color: #ef4444;
	}

	.stat-icon.time {
		background: rgba(59, 130, 246, 0.12);
		color: #3b82f6;
	}

	.stat-icon.accuracy {
		background: rgba(16, 185, 129, 0.12);
		color: #10b981;
	}

	.stat-icon.combo {
		background: rgba(245, 158, 11, 0.12);
		color: #f59e0b;
	}

	.stat-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.95);
	}

	.stat-value.placeholder {
		color: rgba(255, 255, 255, 0.3);
	}

	.stat-label {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.5);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	/* Preview Sections */
	.preview-sections {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.preview-section {
		padding: 20px;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 16px;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 16px;
	}

	.section-header i {
		color: rgba(255, 255, 255, 0.4);
		font-size: 16px;
	}

	.section-header h2 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.7);
	}

	.empty-rows {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.empty-row {
		height: 12px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		overflow: hidden;
	}

	.empty-bar {
		height: 100%;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.06) 0%,
			rgba(255, 255, 255, 0.02) 50%,
			rgba(255, 255, 255, 0.06) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 2s ease-in-out infinite;
		border-radius: 6px;
	}

	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	.section-hint {
		margin: 12px 0 0;
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.35);
		text-align: center;
	}

	/* CTA Section */
	.cta-section {
		display: flex;
		justify-content: center;
		padding-top: 0.5rem;
	}

	.start-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		min-height: 56px;
		padding: 16px 28px;
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
		border: none;
		border-radius: 16px;
		color: white;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 200ms ease;
		position: relative;
		overflow: hidden;
	}

	.start-btn::before {
		content: "";
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
		pointer-events: none;
	}

	.start-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 32px rgba(239, 68, 68, 0.35);
	}

	.start-btn:active {
		transform: scale(0.98);
	}

	.start-btn i:last-child {
		font-size: 14px;
		opacity: 0.8;
		transition: transform 200ms ease;
	}

	.start-btn:hover i:last-child {
		transform: translateX(4px);
	}

	/* ========================================
	   HAS DATA STYLES
	   ======================================== */

	.section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.section h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	/* ========================================
	   RESPONSIVE
	   ======================================== */

	@media (max-width: 480px) {
		.progress-panel {
			padding: 1rem;
			gap: 1.25rem;
		}

		.empty-state {
			gap: 1.5rem;
		}

		.header-icon {
			width: 56px;
			height: 56px;
		}

		.header-icon i {
			font-size: 24px;
		}

		.empty-header h1 {
			font-size: 1.25rem;
		}

		.preview-stats {
			gap: 10px;
		}

		.stat-card {
			padding: 12px;
			gap: 10px;
		}

		.stat-icon {
			width: 38px;
			height: 38px;
			font-size: 16px;
		}

		.stat-value {
			font-size: 1.1rem;
		}

		.preview-section {
			padding: 16px;
		}

		.start-btn {
			min-height: 52px;
			padding: 14px 24px;
			font-size: 0.95rem;
			width: 100%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.progress-panel {
			transition: none;
		}

		.stat-card,
		.start-btn {
			transition: none;
		}

		.start-btn:hover {
			transform: none;
		}

		.empty-bar {
			animation: none;
		}

		.header-icon {
			animation: none;
		}
	}
</style>

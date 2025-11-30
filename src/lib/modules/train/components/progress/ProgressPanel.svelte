<!--
  ProgressPanel.svelte - Progress Tab

  Displays training statistics, session history, and personal bests.
-->
<script lang="ts">
	import { onMount } from "svelte";
	import { resolve } from "$lib/shared/inversify";
	import { TYPES } from "$lib/shared/inversify/types";
	import type { IPerformanceHistoryService } from "../../services/contracts/IPerformanceHistoryService";
	import type { StatsOverview, PersonalBest } from "../../services/contracts/IPerformanceHistoryService";
	import type { StoredPerformance } from "../../domain/models/TrainDatabaseModels";
	import StatsOverviewComponent from "./StatsOverview.svelte";
	import PersonalBests from "./PersonalBests.svelte";
	import SessionHistory from "./SessionHistory.svelte";

	let isLoading = $state(true);
	let stats = $state<StatsOverview | null>(null);
	let personalBests = $state<PersonalBest[]>([]);
	let recentSessions = $state<StoredPerformance[]>([]);

	onMount(async () => {
		try {
			const historyService = resolve<IPerformanceHistoryService>(
				TYPES.IPerformanceHistoryService
			);

			// Load all data in parallel
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
		}
	});
</script>

<div class="progress-panel">
	{#if isLoading}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>Loading your stats...</p>
		</div>
	{:else if !stats || stats.totalSessions === 0}
		<div class="empty-state">
			<i class="fas fa-chart-line"></i>
			<h2>No Training Data Yet</h2>
			<p>Complete your first training session to see your progress!</p>
		</div>
	{:else}
		<!-- Stats Overview -->
		<StatsOverviewComponent {stats} />

		<!-- Personal Bests -->
		{#if personalBests.length > 0}
			<section class="section">
				<h2>Personal Bests</h2>
				<PersonalBests bests={personalBests} />
			</section>
		{/if}

		<!-- Recent Sessions -->
		{#if recentSessions.length > 0}
			<section class="section">
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
	}

	.loading-state,
	.empty-state {
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
		border-top: 3px solid #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.empty-state i {
		font-size: 4rem;
		opacity: 0.3;
	}

	.empty-state h2 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.empty-state p {
		margin: 0;
		font-size: 1rem;
		opacity: 0.7;
	}

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
</style>

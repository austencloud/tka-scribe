<!--
  ProgressPanel.svelte - Progress Tab

  Displays training statistics, session history, and personal bests.
  Shows an engaging placeholder when no data exists yet.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import type { IPerformanceHistoryService } from "../../services/contracts/IPerformanceHistoryService";
  import type {
    StatsOverview,
    PersonalBest,
  } from "../../services/contracts/IPerformanceHistoryService";
  import type { StoredPerformance } from "../../domain/models/TrainDatabaseModels";
  import { handleModuleChange } from "$lib/shared/navigation-coordinator/navigation-coordinator.svelte";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import StatsOverviewComponent from "./StatsOverview.svelte";
  import PersonalBests from "./PersonalBests.svelte";
  import SessionHistory from "./SessionHistory.svelte";

  let isLoading = $state(true);
  let stats = $state<StatsOverview | null>(null);
  let personalBests = $state<PersonalBest[]>([]);
  let recentSessions = $state<StoredPerformance[]>([]);
  let hapticService: IHapticFeedbackService | undefined;

  const hasData = $derived(stats && stats.totalSessions > 0);

  onMount(async () => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
    try {
      const historyService = resolve<IPerformanceHistoryService>(
        TYPES.IPerformanceHistoryService
      );

      const [statsData, bestsData, sessionsData] = await Promise.all([
        historyService.getStatsOverview(),
        historyService.getPersonalBests(),
        historyService.getRecentSessions(10),
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

  function navigateToPractice() {
    hapticService?.trigger("selection");
    navigationState.setActiveTab("practice");
  }
</script>

<div class="progress-panel">
  {#if isLoading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading your stats...</p>
    </div>
  {:else if !hasData}
    <!-- EMPTY STATE - Engaging placeholder -->
    <div class="empty-state">
      <!-- Header -->
      <header class="empty-header">
        <div class="header-icon">
          <i class="fas fa-chart-line"></i>
        </div>
        <h1>Your Training Journey</h1>
        <p>Track your progress and see how far you've come</p>
      </header>

      <!-- Preview Stats Grid -->
      <section class="preview-stats">
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

      <!-- Preview Sections -->
      <div class="preview-sections">
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
          <p class="section-hint">
            Your top scores for each sequence will appear here
          </p>
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

      <!-- CTA -->
      <div class="cta-section">
        <button class="start-btn" onclick={navigateToPractice}>
          <i class="fas fa-play"></i>
          <span>Start Your First Session</span>
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  {:else if stats}
    <!-- HAS DATA - Real content -->
    <div>
      <StatsOverviewComponent {stats} />
    </div>

    {#if personalBests.length > 0}
      <section class="section">
        <h2>Personal Bests</h2>
        <PersonalBests bests={personalBests} />
      </section>
    {/if}

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
    color: var(--theme-text, #ffffff);
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
    border: 3px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-top: 3px solid var(--semantic-error, #ef4444);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
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
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--semantic-error, #ef4444) 15%, transparent) 0%,
      color-mix(in srgb, var(--semantic-error, #dc2626) 10%, transparent) 100%
    );
    border-radius: 18px;
    margin-bottom: 1rem;
    animation: pulse-glow 3s ease-in-out infinite;
  }

  .header-icon i {
    font-size: 28px;
    color: var(--semantic-error, #ef4444);
  }

  @keyframes pulse-glow {
    0%,
    100% {
      box-shadow: 0 0 20px
        color-mix(in srgb, var(--semantic-error, #ef4444) 10%, transparent);
    }
    50% {
      box-shadow: 0 0 30px
        color-mix(in srgb, var(--semantic-error, #ef4444) 20%, transparent);
    }
  }

  .empty-header h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: color-mix(in srgb, var(--theme-text, white) 95%, transparent);
    letter-spacing: -0.02em;
  }

  .empty-header p {
    margin: 0.5rem 0 0;
    font-size: 0.95rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
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
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.06));
    border-radius: 16px;
    transition: all 200ms ease;
  }

  .stat-card:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.05));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.1));
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
    background: color-mix(
      in srgb,
      var(--semantic-error, #ef4444) 12%,
      transparent
    );
    color: var(--semantic-error, #ef4444);
  }

  .stat-icon.time {
    background: color-mix(
      in srgb,
      var(--semantic-info, #3b82f6) 12%,
      transparent
    );
    color: var(--semantic-info, #3b82f6);
  }

  .stat-icon.accuracy {
    background: color-mix(
      in srgb,
      var(--semantic-success, #10b981) 12%,
      transparent
    );
    color: var(--semantic-success, #10b981);
  }

  .stat-icon.combo {
    background: color-mix(
      in srgb,
      var(--semantic-warning, #f59e0b) 12%,
      transparent
    );
    color: var(--semantic-warning, #f59e0b);
  }

  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: color-mix(in srgb, var(--theme-text, white) 95%, transparent);
  }

  .stat-value.placeholder {
    color: color-mix(in srgb, var(--theme-text, white) 30%, transparent);
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
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
    background: color-mix(
      in srgb,
      var(--theme-card-bg, white) 50%,
      transparent
    );
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.05));
    border-radius: 16px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  }

  .section-header i {
    color: color-mix(in srgb, var(--theme-text, white) 40%, transparent);
    font-size: 16px;
  }

  .section-header h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: color-mix(in srgb, var(--theme-text, white) 70%, transparent);
  }

  .empty-rows {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .empty-row {
    height: 12px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border-radius: 6px;
    overflow: hidden;
  }

  .empty-bar {
    height: 100%;
    background: linear-gradient(
      90deg,
      var(--theme-stroke, rgba(255, 255, 255, 0.06)) 0%,
      color-mix(in srgb, var(--theme-stroke, white) 30%, transparent) 50%,
      var(--theme-stroke, rgba(255, 255, 255, 0.06)) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 2s ease-in-out infinite;
    border-radius: 6px;
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  .section-hint {
    margin: 12px 0 0;
    font-size: 0.8rem;
    color: color-mix(in srgb, var(--theme-text, white) 35%, transparent);
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
    min-height: var(--min-touch-target);
    padding: 16px 28px;
    background: linear-gradient(
      135deg,
      var(--semantic-error, #ef4444) 0%,
      var(--semantic-error, #dc2626) 100%
    );
    border: none;
    border-radius: 16px;
    color: var(--theme-text, white);
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
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-text, white) 15%, transparent) 0%,
      transparent 50%
    );
    pointer-events: none;
  }

  .start-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px
      color-mix(in srgb, var(--semantic-error, #ef4444) 35%, transparent);
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
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
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
      width: var(--min-touch-target);
      height: var(--min-touch-target);
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
      min-height: var(--min-touch-target);
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

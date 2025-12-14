<!-- ActivityTab.svelte - User Activity History
     View your own activity history and sessions -->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve } from "../../../inversify/di";
  import { TYPES } from "../../../inversify/types";
  import type { IActivityLogService } from "../../../analytics/services/contracts/IActivityLogService";
  import type { ISessionTrackingService } from "../../../analytics/services/contracts/ISessionTrackingService";
  import type { ActivityEvent } from "../../../analytics/domain/models/ActivityEvent";
  import { authState } from "../../../auth/state/authState.svelte";
  import SessionCard from "./activity/SessionCard.svelte";

  // Services
  let activityService: IActivityLogService | null = null;
  let sessionService: ISessionTrackingService | null = null;

  // State
  let isLoading = $state(true);
  let events = $state<ActivityEvent[]>([]);
  let groupedSessions = $state<Map<string, ActivityEvent[]>>(new Map());
  let error = $state<string | null>(null);

  // Current session info
  let currentSessionId = $state<string | null>(null);
  let currentSessionDuration = $state(0);

  // Date filter
  let dateFilter = $state<"today" | "week" | "month" | "all">("week");

  onMount(() => {
    activityService = resolve<IActivityLogService>(TYPES.IActivityLogService);
    sessionService = resolve<ISessionTrackingService>(TYPES.ISessionTrackingService);

    currentSessionId = sessionService?.getSessionId() ?? null;

    loadActivity();

    // Update current session duration every second
    const interval = setInterval(() => {
      if (sessionService) {
        currentSessionDuration = sessionService.getSessionDuration();
      }
    }, 1000);

    return () => clearInterval(interval);
  });

  async function loadActivity() {
    if (!activityService) return;

    const userId = authState.getUser()?.uid;
    if (!userId) {
      error = "Not logged in";
      isLoading = false;
      return;
    }

    isLoading = true;
    error = null;

    try {
      const now = new Date();
      let startDate: Date;

      switch (dateFilter) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "all":
        default:
          startDate = new Date(0);
      }

      const result = await activityService.queryEvents({
        userId,
        startDate,
        orderDirection: "desc",
        limit: 500,
      });

      events = result;
      groupEventsBySession(result);
    } catch (e) {
      console.error("Failed to load activity:", e);
      error = "Failed to load activity history";
    } finally {
      isLoading = false;
    }
  }

  function groupEventsBySession(eventList: ActivityEvent[]) {
    const sessionMap = new Map<string, ActivityEvent[]>();

    for (const event of eventList) {
      const sessionId = event.sessionId ?? "unknown";
      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, []);
      }
      sessionMap.get(sessionId)!.push(event);
    }

    // Sort events within each session by timestamp
    for (const [, sessionEvents] of sessionMap) {
      sessionEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    groupedSessions = sessionMap;
  }

  function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  // Reload when filter changes
  $effect(() => {
    if (dateFilter) {
      loadActivity();
    }
  });
</script>

<div class="activity-tab">
  <header class="activity-header">
    <h2>Activity History</h2>
    <p class="subtitle">Your recent activity in TKA Studio</p>
  </header>

  <!-- Current Session -->
  {#if currentSessionId}
    <div class="current-session">
      <div class="session-indicator">
        <span class="live-dot"></span>
        <span>Current Session</span>
      </div>
      <span class="session-duration">{formatDuration(currentSessionDuration)}</span>
    </div>
  {/if}

  <!-- Date Filter -->
  <div class="filter-bar">
    <button
      class:active={dateFilter === "today"}
      onclick={() => (dateFilter = "today")}
    >
      Today
    </button>
    <button
      class:active={dateFilter === "week"}
      onclick={() => (dateFilter = "week")}
    >
      This Week
    </button>
    <button
      class:active={dateFilter === "month"}
      onclick={() => (dateFilter = "month")}
    >
      This Month
    </button>
    <button
      class:active={dateFilter === "all"}
      onclick={() => (dateFilter = "all")}
    >
      All Time
    </button>
  </div>

  <!-- Content -->
  <div class="activity-content">
    {#if isLoading}
      <div class="loading">
        <div class="spinner"></div>
        <span>Loading activity...</span>
      </div>
    {:else if error}
      <div class="error">
        <i class="fas fa-exclamation-circle"></i>
        <span>{error}</span>
      </div>
    {:else if groupedSessions.size === 0}
      <div class="empty">
        <i class="fas fa-history"></i>
        <span>No activity found</span>
        <p>Your activity will appear here as you use the app</p>
      </div>
    {:else}
      <div class="sessions-list">
        {#each [...groupedSessions.entries()] as [sessionId, sessionEvents]}
          <SessionCard
            {sessionId}
            events={sessionEvents}
            isCurrentSession={sessionId === currentSessionId}
          />
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .activity-tab {
    display: flex;
    flex-direction: column;
    gap: var(--settings-section-gap, 1.25rem);
    padding: var(--settings-content-padding, 1.5rem);
    height: 100%;
    overflow-y: auto;
  }

  .activity-header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .activity-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--theme-text, #fff);
  }

  .subtitle {
    margin: 0;
    font-size: 0.875rem;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.6));
  }

  .current-session {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--semantic-success, #22c55e);
    border-radius: var(--settings-radius-md, 0.75rem);
  }

  .session-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--semantic-success, #22c55e);
    font-weight: 500;
  }

  .live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--semantic-success, #22c55e);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .session-duration {
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.6));
    font-family: monospace;
  }

  .filter-bar {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .filter-bar button {
    padding: 0.5rem 1rem;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    background: transparent;
    border-radius: var(--settings-radius-sm, 0.5rem);
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.6));
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.875rem;
  }

  .filter-bar button:hover {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    color: var(--theme-text, #fff);
  }

  .filter-bar button.active {
    background: var(--theme-accent, #6366f1);
    border-color: var(--theme-accent, #6366f1);
    color: #fff;
  }

  .activity-content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .loading,
  .error,
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 3rem;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.6));
    text-align: center;
  }

  .loading .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-top-color: var(--theme-accent, #6366f1);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error {
    color: var(--semantic-error, #ef4444);
  }

  .error i,
  .empty i {
    font-size: 2rem;
    opacity: 0.5;
  }

  .empty p {
    margin: 0;
    font-size: 0.875rem;
    opacity: 0.7;
  }

  .sessions-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>

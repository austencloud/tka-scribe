<!-- SessionCard.svelte - Displays a session with its activity events -->
<script lang="ts">
  import type { ActivityEvent } from "../../../../analytics/domain/models/ActivityEvent";

  interface Props {
    sessionId: string;
    events: ActivityEvent[];
    isCurrentSession?: boolean;
  }

  let { sessionId, events, isCurrentSession = false }: Props = $props();

  let isExpanded = $state(isCurrentSession);

  // Get session start time (earliest event)
  const sessionStart = $derived(() => {
    if (events.length === 0) return null;
    const sorted = [...events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    return sorted[0]?.timestamp ?? null;
  });

  // Get session end time (latest event)
  const sessionEnd = $derived(() => {
    if (events.length === 0) return null;
    const sorted = [...events].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return sorted[0]?.timestamp ?? null;
  });

  // Calculate duration
  const duration = $derived(() => {
    const start = sessionStart();
    const end = sessionEnd();
    if (!start || !end) return 0;
    return end.getTime() - start.getTime();
  });

  function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m`;
    }
    return `< 1m`;
  }

  function formatDate(date: Date | null): string {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function getEventIcon(eventType: string): string {
    const icons: Record<string, string> = {
      session_start: "fa-play-circle",
      session_end: "fa-stop-circle",
      module_view: "fa-eye",
      sequence_create: "fa-plus-circle",
      sequence_save: "fa-save",
      sequence_delete: "fa-trash",
      sequence_edit: "fa-edit",
      sequence_view: "fa-eye",
      sequence_play: "fa-play",
      sequence_generate: "fa-magic",
      sequence_share: "fa-share-alt",
      sequence_export: "fa-download",
      link_copy: "fa-link",
      achievement_unlock: "fa-trophy",
      xp_earn: "fa-star",
      level_up: "fa-level-up-alt",
      setting_change: "fa-cog",
    };
    return icons[eventType] ?? "fa-circle";
  }

  function getEventLabel(event: ActivityEvent): string {
    const labels: Record<string, string> = {
      session_start: "Session started",
      session_end: "Session ended",
      module_view: `Viewed ${event.metadata?.module ?? "page"}`,
      sequence_create: "Created sequence",
      sequence_save: "Saved sequence",
      sequence_delete: "Deleted sequence",
      sequence_edit: "Edited sequence",
      sequence_view: "Viewed sequence",
      sequence_play: "Played animation",
      sequence_generate: "Generated sequence",
      sequence_share: "Shared sequence",
      sequence_export: "Exported sequence",
      link_copy: "Copied link",
      achievement_unlock: `Unlocked ${event.metadata?.achievementId ?? "achievement"}`,
      xp_earn: `Earned ${event.metadata?.xpAmount ?? ""} XP`,
      level_up: `Reached level ${event.metadata?.newLevel ?? ""}`,
      setting_change: `Changed ${event.metadata?.settingKey ?? "setting"}`,
    };
    return labels[event.eventType] ?? event.eventType;
  }
</script>

<div class="session-card" class:current={isCurrentSession}>
  <button
    class="session-header"
    onclick={() => (isExpanded = !isExpanded)}
  >
    <div class="session-info">
      {#if isCurrentSession}
        <span class="current-badge">
          <span class="live-dot"></span>
          Current
        </span>
      {/if}
      <span class="session-date">{formatDate(sessionStart())}</span>
    </div>
    <div class="session-meta">
      <span class="event-count">{events.length} events</span>
      <span class="session-duration">{formatDuration(duration())}</span>
      <i class="fas fa-chevron-{isExpanded ? 'up' : 'down'}"></i>
    </div>
  </button>

  {#if isExpanded}
    <div class="events-list">
      {#each events as event}
        <div class="event-item">
          <div class="event-icon">
            <i class="fas {getEventIcon(event.eventType)}"></i>
          </div>
          <div class="event-details">
            <span class="event-label">{getEventLabel(event)}</span>
            <span class="event-time">{formatTime(event.timestamp)}</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .session-card {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: var(--settings-radius-md, 0.75rem);
    overflow: hidden;
  }

  .session-card.current {
    border-color: var(--semantic-success, #22c55e);
  }

  .session-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 1rem;
    background: transparent;
    border: none;
    color: var(--theme-text, #fff);
    cursor: pointer;
    transition: background 0.2s;
  }

  .session-header:hover {
    background: var(--theme-panel-bg, rgba(255, 255, 255, 0.02));
  }

  .session-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .current-badge {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.5rem;
    background: var(--semantic-success, #22c55e);
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    color: #fff;
  }

  .live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #fff;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .session-date {
    font-weight: 500;
  }

  .session-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.6));
    font-size: 0.875rem;
  }

  .event-count {
    padding: 0.25rem 0.5rem;
    background: var(--theme-panel-bg, rgba(255, 255, 255, 0.02));
    border-radius: 9999px;
    font-size: 0.75rem;
  }

  .session-duration {
    font-family: monospace;
  }

  .events-list {
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    padding: 0.5rem;
    max-height: 300px;
    overflow-y: auto;
  }

  .event-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: var(--settings-radius-sm, 0.5rem);
    transition: background 0.2s;
  }

  .event-item:hover {
    background: var(--theme-panel-bg, rgba(255, 255, 255, 0.02));
  }

  .event-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: var(--theme-panel-bg, rgba(255, 255, 255, 0.02));
    border-radius: 50%;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.6));
    font-size: 0.75rem;
  }

  .event-details {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  .event-label {
    font-size: 0.875rem;
    color: var(--theme-text, #fff);
  }

  .event-time {
    font-size: 0.75rem;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.6));
    font-family: monospace;
  }
</style>

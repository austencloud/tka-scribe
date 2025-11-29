<script lang="ts">
  /**
   * Daily Challenge Scheduler
   * Admin tool for scheduling and managing daily challenges
   */

  import { onMount } from "svelte";
  import type { IAdminChallengeService } from "../services/contracts";
  import type {
    ChallengeScheduleEntry,
    ChallengeFormData,
  } from "../domain/models";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import {
    SchedulerStatsGrid,
    SchedulerCalendarView,
    SchedulerTimelineView,
    ChallengeFormPanel,
  } from "./challenge-scheduler";

  interface Props {
    adminChallengeService: IAdminChallengeService;
  }

  let { adminChallengeService }: Props = $props();

  // State
  let isLoading = $state(true);
  let scheduleEntries = $state<ChallengeScheduleEntry[]>([]);
  let userSequences = $state<SequenceData[]>([]);
  let selectedDate = $state<string | null>(null);
  let showCreationPanel = $state(false);
  let currentMonth = $state(new Date());
  let viewMode = $state<"calendar" | "timeline">("calendar");

  // Derived
  const stats = $derived.by(() => {
    const today = new Date().toISOString().split("T")[0] ?? "";
    const scheduled = scheduleEntries.filter((e) => e.isScheduled);
    const upcoming = scheduled.filter((e) => e.date >= today);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const thisWeek = scheduled.filter((e) => {
      return (
        e.date >= (weekStart.toISOString().split("T")[0] ?? "") &&
        e.date <= (weekEnd.toISOString().split("T")[0] ?? "")
      );
    });

    return {
      total: scheduled.length,
      upcoming: upcoming.length,
      thisWeek: thisWeek.length,
      unscheduled: scheduleEntries.length - scheduled.length,
    };
  });

  const calendarDays = $derived.by(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();

    interface CalendarDay {
      date: string;
      day: number;
      isCurrentMonth: boolean;
      entry?: ChallengeScheduleEntry;
    }

    const days: CalendarDay[] = [];

    // Previous month padding
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      const dateStr = date.toISOString().split("T")[0] ?? "";
      days.push({
        date: dateStr,
        day: date.getDate(),
        isCurrentMonth: false,
        entry: scheduleEntries.find((e) => e.date === dateStr),
      });
    }

    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().split("T")[0] ?? "";
      days.push({
        date: dateStr,
        day: d,
        isCurrentMonth: true,
        entry: scheduleEntries.find((e) => e.date === dateStr),
      });
    }

    // Next month padding (fill to 42 cells for 6 rows)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      const dateStr = date.toISOString().split("T")[0] ?? "";
      days.push({
        date: dateStr,
        day: i,
        isCurrentMonth: false,
        entry: scheduleEntries.find((e) => e.date === dateStr),
      });
    }

    return days;
  });

  const upcomingChallenges = $derived.by(() => {
    const today = new Date().toISOString().split("T")[0] ?? "";
    return scheduleEntries
      .filter((e) => e.isScheduled && e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 7);
  });

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    isLoading = true;
    try {
      // Calculate date range: 1 month ago to 2 months ahead
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setDate(1);

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 2);
      endDate.setDate(0);

      const [entries, sequences] = await Promise.all([
        adminChallengeService.getScheduledChallenges(startDate, endDate),
        adminChallengeService.getUserSequences(),
      ]);
      scheduleEntries = entries;
      userSequences = sequences;
    } catch (error) {
      console.error("Failed to load scheduler data:", error);
    } finally {
      isLoading = false;
    }
  }

  function handleDateSelect(date: string) {
    selectedDate = date;
    showCreationPanel = true;
  }

  function handleClosePanel() {
    selectedDate = null;
    showCreationPanel = false;
  }

  function navigateMonth(delta: number) {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + delta);
    currentMonth = newMonth;
  }

  function goToToday() {
    currentMonth = new Date();
  }

  async function handleScheduleChallenge(data: {
    sequenceId: string;
    title: string;
    description: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    xpReward: number;
  }) {
    if (!selectedDate) return;

    try {
      const sequence = userSequences.find((s) => s.id === data.sequenceId);
      if (!sequence) return;

      const formData: ChallengeFormData = {
        date: selectedDate,
        sequenceId: data.sequenceId,
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        xpReward: data.xpReward,
        type: "build_sequence",
        target: 1,
        metadata: {
          sequenceId: data.sequenceId,
          sequenceName: sequence.name,
        },
      };

      await adminChallengeService.createChallenge(formData);
      await loadData();
      handleClosePanel();
    } catch (error) {
      console.error("Failed to schedule challenge:", error);
      alert("Failed to schedule challenge. Please try again.");
    }
  }

  async function handleDeleteChallenge(challengeId: string) {
    if (!confirm("Are you sure you want to delete this challenge?")) return;

    try {
      await adminChallengeService.deleteChallenge(challengeId);
      await loadData();
    } catch (error) {
      console.error("Failed to delete challenge:", error);
      alert("Failed to delete challenge. Please try again.");
    }
  }
</script>

<div class="scheduler">
  {#if isLoading}
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading challenge data...</p>
    </div>
  {:else}
    <SchedulerStatsGrid {stats} />

    <div class="main-content">
      <div class="calendar-panel">
        <div class="panel-header">
          <div class="view-toggle">
            <button
              class="toggle-btn"
              class:active={viewMode === "calendar"}
              onclick={() => (viewMode = "calendar")}
            >
              <i class="fas fa-calendar-alt"></i>
              Calendar
            </button>
            <button
              class="toggle-btn"
              class:active={viewMode === "timeline"}
              onclick={() => (viewMode = "timeline")}
            >
              <i class="fas fa-list"></i>
              Timeline
            </button>
          </div>
        </div>

        {#if viewMode === "calendar"}
          <SchedulerCalendarView
            {calendarDays}
            {currentMonth}
            {selectedDate}
            onDateSelect={handleDateSelect}
            onNavigateMonth={navigateMonth}
            onGoToToday={goToToday}
          />
        {:else}
          <SchedulerTimelineView
            {upcomingChallenges}
            onDeleteChallenge={handleDeleteChallenge}
            onSwitchToCalendar={() => (viewMode = "calendar")}
          />
        {/if}
      </div>

      <ChallengeFormPanel
        {selectedDate}
        showPanel={showCreationPanel}
        sequences={userSequences}
        onClose={handleClosePanel}
        onSchedule={handleScheduleChallenge}
      />
    </div>
  {/if}
</div>

<style>
  .scheduler {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1.5rem;
    gap: 1.5rem;
    overflow-y: auto;
    max-width: 1600px;
    margin: 0 auto;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    gap: 1rem;
    opacity: 0.6;
  }

  .loading-state i {
    font-size: 2.5rem;
  }

  .main-content {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 1.5rem;
    flex: 1;
    min-height: 0;
  }

  .calendar-panel {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .view-toggle {
    display: flex;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 4px;
  }

  .toggle-btn {
    padding: 0.5rem 1rem;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }

  .toggle-btn.active {
    background: rgba(102, 126, 234, 0.3);
    color: #fff;
  }

  .toggle-btn:hover:not(.active) {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  @media (max-width: 1024px) {
    .main-content {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .scheduler {
      padding: 1rem;
    }
  }
</style>

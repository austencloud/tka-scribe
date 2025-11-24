<script lang="ts">
  /**
   * Daily Challenge Scheduler
   *
   * Admin tool for scheduling and managing daily challenges
   * Features:
   * - Stats overview
   * - Calendar with month navigation
   * - Scheduled challenges timeline
   * - Challenge creation/editing
   */

  import { onMount } from "svelte";
  import type { IAdminChallengeService } from "../services/contracts";
  import type {
    ChallengeScheduleEntry,
    ChallengeFormData,
  } from "../domain/models";
  import type { SequenceData } from "$shared";

  // Props
  let {
    adminChallengeService,
  }: { adminChallengeService: IAdminChallengeService } = $props();

  // State
  let isLoading = $state(true);
  let scheduleEntries = $state<ChallengeScheduleEntry[]>([]);
  let userSequences = $state<SequenceData[]>([]);
  let selectedDate = $state<string | null>(null);
  let selectedSequence = $state<SequenceData | null>(null);
  let showCreationPanel = $state(false);
  let searchQuery = $state("");

  // Calendar state
  let currentMonth = $state(new Date());
  let viewMode = $state<"calendar" | "timeline">("calendar");

  // Form state
  let customTitle = $state("");
  let customDescription = $state("");
  let customDifficulty = $state<"beginner" | "intermediate" | "advanced">("intermediate");
  let customXP = $state(50);

  // Derived stats
  const stats = $derived.by(() => {
    const today = new Date().toISOString().split("T")[0] ?? "";
    const scheduled = scheduleEntries.filter((e) => e.isScheduled);
    const upcoming = scheduled.filter((e) => e.date >= today);
    const thisWeek = scheduled.filter((e) => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return e.date >= (weekStart.toISOString().split("T")[0] ?? "") &&
             e.date <= (weekEnd.toISOString().split("T")[0] ?? "");
    });
    return {
      total: scheduled.length,
      upcoming: upcoming.length,
      thisWeek: thisWeek.length,
      unscheduled: scheduleEntries.length - scheduled.length,
    };
  });

  // Calendar helpers
  const calendarDays = $derived.by(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();

    const days: { date: string; day: number; isCurrentMonth: boolean; entry?: ChallengeScheduleEntry }[] = [];

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

  const monthName = $derived(
    currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  );

  const upcomingChallenges = $derived.by(() => {
    const today = new Date().toISOString().split("T")[0] ?? "";
    return scheduleEntries
      .filter((e) => e.isScheduled && e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 7);
  });

  const filteredSequences = $derived.by(() => {
    if (!searchQuery) return userSequences;
    const query = searchQuery.toLowerCase();
    return userSequences.filter(
      (seq) =>
        seq.name.toLowerCase().includes(query) ||
        seq.word.toLowerCase().includes(query)
    );
  });

  // Date range for loading (3 months: 1 past, 2 future)
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);
  startDate.setDate(1);
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 2);
  endDate.setDate(0);

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    isLoading = true;
    try {
      const [entries, sequences] = await Promise.all([
        adminChallengeService.getScheduledChallenges(startDate, endDate),
        adminChallengeService.getUserSequences(),
      ]);

      scheduleEntries = entries;
      userSequences = sequences;
    } catch (error) {
      console.error("❌ Failed to load scheduler data:", error);
    } finally {
      isLoading = false;
    }
  }

  function isToday(dateStr: string): boolean {
    const today = new Date().toISOString().split("T")[0] ?? "";
    return dateStr === today;
  }

  function isPast(dateStr: string): boolean {
    const today = new Date().toISOString().split("T")[0] ?? "";
    return dateStr < today;
  }

  function navigateMonth(delta: number) {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + delta);
    currentMonth = newMonth;
  }

  function goToToday() {
    currentMonth = new Date();
  }

  function handleDateSelect(date: string) {
    selectedDate = date;
    selectedSequence = null;
    showCreationPanel = true;
    // Reset form
    customTitle = "";
    customDescription = "";
    customDifficulty = "intermediate";
    customXP = 50;
  }

  function handleSequenceSelect(sequence: SequenceData) {
    selectedSequence = sequence;
    if (!customTitle) {
      customTitle = `Daily Challenge: ${sequence.name}`;
    }
    if (!customDescription) {
      customDescription = `Complete this sequence to earn XP!`;
    }
  }

  async function handleScheduleChallenge() {
    if (!selectedDate || !selectedSequence) return;

    try {
      const formData: ChallengeFormData = {
        date: selectedDate,
        sequenceId: selectedSequence.id,
        title: customTitle || `Daily Challenge: ${selectedSequence.name}`,
        description: customDescription || `Complete this sequence to earn XP!`,
        difficulty: customDifficulty,
        xpReward: customXP,
        type: "build_sequence",
        target: 1,
        metadata: {
          sequenceId: selectedSequence.id,
          sequenceName: selectedSequence.name,
        },
      };

      await adminChallengeService.createChallenge(formData);
      await loadData();
      handleClosePanel();
      console.log("✅ Challenge scheduled successfully!");
    } catch (error) {
      console.error("❌ Failed to schedule challenge:", error);
      alert("Failed to schedule challenge. Please try again.");
    }
  }

  function handleClosePanel() {
    selectedDate = null;
    selectedSequence = null;
    showCreationPanel = false;
    searchQuery = "";
    customTitle = "";
    customDescription = "";
    customDifficulty = "intermediate";
    customXP = 50;
  }

  async function handleDeleteChallenge(challengeId: string) {
    if (!confirm("Are you sure you want to delete this challenge?")) return;

    try {
      await adminChallengeService.deleteChallenge(challengeId);
      await loadData();
      console.log("✅ Challenge deleted successfully!");
    } catch (error) {
      console.error("❌ Failed to delete challenge:", error);
      alert("Failed to delete challenge. Please try again.");
    }
  }

  function formatDateShort(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  function getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case "beginner": return "#4ade80";
      case "intermediate": return "#fbbf24";
      case "advanced": return "#f87171";
      default: return "#94a3b8";
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
    <!-- Stats Overview -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(102, 126, 234, 0.2); color: #667eea;">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{stats.total}</span>
          <span class="stat-label">Total Scheduled</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(74, 222, 128, 0.2); color: #4ade80;">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{stats.upcoming}</span>
          <span class="stat-label">Upcoming</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(251, 191, 36, 0.2); color: #fbbf24;">
          <i class="fas fa-calendar-week"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{stats.thisWeek}</span>
          <span class="stat-label">This Week</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(148, 163, 184, 0.2); color: #94a3b8;">
          <i class="fas fa-plus-circle"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{stats.unscheduled}</span>
          <span class="stat-label">Open Slots</span>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Left Panel: Calendar/Timeline -->
      <div class="calendar-panel">
        <!-- View Toggle & Navigation -->
        <div class="panel-header">
          <div class="view-toggle">
            <button
              class="toggle-btn"
              class:active={viewMode === "calendar"}
              onclick={() => viewMode = "calendar"}
            >
              <i class="fas fa-calendar-alt"></i>
              Calendar
            </button>
            <button
              class="toggle-btn"
              class:active={viewMode === "timeline"}
              onclick={() => viewMode = "timeline"}
            >
              <i class="fas fa-list"></i>
              Timeline
            </button>
          </div>
        </div>

        {#if viewMode === "calendar"}
          <!-- Calendar View -->
          <div class="calendar-container">
            <div class="calendar-nav">
              <button class="nav-btn" onclick={() => navigateMonth(-1)}>
                <i class="fas fa-chevron-left"></i>
              </button>
              <div class="month-display">
                <span class="month-name">{monthName}</span>
                <button class="today-btn" onclick={goToToday}>Today</button>
              </div>
              <button class="nav-btn" onclick={() => navigateMonth(1)}>
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>

            <div class="calendar-grid">
              <div class="weekday-header">
                {#each ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as day}
                  <div class="weekday">{day}</div>
                {/each}
              </div>
              <div class="days-grid">
                {#each calendarDays as day (day.date)}
                  <button
                    class="calendar-day"
                    class:other-month={!day.isCurrentMonth}
                    class:today={isToday(day.date)}
                    class:past={isPast(day.date)}
                    class:scheduled={day.entry?.isScheduled}
                    class:selected={selectedDate === day.date}
                    onclick={() => handleDateSelect(day.date)}
                  >
                    <span class="day-number">{day.day}</span>
                    {#if day.entry?.isScheduled}
                      <div class="scheduled-dot"></div>
                    {/if}
                  </button>
                {/each}
              </div>
            </div>
          </div>
        {:else}
          <!-- Timeline View -->
          <div class="timeline-container">
            <h3 class="timeline-title">
              <i class="fas fa-stream"></i>
              Upcoming Challenges
            </h3>
            {#if upcomingChallenges.length === 0}
              <div class="empty-timeline">
                <i class="fas fa-calendar-times"></i>
                <p>No upcoming challenges scheduled</p>
                <button class="add-challenge-btn" onclick={() => viewMode = "calendar"}>
                  <i class="fas fa-plus"></i>
                  Schedule a Challenge
                </button>
              </div>
            {:else}
              <div class="timeline-list">
                {#each upcomingChallenges as entry (entry.date)}
                  <div class="timeline-item" class:today={isToday(entry.date)}>
                    <div class="timeline-date">
                      <span class="date-day">{new Date(entry.date).getDate()}</span>
                      <span class="date-month">{new Date(entry.date).toLocaleDateString("en-US", { month: "short" })}</span>
                      {#if isToday(entry.date)}
                        <span class="today-badge">Today</span>
                      {/if}
                    </div>
                    <div class="timeline-content">
                      <h4>{entry.challenge?.title ?? "Untitled Challenge"}</h4>
                      <p>{entry.challenge?.description ?? ""}</p>
                      <div class="timeline-meta">
                        <span class="difficulty-badge" style="color: {getDifficultyColor(entry.challenge?.difficulty ?? '')}">
                          {entry.challenge?.difficulty ?? "intermediate"}
                        </span>
                        <span class="xp-badge">
                          <i class="fas fa-star"></i>
                          {entry.challenge?.xpReward ?? 50} XP
                        </span>
                      </div>
                    </div>
                    <button
                      class="timeline-delete"
                      onclick={() => entry.challenge && handleDeleteChallenge(entry.challenge.id)}
                      aria-label="Delete challenge"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Right Panel: Creation/Details -->
      <div class="detail-panel" class:active={showCreationPanel}>
        {#if showCreationPanel && selectedDate}
          <div class="creation-form">
            <div class="form-header">
              <h3>
                <i class="fas fa-plus-circle"></i>
                Schedule Challenge
              </h3>
              <button class="close-btn" onclick={handleClosePanel}>
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="date-display">
              <i class="fas fa-calendar"></i>
              {formatDateShort(selectedDate)}
            </div>

            <!-- Sequence Selection -->
            <div class="form-section">
              <label class="section-label">Select Sequence</label>
              <div class="search-box">
                <i class="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search sequences..."
                  bind:value={searchQuery}
                />
              </div>
              <div class="sequence-grid">
                {#each filteredSequences.slice(0, 8) as sequence (sequence.id)}
                  <button
                    class="sequence-card"
                    class:selected={selectedSequence?.id === sequence.id}
                    onclick={() => handleSequenceSelect(sequence)}
                  >
                    <div class="sequence-icon">
                      <i class="fas fa-layer-group"></i>
                    </div>
                    <div class="sequence-info">
                      <span class="sequence-name">{sequence.name}</span>
                      <span class="sequence-beats">{sequence.beats?.length ?? 0} beats</span>
                    </div>
                    {#if selectedSequence?.id === sequence.id}
                      <i class="fas fa-check-circle selected-check"></i>
                    {/if}
                  </button>
                {/each}
              </div>
              {#if filteredSequences.length > 8}
                <p class="more-sequences">+{filteredSequences.length - 8} more sequences</p>
              {/if}
            </div>

            {#if selectedSequence}
              <!-- Challenge Details Form -->
              <div class="form-section">
                <label class="section-label">Challenge Details</label>

                <div class="form-group">
                  <label for="title">Title</label>
                  <input
                    id="title"
                    type="text"
                    bind:value={customTitle}
                    placeholder="Daily Challenge: Sequence Name"
                  />
                </div>

                <div class="form-group">
                  <label for="description">Description</label>
                  <textarea
                    id="description"
                    bind:value={customDescription}
                    placeholder="Complete this sequence to earn XP!"
                    rows="2"
                  ></textarea>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="difficulty">Difficulty</label>
                    <select id="difficulty" bind:value={customDifficulty}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="xp">XP Reward</label>
                    <input
                      id="xp"
                      type="number"
                      bind:value={customXP}
                      min="10"
                      max="500"
                      step="10"
                    />
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="form-actions">
                <button class="cancel-btn" onclick={handleClosePanel}>
                  Cancel
                </button>
                <button class="schedule-btn" onclick={handleScheduleChallenge}>
                  <i class="fas fa-check"></i>
                  Schedule Challenge
                </button>
              </div>
            {/if}
          </div>
        {:else}
          <div class="empty-detail">
            <div class="empty-icon">
              <i class="fas fa-mouse-pointer"></i>
            </div>
            <h3>Select a Date</h3>
            <p>Click on a date in the calendar to schedule a new challenge</p>
          </div>
        {/if}
      </div>
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

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }

  .stat-card {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.2s ease;
  }

  .stat-card:hover {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: 700;
  }

  .stat-label {
    font-size: 0.85rem;
    opacity: 0.6;
  }

  /* Main Content */
  .main-content {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 1.5rem;
    flex: 1;
    min-height: 0;
  }

  /* Calendar Panel */
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

  /* Calendar */
  .calendar-container {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .calendar-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .nav-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .nav-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .month-display {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .month-name {
    font-size: 1.25rem;
    font-weight: 600;
  }

  .today-btn {
    padding: 0.35rem 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: transparent;
    color: rgba(255, 255, 255, 0.8);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.2s ease;
  }

  .today-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .calendar-grid {
    flex: 1;
  }

  .weekday-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 8px;
  }

  .weekday {
    text-align: center;
    font-size: 0.8rem;
    font-weight: 600;
    opacity: 0.5;
    padding: 0.5rem;
  }

  .days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .calendar-day {
    aspect-ratio: 1;
    border: 1px solid transparent;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: #fff;
    transition: all 0.15s ease;
    position: relative;
  }

  .calendar-day:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .calendar-day.other-month {
    opacity: 0.3;
  }

  .calendar-day.past:not(.today) {
    opacity: 0.5;
  }

  .calendar-day.today {
    background: rgba(255, 215, 0, 0.15);
    border-color: rgba(255, 215, 0, 0.4);
  }

  .calendar-day.today .day-number {
    color: #ffd700;
    font-weight: 700;
  }

  .calendar-day.scheduled {
    background: rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.4);
  }

  .calendar-day.selected {
    background: rgba(102, 126, 234, 0.4);
    border-color: rgba(102, 126, 234, 0.8);
    transform: scale(1.05);
  }

  .day-number {
    font-size: 0.95rem;
    font-weight: 500;
  }

  .scheduled-dot {
    width: 6px;
    height: 6px;
    background: #4ade80;
    border-radius: 50%;
    position: absolute;
    bottom: 6px;
  }

  /* Timeline */
  .timeline-container {
    flex: 1;
    overflow-y: auto;
  }

  .timeline-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
  }

  .empty-timeline {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    gap: 1rem;
    opacity: 0.6;
  }

  .empty-timeline i {
    font-size: 3rem;
  }

  .add-challenge-btn {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    transition: all 0.2s ease;
  }

  .add-challenge-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .timeline-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .timeline-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    transition: all 0.2s ease;
  }

  .timeline-item:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
  }

  .timeline-item.today {
    border-color: rgba(255, 215, 0, 0.4);
    background: rgba(255, 215, 0, 0.05);
  }

  .timeline-date {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 60px;
  }

  .date-day {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1;
  }

  .date-month {
    font-size: 0.75rem;
    opacity: 0.6;
    text-transform: uppercase;
  }

  .today-badge {
    background: rgba(255, 215, 0, 0.3);
    color: #ffd700;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    font-size: 0.65rem;
    font-weight: bold;
    margin-top: 4px;
  }

  .timeline-content {
    flex: 1;
  }

  .timeline-content h4 {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .timeline-content p {
    margin: 0 0 0.5rem 0;
    font-size: 0.85rem;
    opacity: 0.7;
  }

  .timeline-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.8rem;
  }

  .difficulty-badge {
    text-transform: capitalize;
    font-weight: 500;
  }

  .xp-badge {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    color: #fbbf24;
  }

  .timeline-delete {
    width: 32px;
    height: 32px;
    border: none;
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.2s ease;
  }

  .timeline-item:hover .timeline-delete {
    opacity: 1;
  }

  .timeline-delete:hover {
    background: rgba(239, 68, 68, 0.2);
  }

  /* Detail Panel */
  .detail-panel {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .empty-detail {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
    opacity: 0.5;
  }

  .empty-icon {
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .empty-detail h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
  }

  .empty-detail p {
    margin: 0;
    font-size: 0.9rem;
    max-width: 200px;
  }

  /* Creation Form */
  .creation-form {
    flex: 1;
    padding: 1.25rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .form-header h3 {
    margin: 0;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .date-display {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: rgba(102, 126, 234, 0.15);
    border: 1px solid rgba(102, 126, 234, 0.3);
    border-radius: 8px;
    font-weight: 500;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .section-label {
    font-size: 0.9rem;
    font-weight: 600;
    opacity: 0.8;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 0.6rem 0.85rem;
  }

  .search-box i {
    opacity: 0.5;
  }

  .search-box input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #fff;
    font-size: 0.9rem;
  }

  .search-box input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .sequence-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
  }

  .sequence-card {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    color: #fff;
    transition: all 0.15s ease;
  }

  .sequence-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .sequence-card.selected {
    background: rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.5);
  }

  .sequence-icon {
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  .sequence-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .sequence-name {
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sequence-beats {
    font-size: 0.7rem;
    opacity: 0.5;
  }

  .selected-check {
    color: #4ade80;
    flex-shrink: 0;
  }

  .more-sequences {
    margin: 0;
    font-size: 0.8rem;
    opacity: 0.5;
    text-align: center;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .form-group label {
    font-size: 0.85rem;
    opacity: 0.7;
  }

  .form-group input,
  .form-group textarea,
  .form-group select {
    padding: 0.6rem 0.85rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #fff;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }

  .form-group input:focus,
  .form-group textarea:focus,
  .form-group select:focus {
    outline: none;
    border-color: rgba(102, 126, 234, 0.5);
    background: rgba(255, 255, 255, 0.08);
  }

  .form-group textarea {
    resize: vertical;
    min-height: 60px;
    font-family: inherit;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .form-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: auto;
    padding-top: 1rem;
  }

  .cancel-btn,
  .schedule-btn {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.2s ease;
  }

  .cancel-btn {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  .cancel-btn:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .schedule-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .schedule-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  /* Scrollbar */
  .timeline-container::-webkit-scrollbar,
  .sequence-grid::-webkit-scrollbar,
  .creation-form::-webkit-scrollbar {
    width: 6px;
  }

  .timeline-container::-webkit-scrollbar-track,
  .sequence-grid::-webkit-scrollbar-track,
  .creation-form::-webkit-scrollbar-track {
    background: transparent;
  }

  .timeline-container::-webkit-scrollbar-thumb,
  .sequence-grid::-webkit-scrollbar-thumb,
  .creation-form::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
  }

  /* Mobile Responsive */
  @media (max-width: 1024px) {
    .main-content {
      grid-template-columns: 1fr;
    }

    .detail-panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      max-width: 400px;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      z-index: 100;
      border-radius: 0;
    }

    .detail-panel.active {
      transform: translateX(0);
    }
  }

  @media (max-width: 768px) {
    .scheduler {
      padding: 1rem;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .stat-card {
      padding: 1rem;
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      font-size: 1rem;
    }

    .stat-value {
      font-size: 1.5rem;
    }

    .calendar-day {
      font-size: 0.85rem;
    }

    .sequence-grid {
      grid-template-columns: 1fr;
    }

    .form-row {
      grid-template-columns: 1fr;
    }
  }
</style>

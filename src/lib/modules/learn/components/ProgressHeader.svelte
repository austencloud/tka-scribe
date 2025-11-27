<!--
ProgressHeader - Hero section with journey progress visualization

Shows:
- Circular progress ring with animated fill
- Current level/stage indicator
- Journey stats with icons
- Motivational message that changes based on progress
- Compact mode for inline display
-->
<script lang="ts">
  import type { LearningProgress } from "../domain";
  import { CONCEPT_CATEGORIES } from "../domain";

  let { progress, compact = false } = $props<{
    progress: LearningProgress;
    compact?: boolean;
  }>();

  // Calculate derived stats
  const completedCount = $derived(progress.completedConcepts.size);
  const totalConcepts = 28;
  const progressPercent = $derived(Math.round(progress.overallProgress));

  // SVG circle calculations
  const circleRadius = 54;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = $derived(
    circumference * (1 - progressPercent / 100)
  );

  // Determine current stage based on progress
  const getCurrentStage = (
    percent: number
  ): { name: string; icon: string; color: string } => {
    if (percent === 0) return { ...CONCEPT_CATEGORIES.foundation, name: "Newcomer" };
    if (percent < 25)
      return { ...CONCEPT_CATEGORIES.foundation, name: "Foundation" };
    if (percent < 50)
      return { ...CONCEPT_CATEGORIES.letters, name: "Letters" };
    if (percent < 75)
      return { ...CONCEPT_CATEGORIES.combinations, name: "Combinations" };
    if (percent < 100)
      return { ...CONCEPT_CATEGORIES.advanced, name: "Advanced" };
    return { name: "Master", icon: "🏆", color: "#FFD700" };
  };

  const currentStage = $derived(getCurrentStage(progressPercent));

  // Motivational messages based on progress
  const getMessage = (percent: number): string => {
    if (percent === 0) return "Your journey begins here";
    if (percent < 10) return "Every master was once a beginner";
    if (percent < 25) return "Building strong foundations";
    if (percent < 50) return "The alphabet reveals itself";
    if (percent < 75) return "Combining knowledge into flow";
    if (percent < 90) return "Approaching mastery";
    if (percent < 100) return "The final steps to mastery";
    return "You've achieved mastery!";
  };

  const message = $derived(getMessage(progressPercent));

  // Calculate estimated time remaining (rough estimate)
  const avgMinutesPerConcept = 12;
  const remainingConcepts = totalConcepts - completedCount;
  const estimatedMinutesRemaining = remainingConcepts * avgMinutesPerConcept;
  const estimatedHoursRemaining = Math.ceil(estimatedMinutesRemaining / 60);
</script>

<div class="progress-header" class:compact>
  {#if !compact}
    <!-- Full Hero Section -->
    <div class="hero-content">
      <!-- Left: Progress Ring -->
      <div class="progress-ring-container">
        <svg class="progress-ring" viewBox="0 0 120 120">
          <!-- Background gradient definition -->
          <defs>
            <linearGradient
              id="progressGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stop-color="#4A90E2" />
              <stop offset="50%" stop-color="#7B68EE" />
              <stop offset="100%" stop-color="#50C878" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <!-- Background track -->
          <circle
            class="progress-track"
            cx="60"
            cy="60"
            r={circleRadius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            stroke-width="8"
          />

          <!-- Progress arc -->
          <circle
            class="progress-arc"
            cx="60"
            cy="60"
            r={circleRadius}
            fill="none"
            stroke="url(#progressGradient)"
            stroke-width="8"
            stroke-linecap="round"
            stroke-dasharray={circumference}
            stroke-dashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
            filter="url(#glow)"
          />
        </svg>

        <!-- Center content -->
        <div class="ring-center">
          <span class="percentage-value">{progressPercent}</span>
          <span class="percentage-symbol">%</span>
        </div>

        <!-- Stage badge -->
        <div class="stage-badge" style="--stage-color: {currentStage.color}">
          <span class="stage-icon">{currentStage.icon}</span>
        </div>
      </div>

      <!-- Right: Stats and Message -->
      <div class="hero-info">
        <div class="stage-indicator">
          <span class="stage-label">Current Stage</span>
          <span class="stage-name" style="color: {currentStage.color}"
            >{currentStage.name}</span
          >
        </div>

        <p class="motivational-message">{message}</p>

        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-icon">📚</div>
            <div class="stat-content">
              <span class="stat-value">{completedCount}/{totalConcepts}</span>
              <span class="stat-label">Concepts</span>
            </div>
          </div>

          {#if progress.currentStreak > 0}
            <div class="stat-item">
              <div class="stat-icon">🔥</div>
              <div class="stat-content">
                <span class="stat-value">{progress.currentStreak}</span>
                <span class="stat-label">Day Streak</span>
              </div>
            </div>
          {/if}

          {#if remainingConcepts > 0}
            <div class="stat-item">
              <div class="stat-icon">⏱️</div>
              <div class="stat-content">
                <span class="stat-value"
                  >{estimatedHoursRemaining > 1
                    ? `~${estimatedHoursRemaining}h`
                    : `~${estimatedMinutesRemaining}m`}</span
                >
                <span class="stat-label">Remaining</span>
              </div>
            </div>
          {/if}

          {#if progress.badges.length > 0}
            <div class="stat-item">
              <div class="stat-icon">🏅</div>
              <div class="stat-content">
                <span class="stat-value">{progress.badges.length}</span>
                <span class="stat-label">Badges</span>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <!-- Compact Mode -->
    <div class="compact-content">
      <div class="compact-progress">
        <svg class="compact-ring" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            stroke-width="3"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="url(#progressGradient)"
            stroke-width="3"
            stroke-linecap="round"
            stroke-dasharray={2 * Math.PI * 16}
            stroke-dashoffset={2 * Math.PI * 16 * (1 - progressPercent / 100)}
            transform="rotate(-90 20 20)"
          />
          <defs>
            <linearGradient id="progressGradient">
              <stop offset="0%" stop-color="#4A90E2" />
              <stop offset="100%" stop-color="#7B68EE" />
            </linearGradient>
          </defs>
        </svg>
        <span class="compact-percent">{progressPercent}%</span>
      </div>
      <div class="compact-info">
        <span class="compact-stage" style="color: {currentStage.color}"
          >{currentStage.name}</span
        >
        <span class="compact-count">{completedCount}/{totalConcepts}</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .progress-header {
    position: relative;
    padding: 1.5rem;
    background: linear-gradient(
      135deg,
      rgba(74, 144, 226, 0.08) 0%,
      rgba(123, 104, 238, 0.08) 50%,
      rgba(80, 200, 120, 0.06) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    backdrop-filter: blur(16px);
    overflow: hidden;
  }

  /* Subtle animated background */
  .progress-header::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse at 30% 20%,
      rgba(74, 144, 226, 0.1) 0%,
      transparent 50%
    );
    opacity: 0.8;
    animation: pulse 4s ease-in-out infinite alternate;
  }

  @keyframes pulse {
    0% {
      opacity: 0.4;
      transform: scale(1);
    }
    100% {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }

  /* Hero layout */
  .hero-content {
    position: relative;
    display: flex;
    align-items: center;
    gap: 2rem;
    z-index: 1;
  }

  /* Progress ring */
  .progress-ring-container {
    position: relative;
    width: 140px;
    height: 140px;
    flex-shrink: 0;
  }

  .progress-ring {
    width: 100%;
    height: 100%;
    transform: rotate(0deg);
  }

  .progress-arc {
    transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .ring-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: baseline;
    justify-content: center;
  }

  .percentage-value {
    font-size: 2.25rem;
    font-weight: 800;
    background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
  }

  .percentage-symbol {
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    margin-left: 2px;
  }

  /* Stage badge */
  .stage-badge {
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 36px;
    height: 36px;
    background: rgba(0, 0, 0, 0.6);
    border: 2px solid var(--stage-color, #4a90e2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      0 0 12px rgba(0, 0, 0, 0.3),
      0 0 8px var(--stage-color);
  }

  .stage-icon {
    font-size: 1.125rem;
  }

  /* Hero info section */
  .hero-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  .stage-indicator {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stage-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 600;
  }

  .stage-name {
    font-size: 1.5rem;
    font-weight: 800;
    line-height: 1.2;
  }

  .motivational-message {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    font-style: italic;
    line-height: 1.4;
  }

  /* Stats row */
  .stats-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 0.25rem;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
  }

  .stat-icon {
    font-size: 1.125rem;
    line-height: 1;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .stat-value {
    font-size: 1rem;
    font-weight: 700;
    color: white;
    line-height: 1;
  }

  .stat-label {
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 500;
  }

  /* Compact mode */
  .progress-header.compact {
    padding: 0.75rem 1rem;
    border-radius: 12px;
  }

  .progress-header.compact::before {
    display: none;
  }

  .compact-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .compact-progress {
    position: relative;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
  }

  .compact-ring {
    width: 100%;
    height: 100%;
  }

  .compact-percent {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 0.625rem;
    font-weight: 700;
    color: white;
  }

  .compact-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .compact-stage {
    font-size: 0.875rem;
    font-weight: 700;
  }

  .compact-count {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .progress-header {
      padding: 1.25rem;
    }

    .hero-content {
      flex-direction: column;
      text-align: center;
      gap: 1.25rem;
    }

    .progress-ring-container {
      width: 120px;
      height: 120px;
    }

    .percentage-value {
      font-size: 1.875rem;
    }

    .stage-badge {
      width: 32px;
      height: 32px;
      bottom: 4px;
      right: 4px;
    }

    .stage-indicator {
      align-items: center;
    }

    .stage-name {
      font-size: 1.25rem;
    }

    .motivational-message {
      font-size: 0.9375rem;
    }

    .stats-row {
      justify-content: center;
    }
  }

  @media (max-width: 480px) {
    .progress-header {
      padding: 1rem;
      border-radius: 16px;
    }

    .progress-ring-container {
      width: 100px;
      height: 100px;
    }

    .percentage-value {
      font-size: 1.5rem;
    }

    .stage-badge {
      width: 28px;
      height: 28px;
    }

    .stage-icon {
      font-size: 0.875rem;
    }

    .stage-name {
      font-size: 1.125rem;
    }

    .motivational-message {
      font-size: 0.875rem;
    }

    .stat-item {
      padding: 0.375rem 0.5rem;
    }

    .stat-icon {
      font-size: 1rem;
    }

    .stat-value {
      font-size: 0.875rem;
    }

    .stat-label {
      font-size: 0.5625rem;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .progress-header::before {
      animation: none;
    }

    .progress-arc {
      transition: none;
    }
  }
</style>

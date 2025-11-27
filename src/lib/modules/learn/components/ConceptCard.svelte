<!--
ConceptCard - Modern interactive card for a single TKA concept

Displays:
- Visual status indicator with animated states
- Concept icon with category-colored background
- Progress indicator (ring or checkmark)
- Concept details with clean hierarchy
- Smooth micro-interactions
-->
<script lang="ts">
  import { resolve, TYPES, type IHapticFeedbackService } from "$shared";
  import type { ConceptProgress, ConceptStatus, LearnConcept } from "../domain";
  import { CONCEPT_CATEGORIES } from "../domain";

  let {
    concept,
    progress,
    status,
    onClick,
    showConnector = false,
  }: {
    concept: LearnConcept;
    progress?: ConceptProgress;
    status: ConceptStatus;
    onClick?: (concept: LearnConcept) => void;
    showConnector?: boolean;
  } = $props();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  const isClickable = $derived(status !== "locked");
  const percentComplete = $derived(progress?.percentComplete || 0);
  const categoryInfo = $derived(
    CONCEPT_CATEGORIES[concept.category as keyof typeof CONCEPT_CATEGORIES]
  );

  // Status display config with enhanced styling
  const statusConfig: Record<
    ConceptStatus,
    { icon: string; label: string; color: string; bgColor: string }
  > = {
    locked: {
      icon: "🔒",
      label: "Locked",
      color: "#6B7280",
      bgColor: "rgba(107, 114, 128, 0.1)",
    },
    available: {
      icon: "○",
      label: "Ready to Start",
      color: "#4A90E2",
      bgColor: "rgba(74, 144, 226, 0.1)",
    },
    "in-progress": {
      icon: "◐",
      label: "In Progress",
      color: "#7B68EE",
      bgColor: "rgba(123, 104, 238, 0.1)",
    },
    completed: {
      icon: "✓",
      label: "Mastered",
      color: "#50C878",
      bgColor: "rgba(80, 200, 120, 0.15)",
    },
  };

  const currentStatus = $derived(statusConfig[status as ConceptStatus]);

  // Progress ring calculations
  const ringRadius = 18;
  const circumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = $derived(
    circumference * (1 - percentComplete / 100)
  );

  function handleClick() {
    if (!isClickable) return;
    hapticService?.trigger("selection");
    onClick?.(concept);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  }
</script>

<div class="card-wrapper" class:show-connector={showConnector}>
  <!-- Connector line to next concept -->
  {#if showConnector}
    <div class="connector-line" style="--status-color: {currentStatus.color}">
      <div class="connector-dot"></div>
    </div>
  {/if}

  <button
    class="concept-card"
    class:locked={status === "locked"}
    class:available={status === "available"}
    class:in-progress={status === "in-progress"}
    class:completed={status === "completed"}
    class:clickable={isClickable}
    style="--status-color: {currentStatus.color}; --status-bg: {currentStatus.bgColor}; --category-color: {categoryInfo.color}"
    onclick={handleClick}
    onkeydown={handleKeydown}
    disabled={!isClickable}
    aria-label={`${concept.name} - ${currentStatus.label}`}
    tabindex={isClickable ? 0 : -1}
  >
    <!-- Status indicator / Progress ring -->
    <div class="status-indicator">
      {#if status === "completed"}
        <div class="completed-check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      {:else if status === "in-progress"}
        <svg class="progress-ring" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r={ringRadius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            stroke-width="3"
          />
          <circle
            class="progress-arc"
            cx="22"
            cy="22"
            r={ringRadius}
            fill="none"
            stroke={currentStatus.color}
            stroke-width="3"
            stroke-linecap="round"
            stroke-dasharray={circumference}
            stroke-dashoffset={strokeDashoffset}
            transform="rotate(-90 22 22)"
          />
        </svg>
        <span class="progress-percent">{Math.round(percentComplete)}%</span>
      {:else if status === "available"}
        <div class="available-indicator">
          <div class="pulse-ring"></div>
          <div class="inner-dot"></div>
        </div>
      {:else}
        <div class="locked-indicator">
          <span class="lock-icon">🔒</span>
        </div>
      {/if}
    </div>

    <!-- Main content -->
    <div class="card-content">
      <!-- Header row: icon + name -->
      <div class="card-header">
        <div class="concept-icon" style="background: linear-gradient(135deg, {categoryInfo.color}22, {categoryInfo.color}11)">
          <span>{concept.icon}</span>
        </div>
        <div class="title-group">
          <h3 class="concept-name">{concept.shortName}</h3>
          <span class="status-label">{currentStatus.label}</span>
        </div>
      </div>

      <!-- Description -->
      <p class="concept-description">{concept.description}</p>

      <!-- Footer: meta info -->
      <div class="card-footer">
        <div class="meta-tags">
          <span class="meta-tag time">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 14A6 6 0 1 1 8 2a6 6 0 0 1 0 12zm.5-9H7v5l4.25 2.5.75-1.25-3.5-2V5z"/>
            </svg>
            {concept.estimatedMinutes} min
          </span>
          {#if progress && progress.accuracy > 0}
            <span class="meta-tag accuracy">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.78 5.97l-4.5 5.5a.75.75 0 0 1-1.1.06l-2.25-2a.75.75 0 1 1 1-1.12l1.66 1.47 3.97-4.85a.75.75 0 1 1 1.16.94z"/>
              </svg>
              {Math.round(progress.accuracy)}%
            </span>
          {/if}
        </div>

        <!-- Arrow indicator -->
        {#if isClickable}
          <div class="arrow-indicator">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        {/if}
      </div>
    </div>
  </button>
</div>

<style>
  /* Wrapper for connector support */
  .card-wrapper {
    position: relative;
  }

  .card-wrapper.show-connector {
    padding-left: 28px;
  }

  /* Connector line between concepts */
  .connector-line {
    position: absolute;
    left: 10px;
    top: -8px;
    bottom: 50%;
    width: 2px;
    background: linear-gradient(
      to bottom,
      var(--status-color, rgba(255, 255, 255, 0.2)),
      rgba(255, 255, 255, 0.1)
    );
  }

  .connector-dot {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 8px;
    background: var(--status-color, rgba(255, 255, 255, 0.3));
    border-radius: 50%;
    box-shadow: 0 0 8px var(--status-color);
  }

  /* Main card */
  .concept-card {
    position: relative;
    display: flex;
    align-items: stretch;
    gap: 0;
    padding: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.04) 0%,
      rgba(255, 255, 255, 0.02) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;
    text-align: left;
    overflow: hidden;
    min-height: 88px;
  }

  /* Status indicator column */
  .status-indicator {
    position: relative;
    width: 56px;
    min-width: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--status-bg, rgba(255, 255, 255, 0.03));
    border-right: 1px solid rgba(255, 255, 255, 0.06);
  }

  /* Completed checkmark */
  .completed-check {
    width: 32px;
    height: 32px;
    background: var(--status-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 0 16px var(--status-color);
    animation: checkPop 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .completed-check svg {
    width: 18px;
    height: 18px;
  }

  @keyframes checkPop {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }

  /* Progress ring */
  .progress-ring {
    width: 44px;
    height: 44px;
  }

  .progress-arc {
    transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .progress-percent {
    position: absolute;
    font-size: 0.625rem;
    font-weight: 700;
    color: var(--status-color);
  }

  /* Available indicator with pulse */
  .available-indicator {
    position: relative;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pulse-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 2px solid var(--status-color);
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.3);
      opacity: 0;
    }
  }

  .inner-dot {
    width: 12px;
    height: 12px;
    background: var(--status-color);
    border-radius: 50%;
    box-shadow: 0 0 8px var(--status-color);
  }

  /* Locked indicator */
  .locked-indicator {
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lock-icon {
    font-size: 0.875rem;
    opacity: 0.6;
  }

  /* Card content */
  .card-content {
    flex: 1;
    min-width: 0;
    padding: 0.875rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .concept-icon {
    width: 36px;
    height: 36px;
    min-width: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    font-size: 1.25rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .title-group {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .concept-name {
    font-size: 1rem;
    font-weight: 700;
    color: white;
    margin: 0;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .status-label {
    font-size: 0.6875rem;
    color: var(--status-color);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .concept-description {
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-top: auto;
  }

  .meta-tags {
    display: flex;
    gap: 0.5rem;
  }

  .meta-tag {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 6px;
  }

  .meta-tag svg {
    width: 12px;
    height: 12px;
    opacity: 0.7;
  }

  .meta-tag.accuracy {
    color: var(--status-color);
    background: var(--status-bg);
  }

  .arrow-indicator {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.3);
    transition: all 0.25s ease;
  }

  .arrow-indicator svg {
    width: 18px;
    height: 18px;
  }

  /* Hover states */
  .concept-card.locked {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .concept-card.clickable:hover:not(.locked) {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.07) 0%,
      rgba(255, 255, 255, 0.04) 100%
    );
    border-color: var(--status-color);
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.2),
      0 0 0 1px var(--status-color) inset;
    transform: translateX(4px);
  }

  .concept-card.clickable:hover:not(.locked) .arrow-indicator {
    color: var(--status-color);
    transform: translateX(4px);
  }

  .concept-card.clickable:active:not(.locked) {
    transform: translateX(2px) scale(0.99);
    transition-duration: 0.1s;
  }

  /* Status-specific styling */
  .concept-card.available {
    border-color: rgba(74, 144, 226, 0.2);
  }

  .concept-card.in-progress {
    border-color: rgba(123, 104, 238, 0.2);
  }

  .concept-card.completed {
    border-color: rgba(80, 200, 120, 0.2);
  }

  .concept-card.completed .status-indicator {
    background: linear-gradient(
      135deg,
      rgba(80, 200, 120, 0.15) 0%,
      rgba(80, 200, 120, 0.05) 100%
    );
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .card-wrapper.show-connector {
      padding-left: 24px;
    }

    .connector-line {
      left: 8px;
    }

    .status-indicator {
      width: 48px;
      min-width: 48px;
    }

    .card-content {
      padding: 0.75rem;
    }

    .concept-icon {
      width: 32px;
      height: 32px;
      min-width: 32px;
      font-size: 1.125rem;
    }

    .concept-name {
      font-size: 0.9375rem;
    }

    .concept-description {
      font-size: 0.75rem;
    }

    .progress-ring {
      width: 38px;
      height: 38px;
    }

    .completed-check {
      width: 28px;
      height: 28px;
    }

    .completed-check svg {
      width: 16px;
      height: 16px;
    }
  }

  @media (max-width: 480px) {
    .card-wrapper.show-connector {
      padding-left: 20px;
    }

    .connector-line {
      left: 6px;
    }

    .concept-card {
      border-radius: 12px;
      min-height: 76px;
    }

    .status-indicator {
      width: 42px;
      min-width: 42px;
    }

    .card-content {
      padding: 0.625rem 0.75rem;
      gap: 0.375rem;
    }

    .card-header {
      gap: 0.5rem;
    }

    .concept-icon {
      width: 28px;
      height: 28px;
      min-width: 28px;
      font-size: 1rem;
      border-radius: 8px;
    }

    .concept-name {
      font-size: 0.875rem;
    }

    .status-label {
      font-size: 0.625rem;
    }

    .concept-description {
      -webkit-line-clamp: 1;
      line-clamp: 1;
      font-size: 0.6875rem;
    }

    .meta-tag {
      font-size: 0.625rem;
      padding: 0.1875rem 0.375rem;
    }

    .meta-tag svg {
      width: 10px;
      height: 10px;
    }

    .available-indicator {
      width: 24px;
      height: 24px;
    }

    .inner-dot {
      width: 10px;
      height: 10px;
    }

    .locked-indicator {
      width: 24px;
      height: 24px;
    }

    .lock-icon {
      font-size: 0.75rem;
    }

    .progress-ring {
      width: 32px;
      height: 32px;
    }

    .progress-percent {
      font-size: 0.5625rem;
    }

    .completed-check {
      width: 24px;
      height: 24px;
    }

    .completed-check svg {
      width: 14px;
      height: 14px;
    }

    .arrow-indicator {
      width: 20px;
      height: 20px;
    }

    .arrow-indicator svg {
      width: 14px;
      height: 14px;
    }
  }

  /* Accessibility */
  .concept-card:focus-visible {
    outline: 2px solid var(--status-color);
    outline-offset: 2px;
  }

  .concept-card[disabled] {
    cursor: not-allowed;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .concept-card,
    .arrow-indicator,
    .progress-arc,
    .pulse-ring {
      transition: none;
      animation: none;
    }
  }
</style>

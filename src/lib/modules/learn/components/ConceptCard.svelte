<!--
ConceptCard - Compact card for a single TKA concept

Displays:
- Left accent bar (status color)
- Concept icon
- Concept name
- Time estimate
- Checkmark for completed
-->
<script lang="ts">
  import { resolve, TYPES, type IHapticFeedbackService } from "$shared";
  import type { ConceptStatus, LearnConcept } from "../domain";

  let {
    concept,
    status,
    onClick,
  }: {
    concept: LearnConcept;
    status: ConceptStatus;
    onClick?: (concept: LearnConcept) => void;
  } = $props();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  const isClickable = $derived(status !== "locked");

  // Status colors
  const statusColors: Record<ConceptStatus, string> = {
    locked: "#6B7280",
    available: "#4A90E2",
    "in-progress": "#7B68EE",
    completed: "#50C878",
  };

  const statusColor = $derived(statusColors[status as ConceptStatus]);

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

<button
  class="concept-card"
  class:locked={status === "locked"}
  class:completed={status === "completed"}
  style="--status-color: {statusColor}"
  onclick={handleClick}
  onkeydown={handleKeydown}
  disabled={!isClickable}
  aria-label="{concept.name} - {status}"
  tabindex={isClickable ? 0 : -1}
>
  <div class="accent"></div>
  <span class="icon"><i class="fa-solid {concept.icon}"></i></span>
  <span class="name">{concept.shortName}</span>
  <span class="time">{concept.estimatedMinutes}m</span>
  {#if status === "completed"}
    <span class="check"><i class="fa-solid fa-check"></i></span>
  {/if}
</button>

<style>
  .concept-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    min-height: 48px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    position: relative;
    overflow: hidden;
    transition: background 0.15s ease, border-color 0.15s ease;
    width: 100%;
    text-align: left;
    cursor: pointer;
  }

  .accent {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--status-color);
  }

  .concept-card:hover:not(.locked) {
    background: rgba(255, 255, 255, 0.06);
    border-color: var(--status-color);
  }

  .concept-card.locked {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .icon {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.125rem;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 6px;
    flex-shrink: 0;
  }

  .name {
    flex: 1;
    font-size: 0.9375rem;
    font-weight: 600;
    color: white;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .time {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
    flex-shrink: 0;
  }

  .check {
    width: 20px;
    height: 20px;
    background: var(--status-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.625rem;
    color: white;
    flex-shrink: 0;
  }

  /* Focus state */
  .concept-card:focus-visible {
    outline: 2px solid var(--status-color);
    outline-offset: 2px;
  }

  .concept-card[disabled] {
    cursor: not-allowed;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .concept-card {
      transition: none;
    }
  }
</style>

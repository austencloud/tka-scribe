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
  import type { IHapticFeedbackService } from "../../../shared/application/services/contracts/IHapticFeedbackService";
  import { resolve, TYPES } from "../../../shared/inversify/di";
  import { CONCEPT_CATEGORIES } from "../domain/concepts";
  import type { LearnConcept, ConceptStatus } from "../domain/types";

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

  // Category color for icon styling
  const categoryColor = $derived(
    CONCEPT_CATEGORIES[concept.category]?.color ?? "#4A90E2"
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

<button
  class="concept-card"
  class:locked={status === "locked"}
  class:completed={status === "completed"}
  style="--status-color: {statusColor}; --category-color: {categoryColor}"
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
    padding: 14px 16px;
    min-height: 52px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    position: relative;
    overflow: hidden;
    transition: all 0.2s ease;
    width: 100%;
    text-align: left;
    cursor: pointer;
  }

  .accent {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--status-color);
    border-radius: 0 4px 4px 0;
  }

  .concept-card:hover:not(.locked) {
    background: rgba(255, 255, 255, 0.07);
    border-color: var(--status-color);
    transform: translateX(4px);
  }

  .concept-card.locked {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .concept-card.completed {
    background: rgba(80, 200, 120, 0.06);
    border-color: rgba(80, 200, 120, 0.15);
  }

  .icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    background: color-mix(in srgb, var(--category-color) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--category-color) 20%, transparent);
    border-radius: 10px;
    flex-shrink: 0;
    color: var(--category-color);
    text-shadow: 0 0 12px
      color-mix(in srgb, var(--category-color) 30%, transparent);
  }

  .name {
    flex: 1;
    font-size: 0.9375rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    letter-spacing: -0.01em;
  }

  .time {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.35);
    flex-shrink: 0;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
  }

  .check {
    width: 22px;
    height: 22px;
    background: var(--status-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    color: white;
    flex-shrink: 0;
    box-shadow: 0 0 12px
      color-mix(in srgb, var(--status-color) 50%, transparent);
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
    .concept-card:hover:not(.locked) {
      transform: none;
    }
  }
</style>

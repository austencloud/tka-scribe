<!--
CategoryHeader - Enhanced category section header

Displays:
- Category icon with color-coded background
- Category name and description
- Progress indicator (concepts completed in category)
- Expandable/collapsible state
-->
<script lang="ts">
  import type { ConceptCategory } from "../domain";
  import { CONCEPT_CATEGORIES } from "../domain";

  let {
    category,
    completedCount = 0,
    totalCount = 0,
    expanded = true,
    onToggle,
  }: {
    category: ConceptCategory;
    completedCount?: number;
    totalCount?: number;
    expanded?: boolean;
    onToggle?: () => void;
  } = $props();

  const categoryInfo = $derived(CONCEPT_CATEGORIES[category as ConceptCategory]);
  const progressPercent = $derived(
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  );
  const isComplete = $derived(completedCount === totalCount && totalCount > 0);
</script>

<button
  class="category-header"
  class:expanded
  class:complete={isComplete}
  style="--category-color: {categoryInfo.color}"
  onclick={onToggle}
  aria-expanded={expanded}
>
  <!-- Icon with colored background -->
  <div class="category-icon-wrapper">
    <span class="category-icon">{categoryInfo.icon}</span>
    {#if isComplete}
      <div class="complete-badge">✓</div>
    {/if}
  </div>

  <!-- Title and description -->
  <div class="category-info">
    <div class="category-title-row">
      <h2 class="category-title">{categoryInfo.name}</h2>
      <span class="category-progress-badge">
        {completedCount}/{totalCount}
      </span>
    </div>
    <p class="category-description">{categoryInfo.description}</p>

    <!-- Progress bar -->
    <div class="progress-track">
      <div
        class="progress-fill"
        style="width: {progressPercent}%"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin="0"
        aria-valuemax="100"
      ></div>
    </div>
  </div>

  <!-- Expand/collapse chevron -->
  <div class="chevron-wrapper">
    <svg
      class="chevron-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </div>
</button>

<style>
  .category-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.06) 0%,
      rgba(255, 255, 255, 0.02) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;
    text-align: left;
    position: relative;
    overflow: hidden;
  }

  /* Subtle category color accent */
  .category-header::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--category-color);
    opacity: 0.8;
    transition: width 0.25s ease;
  }

  .category-header:hover {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.08) 0%,
      rgba(255, 255, 255, 0.04) 100%
    );
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }

  .category-header:hover::before {
    width: 6px;
  }

  .category-header.complete {
    background: linear-gradient(
      135deg,
      rgba(80, 200, 120, 0.1) 0%,
      rgba(80, 200, 120, 0.02) 100%
    );
    border-color: rgba(80, 200, 120, 0.2);
  }

  .category-header.complete::before {
    background: #50c878;
  }

  /* Icon wrapper */
  .category-icon-wrapper {
    position: relative;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--category-color) 20%, transparent),
      color-mix(in srgb, var(--category-color) 10%, transparent)
    );
    border: 1px solid color-mix(in srgb, var(--category-color) 30%, transparent);
    border-radius: 12px;
    flex-shrink: 0;
  }

  .category-icon {
    font-size: 1.5rem;
    line-height: 1;
  }

  .complete-badge {
    position: absolute;
    bottom: -4px;
    right: -4px;
    width: 18px;
    height: 18px;
    background: #50c878;
    border: 2px solid rgba(0, 0, 0, 0.8);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.625rem;
    font-weight: 700;
    color: white;
  }

  /* Info section */
  .category-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .category-title-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .category-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: white;
    margin: 0;
    line-height: 1.2;
  }

  .category-progress-badge {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--category-color);
    background: color-mix(in srgb, var(--category-color) 15%, transparent);
    padding: 0.125rem 0.5rem;
    border-radius: 999px;
    line-height: 1.4;
  }

  .category-description {
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    line-height: 1.4;
  }

  /* Progress track */
  .progress-track {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 999px;
    overflow: hidden;
    margin-top: 0.25rem;
  }

  .progress-fill {
    height: 100%;
    background: var(--category-color);
    border-radius: 999px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .category-header.complete .progress-fill {
    background: linear-gradient(90deg, #50c878, #7be495);
  }

  /* Chevron */
  .chevron-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    margin-top: 0.5rem;
  }

  .chevron-icon {
    width: 20px;
    height: 20px;
    color: rgba(255, 255, 255, 0.4);
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .category-header.expanded .chevron-icon {
    transform: rotate(180deg);
  }

  .category-header:hover .chevron-icon {
    color: rgba(255, 255, 255, 0.7);
  }

  /* Focus state */
  .category-header:focus-visible {
    outline: 2px solid var(--category-color);
    outline-offset: 2px;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .category-header {
      padding: 0.875rem 1rem;
      gap: 0.75rem;
    }

    .category-icon-wrapper {
      width: 42px;
      height: 42px;
    }

    .category-icon {
      font-size: 1.25rem;
    }

    .category-title {
      font-size: 1rem;
    }

    .category-description {
      font-size: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    .category-header {
      padding: 0.75rem;
      border-radius: 12px;
    }

    .category-icon-wrapper {
      width: 36px;
      height: 36px;
      border-radius: 10px;
    }

    .category-icon {
      font-size: 1.125rem;
    }

    .category-title {
      font-size: 0.9375rem;
    }

    .category-progress-badge {
      font-size: 0.6875rem;
      padding: 0.0625rem 0.375rem;
    }

    .category-description {
      display: none;
    }

    .chevron-wrapper {
      width: 28px;
      height: 28px;
      margin-top: 0.25rem;
    }

    .chevron-icon {
      width: 18px;
      height: 18px;
    }

    .complete-badge {
      width: 16px;
      height: 16px;
      font-size: 0.5625rem;
    }
  }
</style>

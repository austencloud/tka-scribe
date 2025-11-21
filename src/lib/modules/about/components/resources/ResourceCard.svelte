<!--
Resource Card Component

Individual resource item display with metadata, actions, and modal integration.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import type { Resource } from "./resourcesData";
  import { categories } from "./resourcesData";

  // Props
  const { resource, onOpenModal = () => {} } = $props<{
    resource: Resource,
    onOpenModal?: (selectedResource: Resource) => void
  }>();

  let hapticService: IHapticFeedbackService;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  function handleOpenModal() {
    hapticService?.trigger("selection");
    onOpenModal(resource);
  }

  function handleVisitLink() {
    hapticService?.trigger("selection");
  }

  function getStatusIcon(status: string): string {
    switch (status) {
      case "vendor":
        return "🏪";
      case "historical":
        return "📚";
      default:
        return "✨";
    }
  }

  function getCategoryLabel(categoryValue: string): string {
    return (
      categories.find((c) => c.value === categoryValue)?.label || categoryValue
    );
  }
</script>

<article
  class="resource-card category-{resource.category}"
  data-status={resource.status}
>
  <div class="card-content">
    <div class="resource-header">
      <div class="resource-title-row">
        <h3 class="resource-title">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${resource.name} website`}
          >
            {resource.name}
          </a>
        </h3>
        <span
          class="status-indicator status-{resource.status}"
          aria-label={resource.status}
          role="img"
        >
          {getStatusIcon(resource.status)}
        </span>
      </div>
      <div class="resource-meta">
        <span class="category-badge category-{resource.category}">
          {getCategoryLabel(resource.category)}
        </span>
        {#if resource.status === "vendor" && resource.foundingYear}
          <span
            class="founding-badge"
            aria-label={`Founded in ${resource.foundingYear}`}
            >Est. {resource.foundingYear}</span
          >
        {/if}
        {#if resource.lastUpdated}
          <span
            class="last-updated-indicator"
            aria-label={`Last updated in ${resource.lastUpdated}`}
            >Updated {resource.lastUpdated}</span
          >
        {/if}
      </div>
    </div>

    <p class="resource-description">{resource.description}</p>

    {#if resource.status === "vendor" && resource.specialties}
      <div class="vendor-specialties">
        <strong>Specialties:</strong>
        <div
          class="specialty-tags"
          role="list"
          aria-label="Product specialties"
        >
          {#each resource.specialties as specialty}
            <span class="specialty-tag" role="listitem">{specialty}</span>
          {/each}
        </div>
      </div>
    {/if}

    <div class="resource-value">
      <strong
        >{resource.status === "vendor"
          ? "Why shop here:"
          : "Why it's essential:"}</strong
      >
      {resource.value}
    </div>

    <div class="resource-actions">
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        class="visit-btn"
        onclick={handleVisitLink}
        aria-label={`Visit ${resource.name} ${resource.status === "vendor" ? "store" : resource.status === "historical" ? "archive" : "website"}`}
      >
        <span class="btn-icon">🔗</span>
        Visit {resource.status === "vendor"
          ? "Store"
          : resource.status === "historical"
            ? "Archive"
            : "Site"}
      </a>

      {#if resource.hasLandingPage}
        <button
          type="button"
          onclick={handleOpenModal}
          class="learn-more-btn"
          aria-label={`Learn more about ${resource.name}`}
        >
          <span class="btn-icon">📖</span>
          Learn More
        </button>
      {/if}
    </div>
  </div>
</article>

<style>
  .resource-card {
    position: relative;
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 0;
    transition: all 0.2s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(12px);
  }

  .card-content {
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .resource-card:hover {
    border-color: var(--color-accent);
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  /* Category-specific hover border colors */
  .resource-card.category-active-learning:hover {
    border-color: var(--color-success);
  }

  .resource-card.category-active-community:hover {
    border-color: var(--color-info);
  }

  .resource-card.category-vendors:hover {
    border-color: var(--color-warning);
  }

  .resource-card.category-historical-archives:hover {
    border-color: var(--color-neutral);
  }

  .resource-card:focus-within {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .resource-header {
    margin-bottom: var(--spacing-md);
  }

  .resource-title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: var(--spacing-sm);
  }

  .resource-title {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: 700;
    flex: 1;
  }

  .resource-title a {
    color: #ffffff;
    text-decoration: none;
    transition: all 0.2s ease;
    position: relative;
  }

  .resource-title a::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: #667eea;
    transition: width 0.3s ease;
  }

  .resource-title a:hover::after,
  .resource-title a:focus::after {
    width: 100%;
  }

  .resource-title a:hover,
  .resource-title a:focus {
    color: #a5b4fc;
  }

  .status-indicator {
    font-size: var(--font-size-lg);
    margin-left: var(--spacing-sm);
  }

  .resource-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    align-items: center;
  }

  .category-badge {
    background: rgba(255, 255, 255, 0.1);
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .category-badge.category-active-learning {
    color: #6ee7b7;
    border-color: rgba(110, 231, 183, 0.3);
    background: rgba(110, 231, 183, 0.1);
  }

  .category-badge.category-active-community {
    color: #93c5fd;
    border-color: rgba(147, 197, 253, 0.3);
    background: rgba(147, 197, 253, 0.1);
  }

  .category-badge.category-vendors {
    color: #fcd34d;
    border-color: rgba(252, 211, 77, 0.3);
    background: rgba(252, 211, 77, 0.1);
  }

  .category-badge.category-historical-archives {
    color: #d1d5db;
    border-color: rgba(209, 213, 219, 0.3);
    background: rgba(209, 213, 219, 0.1);
  }

  .founding-badge {
    background: rgba(255, 255, 255, 0.05);
    color: #9ca3af;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .last-updated-indicator {
    color: #9ca3af;
    font-size: 11px;
    font-weight: 500;
  }

  .resource-description {
    color: #d1d5db;
    line-height: 1.6;
    margin-bottom: var(--spacing-md);
    flex: 1;
  }

  .vendor-specialties {
    margin-bottom: var(--spacing-md);
  }

  .vendor-specialties strong {
    color: #f3f4f6;
    font-size: 13px;
    display: block;
    margin-bottom: var(--spacing-xs);
  }

  .specialty-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }

  .specialty-tag {
    background: rgba(255, 255, 255, 0.05);
    color: #d1d5db;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .resource-value {
    background: rgba(255, 255, 255, 0.05);
    padding: 16px;
    border-radius: 10px;
    margin-bottom: 16px;
    border-left: 3px solid #667eea;
    line-height: 1.6;
  }

  .resource-card.category-active-learning .resource-value {
    border-left-color: #6ee7b7;
  }

  .resource-card.category-active-community .resource-value {
    border-left-color: #93c5fd;
  }

  .resource-card.category-vendors .resource-value {
    border-left-color: #fcd34d;
  }

  .resource-card.category-historical-archives .resource-value {
    border-left-color: #d1d5db;
  }

  .resource-value strong {
    color: #f3f4f6;
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
  }

  .resource-value {
    color: #d1d5db;
  }

  .resource-actions {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: auto;
  }

  .visit-btn,
  .learn-more-btn {
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;
    text-align: center;
    transition: all 0.2s ease;
    font-size: 14px;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: none;
  }

  .btn-icon {
    font-size: 14px;
  }

  .visit-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
  }

  .visit-btn:hover {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .learn-more-btn {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    cursor: pointer;
  }

  .learn-more-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }

  /* Focus visible states for accessibility */
  .visit-btn:focus-visible,
  .learn-more-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .card-content {
      padding: var(--spacing-md);
    }

    .resource-title {
      font-size: var(--font-size-md);
    }

    .resource-actions {
      flex-direction: column;
    }

    .specialty-tags {
      gap: 6px;
    }

    .resource-card:hover {
      transform: translateY(-2px);
    }
  }

  /* Reduced motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .resource-card,
    .resource-card * {
      transition: none !important;
      animation: none !important;
    }
  }
</style>

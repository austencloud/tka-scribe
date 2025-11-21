<!--
Resource Grid Component

Grid layout for displaying filtered resources with responsive design and loading states.
-->
<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import ResourceCard from "./ResourceCard.svelte";
  import type { Resource } from "./resourcesData";

  // Props
  const {
    resources,
    isLoading = false,
    onOpenModal = () => {},
  } = $props<{
    resources: Resource[],
    isLoading?: boolean,
    onOpenModal?: (selectedResource: Resource) => void
  }>();
</script>

{#if isLoading}
  <div class="loading-state" transition:fade={{ duration: 300 }}>
    <div class="loading-spinner"></div>
    <p>Loading resources...</p>
  </div>
{:else if resources.length === 0}
  <div class="empty-state" transition:fade={{ duration: 300 }}>
    <div class="empty-icon">🔍</div>
    <h3>No resources found</h3>
    <p>Try adjusting your search criteria or filters.</p>
  </div>
{:else}
  <div class="resource-grid">
    {#each resources as resource, index (resource.id || resource.name)}
      <div
        class="grid-item"
        in:fly={{
          y: 20,
          duration: 400,
          delay: Math.min(index * 50, 400),
          easing: quintOut,
        }}
        out:fade={{ duration: 200 }}
      >
        <ResourceCard {resource} {onOpenModal} />
      </div>
    {/each}
  </div>
{/if}

<style>
  .resource-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: var(--spacing-lg);
    margin-top: var(--spacing-lg);
  }

  .grid-item {
    height: 100%;
    animation: fadeInUp 0.4s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-3xl) 0;
    color: var(--color-text-secondary);
    min-height: 300px;
  }

  .loading-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--color-border);
    border-top: 4px solid var(--color-accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: var(--spacing-lg);
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .loading-state p {
    font-size: var(--font-size-md);
    font-weight: 500;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-3xl) 0;
    text-align: center;
    color: var(--color-text-secondary);
    min-height: 300px;
    background: var(--color-bg-secondary);
    border-radius: var(--radius-lg);
    border: 2px dashed var(--color-border);
  }

  .empty-icon {
    font-size: 64px;
    margin-bottom: var(--spacing-lg);
    opacity: 0.4;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.4;
      transform: scale(1);
    }
    50% {
      opacity: 0.6;
      transform: scale(1.05);
    }
  }

  .empty-state h3 {
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--color-text-primary);
    font-size: var(--font-size-xl);
    font-weight: 700;
  }

  .empty-state p {
    margin: 0;
    max-width: 400px;
    font-size: var(--font-size-md);
    line-height: 1.6;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .resource-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }

    .loading-state,
    .empty-state {
      min-height: 250px;
      padding: var(--spacing-2xl) var(--spacing-lg);
    }

    .empty-icon {
      font-size: 48px;
    }

    .empty-state h3 {
      font-size: var(--font-size-lg);
    }
  }

  @media (max-width: 480px) {
    .resource-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-sm);
    }
  }

  /* Desktop: 3-column layout for better use of space */
  @media (min-width: 1024px) {
    .resource-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  /* Large screens - allow more columns */
  @media (min-width: 1400px) {
    .resource-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  /* Extra large screens */
  @media (min-width: 1800px) {
    .resource-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  /* Reduced motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .grid-item,
    .empty-icon,
    .loading-spinner {
      animation: none !important;
    }
  }
</style>

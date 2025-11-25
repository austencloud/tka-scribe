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
    resources: Resource[];
    isLoading?: boolean;
    onOpenModal?: (resource: Resource) => void;
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
    min-height: 400px;
    gap: 16px;
    color: rgba(255, 255, 255, 0.6);
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top: 3px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
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
    font-size: 14px;
    font-weight: 500;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px;
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    min-height: 300px;
    gap: 12px;
  }

  .empty-icon {
    font-size: 32px;
    opacity: 0.6;
  }

  .empty-state h3 {
    margin: 0;
    color: rgba(255, 255, 255, 0.8);
    font-size: 18px;
    font-weight: 600;
  }

  .empty-state p {
    margin: 0;
    max-width: 400px;
    font-size: 14px;
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

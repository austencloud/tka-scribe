<!-- FilterSectionHeader - Section title with toggle icon and active indicator -->
<script lang="ts">
  interface Props {
    title: string;
    isActive?: boolean;
    isExpanded?: boolean;
    onToggle: () => void;
  }

  const {
    title,
    isActive = false,
    isExpanded = false,
    onToggle,
  }: Props = $props();
</script>

<button
  type="button"
  class="filter-section-header"
  onclick={onToggle}
>
  <h3 class="filter-section-title">{title}</h3>
  {#if isActive}
    <span class="section-active-dot"></span>
  {/if}
  <i class="fas fa-chevron-down section-chevron" class:rotated={isExpanded}></i>
</button>

<style>
  .filter-section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 52px;
    padding: 0 21px;
    background: none;
    border: none;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .filter-section-header:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .filter-section-title {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .section-active-dot {
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .section-chevron {
    margin-left: auto;
    font-size: 0.75em;
    color: rgba(255, 255, 255, 0.4);
    transition: transform 0.2s ease;
  }

  .section-chevron.rotated {
    transform: rotate(180deg);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .section-active-dot {
      animation: none;
    }

    .section-chevron {
      transition: none;
    }
  }
</style>

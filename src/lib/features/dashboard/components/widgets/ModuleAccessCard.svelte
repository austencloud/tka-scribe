<script lang="ts">
  /**
   * ModuleAccessCard - 2026 Refined Minimalism
   * Cleaner card for mobile module navigation
   * Desktop uses chips (inline in Dashboard.svelte)
   */

  import type { ModuleDefinition } from "$lib/shared/navigation/domain/types";

  interface Props {
    module: ModuleDefinition;
    onClick: () => void;
  }

  let { module, onClick }: Props = $props();
</script>

<button
  class="module-card"
  onclick={onClick}
  style="--module-color: {module.color}"
>
  <div class="card-icon">
    {@html module.icon}
  </div>
  <div class="card-content">
    <h3>{module.label}</h3>
    <p>{module.description}</p>
  </div>
  <div class="card-arrow">
    <i class="fas fa-chevron-right" aria-hidden="true"></i>
  </div>
</button>

<style>
  /* 2026 Refined Card - Cleaner, no hover lift */
  .module-card {
    display: flex;
    align-items: center;
    gap: var(--space-2026-sm, 12px);
    padding: var(--space-2026-sm, 12px) var(--space-2026-md, 16px);
    background: var(--surface-2026, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--border-2026, rgba(255, 255, 255, 0.06));
    border-radius: var(--radius-2026-md, 14px);
    cursor: pointer;
    transition: all var(--duration-2026-fast, 150ms) var(--ease-2026, ease);
    text-align: left;
    width: 100%;
  }

  .module-card:hover {
    background: color-mix(in srgb, var(--module-color) 8%, transparent);
    border-color: color-mix(in srgb, var(--module-color) 20%, transparent);
    /* No transform lift - cleaner 2026 aesthetic */
  }

  .module-card:active {
    background: color-mix(in srgb, var(--module-color) 12%, transparent);
  }

  .module-card:focus {
    outline: 2px solid var(--module-color);
    outline-offset: 2px;
  }

  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: color-mix(in srgb, var(--module-color) 12%, transparent);
    border-radius: var(--radius-2026-sm, 10px);
    flex-shrink: 0;
    font-size: var(--font-size-base);
  }

  .card-icon :global(i) {
    color: var(--module-color);
  }

  .card-content {
    flex: 1;
    min-width: 0;
  }

  .card-content h3 {
    margin: 0;
    font-size: var(--text-2026-body, 1rem);
    font-weight: 600;
    color: var(--theme-text);
  }

  .card-content p {
    margin: 3px 0 0;
    font-size: var(--text-2026-micro, 0.75rem);
    color: var(--theme-text-dim, var(--theme-text-dim));
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    color: var(--theme-text-dim);
    font-size: var(--font-size-compact);
    transition: color var(--duration-2026-fast, 150ms) var(--ease-2026, ease);
  }

  .module-card:hover .card-arrow {
    color: var(--module-color);
    /* No transform - cleaner interaction */
  }

  /* Compact for very small screens */
  @media (max-width: 380px) {
    .module-card {
      padding: var(--space-2026-xs, 10px) var(--space-2026-sm, 12px);
    }

    .card-icon {
      width: 36px;
      height: 36px;
      font-size: var(--font-size-sm);
    }

    .card-content h3 {
      font-size: var(--text-2026-caption, 0.875rem);
    }

    .card-content p {
      display: none;
    }

    .card-arrow {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .module-card,
    .card-arrow {
      transition: none;
    }
  }
</style>

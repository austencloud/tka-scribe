<script lang="ts">
  interface Props {
    category: "module" | "tab" | "capability";
  }

  let { category }: Props = $props();

  const config = $derived(
    {
      module: { icon: "fa-cubes", label: "module" },
      tab: { icon: "fa-window-restore", label: "tab" },
      capability: { icon: "fa-magic", label: "capability" },
    }[category]
  );
</script>

<div class="type-indicator {category}">
  <i class="fas {config.icon}" aria-hidden="true"></i>
  <span class="type-label">{config.label}</span>
</div>

<style>
  .type-indicator {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: var(--radius-2026-sm) var(--radius-2026-md);
    border-radius: 8px;
    font-weight: 600;
    font-size: var(--text-2026-caption);
    letter-spacing: 0.5px;
    text-transform: uppercase;
    border: 2px solid;
  }

  @media (min-width: 480px) {
    .type-indicator {
      gap: var(--radius-2026-sm);
      padding: var(--space-2026-sm) var(--space-2026-md);
      font-size: var(--text-2026-body);
    }
  }

  .type-indicator.module {
    background: color-mix(
      in srgb,
      var(--theme-accent-strong, var(--theme-accent-strong)) 15%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent-strong, var(--theme-accent-strong)) 40%,
      transparent
    );
    color: #a78bfa;
  }

  .type-indicator.tab {
    background: var(--accent-2026-indigo-soft);
    border-color: color-mix(
      in srgb,
      var(--accent-2026-indigo) 40%,
      transparent
    );
    color: var(--semantic-info);
  }

  .type-indicator.capability {
    background: var(--accent-2026-amber-soft);
    border-color: color-mix(in srgb, var(--accent-2026-amber) 40%, transparent);
    color: var(--semantic-warning);
  }

  .type-indicator i {
    font-size: var(--font-size-base);
  }

  @media (min-width: 480px) {
    .type-indicator i {
      font-size: var(--font-size-lg);
    }
  }

  .type-label {
    font-weight: 700;
  }
</style>

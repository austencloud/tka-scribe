<!-- TrustBadges - Display trust indicators and credentials -->
<script lang="ts">
  interface Badge {
    id: string;
    type: "festival" | "security" | "community";
    name: string;
    icon?: string;
    logoUrl?: string;
    link?: string;
  }

  interface Props {
    badges?: Badge[];
  }

  let { badges = [] }: Props = $props();

  const defaultBadges: Badge[] = [
    { id: "stripe", type: "security", name: "Secure payments by Stripe", icon: "fa-lock" },
    { id: "ssl", type: "security", name: "256-bit SSL encryption", icon: "fa-shield-alt" }
    // Add festivals after collecting data
  ];

  const displayBadges = $derived(badges.length > 0 ? badges : defaultBadges);
</script>

<div class="trust-badges">
  <div class="badges-grid">
    {#each displayBadges as badge (badge.id)}
      {#if badge.link}
        <a href={badge.link} target="_blank" rel="noopener noreferrer" class="badge">
          {#if badge.logoUrl}
            <img src={badge.logoUrl} alt={badge.name} />
          {:else if badge.icon}
            <i class="fas {badge.icon}" aria-hidden="true"></i>
          {/if}
          <span>{badge.name}</span>
        </a>
      {:else}
        <div class="badge">
          {#if badge.logoUrl}
            <img src={badge.logoUrl} alt={badge.name} />
          {:else if badge.icon}
            <i class="fas {badge.icon}" aria-hidden="true"></i>
          {/if}
          <span>{badge.name}</span>
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .trust-badges {
    padding: var(--spacing-md, 16px) 0;
  }

  .badges-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-md, 16px);
    justify-content: center;
    align-items: center;
  }

  .badge {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs, 4px);
    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    text-decoration: none;
    transition: all var(--transition-fast, 150ms ease);
  }

  a.badge:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    color: var(--theme-text, #ffffff);
    border-color: var(--theme-accent, #6366f1);
  }

  .badge i {
    font-size: var(--font-size-min, 14px);
    color: var(--theme-accent, #6366f1);
  }

  .badge img {
    height: 20px;
    width: auto;
  }
</style>

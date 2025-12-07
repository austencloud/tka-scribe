<script lang="ts">
  /**
   * ChallengeTeaser - Mobile teaser for Today's Challenge
   * Tappable row that opens the full challenge in a slide-up drawer
   */

  interface Props {
    onclick: () => void;
  }

  let { onclick }: Props = $props();
</script>

<button class="teaser" {onclick}>
  <div class="teaser-icon">
    <i class="fas fa-bolt"></i>
  </div>
  <div class="teaser-content">
    <span class="teaser-title">Today's Challenge</span>
    <span class="teaser-subtitle">Tap to view</span>
  </div>
  <div class="teaser-arrow">
    <i class="fas fa-chevron-up"></i>
  </div>
</button>

<style>
  .teaser {
    display: flex;
    align-items: center;
    gap: var(--space-2026-sm, 12px);
    width: 100%;
    padding: var(--space-2026-sm, 12px) var(--space-2026-md, 16px);
    background: var(--surface-2026, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--border-2026, rgba(255, 255, 255, 0.06));
    border-radius: var(--radius-2026-md, 14px);
    cursor: pointer;
    transition: all var(--duration-2026-fast, 150ms) var(--ease-2026, ease);
    text-align: left;
  }

  .teaser:hover {
    background: var(--surface-2026-hover, rgba(255, 255, 255, 0.06));
    border-color: var(--border-2026-hover, rgba(255, 255, 255, 0.12));
  }

  .teaser:active {
    background: var(--surface-2026-active, rgba(255, 255, 255, 0.08));
  }

  .teaser-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: var(--accent-2026-amber-soft, rgba(245, 158, 11, 0.12));
    border-radius: var(--radius-2026-sm, 10px);
    color: var(--accent-2026-amber, #f59e0b);
    font-size: 16px;
    flex-shrink: 0;
  }

  .teaser-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .teaser-title {
    font-size: var(--text-2026-body, 1rem);
    font-weight: 600;
    color: var(--text-primary-current, rgba(255, 255, 255, 0.95));
  }

  .teaser-subtitle {
    font-size: var(--text-2026-caption, 0.875rem);
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.5));
  }

  .teaser-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.4));
    font-size: 12px;
    transition: color var(--duration-2026-fast, 150ms) var(--ease-2026, ease);
  }

  .teaser:hover .teaser-arrow {
    color: var(--accent-2026-amber, #f59e0b);
  }

  @media (prefers-reduced-motion: reduce) {
    .teaser,
    .teaser-arrow {
      transition: none;
    }
  }
</style>

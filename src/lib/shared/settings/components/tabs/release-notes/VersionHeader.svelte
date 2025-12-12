<!-- VersionHeader - Badge and date display -->
<script lang="ts">
  import { PRE_RELEASE_VERSION } from "$lib/features/feedback/domain/models/version-models";

  let {
    version,
    releasedAt,
    onClose,
  }: {
    version: string;
    releasedAt: Date;
    onClose: () => void;
  } = $props();

  const isPreRelease = $derived(version === PRE_RELEASE_VERSION);
  const formattedDate = $derived(
    releasedAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );
</script>

<header class="panel-header">
  <button
    type="button"
    class="close-button"
    onclick={onClose}
    aria-label="Close version details"
  >
    <i class="fas fa-times"></i>
  </button>

  <div class="version-badge" class:pre-release={isPreRelease}>
    <span class="badge-text">
      {isPreRelease ? "Pre-Release" : `v${version}`}
    </span>
  </div>

  <time class="release-date">{formattedDate}</time>
</header>

<style>
  .panel-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    position: relative;
  }

  .close-button {
    position: absolute;
    top: 0;
    right: 0;
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    cursor: pointer;
    transition: all 0.2s;
  }

  .close-button:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .version-badge {
    display: inline-flex;
    padding: 8px 20px;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-accent, #8b5cf6) 20%, transparent),
      color-mix(in srgb, var(--theme-accent, #8b5cf6) 10%, transparent)
    );
    border: 1px solid color-mix(in srgb, var(--theme-accent, #8b5cf6) 30%, transparent);
    border-radius: 24px;
  }

  .version-badge.pre-release {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border-color: var(--theme-stroke, rgba(255, 255, 255, 0.15));
  }

  .badge-text {
    font-size: 20px;
    font-weight: 700;
    color: var(--theme-accent, #a78bfa);
  }

  .pre-release .badge-text {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-size: 16px;
  }

  .release-date {
    font-size: 14px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  @media (max-width: 768px) {
    .panel-header {
      margin-bottom: 16px;
    }

    .version-badge {
      padding: 6px 16px;
    }

    .badge-text {
      font-size: 18px;
    }
  }
</style>

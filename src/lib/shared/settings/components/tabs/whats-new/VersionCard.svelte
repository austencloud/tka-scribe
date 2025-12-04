<!-- VersionCard - Clickable card showing a single version's summary -->
<script lang="ts">
  import type { AppVersion } from "$lib/features/feedback/domain/models/version-models";
  import { PRE_RELEASE_VERSION } from "$lib/features/feedback/domain/models/version-models";

  const { version, onclick } = $props<{
    version: AppVersion;
    onclick: () => void;
  }>();

  // Check if we have curated changelog entries
  const hasChangelog = $derived(version.changelogEntries && version.changelogEntries.length > 0);

  // Group changelog entries by category for summary
  const groupedChangelog = $derived.by(() => {
    if (!version.changelogEntries) return { fixed: [], added: [], improved: [] };
    const fixed = version.changelogEntries.filter((e) => e.category === "fixed");
    const added = version.changelogEntries.filter((e) => e.category === "added");
    const improved = version.changelogEntries.filter((e) => e.category === "improved");
    return { fixed, added, improved };
  });

  // Format date
  const formattedDate = $derived(
    version.releasedAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  );

  // Check if pre-release
  const isPreRelease = $derived(version.version === PRE_RELEASE_VERSION);

  // Summary text based on changelog entries if available
  const summary = $derived.by(() => {
    if (hasChangelog) {
      const parts: string[] = [];
      if (groupedChangelog.fixed.length > 0) {
        parts.push(`${groupedChangelog.fixed.length} fix${groupedChangelog.fixed.length === 1 ? "" : "es"}`);
      }
      if (groupedChangelog.added.length > 0) {
        parts.push(`${groupedChangelog.added.length} new feature${groupedChangelog.added.length === 1 ? "" : "s"}`);
      }
      if (groupedChangelog.improved.length > 0) {
        parts.push(`${groupedChangelog.improved.length} improvement${groupedChangelog.improved.length === 1 ? "" : "s"}`);
      }
      return parts.join(", ") || "Updates included";
    }
    // Fall back to feedback summary
    const parts: string[] = [];
    if (version.feedbackSummary.bugs > 0) {
      parts.push(`${version.feedbackSummary.bugs} bug${version.feedbackSummary.bugs === 1 ? "" : "s"} fixed`);
    }
    if (version.feedbackSummary.features > 0) {
      parts.push(`${version.feedbackSummary.features} feature${version.feedbackSummary.features === 1 ? "" : "s"} added`);
    }
    if (version.feedbackSummary.general > 0) {
      parts.push(`${version.feedbackSummary.general} improvement${version.feedbackSummary.general === 1 ? "" : "s"}`);
    }
    return parts.join(", ") || "No changes recorded";
  });

  // Total changes count
  const totalChanges = $derived(
    hasChangelog && version.changelogEntries
      ? version.changelogEntries.length
      : version.feedbackCount
  );
</script>

<button type="button" class="version-card" class:pre-release={isPreRelease} {onclick}>
  <div class="version-info">
    <span class="version-number">
      {#if isPreRelease}
        Pre-Release
      {:else}
        v{version.version}
      {/if}
    </span>
    <span class="version-date">{formattedDate}</span>
  </div>

  <div class="version-summary">
    <span class="summary-text">{summary}</span>
    <span class="total-count">
      {totalChanges} {hasChangelog ? "change" : "resolved item"}{totalChanges === 1 ? "" : "s"}
    </span>
  </div>

  <div class="arrow-icon">
    <i class="fas fa-chevron-right"></i>
  </div>
</button>

<style>
  .version-card {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    padding: 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s ease;
  }

  .version-card:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(139, 92, 246, 0.3);
  }

  .version-card:active {
    transform: scale(0.99);
  }

  .version-card.pre-release {
    opacity: 0.7;
  }

  .version-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 100px;
  }

  .version-number {
    font-size: 16px;
    font-weight: 700;
    color: #a78bfa;
  }

  .pre-release .version-number {
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
  }

  .version-date {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .version-summary {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .summary-text {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }

  .total-count {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
  }

  .arrow-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: rgba(255, 255, 255, 0.3);
    transition: color 0.2s ease, transform 0.2s ease;
  }

  .version-card:hover .arrow-icon {
    color: rgba(139, 92, 246, 0.8);
    transform: translateX(2px);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .version-card,
    .arrow-icon {
      transition: none;
    }

    .version-card:active {
      transform: none;
    }
  }
</style>

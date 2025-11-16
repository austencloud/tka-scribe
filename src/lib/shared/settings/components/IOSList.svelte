<!-- IOSList.svelte - iOS-native grouped list container -->
<script lang="ts">
  import type { Snippet } from "svelte";

  interface IOSListProps {
    title?: string;
    footer?: string;
    inset?: boolean;
    children: Snippet;
  }

  let { title, footer, inset = true, children }: IOSListProps = $props();
</script>

<div class="ios-list-section" class:inset>
  <!-- Section Header -->
  {#if title}
    <div class="ios-list-header" role="heading" aria-level="3">
      {title}
    </div>
  {/if}

  <!-- List Container -->
  <div class="ios-list" role="group">
    {@render children()}
  </div>

  <!-- Section Footer -->
  {#if footer}
    <div class="ios-list-footer">
      {footer}
    </div>
  {/if}
</div>

<style>
  /* iOS Grouped List Section */
  .ios-list-section {
    margin-bottom: 35px; /* iOS standard spacing between sections */
  }

  .ios-list-section.inset {
    padding: 0 16px; /* Inset margins for grouped style */
  }

  /* Section Header */
  .ios-list-header {
    padding: 0 16px 6px 16px; /* iOS standard header padding */
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    font-size: 13px; /* iOS section header size */
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: -0.08px;
    color: rgba(235, 235, 245, 0.6); /* iOS label tertiary */
    /* iOS vibrancy effect for section headers */
    mix-blend-mode: plus-lighter;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .ios-list-section.inset .ios-list-header {
    padding-left: 0; /* Remove extra padding when inset */
    padding-right: 0;
  }

  /* List Container */
  .ios-list {
    background: rgba(28, 28, 30, 0.6); /* iOS grouped background */
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-radius: 10px; /* iOS standard corner radius */
    overflow: hidden;
    /* iOS subtle shadow */
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  }

  /* Section Footer */
  .ios-list-footer {
    padding: 8px 16px 0 16px; /* iOS standard footer padding */
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    font-size: 13px; /* iOS footnote size */
    font-weight: 400;
    letter-spacing: -0.08px;
    color: rgba(235, 235, 245, 0.6); /* iOS label tertiary */
    line-height: 1.38;
  }

  .ios-list-section.inset .ios-list-footer {
    padding-left: 0;
    padding-right: 0;
  }

  /* Light Mode */
  @media (prefers-color-scheme: light) {
    .ios-list {
      background: rgba(255, 255, 255, 0.92); /* iOS grouped background light */
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .ios-list-header,
    .ios-list-footer {
      color: rgba(60, 60, 67, 0.6); /* iOS label tertiary light */
      mix-blend-mode: multiply; /* iOS vibrancy for light mode */
      text-shadow: 0 0.5px 1px rgba(255, 255, 255, 0.8);
    }
  }

  /* High Contrast - reduced blur for clarity */
  @media (prefers-contrast: high) {
    .ios-list {
      background: rgba(28, 28, 30, 0.85);
      /* iOS uses reduced blur in high contrast, not none */
      backdrop-filter: blur(8px) saturate(150%);
      -webkit-backdrop-filter: blur(8px) saturate(150%);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .ios-list-header,
    .ios-list-footer {
      color: rgba(255, 255, 255, 0.9);
      mix-blend-mode: normal; /* Disable blend mode in high contrast */
    }
  }

  @media (prefers-contrast: high) and (prefers-color-scheme: light) {
    .ios-list {
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px) saturate(150%);
      -webkit-backdrop-filter: blur(8px) saturate(150%);
      border: 1px solid rgba(0, 0, 0, 0.3);
    }

    .ios-list-header,
    .ios-list-footer {
      color: rgba(0, 0, 0, 0.9);
      mix-blend-mode: normal; /* Disable blend mode in high contrast */
    }
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .ios-list-section.inset {
      padding: 0 20px; /* Slightly more padding on mobile */
    }
  }
</style>

<script lang="ts">
  /**
   * ClipStatusOverlays - Visual overlays for muted/locked clip states
   */

  interface Props {
    muted: boolean;
    locked: boolean;
  }

  let { muted, locked }: Props = $props();
</script>

{#if muted}
  <div class="status-overlay muted">
    <i class="fa-solid fa-volume-xmark"></i>
  </div>
{/if}

{#if locked}
  <div class="status-overlay locked">
    <i class="fa-solid fa-lock"></i>
  </div>
{/if}

<style>
  .status-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 5;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  .status-overlay.muted {
    background: color-mix(in srgb, var(--theme-panel-bg, rgba(0, 0, 0, 0.6)) 60%, transparent);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: 16px;
  }

  .status-overlay.locked {
    background: color-mix(in srgb, var(--theme-panel-bg, rgba(0, 0, 0, 0.6)) 30%, transparent);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
    font-size: 14px;
  }
</style>

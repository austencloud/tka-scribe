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
  }

  .status-overlay.muted {
    background: rgba(0, 0, 0, 0.4);
    color: rgba(255, 255, 255, 0.6);
    font-size: 16px;
  }

  .status-overlay.locked {
    background: rgba(0, 0, 0, 0.2);
    color: rgba(255, 255, 255, 0.4);
    font-size: 14px;
  }
</style>

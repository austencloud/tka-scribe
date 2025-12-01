<!--
  MobileHeader.svelte
  
  Compact header for mobile animation view.
  Displays sequence name and change button.
-->
<script lang="ts">
  let {
    sequenceName = "",
    onChangeSequence,
  }: {
    sequenceName?: string;
    onChangeSequence: () => void;
  } = $props();
</script>

<div class="mobile-header-compact">
  <span class="sequence-name">{sequenceName}</span>
  <button
    class="change-btn"
    onclick={onChangeSequence}
    aria-label="Change sequence"
  >
    <i class="fas fa-exchange-alt"></i>
  </button>
</div>

<style>
  .mobile-header-compact {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
    min-height: 48px;
  }

  .sequence-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: #a78bfa;
    white-space: nowrap;
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    margin-right: 8px;
  }

  .change-btn {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
    transition: all 0.2s ease;
  }

  .change-btn:active {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(0.9);
  }

  /* Container query responsive styles */
  @container mobile-layout (max-width: 360px) {
    .mobile-header-compact {
      padding: 4px 6px;
      min-height: 48px;
    }

    .sequence-name {
      font-size: 0.75rem;
      max-width: 180px;
    }

    /* Keep 48px minimum for accessibility */
    .change-btn {
      width: 48px;
      height: 48px;
      min-width: 48px;
      min-height: 48px;
      font-size: 0.75rem;
    }
  }

  @container mobile-layout (max-height: 600px) {
    .mobile-header-compact {
      padding: 4px 6px;
      min-height: 48px;
    }
  }

  @container mobile-layout (max-height: 500px) {
    .mobile-header-compact {
      padding: 3px 5px;
      min-height: 48px;
    }

    .sequence-name {
      font-size: 0.75rem;
    }
  }

  /* Landscape orientation */
  @media (orientation: landscape) and (max-width: 768px) {
    .mobile-header-compact {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(12px);
    }
  }
</style>

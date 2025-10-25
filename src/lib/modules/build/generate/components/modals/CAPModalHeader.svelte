<!--
CAPModalHeader.svelte - Modal header with centered title for CAP Selection Modal
Uses grid layout for perfect centering
-->
<script lang="ts">
  let {
    title,
    onClose
  } = $props<{
    title: string;
    onClose: () => void;
  }>();
</script>

<div class="modal-header">
  <div class="header-spacer"></div>
  <h2 id="cap-title">{title}</h2>
  <button
    class="close-button"
    onclick={onClose}
    aria-label="Close CAP selection"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  </button>
</div>

<style>
  .modal-header {
    display: grid;
    grid-template-columns: 36px 1fr 36px;
    align-items: center;
    gap: clamp(12px, 2vw, 16px);
    flex-shrink: 0;
  }

  .header-spacer {
    width: 36px;
  }

  .modal-header h2 {
    color: white;
    font-size: min(5vw, 24px);
    font-weight: 700;
    margin: 0;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
    text-align: center;
  }

  .close-button {
    background: rgba(0, 0, 0, 0.3);
    border: none;
    border-radius: 8px;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    padding: 8px;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
  }

  .close-button:hover {
    background: rgba(0, 0, 0, 0.5);
    transform: scale(1.05);
  }

  .close-button svg {
    width: 20px;
    height: 20px;
  }

  @media (max-height: 700px) and (orientation: portrait) {
    .close-button {
      width: 30px;
      height: 30px;
      padding: 6px;
    }

    .close-button svg {
      width: 16px;
      height: 16px;
    }

    .modal-header h2 {
      font-size: 16px;
    }
  }

  @media (max-width: 400px) and (min-width: 280px) {
    .close-button {
      width: 30px;
      height: 30px;
    }
  }

  @media (max-width: 279px) {
    .close-button {
      width: 28px;
      height: 28px;
      padding: 5px;
    }

    .close-button svg {
      width: 14px;
      height: 14px;
    }

    .modal-header h2 {
      font-size: 14px;
    }
  }

  /* 🌅 LANDSCAPE MODE: Compact header for wide, short viewports */
  @media (orientation: landscape) and (max-height: 600px) {
    .modal-header {
      gap: 8px;
    }

    .close-button {
      width: 28px;
      height: 28px;
      padding: 5px;
    }

    .close-button svg {
      width: 16px;
      height: 16px;
    }

    .modal-header h2 {
      font-size: 14px;
    }
  }

  /* 📱 LANDSCAPE + VERY NARROW: Ultra-compact for 344px height */
  @media (orientation: landscape) and (max-height: 400px) {
    .modal-header {
      gap: 6px;
    }

    .close-button {
      width: 24px;
      height: 24px;
      padding: 4px;
    }

    .close-button svg {
      width: 14px;
      height: 14px;
    }

    .modal-header h2 {
      font-size: 12px;
    }
  }
</style>

<!--
  AnimationPanelHeader.svelte

  Renders appropriate header for mobile vs desktop layouts.
  - Mobile (!isSideBySideLayout): Minimal close button in top-right (floating)
  - Desktop (isSideBySideLayout): Header row with title and close button
-->
<script lang="ts">
  let {
    isSideBySideLayout = false,
    onClose = () => {},
  }: {
    isSideBySideLayout?: boolean;
    onClose?: () => void;
  } = $props();
</script>

{#if !isSideBySideLayout}
  <!-- Minimal Mobile Header - floating close button -->
  <div class="mobile-header">
    <button class="mobile-close-btn" onclick={onClose} aria-label="Close panel">
      <i class="fas fa-times"></i>
    </button>
  </div>
{:else}
  <!-- Desktop Header - row with title and close button -->
  <header class="desktop-header">
    <span class="header-title">Animation Viewer</span>
    <button class="header-close-btn" onclick={onClose} aria-label="Close panel">
      <i class="fas fa-times"></i>
    </button>
  </header>
{/if}

<style>
  /* ===========================
     MOBILE HEADER - Floating close button
     =========================== */
  .mobile-header {
    position: absolute;
    top: 4px;
    right: 8px;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .mobile-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--touch-target-min);
    height: var(--touch-target-min);
    padding: 0;
    background: rgba(100, 100, 120, 0.7);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    color: #ffffff;
    font-size: var(--icon-size-md);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  @media (hover: hover) and (pointer: fine) {
    .mobile-close-btn:hover {
      background: rgba(120, 120, 140, 0.85);
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
  }

  .mobile-close-btn:active {
    transform: scale(0.95);
  }

  /* ===========================
     DESKTOP HEADER - Row with title and close button
     =========================== */
  .desktop-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: clamp(12px, 3cqi, 16px) clamp(16px, 4cqi, 24px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.02);
  }

  .header-title {
    font-size: clamp(14px, 4cqi, 18px);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .header-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--touch-target-min);
    height: var(--touch-target-min);
    padding: 0;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.8);
    font-size: var(--icon-size-md);
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .header-close-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    color: white;
  }

  .header-close-btn:active {
    transform: scale(0.95);
  }
</style>

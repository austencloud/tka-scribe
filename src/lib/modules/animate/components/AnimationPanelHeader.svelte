<!--
  AnimationPanelHeader.svelte

  Renders appropriate header for mobile vs desktop layouts.
  - Mobile: Minimal close button in top-right
  - Desktop: Full PanelHeader with title
-->
<script lang="ts">
  import PanelHeader from "$lib/modules/create/shared/components/PanelHeader.svelte";

  let {
    isSideBySideLayout = false,
    onClose = () => {},
  }: {
    isSideBySideLayout?: boolean;
    onClose?: () => void;
  } = $props();
</script>

{#if !isSideBySideLayout}
  <!-- Minimal Mobile Header -->
  <div class="mobile-header">
    <button class="mobile-close-btn" onclick={onClose} aria-label="Close panel">
      <i class="fas fa-times"></i>
    </button>
  </div>
{:else}
  <!-- Desktop Header -->
  <PanelHeader title="Animation Viewer" isMobile={false} {onClose} />
{/if}

<style>
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
    width: 36px;
    height: 36px;
    padding: 0;
    background: rgba(100, 100, 120, 0.7);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    color: #ffffff;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    position: relative;
  }

  /* Expand touch target while maintaining visual size */
  .mobile-close-btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 48px;
    min-height: 48px;
  }

  @media (hover: hover) and (pointer: fine) {
    .mobile-close-btn:hover {
      background: rgba(120, 120, 140, 0.85);
      transform: scale(1.08);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
  }

  .mobile-close-btn:active {
    transform: scale(0.95);
  }
</style>

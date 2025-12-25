<!--
  ShareHubDrawer.svelte

  Drawer wrapper for unified Share Hub panel, used across multiple modules (Discover, Create, Library).
  Simpler than CreatePanelDrawer since it doesn't depend on Create module context.

  - Mobile: Bottom drawer, 85vh height
  - Desktop: Right drawer, full height
  - Updated to use ShareHubPanel (unified Single Media | Composite architecture)
-->
<script lang="ts">
  import Drawer from '$lib/shared/foundation/ui/Drawer.svelte';
  import ShareHubPanel from './ShareHubPanel.svelte';
  import type { ExportSettings } from '../domain/models/ExportSettings';
  import type { SequenceData } from '$lib/shared/foundation/domain/models/SequenceData';

  let {
    isOpen = $bindable(false),
    sequence,
    isSequenceSaved = true,
    isMobile = false,
    onClose,
    onExport,
  }: {
    isOpen?: boolean;
    sequence: SequenceData | null;
    /** Whether the sequence has been saved to the library */
    isSequenceSaved?: boolean;
    /** Whether we're on a mobile device (affects button label) */
    isMobile?: boolean;
    onClose?: () => void;
    onExport?: (mode: 'single' | 'composite', settings?: ExportSettings) => Promise<void>;
  } = $props();

  // Detect viewport width for placement (simple media query approach)
  let isDesktop = $state(false);

  // Update on mount and resize
  $effect(() => {
    function updateLayout() {
      isDesktop = window.innerWidth >= 1024; // Desktop breakpoint
    }
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  });

  const placement = $derived(isDesktop ? 'right' : 'bottom');

  function handleClose() {
    isOpen = false;
    onClose?.();
  }
</script>

<Drawer
  bind:isOpen
  ariaLabel="Share Hub - Choose export format"
  onclose={handleClose}
  closeOnBackdrop={false}
  showHandle={!isDesktop}
  dismissible={true}
  respectLayoutMode={true}
  placement={placement}
  class="share-hub-drawer"
  backdropClass="share-hub-backdrop"
  trapFocus={false}
  preventScroll={true}
>
  <div class="share-hub-content">
    <ShareHubPanel {sequence} {isSequenceSaved} {isMobile} {onExport} />
  </div>
</Drawer>

<style>
  /* Drawer container styling - NO BLUR to keep content behind visible */
  :global(.drawer-content.share-hub-drawer) {
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.92),
      rgba(0, 0, 0, 0.95)
    ) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
      0 -8px 32px rgba(0, 0, 0, 0.5),
      0 -2px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.12);
    z-index: 150 !important;
  }

  /* Desktop (right placement) - match Create module panel width */
  :global(.drawer-content.share-hub-drawer[data-placement="right"]) {
    /* Match CreatePanelDrawer width: clamp(360px, 44.44vw, 900px) */
    width: clamp(360px, 44.44vw, 900px);
    max-width: 100vw;
    height: 100dvh;
    /* Align with Create module positioning */
    top: var(--create-panel-top, 64px);
    bottom: var(--create-panel-bottom, 0);
  }

  /* Mobile (bottom placement) */
  :global(.drawer-content.share-hub-drawer[data-placement="bottom"]) {
    height: 85vh;
    max-height: 85vh;
  }

  /* Backdrop - Completely transparent, no darkening, no click blocking */
  :global(.drawer-overlay.share-hub-backdrop) {
    background: transparent !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    pointer-events: none !important;
  }

  /* Content wrapper */
  .share-hub-content {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    :global(.drawer-content.share-hub-drawer) {
      transition: none !important;
    }
  }
</style>

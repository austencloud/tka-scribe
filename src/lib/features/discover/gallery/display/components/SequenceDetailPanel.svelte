<!--
SequenceDetailPanel - Adaptive detail view for sequences

Desktop (>= 768px): Side panel that slides in from right and pushes grid
Mobile (< 768px): Full-screen immersive view with swipe-up sheet (2026 UX)

Features:
- Smooth slide transitions with CSS width/height
- Immersive full-bleed media on mobile
- Swipe-up sheet for details
- Responsive width on desktop (35%, 320-500px)
-->
<script lang="ts">
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import SequenceDetailContent from "./SequenceDetailContent.svelte";
  import MobileSequenceDetailSheet from "./mobile/MobileSequenceDetailSheet.svelte";

  const {
    sequence = null,
    isOpen = false,
    onClose = () => {},
    onAction = () => {},
    viewMode = "desktop", // 'desktop' | 'mobile'
  } = $props<{
    sequence?: SequenceData | null;
    isOpen?: boolean;
    onClose?: () => void;
    onAction?: (action: string, sequence: SequenceData) => void;
    viewMode?: "desktop" | "mobile";
  }>();

  // Handle backdrop click (mobile only)
  function handleBackdropClick(_event: MouseEvent) {
    if (viewMode === "mobile") {
      onClose();
    }
  }

  // Prevent content clicks from bubbling to backdrop
  function handleContentClick(event: MouseEvent) {
    event.stopPropagation();
  }

  // Handle ESC key
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape" && isOpen) {
      onClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if viewMode === "mobile"}
  <!-- Mobile: Full-screen immersive view with swipe-up sheet -->
  {#if isOpen && sequence}
    <div class="mobile-fullscreen">
      <MobileSequenceDetailSheet {sequence} {onClose} {onAction} />
    </div>
  {/if}
{:else}
  <!-- Desktop: Side panel (always rendered, width animated) -->
  <aside
    class="detail-panel-desktop"
    class:open={isOpen && sequence}
    aria-label="Sequence details"
    aria-hidden={!isOpen}
  >
    {#if sequence}
      <SequenceDetailContent {sequence} {onClose} {onAction} />
    {/if}
  </aside>
{/if}

<style>
  /* ===== MOBILE FULLSCREEN ===== */
  .mobile-fullscreen {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: #000;
  }

  /* ===== DESKTOP SIDE PANEL ===== */
  .detail-panel-desktop {
    width: 0;
    min-width: 0;
    max-width: 500px;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    border-left: 1px solid rgba(255, 255, 255, 0.2);
    overflow-y: hidden;
    overflow-x: hidden;
    flex-shrink: 0;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    transition:
      width 0.3s ease,
      min-width 0.3s ease,
      opacity 0.3s ease;
    opacity: 0;
    pointer-events: none;
  }

  .detail-panel-desktop.open {
    width: 35%;
    min-width: 320px;
    overflow-y: auto;
    opacity: 1;
    pointer-events: all;
  }

  /* Custom scrollbar for desktop panel */
  .detail-panel-desktop::-webkit-scrollbar {
    width: 8px;
  }

  .detail-panel-desktop::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
  }

  .detail-panel-desktop::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }

  .detail-panel-desktop::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* Tablet adjustments for desktop panel */
  @media (min-width: 768px) and (max-width: 1024px) {
    .detail-panel-desktop {
      width: 40%;
      min-width: 280px;
      max-width: 400px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .detail-panel-desktop {
      transition: none;
    }
  }
</style>

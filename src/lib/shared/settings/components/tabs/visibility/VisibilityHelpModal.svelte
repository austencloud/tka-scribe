<!--
  VisibilityHelpModal.svelte - Educational help modal for visibility settings

  Desktop: Centered modal with dark glass styling
  Mobile: Bottom sheet using Drawer component

  Panel types:
  - pictograph: Shows element explanations with indication system
  - animation: Shows animation overlay options
  - image: Shows image export composition options
-->
<script lang="ts">
  import { onMount } from "svelte";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IDeviceDetector } from "$lib/shared/device/services/contracts/IDeviceDetector";
  import type { IHapticFeedback } from "$lib/shared/application/services/contracts/IHapticFeedback";
  import PictographHelpContent from "./PictographHelpContent.svelte";
  import AnimationHelpContent from "./AnimationHelpContent.svelte";
  import ImageHelpContent from "./ImageHelpContent.svelte";

  type PanelType = "pictograph" | "animation" | "image";

  interface Props {
    isOpen: boolean;
    panel: PanelType | null;
    onClose: () => void;
  }

  let { isOpen = $bindable(false), panel, onClose }: Props = $props();

  let isMobile = $state(true);
  let deviceDetector: IDeviceDetector | null = null;
  let hapticService: IHapticFeedback | null = null;

  // Panel metadata for headers and icons
  const panelMeta: Record<
    PanelType,
    { title: string; icon: string; color: string }
  > = {
    pictograph: {
      title: "Pictograph Elements",
      icon: "fa-image",
      color: "#818cf8",
    },
    animation: {
      title: "Animation Options",
      icon: "fa-film",
      color: "#f472b6",
    },
    image: {
      title: "Image Export Options",
      icon: "fa-download",
      color: "#34d399",
    },
  };

  const meta = $derived(panel ? panelMeta[panel] : null);

  onMount(() => {
    try {
      deviceDetector = resolve<IDeviceDetector>(TYPES.IDeviceDetector);
      hapticService = resolve<IHapticFeedback>(
        TYPES.IHapticFeedback
      );
      const responsive = deviceDetector.getResponsiveSettings();
      isMobile = responsive.isMobile || responsive.isTablet;

      const cleanup = deviceDetector.onCapabilitiesChanged(() => {
        const updated = deviceDetector!.getResponsiveSettings();
        isMobile = updated.isMobile || updated.isTablet;
      });

      return cleanup;
    } catch (error) {
      console.warn("VisibilityHelpModal: Failed to resolve services", error);
      isMobile = true; // Default to mobile
      return undefined;
    }
  });

  function handleClose() {
    hapticService?.trigger("selection");
    isOpen = false;
    onClose();
  }

  function handleBackdropClick() {
    handleClose();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && isOpen) {
      handleClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isMobile}
  <!-- Mobile: Bottom Sheet -->
  <Drawer
    bind:isOpen
    placement="bottom"
    snapPoints={["65%", "90%"]}
    closeOnBackdrop={true}
    closeOnEscape={true}
    ariaLabel={meta?.title ?? "Help"}
    showHandle={true}
    onclose={handleClose}
  >
    <div class="help-sheet">
      <header class="help-header">
        {#if meta}
          <span class="help-icon" style="--icon-color: {meta.color}">
            <i class="fas {meta.icon}" aria-hidden="true"></i>
          </span>
          <h3 class="help-title">{meta.title}</h3>
        {/if}
        <button
          class="close-btn"
          onclick={handleClose}
          type="button"
          aria-label="Close"
        >
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </header>

      <div class="help-content">
        {#if panel === "pictograph"}
          <PictographHelpContent />
        {:else if panel === "animation"}
          <AnimationHelpContent />
        {:else if panel === "image"}
          <ImageHelpContent />
        {/if}
      </div>
    </div>
  </Drawer>
{:else}
  <!-- Desktop: Centered Modal -->
  {#if isOpen && meta}
    <div
      class="modal-overlay"
      onclick={handleBackdropClick}
      onkeydown={(e) => e.key === "Escape" && handleClose()}
      role="button"
      tabindex="0"
      aria-label="Close help modal"
    >
      <div
        class="modal-container"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
      >
        <header class="help-header">
          <span class="help-icon" style="--icon-color: {meta.color}">
            <i class="fas {meta.icon}" aria-hidden="true"></i>
          </span>
          <h3 id="help-modal-title" class="help-title">{meta.title}</h3>
          <button
            class="close-btn"
            onclick={handleClose}
            type="button"
            aria-label="Close"
          >
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </header>

        <div class="help-content">
          {#if panel === "pictograph"}
            <PictographHelpContent />
          {:else if panel === "animation"}
            <AnimationHelpContent />
          {:else if panel === "image"}
            <ImageHelpContent />
          {/if}
        </div>
      </div>
    </div>
  {/if}
{/if}

<style>
  /* ========================================
     MODAL OVERLAY (Desktop)
     ======================================== */
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    animation: fadeIn 200ms ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* ========================================
     MODAL CONTAINER (Desktop)
     ======================================== */
  .modal-container {
    width: 100%;
    max-width: 1100px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    /* Dark glass panel */
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    animation: slideUp 250ms ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(16px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* ========================================
     MOBILE SHEET
     ======================================== */
  .help-sheet {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0 20px 20px;
  }

  /* ========================================
     SHARED HEADER
     ======================================== */
  .help-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .help-sheet .help-header {
    padding: 16px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .help-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    font-size: 16px;
    flex-shrink: 0;
    background: color-mix(in srgb, var(--icon-color) 20%, transparent);
    border: 1px solid color-mix(in srgb, var(--icon-color) 35%, transparent);
    color: var(--icon-color);
    box-shadow: 0 0 10px color-mix(in srgb, var(--icon-color) 20%, transparent);
  }

  .help-title {
    flex: 1;
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px; /* WCAG AAA touch target */
    height: 48px;
    padding: 0;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: 14px;
    cursor: pointer;
    transition: all 150ms ease;
    -webkit-tap-highlight-color: transparent;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .close-btn:active {
    transform: scale(0.95);
  }

  /* ========================================
     HELP CONTENT
     ======================================== */
  .help-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }

  .help-sheet .help-content {
    padding: 20px 0;
  }

  /* Scrollbar styling */
  .help-content::-webkit-scrollbar {
    width: 6px;
  }

  .help-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .help-content::-webkit-scrollbar-thumb {
    background: color-mix(
      in srgb,
      var(--theme-accent, #6366f1) 25%,
      transparent
    );
    border-radius: 3px;
  }

  /* ========================================
     FOCUS STATES
     ======================================== */
  .close-btn:focus-visible {
    outline: 2px solid var(--theme-accent, #6366f1);
    outline-offset: 2px;
  }

  /* ========================================
     REDUCED MOTION
     ======================================== */
  @media (prefers-reduced-motion: reduce) {
    .modal-overlay,
    .modal-container,
    .close-btn {
      animation: none;
      transition: none;
    }
  }
</style>

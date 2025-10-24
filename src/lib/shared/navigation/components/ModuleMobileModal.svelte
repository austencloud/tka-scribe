<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import type { ModuleDefinition, ModuleId } from "../domain/types";
  import { ViewportCalculator } from "../services/implementations";

  let {
    mainModules = [],
    devModules = [],
    currentModule,
    onModuleSelect,
    onClose,
    isOpen = false,
  } = $props<{
    mainModules: ModuleDefinition[];
    devModules: ModuleDefinition[];
    currentModule: ModuleId;
    onModuleSelect: (moduleId: ModuleId) => void;
    onClose: () => void;
    isOpen: boolean;
  }>();

  // Services
  let hapticService: IHapticFeedbackService;
  const viewportCalculator = new ViewportCalculator();

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Handle escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      hapticService?.trigger("navigation");
      onClose();
    }
  }

  // Handle module selection
  function selectModule(module: ModuleDefinition) {
    hapticService?.trigger("selection");
    onModuleSelect(module.id);
    onClose();
  }

  // Handle close button
  function handleClose() {
    hapticService?.trigger("navigation");
    onClose();
  }

  // Handle backdrop close
  function handleBackdropClose() {
    hapticService?.trigger("navigation");
    onClose();
  }

  // Handle body scroll prevention and viewport calculations
  onMount(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";

      // Set up viewport listeners with cleanup
      const cleanup = viewportCalculator.setupListeners(() => {
        viewportCalculator.logDebugInfo();
      });

      return () => {
        document.body.style.overflow = "";
        cleanup();
      };
    }
  });

  // Reactive effect to handle modal opening/closing and portal mounting
  let portalContainer: HTMLElement | null = null;

  $effect(() => {
    if (isOpen) {
      viewportCalculator.updateCSSProperties();
      viewportCalculator.logDebugInfo();
      document.body.style.overflow = "hidden";

      // Create portal container if it doesn't exist
      if (!portalContainer) {
        portalContainer = document.createElement("div");
        portalContainer.id = "module-modal-portal";
        document.body.appendChild(portalContainer);
      }
    } else {
      document.body.style.overflow = "";

      // Cleanup portal container when modal closes
      if (portalContainer && portalContainer.parentNode) {
        portalContainer.parentNode.removeChild(portalContainer);
        portalContainer = null;
      }
    }

    // Cleanup on component destroy
    return () => {
      if (portalContainer && portalContainer.parentNode) {
        portalContainer.parentNode.removeChild(portalContainer);
        portalContainer = null;
      }
      document.body.style.overflow = "";
    };
  });
</script>

{#if isOpen}
  <!-- Mobile Modal - Rendered at body level via portal -->
  <div
    class="mobile-backdrop"
    onclick={handleBackdropClose}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="module-selector-title"
    tabindex="-1"
    style="position: fixed; inset: 0; width: 100vw; height: 100vh;"
  >
    <div
      class="mobile-content"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <!-- Header -->
      <div class="mobile-header">
        <h2 id="module-selector-title">Choose Module</h2>
        <button
          class="close-button"
          onclick={handleClose}
          aria-label="Close module selector"
        >
          ✕
        </button>
      </div>

      <!-- Module cards -->
      <div class="mobile-modules">
        <!-- Main modules -->
        {#each mainModules as module}
          <button
            class="mobile-module-card"
            class:current={module.id === currentModule}
            onclick={() => selectModule(module)}
          >
            <div class="module-icon-large">{@html module.icon}</div>
            <div class="module-info">
              <h3 class="module-title">{module.label}</h3>
              {#if module.description}
                <p class="module-description">{module.description}</p>
              {/if}
              {#if module.id === currentModule}
                <div class="current-badge">Current</div>
              {/if}
            </div>
          </button>
        {/each}

        <!-- Developer modules separator -->
        {#if devModules.length > 0}
          <div class="mobile-separator">
            <span>Developer Tools</span>
          </div>
          {#each devModules as module}
            <button
              class="mobile-module-card developer-module"
              class:current={module.id === currentModule}
              onclick={() => selectModule(module)}
            >
              <div class="module-icon-large">{@html module.icon}</div>
              <div class="module-info">
                <h3 class="module-title">{module.label}</h3>
                {#if module.description}
                  <p class="module-description">{module.description}</p>
                {/if}
                {#if module.id === currentModule}
                  <div class="current-badge">Current</div>
                {/if}
              </div>
            </button>
          {/each}
        {/if}
      </div>

      <!-- Cancel button -->
      <div class="mobile-footer">
        <button class="cancel-button" onclick={onClose}> Cancel </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Mobile Modal Styles - Responsive for all screen sizes */
  .mobile-backdrop {
    position: fixed;
    /* Explicitly set to cover full viewport */
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    /* Use dynamic viewport height for mobile browsers */
    height: 100dvh;
    /* Fallback for browsers that don't support dvh */
    height: var(--actual-vh, 100vh);
    z-index: 999999; /* Higher than any other element */
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: max(16px, env(safe-area-inset-top, 16px))
      max(16px, env(safe-area-inset-right, 16px))
      max(16px, env(safe-area-inset-bottom, 16px))
      max(16px, env(safe-area-inset-left, 16px));
    animation: backdrop-appear 0.3s ease-out;
    /* Ensure it's above all other content and properly isolated */
    isolation: isolate;
    /* Force hardware acceleration for better performance */
    transform: translateZ(0);
    /* Ensure it covers the entire viewport */
    margin: 0;
    box-sizing: border-box;
    /* Prevent any scrolling on the backdrop itself */
    overflow: hidden;
    /* Critical: Prevent being constrained by parent containers */
    contain: layout;
  }

  @keyframes backdrop-appear {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .mobile-content {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 100%
    );
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    /* Conservative sizing to prevent cutoff */
    max-width: min(380px, 85vw);
    width: 100%;
    /* Dynamic height calculation for better mobile support */
    max-height: var(--modal-max-height, min(75dvh, calc(100dvh - 60px)));
    /* Fallback for browsers that don't support dvh */
    max-height: var(--modal-max-height, min(75vh, calc(100vh - 60px)));
    height: auto;
    /* Structured layout: header + content + footer */
    display: flex;
    flex-direction: column;
    /* No scrolling on container - content area will handle it */
    overflow: hidden;
    animation: modal-appear 0.3s ease-out;
    /* Ensure proper centering and positioning */
    position: relative;
    margin: auto;
    /* Prevent any layout shifts */
    flex-shrink: 0;
    box-sizing: border-box;
    /* Safe area support for notched devices */
    padding-top: env(safe-area-inset-top, 0);
    padding-bottom: env(safe-area-inset-bottom, 0);
    padding-left: env(safe-area-inset-left, 0);
    padding-right: env(safe-area-inset-right, 0);
  }

  @keyframes modal-appear {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
    /* Fixed height for predictable layout */
    height: 56px;
    box-sizing: border-box;
  }

  #module-selector-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--foreground, #ffffff);
  }

  .close-button {
    background: none;
    border: none;
    color: var(--muted-foreground, #a3a3a3);
    font-size: 24px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--foreground, #ffffff);
  }

  .mobile-modules {
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    /* Take remaining space between header and footer */
    flex: 1;
    /* Enable scrolling if content exceeds available space */
    overflow-y: auto;
    overflow-x: hidden;
    /* Ensure proper sizing */
    min-height: 0;
    box-sizing: border-box;
    /* Smooth scrolling for better UX */
    scroll-behavior: smooth;
    /* Better scroll performance on mobile */
    -webkit-overflow-scrolling: touch;
    /* Ensure content doesn't get cut off */
    overscroll-behavior: contain;
  }

  .mobile-module-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: var(--foreground, #ffffff);
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
    /* Ensure adequate touch target size */
    min-height: max(48px, var(--min-touch-target, 44px));
    flex-shrink: 0;
    box-sizing: border-box;
    /* Better touch feedback */
    -webkit-tap-highlight-color: rgba(255, 255, 255, 0.1);
    /* Prevent text selection on touch */
    user-select: none;
    -webkit-user-select: none;
  }

  .mobile-module-card:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  .mobile-module-card.current {
    background: rgba(255, 255, 255, 0.15);
    border-color: var(--accent, #3b82f6);
  }

  .mobile-module-card.developer-module {
    border-color: rgba(255, 165, 0, 0.3);
  }

  .mobile-module-card.developer-module.current {
    border-color: #ffa500;
  }

  .module-icon-large {
    font-size: 32px;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition:
      transform 0.2s ease,
      filter 0.2s ease;
  }

  .mobile-module-card:hover .module-icon-large {
    transform: scale(1.1);
    filter: brightness(1.2);
  }

  .module-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .module-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.2;
  }

  .module-description {
    margin: 0;
    font-size: 14px;
    color: var(--muted-foreground, #a3a3a3);
    line-height: 1.3;
  }

  .current-badge {
    display: inline-block;
    padding: 2px 8px;
    background: var(--accent, #3b82f6);
    color: white;
    font-size: 12px;
    font-weight: 600;
    border-radius: 12px;
    align-self: flex-start;
    margin-top: 4px;
  }

  .mobile-separator {
    padding: 8px 0;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin: 8px 0;
  }

  .mobile-separator span {
    font-size: 12px;
    font-weight: 600;
    color: var(--muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .mobile-footer {
    padding: 10px 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
    /* Fixed height for predictable layout */
    height: 56px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
  }

  .cancel-button {
    width: 100%;
    padding: 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: var(--foreground, #ffffff);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    height: 36px; /* Fixed height to fit in footer */
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cancel-button:hover {
    background: rgba(255, 255, 255, 0.15);
  }
</style>

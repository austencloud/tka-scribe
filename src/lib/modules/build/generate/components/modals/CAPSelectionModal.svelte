<!--
CAPSelectionModal.svelte - Modal for selecting CAP components
Extracted from CAPCard for better separation of concerns
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { CAPComponent, resolve, TYPES } from "$shared";
  import { onMount } from "svelte";

  let {
    isOpen,
    selectedComponents,
    onToggleComponent,
    onClose
  } = $props<{
    isOpen: boolean;
    selectedComponents: Set<CAPComponent>;
    onToggleComponent: (component: CAPComponent) => void;
    onClose: () => void;
  }>();

  let hapticService: IHapticFeedbackService;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
  });

  // Component data with colors and icons
  const capComponents = [
    {
      component: CAPComponent.ROTATED,
      label: "Rotated",
      icon: "🔄",
      color: "#36c3ff",
    },
    {
      component: CAPComponent.MIRRORED,
      label: "Mirrored",
      icon: "🪞",
      color: "#6F2DA8",
    },
    {
      component: CAPComponent.SWAPPED,
      label: "Swapped",
      icon: "🔀",
      color: "#26e600",
    },
    {
      component: CAPComponent.COMPLEMENTARY,
      label: "Complementary",
      icon: "🎨",
      color: "#eb7d00",
    }
  ];

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleToggle(component: CAPComponent) {
    hapticService?.trigger("selection");
    onToggleComponent(component);
  }
</script>

{#if isOpen}
  <div
    class="modal-backdrop"
    onclick={handleBackdropClick}
    onkeydown={(e) => e.key === 'Escape' && onClose()}
    role="dialog"
    aria-modal="true"
    aria-labelledby="cap-title"
    tabindex="-1"
  >
    <div class="modal-content">
      <!-- Scrollable content area -->
      <div class="modal-scroll-content">
        <!-- Header with close button -->
        <div class="modal-header">
          <div class="header-spacer"></div>
          <h2 id="cap-title">CAP Type</h2>
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

        <!-- Component Selection Grid -->
        <div class="component-grid">
          {#each capComponents as { component, label, icon, color: componentColor }}
            <button
              class="component-button"
              class:selected={selectedComponents.has(component)}
              onclick={() => handleToggle(component)}
              style="--component-color: {componentColor};"
              aria-label="{label} - {selectedComponents.has(component) ? 'selected' : 'not selected'}"
            >
              <div class="component-icon">{icon}</div>
              <div class="component-label">{label}</div>

              {#if selectedComponents.has(component)}
                <div class="selected-indicator">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20,6 9,17 4,12"></polyline>
                  </svg>
                </div>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    z-index: 9999;
    padding: 0;
    animation: fadeIn 0.25s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-content {
    position: relative;
    /* Animated mesh gradient matching the card */
    background: linear-gradient(135deg,
      #4338ca 0%,
      #6b21a8 12.5%,
      #db2777 25%,
      #f97316 37.5%,
      #eab308 50%,
      #22c55e 62.5%,
      #0891b2 75%,
      #3b82f6 87.5%,
      #6366f1 100%
    );
    background-size: 300% 300%;
    animation: meshGradientFlow 15s ease infinite, modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    border-radius: 20px;
    margin: 16px;
    width: calc(100% - 32px);
    height: calc(100% - 32px);
    display: flex;
    flex-direction: column;
    box-shadow:
      0 0 20px rgba(139, 92, 246, 0.6),
      0 0 40px rgba(139, 92, 246, 0.4),
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    overflow: hidden;
  }

  /* Add dark overlay to ensure text contrast */
  .modal-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.15);
    pointer-events: none;
    z-index: 0;
  }

  @keyframes modalSlideIn {
    from {
      transform: scale(0.9) translateY(20px);
      opacity: 0;
    }
    to {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }

  @keyframes meshGradientFlow {
    0%, 100% {
      background-position: 0% 50%;
    }
    25% {
      background-position: 50% 100%;
    }
    50% {
      background-position: 100% 50%;
    }
    75% {
      background-position: 50% 0%;
    }
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

  .modal-scroll-content {
    flex: 1;
    overflow: hidden;
    padding: clamp(16px, 3vw, 24px);
    display: flex;
    flex-direction: column;
    gap: clamp(12px, 2vw, 16px);
    position: relative;
    z-index: 1;
    min-height: 0;
  }

  .modal-header {
    display: grid;
    grid-template-columns: 36px 1fr 36px;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    margin-bottom: 16px;
    position: relative;
  }

  .header-spacer {
    width: 36px;
  }

  .modal-header h2 {
    color: white;
    font-size: clamp(18px, 3vw, 24px);
    font-weight: 700;
    margin: 0;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
    text-align: center;
  }

  .component-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(10px, 2vw, 14px);
    flex: 1;
    min-height: 0;
  }

  .component-button {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: clamp(12px, 2.5vw, 16px);
    background: rgba(0, 0, 0, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    cursor: pointer;
    text-align: center;
    color: white;
    transition: all 0.2s ease;
  }

  .component-button:hover {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }

  .component-button.selected {
    background: color-mix(in srgb, var(--component-color) 25%, rgba(0, 0, 0, 0.3));
    border-color: var(--component-color);
    border-width: 2px;
  }

  .component-button.selected:hover {
    background: color-mix(in srgb, var(--component-color) 35%, rgba(0, 0, 0, 0.3));
  }

  .component-icon {
    font-size: clamp(24px, 4.5vw, 32px);
    margin-bottom: clamp(4px, 1vw, 8px);
    line-height: 1;
  }

  .component-label {
    font-size: clamp(13px, 2.2vw, 16px);
    font-weight: 600;
    color: white;
  }

  .selected-indicator {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    color: white;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .selected-indicator svg {
    width: 14px;
    height: 14px;
  }

  /* Mobile responsive */
  @media (max-width: 767px) {
    .component-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .component-button {
      padding: 16px 12px;
      min-height: 100px;
    }

    .component-icon {
      font-size: 24px;
    }

    .component-label {
      font-size: 14px;
    }
  }

  /* Very small screens */
  @media (max-width: 400px) {
    .modal-backdrop {
      padding: 8px;
    }

    .component-grid {
      gap: 8px;
    }

    .component-button {
      padding: 12px 8px;
      min-height: 90px;
    }

    .component-icon {
      font-size: 20px;
    }

    .component-label {
      font-size: 12px;
    }
  }
</style>

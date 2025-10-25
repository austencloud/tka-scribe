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
    position: fixed; /* 🎯 FIXED - positions relative to viewport, not parent! */
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center; /* Center modal vertically */
    justify-content: center; /* Center modal horizontally */
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
    /* 🎯 2025 GOLD STANDARD: Content-driven height with max-height constraint */
    width: min(90vw, 600px);
    height: auto; /* Let content determine height */
    max-height: 100vh; /* Never exceed viewport */
    /* Use flexbox to manage internal sizing */
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
    flex: 1 1 auto; /* Allow shrinking */
    overflow-y: auto; /* Enable scrolling if content is too tall */
    overflow-x: hidden;
    padding: 3vh 4vw;
    display: flex;
    flex-direction: column;
    gap: 2vh;
    position: relative;
    z-index: 1;
    min-height: 0; /* Allow flex shrinking */
    /* Center content vertically */
    justify-content: center;
  }

  /* Don't center on shorter screens - start from top for better space usage */
  @media (max-height: 900px) {
    .modal-scroll-content {
      justify-content: flex-start;
      flex: 0 1 auto; /* Don't force expansion */
    }
  }

  .modal-header {
    display: grid;
    grid-template-columns: 36px 1fr 36px;
    align-items: center;
    gap: 2vw;
    flex-shrink: 0; /* Header doesn't shrink */
    flex-grow: 0; /* Header doesn't grow */
    margin-bottom: 2vh;
    position: relative;
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

  .component-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 2vmin; /* Use vmin for responsive gaps that work in any orientation */
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    /* Center each item inside its grid cell */
    place-items: center;
  }

  .component-button {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1vh;
    padding: min(3vmin, 16px);
    background: rgba(0, 0, 0, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: min(3vmin, 12px);
    cursor: pointer;
    text-align: center;
    color: white;
    transition: all 0.2s ease;
    /* Fill grid cell with aspect ratio constraint */
    width: 90%;
    height: 90%;
    max-width: min(40vw, 200px);
    max-height: min(30vh, 200px);
    aspect-ratio: 1 / 1; /* Square buttons work best universally */
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
    font-size: min(8vmin, 32px);
    line-height: 1;
    flex-shrink: 0;
  }

  .component-label {
    font-size: min(3.5vmin, 14px);
    font-weight: 600;
    color: white;
    line-height: 1.2;
    width: 100%;
    max-width: 100%;
    text-align: center;
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

  /* 📱 TABLET & LARGE PHONES: Optimized for bigger screens */
  @media (min-width: 600px) and (max-width: 1024px) and (orientation: portrait) {
    .modal-content {
      /* Center modal on larger screens with max-width */
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .component-grid {
      gap: clamp(12px, 2.5vw, 18px);
    }

    .component-button {
      padding: clamp(16px, 3vw, 24px);
    }

    .component-icon {
      font-size: clamp(28px, 5vw, 40px);
    }

    .component-label {
      font-size: clamp(14px, 2.5vw, 18px);
    }

    .selected-indicator {
      width: 28px;
      height: 28px;
      top: 10px;
      right: 10px;
    }

    .selected-indicator svg {
      width: 16px;
      height: 16px;
    }
  }


  /* 📱 MEDIUM PORTRAIT PHONES: Optimize for common sizes like 498×752, Galaxy S-series */
  @media (max-width: 520px) and (min-height: 700px) and (orientation: portrait) {
    .modal-scroll-content {
      padding: clamp(14px, 2.5vh, 18px) clamp(14px, 3vw, 18px);
      gap: clamp(10px, 1.5vh, 14px);
      /* Don't center on medium screens - better space usage */
      justify-content: flex-start !important;
    }

    .modal-header {
      margin-bottom: clamp(10px, 1.5vh, 14px);
    }

    .component-grid {
      gap: clamp(10px, 1.8vh, 14px);
      /* Let grid expand to fill available space more efficiently */
      flex: 1 1 auto;
      max-height: min(calc(100vh - 180px), 600px);
    }

    .component-button {
      aspect-ratio: 1 / 1; /* Square for balanced look */
      padding: clamp(12px, 2.2vw, 16px);
      gap: clamp(4px, 0.8vh, 6px);
      max-width: min(48vw, 180px);
    }

    .component-icon {
      font-size: clamp(24px, 4.5vw, 30px);
    }

    .component-label {
      font-size: clamp(12px, 2.6vw, 14px);
    }
  }

  /* 🚨 SHORT SCREENS: Ensure all 4 buttons visible on compact devices */
  @media (max-height: 850px) and (orientation: portrait) {
    .modal-scroll-content {
      /* Less vertical centering on short screens */
      justify-content: flex-start;
      padding-top: clamp(14px, 2.5vh, 20px);
    }

    .component-grid {
      /* Let content determine size naturally */
      max-height: none;
      grid-auto-rows: minmax(0, 1fr);
    }

    .component-button {
      /* Slightly wider than tall for compact space usage */
      aspect-ratio: 5 / 4;
      padding: clamp(10px, 2vw, 14px);
      gap: clamp(4px, 0.8vh, 6px);
    }

    .component-icon {
      font-size: clamp(20px, 4vw, 26px);
    }

    .component-label {
      font-size: clamp(11px, 2.5vw, 13px);
    }
  }

  /* 🚨 VERY SHORT SCREENS: Even more compact (Galaxy Fold, small phones) */
  @media (max-height: 700px) and (orientation: portrait) {
    .modal-scroll-content {
      padding: 14px 16px;
      gap: 10px;
    }

    .modal-header {
      margin-bottom: 10px;
    }

    .modal-header h2 {
      font-size: 16px;
    }

    .component-grid {
      gap: 8px;
      /* Don't constrain height - let aspect ratio and available width determine size */
      max-height: none;
    }

    .component-button {
      /* Slightly wider than tall for better space usage */
      aspect-ratio: 5 / 4;
      padding: 10px 8px;
      gap: 4px;
    }

    .component-icon {
      font-size: 22px;
    }

    .component-label {
      font-size: 11px;
      line-height: 1.1;
    }

    .close-button {
      width: 30px;
      height: 30px;
      padding: 6px;
    }

    .close-button svg {
      width: 16px;
      height: 16px;
    }

    .selected-indicator {
      width: 18px;
      height: 18px;
      top: 6px;
      right: 6px;
    }

    .selected-indicator svg {
      width: 10px;
      height: 10px;
    }
  }

  /* 📱 SMALL SCREENS: Compact but readable */
  @media (max-width: 400px) and (min-width: 280px) {
    .modal-scroll-content {
      padding: clamp(12px, 2.5vh, 16px) clamp(10px, 2.5vw, 14px);
      gap: clamp(8px, 1.5vh, 12px);
    }

    .modal-header {
      margin-bottom: clamp(8px, 1.5vh, 12px);
    }

    .modal-header h2 {
      font-size: clamp(15px, 2.5vh, 18px);
    }

    .component-grid {
      gap: clamp(6px, 1.5vw, 10px);
      max-width: 100%;
    }

    .component-button {
      padding: clamp(8px, 2vw, 12px);
      gap: clamp(3px, 0.8vh, 5px);
      max-width: 100%; /* Fill available width */
    }

    .component-icon {
      font-size: clamp(20px, 5.5vw, 26px);
    }

    .component-label {
      font-size: clamp(9px, 2.8vw, 11px);
      /* Ensure label stays visible - allow wrapping on tiny screens */
      white-space: normal;
      line-height: 1.1;
    }

    .close-button {
      width: 30px;
      height: 30px;
    }
  }

  /* 📱 ULTRA-NARROW SCREENS: Special layout for <280px (e.g., 225px width) */
  @media (max-width: 279px) {
    .modal-scroll-content {
      padding: 10px 8px;
      gap: 8px;
      /* Don't center - start from top for space efficiency */
      justify-content: flex-start !important;
    }

    .modal-header {
      margin-bottom: 8px;
    }

    .modal-header h2 {
      font-size: 14px;
    }

    .component-grid {
      gap: 6px;
      /* More compact grid */
      max-width: 100%;
    }

    .component-button {
      /* Slightly wider than tall for ultra-narrow screens */
      aspect-ratio: 5 / 6;
      padding: 8px 6px;
      gap: 3px;
      max-width: 100%;
      border-radius: 10px; /* Smaller radius */
    }

    .component-icon {
      font-size: 20px;
    }

    .component-label {
      font-size: 9px;
      line-height: 1.1;
      /* Allow text wrapping to prevent truncation */
      white-space: normal;
      word-break: break-word;
      max-width: 100%;
    }

    .selected-indicator {
      width: 16px;
      height: 16px;
      top: 4px;
      right: 4px;
    }

    .selected-indicator svg {
      width: 9px;
      height: 9px;
    }

    .close-button {
      width: 28px;
      height: 28px;
      padding: 5px;
    }

    .close-button svg {
      width: 14px;
      height: 14px;
    }
  }

  /* 🌅 LANDSCAPE MODE: 2×2 grid for balanced layout */
  @media (orientation: landscape) and (max-height: 600px) {
    .modal-scroll-content {
      padding: clamp(12px, 2vh, 16px) clamp(16px, 3vw, 24px);
    }

    .modal-header {
      margin-bottom: clamp(8px, 1.5vh, 12px);
    }

    .modal-header h2 {
      font-size: clamp(16px, 2.5vh, 20px);
    }

    .component-grid {
      /* 2×2 grid layout - balanced for landscape */
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: clamp(10px, 1.5vw, 14px);
      max-height: min(calc(100vh - 140px), 400px);
      /* Limit overall grid width for better proportions */
      max-width: min(600px, 80vw);
    }

    .component-button {
      /* Square buttons look great in landscape 2×2 */
      aspect-ratio: 1 / 1;
      padding: clamp(10px, 1.8vh, 14px);
      gap: clamp(4px, 0.8vh, 6px);
    }

    .component-icon {
      font-size: clamp(24px, 4vh, 32px);
    }

    .component-label {
      font-size: clamp(11px, 2vh, 14px);
    }

    .selected-indicator {
      width: 20px;
      height: 20px;
      top: 6px;
      right: 6px;
    }

    .selected-indicator svg {
      width: 12px;
      height: 12px;
    }

    .close-button {
      width: 32px;
      height: 32px;
      padding: 6px;
    }

    .close-button svg {
      width: 18px;
      height: 18px;
    }
  }

  /* 📱 LANDSCAPE + VERY NARROW: Even more compact (e.g., iPhone SE landscape) */
  @media (orientation: landscape) and (max-height: 400px) {
    .modal-content {
      margin: 8px 12px;
      width: calc(100% - 24px);
      max-height: calc(100vh - 16px);
    }

    .modal-scroll-content {
      padding: 8px 12px;
      gap: 8px;
    }

    .modal-header {
      margin-bottom: 6px;
    }

    .modal-header h2 {
      font-size: 14px;
    }

    .component-grid {
      gap: 6px;
    }

    .component-button {
      aspect-ratio: 1 / 1;
      padding: 6px 4px;
    }

    .component-icon {
      font-size: 18px;
    }

    .component-label {
      font-size: 9px;
    }

    .close-button {
      width: 28px;
      height: 28px;
    }
  }


</style>

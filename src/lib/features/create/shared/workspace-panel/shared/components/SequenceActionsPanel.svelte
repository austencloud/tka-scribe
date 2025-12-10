<!-- Slide-up Panel for Sequence Actions -->
<script lang="ts">
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import SheetDragHandle from "$lib/shared/foundation/ui/SheetDragHandle.svelte";
  import { tryGetCreateModuleContext } from "$lib/features/create/shared/context/create-module-context";

  let {
    show = false, // Controlled by panel coordination state
    hasSequence = false,
    combinedPanelHeight = 0,
    onMirror,
    onRotate,
    onColorSwap,
    onReverse,
    onCopyJSON,
    onPreview,
    onClose,
  } = $props<{
    show: boolean;
    hasSequence: boolean;
    combinedPanelHeight?: number;
    onMirror?: () => void;
    onRotate?: () => void;
    onColorSwap?: () => void;
    onReverse?: () => void;
    onCopyJSON?: () => void;
    onPreview?: () => void;
    onClose?: () => void;
  }>();

  // Calculate panel height dynamically to match tool panel + button panel
  // This ensures the panel slides up exactly to not cover the sequence
  const createModuleContext = tryGetCreateModuleContext();
  const isSideBySideLayout = $derived(
    createModuleContext
      ? createModuleContext.layout.shouldUseSideBySideLayout
      : false
  );
  const panelHeightStyle = $derived.by(() => {
    if (isSideBySideLayout) {
      return "height: 100%;";
    }
    if (combinedPanelHeight > 0) {
      return `height: ${combinedPanelHeight}px;`;
    }
    return "height: 70vh;";
  });
  const drawerPlacement = $derived(isSideBySideLayout ? "right" : "bottom");

  type ActionCategory = "turns" | "transforms";

  // Action type definition
  type Action = {
    id: string;
    label: string;
    icon: string;
    description: string;
    color: string;
    requiresSequence: boolean;
    category: ActionCategory;
    handler?: () => void;
  };

  let activeTab = $state<ActionCategory>("transforms");

  // Action definitions with clear user-friendly descriptions
  const actions: Action[] = [
    {
      id: "preview",
      label: "Preview",
      icon: '<i class="fas fa-eye"></i>',
      description: "View fullscreen",
      color: "#3b82f6",
      requiresSequence: true,
      category: "transforms",
      handler: onPreview,
    },
    {
      id: "mirror",
      label: "Mirror",
      icon: '<i class="fas fa-left-right"></i>',
      description: "Flip left & right",
      color: "#a855f7",
      requiresSequence: true,
      category: "transforms",
      handler: onMirror,
    },
    {
      id: "rotate",
      label: "Rotate",
      icon: '<i class="fas fa-rotate-right"></i>',
      description: "Pivot 45°",
      color: "#f59e0b",
      requiresSequence: true,
      category: "transforms",
      handler: onRotate,
    },
    {
      id: "colorSwap",
      label: "Swap Hands",
      icon: '<i class="fas fa-arrows-rotate"></i>',
      description: "Switch movements",
      color: "#10b981",
      requiresSequence: true,
      category: "transforms",
      handler: onColorSwap,
    },
    {
      id: "reverse",
      label: "Reverse",
      icon: '<i class="fas fa-backward"></i>',
      description: "Retrace to start",
      color: "#f43f5e",
      requiresSequence: true,
      category: "transforms",
      handler: onReverse,
    },
    {
      id: "copyJSON",
      label: "Copy JSON",
      icon: '<i class="fas fa-code"></i>',
      description: "Debug data",
      color: "#6b7280",
      requiresSequence: true,
      category: "transforms",
      handler: onCopyJSON,
    },
  ];

  // Filter actions based on sequence availability and active tab
  const availableActions = $derived(
    actions.filter(
      (action) =>
        (!action.requiresSequence || hasSequence) &&
        action.category === activeTab
    )
  );

  // Handle action click - keep sheet open to see immediate effects
  function handleActionClick(action: Action): void {
    action.handler?.();
  }

  // Handle close button click
  function handleClose(): void {
    onClose?.();
  }

  // Handle drawer open/close state changes (called for all close methods: swipe, backdrop, button)
  function handleOpenChange(open: boolean): void {
    if (!open) {
      onClose?.();
    }
  }
</script>

<Drawer
  isOpen={show}
  onOpenChange={handleOpenChange}
  labelledBy="sequence-actions-title"
  closeOnBackdrop={false}
  showHandle={false}
  respectLayoutMode={true}
  placement={drawerPlacement}
  trapFocus={false}
  preventScroll={false}
  class="actions-sheet-container"
  backdropClass="actions-sheet-backdrop"
>
  <div
    class="actions-panel"
    class:desktop-layout={isSideBySideLayout}
    style={panelHeightStyle}
    role="dialog"
    aria-labelledby="sequence-actions-title"
    data-testid="sequence-actions-sheet"
  >
    <SheetDragHandle class={isSideBySideLayout ? "side-handle" : ""} />

    <h3 id="sequence-actions-title" class="sr-only">Sequence Actions</h3>

    <!-- Header with Tabs and Close Button -->
    <div class="actions-panel__header">
      <div class="tab-buttons">
        <button
          class="tab-button"
          class:active={activeTab === "turns"}
          onclick={() => (activeTab = "turns")}
          aria-label="Turns tab"
        >
          <i class="fas fa-layer-group"></i>
          Turns
        </button>
        <button
          class="tab-button"
          class:active={activeTab === "transforms"}
          onclick={() => (activeTab = "transforms")}
          aria-label="Transforms tab"
        >
          <i class="fas fa-magic"></i>
          Transforms
        </button>
      </div>
      <button
        class="close-button"
        onclick={handleClose}
        aria-label="Close actions sheet"
        data-testid="close-sequence-actions"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div class="actions-panel__content">
      {#if availableActions.length === 0}
        <div class="empty-state">
          <i class="fas fa-info-circle"></i>
          <p>Create a sequence to access actions</p>
        </div>
      {:else}
        <div class="actions-grid">
          {#each availableActions as action}
            <button
              class="action-button"
              onclick={() => handleActionClick(action)}
              style="--action-color: {action.color}"
              aria-label={`${action.label}: ${action.description}`}
            >
              <div class="action-icon-box">
                <span class="action-icon">{@html action.icon}</span>
              </div>
              <div class="action-text">
                <span class="action-label">{action.label}</span>
                <span class="action-desc">{action.description}</span>
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</Drawer>

<style>
  /* Use unified sheet system variables - transparent backdrop to allow workspace interaction */
  :global(.drawer-content.actions-sheet-container) {
    --sheet-backdrop-bg: var(--backdrop-transparent);
    --sheet-backdrop-filter: var(--backdrop-blur-none);
    --sheet-backdrop-pointer-events: none;
    --sheet-bg: var(--sheet-bg-gradient);
    --sheet-border: var(--sheet-border-medium);
    --sheet-shadow: none;
    --sheet-pointer-events: auto;
    min-height: 300px;
  }

  /* Slide animations for drawer */
  :global(.drawer-content.actions-sheet-container[data-placement="bottom"]) {
    transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
  }

  :global(.drawer-content.actions-sheet-container[data-placement="right"]) {
    transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
  }

  :global(
    .drawer-content.actions-sheet-container[data-state="closed"][data-placement="bottom"]
  ) {
    transform: translateY(100%);
  }

  :global(
    .drawer-content.actions-sheet-container[data-state="closed"][data-placement="right"]
  ) {
    transform: translateX(100%);
  }

  :global(.drawer-content.actions-sheet-container[data-state="open"]) {
    transform: translate(0, 0);
  }

  :global(.drawer-content.actions-sheet-container:hover) {
    box-shadow: none;
  }

  /* Container */
  .actions-panel {
    container-type: inline-size;
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
    overflow: hidden;
    padding-bottom: env(safe-area-inset-bottom);
  }

  .actions-panel.desktop-layout {
    padding-bottom: 0;
    height: 100%;
  }

  /* Position drag handle on the left for side-by-side layout */
  .actions-panel.desktop-layout :global(.sheet-drag-handle.side-handle) {
    position: absolute;
    top: 50%;
    left: 18px;
    width: 4px;
    height: 52px;
    margin: 0;
    border-radius: 999px;
    transform: translateY(-50%);
  }

  /* Screen reader only */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Close button */
  .close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--sheet-close-size-small);
    height: var(--sheet-close-size-small);
    border: none;
    border-radius: 50%;
    background: var(--sheet-close-bg);
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    transition: all var(--sheet-transition-smooth);
    font-size: 18px;
    flex-shrink: 0;
  }

  .close-button:hover {
    background: var(--sheet-close-bg-hover);
    transform: scale(1.05);
  }

  .close-button:active {
    transform: scale(0.95);
  }

  .close-button:focus-visible {
    outline: 2px solid rgba(191, 219, 254, 0.7);
    outline-offset: 2px;
  }

  /* Header - now contains tabs and close button */
  .actions-panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: var(--sheet-header-border);
    background: var(--sheet-header-bg);
    gap: 16px;
  }

  /* Tab buttons container */
  .tab-buttons {
    display: flex;
    gap: 8px;
    flex: 1;
  }

  /* Tab button styling */
  .tab-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .tab-button i {
    font-size: 16px;
  }

  .tab-button:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.85);
  }

  .tab-button.active {
    background: rgba(0, 188, 212, 0.2);
    border-color: rgba(0, 188, 212, 0.5);
    color: rgba(255, 255, 255, 0.95);
  }

  .tab-button:focus-visible {
    outline: 2px solid rgba(191, 219, 254, 0.7);
    outline-offset: 2px;
  }

  /* Content area */
  .actions-panel__content {
    padding: 16px;
    padding-bottom: 24px;
    overflow-y: auto;

    /* Prevent pull-to-refresh when scrolling content */
    overscroll-behavior: contain;
    overscroll-behavior-y: contain;
  }

  /* Empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    color: rgba(255, 255, 255, 0.5);
    gap: 12px;
  }

  .empty-state i {
    font-size: 28px;
  }

  .empty-state p {
    margin: 0;
    font-size: 14px;
    text-align: center;
  }

  /* Actions grid - vertical list layout */
  .actions-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  /* Action buttons - Soft Gradient Fill Style (always visible) */
  .action-button {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--action-color) 18%, transparent) 0%,
      color-mix(in srgb, var(--action-color) 10%, transparent) 100%
    );
    border: 1px solid color-mix(in srgb, var(--action-color) 30%, transparent);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.95);
    cursor: pointer;
    width: 100%;
    text-align: left;
    transition: all 0.15s ease;
    /* Reasonable size constraints */
    min-height: 56px;
    max-height: 72px;
  }

  .action-button:hover {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--action-color) 28%, transparent) 0%,
      color-mix(in srgb, var(--action-color) 18%, transparent) 100%
    );
    border-color: color-mix(in srgb, var(--action-color) 45%, transparent);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px color-mix(in srgb, var(--action-color) 25%, transparent);
  }

  .action-button:active {
    transform: translateY(0);
    transition: all 0.08s ease;
  }

  .action-button:focus-visible {
    outline: 2px solid var(--action-color);
    outline-offset: 2px;
  }

  /* Icon box - solid colored */
  .action-icon-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: var(--action-color);
    border-radius: 9px;
    flex-shrink: 0;
  }

  .action-icon {
    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .action-icon :global(.action-svg) {
    width: 16px;
    height: 16px;
  }

  /* Text container */
  .action-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
    flex: 1;
    min-width: 0;
  }

  .action-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .action-desc {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.55);
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .actions-panel {
      background: rgba(0, 0, 0, 0.98);
      border-top: 2px solid white;
    }

    .actions-panel__header {
      border-bottom: 2px solid white;
    }

    .action-button {
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .action-button:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: white;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .close-button,
    .action-button {
      transition: none;
    }

    .close-button:hover,
    .close-button:active,
    .action-button:hover,
    .action-button:active {
      transform: none;
    }
  }

  /* Mobile responsiveness for very small viewport screens */
  @media (max-width: 380px) {
    .close-button {
      width: 48px;
      height: 48px;
      font-size: 16px;
    }

    .actions-panel__header {
      padding: 10px 12px;
      gap: 12px;
    }

    .tab-button {
      padding: 8px 16px;
      font-size: 13px;
      gap: 6px;
    }

    .tab-button i {
      font-size: 14px;
    }

    .actions-panel__content {
      padding: 12px;
      padding-bottom: 20px;
    }

    .action-button {
      padding: 12px 14px;
      gap: 12px;
    }

    .action-icon-box {
      width: 36px;
      height: 36px;
    }

    .action-icon {
      font-size: 14px;
    }

    .action-label {
      font-size: 0.9rem;
    }

    .action-desc {
      font-size: 0.75rem;
    }
  }

  /* Ensure content area can scroll if needed but doesn't overflow */
  .actions-panel__content {
    max-height: 100%;
    box-sizing: border-box;
  }

  /* Ensure actions grid never causes horizontal overflow */
  .actions-grid {
    max-width: 100%;
    box-sizing: border-box;
  }
</style>

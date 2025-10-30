<!--
  ButtonPanel.svelte

  Unified action button panel for workbench layout.
  Pure orchestration component - composes individual button components.

  Architecture:
  - No business logic (delegated to services)
  - No CSS (except layout)
  - No state management (delegated to button components)
  - Just composition and prop passing
-->
<script lang="ts">
  import type { IBuildTabState } from '$build/shared/types/build-tab-types';
  import { fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';
  import { springScaleTransition } from '$lib/shared/utils/transitions.js';
  import {
    BackButton,
    ClearSequencePanelButton,
    ConstructGenerateToggle,
    PlayButton,
    RemoveBeatButton,
    SequenceActionsButton,
    ShareButton,
    UndoButton
  } from './buttons/index.js';

  // Props interface
  const {
    // Back button
    canGoBack = false,
    onBack,

    // Build tab state for undo functionality
    buildTabState = null,

    // Remove Beat button
    canRemoveBeat = false,
    onRemoveBeat,
    selectedBeatIndex = null,
    selectedBeatData = null,

    // Clear Sequence button
    canClearSequence = false,
    onClearSequence,

    // Sequence Actions button
    showSequenceActions = false,
    onSequenceActionsClick,

    // Share button
    showShareButton = false,
    onShare,
    isShareOpen = false,

    // Play button
    showPlayButton = false,
    onPlayAnimation,
    isAnimating = false,

    // Construct/Generate toggle props
    showToggle = false,
    activeTab = 'construct',
    onTabChange,

    // Panel visibility
    visible = true
  }: {
    // Back button props
    canGoBack?: boolean;
    onBack?: () => void;

    // Build tab state for undo functionality
    buildTabState?: IBuildTabState | null;

    // Remove Beat button props
    canRemoveBeat?: boolean;
    onRemoveBeat?: (beatIndex: number) => void;
    selectedBeatIndex?: number | null;
    selectedBeatData?: any;

    // Clear Sequence button props
    canClearSequence?: boolean;
    onClearSequence?: () => void;

    // Sequence Actions button props
    showSequenceActions?: boolean;
    onSequenceActionsClick?: () => void;

    // Share button props
    showShareButton?: boolean;
    onShare?: () => void;
    isShareOpen?: boolean;

    // Play button props
    showPlayButton?: boolean;
    onPlayAnimation?: () => void;
    isAnimating?: boolean;

    // Construct/Generate toggle props
    showToggle?: boolean;
    activeTab?: 'construct' | 'generate';
    onTabChange?: (tab: 'construct' | 'generate') => void;

    // Panel visibility
    visible?: boolean;
  } = $props();

  // Determine if Remove Beat button should be shown
  const shouldShowRemoveBeat = $derived(() => {
    return canRemoveBeat &&
           selectedBeatData &&
           selectedBeatData.beatNumber >= 1 &&
           selectedBeatIndex !== null;
  });

  // Count visible buttons to determine if toggle should show text labels
  const visibleButtonCount = $derived(() => {
    let count = 0;

    // Count toggle
    if (showToggle) count++;

    // Count undo/back button
    if (buildTabState || canGoBack) count++;

    // Count remove beat button
    if (shouldShowRemoveBeat()) count++;

    // Count clear sequence button
    if (canClearSequence) count++;

    // Count sequence actions button
    if (showSequenceActions) count++;

    // Count share button
    if (showShareButton) count++;

    // Count play button
    if (showPlayButton) count++;

    return count;
  });

  // Show text labels when toggle is the only button visible
  const shouldShowToggleLabels = $derived(() => visibleButtonCount() === 1);

  // Determine if we're showing all action buttons (bulk sequence generation scenario)
  // If so, stagger Clear Sequence button last for smooth left-to-right animation
  const shouldDelayClearing = $derived(() => {
    return showPlayButton && showSequenceActions && showShareButton;
  });

  // Build array of visible center buttons with keys and delays for smooth animations
  type CenterButton = {
    key: string;
    component: 'remove-beat' | 'play' | 'actions' | 'share' | 'clear';
    inDelay: number;
    outDelay: number;
  };

  const centerButtons = $derived.by((): CenterButton[] => {
    const buttons: CenterButton[] = [];

    // Detect if we're transitioning from 1 button (Clear alone) to 4 buttons (all visible)
    // This happens when user selects first motion beat after start position
    const isExpandingFromClear = canClearSequence && showPlayButton && showSequenceActions && showShareButton;

    // Remove Beat Button (leftmost when present)
    if (shouldShowRemoveBeat()) {
      buttons.push({ key: 'remove-beat', component: 'remove-beat', inDelay: 0, outDelay: 0 });
    }

    // Play Button - when expanding, delay to overlap with Clear's slide
    if (showPlayButton) {
      const inDelay = isExpandingFromClear ? 150 : 0;
      buttons.push({ key: 'play', component: 'play', inDelay, outDelay: 0 });
    }

    // Sequence Actions Button - cascade after Play
    if (showSequenceActions) {
      const inDelay = isExpandingFromClear ? 230 : 80;
      buttons.push({ key: 'actions', component: 'actions', inDelay, outDelay: 80 });
    }

    // Share Button - cascade after Actions
    if (showShareButton && onShare) {
      const inDelay = isExpandingFromClear ? 310 : 160;
      buttons.push({ key: 'share', component: 'share', inDelay, outDelay: 160 });
    }

    // Clear Sequence Button (rightmost)
    if (canClearSequence) {
      buttons.push({ key: 'clear', component: 'clear', inDelay: 0, outDelay: 240 });
    }

    return buttons;
  });

  // Store button positions for FLIP animations
  let buttonPositions = new Map<string, DOMRect>();
  let buttonElements = new Map<string, HTMLElement>();
  let previousButtonCount = 0;
  let isFlipAnimating = false;

  // Custom action to register buttons for FLIP animations
  function smoothPosition(node: HTMLElement, key: string) {
    buttonElements.set(key, node);

    // Capture initial position after element is stable
    requestAnimationFrame(() => {
      if (!isFlipAnimating) {
        const rect = node.getBoundingClientRect();
        buttonPositions.set(key, rect);
      }
    });

    return {
      destroy() {
        buttonElements.delete(key);
        buttonPositions.delete(key);
      }
    };
  }

  // Pre-effect: Capture positions BEFORE Svelte updates DOM
  $effect.pre(() => {
    const buttons = centerButtons;
    const currentButtonCount = buttons.length;

    // Skip if buttons are being removed (exiting)
    if (currentButtonCount < previousButtonCount) {
      previousButtonCount = currentButtonCount;
      return;
    }

    // Skip if count didn't change (just reordering or initial render)
    if (currentButtonCount === previousButtonCount && previousButtonCount > 0) {
      return;
    }

    previousButtonCount = currentButtonCount;

    // Capture current positions BEFORE DOM updates
    const capturedPositions = new Map<string, DOMRect>();
    buttonElements.forEach((element, key) => {
      const rect = element.getBoundingClientRect();
      capturedPositions.set(key, rect);
    });

    // Store for use in main effect
    buttonPositions = capturedPositions;
  });

  // Main effect: Apply FLIP animations AFTER DOM updates
  $effect(() => {
    const buttons = centerButtons;
    const currentButtonCount = buttons.length;

    // Skip if buttons are being removed
    if (currentButtonCount < previousButtonCount) {
      return;
    }

    // Skip if count didn't change
    if (currentButtonCount === previousButtonCount && previousButtonCount > 0) {
      return;
    }

    isFlipAnimating = true;

    // Single RAF to let DOM settle
    requestAnimationFrame(() => {
      // Check each button for position changes
      buttonElements.forEach((element, key) => {
        // Skip if this is a new button (will have entrance animation)
        const oldRect = buttonPositions.get(key);
        if (!oldRect) {
          return;
        }

        // Get new position after layout update
        const newRect = element.getBoundingClientRect();

        const deltaX = oldRect.left - newRect.left;
        const deltaY = oldRect.top - newRect.top;

        if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
          // Invert: immediately apply transform to keep at old position
          element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
          element.style.transition = 'none';

          // Play: animate to new position
          requestAnimationFrame(() => {
            element.style.transition = 'transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1)';
            element.style.transform = 'translate(0, 0)';
          });

          // Update stored position and clear flag after animation completes
          setTimeout(() => {
            if (buttonElements.has(key)) {
              element.style.transform = '';
              element.style.transition = '';
              buttonPositions.set(key, element.getBoundingClientRect());
              isFlipAnimating = false;
            }
          }, 450);
        } else {
          // No movement
          buttonPositions.set(key, newRect);
          isFlipAnimating = false;
        }
      });
    });
  });
</script>

{#if visible}
  <div class="button-panel" transition:fade={{ duration: 200 }}>
    <!-- LEFT ZONE: Undo/Back button (always left edge) -->
    <div class="left-zone">
      <!-- Undo Button (when buildTabState is available) or Back Button -->
      {#if buildTabState}
        <div transition:springScaleTransition>
          <UndoButton
            {buildTabState}
            showHistoryDropdown={true}
          />
        </div>
      {:else if canGoBack}
        <div transition:springScaleTransition>
          <BackButton onclick={onBack} />
        </div>
      {/if}
    </div>

    <!-- CENTER ZONE: Contextual action buttons (centered in available space) -->
    <div class="center-zone">
      {#each centerButtons as button (button.key)}
        <div
          class="button-wrapper"
          use:smoothPosition={button.key}
          in:springScaleTransition={{ delay: button.inDelay }}
          out:springScaleTransition={{ delay: button.outDelay }}
        >
          {#if button.component === 'remove-beat'}
            <RemoveBeatButton
              beatNumber={selectedBeatData.beatNumber}
              onclick={() => onRemoveBeat?.(selectedBeatIndex!)}
            />
          {:else if button.component === 'play'}
            <PlayButton onclick={onPlayAnimation} {isAnimating} />
          {:else if button.component === 'actions'}
            <SequenceActionsButton onclick={onSequenceActionsClick} />
          {:else if button.component === 'share'}
            <ShareButton onclick={onShare} isActive={isShareOpen} />
          {:else if button.component === 'clear'}
            <ClearSequencePanelButton onclick={onClearSequence} />
          {/if}
        </div>
      {/each}
    </div>

    <!-- RIGHT ZONE: Toggle (always right edge) -->
    <div class="right-zone">
      <!-- Construct/Generate Toggle (always rightmost) -->
      {#if showToggle && activeTab && onTabChange}
        <div transition:springScaleTransition>
          <ConstructGenerateToggle
            {activeTab}
            onTabChange={onTabChange}
            showLabels={shouldShowToggleLabels()}
          />
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .button-panel {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between; /* Space between left, center, right zones */
    width: 100%;
    border-radius: 24px;
    z-index: 1;

    /* Intelligent reactive padding to prevent overlap */
    padding: clamp(8px, 1.5vh, 16px) clamp(12px, 2vw, 24px);
  }

  /* LEFT ZONE: Undo button always at left edge */
  .left-zone {
    display: flex;
    align-items: center;
    gap: 12px; /* Slightly reduced for better mobile fit */
    flex-shrink: 0; /* Don't shrink */
  }

  /* CENTER ZONE: Contextual buttons centered in available space */
  .center-zone {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px; /* Slightly reduced for better mobile fit */
    flex-grow: 1; /* Take up available space */
  }

  /* RIGHT ZONE: Toggle always at right edge */
  .right-zone {
    display: flex;
    align-items: center;
    gap: 12px; /* Slightly reduced for better mobile fit */
    flex-shrink: 0; /* Don't shrink */
  }

  /* Ensure transition wrappers don't interfere with layout */
  .left-zone > div,
  .center-zone > div,
  .right-zone > div {
    display: inline-block;
  }

  /* Button wrapper - position transitions handled by smoothPosition action */
  .button-wrapper {
    display: inline-block;
  }

  /* Remove mobile tap highlight (blue selection box) */
  .button-panel :global(button),
  .button-panel :global(a) {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }

  /* Mobile responsive adjustments - Progressive gap reduction to fit 44px buttons */
  @media (max-width: 768px) {
    .button-panel {
      padding: clamp(6px, 1.2vh, 12px) clamp(10px, 1.8vw, 18px);
    }

    .left-zone,
    .center-zone,
    .right-zone {
      gap: 10px; /* Balanced spacing for 44px buttons */
    }
  }

  /* Tighter spacing on smaller screens to accommodate 44px buttons */
  @media (max-width: 480px) {
    .button-panel {
      padding: clamp(4px, 1vh, 10px) clamp(8px, 1.5vw, 12px);
    }

    .left-zone,
    .center-zone,
    .right-zone {
      gap: 8px; /* Compact but comfortable spacing */
    }
  }

  /* Very narrow screens - minimal gaps but NEVER shrink buttons */
  @media (max-width: 360px) {
    .button-panel {
      padding: 6px 8px;
    }

    .left-zone,
    .center-zone,
    .right-zone {
      gap: 6px; /* Tight spacing to fit all buttons */
    }
  }

  /* Extremely narrow screens - hide Remove Beat button to make room */
  @media (max-width: 340px) {
    .button-panel {
      padding: 6px 6px;
    }

    .left-zone,
    .center-zone,
    .right-zone {
      gap: 5px; /* Minimum comfortable gap */
    }
  }

  /* 🎯 LANDSCAPE MOBILE: Ultra-compact mode for devices like Z Fold 5 horizontal (882x344) */
  /* Matches app's isLandscapeMobile() criteria: aspectRatio > 1.7 AND height < 500px */
  /* This preserves precious vertical space on wide but short screens */
  @media (min-aspect-ratio: 17/10) and (max-height: 500px) {
    .button-panel {
      border-radius: 16px;
      /* Reduce vertical footprint - minimal padding */
      min-height: 0;
      padding: 4px 12px;
    }

    .left-zone,
    .center-zone,
    .right-zone {
      gap: 16px;
    }
  }

  /* 🔥 EXTREME CONSTRAINTS: Very narrow landscape mode */
  /* For devices in horizontal orientation with extreme width constraints */
  @media (max-width: 500px) and (min-aspect-ratio: 17/10) and (max-height: 500px) {
    .button-panel {
      border-radius: 12px;
      padding: 3px 8px;
    }

    .left-zone,
    .center-zone,
    .right-zone {
      gap: 6px;
    }
  }
</style>

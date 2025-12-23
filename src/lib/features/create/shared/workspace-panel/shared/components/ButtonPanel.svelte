<!--
  ButtonPanel.svelte

  Unified action button panel for workbench layout.
  Pure orchestration component - composes individual button components.

  Layout:
  - LEFT ZONE: Sequence Actions (tools menu)
  - CENTER ZONE: Play (Animation), Image Export, Record Video (3 media type actions)
  - RIGHT ZONE: Clear Sequence

  Note: Undo button moved to workspace top-left (near WordLabel) for better UX.

  Architecture:
  - Uses CreateModuleContext for state access
  - Derives all boolean flags locally from context
  - Only receives event handler callbacks as props
  - No business logic (delegated to services)
  - Just composition and prop passing
-->
<script lang="ts">
  import { fade } from "svelte/transition";
  import { PresenceAnimation } from "../../../../../../shared/ui-animation/animations.svelte";
  import { getCreateModuleContext } from "$lib/features/create/shared/context/create-module-context";
  import ClearSequencePanelButton from "./buttons/ClearSequenceButton.svelte";
  import PlayButton from "./buttons/PlayButton.svelte";
  import SequenceActionsButton from "./buttons/SequenceActionsButton.svelte";
  import ImageExportButton from "./buttons/ImageExportButton.svelte";
  import RecordVideoButton from "./buttons/RecordVideoButton.svelte";
  import ShareHubButton from "./buttons/ShareHubButton.svelte";

  // Get context - ButtonPanel is ONLY used inside CreateModule, so context is always available
  const { CreateModuleState, panelState } = getCreateModuleContext();

  // Props interface - only event handler callbacks
  const {
    onClearSequence,
    onSequenceActionsClick,
    onImageExport,
    onRecordVideo,
    onPlayAnimation,
    onShareHub,
    visible = true,
  }: {
    onClearSequence?: () => void;
    onSequenceActionsClick?: () => void;
    onImageExport?: () => void;
    onRecordVideo?: () => void;
    onPlayAnimation?: () => void;
    onShareHub?: () => void;
    visible?: boolean;
  } = $props();

  // Derive computed values from context
  const showPlayButton = $derived(CreateModuleState.canShowActionButtons());
  const showImageExportButton = $derived(
    CreateModuleState.canShowActionButtons()
  );
  const showRecordVideoButton = $derived(
    CreateModuleState.canShowActionButtons()
  );
  const showShareHubButton = $derived(
    CreateModuleState.canShowActionButtons()
  );
  const showSequenceActions = $derived(
    CreateModuleState.canShowSequenceActionsButton()
  );
  const canClearSequence = $derived(CreateModuleState.canClearSequence());
  const isAnimating = $derived(panelState.isAnimationPanelOpen);
  const isImageExportOpen = $derived(panelState.isSharePanelOpen);
  const isRecordVideoOpen = $derived(panelState.isVideoRecordPanelOpen);
  const isShareHubOpen = $derived(panelState.isShareHubPanelOpen);

  // Count center-zone buttons to key the container (for smooth cross-fade on layout changes)
  // Note: SequenceActions is now in left zone, not center
  const centerZoneButtonCount = $derived(() => {
    let count = 0;
    if (showPlayButton) count++;
    if (showImageExportButton) count++;
    if (showRecordVideoButton) count++;
    if (showShareHubButton) count++;
    return count;
  });

  /**
   * Spring scale transition using unified animation system
   * Replaces old springScaleTransition with physics-based PresenceAnimation
   */
  function presenceTransition(
    _node: Element,
    { duration = 550, delay = 0 }: { duration?: number; delay?: number } = {}
  ) {
    const animation = new PresenceAnimation("snappy");

    // Trigger enter animation
    animation.enter();

    return {
      duration,
      delay,
      css: (t: number) => {
        // Interpolate between start (0.95 scale) and end (1.0 scale)
        const scale = 0.95 + (1 - 0.95) * t;
        return `
          transform: scale(${scale});
          opacity: ${t};
        `;
      },
    };
  }
</script>

{#if visible}
  <div class="button-panel" transition:fade={{ duration: 200 }}>
    <!-- LEFT ZONE: Sequence Actions button (tools/menu) -->
    <div class="left-zone">
      {#if showSequenceActions && onSequenceActionsClick}
        <div transition:presenceTransition>
          <SequenceActionsButton onclick={onSequenceActionsClick} />
        </div>
      {/if}
    </div>

    <!-- CENTER ZONE: Main action buttons (Play, Share, Record Video) -->
    <!-- Wrapper maintains layout space during transitions -->
    <div class="center-zone-wrapper">
      {#key centerZoneButtonCount()}
        <div
          class="center-zone"
          out:fade={{ duration: 150 }}
          in:fade={{ duration: 150, delay: 150 }}
        >
          <!-- Play Button -->
          {#if showPlayButton && onPlayAnimation}
            <div>
              <PlayButton onclick={onPlayAnimation} {isAnimating} />
            </div>
          {/if}

          <!-- Image Export Button -->
          {#if showImageExportButton && onImageExport}
            <div>
              <ImageExportButton
                onclick={onImageExport}
                isActive={isImageExportOpen}
              />
            </div>
          {/if}

          <!-- Record Video Button -->
          {#if showRecordVideoButton && onRecordVideo}
            <div>
              <RecordVideoButton
                onclick={onRecordVideo}
                isActive={isRecordVideoOpen}
              />
            </div>
          {/if}

          <!-- Share Hub Button -->
          {#if showShareHubButton && onShareHub}
            <div>
              <ShareHubButton onclick={onShareHub} isActive={isShareHubOpen} />
            </div>
          {/if}
        </div>
      {/key}
    </div>

    <!-- RIGHT ZONE: Clear Sequence button (rightmost) -->
    <div class="right-zone">
      {#if canClearSequence && onClearSequence}
        <div transition:presenceTransition>
          <ClearSequencePanelButton onclick={onClearSequence} />
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .button-panel {
    /* Enable container queries for responsive spacing */
    container-type: inline-size;
    container-name: button-panel;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between; /* Space between left, center, right zones */
    width: 100%;
    border-radius: 24px;

    /* Intelligent reactive padding to prevent overlap */
    padding: clamp(2px, 1vh, 16px) clamp(2px, 1vw, 24px);

    /* Ensure panel is always interactive */
    pointer-events: auto;
  }

  /* LEFT ZONE: Undo button always at left edge */
  .left-zone {
    display: flex;
    align-items: center;
    gap: 12px; /* Slightly reduced for better mobile fit */
    flex-shrink: 0; /* Don't shrink */
  }

  /* CENTER ZONE WRAPPER: Maintains layout space during transitions */
  .center-zone-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1; /* Take up available space */
    position: relative;
    min-height: var(--min-touch-target); /* Prevent collapse */
  }

  /* CENTER ZONE: Contextual buttons centered in available space */
  .center-zone {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px; /* Slightly reduced for better mobile fit */
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
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

  /* Remove mobile tap highlight (blue selection box) */
  .button-panel :global(button),
  .button-panel :global(a) {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }

  /* Container-based responsive adjustments - Progressive gap reduction to fit 48px buttons */
  @container button-panel (max-width: 768px) {
    .button-panel {
      padding: clamp(6px, 1.2vh, 12px) clamp(10px, 1.8vw, 18px);
    }

    .left-zone,
    .center-zone,
    .right-zone {
      gap: 10px; /* Balanced spacing for 48px buttons */
    }
  }

  /* Tighter spacing on smaller containers to accommodate 48px buttons */
  @container button-panel (max-width: 480px) {
    .button-panel {
      padding: clamp(4px, 1vh, 10px) clamp(8px, 1.5vw, 12px);
    }

    .left-zone,
    .center-zone,
    .right-zone {
      gap: 8px; /* Compact but comfortable spacing */
    }
  }

  /* Very narrow containers - minimal gaps but NEVER shrink buttons */
  @container button-panel (max-width: 360px) {
    .button-panel {
      padding: 6px 8px;
    }

    .left-zone,
    .center-zone,
    .right-zone {
      gap: 6px; /* Tight spacing to fit all buttons */
    }
  }

  /* Extremely narrow containers */
  @container button-panel (max-width: 340px) {
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

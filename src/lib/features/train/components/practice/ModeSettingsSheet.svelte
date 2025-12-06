<!--
  ModeSettingsSheet.svelte - Responsive settings sheet for practice mode configuration

  Mobile: Bottom sheet (slides up from bottom)
  Desktop: Side drawer (slides from right)

  Contains mode-specific configuration (Adaptive, Step-by-Step, Timed)
-->
<script lang="ts">
  import { onMount } from "svelte";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import { PracticeMode } from "../../domain/enums/TrainEnums";
  import AdaptiveModeConfig from "./AdaptiveModeConfig.svelte";
  import StepModeConfig from "./StepModeConfig.svelte";
  import TimedModeConfig from "./TimedModeConfig.svelte";
  import type {
    AdaptiveConfig,
    StepConfig,
    TimedConfig,
  } from "../../state/train-practice-state.svelte";

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentMode: PracticeMode;
    adaptiveConfig: AdaptiveConfig;
    stepConfig: StepConfig;
    timedConfig: TimedConfig;
    onAdaptiveConfigUpdate: (config: Partial<AdaptiveConfig>) => void;
    onStepConfigUpdate: (config: Partial<StepConfig>) => void;
    onTimedConfigUpdate: (config: Partial<TimedConfig>) => void;
  }

  let {
    isOpen = $bindable(false),
    onClose,
    currentMode,
    adaptiveConfig,
    stepConfig,
    timedConfig,
    onAdaptiveConfigUpdate,
    onStepConfigUpdate,
    onTimedConfigUpdate,
  }: Props = $props();

  // Responsive placement: bottom on mobile, right on desktop
  let placement = $state<"bottom" | "right">("bottom");

  onMount(() => {
    // Check if desktop (sidebar visible)
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    placement = mediaQuery.matches ? "right" : "bottom";

    const handler = (e: MediaQueryListEvent) => {
      placement = e.matches ? "right" : "bottom";
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  });

  // Mode display info
  const modeInfo = $derived.by(() => {
    switch (currentMode) {
      case PracticeMode.ADAPTIVE:
        return {
          icon: "fa-brain",
          title: "Adaptive Mode",
          description: "Auto-advance when you match positions",
        };
      case PracticeMode.STEP_BY_STEP:
        return {
          icon: "fa-shoe-prints",
          title: "Step-by-Step Mode",
          description: "Advance manually or with voice",
        };
      case PracticeMode.TIMED:
        return {
          icon: "fa-stopwatch",
          title: "Timed Mode",
          description: "Follow beat timing with scoring",
        };
      default:
        return {
          icon: "fa-cog",
          title: "Settings",
          description: "",
        };
    }
  });

  function handleClose() {
    isOpen = false;
    onClose();
  }
</script>

<Drawer
  bind:isOpen
  {placement}
  closeOnBackdrop={true}
  closeOnEscape={true}
  ariaLabel="Mode Settings"
  showHandle={placement === "bottom"}
  class="mode-settings-sheet"
  backdropClass="mode-settings-backdrop"
>
  <div class="settings-panel" class:side-drawer={placement === "right"}>
    <!-- Header -->
    <header class="panel-header">
      <div class="header-icon">
        <i class="fas {modeInfo.icon}"></i>
      </div>
      <div class="header-content">
        <h3 class="panel-title">{modeInfo.title}</h3>
        <p class="panel-subtitle">{modeInfo.description}</p>
      </div>
      <button
        class="close-btn"
        onclick={handleClose}
        aria-label="Close settings"
      >
        <i class="fas fa-times"></i>
      </button>
    </header>

    <!-- Mode-specific configuration -->
    <div class="settings-content">
      {#if currentMode === PracticeMode.ADAPTIVE}
        <AdaptiveModeConfig
          config={adaptiveConfig}
          onUpdate={onAdaptiveConfigUpdate}
        />
      {:else if currentMode === PracticeMode.STEP_BY_STEP}
        <StepModeConfig config={stepConfig} onUpdate={onStepConfigUpdate} />
      {:else if currentMode === PracticeMode.TIMED}
        <TimedModeConfig config={timedConfig} onUpdate={onTimedConfigUpdate} />
      {/if}
    </div>
  </div>
</Drawer>

<style>
  /* Backdrop styling */
  :global(.mode-settings-backdrop) {
    background: rgba(0, 0, 0, 0.7) !important;
  }

  /* Drawer content styling */
  :global(.mode-settings-sheet) {
    --sheet-bg: #1a1a24;
  }

  .settings-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0 20px 20px;
    min-width: 280px;
    max-width: 100%;
    overflow-y: auto;
  }

  .settings-panel.side-drawer {
    width: min(400px, 90vw);
    max-height: 100vh;
  }

  .panel-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: 20px;
    position: sticky;
    top: 0;
    background: rgba(20, 25, 35, 0.98);
    z-index: 1;
  }

  .header-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 12px;
    flex-shrink: 0;
  }

  .header-icon i {
    font-size: 18px;
    color: #60a5fa;
  }

  .header-content {
    flex: 1;
    min-width: 0;
  }

  .panel-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .panel-subtitle {
    margin: 4px 0 0 0;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .close-btn {
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .settings-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Safe area for mobile */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .settings-panel:not(.side-drawer) {
      padding-bottom: calc(20px + env(safe-area-inset-bottom));
    }
  }

  /* Focus states */
  .close-btn:focus-visible {
    outline: 2px solid rgba(59, 130, 246, 0.8);
    outline-offset: 2px;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .close-btn {
      transition: none;
    }
  }
</style>

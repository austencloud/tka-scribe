<!--
  ModePickerSheet.svelte - Bottom sheet for selecting practice mode

  Shows the three practice modes (Adaptive, Step, Timed) in a bottom sheet.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import { PracticeMode } from "../../domain/enums/TrainEnums";

  interface Props {
    isOpen: boolean;
    currentMode: PracticeMode;
    onModeChange: (mode: PracticeMode) => void;
    onClose: () => void;
  }

  let {
    isOpen = $bindable(false),
    currentMode,
    onModeChange,
    onClose,
  }: Props = $props();

  // Responsive placement: bottom on mobile, right on desktop
  let placement = $state<"bottom" | "right">("bottom");

  onMount(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    placement = mediaQuery.matches ? "right" : "bottom";

    const handler = (e: MediaQueryListEvent) => {
      placement = e.matches ? "right" : "bottom";
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  });

  const modes = [
    {
      value: PracticeMode.ADAPTIVE,
      label: "Adaptive",
      icon: "fa-brain",
      color: "#8b5cf6",
      description:
        "Auto-advances when you match the position. Great for learning new sequences.",
    },
    {
      value: PracticeMode.STEP_BY_STEP,
      label: "Step by Step",
      icon: "fa-shoe-prints",
      color: "#10b981",
      description: "Go at your own pace. Manually advance through each beat.",
    },
    {
      value: PracticeMode.TIMED,
      label: "Timed",
      icon: "fa-stopwatch",
      color: "#f59e0b",
      description:
        "Follow the rhythm with scoring. Test your timing and accuracy.",
    },
  ];

  function selectMode(mode: PracticeMode) {
    onModeChange(mode);
    isOpen = false;
    onClose();
  }

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
  ariaLabel="Select Practice Mode"
  showHandle={placement === "bottom"}
  class="mode-picker-sheet"
  backdropClass="mode-picker-backdrop"
>
  <div class="picker-panel" class:side-drawer={placement === "right"}>
    <!-- Header -->
    <header class="panel-header">
      <div class="header-icon">
        <i class="fas fa-brain" aria-hidden="true"></i>
      </div>
      <div class="header-content">
        <h3 class="panel-title">Practice Mode</h3>
        <p class="panel-subtitle">Choose how you want to practice</p>
      </div>
      <button class="close-btn" onclick={handleClose} aria-label="Close">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </header>

    <!-- Mode Options -->
    <div class="mode-options">
      {#each modes as mode}
        <button
          class="mode-option"
          class:active={currentMode === mode.value}
          onclick={() => selectMode(mode.value)}
          style="--mode-color: {mode.color}"
        >
          <div class="mode-icon">
            <i class="fas {mode.icon}" aria-hidden="true"></i>
          </div>
          <div class="mode-content">
            <span class="mode-label">{mode.label}</span>
            <span class="mode-desc">{mode.description}</span>
          </div>
          {#if currentMode === mode.value}
            <i class="fas fa-check check-icon" aria-hidden="true"></i>
          {/if}
        </button>
      {/each}
    </div>
  </div>
</Drawer>

<style>
  :global(.mode-picker-backdrop) {
    background: color-mix(
      in srgb,
      var(--theme-shadow, #000) 70%,
      transparent
    ) !important;
  }

  :global(.mode-picker-sheet) {
    --sheet-bg: var(--sheet-bg-solid);
    height: auto !important;
    max-height: 85vh !important;
  }

  :global(.mode-picker-sheet[data-placement="right"]) {
    width: auto !important;
    min-width: 320px;
    max-width: min(420px, 90vw) !important;
    height: 100% !important;
    max-height: 100% !important;
  }

  .picker-panel {
    display: flex;
    flex-direction: column;
    padding: 0 16px 16px;
  }

  .picker-panel.side-drawer {
    min-width: 300px;
    padding: 0 20px 20px;
  }

  .panel-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    margin-bottom: 16px;
  }

  .header-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(
      in srgb,
      var(--theme-accent, #8b5cf6) 15%,
      transparent
    );
    border: 1px solid
      color-mix(in srgb, var(--theme-accent, #8b5cf6) 30%, transparent);
    border-radius: 10px;
    flex-shrink: 0;
  }

  .header-icon i {
    font-size: 14px;
    color: var(--theme-accent, #a78bfa);
  }

  .header-content {
    flex: 1;
    min-width: 0;
  }

  .panel-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .panel-subtitle {
    margin: 2px 0 0 0;
    font-size: 0.75rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .close-btn {
    width: 48px; /* WCAG AAA touch target */
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .close-btn:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .mode-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .mode-option {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 12px;
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .mode-option:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.06));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.15));
  }

  .mode-option.active {
    background: color-mix(in srgb, var(--mode-color) 12%, transparent);
    border-color: color-mix(in srgb, var(--mode-color) 50%, transparent);
  }

  .mode-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--mode-color) 15%, transparent);
    border-radius: 10px;
    flex-shrink: 0;
  }

  .mode-icon i {
    font-size: 1.25rem;
    color: var(--mode-color);
  }

  .mode-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .mode-label {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .mode-desc {
    font-size: 0.8rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    line-height: 1.35;
  }

  .check-icon {
    font-size: 1rem;
    color: var(--mode-color);
    flex-shrink: 0;
  }

  /* Focus states */
  .close-btn:focus-visible,
  .mode-option:focus-visible {
    outline: 2px solid
      color-mix(in srgb, var(--theme-accent, #8b5cf6) 80%, transparent);
    outline-offset: 2px;
  }

  /* Safe area for mobile */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .picker-panel:not(.side-drawer) {
      padding-bottom: calc(16px + env(safe-area-inset-bottom));
    }
  }
</style>
